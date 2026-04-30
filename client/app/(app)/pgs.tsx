import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretLeft, MagnifyingGlass, X, SlidersHorizontal } from "phosphor-react-native";
import * as Location from "expo-location";
import * as api from "@/src/services/api";
import type { FacilityType, PropertyType } from "@/src/services/api";
import PropertyListCard from "@/src/components/home/PropertyListCard";

const FILTERS = ["All", "≤ ₹8k", "≤ ₹10k", "≤ ₹12k", "Premium"];
const TYPE_CHIPS: { value: PropertyType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pg", label: "PG" },
  { value: "mess", label: "Mess" },
  { value: "hostel", label: "Hostel" },
];
const SORTS = ["Recent", "Price ↑", "Price ↓"];

type SearchIntent = {
  type: PropertyType | null;
  gender: api.PropertyGender | null;
  amenities: FacilityType[];
  maxRent: number | null;
  nearMe: boolean;
  locationTerm: string | null;
};

const AMENITY_PATTERNS: Array<{ facility: FacilityType; re: RegExp }> = [
  { facility: "ac", re: /\b(ac|air\s*conditioning?)\b/i },
  { facility: "wifi", re: /\b(wi\s*-?\s*fi|internet)\b/i },
  { facility: "food", re: /\b(food|meal|meals|mess\s*food)\b/i },
  { facility: "laundry", re: /\b(laundry|washing)\b/i },
  { facility: "parking", re: /\b(parking)\b/i },
  { facility: "gym", re: /\b(gym|fitness)\b/i },
  { facility: "cctv", re: /\b(cctv|camera|surveillance)\b/i },
  { facility: "power_backup", re: /\b(power\s*backup|backup\s*power|generator)\b/i },
  { facility: "water_supply", re: /\b(water\s*supply|water)\b/i },
  { facility: "furnished", re: /\b(furnished|furniture)\b/i },
];

function normalize(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9\s₹]/g, " ").replace(/\s+/g, " ").trim();
}

function parseSearchIntent(raw: string): SearchIntent {
  const lc = normalize(raw);

  let type: PropertyType | null = null;
  if (/\bhostels?\b/.test(lc)) type = "hostel";
  else if (/\bmess(?:es)?\b/.test(lc)) type = "mess";
  else if (/\bpgs?\b/.test(lc)) type = "pg";

  let gender: api.PropertyGender | null = null;
  if (/\b(girls?|ladies|women)\b/.test(lc)) gender = "girls";
  else if (/\b(boys?|men)\b/.test(lc)) gender = "boys";

  const amenities = AMENITY_PATTERNS.filter((a) => a.re.test(lc)).map((a) => a.facility);

  let maxRent: number | null = null;
  const rupeeMatch = lc.match(/(?:under|below|upto|less\s+than)\s*₹?\s*(\d+)/i);
  if (rupeeMatch) {
    const cap = parseInt(rupeeMatch[1], 10);
    if (!Number.isNaN(cap)) maxRent = cap;
  }

  const nearMe = /\bnear\s+me\b/.test(lc) || /\bnearby\b/.test(lc);

  let locationTerm: string | null = null;
  const locMatch = lc.match(/\b(?:in|at|near)\s+(.+)$/i);
  if (locMatch) {
    let tail = locMatch[1]
      .replace(/\b(me|nearby)\b/g, " ")
      .replace(
        /\b(with|without|under|below|upto|less\s+than|girls?|boys?|ladies|women|men|pgs?|mess(?:es)?|hostels?)\b.*$/i,
        ""
      )
      .replace(/\s+/g, " ")
      .trim();

    if (tail) locationTerm = tail;
  }

  return { type, gender, amenities, maxRent, nearMe, locationTerm };
}

function haversineKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const aa =
    s1 * s1 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2 * s2;
  return 2 * R * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

