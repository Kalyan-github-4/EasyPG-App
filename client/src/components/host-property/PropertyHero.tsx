import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CaretLeft, ImageSquare } from "phosphor-react-native";
import type { Property } from "@/src/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = Math.round((SCREEN_WIDTH * 9) / 16);

type Props = {
  property: Property;
  onBack: () => void;
};

export default function PropertyHero({ property, onBack }: Props) {
  const photos = property.photos;
  const hasPhotos = photos.length > 0;

  return (
    <View style={{ backgroundColor: "#0F172A" }}>
      <View style={{ height: HERO_HEIGHT, backgroundColor: "#E2E8F0" }}>
        {hasPhotos ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {photos.map((p) => (
              <Image
                key={p.id}
                source={{ uri: p.url }}
                style={{ width: SCREEN_WIDTH, height: HERO_HEIGHT }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ImageSquare size={36} color="#94A3B8" />
            <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 8 }}>
              No photos yet
            </Text>
          </View>
        )}

        {/* Dark gradient overlay for back button contrast */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
          pointerEvents="none"
        />

        {/* Back button */}
        <SafeAreaView
          edges={["top"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0 }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={onBack}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "rgba(255,255,255,0.9)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CaretLeft size={18} color="#0F172A" weight="bold" />
            </TouchableOpacity>

            {hasPhotos && photos.length > 1 ? (
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.55)",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 11, color: "#fff", fontWeight: "700" }}>
                  {photos.length} photos
                </Text>
              </View>
            ) : null}
          </View>
        </SafeAreaView>

        {/* Status badge — bottom-left */}
        <View
          style={{
            position: "absolute",
            bottom: 12,
            left: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: property.isAvailable ? "#10B981" : "#64748B",
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 7,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#fff",
            }}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "800",
              color: "#fff",
              letterSpacing: 0.5,
            }}
          >
            {property.isAvailable ? "AVAILABLE" : "FULL"}
          </Text>
        </View>
      </View>
    </View>
  );
}
