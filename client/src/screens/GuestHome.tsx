import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import HeroHeader from "@/src/components/home/HeroHeader";
import CircularCityFilters from "@/src/components/home/FilterChips";
import SectionHeader from "@/src/components/home/SectionHeader";
import PropertyFeaturedCard from "@/src/components/home/PropertyFeaturedCard";
import { PropertyFeaturedRailSkeleton } from "@/src/components/home/PropertyFeaturedCardSkeleton";
import FilterSheet, {
  FilterState,
  DEFAULT_FILTERS,
  countActiveFilters,
} from "@/src/components/home/FilterSheet";
import { CARD_WIDTH, CITIES, BUDGET_RANGES } from "@/src/data/constants";
import * as api from "@/src/services/api";

type Props = {
  firstName: string;
};

// ─── Section definitions (derived from real API data) ──────────────

type HomeSection = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  filter: (p: api.Property) => boolean;
};

const HOME_SECTIONS: HomeSection[] = [
  {
    id: "featured",
    title: "Featured on EasyPG",
    subtitle: "Trusted hosts, 4+ ratings",
    icon: "star",
    filter: (p) => p.isTrusted && p.rating >= 4,
  },
  {
    id: "budget",
    title: "Budget Friendly",
    subtitle: "Great stays under ₹4,000",
    icon: "wallet-outline",
    filter: (p) => p.rent < 4000,
  },
  {
    id: "girls",
    title: "Girls Only",
    subtitle: "Safe & verified women's PGs",
    icon: "woman-outline",
    filter: (p) => p.gender === "girls",
  },
  {
    id: "boys",
    title: "Boys Only",
    subtitle: "Hostels and PGs for men",
    icon: "man-outline",
    filter: (p) => p.gender === "boys",
  },
  {
    id: "meals",
    title: "With Meals",
    subtitle: "Home-cooked food included",
    icon: "restaurant-outline",
    filter: (p) => p.facilities.includes("food"),
  },
  {
    id: "hostels",
    title: "Hostels",
    subtitle: "Budget-friendly dorm stays",
    icon: "business-outline",
    filter: (p) => p.propertyType === "hostel",
  },
  {
    id: "messes",
    title: "Mess Subscriptions",
    subtitle: "Daily meal plans nearby",
    icon: "fast-food-outline",
    filter: (p) => p.propertyType === "mess",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────

function normalizeCityName(value: string): string {
  return value.trim().toLowerCase();
}

function matchesCity(p: api.Property, cityName: string): boolean {
  if (!cityName) return true;
  return normalizeCityName(p.city) === normalizeCityName(cityName);
}

function applyFilters(
  list: api.Property[],
  filters: FilterState
): api.Property[] {
  return list.filter((p) => {
    if (filters.gender !== "any" && p.gender !== "any" && p.gender !== filters.gender)
      return false;
    if (filters.budget) {
      const range = BUDGET_RANGES.find((r) => r.id === filters.budget);
      if (range && (p.rent < range.min || p.rent > range.max)) return false;
    }
    if (filters.amenities.length > 0) {
      if (!filters.amenities.every((a) => p.facilities.includes(a as api.FacilityType)))
        return false;
    }
    return true;
  });
}

// ─── Screen ────────────────────────────────────────────────────────

export default function GuestHome({ firstName: _firstName }: Props) {
  const PAGE_SIZE = 20;
  const { getToken } = useAuth();
  const [saved, setSaved] = useState<string[]>([]);
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});
  const [selectedCity, setSelectedCity] = useState<string>(cityCounts ? Object.keys(cityCounts)[0] : ""); // Default to city with most listings, or empty if counts not loaded
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const [properties, setProperties] = useState<api.Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);

  // ─── Load user's existing saved IDs on mount ────────────
  useEffect(() => {
    const fetchSavedIds = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const ids = await api.listSavedIds(token);
        setSaved(ids);
      } catch {
        // Non-critical — hearts just start unchecked
      }
    };
    fetchSavedIds();
  }, [getToken]);

  const fetchPage = useCallback(async (offset: number, reset: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const { properties: batch, pagination } = await api.listPropertiesPage({
        limit: PAGE_SIZE,
        offset,
      });

      const availableBatch = batch.filter((p) => p.isAvailable);
      setProperties((prev) => {
        if (reset) return availableBatch;
        const seen = new Set(prev.map((p) => p.id));
        const deduped = availableBatch.filter((p) => !seen.has(p.id));
        return [...prev, ...deduped];
      });
      setHasMore(pagination.hasMore);
      setNextOffset(pagination.nextOffset);
    } catch {
      // Silent; empty state handles it
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, []);

  const fetchCityCounts = useCallback(async () => {
    try {
      const counts = await api.getPropertyCityCounts();
      setCityCounts(counts);
    } catch {
      // Non-blocking fallback: UI can render without counts
    }
  }, []);

  const loadInitial = useCallback(() => {
    setNextOffset(0);
    setHasMore(true);
    void fetchPage(0, true);
    void fetchCityCounts();
  }, [fetchCityCounts, fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || nextOffset == null) return;
    void fetchPage(nextOffset, false);
  }, [fetchPage, hasMore, loading, loadingMore, nextOffset]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const maybeLoadMoreOnScroll = useCallback(
    (event: any) => {
      if (loading || loadingMore || !hasMore || nextOffset == null) return;

      const {
        contentOffset,
        contentSize,
        layoutMeasurement,
      } = event.nativeEvent;

      const distanceFromBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);

      if (distanceFromBottom < 380) {
        loadMore();
      }
    },
    [hasMore, loadMore, loading, loadingMore, nextOffset]
  );

  // ─── Toggle save — optimistic UI + real API call ─────────
  const toggleSave = useCallback(async (id: string) => {
    const isSaved = saved.includes(id);
    // Optimistic update
    setSaved((prev) =>
      isSaved ? prev.filter((x) => x !== id) : [...prev, id]
    );
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      if (isSaved) {
        await api.unsaveProperty(token, id);
      } else {
        await api.saveProperty(token, id);
      }
    } catch {
      // Revert optimistic update on failure
      setSaved((prev) =>
        isSaved ? [...prev, id] : prev.filter((x) => x !== id)
      );
    }
  }, [saved, getToken]);

  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters = countActiveFilters(filters) > 0;

  const selectedCityName = useMemo(
    () => CITIES.find((c) => c.id === selectedCity)?.name || "",
    [selectedCity]
  );

  const localCityCounts = useMemo(
    () =>
      properties.reduce<Record<string, number>>((acc, property) => {
        const key = normalizeCityName(property.city);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
    [properties]
  );

  const citiesWithCounts = useMemo(
    () =>
      [...CITIES].map((city) => ({
        ...city,
        count: Math.max(
          cityCounts[normalizeCityName(city.name)] ?? 0,
          localCityCounts[normalizeCityName(city.name)] ?? 0
        ),
      }))
        .filter((c) => c.count > 0)
        .sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
    [cityCounts, localCityCounts]
  );

  // Narrow pool to the selected city first
  const cityScopedProperties = useMemo(
    () => properties.filter((p) => matchesCity(p, selectedCityName)),
    [properties, selectedCityName]
  );

  const filteredProperties = useMemo(
    () => applyFilters(cityScopedProperties, filters),
    [cityScopedProperties, filters]
  );

  const sectionData = useMemo(
    () =>
      HOME_SECTIONS.map((section) => ({
        ...section,
        items: cityScopedProperties.filter(section.filter),
      })).filter((s) => s.items.length > 0),
    [cityScopedProperties]
  );

  return (
    <View className="flex-1 bg-brand-surface">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        onScroll={maybeLoadMoreOnScroll}
        scrollEventThrottle={120}
      >
        <HeroHeader
          onFilterPress={() => setShowFilterSheet(true)}
          activeFilterCount={activeFilterCount}
        />

        <View style={{ marginTop: 20, marginBottom: 4 }}>
          <CircularCityFilters
            cities={citiesWithCounts}
            selectedCityId={selectedCity}
            onSelectCity={setSelectedCity}
          />
        </View>

        {/* ── Loading skeleton ── */}
        {loading ? (
          <View style={{ marginTop: 20 }}>
            <SectionHeader
              title="Loading PGs"
              subtitle="Fetching the latest listings…"
              icon="sparkles-outline"
            />
            <PropertyFeaturedRailSkeleton count={3} />
          </View>
        ) : hasActiveFilters ? (
          /* ── Active filters → single result rail ── */
          <View style={{ marginTop: 20 }}>
            <SectionHeader
              title="Search Results"
              subtitle={`${filteredProperties.length} match${filteredProperties.length === 1 ? "" : "es"
                } in ${selectedCityName || "your area"}`}
              icon="search-outline"
            />
            {filteredProperties.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + 16}
                snapToAlignment="start"
              >
                {filteredProperties.map((p) => (
                  <PropertyFeaturedCard
                    key={p.id}
                    property={p}
                    saved={saved.includes(p.id)}
                    onSave={() => toggleSave(p.id)}
                  />
                ))}
              </ScrollView>
            ) : null}
          </View>
        ) : sectionData.length === 0 ? (
          /* ── No properties at all ── */
          <View style={{ marginTop: 20 }}>
            <SectionHeader
              title={`No listings in ${selectedCityName || "this city"} yet`}
              subtitle="Try another city or check back soon"
              icon="sad-outline"
            />
          </View>
        ) : (
          /* ── Section rails (from real data) ── */
          sectionData.map((section) => (
            <View key={section.id} style={{ marginTop: 24 }}>
              <SectionHeader
                title={section.title}
                subtitle={section.subtitle}
                icon={section.icon}
                onSeeAll={() => router.push("/(app)/pgs" as any)}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + 16}
                snapToAlignment="start"
              >
                {section.items.map((p) => (
                  <PropertyFeaturedCard
                    key={p.id}
                    property={p}
                    saved={saved.includes(p.id)}
                    onSave={() => toggleSave(p.id)}
                  />
                ))}
              </ScrollView>
            </View>
          ))
        )}

        {loadingMore ? (
          <View style={{ marginTop: 20, marginBottom: 12 }}>
            <SectionHeader
              title="Loading more"
              subtitle="Fetching more listings as you scroll"
              icon="refresh-outline"
            />
            <PropertyFeaturedRailSkeleton count={2} />
          </View>
        ) : null}
      </ScrollView>

      <FilterSheet
        visible={showFilterSheet}
        filters={filters}
        onApply={setFilters}
        onClose={() => setShowFilterSheet(false)}
      />
    </View>
  );
}
