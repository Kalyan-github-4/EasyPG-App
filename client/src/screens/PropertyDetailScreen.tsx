import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { HouseIcon, MapPinIcon } from "phosphor-react-native";

import * as api from "@/src/services/api";
import { useAppAuth } from "@/src/context/auth-context";
import NewInquirySheet from "@/src/components/inbox/NewInquirySheet";
import BookingRequestSheet from "@/src/components/booking/BookingRequestSheet";
import PropertyDetailHero from "@/src/components/property-detail/PropertyDetailHero";
import PropertyDetailSummaryCard from "@/src/components/property-detail/PropertyDetailSummaryCard";
import PropertyDetailSection from "@/src/components/property-detail/PropertyDetailSection";
import PropertyFacilitiesSection from "@/src/components/property-detail/PropertyFacilitiesSection";
import PropertyHostCard from "@/src/components/property-detail/PropertyHostCard";
import PropertyStickyActions from "@/src/components/property-detail/PropertyStickyActions";
import PropertyLocationMap from "../components/property/PropertyLocationMap";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();
  const { dbUser } = useAppAuth();

  const [property, setProperty] = useState<api.Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [showInquirySheet, setShowInquirySheet] = useState(false);
  const [showBookingSheet, setShowBookingSheet] = useState(false);

  const isGuest = dbUser?.role === "guest";

  const load = useCallback(async () => {
    try {
      setError(null);
      const token = isGuest ? await getToken() : null;
      const [p, savedIds] = await Promise.all([
        api.getProperty(id),
        token
          ? api.listSavedIds(token).catch(() => [] as string[])
          : Promise.resolve([] as string[]),
      ]);
      setProperty(p);
      setSaved(savedIds.includes(p.id));
    } catch (err: any) {
      setError(err?.message || "Couldn't load property");
    } finally {
      setLoading(false);
    }
  }, [id, isGuest, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const isHostOfThis = dbUser?.id === property?.hostId;

  const handleToggleSave = async () => {
    if (!property || savingToggle) return;
    if (!isGuest) {
      Alert.alert(
        "Switch to guest",
        "Saving is for guests. Switch to guest view from your profile."
      );
      return;
    }
    if (isHostOfThis) {
      Alert.alert("That's your property", "You can't save your own listing.");
      return;
    }
    const next = !saved;
    setSaved(next); // optimistic
    setSavingToggle(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      if (next) await api.saveProperty(token, property.id);
      else await api.unsaveProperty(token, property.id);
    } catch (err: any) {
      setSaved(!next); // revert
      Alert.alert("Error", err?.message || "Couldn't update");
    } finally {
      setSavingToggle(false);
    }
  };

  // ─── Loading ──────────────────────────────────
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // ─── Error / not found ────────────────────────
  if (error || !property) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC",
          paddingHorizontal: 32,
        }}
      >
        <HouseIcon size={48} color="#CBD5E1" weight="duotone" />
        <Text
          style={{
            marginTop: 12,
            fontSize: 16,
            color: "#94A3B8",
            textAlign: "center",
          }}
        >
          {error || "Property not found"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 16,
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: "#2563EB",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${property.name} — ₹${property.rent.toLocaleString("en-IN")}/month\n${property.location}`,
      });
    } catch {}
  };

  const handleDirections = () => {
    if (typeof property.latitude === "number" && typeof property.longitude === "number") {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`
      );
    } else {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`
      );
    }
  };

  const handleCall = () => {
    const phone = property?.host?.phone;
    if (!phone) {
      Alert.alert(
        "Phone unavailable",
        "The host hasn't shared a contact number. Try messaging them instead."
      );
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Couldn't start call", "Please dial manually.")
    );
  };

  const handleMessage = () => {
    if (!isGuest) {
      Alert.alert(
        "Switch to guest",
        "Only guests can message hosts. Switch to guest view from your profile."
      );
      return;
    }
    if (isHostOfThis) {
      Alert.alert("That's your property", "You can't message yourself.");
      return;
    }
    setShowInquirySheet(true);
  };

  const handleBook = () => {
    if (!isGuest) {
      Alert.alert(
        "Switch to guest",
        "Only guests can request visits. Switch to guest view from your profile."
      );
      return;
    }
    if (isHostOfThis) {
      Alert.alert("That's your property", "You can't book your own listing.");
      return;
    }
    if (!property.isAvailable) {
      Alert.alert("Not available", "This property is currently full.");
      return;
    }
    setShowBookingSheet(true);
  };

  const BOTTOM_BAR_HEIGHT = 76 + insets.bottom;
  const coordinates =
    typeof property.latitude === "number" &&
    typeof property.longitude === "number"
      ? { latitude: property.latitude, longitude: property.longitude }
      : null;
  const hasCoordinates = coordinates !== null;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: BOTTOM_BAR_HEIGHT + 16 }}
      >
        <PropertyDetailHero
          property={property}
          saved={saved}
          savingToggle={savingToggle}
          imgIndex={imgIndex}
          onImageScroll={(e) => {
            const slideWidth = e.nativeEvent.layoutMeasurement.width || 1;
            const idx = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
            setImgIndex(idx);
          }}
          onBack={() => router.back()}
          onToggleSave={handleToggleSave}
          onShare={handleShare}
          topInset={insets.top}
        />

        <PropertyDetailSummaryCard property={property} />

        {property.description ? (
          <PropertyDetailSection title="About this place">
            <Text style={{ fontSize: 14, color: "#475569", lineHeight: 22 }}>
              {property.description}
            </Text>
          </PropertyDetailSection>
        ) : null}

        <PropertyFacilitiesSection facilities={property.facilities} />

        <PropertyDetailSection title="Location">
          <View
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 16,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: "#EFF6FF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MapPinIcon size={20} color="#2563EB" weight="fill" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#0F172A",
                  marginBottom: 2,
                }}
                numberOfLines={2}
              >
                {property.location}
              </Text>
              {hasCoordinates ? (
                <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                  {coordinates.latitude.toFixed(4)}, {" "}
                  {coordinates.longitude.toFixed(4)}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={handleDirections}
              activeOpacity={0.85}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "#2563EB",
                paddingHorizontal: 12,
                paddingVertical: 9,
                borderRadius: 10,
              }}
            >
              <Ionicons name="navigate" size={13} color="#fff" />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>
                Directions
              </Text>
            </TouchableOpacity>
          </View>
        </PropertyDetailSection>

        {hasCoordinates ? (
          <PropertyLocationMap
            latitude={coordinates.latitude}
            longitude={coordinates.longitude}
            location={property.location}
            onDirections={handleDirections}
          />
        ) : null}

        <PropertyHostCard
          property={property}
          isHostOfThis={isHostOfThis}
          onCall={handleCall}
        />
      </ScrollView>

      <PropertyStickyActions
        isHostOfThis={isHostOfThis}
        hasPhone={Boolean(property.host?.phone)}
        isAvailable={property.isAvailable}
        onCall={handleCall}
        onMessage={handleMessage}
        onBook={handleBook}
      />

      {/* Inquiry sheet */}
      <NewInquirySheet
        visible={showInquirySheet}
        presetProperty={property}
        onClose={() => setShowInquirySheet(false)}
        onCreated={(threadId) => {
          setShowInquirySheet(false);
          router.push(`/(app)/inbox/${threadId}` as any);
        }}
      />

      {/* Booking sheet */}
      <BookingRequestSheet
        visible={showBookingSheet}
        property={property}
        onClose={() => setShowBookingSheet(false)}
        onCreated={() => {
          setShowBookingSheet(false);
          router.push("/(app)/visits" as any);
        }}
      />
    </View>
  );
}