export default function AllPGsScreen() {
  const insets = useSafeAreaInsets();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const initialQuery = typeof q === "string" ? q : "";

  const [properties, setProperties] = useState<api.Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState(0);
  const [activeTypeFilter, setActiveTypeFilter] = useState<PropertyType | "all">("all");
  const [activeSort, setActiveSort] = useState(0);
  const [deviceCoords, setDeviceCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [deviceAreaHint, setDeviceAreaHint] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Sync ?q= param changes
  useEffect(() => {
    if (typeof q === "string") setSearch(q);
  }, [q]);

  const intent = useMemo(() => parseSearchIntent(search), [search]);

  const fetchDeviceLocation = useCallback(async () => {
    if (locating) return;
    setLocating(true);
    setLocationError(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        setLocationError("Location permission denied. Allow location access to use near-me search.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nextCoords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setDeviceCoords(nextCoords);

      const reverse = await Location.reverseGeocodeAsync(nextCoords);
      const first = reverse[0];
      const areaHint =
        first?.city ||
        first?.district ||
        first?.subregion ||
        first?.region ||
        null;
      setDeviceAreaHint(areaHint);
    } catch {
      setLocationError("Could not fetch device location. Please try again.");
    } finally {
      setLocating(false);
    }
  }, [locating]);

  useEffect(() => {
    if (intent.nearMe && !deviceCoords && !locating) {
      fetchDeviceLocation();
    }
  }, [intent.nearMe, deviceCoords, locating, fetchDeviceLocation]);

  const load = useCallback(async () => {
    try {
      setError(null);
      const list = await api.listProperties();
      setProperties(list.filter((p) => p.isAvailable));
    } catch (err: any) {
      setError(err?.message || "Couldn't load properties");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = [...properties];
    const distanceById = new Map<string, number>();
    const intentType = intent.type;

    // Query-intent type overrides chip type to honor explicit user request.
    const resolvedType =
      intentType || (activeTypeFilter !== "all" ? activeTypeFilter : null);
    if (resolvedType) {
      list = list.filter((p) => p.propertyType === resolvedType);
    }

    if (intent.gender) {
      list = list.filter((p) => p.gender === intent.gender || p.gender === "any");
    }

    if (intent.amenities.length > 0) {
      list = list.filter((p) => intent.amenities.every((a) => p.facilities.includes(a)));
    }

    if (intent.maxRent !== null) {
      list = list.filter((p) => p.rent <= intent.maxRent!);
    }

    if (intent.locationTerm) {
      const term = intent.locationTerm;
      list = list.filter((p) => {
        const city = normalize(p.city);
        const location = normalize(p.location);
        return city.includes(term) || location.includes(term);
      });
    }

    if (intent.nearMe) {
      if (deviceCoords) {
        const withCoords = list
          .filter(
            (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
          )
          .map((p) => {
            const d = haversineKm(
              deviceCoords.latitude,
              deviceCoords.longitude,
              p.latitude as number,
              p.longitude as number
            );
            distanceById.set(p.id, d);
            return { property: p, distance: d };
          });

        const nearby = withCoords
          .filter((entry) => entry.distance <= 25)
          .sort((a, b) => a.distance - b.distance)
          .map((entry) => entry.property);

        const fallbackByDistance = withCoords
          .sort((a, b) => a.distance - b.distance)
          .map((entry) => entry.property);

        const withoutCoords = list.filter(
          (p) => typeof p.latitude !== "number" || typeof p.longitude !== "number"
        );

        const areaMatched = deviceAreaHint
          ? withoutCoords.filter((p) => {
              const city = normalize(p.city);
              const location = normalize(p.location);
              const area = normalize(deviceAreaHint);
              return city.includes(area) || location.includes(area);
            })
          : [];

        list = [
          ...(nearby.length > 0 ? nearby : fallbackByDistance),
          ...areaMatched,
        ];
      } else if (deviceAreaHint) {
        const area = normalize(deviceAreaHint);
        list = list.filter((p) => {
          const city = normalize(p.city);
          const location = normalize(p.location);
          return city.includes(area) || location.includes(area);
        });
      }
    }

    // Generic fallback text search when no structural intent is detected.
    const trimmed = search.trim();
    if (
      trimmed &&
      !intent.nearMe &&
      !intent.locationTerm &&
      !intent.type &&
      !intent.gender &&
      intent.amenities.length === 0 &&
      intent.maxRent === null
    ) {
      const lc = normalize(trimmed);
      list = list.filter(
        (p) =>
          normalize(p.name).includes(lc) ||
          normalize(p.location).includes(lc) ||
          normalize(p.city).includes(lc)
      );
    }

    // Budget filter chips
    if (activeFilter === 1) list = list.filter((p) => p.rent <= 8000);
    else if (activeFilter === 2) list = list.filter((p) => p.rent <= 10000);
    else if (activeFilter === 3) list = list.filter((p) => p.rent <= 12000);
    else if (activeFilter === 4) list = list.filter((p) => p.rent > 12000);

    // Sort
    if (activeSort === 1) list.sort((a, b) => a.rent - b.rent);
    else if (activeSort === 2) list.sort((a, b) => b.rent - a.rent);
    else if (intent.nearMe && deviceCoords) {
      list.sort((a, b) => {
        const aD = distanceById.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const bD = distanceById.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        return aD - bD;
      });
    }
    else list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return list;
  }, [
    properties,
    search,
    intent,
    deviceCoords,
    deviceAreaHint,
    activeFilter,
    activeTypeFilter,
    activeSort,
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#F1F5F9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CaretLeft size={18} color="#0F172A" weight="bold" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}
            >
              {search.trim()
                ? `Results for "${search.trim()}"`
                : "Explore PGs"}
            </Text>
            <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
              {loading
                ? "Loading..."
                : `${filtered.length} listing${filtered.length !== 1 ? "s" : ""} found`}
            </Text>
          </View>

          <TouchableOpacity
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#EFF6FF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SlidersHorizontal size={18} color="#2563EB" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F8FAFC",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            paddingHorizontal: 12,
            paddingVertical: 2,
          }}
        >
          <MagnifyingGlass size={16} color="#94A3B8" weight="bold" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or locality..."
            placeholderTextColor="#94A3B8"
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
              <X size={16} color="#94A3B8" weight="bold" />
            </TouchableOpacity>
          ) : null}
        </View>

        {intent.nearMe ? (
          <View
            style={{
              marginTop: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: "#EFF6FF",
              borderWidth: 1,
              borderColor: "#BFDBFE",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <Text style={{ flex: 1, fontSize: 12, color: "#1E40AF", fontWeight: "600" }}>
              {locating
                ? "Fetching your location for nearby results..."
                : locationError
                ? locationError
                : deviceCoords
                ? "Showing nearest results using your device location."
                : "Using location-based intent."}
            </Text>
            {!locating ? (
              <TouchableOpacity onPress={fetchDeviceLocation}>
                <Text style={{ fontSize: 12, fontWeight: "800", color: "#2563EB" }}>
                  Retry
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      {loading && !refreshing ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
            />
          }
        >
          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 8,
              paddingVertical: 14,
            }}
          >
            {FILTERS.map((f, i) => {
              const active = activeFilter === i;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setActiveFilter(i)}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: active ? "#2563EB" : "#fff",
                    borderWidth: 1.5,
                    borderColor: active ? "#2563EB" : "#E2E8F0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: active ? "#fff" : "#475569",
                    }}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Type Chips */}
          {/* <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 8,
              paddingBottom: 10,
            }}
          >
            {TYPE_CHIPS.map((chip) => {
              const active = activeTypeFilter === chip.value;
              return (
                <TouchableOpacity
                  key={chip.value}
                  onPress={() => setActiveTypeFilter(chip.value)}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: active ? "#2563EB" : "#fff",
                    borderWidth: 1.5,
                    borderColor: active ? "#2563EB" : "#E2E8F0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: active ? "#fff" : "#475569",
                    }}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView> */}

          {/* Sort Row */}
          <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
            <Text
              style={{
                fontSize: 12,
                color: "#94A3B8",
                fontWeight: "500",
                marginBottom: 8,
              }}
            >
              Sort by
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {SORTS.map((s, i) => {
                const active = activeSort === i;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setActiveSort(i)}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 10,
                      backgroundColor: active ? "#0F172A" : "#F1F5F9",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: active ? "#fff" : "#64748B",
                      }}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Error */}
          {error ? (
            <View
              style={{
                marginHorizontal: 16,
                marginBottom: 12,
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FECACA",
                borderRadius: 12,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Text style={{ flex: 1, fontSize: 12, color: "#991B1B" }}>
                {error}
              </Text>
              <TouchableOpacity onPress={onRefresh}>
                <Text
                  style={{ fontSize: 12, fontWeight: "800", color: "#DC2626" }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Listings */}
          <View style={{ paddingHorizontal: 16, gap: 14 }}>
            {filtered.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 60 }}>
                <MagnifyingGlass size={48} color="#CBD5E1" weight="duotone" />
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#94A3B8",
                  }}
                >
                  No listings found
                </Text>
                <Text
                  style={{ fontSize: 13, color: "#CBD5E1", marginTop: 4 }}
                >
                  Try adjusting your search or filters
                </Text>
              </View>
            ) : (
              filtered.map((p) => (
                <PropertyListCard key={p.id} property={p} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
