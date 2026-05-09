import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

import type { Property } from "@/src/services/api";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Props = {
  center: Coordinates;
  userLocation?: Coordinates | null;
  properties: (Property & { distanceKm?: number })[];
  selectedId?: string | null;
  onSelect: (property: Property) => void;
  onUseMyLocation?: () => void;
};

const TYPE_COLORS: Record<string, string> = {
  pg: "#2563EB",
  mess: "#F59E0B",
  hostel: "#10B981",
};

export default function NearbyPropertiesMap({
  center,
  userLocation,
  properties,
  selectedId,
  onSelect,
  onUseMyLocation,
}: Props) {
  const region: Region = {
    ...center,
    latitudeDelta: 0.035,
    longitudeDelta: 0.035,
  };

  return (
    <View style={{ borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "#D8E1EE", backgroundColor: "#fff" }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A", letterSpacing: -0.3 }}>Nearby on map</Text>
          <Text style={{ marginTop: 3, fontSize: 12, color: "#64748B" }}>
            Browse PGs, messes, and hostels around your current location.
          </Text>
        </View>
        {onUseMyLocation ? (
          <TouchableOpacity
            onPress={onUseMyLocation}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#EFF6FF",
              borderWidth: 1,
              borderColor: "#BFDBFE",
              paddingHorizontal: 12,
              paddingVertical: 9,
              borderRadius: 999,
            }}
          >
            <Ionicons name="locate" size={14} color="#2563EB" />
            <Text style={{ fontSize: 12, fontWeight: "800", color: "#2563EB" }}>
              Use my location
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <MapView
        style={{ width: "100%", height: 340 }}
        initialRegion={region}
        showsUserLocation={Boolean(userLocation)}
        showsMyLocationButton={false}
        showsCompass
        showsBuildings
      >
        {userLocation ? (
          <Marker coordinate={userLocation} pinColor="#2563EB" title="You are here" />
        ) : null}

        {properties.map((property) => {
          if (typeof property.latitude !== "number" || typeof property.longitude !== "number") {
            return null;
          }
          const isSelected = selectedId === property.id;
          const color = TYPE_COLORS[property.propertyType] || "#2563EB";
          return (
            <Marker
              key={property.id}
              coordinate={{ latitude: property.latitude, longitude: property.longitude }}
              pinColor={color}
              title={property.name}
              description={`₹${property.rent.toLocaleString("en-IN")}`}
              onPress={() => onSelect(property)}
            >
              <View
                style={{
                  minWidth: 56,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: isSelected ? color : "rgba(255,255,255,0.96)",
                  borderWidth: 1.5,
                  borderColor: isSelected ? color : "#E2E8F0",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "800", color: isSelected ? "#fff" : "#0F172A" }}>
                  {property.propertyType.toUpperCase()}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: "900", color: isSelected ? "#fff" : color, marginTop: 1 }}>
                  ₹{property.rent.toLocaleString("en-IN")}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}
