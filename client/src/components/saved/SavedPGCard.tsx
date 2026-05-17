import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Heart,
  Star,
  MapPin,
  CaretRight,
  GenderFemale,
  GenderMale,
  UsersThree,
} from "phosphor-react-native";
import { router } from "expo-router";
import { PGListing } from "@/src/data/pgData";
import VerificationBadge from "@/src/components/home/VerificationBadge";
import { AMENITY_ICONS } from "./types";

type Props = {
  pg: PGListing;
  onRemove: () => void;
};

export default function SavedPGCard({ pg, onRemove }: Props) {

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push({ pathname: "/(app)/pg/[id]", params: { id: pg.id } })}
      className="bg-white rounded-2xl overflow-hidden mb-3.5 shadow-md shadow-slate-900/6 elevation-3"
      style={{
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      }}
    >
      {/* Image */}
      <View className="h-45">
        <Image source={pg.image} className="w-full h-full" resizeMode="cover" />

        {/* Top overlay row */}
        <View className="absolute flex-row items-start justify-between top-3 left-3 right-3">
          <VerificationBadge level={pg.verification} />
          <TouchableOpacity
            onPress={onRemove}
            hitSlop={8}
            className="items-center justify-center rounded-full shadow-md w-9 h-9 bg-white/95 elevation-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 4,
            }}
          >
            <Heart size={18} color="#EF4444" weight="fill" />
          </TouchableOpacity>
        </View>

        {/* Bottom gradient */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.75)"]}
          className="absolute bottom-0 left-0 right-0 px-3.5 pb-3 pt-12.5 flex-row justify-between items-end"
        >
          <View className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-black/40">
            <Star size={11} color="#FACC15" weight="fill" />
            <Text className="text-xs font-extrabold text-white">{pg.rating}</Text>
            <Text className="text-white/70 text-[11px]">({pg.reviewCount})</Text>
          </View>
          <Text className="text-xl font-black text-white">
            ₹{pg.rent.toLocaleString("en-IN")}
            <Text className="text-[11px] font-medium text-white/70">/mo</Text>
          </Text>
        </LinearGradient>
      </View>

      {/* Content */}
      <View className="p-4">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            className="text-base font-extrabold text-slate-900 flex-1 tracking-[-0.3px]"
            numberOfLines={1}
          >
            {pg.name}
          </Text>
          <View className="flex-row items-center gap-1 px-2 py-1 rounded-lg">
            {/* <GenderIcon size={11} color={genderTheme.fg} weight="bold" />
            <Text className="text-[10px] font-bold" style={{ color: genderTheme.fg }}>
              {genderTheme.label}
            </Text> */}
          </View>
        </View>

        <View className="flex-row items-center gap-1 mt-1.5">
          <MapPin size={12} color="#94A3B8" weight="regular" />
          <Text
            className="flex-1 text-xs font-medium text-slate-600"
            numberOfLines={1}
          >
            {pg.location}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 pt-3 mt-3 border-t border-t-slate-100">
          {pg.amenities.slice(0, 5).map((a) => {
            const AmenityIcon = AMENITY_ICONS[a];
            if (!AmenityIcon) return null;
            return (
              <View
                key={a}
                className="w-7.5 h-7.5 rounded-lg bg-slate-50 items-center justify-center"
              >
                <AmenityIcon size={14} color="#64748B" weight="regular" />
              </View>
            );
          })}
          {pg.amenities.length > 5 && (
            <Text className="text-xs font-bold text-slate-400 ml-0.5">
              +{pg.amenities.length - 5}
            </Text>
          )}
          <View className="flex-1" />
          <CaretRight size={18} color="#CBD5E1" weight="bold" />
        </View>
      </View>
    </TouchableOpacity>
  );
}