import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";

type CityFilter = {
  id: string;
  name: string;
  image: ImageSourcePropType;
  count?: number;
};

type Props = {
  cities: CityFilter[];
  selectedCityId?: string;
  onSelectCity: (cityId: string) => void;
};

export default function CircularCityFilters({
  cities,
  selectedCityId,
  onSelectCity,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
      style={{ marginVertical: 8 }}
    >
      {/* ── City chips ── */}
      {cities.map((city) => {
        const isSelected = selectedCityId === city.id;
        return (
          <TouchableOpacity
            key={city.id}
            onPress={() => onSelectCity(city.id)}
            activeOpacity={0.7}
            style={{ alignItems: "center", gap: 8 }}
          >
            <View style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "#F1F5F9",
              borderWidth: isSelected ? 3 : 1.5,
              borderColor: isSelected ? "#2563EB" : "#E2E8F0",
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isSelected ? 0.2 : 0.05,
              shadowRadius: 4,
              elevation: isSelected ? 5 : 1,
            }}>
              <Image
                source={city.image}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{
                fontSize: 12,
                fontWeight: isSelected ? "600" : "500",
                color: isSelected ? "#2563EB" : "#475569",
                textAlign: "center",
              }}>
                {city.name}
              </Text>
              {city.count !== undefined && (
                <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
                  {city.count} PGs
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
