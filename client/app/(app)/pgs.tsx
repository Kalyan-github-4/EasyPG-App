import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as Location from "expo-location";
import * as api from "@/src/services/api";
import PropertyListCard from "@/src/components/home/PropertyListCard";
import { resolveLocation, ResolvedLocation } from "@/src/lib/locationResolver";

/* ───────────────────────── constants ───────────────────────── */

const FILTERS = ["All", "≤ ₹8k", "≤ ₹10k", "≤ ₹12k", "Premium"];
const SORTS = ["Recent", "Price ↑", "Price ↓"];

/** Max radius (km) when searching near a college */
const COLLEGE_RADIUS_KM = 10;

type Geo = { latitude: number; longitude: number };

/* ───────────────────────── utils ───────────────────────── */

function normalize(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

function haversine(a: Geo, b: Geo): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

function toGeo(p: api.Property): Geo | null {
  if (p.latitude == null || p.longitude == null) return null;
  return { latitude: p.latitude, longitude: p.longitude };
}

/* ───────────────────────── component ───────────────────────── */

export default function AllPGsScreen() {
  const insets = useSafeAreaInsets();
  const { q } = useLocalSearchParams<{ q?: string }>();

  const [properties, setProperties] = useState<api.Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState(typeof q === "string" ? q : "");

  const [activeFilter, setActiveFilter] = useState(0);
  const [activeSort, setActiveSort] = useState(0);

  const [deviceCoords, setDeviceCoords] = useState<Geo | null>(null);

  /**
   * Resolved location from the search query.
   * Carries `kind` ("college" | "place") so we know whether to apply radius.
   */
  const [resolvedLocation, setResolvedLocation] =
    useState<ResolvedLocation | null>(null);

  /* ───────────────── load properties ───────────────── */

  const load = useCallback(async () => {
    try {
      const data = await api.listProperties();
      setProperties(data.filter((p) => p.isAvailable));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  /* ───────────────── location resolver ───────────────── */

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const trimmed = search.trim();

      if (!trimmed) {
        setResolvedLocation(null);
        return;
      }

      const geo = await resolveLocation(trimmed);

      if (!cancelled) {
        setResolvedLocation(geo);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [search]);

  /* ───────────────── device location ───────────────── */

  useEffect(() => {
    async function fetchDeviceLocation() {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") return;

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setDeviceCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    }
    fetchDeviceLocation();
  }, []);

  /* ───────────────── search engine ───────────────── */

  const isCollegeMode =
    resolvedLocation?.kind === "college" && !!resolvedLocation;

  const results = useMemo(() => {
    let list = [...properties];
    const query = normalize(search);

    /* ── COLLEGE MODE ───────────────────────────────────────────
       Student searched for a college / university / institute.
       Strategy:
         1. Convert resolved college lat/lng to a reference Geo point.
         2. Filter properties that have coordinates AND are within 10 km.
         3. Sort by distance closest → farthest.
         4. Apply rent filter on top (no manual sort override for distance).
    ────────────────────────────────────────────────────────────── */
    if (resolvedLocation?.kind === "college") {
      const ref: Geo = {
        latitude: resolvedLocation.lat,
        longitude: resolvedLocation.lng,
      };

      // Filter: must have coordinates + within radius
      list = list.filter((p) => {
        const geo = toGeo(p);
        if (!geo) return false;
        return haversine(ref, geo) <= COLLEGE_RADIUS_KM;
      });

      // Sort: closest first
      list.sort((a, b) => {
        const geoA = toGeo(a)!;
        const geoB = toGeo(b)!;
        return haversine(ref, geoA) - haversine(ref, geoB);
      });

      // Apply rent filter (college mode ignores manual sort — distance is king)
      if (activeFilter === 1) list = list.filter((p) => p.rent <= 8000);
      else if (activeFilter === 2) list = list.filter((p) => p.rent <= 10000);
      else if (activeFilter === 3) list = list.filter((p) => p.rent <= 12000);
      else if (activeFilter === 4) list = list.filter((p) => p.rent > 12000);

      return list;
    }

    /* ── NORMAL MODE ────────────────────────────────────────────
       City / locality / free-text search.
       1. Text match on name, city, location.
       2. If a geo was resolved (e.g. city centroid), sort by proximity.
       3. Apply rent filter.
       4. Apply manual sort (overrides proximity sort if chosen).
    ────────────────────────────────────────────────────────────── */

    // 1. Text search
    if (query) {
      list = list.filter(
        (p) =>
          normalize(p.name).includes(query) ||
          normalize(p.city).includes(query) ||
          normalize(p.location).includes(query)
      );
    }

    // 2. Geo priority (resolved place or device location)
    const geo = resolvedLocation
      ? { latitude: resolvedLocation.lat, longitude: resolvedLocation.lng }
      : deviceCoords;

    if (geo) {
      list.sort((a, b) => {
        const geoA = toGeo(a);
        const geoB = toGeo(b);
        if (!geoA || !geoB) return 0;
        return haversine(geo, geoA) - haversine(geo, geoB);
      });
    }

    // 3. Rent filters
    if (activeFilter === 1) list = list.filter((p) => p.rent <= 8000);
    else if (activeFilter === 2) list = list.filter((p) => p.rent <= 10000);
    else if (activeFilter === 3) list = list.filter((p) => p.rent <= 12000);
    else if (activeFilter === 4) list = list.filter((p) => p.rent > 12000);

    // 4. Manual sort (only in normal mode)
    if (activeSort === 1) list.sort((a, b) => a.rent - b.rent);
    else if (activeSort === 2) list.sort((a, b) => b.rent - a.rent);
    else if (!geo) {
      // Default: recent — only if no geo sort is active
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [
    properties,
    search,
    activeFilter,
    activeSort,
    deviceCoords,
    resolvedLocation,
  ]);

  /* ───────────────── UI ───────────────── */

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 10, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "800" }}>Explore PGs</Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search PG, college, city, or locality"
          style={{
            marginTop: 10,
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 10,
          }}
        />

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
        >
          {FILTERS.map((f, i) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(i)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: activeFilter === i ? "#6366F1" : "#fff",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: activeFilter === i ? "#fff" : "#374151",
                  fontWeight: "600",
                }}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort chips — hidden in college mode (distance always wins) */}
        {!isCollegeMode && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 8 }}
          >
            {SORTS.map((s, i) => (
              <TouchableOpacity
                key={s}
                onPress={() => setActiveSort(i)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: activeSort === i ? "#0EA5E9" : "#fff",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: activeSort === i ? "#fff" : "#374151",
                    fontWeight: "600",
                  }}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* College mode banner */}
      {isCollegeMode && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 8,
            backgroundColor: "#EEF2FF",
            borderRadius: 10,
            padding: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 13, color: "#4F46E5", flex: 1 }}>
            📍 Showing PGs within {COLLEGE_RADIUS_KM} km of{" "}
            <Text style={{ fontWeight: "700" }}>
              {resolvedLocation?.displayName?.split(",")[0] ?? "college"}
            </Text>
            , sorted by distance
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : results.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <Text style={{ fontSize: 15, color: "#9CA3AF" }}>
            {isCollegeMode
              ? `No PGs found within ${COLLEGE_RADIUS_KM} km of this college`
              : "No results found"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyListCard property={item} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}
