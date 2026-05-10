import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ─── Email/Password Sign In ───────────────────────────

  const handleSignIn = useCallback(async () => {
    if (!isLoaded) return;
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(app)/(tabs)");
      } else {
        setError("Additional verification required. Please try again.");
      }
    } catch (err: any) {
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Sign in failed. Please check your credentials.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, email, password, signIn, setActive, router]);

  // ─── Google OAuth ─────────────────────────────────────

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError("");
      const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: "easypg://oauth-callback",
      });
      if (createdSessionId) {
        await ssoSetActive!({ session: createdSessionId });
        router.replace("/(app)/(tabs)");
      }
    } catch (err: any) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [startSSOFlow, router]);

  // ─── Apple Sign In ────────────────────────────────────

  const handleAppleSignIn = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError("");
      const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
        strategy: "oauth_apple",
        redirectUrl: "easypg://oauth-callback",
      });
      if (createdSessionId) {
        await ssoSetActive!({ session: createdSessionId });
        router.replace("/(app)/(tabs)");
      }
    } catch (err: any) {
      setError("Apple sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [startSSOFlow, router]);

  // ─── UI ───────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header with Logo */}
      <LinearGradient
        colors={["#0B1F47", "#1A3A7A", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          overflow: "hidden",
        }}
      >
        <SafeAreaView edges={["top"]}>
          <View style={{ alignItems: "center", paddingHorizontal: 24, paddingTop: 20, paddingBottom: 36 }}>
            {/* Logo Image */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Image
                source={require("../../assets/images/icon.png")}
                style={{ width: 56, height: 56 }}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "900",
                color: "#FFFFFF",
                letterSpacing: -0.5,
              }}
            >
              EasyPG
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontSize: 14,
                fontWeight: "500",
                color: "rgba(191, 219, 254, 0.9)",
                letterSpacing: 0.3,
              }}
            >
              Find Home, Away From Home
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Form Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flex: 1,
              marginHorizontal: 20,
              marginTop: -20,
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: "#0F172A",
                letterSpacing: -0.3,
                marginBottom: 4,
              }}
            >
              Welcome back
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#94A3B8",
                marginBottom: 20,
              }}
            >
              Sign in to continue
            </Text>

            {/* Error */}
            {error ? (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 16,
                  backgroundColor: "#FEF2F2",
                  borderWidth: 1,
                  borderColor: "#FEE2E2",
                  borderRadius: 14,
                }}
              >
                <Text style={{ fontSize: 13, textAlign: "center", color: "#EF4444" }}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={{ marginBottom: 14 }}>
              <Text
                style={{
                  marginBottom: 8,
                  marginLeft: 2,
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  backgroundColor: "#F8FAFC",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: "#E2E8F0",
                }}
              >
                <Ionicons name="mail-outline" size={18} color="#94A3B8" />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: "#0F172A",
                    paddingVertical: 14,
                    paddingLeft: 12,
                  }}
                  placeholder="your@email.com"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  marginBottom: 8,
                  marginLeft: 2,
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  backgroundColor: "#F8FAFC",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: "#E2E8F0",
                }}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: "#0F172A",
                    paddingVertical: 14,
                    paddingLeft: 12,
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#CBD5E1"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <View style={{ alignItems: "flex-end", marginBottom: 20 }}>
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB" }}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#0B3D91", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: "center",
                  shadowColor: "#2563EB",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}>
                    Sign In
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 22 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
              <Text
                style={{
                  marginHorizontal: 14,
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#94A3B8",
                }}
              >
                or continue with
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
            </View>

            {/* Social Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={isSubmitting}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F8FAFC",
                  borderRadius: 14,
                  paddingVertical: 14,
                  gap: 8,
                  borderWidth: 1.5,
                  borderColor: "#E2E8F0",
                }}
              >
                <Ionicons name="logo-google" size={18} color="#2563EB" />
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                  Google
                </Text>
              </TouchableOpacity>

              {Platform.OS === "ios" && (
                <TouchableOpacity
                  onPress={handleAppleSignIn}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#0F172A",
                    borderRadius: 14,
                    paddingVertical: 14,
                    gap: 8,
                  }}
                >
                  <Ionicons name="logo-apple" size={18} color="#fff" />
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>
                    Apple
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sign Up Link */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 4,
                marginTop: 22,
              }}
            >
              <Text style={{ fontSize: 14, color: "#94A3B8" }}>
                Don&apos;t have an account?
              </Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: "#2563EB" }}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Bottom padding */}
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
