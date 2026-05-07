import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import {
  MapPin,
  PencilSimple,
  Trash,
  ChatCircleDots,
  Eye,
  CurrencyInr,
  ImageSquare,
  UsersThree,
} from "phosphor-react-native";

import * as api from "@/src/services/api";
import PropertyHero from "@/src/components/host-property/PropertyHero";
import ActionRow from "@/src/components/host-property/ActionRow";
import DetailSection from "@/src/components/host-property/DetailSection";
import AmenityPill from "@/src/components/host-property/AmenityPill";
import PhotoGrid from "@/src/components/host-property/PhotoGrid";
import StatCard from "@/src/components/host-property/StatCard";
import HostPropertySkeleton from "@/src/components/host-property/HostPropertySkeleton";
import PropertyLocationMap from "@/src/components/property/PropertyLocationMap";

export default function HostPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getToken } = useAuth();

  const [property, setProperty] = useState<api.Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const p = await api.getProperty(id);
      setProperty(p);
    } catch (err: any) {
      setError(err?.message || "Couldn't load this property");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  // ─── Availability toggle ──────────────────────────
  const toggleAvailability = useCallback(
    async (nextValue: boolean) => {
      if (!property || togglingAvailability) return;
      setTogglingAvailability(true);
      // Optimistic update
      setProperty({ ...property, isAvailable: nextValue });
      try {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const updated = await api.updateProperty(token, property.id, {
          isAvailable: nextValue,
        });
        setProperty(updated);
      } catch (err: any) {
        // Revert on failure
        setProperty({ ...property, isAvailable: !nextValue });
        Alert.alert("Couldn't update", err?.message || "Please try again.");
      } finally {
        setTogglingAvailability(false);
      }
    },
    [property, togglingAvailability, getToken]
  );

  // ─── Delete ───────────────────────────────────────
  const confirmDelete = useCallback(() => {
    if (!property) return;
    Alert.alert(
      "Delete this property?",
      `"${property.name}" will be permanently removed along with its photos. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              const token = await getToken();
              if (!token) throw new Error("Not authenticated");
              await api.deleteProperty(token, property.id);
              router.back();
            } catch (err: any) {
              Alert.alert(
                "Couldn't delete",
                err?.message || "Please try again."
              );
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [property, getToken]);

  // ─── Navigation ───────────────────────────────────
  const goToEdit = () => {
    if (!property) return;
    router.push(`/(app)/host/property/${property.id}/edit` as any);
  };

  const goToInquiries = () => {
    if (!property) return;
    router.push(`/(app)/inbox?propertyId=${property.id}` as any);
  };

  const goToMembers = () => {
    if (!property) return;
    router.push(`/(app)/host/property/${property.id}/members` as any);
  };

  const goToEditLocation = () => {
    if (!property) return;
    router.push(`/(app)/host/property/${property.id}/edit` as any);
  };

  // ─── Loading ──────────────────────────────────────
  if (loading && !refreshing) {
    return <HostPropertySkeleton />;
  }

  // ─── Error / not found ────────────────────────────
  if (!property) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F8FAFC",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>
          Property not found
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "#64748B",
            marginTop: 6,
            textAlign: "center",
          }}
        >
          {error || "We couldn't load this property."}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            backgroundColor: "#0F172A",
            paddingHorizontal: 18,
            paddingVertical: 11,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff" }}>
            Go back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
      >
        <PropertyHero property={property} onBack={() => router.back()} />

        {/* Title block */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#0F172A",
              letterSpacing: -0.3,
            }}
          >
            {property.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              marginTop: 6,
            }}
          >
            <MapPin size={13} color="#64748B" weight="fill" />
            <Text style={{ flex: 1, fontSize: 13, color: "#64748B" }}>
              {property.location}
            </Text>
          </View>
        </View>

        {typeof property.latitude === "number" && typeof property.longitude === "number" ? (
          <DetailSection title="Location & map">
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                overflow: "hidden",
              }}
            >
              <View style={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A" }}>
                  Mini map preview
                </Text>
                <Text style={{ fontSize: 12, color: "#64748B", marginTop: 3, lineHeight: 17 }}>
                  Tap edit to adjust the pin or address.
                </Text>
              </View>
              <PropertyLocationMap
                latitude={property.latitude}
                longitude={property.longitude}
                location={property.location}
                onDirections={goToEditLocation}
                actionLabel="Edit location"
              />
            </View>
          </DetailSection>
        ) : (
          <DetailSection title="Location & map">
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                padding: 14,
                gap: 10,
              }}
            >
              <Text style={{ fontSize: 13, color: "#334155", lineHeight: 20 }}>
                This property doesn't have a saved map pin yet. Add one from edit.
              </Text>
              <TouchableOpacity
                onPress={goToEditLocation}
                activeOpacity={0.85}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#2563EB",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                  Add location
                </Text>
              </TouchableOpacity>
            </View>
          </DetailSection>
        )}

        {/* Quick stats */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 20,
            marginTop: 16,
          }}
        >
          <StatCard
            Icon={CurrencyInr}
            iconColor="#2563EB"
            value={`₹${property.rent.toLocaleString("en-IN")}`}
            label="Per month"
          />
          <StatCard
            Icon={ImageSquare}
            iconColor="#10B981"
            value={String(property.photos.length)}
            label={property.photos.length === 1 ? "Photo" : "Photos"}
          />
          <StatCard
            Icon={Eye}
            iconColor="#F59E0B"
            value="—"
            label="Views"
          />
        </View>

        {/* Manage section */}
        <DetailSection title="Manage">
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#F1F5F9",
              overflow: "hidden",
            }}
          >
            <ActionRow
              Icon={Eye}
              iconColor="#10B981"
              iconBg="#ECFDF5"
              label="Availability"
              description={
                property.isAvailable
                  ? "Visible to guests"
                  : "Hidden — marked as full"
              }
              toggle={{
                value: property.isAvailable,
                onChange: toggleAvailability,
              }}
              loading={togglingAvailability}
            />
            <Separator />
            <ActionRow
              Icon={UsersThree}
              iconColor="#7C3AED"
              iconBg="#F5F3FF"
              label="Members"
              description="View tenants & payments"
              onPress={goToMembers}
            />
            <Separator />
            <ActionRow
              Icon={PencilSimple}
              iconColor="#2563EB"
              iconBg="#EFF6FF"
              label="Edit property"
              description="Update details, photos, amenities"
              onPress={goToEdit}
            />
            <Separator />
            <ActionRow
              Icon={ChatCircleDots}
              iconColor="#F59E0B"
              iconBg="#FFFBEB"
              label="Inquiries"
              description="Messages from guests"
              onPress={goToInquiries}
            />
          </View>
        </DetailSection>

        {/* About */}
        {property.description ? (
          <DetailSection title="About">
            <Text
              style={{
                fontSize: 13,
                lineHeight: 20,
                color: "#334155",
              }}
            >
              {property.description}
            </Text>
          </DetailSection>
        ) : null}

        {/* Amenities */}
        <DetailSection title={`Amenities (${property.facilities.length})`}>
          {property.facilities.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {property.facilities.map((f) => (
                <AmenityPill key={f} facility={f} />
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: 12, color: "#94A3B8" }}>
              No amenities listed yet.
            </Text>
          )}
        </DetailSection>

        {/* Photos */}
        <DetailSection title={`Photos (${property.photos.length})`}>
          <PhotoGrid photos={property.photos} />
        </DetailSection>

        {/* Danger zone */}
        <DetailSection title="Danger zone">
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#FECACA",
              overflow: "hidden",
            }}
          >
            <ActionRow
              Icon={Trash}
              destructive
              label="Delete this property"
              description="Remove permanently from EasyPG"
              onPress={confirmDelete}
              loading={deleting}
            />
          </View>
        </DetailSection>
      </ScrollView>
    </View>
  );
}

function Separator() {
  return (
    <View style={{ height: 1, marginLeft: 70, backgroundColor: "#F1F5F9" }} />
  );
}
