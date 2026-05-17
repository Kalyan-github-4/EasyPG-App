import React from "react";
import { View, Text } from "react-native";

export default function StatCard({
  icon,
  value,
  label,
  bg,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  bg: string;
}) {
  return (
    <View className="flex-1 p-4 bg-white border rounded-xl border-slate-100">
      <View
        className="w-9.5 h-9.5 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </View>
      <Text className="text-[22px] font-extrabold text-slate-900 tracking-[-0.5px]">
        {value}
      </Text>
      <Text className="text-[11px] text-slate-600 font-semibold mt-0.5 tracking-[0.2px]">
        {label}
      </Text>
    </View>
  );
}