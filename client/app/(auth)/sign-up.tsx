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
import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // ─── Sign Up ──────────────────────────────────────────

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await signUp.create({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        emailAddress: email.trim(),
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Sign up failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, firstName, lastName, email, password, signUp]);

  // ─── Verify OTP ───────────────────────────────────────

  const handleVerify = useCallback(async () => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(app)/(tabs)");
      } else if (result.status === "missing_requirements") {
        const missingFields = result.missingFields ?? [];

        if (missingFields.includes("username")) {
          const username =
            email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) +
            Math.floor(Math.random() * 1000);

          const updated = await signUp.update({ username });

          if (updated.status === "complete") {
            await setActive({ session: updated.createdSessionId });
            router.replace("/(app)/(tabs)");
          } else {
            setError(`Setup incomplete. Missing: ${updated.missingFields?.join(", ") ?? "unknown"}`);
          }
        } else {
          setError(`Account setup incomplete. Missing: ${missingFields.join(", ")}`);
        }
      } else {
        setError(`Unexpected status: ${result.status}`);
      }
    } catch (err: any) {
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Invalid verification code.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, verificationCode, signUp, setActive, router, email]);

  // ─── Google OAuth ─────────────────────────────────────

  const handleGoogleSignUp = useCallback(async () => {
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
    } catch {
      setError("Google sign-up failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [startSSOFlow, router]);

  // ─── Apple OAuth ──────────────────────────────────────

  const handleAppleSignUp = useCallback(async () => {
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
    } catch {
      setError("Apple sign-up failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [startSSOFlow, router]);

  // ─── OTP Verification Screen ──────────────────────────

  if (pendingVerification) {
    return (
      <View className="flex-1 bg-brand-surface">
        <LinearGradient
          colors={["#2563EB", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
        >
          <SafeAreaView edges={["top"]}>
            <View className="px-6 pt-4 pb-10 items-center">
              <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mb-4">
                <Ionicons name="mail" size={32} color="#fff" />
              </View>
              <Text className="text-2xl font-extrabold text-white tracking-tight">
                Check your email
              </Text>
              <Text className="text-blue-100 text-sm font-medium mt-1 text-center">
                We sent a 6-digit code to{"\n"}
                <Text className="text-white font-bold">{email}</Text>
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View className="mx-5 -mt-5 bg-white rounded-3xl p-6">
          {error ? (
            <View className="bg-red-50 rounded-xl px-4 py-3 mb-4 border border-red-100">
              <Text className="text-red-500 text-sm text-center">{error}</Text>
            </View>
          ) : null}

          <Text className="text-xs font-semibold text-brand-on-surface-muted uppercase tracking-wide mb-2 ml-1">
            Verification Code
          </Text>
          <TextInput
            className="bg-brand-surface-low rounded-xl text-center text-3xl font-bold text-brand-on-surface py-4 mb-6 tracking-widest"
            placeholder="000000"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={6}
            value={verificationCode}
            onChangeText={setVerificationCode}
            editable={!isSubmitting}
          />

          <TouchableOpacity
            onPress={handleVerify}
            disabled={isSubmitting || verificationCode.length < 6}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                verificationCode.length === 6
                  ? ["#004ac6", "#2563eb"]
                  : ["#e5e7eb", "#e5e7eb"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 14, paddingVertical: 15, alignItems: "center" }}
            >
              {isSubmitting ? (
                <ActivityIndicator color={verificationCode.length === 6 ? "#fff" : "#9CA3AF"} />
              ) : (
                <Text
                  className={`text-base font-bold ${
                    verificationCode.length === 6 ? "text-white" : "text-brand-outline"
                  }`}
                >
                  Verify Email
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPendingVerification(false)}
            className="mt-4 items-center"
          >
            <Text className="text-blue-600 text-sm font-semibold">
              ← Back to sign up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Sign Up Form ─────────────────────────────────────

  return (
    <View className="flex-1 bg-brand-surface">
      <LinearGradient
        colors={["#2563EB", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
      >
        <SafeAreaView edges={["top"]}>
          <View className="px-6 pt-4 pb-10 items-center">
            <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mb-4">
              <Ionicons name="person-add" size={32} color="#fff" />
            </View>
            <Text className="text-3xl font-black text-white tracking-tight">
              Create account
            </Text>
            <Text className="text-blue-100 text-sm font-medium mt-1">
              Join EasyPG to get started
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mx-5 -mt-5 bg-white rounded-3xl p-6">
            {error ? (
              <View className="bg-red-50 rounded-xl px-4 py-3 mb-4 border border-red-100">
                <Text className="text-red-500 text-sm text-center">{error}</Text>
              </View>
            ) : null}

            {/* Name Row */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-xs font-semibold text-brand-on-surface-muted uppercase tracking-wide mb-2 ml-1">
                  First Name
                </Text>
                <TextInput
                  className="bg-brand-surface-low rounded-xl px-4 py-3.5 text-base text-brand-on-surface"
                  placeholder="John"
                  placeholderTextColor="#9CA3AF"
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!isSubmitting}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-brand-on-surface-muted uppercase tracking-wide mb-2 ml-1">
                  Last Name
                </Text>
                <TextInput
                  className="bg-brand-surface-low rounded-xl px-4 py-3.5 text-base text-brand-on-surface"
                  placeholder="Doe"
                  placeholderTextColor="#9CA3AF"
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-brand-on-surface-muted uppercase tracking-wide mb-2 ml-1">
                Email <Text className="text-red-400">*</Text>
              </Text>
              <View className="flex-row items-center bg-brand-surface-low rounded-xl px-4">
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
            <View className="mb-6">
              <Text className="text-xs font-semibold text-brand-on-surface-muted uppercase tracking-wide mb-2 ml-1">
                Password <Text className="text-red-400">*</Text>
              </Text>
              <View className="flex-row items-center bg-brand-surface-low rounded-xl px-4">
                <Ionicons name="lock-closed-outline" size={18} color="#737686" />
                <TextInput
                  className="flex-1 text-base text-brand-on-surface py-3.5 pl-3"
                  placeholder="Create a strong password"
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

            {/* Create Account Button */}
            <TouchableOpacity
              onPress={handleSignUp}
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
                  <Text className="text-white text-base font-bold">
                    Create Account
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-brand-surface-low" />
              <Text className="text-brand-outline text-xs mx-4 font-medium">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-brand-surface-low" />
            </View>

            {/* Social Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleGoogleSignUp}
                disabled={isSubmitting}
                activeOpacity={0.8}
                className="flex-1 flex-row items-center justify-center bg-brand-surface-low rounded-xl py-3.5 gap-2"
              >
                <Ionicons name="logo-google" size={18} color="#2563EB" />
                <Text className="text-brand-on-surface text-sm font-semibold">
                  Google
                </Text>
              </TouchableOpacity>

              {Platform.OS === "ios" && (
                <TouchableOpacity
                  onPress={handleAppleSignUp}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                  className="flex-1 flex-row items-center justify-center bg-brand-on-surface rounded-xl py-3.5 gap-2"
                >
                  <Ionicons name="logo-apple" size={18} color="#fff" />
                  <Text className="text-white text-sm font-semibold">Apple</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sign In Link */}
            <View className="flex-row justify-center mt-6 gap-1">
              <Text className="text-brand-on-surface-muted text-sm">
                Already have an account?
              </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 text-sm font-bold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
