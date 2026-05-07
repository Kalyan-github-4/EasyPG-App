import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  latitude: number;
  longitude: number;
  location: string;
  onDirections: () => void;
  actionLabel?: string;
};

export default function PropertyLocationMap({
  latitude,
  longitude,
  location,
  onDirections,
  actionLabel = "Open route",
}: Props) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
      <style>
        * { margin: 0; padding: 0; }
        body { height: 100vh; width: 100vw; }
        #map { height: 100%; width: 100%; }
        .marker-popup { font-size: 12px; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map').setView([${latitude}, ${longitude}], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19
        }).addTo(map);
        L.marker([${latitude}, ${longitude}]).addTo(map)
          .bindPopup('${location.replace(/'/g, "\\'")}');
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ marginHorizontal: 16, marginTop: 22 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "800",
          color: "#0F172A",
          marginBottom: 12,
          letterSpacing: -0.3,
        }}
      >
        Map view
      </Text>
      <View
        style={{
          overflow: "hidden",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          backgroundColor: "#E2E8F0",
        }}
      >
        <View style={{ height: 240 }}>
          <WebView
            source={{ html: htmlContent }}
            style={{ flex: 1 }}
            scrollEnabled={false}
            bounces={false}
            javaScriptEnabled={true}
          />
        </View>
        <View
          style={{
            paddingHorizontal: 14,
            paddingVertical: 12,
            backgroundColor: "#F8FAFC",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: "#0F172A",
              }}
            >
              OpenStreetMap
            </Text>
            <Text
              style={{
                marginTop: 2,
                fontSize: 11,
                color: "#64748B",
              }}
              numberOfLines={1}
            >
              {location}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onDirections}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "#0F172A",
              paddingHorizontal: 12,
              paddingVertical: 9,
              borderRadius: 10,
            }}
          >
            <Ionicons name="navigate" size={13} color="#fff" />
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>
              {actionLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}