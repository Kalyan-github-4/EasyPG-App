import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { HouseIcon, PhoneIcon } from "phosphor-react-native";

import type { Property } from "@/src/services/api";
import PropertyDetailSection from "./PropertyDetailSection";

type Props = {
  property: Property;
  isHostOfThis: boolean;
  onCall: () => void;
};

export default function PropertyHostCard({
  property,
  isHostOfThis,
  onCall,
}: Props) {
  return (
    <PropertyDetailSection title="Listed by">
      <View className="flex-row items-center gap-3 p-4 bg-white border rounded-2xl border-slate-200">
        {property.host?.avatarUrl ? (
          <Image
            source={{ uri: property.host.avatarUrl }}
            className="w-12 h-12 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
            <HouseIcon size={22} color="#fff" weight="fill" />
          </View>
        )}

        <View className="flex-1">
          <Text className="text-sm font-extrabold text-slate-900">
            {property.host?.name || "Property Host"}
          </Text>

          <Text className="mt-0.5 text-xs text-slate-500">
            {property.host?.phone
              ? "Call, message, or request a visit"
              : "Message or request a visit to get in touch"}
          </Text>
        </View>

        {property.host?.phone && !isHostOfThis ? (
          <TouchableOpacity
            onPress={onCall}
            activeOpacity={0.85}
            className="items-center justify-center w-10 h-10 bg-teal-600 rounded-full"
          >
            <PhoneIcon size={18} color="#fff" weight="fill" />
          </TouchableOpacity>
        ) : null}
      </View>
    </PropertyDetailSection>
  );
}