import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Heart, Compass } from "phosphor-react-native";
import { router } from "expo-router";

export default function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-10">
      {/* Icon circle */}
      <View className="w-26 h-26 rounded-full bg-red-50 items-center justify-center mb-5.5">
        <View className="w-16 h-16 rounded-full bg-red-200 items-center justify-center">
          <Heart size={30} color="#EF4444" weight="regular" />
        </View>
      </View>

      {/* Title */}
      <Text className="text-xl font-extrabold text-slate-900 text-center">
        No saved PGs yet
      </Text>

      {/* Subtitle */}
      <Text className="text-sm text-slate-400 mt-2 text-center leading-5.25 max-w-[260px]">
        Tap the heart on any PG to save it. Compare your favorites here later.
      </Text>

      {/* CTA Button */}
      <TouchableOpacity
        onPress={() => router.navigate("/(app)/(tabs)")}
        activeOpacity={0.85}
        className="mt-6.5 flex-row items-center gap-2 bg-slate-900 rounded-xl px-6.5 py-3.5"
      >
        <Compass size={17} color="#fff" weight="regular" />
        <Text className="text-sm font-bold text-white tracking-[0.2px]">
          Explore PGs
        </Text>
      </TouchableOpacity>
    </View>
  );
}