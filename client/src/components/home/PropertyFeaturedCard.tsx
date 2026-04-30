import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { MapPin, House, Heart, ShieldCheck, Star } from "phosphor-react-native";
import { CARD_WIDTH } from "@/src/data/constants";
import type { Property } from "@/src/services/api";

type Props = {
  property: Property;
  saved?: boolean;
  onSave?: () => void;
  onPress?: () => void;
};

export default function PropertyFeaturedCard({
  property,
  saved = false,
  onSave,
  onPress,
}: Props) {
  const cover = property.photos[0]?.url;

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={
        onPress ??
        (() =>
          router.push({ pathname: "/(app)/pg/[id]", params: { id: property.id } }))
      }
      style={{
        width: CARD_WIDTH,
        height: 220,
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      {cover ? (
        <Image
          source={{ uri: cover }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: "#E2E8F0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <House size={40} color="#94A3B8" weight="duotone" />
        </View>
      )}

      {/* Top-left badges (stacked) */}
      <View
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          gap: 6,
        }}
      >
        {property.isTrusted ? (
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              alignSelf: "flex-start",
            }}
          >
            <ShieldCheck size={11} color="#2563EB" weight="fill" />
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#2563EB" }}>
              EasyPG Trusted
            </Text>
          </View>
        ) : null}
      </View>



      {/* Save (heart) button */}
      {onSave ? (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            if(onSave) onSave();
          }}
          hitSlop={8}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: 8,
            backgroundColor: saved ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.35)",
            borderRadius: 20,
            zIndex: 10,
          }}
        >
          <Heart
            size={16}
            color={saved ? "#EF4444" : "#fff"}
            weight={saved ? "fill" : "regular"}
          />
        </TouchableOpacity>
      ) : null}

      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.82)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 14,
          paddingTop: 48,
          paddingBottom: 14,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: "#fff",
              fontSize: 15,
              fontWeight: "800",
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
              }}
            >
              <Star size={10} color="#FBBF24" weight="fill" />
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#fff" }}>
                {property.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              flex: 1,
              marginRight: 8,
            }}
          >
            <MapPin size={11} color="rgba(255,255,255,0.65)" weight="fill" />
            <Text
              numberOfLines={1}
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 11,
                fontWeight: "500",
              }}
            >
              {property.location}
            </Text>
          </View>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>
            ₹{property.rent.toLocaleString("en-IN")}
            <Text
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: 11,
                fontWeight: "400",
              }}
            >
              /mo
            </Text>
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
