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
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import * as Location from "expo-location";
import * as api from "@/src/services/api";
import PropertyListCard from "@/src/components/home/PropertyListCard";
import { resolveLocation, ResolvedLocation } from "@/src/lib/locationResolver";
import { parseSearchQuery, ParsedSearchQuery } from "@/src/lib/searchQueryParser";
import { addRecentSearch } from "@/src/lib/searchHistory";

/* ───────────────────────── constants ───────────────────────── */

/** Max radius (km) when searching near a college */
const COLLEGE_RADIUS_KM = 10;
/** Max radius (km) for "near me" searches */
const NEAR_ME_RADIUS_KM = 15;

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

  const [deviceCoords, setDeviceCoords] = useState<Geo | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  /**
   * Resolved location from the search query (college or place).
   */
  const [resolvedLocation, setResolvedLocation] =
    useState<ResolvedLocation | null>(null);
  const [resolving, setResolving] = useState(false);

  /* ── Parse the search query ──────────────────────────────── */
  const parsed = useMemo(() => parseSearchQuery(search), [search]);

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

      // If we have a college query, resolve that
      if (parsed.collegeQuery) {
        setResolving(true);
        const geo = await resolveLocation(parsed.collegeQuery);
        if (!cancelled) {
          setResolvedLocation(geo);
          setResolving(false);
        }
        return;
      }

      // Otherwise try resolving the free text or city
      const queryForGeo = parsed.city || parsed.freeText || trimmed;
      if (queryForGeo.length > 2) {
        setResolving(true);
        const geo = await resolveLocation(queryForGeo);
        if (!cancelled) {
          setResolvedLocation(geo);
          setResolving(false);
        }
      } else {
        setResolvedLocation(null);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [search, parsed.collegeQuery, parsed.city, parsed.freeText]);

  /* ───────────────── device location ───────────────── */

  useEffect(() => {
    async function fetchDeviceLocation() {
      setLocationLoading(true);
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== "granted") return;

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setDeviceCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } finally {
        setLocationLoading(false);
      }
    }
    fetchDeviceLocation();
  }, []);

  /* ───────────────── search engine ───────────────── */

  const isCollegeMode = resolvedLocation?.kind === "college" && !!resolvedLocation;
  const isNearMeMode = parsed.nearMe && !!deviceCoords;

  const results = useMemo(() => {
    let list = [...properties];

    /* ── 1. Property type filter ─────────────────────────── */
    if (parsed.propertyType) {
      list = list.filter((p) => p.propertyType === parsed.propertyType);
    }

    /* ── 2. Gender filter ────────────────────────────────── */
    if (parsed.gender) {
      list = list.filter(
        (p) => p.gender === parsed.gender || p.gender === "any"
      );
    }

    /* ── 3. Budget / max rent filter ─────────────────────── */
    if (parsed.maxRent) {
      list = list.filter((p) => p.rent <= parsed.maxRent!);
    }

    /* ── 4. Amenity filter ───────────────────────────────── */
    if (parsed.amenities.length > 0) {
      list = list.filter((p) =>
        parsed.amenities.every((a) =>
          p.facilities.includes(a as api.FacilityType)
        )
      );
    }

    /* ── 5. City filter ──────────────────────────────────── */
    if (parsed.city) {
      list = list.filter(
        (p) => p.city.toLowerCase() === parsed.city!.toLowerCase()
      );
    }

    /* ── 6. COLLEGE MODE — radius-based ──────────────────── */
    if (isCollegeMode) {
      const ref: Geo = {
        latitude: resolvedLocation!.lat,
        longitude: resolvedLocation!.lng,
      };

      list = list.filter((p) => {
        const geo = toGeo(p);
        if (!geo) return false;
        return haversine(ref, geo) <= COLLEGE_RADIUS_KM;
      });

      list.sort((a, b) => {
        const geoA = toGeo(a)!;
        const geoB = toGeo(b)!;
        return haversine(ref, geoA) - haversine(ref, geoB);
      });

      return list;
    }

    /* ── 7. NEAR ME MODE — radius-based ──────────────────── */
    if (isNearMeMode) {
      const ref = deviceCoords!;

      list = list.filter((p) => {
        const geo = toGeo(p);
        if (!geo) return false;
        return haversine(ref, geo) <= NEAR_ME_RADIUS_KM;
      });

      list.sort((a, b) => {
        const geoA = toGeo(a)!;
        const geoB = toGeo(b)!;
        return haversine(ref, geoA) - haversine(ref, geoB);
      });

      return list;
    }

    /* ── 8. Free text search ─────────────────────────────── */
    if (parsed.freeText && parsed.freeText.length > 1) {
      const query = normalize(parsed.freeText);
      list = list.filter(
        (p) =>
          normalize(p.name).includes(query) ||
          normalize(p.city).includes(query) ||
          normalize(p.location).includes(query)
      );
    }

    /* ── 9. Geo proximity sort (resolved place or device) ── */
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
    } else {
      // Default: most recent first
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [
    properties,
    parsed,
    deviceCoords,
    resolvedLocation,
    isCollegeMode,
    isNearMeMode,
  ]);

  /* ───────────────── search submit ───────────────── */

  const handleSubmit = useCallback(() => {
    const trimmed = search.trim();
    if (trimmed) {
      addRecentSearch(trimmed);
    }
  }, [search]);

  /* ───────────────── active filter badges ───────────────── */

  const filterBadges = useMemo(() => {
    const badges: { id: string; label: string; color: string }[] = [];

    if (parsed.propertyType) {
      const labels = { pg: "PG", mess: "Mess", hostel: "Hostel" };
      badges.push({
        id: "type",
        label: labels[parsed.propertyType],
        color: "#6366F1",
      });
    }
    if (parsed.gender) {
      badges.push({
        id: "gender",
        label: parsed.gender === "girls" ? "Girls" : "Boys",
        color: "#EC4899",
      });
    }
    if (parsed.maxRent) {
      badges.push({
        id: "budget",
        label: `≤ ₹${parsed.maxRent.toLocaleString("en-IN")}`,
        color: "#10B981",
      });
    }
    if (parsed.nearMe) {
      badges.push({ id: "near", label: "Near me", color: "#2563EB" });
    }
    if (parsed.city) {
      badges.push({ id: "city", label: parsed.city, color: "#F59E0B" });
    }
    if (parsed.collegeQuery) {
      badges.push({
        id: "college",
        label: `📍 ${parsed.collegeQuery}`,
        color: "#8B5CF6",
      });
    }
    parsed.amenities.forEach((a) => {
      badges.push({ id: `amenity-${a}`, label: a, color: "#0EA5E9" });
    });

    return badges;
  }, [parsed]);

  /* ───────────────── UI ───────────────── */

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 6,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
        }}
      >
        {/* Back + search bar */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F1F5F9",
            }}
          >
            <Ionicons name="arrow-back" size={19} color="#0F172A" />
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 12,
              paddingHorizontal: 12,
            }}
          >
            <Ionicons name="search" size={16} color="#94A3B8" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSubmit}
              placeholder="Try 'pg near me', 'mess under 5000'..."
              placeholderTextColor="#94A3B8"
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              style={{
                flex: 1,
                fontSize: 14,
                color: "#0F172A",
                paddingHorizontal: 10,
                paddingVertical: 10,
              }}
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter badges */}
        {filterBadges.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10 }}
            contentContainerStyle={{ gap: 6 }}
          >
            {filterBadges.map((badge) => (
              <View
                key={badge.id}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: badge.color,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#fff",
                    fontWeight: "700",
                  }}
                >
                  {badge.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {/* Context banner */}
      {isCollegeMode ? (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 4,
            backgroundColor: "#EEF2FF",
            borderRadius: 14,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "#C7D2FE",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="school" size={18} color="#4F46E5" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: "#4F46E5" }}
              numberOfLines={1}
            >
              {resolvedLocation?.displayName?.split(",")[0] ?? "College"}
            </Text>
            <Text style={{ fontSize: 11, color: "#6366F1", marginTop: 1 }}>
              Showing PGs within {COLLEGE_RADIUS_KM} km, sorted by distance
            </Text>
          </View>
        </View>
      ) : isNearMeMode ? (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 4,
            backgroundColor: "#EFF6FF",
            borderRadius: 14,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "#BFDBFE",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="navigate" size={18} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: "#2563EB" }}
            >
              Searching near your location
            </Text>
            <Text style={{ fontSize: 11, color: "#3B82F6", marginTop: 1 }}>
              Within {NEAR_ME_RADIUS_KM} km radius, closest first
            </Text>
          </View>
        </View>
      ) : resolving ? (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 4,
            backgroundColor: "#FFF7ED",
            borderRadius: 14,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <ActivityIndicator size="small" color="#F59E0B" />
          <Text style={{ fontSize: 13, color: "#D97706" }}>
            Looking up location...
          </Text>
        </View>
      ) : null}

      {/* Results count */}
      {!loading && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748B" }}>
            {results.length} {results.length === 1 ? "result" : "results"} found
          </Text>
          {parsed.description ? (
            <Text
              style={{ fontSize: 11, color: "#94A3B8", maxWidth: "60%" }}
              numberOfLines={1}
            >
              {parsed.description}
            </Text>
          ) : null}
        </View>
      )}

      {/* Loading */}
      {loading ? (
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text
            style={{ fontSize: 13, color: "#94A3B8", marginTop: 12 }}
          >
            Loading properties...
          </Text>
        </View>
      ) : locationLoading && parsed.nearMe ? (
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text
            style={{ fontSize: 13, color: "#94A3B8", marginTop: 12 }}
          >
            Getting your location...
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 60, paddingHorizontal: 40 }}>
          <Ionicons name="search-outline" size={48} color="#CBD5E1" />
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: "#64748B",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            No results found
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#94A3B8",
              marginTop: 6,
              textAlign: "center",
              lineHeight: 19,
            }}
          >
            {isCollegeMode
              ? `No PGs found within ${COLLEGE_RADIUS_KM} km of this college. Try a broader search.`
              : isNearMeMode
                ? `No ${parsed.propertyType || "properties"} found within ${NEAR_ME_RADIUS_KM} km. Try searching a city instead.`
                : "Try changing your search terms or removing some filters."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyListCard
              property={item}
              distanceKm={
                isNearMeMode && deviceCoords
                  ? (() => {
                      const geo = toGeo(item);
                      return geo ? haversine(deviceCoords, geo) : undefined;
                    })()
                  : isCollegeMode && resolvedLocation
                    ? (() => {
                        const geo = toGeo(item);
                        const ref = {
                          latitude: resolvedLocation.lat,
                          longitude: resolvedLocation.lng,
                        };
                        return geo ? haversine(ref, geo) : undefined;
                      })()
                    : undefined
              }
            />
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
