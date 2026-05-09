import React from "react";
import { Platform, View, Text } from "react-native";
import Constants from "expo-constants";

import type { Property } from "@/src/services/api";

type Coordinates = { latitude: number; longitude: number };
type Props = {
  center: Coordinates;
  userLocation?: Coordinates | null;
  properties: (Property & { distanceKm?: number })[];
  selectedId?: string | null;
  onSelect: (property: Property) => void;
  onUseMyLocation?: () => void;
};

/** Returns true when running inside Expo Go (not a dev build). */
function isExpoGo(): boolean {
  return Constants.executionEnvironment === "storeClient";
}

/**
 * Platform-aware NearbyPropertiesMap.
 * Uses lazy require() so the native react-native-maps module
 * is never loaded in Expo Go or on web.
 */
export default function NearbyPropertiesMap(props: Props) {
  if (Platform.OS === "web") {
    const Comp = require("./NearbyPropertiesMap.web").default;
    return <Comp {...props} />;
  }

  // On native: only load the map component if NOT in Expo Go
  if (!isExpoGo()) {
    try {
      const Comp = require("./NearbyPropertiesMapNative").default;
      return <Comp {...props} />;
    } catch {
      // fall through to fallback
    }
  }

  // Fallback for Expo Go where react-native-maps native module is not linked
  return (
    <View
      style={{
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#D8E1EE",
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A" }}>
        Map not available
      </Text>
      <Text style={{ marginTop: 6, fontSize: 13, color: "#64748B", lineHeight: 20 }}>
        Native maps require a development build and are not available in Expo
        Go.
      </Text>
    </View>
  );
}
