import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TRENDING_CARD_WIDTH } from "@/src/data/constants";
import { TrendingPG } from "@/src/data/pgData";
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  pg: TrendingPG;
  saved: boolean;
  onSave: () => void;
};

// Using your EasyPG Design System colors
const colors = {
  brand: {
    primary: '#2563EB',
    'primary-light': '#3B82F6',
    surface: '#f8f9fa',
    card: '#ffffff',
    'on-surface': '#191c1d',
    'on-surface-muted': '#434655',
    outline: '#737686',
  },
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  overlay: 'rgba(0,0,0,0.4)',
};

export default function TrendingCard({ pg, saved, onSave }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push({ pathname: "/(app)/pg/[id]", params: { id: pg.id } })}
      style={{
        width: TRENDING_CARD_WIDTH,
        height: 120,
        flexDirection: "row",
        backgroundColor: colors.brand.card,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        shadowColor: colors.brand['on-surface'],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      }}
    >
      {/* Image Section */}
      <View style={{ width: 110, position: "relative", backgroundColor: colors.brand.surface }}>
        <Image 
          source={pg.image} 
          style={{ width: "100%", height: "100%" }} 
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
          }}
        />
        
        {/* Rating Badge on Image */}
        <View style={{
          position: "absolute",
          bottom: 6,
          left: 6,
          flexDirection: "row",
          alignItems: "center",
          gap: 3,
          backgroundColor: "rgba(0,0,0,0.65)",
          paddingHorizontal: 6,
          paddingVertical: 3,
          borderRadius: 6,
        }}>
          <Ionicons name="star" size={9} color={colors.warning} />
          <Text style={{ fontSize: 10, color: "#FFFFFF", fontWeight: "700" }}>
            {pg.rating.toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={{ 
        flex: 1, 
        paddingHorizontal: 12, 
        paddingVertical: 12, 
        justifyContent: "space-between" 
      }}>
        {/* Top Section: Name & Location */}
        <View>
          <Text 
            style={{ 
              fontSize: 14, 
              fontWeight: "800", 
              color: colors.brand['on-surface'], 
              marginBottom: 4,
              letterSpacing: -0.3,
            }} 
            numberOfLines={1}
          >
            {pg.name}
          </Text>
          
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="location-outline" size={11} color={colors.brand.outline} />
            <Text 
              style={{ 
                fontSize: 10.5, 
                color: colors.brand['on-surface-muted'], 
                fontWeight: "500",
                flex: 1,
              }} 
              numberOfLines={1}
            >
              {pg.location}
            </Text>
          </View>
        </View>

        {/* Bottom Section: Price & Save Button */}
        <View style={{ 
          flexDirection: "row", 
          alignItems: "flex-end", 
          justifyContent: "space-between",
          marginTop: 4,
        }}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: "900", 
                color: colors.brand.primary,
                letterSpacing: -0.5,
              }}>
                ₹{pg.rent.toLocaleString("en-IN")}
              </Text>
              <Text style={{ 
                fontSize: 10, 
                fontWeight: "500", 
                color: colors.brand.outline,
              }}>
                /month
              </Text>
            </View>
            
            {/* Availability Indicator */}
        
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                gap: 3, 
                marginTop: 2,
              }}>
                <View style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.success,
                }} />
                <Text style={{ 
                  fontSize: 9, 
                  color: colors.success, 
                  fontWeight: "600",
                }}>
                  Available Now
                </Text>
              </View>
          
          </View>

          {/* Save Button - Replacing View Button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onSave();
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: saved ? colors.error : colors.brand.surface,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: saved ? 0 : 1,
              borderColor: "#E2E8F0",
              shadowColor: colors.brand['on-surface'],
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 1,
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={18}
              color={saved ? "#FFFFFF" : colors.brand.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}