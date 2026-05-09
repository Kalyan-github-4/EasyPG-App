import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  RecentSearch,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  removeRecentSearch,
} from "@/src/lib/searchHistory";
import {
  buildSuggestions,
  QUICK_FILTERS,
  TRENDING_QUERIES,
} from "@/src/data/searchSuggestions";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<RecentSearch[]>([]);
  const inputRef = useRef<TextInput>(null);

  // Load history on mount
  useEffect(() => {
    getRecentSearches().then(setRecents);
  }, []);

  // Focus input on mount (after a microtask so the screen is mounted)
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  const suggestions = useMemo(() => buildSuggestions(query), [query]);

  const submitSearch = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    Keyboard.dismiss();
    await addRecentSearch(q);
    router.replace({ pathname: "/(app)/pgs", params: { q } } as any);
  }, []);

  const onSubmitEditing = () => submitSearch(query);

  const handleRemoveRecent = async (q: string) => {
    await removeRecentSearch(q);
    setRecents((prev) => prev.filter((r) => r.query !== q));
  };

  const handleClearAll = async () => {
    await clearRecentSearches();
    setRecents([]);
  };

  const renderEmptyState = () => (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Recent */}
      {recents.length > 0 ? (
        <Section title="Recent searches" actionLabel="Clear all" onAction={handleClearAll}>
          {recents.map((r) => (
            <Row
              key={r.query}
              icon="time-outline"
              label={r.query}
              onPress={() => submitSearch(r.query)}
              trailing={
                <TouchableOpacity
                  hitSlop={12}
                  onPress={() => handleRemoveRecent(r.query)}
                >
                  <Ionicons name="close" size={16} color="#94A3B8" />
                </TouchableOpacity>
              }
            />
          ))}
        </Section>
      ) : null}

      {/* Trending */}
      <Section title="Trending near you">
        {TRENDING_QUERIES.map((s) => (
          <Row
            key={s.id}
            icon={s.icon}
            iconTint="#F59E0B"
            label={s.label}
            sublabel={s.sublabel}
            onPress={() => submitSearch(s.query)}
          />
        ))}
      </Section>

      {/* Quick filters */}
      <Section title="Quick searches">
        {QUICK_FILTERS.map((s) => (
          <Row
            key={s.id}
            icon={s.icon}
            iconTint="#2563EB"
            label={s.label}
            sublabel={s.sublabel}
            onPress={() => submitSearch(s.query)}
          />
        ))}
      </Section>
    </ScrollView>
  );

  const renderSuggestions = () => (
    <FlatList
      keyboardShouldPersistTaps="handled"
      data={suggestions}
      keyExtractor={(s) => s.id}
      renderItem={({ item }) => (
        <Row
          icon={item.icon}
          iconTint={item.kind === "intent" ? "#2563EB" : "#64748B"}
          label={item.label}
          sublabel={item.sublabel}
          onPress={() => submitSearch(item.query)}
        />
      )}
      ListEmptyComponent={
        <View style={{ padding: 40, alignItems: "center" }}>
          <Text style={{ fontSize: 13, color: "#94A3B8" }}>
            Press return to search for &quot;{query.trim()}&quot;
          </Text>
        </View>
      }
      contentContainerStyle={{ paddingVertical: 6, paddingBottom: 32 }}
    />
  );

  const showingEmpty = query.trim().length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
        }}
      >
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
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSubmitEditing}
            placeholder="Search 'mess near me', 'girls pg under 5000'..."
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
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {showingEmpty ? renderEmptyState() : renderSuggestions()}
    </SafeAreaView>
  );
}

// ─── Presentational bits ──────────────────────────────────────────

function Section({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: 18 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          marginBottom: 6,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: "800",
            color: "#94A3B8",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
        {actionLabel && onAction ? (
          <TouchableOpacity onPress={onAction} hitSlop={8}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>
              {actionLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View>{children}</View>
    </View>
  );
}

function Row({
  icon,
  iconTint = "#64748B",
  label,
  sublabel,
  onPress,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconTint?: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: "#F1F5F9",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={16} color={iconTint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 14, fontWeight: "600", color: "#0F172A" }}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text
            numberOfLines={1}
            style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}
          >
            {sublabel}
          </Text>
        ) : null}
      </View>
      {trailing ? (
        trailing
      ) : (
        <Ionicons name="arrow-up-outline" size={14} color="#CBD5E1" style={{ transform: [{ rotate: "45deg" }] }} />
      )}
    </TouchableOpacity>
  );
}
