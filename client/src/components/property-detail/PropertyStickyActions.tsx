import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import {
  CalendarCheckIcon,
  ChatCircleIcon,
} from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  isHostOfThis: boolean;
  phone?: string | null;
  isAvailable: boolean;
  propertyName?: string;
  onBook: () => void;
};

export default function PropertyStickyActions({
  isHostOfThis,
  phone,
  isAvailable,
  propertyName,
  onBook,
}: Props) {
  const insets = useSafeAreaInsets();

  if (isHostOfThis) return null;

  const handleWhatsApp = async () => {
    try {
      if (!phone) {
        Alert.alert("Phone number unavailable");
        return;
      }

      // Remove spaces, +, -, etc.
      let cleanPhone = phone.replace(/[^\d]/g, "");

      if (cleanPhone.length === 10) {
        cleanPhone = `91${cleanPhone}`;
      }

      const message =
        `Hi, I'm interested in your property` +
        `${propertyName ? ` "${propertyName}"` : ""} on EasyPG.\n\n` +
        `Can I schedule a visit?`;

      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        message
      )}`;

      await Linking.openURL(whatsappUrl);
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Unable to open WhatsApp",
        "Please make sure WhatsApp is installed."
      );
    }
  };

  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 12),
      }}
      className="absolute bottom-0 left-0 right-0 px-4 pt-3 bg-white border-t border-slate-100"
    >
      <View className="flex-row gap-2.5">
        {/* WhatsApp CTA */}
        {!!phone && (
          <TouchableOpacity
            onPress={handleWhatsApp}
            activeOpacity={0.85}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-[#1FA855] py-3.5"
          >
            <ChatCircleIcon size={18} color="#1FA855" weight="bold" />

            <Text className="text-[15px] font-bold text-[#1FA855]">
              WhatsApp
            </Text>
          </TouchableOpacity>
        )}

        {/* Request Visit CTA */}
        <TouchableOpacity
          onPress={onBook}
          activeOpacity={0.85}
          disabled={!isAvailable}
          className={`flex-row items-center justify-center gap-2 rounded-2xl py-3.5 ${phone ? "flex-[1.3]" : "flex-1"
            } ${isAvailable ? "bg-blue-600" : "bg-slate-300"}`}
        >
          <CalendarCheckIcon size={18} color="#fff" weight="bold" />

          <Text className="text-[15px] font-bold text-white">
            {isAvailable ? "Request Visit" : "Unavailable"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}