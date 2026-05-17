import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

export default function QuickAction({
  icon,
  label,
  bg,
  badge,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="items-center w-20 gap-2"
    >
      <View
        className="relative items-center justify-center w-14 h-14 rounded-xl"
        style={{ backgroundColor: bg }}
      >
        {icon}
        {badge ? (
          <View
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1.25 rounded-full bg-red-500 border-2 border-slate-100 items-center justify-center"
          >
            <Text className="text-[10px] font-extrabold text-white">
              {badge > 9 ? "9+" : badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        className="text-[11px] font-bold text-slate-700 text-center"
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}