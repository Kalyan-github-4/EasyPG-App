import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-5 mb-3.5">
      <Text className="text-lg font-extrabold text-slate-900 tracking-[-0.4px]">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text className="text-[13px] text-blue-600 font-bold">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}