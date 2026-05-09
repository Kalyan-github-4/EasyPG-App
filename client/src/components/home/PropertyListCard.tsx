import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { MapPin, CurrencyInr, House, ImageSquare } from "phosphor-react-native";
import type { Property } from "@/src/services/api";

type Props = {
  property: Property;
  /** Optional distance in km (shown as badge when searching by location) */
  distanceKm?: number;
};

export default function PropertyListCard({ property, distanceKm }: Props) {
  const facilityLabels = property.facilities.slice(0, 3).map(formatFacility);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageWidth, setImageWidth] = useState(320);

  const handleImageScroll = (e: any) => {
    const width = e.nativeEvent.layoutMeasurement.width || 1;
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveImageIndex(next);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={() =>
        router.push({ pathname: "/(app)/pg/[id]", params: { id: property.id } })
      }
      style={{
        backgroundColor: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        shadowColor: "#1e3a8a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Image */}
      <View
        style={{ height: 170 }}
        onLayout={(e) => setImageWidth(e.nativeEvent.layout.width)}
      >
        {property.photos.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleImageScroll}
          >
            {property.photos.map((photo) => (
              <Image
                key={photo.id}
                source={{ uri: photo.url }}
                style={{ width: imageWidth, height: "100%" }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <House size={36} color="#94A3B8" weight="duotone" />
          </View>
        )}

        {/* Photo count badge */}
        {property.photos.length > 1 ? (
          <View
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "rgba(0,0,0,0.55)",
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <ImageSquare size={12} color="#fff" weight="fill" />
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>
              {property.photos.length}
            </Text>
          </View>
        ) : null}

        {/* Dot indicators */}
        {property.photos.length > 1 ? (
          <View
            style={{
              position: "absolute",
              bottom: 12,
              alignSelf: "center",
              flexDirection: "row",
              gap: 5,
            }}
          >
            {property.photos.map((photo, idx) => (
              <View
                key={photo.id}
                style={{
                  width: idx === activeImageIndex ? 14 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    idx === activeImageIndex ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </View>
        ) : null}

        {/* Price overlay */}
        <View
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            backgroundColor: "rgba(0,0,0,0.55)",
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 5,
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CurrencyInr size={14} color="#fff" weight="bold" />
          <Text style={{ fontSize: 16, fontWeight: "900", color: "#fff" }}>
            {property.rent.toLocaleString("en-IN")}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.7)",
              fontWeight: "500",
            }}
          >
            /mo
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ padding: 14 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: "#0F172A",
            letterSpacing: -0.3,
          }}
        >
          {property.name}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
          }}
        >
          <MapPin size={13} color="#94A3B8" weight="fill" />
          <Text
            numberOfLines={1}
            style={{ fontSize: 12, color: "#64748B", fontWeight: "500", flex: 1 }}
          >
            {property.location}
          </Text>
          {distanceKm != null ? (
            <View
              style={{
                backgroundColor: "#EFF6FF",
                borderRadius: 8,
                paddingHorizontal: 7,
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#2563EB" }}>
                {distanceKm < 1
                  ? `${Math.round(distanceKm * 1000)} m`
                  : `${distanceKm.toFixed(1)} km`}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Facilities */}
        {facilityLabels.length > 0 ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: "#F1F5F9",
            }}
          >
            {facilityLabels.map((f) => (
              <View
                key={f}
                style={{
                  backgroundColor: "#EFF6FF",
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: "600", color: "#2563EB" }}
                >
                  {f}
                </Text>
              </View>
            ))}
            {property.facilities.length > 3 ? (
              <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "600" }}>
                +{property.facilities.length - 3}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function formatFacility(f: string): string {
  const map: Record<string, string> = {
    wifi: "WiFi",
    ac: "AC",
    food: "Food",
    laundry: "Laundry",
    parking: "Parking",
    security: "Security",
    gym: "Gym",
    power_backup: "Power",
    water_supply: "Water",
    furnished: "Furnished",
    cctv: "CCTV",
  };
  return map[f] || f;
}
