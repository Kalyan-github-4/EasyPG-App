import React from "react";
import { View, Text } from "react-native";
import { MapPinIcon } from "phosphor-react-native";
import type { Property } from "@/src/services/api";

type Props = {
  property: Property;
};

export default function PropertyDetailSummaryCard({ property }: Props) {
  return (
    <View className="p-5 mx-4 -mt-6 bg-white shadow-lg rounded-3xl shadow-blue-900/5 elevation-6">
      <View className="flex-row justify-between items-center mb-2.5">
        <View
          className={`px-2.5 py-1.25 rounded-full ${
            property.isAvailable ? "bg-emerald-50" : "bg-red-50"
          }`}
        >
          <Text
            className={`text-[11px] font-extrabold tracking-wide ${
              property.isAvailable ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {property.isAvailable ? "AVAILABLE" : "FULL"}
          </Text>
        </View>
        <Text className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">
          {property.propertyType}
        </Text>
      </View>

      <Text className="text-[22px] font-extrabold text-slate-900 leading-7 mb-1.5 tracking-tight">
        {property.name}
      </Text>

      <View className="flex-row items-start gap-1">
        <View className="mt-0.5">
          <MapPinIcon size={14} color="#64748B" weight="fill"/>
        </View>
        <Text className="text-[13px] text-slate-600 flex-1 leading-5">
          {property.location}
        </Text>
      </View>

      <View className="flex-row items-center bg-blue-50 rounded-xl p-3.5 mt-4">
        <View className="flex-1">
          <Text className="text-[11px] text-slate-600 font-semibold mb-0.5">
            Monthly rent
          </Text>
          <Text className="text-[26px] font-black text-blue-600 tracking-tight">
            ₹{property.rent.toLocaleString("en-IN")}
            <Text className="text-[13px] font-medium text-slate-600">/mo</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}