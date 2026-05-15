import React, { useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";

import { CITIES } from "@/src/data/constants";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Props = {
  city: string;
  location: string;
  value: Coordinates | null;
  onChange: (coords: Coordinates) => void;
};

function getCityCenter(city: string): Coordinates {
  const found = CITIES.find((entry) => entry.name === city);
  if (found?.name === "Jhargram") return { latitude: 22.4556, longitude: 86.9979 };
  if (found?.name === "Medinipur") return { latitude: 22.4257, longitude: 87.32 };
  if (found?.name === "Kharagpur") return { latitude: 22.3302, longitude: 87.3237 };
  return { latitude: 22.4556, longitude: 86.9979 };
}

export default function LocationPicker({ city, location, value, onChange }: Props) {
  const fallback = useMemo(() => getCityCenter(city), [city]);
  const selected = value ?? fallback;
  const [region, setRegion] = useState<Region>({
    ...selected,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  });

  useEffect(() => {
    const next = value ?? fallback;
    setRegion({
      ...next,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    });
  }, [fallback, value]);

  return (
    <View style={{ gap: 12 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Text style={styles.h1}>Place the pin on the exact spot</Text>
        <Text style={styles.sub}>
          Tap the map or drag the pin to the real entrance. Guests will use this
          exact coordinate for the location view.
        </Text>
      </View>

      <View style={styles.card}>
        <MapView
          style={{ width: "100%", height: 360 }}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={(event) => onChange(event.nativeEvent.coordinate)}
          showsBuildings
          showsCompass
        >
          <Marker
            coordinate={selected}
            draggable
            onDragEnd={(event) => onChange(event.nativeEvent.coordinate)}
          />
        </MapView>

        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Selected location</Text>
            <Text style={styles.address} numberOfLines={2}>
              {location || "Use the pin to mark the exact entrance"}
            </Text>
          </View>
          <View style={styles.coordsPill}>
            <Text style={styles.coordsText}>
              {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = {
  h1: { fontSize: 22, fontWeight: "800" as const, color: "#0F172A", marginBottom: 6 },
  sub: { fontSize: 14, color: "#64748B", lineHeight: 20 },
  card: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  label: { fontSize: 11, fontWeight: "800" as const, color: "#0F172A" },
  address: { fontSize: 12, color: "#64748B", marginTop: 3, lineHeight: 17 },
  coordsPill: {
    backgroundColor: "#0F172A",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  coordsText: { color: "#fff", fontSize: 11, fontWeight: "700" as const },
};