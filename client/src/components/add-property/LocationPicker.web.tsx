import React, { useEffect, useMemo, useRef } from "react";
import { View, Text } from "react-native";
import { WebView } from "react-native-webview";

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
  const webViewRef = useRef<WebView>(null);
  const fallback = getCityCenter(city);
  const selected = value ?? fallback;

  const html = useMemo(() => {
    const popup = `${location || city || "Selected location"}`.replace(/'/g, "\\'");
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
          marker.bindPopup('${popup}');

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
  }, [city, location, selected.latitude, selected.longitude]);

  useEffect(() => {
    webViewRef.current?.injectJavaScript?.(
      `window.__selected = [${selected.latitude}, ${selected.longitude}]; true;`
    );
  }, [selected.latitude, selected.longitude]);

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
        <View style={{ height: 360 }}>
          <WebView
            ref={webViewRef}
            source={{ html }}
            style={{ flex: 1 }}
            onMessage={(event) => {
              try {
                const parsed = JSON.parse(event.nativeEvent.data) as Coordinates;
                if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
                  onChange(parsed);
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