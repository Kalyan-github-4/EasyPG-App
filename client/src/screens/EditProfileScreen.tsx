import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ArrowLeftIcon } from "phosphor-react-native";

import { useAppAuth } from "@/src/context/auth-context";
import * as api from "@/src/services/api";

const PHONE_REGEX = /^(\+?91[\s-]?)?[6-9]\d{9}$/;

export default function EditProfileScreen() {
  const { getToken } = useAuth();
  const { dbUser, refreshUser } = useAppAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dbUser) {
      setName(dbUser.name ?? "");
      setPhone(dbUser.phone ?? "");
    }
  }, [dbUser]);

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const nameValid = trimmedName.length >= 2;
  const phoneValid =
    trimmedPhone.length === 0 ||
    PHONE_REGEX.test(trimmedPhone.replace(/[\s-]/g, ""));
  const dirty =
    trimmedName !== (dbUser?.name ?? "") ||
    trimmedPhone !== (dbUser?.phone ?? "");
  const canSave = nameValid && phoneValid && dirty && !saving;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await api.updateProfile(token, {
        name: trimmedName,
        phone: trimmedPhone || undefined,
      });
      await refreshUser();
      router.back();
    } catch (err: any) {
      Alert.alert("Couldn't save", err?.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingTop: 8,
            paddingBottom: 14,
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#F1F5F9",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#F1F5F9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeftIcon size={18} color="#0F172A" weight="bold" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: "#0F172A",
                letterSpacing: -0.3,
              }}
            >
              Personal Info
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
              Update your name and contact number
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          <Label>Full name</Label>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#94A3B8"
            style={inputStyle}
            maxLength={120}
            autoCapitalize="words"
          />
          {!nameValid && trimmedName.length > 0 ? (
            <Hint error>Name must be at least 2 characters</Hint>
          ) : (
            <Hint>This is what guests will see when they call you.</Hint>
          )}

          <View style={{ height: 18 }} />

          <Label>Phone number</Label>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            placeholderTextColor="#94A3B8"
            style={inputStyle}
            keyboardType="phone-pad"
            maxLength={20}
            autoComplete="tel"
          />
          {!phoneValid ? (
            <Hint error>Enter a valid 10-digit Indian mobile number</Hint>
          ) : (
            <Hint>
              Guests will use this to call you about your listings. Leave
              blank to hide.
            </Hint>
          )}

          <View style={{ height: 18 }} />

          <Label>Email</Label>
          <View style={[inputStyle, { backgroundColor: "#F1F5F9" }]}>
            <Text style={{ fontSize: 15, color: "#64748B" }}>
              {dbUser?.email ?? "—"}
            </Text>
          </View>
          <Hint>Email is managed by your sign-in provider.</Hint>
        </ScrollView>

        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Platform.OS === "ios" ? 28 : 20,
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
            backgroundColor: "#fff",
          }}
        >
          <TouchableOpacity
            onPress={onSave}
            disabled={!canSave}
            activeOpacity={0.85}
            style={{
              backgroundColor: canSave ? "#2563EB" : "#CBD5E1",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {saving ? <ActivityIndicator size="small" color="#fff" /> : null}
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#fff" }}>
              {saving ? "Saving…" : "Save changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

function Hint({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <Text
      style={{
        fontSize: 11,
        color: error ? "#DC2626" : "#94A3B8",
        marginTop: 6,
      }}
    >
      {children}
    </Text>
  );
}

const inputStyle = {
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 15,
  color: "#0F172A",
} as const;
