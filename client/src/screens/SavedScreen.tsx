import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ArrowCounterClockwise } from "phosphor-react-native";

import * as api from "@/src/services/api";
import SavedHeader from "@/src/components/saved/SavedHeader";
import SavedPGCard from "@/src/components/saved/SavedPGCard";
import EmptyState from "@/src/components/saved/EmptyState";

export default function SavedScreen() {
  const { getToken } = useAuth();

  const [items, setItems] = useState<api.Property[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <ActivityIndicator size="large" color="#2563EB" />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#94A3B8",
                letterSpacing: 0.2,
              }}
            >
              Loading your saved PGs…
            </Text>
          </View>
        ) : (
          <FlatList
            ListHeaderComponent={
              <>
                <SavedHeader count={items?.length || 0} />
                {error ? (
                  <View
                    style={{
                      backgroundColor: "#FEF2F2",
                      borderWidth: 1,
                      borderColor: "#FECACA",
                      borderRadius: 14,
                      padding: 14,
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: "#991B1B",
                        fontWeight: "500",
                      }}
                    >
                      {error}
                    </Text>
                    <TouchableOpacity
                      onPress={onRefresh}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        backgroundColor: "#FEE2E2",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      }}
                    >
                      <ArrowCounterClockwise
                        size={12}
                        color="#DC2626"
                        weight="bold"
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: "#DC2626",
                        }}
                      >
                        Retry
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </>
            }
            data={error ? [] : items || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SavedPGCard
                property={item}
                onRemove={() => handleUnsave(item)}
              />
            )}
            ListEmptyComponent={!error ? <EmptyState /> : null}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 32,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#2563EB"
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
