import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

import type { Property } from "@/src/services/api";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Props = {
  center: Coordinates;
  userLocation?: Coordinates | null;
  properties: Array<Property & { distanceKm?: number }>;
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
  const html = useMemo(() => {
    const markers = properties
      .filter((property) => typeof property.latitude === "number" && typeof property.longitude === "number")
      .map((property) => ({
        id: property.id,
        name: property.name.replace(/'/g, "\\'"),
        rent: property.rent.toLocaleString("en-IN"),
        type: property.propertyType,
        color: TYPE_COLORS[property.propertyType] || "#2563EB",
        latitude: property.latitude,
        longitude: property.longitude,
      }));

    const user = userLocation
      ? `{ latitude: ${userLocation.latitude}, longitude: ${userLocation.longitude} }`
      : "null";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { width: 100%; height: 100%; margin: 0; }
          body { background: #fff; }
          .leaflet-container { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
          .badge {
            min-width: 54px;
            padding: 7px 10px;
            border-radius: 999px;
            border: 1px solid #E2E8F0;
            background: rgba(255,255,255,0.96);
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
            text-align: center;
            transform: translate(-50%, -50%);
          }
          .badge.selected { color: #fff; border-color: transparent; }
          .type { font-size: 10px; font-weight: 800; line-height: 1; }
          .price { margin-top: 2px; font-size: 11px; font-weight: 900; line-height: 1; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const center = [${center.latitude}, ${center.longitude}];
          const map = L.map('map').setView(center, 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          const user = ${user};
          if (user) {
            L.circleMarker([user.latitude, user.longitude], {
              radius: 8,
              color: '#2563EB',
              fillColor: '#60A5FA',
              fillOpacity: 0.85,
              weight: 3
            }).addTo(map).bindPopup('You are here');
          }

          const markers = ${JSON.stringify(markers)};
          markers.forEach((marker) => {
            const el = document.createElement('div');
            el.className = 'badge';
            el.style.borderColor = marker.color;
            el.innerHTML = '<div class="type">' + marker.type.toUpperCase() + '</div><div class="price" style="color:' + marker.color + '">₹' + marker.rent + '</div>';
            if (marker.id === '${selectedId || ""}') {
              el.classList.add('selected');
              el.style.background = marker.color;
              el.innerHTML = '<div class="type">' + marker.type.toUpperCase() + '</div><div class="price">₹' + marker.rent + '</div>';
            }

            const icon = L.divIcon({
              className: '',
              html: el.outerHTML,
              iconSize: [72, 44],
              iconAnchor: [36, 22],
            });

            const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon }).addTo(map);
            leafletMarker.bindPopup('<strong>' + marker.name + '</strong><br/>₹' + marker.rent);
            leafletMarker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'select', id: marker.id }));
            });
          });
        </script>
      </body>
      </html>
    `;
  }, [center.latitude, center.longitude, properties, selectedId, userLocation]);

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

      <View style={{ height: 340 }}>
        <WebView
          source={{ html }}
          style={{ flex: 1 }}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled
          onMessage={(event) => {
            try {
              const parsed = JSON.parse(event.nativeEvent.data) as { type: string; id: string };
              if (parsed.type === "select") {
                const property = properties.find((item) => item.id === parsed.id);
                if (property) onSelect(property);
              }
            } catch {
              // ignore invalid map messages
            }
          }}
        />
      </View>
    </View>
  );
}
