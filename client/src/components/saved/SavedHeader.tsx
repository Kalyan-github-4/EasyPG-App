import React from "react";
import { View, Text } from "react-native";
type Props = {
  count: number;
  priceRange: string;
};

export default function SavedHeader({

  count,
  priceRange,
}: Props) {
  return (
    <View
      className="px-6 pt-3 pb-1 flex-row justify-between items-end z-20"
    >
      <View className="flex-1">
        <Text className="text-[28px] font-extrabold text-slate-900 tracking-[-0.5px]">
          Saved
        </Text>
        <Text className="text-[13px] text-slate-400 mt-0.75">
          {count} PG{count !== 1 ? "s" : ""}
          {priceRange ? ` · ${priceRange}` : ""}
        </Text>
      </View>
    </View>
  );
}