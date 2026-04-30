import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AMENITY_OPTIONS, BUDGET_RANGES } from "@/src/data/constants";

const { height } = Dimensions.get("window");

export type FilterState = {
  gender: "any" | "boys" | "girls";
  budget: string | null;
  amenities: string[];
  roomType: string | null;
};

export const DEFAULT_FILTERS: FilterState = {
  gender: "any",
  budget: null,
  amenities: [],
  roomType: null,
};

export function countActiveFilters(f: FilterState): number {
  return (
    (f.gender !== "any" ? 1 : 0) +
    (f.budget ? 1 : 0) +
    f.amenities.length +
    (f.roomType ? 1 : 0)
  );
}

type Props = {
  visible: boolean;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClose: () => void;
};

const GENDERS = [
  { id: "any", label: "Any", icon: "people-outline" },
  { id: "boys", label: "Boys", icon: "man-outline" },
  { id: "girls", label: "Girls", icon: "woman-outline" },
];

const ROOM_TYPES = ["Single", "Double", "Triple"];

export default function FilterSheet({ visible, filters, onApply, onClose }: Props) {
  const [local, setLocal] = useState<FilterState>(filters);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) dragY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 0.5) {
          onClose();
        }
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 120,
          friction: 14,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setLocal(filters);
      dragY.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const toggleAmenity = (id: string) => {
    setLocal((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter((a) => a !== id)
        : [...prev.amenities, id],
    }));
  };

  const handleReset = () => setLocal(DEFAULT_FILTERS);

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  const activeCount = countActiveFilters(local);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Sheet */}
      <Animated.View style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: height * 0.85,
        transform: [{ translateY: Animated.add(slideAnim, dragY) }],
      }}>
        {/* Draggable Handle */}
        <View {...panResponder.panHandlers}>
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0" }} />
          </View>

          {/* Header */}
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: "#F1F5F9",
          }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>Filters</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#2563EB" }}>Reset all</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        >
          {/* ── Gender ── */}
          <Section title="Gender">
            <View style={{ flexDirection: "row", gap: 10 }}>
              {GENDERS.map((g) => {
                const active = local.gender === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setLocal((p) => ({ ...p, gender: g.id as FilterState["gender"] }))}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      paddingVertical: 11,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: active ? "#2563EB" : "#E2E8F0",
                      backgroundColor: active ? "#EFF6FF" : "#fff",
                    }}
                  >
                    <Ionicons
                      name={g.icon as any}
                      size={16}
                      color={active ? "#2563EB" : "#64748B"}
                    />
                    <Text style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: active ? "#2563EB" : "#64748B",
                    }}>
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          {/* ── Budget ── */}
          <Section title="Budget Range">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {BUDGET_RANGES.map((b) => {
                const active = local.budget === b.id;
                return (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => setLocal((p) => ({ ...p, budget: p.budget === b.id ? null : b.id }))}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: active ? "#2563EB" : "#E2E8F0",
                      backgroundColor: active ? "#EFF6FF" : "#fff",
                    }}
                  >
                    <Text style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: active ? "#2563EB" : "#64748B",
                    }}>
                      {b.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          {/* ── Amenities ── */}
          <Section title="Amenities">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {AMENITY_OPTIONS.map((a) => {
                const active = local.amenities.includes(a.id);
                return (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => toggleAmenity(a.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: active ? "#2563EB" : "#E2E8F0",
                      backgroundColor: active ? "#EFF6FF" : "#fff",
                    }}
                  >
                    <Ionicons
                      name={a.icon as any}
                      size={14}
                      color={active ? "#2563EB" : "#94A3B8"}
                    />
                    <Text style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: active ? "#2563EB" : "#64748B",
                    }}>
                      {a.label}
                    </Text>
                    {active && (
                      <Ionicons name="checkmark" size={13} color="#2563EB" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          {/* ── Room Type ── */}
          <Section title="Room Type">
            <View style={{ flexDirection: "row", gap: 10 }}>
              {ROOM_TYPES.map((r) => {
                const active = local.roomType === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setLocal((p) => ({ ...p, roomType: p.roomType === r ? null : r }))}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      paddingVertical: 11,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: active ? "#2563EB" : "#E2E8F0",
                      backgroundColor: active ? "#EFF6FF" : "#fff",
                    }}
                  >
                    <Text style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: active ? "#2563EB" : "#64748B",
                    }}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>
        </ScrollView>

        {/* Apply button */}
        <View style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 32,
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
        }}>
          <TouchableOpacity
            onPress={handleApply}
            style={{
              backgroundColor: "#2563EB",
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>
              {activeCount > 0 ? `Apply ${activeCount} Filter${activeCount > 1 ? "s" : ""}` : "Show All PGs"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 12 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}
