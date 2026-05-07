import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Linking, View } from "react-native";
import * as Location from "expo-location";

import ExploreMap from "@/src/components/explore/ExploreMap";
import NearbyPropertySheet from "@/src/components/explore/NearbyPropertySheet";
import type { Coordinates, EnrichedProperty } from "@/src/components/explore/types";
import * as api from "@/src/services/api";

const DEFAULT_CENTER: Coordinates = {
  latitude: 22.5726,
  longitude: 88.3639,
};

function haversineKm(a: Coordinates, b: Coordinates) {
  const r = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const c = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

  return 2 * r * Math.asin(Math.sqrt(c));
}

export default function ExploreScreen() {
  const [properties, setProperties] = useState<EnrichedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<EnrichedProperty | null>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [activeType, setActiveType] = useState<api.PropertyType>("pg");
  const [activeGender, setActiveGender] = useState<"all" | api.PropertyGender>("all");

  const selectProperty = useCallback((property: EnrichedProperty) => {
    setSelectedProperty(property);

    if (typeof property.latitude === "number" && typeof property.longitude === "number") {
      setMapCenter({ latitude: property.latitude, longitude: property.longitude });
    }
  }, []);

  const loadProperties = useCallback(async () => {
    try {
      const list = await api.listProperties();
      setProperties(
        list.filter(
          (property) =>
            property.isAvailable &&
            typeof property.latitude === "number" &&
            typeof property.longitude === "number"
        )
      );
    } catch {
      Alert.alert("Error", "Couldn't load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission required", "Enable location to find nearby stays.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const location = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setUserLocation(location);
      setMapCenter(location);
    } catch {
      Alert.alert("Error", "Couldn't fetch your location.");
    }
  }, []);

  useEffect(() => {
    loadProperties();
    loadLocation();
  }, [loadLocation, loadProperties]);

  const propertiesWithDistance = useMemo(() => {
    if (!userLocation) return properties;

    return properties.map((property) => ({
      ...property,
      distanceKm: haversineKm(userLocation, {
        latitude: property.latitude!,
        longitude: property.longitude!,
      }),
    }));
  }, [properties, userLocation]);

  const nearbyProperties = useMemo(() => {
    return propertiesWithDistance
      .filter((property) => property.propertyType === activeType)
      .filter(
        (property) =>
          activeGender === "all" || property.gender === activeGender || property.gender === "any"
      )
      .sort(
        (a, b) =>
          (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER)
      );
  }, [activeGender, activeType, propertiesWithDistance]);

  const selectedRouteCoordinates = useMemo(() => {
    if (
      !userLocation ||
      selectedProperty?.latitude == null ||
      selectedProperty?.longitude == null
    ) {
      return [] as Coordinates[];
    }

    return [
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: selectedProperty.latitude, longitude: selectedProperty.longitude },
    ];
  }, [selectedProperty, userLocation]);

  const openDirections = useCallback(() => {
    if (!selectedProperty) return;

    void Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${selectedProperty.latitude},${selectedProperty.longitude}`
    );
  }, [selectedProperty]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-100">
      <ExploreMap
        center={mapCenter}
        userLocation={userLocation}
        properties={propertiesWithDistance}
        selectedId={selectedProperty?.id}
        routeCoordinates={selectedRouteCoordinates}
        onSelect={selectProperty}
        onUseMyLocation={loadLocation}
      />

      <NearbyPropertySheet
        nearbyProperties={nearbyProperties}
        selectedProperty={selectedProperty}
        activeType={activeType}
        activeGender={activeGender}
        onTypeChange={setActiveType}
        onGenderChange={setActiveGender}
        onSelect={selectProperty}
        onOpenDirections={openDirections}
      />
    </View>
  );
}
