import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Bell } from "phosphor-react-native";
import SearchBar from "./SearchBar";
import { useInquiryUnread } from "@/src/hooks/useInquiryUnread";
import { CITIES } from "@/src/data/constants";

type Props = {
  onFilterPress: () => void;
  activeFilterCount: number;
};

const HOLD_MS = 20000;
const SLIDE_MS = 500;
const LINE_H = 18;

// ─── Ticker: two layers animate in parallel ────────────────────────

function CityTicker() {
  const [current, setCurrent] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tick = () => {
      Animated.timing(anim, {
        toValue: 1,
        duration: SLIDE_MS,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }).start(() => {
        setCurrent((i) => (i + 1) % CITIES.length);
        anim.setValue(0);
        timeoutRef.current = setTimeout(tick, HOLD_MS);
      });
    };

    timeoutRef.current = setTimeout(tick, HOLD_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [anim]);

  const next = (current + 1) % CITIES.length;
  const c = CITIES[current];
  const n = CITIES[next];

  // Outgoing: 0 → -LINE_H, fading out
  const outY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -LINE_H],
  });
  const outOpacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.3, 0],
  });

  // Incoming: LINE_H → 0, fading in
  const inY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [LINE_H, 0],
  });
  const inOpacity = anim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.5, 1],
  });

  const textStyle = {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.3,
    lineHeight: LINE_H,
  };

  return (
    <View style={{ height: LINE_H, overflow: "hidden" }}>
      {/* Outgoing */}
      <Animated.Text
        style={[
          textStyle,
          {
            position: "absolute",
            left: 0,
            right: 0,
            transform: [{ translateY: outY }],
            opacity: outOpacity,
          },
        ]}
      >
        {c.name} · {c.count}+ listings
      </Animated.Text>

      {/* Incoming */}
      <Animated.Text
        style={[
          textStyle,
          {
            position: "absolute",
            left: 0,
            right: 0,
            transform: [{ translateY: inY }],
            opacity: inOpacity,
          },
        ]}
      >
        {n.name} · {n.count}+ listings
      </Animated.Text>
    </View>
  );
}

// ─── Header ────────────────────────────────────────────────────────

export default function HeroHeader({ onFilterPress, activeFilterCount }: Props) {
  const { totalUnread } = useInquiryUnread();
  const hasUnread = totalUnread > 0;

  return (
    <LinearGradient
      colors={["#1D4ED8", "#60A5FA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}
    >
      <SafeAreaView edges={["top"]}>
        {/* Title row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 10,
            paddingBottom: 18,
          }}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <CityTicker />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: "#fff",
                marginTop: 4,
                letterSpacing: -0.5,
              }}
            >
              Find Your Perfect PG
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(app)/inbox" as any)}
            activeOpacity={0.8}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={20} color="#fff" weight="regular" />
            {hasUnread ? (
              <View
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  minWidth: 18,
                  height: 18,
                  paddingHorizontal: 5,
                  borderRadius: 9,
                  backgroundColor: "#EF4444",
                  borderWidth: 1.5,
                  borderColor: "#3B82F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "800", color: "#fff" }}>
                  {totalUnread > 9 ? "9+" : totalUnread}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 28 }}>
          <SearchBar
            onPress={() => router.push("/(app)/search" as any)}
            onFilterPress={onFilterPress}
            activeFilterCount={activeFilterCount}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
