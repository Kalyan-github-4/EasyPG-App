import React, { useEffect, useRef, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

import type { Coordinates, EnrichedProperty } from "./types";

type Props = {
  center: Coordinates;
  userLocation?: Coordinates | null;
  properties: EnrichedProperty[];
  selectedId?: string | null;
  routeCoordinates?: Coordinates[];
  onSelect: (property: EnrichedProperty) => void;
  onUseMyLocation?: () => void;
};

const TYPE_COLORS: Record<string, string> = {
  pg: "#2563EB",
  mess: "#F59E0B",
  hostel: "#10B981",
};

export default function ExploreMap({
  center,
  userLocation,
  properties,
  selectedId,
  routeCoordinates,
  onSelect,
  onUseMyLocation,
}: Props) {
  const webViewRef = useRef<WebView>(null);
  const hasUserLocation = Boolean(userLocation);

  // ── Pan map to center ──────────────────────────────────────────
  useEffect(() => {
    webViewRef.current?.injectJavaScript(`
      if (window.map) {
        window.map.setView([${center.latitude}, ${center.longitude}], window.map.getZoom(), { animate: true });
      }
      true;
    `);
  }, [center.latitude, center.longitude]);

  // ── Pulsing blue "you are here" dot (Google Maps style) ───────
  useEffect(() => {
    if (!userLocation) return;
    webViewRef.current?.injectJavaScript(`
      (function() {
        var lat = ${userLocation.latitude};
        var lng = ${userLocation.longitude};

        if (window.userDot) {
          window.userDot.setLatLng([lat, lng]);
          window.userDotBorder.setLatLng([lat, lng]);
          window.userPulse.setLatLng([lat, lng]);
          return;
        }

        if (!window.map) return;

        // 1. Outer pulsing ring (CSS animation via className)
        window.userPulse = L.circleMarker([lat, lng], {
          radius: 20,
          color: '#2563EB',
          fillColor: '#2563EB',
          fillOpacity: 0.18,
          weight: 0,
          className: 'pulse-ring',
        }).addTo(window.map);

        // 2. White border for the dot
        window.userDotBorder = L.circleMarker([lat, lng], {
          radius: 11,
          color: '#fff',
          fillColor: '#fff',
          fillOpacity: 1,
          weight: 0,
        }).addTo(window.map);

        // 3. Inner blue dot
        window.userDot = L.circleMarker([lat, lng], {
          radius: 7,
          color: '#2563EB',
          fillColor: '#2563EB',
          fillOpacity: 1,
          weight: 0,
        }).addTo(window.map).bindPopup('<b>📍 You are here</b>');
      })();
      true;
    `);
  }, [userLocation]);

  // ── Highlight selected property + pan to it ───────────────────
  useEffect(() => {
    if (!selectedId) return;
    webViewRef.current?.injectJavaScript(`
      (function() {
        if (!window.markerMap || !window.map) return;

        // Reset all to default badge
        Object.keys(window.markerMap).forEach(function(id) {
          var e = window.markerMap[id];
          e.marker.setIcon(e.defaultIcon);
        });

        // Apply teardrop pin to selected
        var entry = window.markerMap['${selectedId}'];
        if (entry) {
          entry.marker.setIcon(entry.selectedIcon);
          window.map.setView(entry.latlng, 15, { animate: true });
          entry.marker.openPopup();
        }
      })();
      true;
    `);
  }, [selectedId]);

  // ── Route polyline ─────────────────────────────────────────────
  useEffect(() => {
    if (!routeCoordinates || routeCoordinates.length !== 2) {
      webViewRef.current?.injectJavaScript(`
        if (window.routeLine && window.map) {
          window.map.removeLayer(window.routeLine);
          window.routeLine = null;
        }
        true;
      `);
      return;
    }
    const coords = JSON.stringify(
      routeCoordinates.map((c) => [c.latitude, c.longitude])
    );
    webViewRef.current?.injectJavaScript(`
      if (window.routeLine && window.map) window.map.removeLayer(window.routeLine);
      if (window.map) {
        window.routeLine = L.polyline(${coords}, {
          color: '#2563EB', weight: 5, dashArray: '10 7', opacity: 0.85
        }).addTo(window.map);
      }
      true;
    `);
  }, [routeCoordinates]);

  // ── Build HTML once when properties change ─────────────────────
  const html = useMemo(() => {
    const markers = properties
      .filter(
        (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
      )
      .map((p) => ({
        id: p.id,
        name: p.name,
        rent: p.rent.toLocaleString("en-IN"),
        type: p.propertyType,
        color: TYPE_COLORS[p.propertyType] || "#2563EB",
        lat: p.latitude,
        lng: p.longitude,
      }));

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }

    /* ─── Pulsing ring animation ─── */
    @keyframes gmPulse {
      0%   { opacity: 0.6; r: 8;  }
      100% { opacity: 0;   r: 22; }
    }
    .pulse-ring path,
    .pulse-ring circle {
      animation: gmPulse 1.8s ease-out infinite;
    }

    /* ─── Default property badge ─── */
    .pg-badge {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      padding: 4px 10px 5px;
      border-radius: 999px;
      border: 2px solid #E2E8F0;
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(15,23,42,0.18);
      cursor: pointer;
      font-family: -apple-system, system-ui, sans-serif;
    }
    .pg-badge .b-type  { font-size: 9px;  font-weight: 800; letter-spacing: 0.5px; line-height: 1.2; }
    .pg-badge .b-price { font-size: 11px; font-weight: 900; line-height: 1.2; }

    /* ─── Selected teardrop pin ─── */
    .pg-pin {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      font-family: -apple-system, system-ui, sans-serif;
    }
    .pg-pin .pin-drop {
      width: 44px;
      height: 44px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.28);
      border: 2px solid rgba(255,255,255,0.4);
    }
    .pg-pin .pin-emoji {
      transform: rotate(45deg);
      font-size: 18px;
      line-height: 1;
    }
    .pg-pin .pin-label {
      margin-top: 5px;
      background: #1F2937;
      color: #fff;
      font-size: 11px;
      font-weight: 900;
      padding: 3px 9px;
      border-radius: 999px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    window.map = L.map('map', { zoomControl: true }).setView(
      [${center.latitude}, ${center.longitude}], 13
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(window.map);

    window.markerMap = {};
    window.routeLine = null;
    window.userDot = null;
    window.userDotBorder = null;
    window.userPulse = null;

    var TYPE_EMOJI = { pg: '🛏️', mess: '🍽️', hostel: '🏢' };
    var markers = ${JSON.stringify(markers)};

    markers.forEach(function(m) {
      var emoji = TYPE_EMOJI[m.type] || '🏠';

      // ── Default badge ──
      var badgeHtml =
        '<div class="pg-badge" style="border-color:' + m.color + '">' +
          '<span class="b-type" style="color:' + m.color + '">' + m.type.toUpperCase() + '</span>' +
          '<span class="b-price">₹' + m.rent + '</span>' +
        '</div>';

      var defaultIcon = L.divIcon({
        className: '',
        html: badgeHtml,
        iconSize: [72, 40],
        iconAnchor: [36, 20],
        popupAnchor: [0, -22],
      });

      // ── Selected teardrop pin ──
      var pinHtml =
        '<div class="pg-pin">' +
          '<div class="pin-drop" style="background:' + m.color + '">' +
            '<span class="pin-emoji">' + emoji + '</span>' +
          '</div>' +
          '<span class="pin-label">₹' + m.rent + '</span>' +
        '</div>';

      var selectedIcon = L.divIcon({
        className: '',
        html: pinHtml,
        iconSize: [54, 72],
        iconAnchor: [27, 66],
        popupAnchor: [0, -70],
      });

      var latlng = [m.lat, m.lng];
      var isSelected = m.id === '${selectedId ?? ""}';

      var marker = L.marker(latlng, { icon: isSelected ? selectedIcon : defaultIcon })
        .addTo(window.map)
        .bindPopup(
          '<div style="font-family:-apple-system,sans-serif;min-width:120px">' +
            '<div style="font-weight:800;font-size:13px">' + m.name + '</div>' +
            '<div style="color:#6B7280;font-size:12px;margin-top:2px">' + m.type.toUpperCase() + ' · ₹' + m.rent + '/mo</div>' +
          '</div>'
        );

      marker.on('click', function() {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'select', id: m.id })
        );
      });

      window.markerMap[m.id] = {
        marker: marker,
        latlng: latlng,
        defaultIcon: defaultIcon,
        selectedIcon: selectedIcon,
      };
    });

    // Pan to already-selected marker on load
    var initSelected = '${selectedId ?? ""}';
    if (initSelected && window.markerMap[initSelected]) {
      var e = window.markerMap[initSelected];
      window.map.setView(e.latlng, 15);
      e.marker.openPopup();
    }
  </script>
</body>
</html>`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);

  return (
    <View
      className="flex-1 overflow-hidden bg-white"
      style={{ borderRadius: 24, borderWidth: 1, borderColor: "#D8E1EE" }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between gap-3 px-4 pt-4 pb-2.5">
        <View className="flex-1">
          <Text className="text-[17px] font-extrabold tracking-[-0.3px] text-slate-900">
            Nearby on map
          </Text>
          <Text className="mt-1 text-xs text-slate-500">
            Browse PGs, messes, and hostels near you.
          </Text>
        </View>

        {onUseMyLocation ? (
          <TouchableOpacity
            onPress={onUseMyLocation}
            activeOpacity={0.85}
            className="flex-row items-center gap-1.5 rounded-full border px-3 py-2"
            style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}
          >
            <Ionicons
              name={hasUserLocation ? "locate" : "locate-outline"}
              size={14}
              color="#2563EB"
            />
            <Text className="text-xs font-extrabold text-blue-600">
              Use my location
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Map */}
      <View style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          source={{ html }}
          style={{ flex: 1 }}
          scrollEnabled={false}
          bounces={false}
          originWhitelist={["*"]}
          mixedContentMode="always"
          javaScriptEnabled
          domStorageEnabled
          onMessage={(event) => {
            try {
              const parsed = JSON.parse(event.nativeEvent.data) as {
                type: string;
                id: string;
              };
              if (parsed.type === "select") {
                const property = properties.find((p) => p.id === parsed.id);
                if (property) onSelect(property);
              }
            } catch {
              // ignore
            }
          }}
        />
      </View>
    </View>
  );
}
