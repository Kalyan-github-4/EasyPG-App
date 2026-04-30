import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import {
  X,
  House,
  CalendarCheck,
  Check,
} from "phosphor-react-native";

import * as api from "@/src/services/api";

type Props = {
  visible: boolean;
  property: api.Property;
  onClose: () => void;
  onCreated: (booking: api.BookingRequest) => void;
};

const SUGGESTED_DAYS = [1, 2, 3, 5, 7]; // days from today

function dayLabel(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  if (daysFromToday === 0) return "Today";
  if (daysFromToday === 1) return "Tomorrow";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function buildDateAt(daysFromToday: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export default function BookingRequestSheet({
  visible,
  property,
  onClose,
  onCreated,
}: Props) {
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();

  const [pickedDay, setPickedDay] = useState<number>(2); // day after tomorrow default
  const [pickedHour, setPickedHour] = useState<number>(11);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setPickedDay(2);
      setPickedHour(11);
      setNote("");
      setError(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const visitDate = buildDateAt(pickedDay, pickedHour).toISOString();
      const created = await api.createBooking(token, {
        propertyId: property.id,
        note: note.trim() || undefined,
        visitDate,
      });
      onCreated(created);
    } catch (err: any) {
      setError(err?.message || "Couldn't send request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#F1F5F9",
              backgroundColor: "#fff",
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F1F5F9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color="#0F172A" weight="bold" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A" }}>
                Request a visit
              </Text>
              <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
                Host will accept or decline
              </Text>
            </View>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Property card */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#F1F5F9",
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  backgroundColor: "#E2E8F0",
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {property.photos[0]?.url ? (
                  <Image
                    source={{ uri: property.photos[0].url }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <House size={22} color="#94A3B8" weight="fill" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}
                  numberOfLines={1}
                >
                  {property.name}
                </Text>
                <Text style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>
                  ₹{property.rent.toLocaleString("en-IN")} / month
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}
                >
                  {property.location}
                </Text>
              </View>
            </View>

            {/* Date picker */}
            <Text style={SECTION_LABEL}>Preferred day</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, marginBottom: 16 }}
            >
              {SUGGESTED_DAYS.map((d) => {
                const isActive = d === pickedDay;
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setPickedDay(d)}
                    activeOpacity={0.85}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: isActive ? "#2563EB" : "#E2E8F0",
                      backgroundColor: isActive ? "#EFF6FF" : "#fff",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: isActive ? "#2563EB" : "#0F172A",
                      }}
                    >
                      {dayLabel(d)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Time picker */}
            <Text style={SECTION_LABEL}>Preferred time</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {[9, 11, 14, 16, 18].map((h) => {
                const isActive = h === pickedHour;
                const label =
                  h <= 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
                return (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setPickedHour(h)}
                    activeOpacity={0.85}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: isActive ? "#2563EB" : "#E2E8F0",
                      backgroundColor: isActive ? "#EFF6FF" : "#fff",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: isActive ? "#2563EB" : "#0F172A",
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Note */}
            <Text style={SECTION_LABEL}>Note for the host (optional)</Text>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                padding: 14,
                marginBottom: 12,
                minHeight: 96,
              }}
            >
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g. I'd like to see the room and ask about the food menu"
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                editable={!submitting}
                style={{
                  fontSize: 14,
                  color: "#0F172A",
                  lineHeight: 20,
                  minHeight: 70,
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 11,
                color: "#CBD5E1",
                textAlign: "right",
                marginBottom: 16,
              }}
            >
              {note.length} / 2000
            </Text>

            {/* Confirmation summary */}
            <View
              style={{
                backgroundColor: "#EFF6FF",
                borderRadius: 12,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <CalendarCheck size={18} color="#2563EB" weight="fill" />
              <Text style={{ fontSize: 12, color: "#1E40AF", flex: 1 }}>
                Visiting{" "}
                <Text style={{ fontWeight: "800" }}>
                  {dayLabel(pickedDay)} at{" "}
                  {pickedHour <= 12
                    ? `${pickedHour}:00 AM`
                    : `${pickedHour - 12}:00 PM`}
                </Text>
              </Text>
            </View>

            {error ? (
              <View
                style={{
                  marginTop: 12,
                  backgroundColor: "#FEF2F2",
                  borderWidth: 1,
                  borderColor: "#FECACA",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <Text style={{ fontSize: 12, color: "#991B1B" }}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Submit bar */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 12),
              backgroundColor: "#fff",
              borderTopWidth: 1,
              borderTopColor: "#F1F5F9",
            }}
          >
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: submitting ? "#CBD5E1" : "#2563EB",
                borderRadius: 14,
                paddingVertical: 14,
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Check size={17} color="#fff" weight="bold" />
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>
                    Send request
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const SECTION_LABEL = {
  fontSize: 11,
  fontWeight: "800" as const,
  color: "#94A3B8",
  letterSpacing: 0.5,
  textTransform: "uppercase" as const,
  marginBottom: 10,
};
