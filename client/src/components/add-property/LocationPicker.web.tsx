import React, { useEffect, useMemo, useState } from "react";
import { Alert, ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

import { CITIES } from "@/src/data/constants";
import { resolveLocation, reverseGeocodeLocation } from "@/src/lib/locationResolver";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Props = {
  city: string;
  location: string;
  pincode: string;
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

export default function LocationPicker({ city, location, pincode, value, onChange }: Props) {
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);
  const [resolvingCurrent, setResolvingCurrent] = useState(false);
  const [resolvedLabel, setResolvedLabel] = useState(location || "Search a landmark, college, hospital, or area.");
  const [latitudeText, setLatitudeText] = useState("");
  const [longitudeText, setLongitudeText] = useState("");

  const fallback = useMemo(() => getCityCenter(city), [city]);
  const selected = value ?? fallback;

  useEffect(() => {
    setLatitudeText(selected.latitude.toFixed(6));
    setLongitudeText(selected.longitude.toFixed(6));
  }, [selected.latitude, selected.longitude]);

  const html = useMemo(() => {
    const popup = JSON.stringify(resolvedLabel || location || city || "Selected location");
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { height: 100%; width: 100%; margin: 0; }
          body { background: #fff; }
          .leaflet-container { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const initial = [${selected.latitude}, ${selected.longitude}];
          const map = L.map('map').setView(initial, 16);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          const marker = L.marker(initial, { draggable: true }).addTo(map);
          marker.bindPopup(${popup});

          function postCoords(latlng) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              latitude: latlng.lat,
              longitude: latlng.lng
            }));
          }

          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            postCoords(e.latlng);
          });

          marker.on('dragend', function(e) {
            postCoords(e.target.getLatLng());
          });
        </script>
      </body>
      </html>
    `;
  }, [city, location, resolvedLabel, selected.latitude, selected.longitude]);

  useEffect(() => {
    setResolvedLabel(location || "Search a landmark, college, hospital, or area.");
  }, [location]);

  const applyManualCoordinates = async () => {
    const lat = Number.parseFloat(latitudeText);
    const lon = Number.parseFloat(longitudeText);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      Alert.alert("Invalid coordinates", "Enter valid numeric latitude and longitude.");
      return;
    }
    if (lat < -90 || lat > 90) {
      Alert.alert("Invalid latitude", "Latitude must be between -90 and 90.");
      return;
    }
    if (lon < -180 || lon > 180) {
      Alert.alert("Invalid longitude", "Longitude must be between -180 and 180.");
      return;
    }

    await commitCoords({ latitude: lat, longitude: lon });
  };

  const commitCoords = async (coords: Coordinates, label?: string) => {
    onChange(coords);
    if (label) {
      setResolvedLabel(label);
      return;
    }

    try {
      const resolved = await reverseGeocodeLocation(coords.latitude, coords.longitude);
      setResolvedLabel(resolved?.displayName || "Pinned location");
    } catch {
      setResolvedLabel("Pinned location");
    }
  };

  const handleSearch = async () => {
    const term = searchText.trim();
    if (!term) return;

    setSearching(true);
    try {
      const queryParts = [term, city, pincode].filter(Boolean);
      const resolved = await resolveLocation(queryParts.join(", "));
      if (!resolved) {
        Alert.alert("Location not found", "Try a landmark, college, hospital, or nearby area.");
        return;
      }

      await commitCoords(
        { latitude: resolved.lat, longitude: resolved.lng },
        resolved.displayName || term
      );
    } catch (err: any) {
      Alert.alert("Couldn't search location", err?.message || "Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setResolvingCurrent(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission needed", "Allow location access to use your current position.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      await commitCoords({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch (err: any) {
      Alert.alert("Couldn't get current location", err?.message || "Please try again.");
    } finally {
      setResolvingCurrent(false);
    }
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: 12 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Text style={styles.h1}>Search and place the pin</Text>
          <Text style={styles.sub}>
            Search a landmark, college, hospital, or area, then drag the pin slightly to fine-tune the exact spot.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.searchRow}>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search landmark, college, area..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoCorrect={false}
              autoCapitalize="words"
            />

            <TouchableOpacity
              onPress={handleSearch}
              activeOpacity={0.85}
              style={styles.searchButton}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            activeOpacity={0.85}
            style={styles.secondaryButton}
            disabled={resolvingCurrent}
          >
            {resolvingCurrent ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <Text style={styles.secondaryButtonText}>
                Use current location
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={{ height: 380 }}>
            <WebView
              source={{ html }}
              style={{ flex: 1 }}
              onMessage={(event) => {
                try {
                  const parsed = JSON.parse(event.nativeEvent.data) as Coordinates;
                  if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
                    void commitCoords(parsed);
                  }
                } catch {
                  // ignore malformed messages
                }
              }}
              javaScriptEnabled
              scrollEnabled={false}
              bounces={false}
            />
          </View>

          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Selected location</Text>
              <Text style={styles.address} numberOfLines={2}>
                {resolvedLabel || location || "Use search or drag the pin to mark the exact entrance"}
              </Text>
            </View>
            <View style={styles.coordsPill}>
              <Text style={styles.coordsText}>
                {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.coordSection}>
          <Text style={styles.coordLabel}>Latitude</Text>
          <TextInput
            value={latitudeText}
            onChangeText={setLatitudeText}
            onEndEditing={() => {
              void applyManualCoordinates();
            }}
            placeholder="22.572645"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            style={styles.coordInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.coordLabel}>Longitude</Text>
          <TextInput
            value={longitudeText}
            onChangeText={setLongitudeText}
            onEndEditing={() => {
              void applyManualCoordinates();
            }}
            placeholder="88.363892"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            style={styles.coordInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            activeOpacity={0.85}
            style={styles.secondaryButton}
            disabled={resolvingCurrent}
          >
            {resolvingCurrent ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <Text style={styles.secondaryButtonText}>Use current location</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = {
  h1: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#0F172A",
    marginBottom: 6,
  },

  sub: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },

  searchRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 6,
    minHeight: 56,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    paddingVertical: 12,
    paddingRight: 10,
  },

  searchButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 18,
    height: 44,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  searchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700" as const,
  },

  secondaryButton: {
    marginTop: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    minHeight: 48,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  secondaryButtonText: {
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "700" as const,
    textAlign: "center" as const,
  },

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

  label: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: "#0F172A",
  },

  address: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 17,
  },

  coordsPill: {
    backgroundColor: "#0F172A",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  coordsText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700" as const,
  },

  coordSection: {
    paddingHorizontal: 20,
    gap: 8,
  },

  coordLabel: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#334155",
    marginTop: 2,
  },

  coordInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#0F172A",
  },
};