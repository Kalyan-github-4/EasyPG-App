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
    <View className="flex-1 bg-brand-surface">
      {/* Blue Hero Header */}
      <LinearGradient
        colors={["#2563EB", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
      >
        <SafeAreaView edges={["top"]}>
          <View className="items-center px-6 pt-4 pb-10">
            {/* Logo */}
            <View className="items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-white/20">
              <Ionicons name="home" size={32} color="#fff" />
            </View>
            <Text className="text-3xl font-black tracking-tight text-white">
              EasyPG
            </Text>
            <Text className="mt-1 text-sm font-medium text-blue-100">
              Find Home, Away From Home
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Form Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 p-6 mx-5 -mt-5 bg-white rounded-3xl shadow-soft-2">
            <Text className="mb-1 text-2xl font-extrabold tracking-tight text-brand-on-surface">
              Welcome back
            </Text>
            <Text className="mb-6 text-sm text-brand-on-surface-muted">
              Sign in to continue
            </Text>

            {/* Error */}
            {error ? (
              <View className="px-4 py-3 mb-4 border border-red-100 bg-red-50 rounded-xl">
                <Text className="text-sm text-center text-red-500">{error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View className="mb-4">
              <Text className="mb-2 ml-1 text-xs font-semibold tracking-wide uppercase text-brand-on-surface-muted">
                Email
              </Text>
              <View className="flex-row items-center px-4 border border-transparent bg-brand-surface-low rounded-xl focus:border-blue-500">
                <Ionicons name="mail-outline" size={18} color="#737686" />
                <TextInput
                  className="flex-1 text-base text-brand-on-surface py-3.5 pl-3"
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
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
            <View className="mb-2">
              <Text className="mb-2 ml-1 text-xs font-semibold tracking-wide uppercase text-brand-on-surface-muted">
                Password
              </Text>
              <View className="flex-row items-center px-4 bg-brand-surface-low rounded-xl">
                <Ionicons name="lock-closed-outline" size={18} color="#737686" />
                <TextInput
                  className="flex-1 text-base text-brand-on-surface py-3.5 pl-3"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isSubmitting}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#737686"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <View className="items-end mb-5">
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity>
                  <Text className="text-sm font-semibold text-blue-600">
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
                colors={["#004ac6", "#2563eb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 14, paddingVertical: 15, alignItems: "center" }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-base font-bold text-white">Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-brand-surface-low" />
              <Text className="mx-4 text-xs font-medium text-brand-outline">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-brand-surface-low" />
            </View>

            {/* Social Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={isSubmitting}
                activeOpacity={0.8}
                className="flex-1 flex-row items-center justify-center bg-brand-surface-low rounded-xl py-3.5 gap-2"
              >
                <Ionicons name="logo-google" size={18} color="#2563EB" />
                <Text className="text-sm font-semibold text-brand-on-surface">
                  Google
                </Text>
              </TouchableOpacity>

              {Platform.OS === "ios" && (
                <TouchableOpacity
                  onPress={handleAppleSignIn}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                  className="flex-1 flex-row items-center justify-center bg-brand-on-surface rounded-xl py-3.5 gap-2"
                >
                  <Ionicons name="logo-apple" size={18} color="#fff" />
                  <Text className="text-sm font-semibold text-white">Apple</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center gap-1 mt-6">
              <Text className="text-sm text-brand-on-surface-muted">
                Don&apos;t have an account?
              </Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text className="text-sm font-bold text-blue-600">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Bottom padding */}
          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
