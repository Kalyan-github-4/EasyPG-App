import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Heart,
  Star,
  MapPin,
  CaretRight,
  House,
  ImageSquare,
  CurrencyInr,
  ShieldCheck,
} from "phosphor-react-native";
import { router } from "expo-router";
import type { Property } from "@/src/services/api";

const FACILITY_LABELS: Record<string, string> = {
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

type Props = {
  property: Property;
  onRemove: () => void;
};

export default function SavedPGCard({ property, onRemove }: Props) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageWidth, setImageWidth] = useState(320);

  const facilityLabels = (property.facilities || [])
    .slice(0, 4)
    .map((f) => FACILITY_LABELS[f] || f);

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
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        shadowColor: "#1e3a8a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* ── Image Section ── */}
      <View
        style={{ height: 180 }}
        onLayout={(e) => setImageWidth(e.nativeEvent.layout.width)}
      >
        {property.photos && property.photos.length > 0 ? (
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

        {/* Top-left: Trusted badge */}
        {property.isTrusted ? (
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ShieldCheck size={11} color="#2563EB" weight="fill" />
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#2563EB" }}>
              EasyPG Trusted
            </Text>
          </View>
        ) : null}

        {/* Top-right: Remove (heart) button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onRemove();
          }}
          hitSlop={8}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: 8,
            backgroundColor: "rgba(255,255,255,0.92)",
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Heart size={16} color="#EF4444" weight="fill" />
        </TouchableOpacity>

        {/* Photo count badge */}
        {property.photos && property.photos.length > 1 ? (
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
        {property.photos && property.photos.length > 1 ? (
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
            {property.rent?.toLocaleString("en-IN")}
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

      {/* ── Content Section ── */}
      <View style={{ padding: 14 }}>
        {/* Name + Rating */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: "#0F172A",
              letterSpacing: -0.3,
              flexShrink: 1,
            }}
          >
            {property.name}
          </Text>
          {property.rating > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                backgroundColor: "#FFFBEB",
                borderRadius: 8,
                paddingHorizontal: 7,
                paddingVertical: 3,
              }}
            >
              <Star size={10} color="#F59E0B" weight="fill" />
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#000" }}>
                {Number(property.rating).toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Location */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 5,
          }}
        >
          <MapPin size={13} color="#94A3B8" weight="fill" />
          <Text
            numberOfLines={1}
            style={{
              fontSize: 12,
              color: "#64748B",
              fontWeight: "500",
              flex: 1,
            }}
          >
            {property.location}
          </Text>
        </View>

        {/* Facilities */}
        {facilityLabels.length > 0 ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 12,
              paddingTop: 12,
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
            {(property.facilities || []).length > 4 ? (
              <Text
                style={{ fontSize: 11, color: "#94A3B8", fontWeight: "600" }}
              >
                +{(property.facilities || []).length - 4}
              </Text>
            ) : null}
            <View style={{ flex: 1 }} />
            <CaretRight size={16} color="#CBD5E1" weight="bold" />
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: "#F1F5F9",
            }}
          >
            <CaretRight size={16} color="#CBD5E1" weight="bold" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}