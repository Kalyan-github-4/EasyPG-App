import React, { useEffect, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

import type { EnrichedProperty, Coordinates } from "./types";

type Props = {
  center: Coordinates;
  userLocation?: Coordinates | null;
  properties: EnrichedProperty[];
  selectedId?: string | null;
  routeCoordinates?: Coordinates[];
  onSelect: (property: EnrichedProperty) => void;
  onUseMyLocation?: () => void;
  onMapReady?: (map: MapView | null) => void;
};

const TYPE_COLORS: Record<string, string> = {
  pg: "#2563EB",
  mess: "#F59E0B",
  hostel: "#10B981",
};

function getTypeIcon(type: string) {
  switch (type) {
    case "pg":
      return "bed-outline";
    case "mess":
      return "restaurant-outline";
    case "hostel":
      return "business-outline";
    default:
      return "home-outline";
  }
}

function getGenderColor(gender: string) {
  switch (gender) {
    case "boys":
      return "#3B82F6";
    case "girls":
      return "#EC4899";
    default:
      return "#10B981";
  }
}

export default function ExploreMap({
  center,
  userLocation,
  properties,
  selectedId,
  routeCoordinates,
  onSelect,
  onUseMyLocation,
  onMapReady,
}: Props) {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    mapRef.current?.animateToRegion(
      {
        ...center,
        latitudeDelta: 0.035,
        longitudeDelta: 0.035,
      },
      300
    );
  }, [center.latitude, center.longitude]);

  return (
    <View className="flex-1 overflow-hidden bg-white" style={{ borderRadius: 24, borderWidth: 1, borderColor: "#D8E1EE" }}>
      <View className="flex-row items-center justify-between gap-3 px-4 pt-4 pb-2.5">
        <View className="flex-1">
          <Text className="text-[17px] font-extrabold tracking-[-0.3px] text-slate-900">
            Nearby on map
          </Text>
          <Text className="mt-1 text-xs text-slate-500">
            Browse PGs, messes, and hostels around your current location.
          </Text>
        </View>

        {onUseMyLocation ? (
          <TouchableOpacity
            onPress={onUseMyLocation}
            activeOpacity={0.85}
            className="flex-row items-center gap-1.5 rounded-full border px-3 py-2"
            style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}
          >
            <Ionicons name="locate" size={14} color="#2563EB" />
            <Text className="text-xs font-extrabold text-blue-600">Use my location</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <MapView
        ref={(map) => {
          mapRef.current = map;
          onMapReady?.(map);
        }}
        provider={PROVIDER_GOOGLE}
        style={{ width: "100%", flex: 1 }}
        initialRegion={{
          ...center,
          latitudeDelta: 0.035,
          longitudeDelta: 0.035,
        }}
        showsUserLocation={Boolean(userLocation)}
        showsMyLocationButton={false}
        showsCompass
        showsBuildings
      >
        {routeCoordinates?.length === 2 ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#2563EB"
            strokeWidth={4}
            lineDashPattern={[8, 6]}
            zIndex={9}
          />
        ) : null}

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
              zIndex={isSelected ? 10 : 1}
            >
              <View className="items-center">
                <View
                  style={{
                    width: isSelected ? 44 : 36,
                    height: isSelected ? 44 : 36,
                    borderRadius: isSelected ? 22 : 18,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: isSelected ? 3 : 2,
                    borderColor: isSelected ? "#2563EB" : "#fff",
                    backgroundColor: getGenderColor(property.gender),
                    shadowColor: isSelected ? "#2563EB" : "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isSelected ? 0.45 : 0.25,
                    shadowRadius: isSelected ? 6 : 3.84,
                    elevation: isSelected ? 8 : 5,
                  }}
                >
                  <Ionicons name={getTypeIcon(property.propertyType)} size={16} color="#fff" />
                </View>

                {isSelected ? (
                  <View
                    style={{
                      marginTop: -2,
                      marginBottom: 2,
                      backgroundColor: "#fff",
                      borderRadius: 999,
                      paddingHorizontal: 3,
                      paddingVertical: 1,
                      shadowColor: "#2563EB",
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Ionicons name="location" size={20} color="#2563EB" />
                  </View>
                ) : null}

                {isSelected ? (
                  <View
                    style={{
                      position: "absolute",
                      top: -30,
                      backgroundColor: "#1F2937",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                      ₹{property.rent.toLocaleString("en-IN")}
                    </Text>
                  </View>
                ) : null}

                <View
                  className="mt-1.5 max-w-[120px] rounded-[10px] px-1.5 py-0.75"
                  style={{ backgroundColor: isSelected ? "#2563EB" : "rgba(15,23,42,0.92)" }}
                >
                  <Text className="text-[10px] font-bold text-white" numberOfLines={1}>
                    {property.name}
                  </Text>
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}
