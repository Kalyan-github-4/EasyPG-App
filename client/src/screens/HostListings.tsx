import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { MagnifyingGlass, X } from "phosphor-react-native";

import * as api from "@/src/services/api";

import HostListingsHeader from "@/src/components/host-listings/HostListingsHeader";
import StatusFilter, { ListingFilter } from "@/src/components/host-listings/StatusFilter";
import ListingCard from "@/src/components/host-listings/ListingCard";
import EmptyListings from "@/src/components/host-listings/EmptyListings";
import { ListingListSkeleton } from "@/src/components/host-listings/ListingCardSkeleton";

export default function HostListings() {
  const { getToken } = useAuth();

  const [properties, setProperties] = useState<api.Property[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<ListingFilter>("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const mine = await api.listMyProperties(token);
      setProperties(mine);
    } catch (err: any) {
      setError(err?.message || "Couldn't load your properties");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const goToAdd = () => router.push("/(app)/host/add-property" as any);
  const goToProperty = (id: string) =>
    router.push(`/(app)/host/property/${id}` as any);

  // ─── Counts ───────────────────────
  const counts = useMemo(() => {
    const list = properties || [];
    return {
      all: list.length,
      available: list.filter((p) => p.isAvailable).length,
      full: list.filter((p) => !p.isAvailable).length,
    };
  }, [properties]);

  // ─── Filter + search ONLY ─────────
  const visible = useMemo(() => {
    let list = properties || [];

    if (filter === "available") list = list.filter((p) => p.isAvailable);
    if (filter === "full") list = list.filter((p) => !p.isAvailable);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    return list; // ✅ no sorting
  }, [properties, filter, query]);

  // ─── Loading ─────────────────────
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <HostListingsHeader count={0} onAdd={goToAdd} />
        <View style={{ marginTop: 12 }}>
          <ListingListSkeleton count={4} />
        </View>
      </SafeAreaView>
    );
  }

  const hasAny = (properties?.length ?? 0) > 0;
  const filterLabel =
    filter === "available" ? "available" : filter === "full" ? "full" : undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <HostListingsHeader count={counts.all} onAdd={goToAdd} />

      {/* Error */}
      {error ? (
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 10,
            backgroundColor: "#FEF2F2",
            borderWidth: 1,
            borderColor: "#FECACA",
            borderRadius: 12,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ flex: 1, fontSize: 12, color: "#991B1B" }}>
            {error}
          </Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={{ fontSize: 12, fontWeight: "800", color: "#DC2626" }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Search */}
      {hasAny ? (
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              paddingHorizontal: 12,
            }}
          >
            <MagnifyingGlass size={16} color="#94A3B8" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or location"
              placeholderTextColor="#94A3B8"
              style={{
                flex: 1,
                fontSize: 14,
                color: "#0F172A",
                paddingVertical: 11,
                paddingHorizontal: 8,
              }}
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery("")}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Filter ONLY */}
      {hasAny ? (
        <>
          <StatusFilter value={filter} onChange={setFilter} counts={counts} />
          <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "700" }}>
              {visible.length} {visible.length === 1 ? "result" : "results"}
            </Text>
          </View>
        </>
      ) : null}

      {/* List */}
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard property={item} onPress={() => goToProperty(item.id)} />
        )}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 90, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
        }
        ListEmptyComponent={
          <EmptyListings onAdd={goToAdd} filterLabel={hasAny ? filterLabel : undefined} />
        }
      />
    </SafeAreaView>
  );
}