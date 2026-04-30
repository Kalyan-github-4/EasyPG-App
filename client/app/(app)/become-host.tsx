import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useAppAuth } from "@/src/context/auth-context";
import * as api from "@/src/services/api";

// ─── Phone helpers ──────────────────────────────────────────────

// Strip +91 / 91 country code and return only the local 10 digits.
function stripIndianPrefix(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length > 10) return digits.slice(2);
  return digits;
}

// Format 10 digits as "XXXXX XXXXX" (standard Indian mobile spacing).
function formatIndianPhone(digits: string): string {
  const d = digits.slice(0, 10);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

export default function BecomeHostScreen() {
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { dbUser, refreshUser } = useAppAuth();

  const signedInEmail =
    dbUser?.email || clerkUser?.primaryEmailAddress?.emailAddress || "";

  const [name, setName] = useState(dbUser?.name || "");
  // Store the raw 10 local digits; format for display only.
  const [phoneDigits, setPhoneDigits] = useState(
    stripIndianPrefix(dbUser?.phone || "")
  );
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  const phoneRef = useRef<TextInput>(null);

  const phoneValid = phoneDigits.length === 10;
  const nameValid = name.trim().length >= 2;
  const isValid = nameValid && phoneValid && agreed;

  const phoneDisplay = useMemo(() => formatIndianPhone(phoneDigits), [phoneDigits]);

  const hasHostProfile = Boolean(dbUser?.hostProfileCompleted);
  const isHost = dbUser?.role === "host";

  if (hasHostProfile && !isHost) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#F8F9FA" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            backgroundColor: "#fff",
            paddingTop: insets.top + 8,
            paddingBottom: 14,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#F1F5F9",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#F1F5F9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>
              Switch to host
            </Text>
            <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
              Your host profile is already saved
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
          <View
            style={{
              backgroundColor: "#EFF6FF",
              borderRadius: 18,
              padding: 18,
              borderWidth: 1,
              borderColor: "#BFDBFE",
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: "#2563EB",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Ionicons name="swap-horizontal" size={24} color="#fff" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>
              Your host details are saved
            </Text>
            <Text style={{ fontSize: 13, color: "#475569", marginTop: 8, lineHeight: 19 }}>
              Switch back to host view without filling the form again.
            </Text>

            <TouchableOpacity
              onPress={async () => {
                setSubmitting(true);
                try {
                  const token = await getToken();
                  if (!token) throw new Error("Not authenticated");
                  await api.setRole(token, "host");
                  await refreshUser();
                  router.replace("/(app)/(tabs)");
                } catch (err: any) {
                  Alert.alert("Something went wrong", err?.message || "Please try again.");
                } finally {
                  setSubmitting(false);
                }
              }}
              activeOpacity={0.9}
              disabled={submitting}
              style={{
                marginTop: 18,
                borderRadius: 14,
                backgroundColor: "#2563EB",
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>
                  Switch to host
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  const handlePhoneChange = (text: string) => {
    // Strip everything non-numeric, cap at 10 digits.
    const digits = text.replace(/\D/g, "").slice(0, 10);
    setPhoneDigits(digits);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert(
        "Complete required fields",
        "Please enter your name, a valid 10-digit phone number, and accept the host terms."
      );
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const fullPhone = `+91${phoneDigits}`;
      const trimmedName = name.trim();

      if (trimmedName !== dbUser?.name || fullPhone !== dbUser?.phone) {
        await api.updateProfile(token, { name: trimmedName, phone: fullPhone });
      }

      await api.becomeHost(token);
      await refreshUser();

      router.replace("/(app)/host/add-property" as any);
    } catch (err: any) {
      Alert.alert("Something went wrong", err?.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8F9FA" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: insets.top + 8,
          paddingBottom: 14,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F1F5F9",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>
            Become a Host
          </Text>
          <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
            A quick check before you list a property
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
      >
        {/* Banner */}
        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "#BFDBFE",
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: "#2563EB",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="home" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E40AF" }}>
              List your PG on EasyPG
            </Text>
            <Text style={{ fontSize: 12, color: "#3B82F6", marginTop: 2, lineHeight: 17 }}>
              Confirm your details and you&apos;ll be taken to the property setup form.
            </Text>
          </View>
        </View>

        <SectionTitle title="Confirm Your Details" icon="person-outline" />

        {/* Signed-in identity */}
        {signedInEmail ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: "#EFF6FF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="mail-outline" size={15} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 11,
                  color: "#64748B",
                  fontWeight: "600",
                  letterSpacing: 0.2,
                }}
              >
                Signed in as
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 13,
                  color: "#0F172A",
                  fontWeight: "700",
                  marginTop: 1,
                }}
              >
                {signedInEmail}
              </Text>
            </View>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          </View>
        ) : null}

        <Field label="Full Name *">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor="#94A3B8"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
            style={inputStyle}
          />
        </Field>

        <Field label="Phone Number *">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: phoneFocused
                ? "#2563EB"
                : phoneDigits.length > 0 && !phoneValid
                ? "#FCA5A5"
                : "#E2E8F0",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* +91 prefix chip */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRightWidth: 1,
                borderRightColor: "#E2E8F0",
                backgroundColor: "#F8FAFC",
              }}
            >
              <Text style={{ fontSize: 16 }}>🇮🇳</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#0F172A",
                  letterSpacing: 0.3,
                }}
              >
                +91
              </Text>
            </View>

            <TextInput
              ref={phoneRef}
              value={phoneDisplay}
              onChangeText={handlePhoneChange}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              placeholder="98765 43210"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={11} // 10 digits + 1 space
              autoComplete="tel-national"
              textContentType="telephoneNumber"
              returnKeyType="done"
              style={{
                flex: 1,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 14,
                color: "#0F172A",
                letterSpacing: 0.4,
              }}
            />

            {/* Valid indicator */}
            {phoneValid ? (
              <View style={{ paddingHorizontal: 12 }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: "#10B981",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              </View>
            ) : null}
          </View>

          {/* Inline hint */}
          <Text
            style={{
              fontSize: 11,
              color:
                phoneDigits.length > 0 && !phoneValid ? "#DC2626" : "#94A3B8",
              marginTop: 6,
              marginLeft: 2,
            }}
          >
            {phoneDigits.length > 0 && !phoneValid
              ? `Enter all 10 digits (${phoneDigits.length}/10)`
              : "We'll use this to connect you with interested guests."}
          </Text>
        </Field>

        {/* Terms agreement */}
        <TouchableOpacity
          onPress={() => setAgreed((v) => !v)}
          activeOpacity={0.85}
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
            padding: 14,
            backgroundColor: "#fff",
            borderWidth: 1.5,
            borderColor: agreed ? "#2563EB" : "#E2E8F0",
            borderRadius: 12,
            marginTop: 6,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              borderWidth: 1.5,
              borderColor: agreed ? "#2563EB" : "#CBD5E1",
              backgroundColor: agreed ? "#2563EB" : "#fff",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 1,
            }}
          >
            {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={{ flex: 1, fontSize: 13, color: "#475569", lineHeight: 19 }}>
            I agree to the EasyPG host terms and confirm my details are accurate. Listings
            may be reviewed before going live.
          </Text>
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitting || !isValid}
          style={{
            backgroundColor: isValid ? "#2563EB" : "#CBD5E1",
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
                Continue to Property Setup
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionTitle({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
        marginTop: 8,
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          backgroundColor: "#EFF6FF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={16} color="#2563EB" />
      </View>
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>{title}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: "#F1F5F9" }} />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const inputStyle = {
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 14,
  color: "#0F172A",
};
