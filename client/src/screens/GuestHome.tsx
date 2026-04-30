import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, ScrollView } from "react-native";
import { router } from "expo-router";
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

function matchesCity(p: api.Property, cityName: string): boolean {
  if (!cityName) return true;
  return p.city === cityName;
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
  const [saved, setSaved] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("1");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const [properties, setProperties] = useState<api.Property[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProperties = useCallback(async () => {
    try {
      const list = await api.listProperties();
      setProperties(list.filter((p) => p.isAvailable));
    } catch {
      // Silent; empty state handles it
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const toggleSave = (id: string) =>
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters = countActiveFilters(filters) > 0;

  const selectedCityName = useMemo(
    () => CITIES.find((c) => c.id === selectedCity)?.name || "",
    [selectedCity]
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
      >
        <HeroHeader
          onFilterPress={() => setShowFilterSheet(true)}
          activeFilterCount={activeFilterCount}
        />

        <View style={{ marginTop: 20, marginBottom: 4 }}>
          <CircularCityFilters
            cities={CITIES}
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
              subtitle={`${filteredProperties.length} match${
                filteredProperties.length === 1 ? "" : "es"
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
