import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import StepIndicator from "./StepIndicator";

type Props = {
  step: number;
  title: string;
  subtitle?: string;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  errorText?: string | null;
  children: React.ReactNode;
};

export default function FormShell({
  step,
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel = "Next",
  nextDisabled,
  nextLoading,
  errorText,
  children,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8F9FA" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: insets.top + 8,
          paddingBottom: 10,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F1F5F9",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={step === 0 ? "close" : "arrow-back"}
            size={20}
            color="#0F172A"
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A" }}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={{ backgroundColor: "#fff" }}>
        <StepIndicator current={step} />
      </View>

      {/* Body */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* Footer */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
          backgroundColor: "#fff",
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12) + 4,
        }}
      >
        {errorText ? (
          <View
            style={{
              backgroundColor: "#FEF2F2",
              borderWidth: 1,
              borderColor: "#FECACA",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={{ fontSize: 12, color: "#991B1B", flex: 1 }}>{errorText}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.85}
          disabled={nextDisabled || nextLoading}
          style={{
            backgroundColor: nextDisabled || nextLoading ? "#CBD5E1" : "#2563EB",
            borderRadius: 14,
            paddingVertical: 15,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          }}
        >
          {nextLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                {nextLabel}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
