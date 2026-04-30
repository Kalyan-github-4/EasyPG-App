import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Heart, MagnifyingGlass } from "phosphor-react-native";

import * as api from "@/src/services/api";
import PropertyListCard from "@/src/components/home/PropertyListCard";
import { LinearGradient } from "expo-linear-gradient";

type SortKey = "recent" | "price-low" | "price-high";

export default function SavedScreen() {
  const { getToken } = useAuth();

  const [items, setItems] = useState<api.Property[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("recent");

  const load = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const list = await api.listSaved(token);
      setItems(list);
    } catch (err: any) {
      setError(err?.message || "Couldn't load saved listings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  // Re-fetch when tab regains focus (handles unsave from PG detail)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const sorted = useMemo(() => {
    const list = items || [];
    switch (sortBy) {
      case "price-low":
        return [...list].sort((a, b) => a.rent - b.rent);
      case "price-high":
        return [...list].sort((a, b) => b.rent - a.rent);
      default:
        return list;
    }
  }, [items, sortBy]);

  const handleUnsave = async (p: api.Property) => {
    Alert.alert("Remove from saved?", `Remove ${p.name} from your saved list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setItems((prev) => prev?.filter((x) => x.id !== p.id) ?? null);
          try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            await api.unsaveProperty(token, p.id);
          } catch (err: any) {
            Alert.alert("Error", err?.message || "Couldn't remove");
            load();
          }
        },
      },
    ]);
  };

  const priceRange =
    sorted.length > 0
      ? `₹${Math.min(...sorted.map((p) => p.rent)).toLocaleString(
        "en-IN"
      )} – ₹${Math.max(...sorted.map((p) => p.rent)).toLocaleString("en-IN")}`
      : "";

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 12,
            backgroundColor: "#F8FAFC",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#0F172A",
              letterSpacing: -0.5,
            }}
          >
            Saved
          </Text>
          <Text style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            {sorted.length}{" "}
            {sorted.length === 1 ? "property" : "properties"}
            {priceRange ? ` · ${priceRange}` : ""}
          </Text>
        </View>

        {/* Sort pills */}
        {sorted.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 8,
              paddingBottom: 12,
            }}
          >
            <SortPill
              label="Recent"
              active={sortBy === "recent"}
              onPress={() => setSortBy("recent")}
            />
            <SortPill
              label="Price: Low to High"
              active={sortBy === "price-low"}
              onPress={() => setSortBy("price-low")}
            />
            <SortPill
              label="Price: High to Low"
              active={sortBy === "price-high"}
              onPress={() => setSortBy("price-high")}
            />
          </ScrollView>
        ) : null}

        {loading && !refreshing ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 32,
              gap: 14,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#2563EB"
              />
            }
          >
            {error ? (
              <View
                style={{
                  backgroundColor: "#FEF2F2",
                  borderWidth: 1,
                  borderColor: "#FECACA",
                  borderRadius: 10,
                  padding: 12,
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ flex: 1, fontSize: 12, color: "#991B1B" }}>
                  {error}
                </Text>
                <TouchableOpacity onPress={onRefresh}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      color: "#DC2626",
                    }}
                  >
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {sorted.length === 0 && !error ? (
              <EmptyState />
            ) : (
              sorted.map((p) => (
                <View key={p.id}>
                  <PropertyListCard property={p} />
                  <TouchableOpacity
                    onPress={() => handleUnsave(p)}
                    activeOpacity={0.85}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "rgba(255,255,255,0.95)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Heart size={18} color="#EF4444" weight="fill" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function SortPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: active ? "#2563EB" : "#E2E8F0",
        backgroundColor: active ? "#EFF6FF" : "#fff",
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: active ? "#2563EB" : "#64748B",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        marginTop: 16,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: "#FEF2F2",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Heart size={28} color="#EF4444" weight="duotone" />
      </View>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "800",
          color: "#0F172A",
          marginBottom: 6,
          letterSpacing: -0.2,
        }}
      >
        No saved properties yet
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: "#64748B",
          textAlign: "center",
          lineHeight: 18,
          marginBottom: 16,
        }}
      >
        Tap the heart on any property to save it for later.
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(app)/pgs" as any)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <MagnifyingGlass size={14} color="#fff" weight="bold" />
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>
            Browse properties
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
