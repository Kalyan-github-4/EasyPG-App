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
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type Stage = "email" | "reset";

export default function ForgotPasswordScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // ─── Stage 1: Request reset code ─────────────────

  const handleSendCode = useCallback(async () => {
    if (!isLoaded) return;
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setInfo("");
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setStage("reset");
      setInfo("We sent a 6-digit code to your email.");
    } catch (err: any) {
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Couldn't send reset code. Please check your email.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, email, signIn]);

  // ─── Stage 2: Verify code + set new password ─────

  const handleReset = useCallback(async () => {
    if (!isLoaded) return;
    if (!code.trim() || !password.trim()) {
      setError("Enter the code and your new password");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
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
        "Couldn't reset password. Check your code and try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, code, password, confirmPassword, signIn, setActive, router]);

  // ─── Resend ──────────────────────────────────────

  const handleResend = useCallback(async () => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setError("");
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setInfo("A new code has been sent to your email.");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Couldn't resend the code.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, email, signIn]);

  // ─── UI ──────────────────────────────────────────

  return (
    <View className="flex-1 bg-brand-surface">
      <LinearGradient
        colors={["#2563EB", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
      >
        <SafeAreaView edges={["top"]}>
          <View className="px-6 pt-2 pb-10">
            <TouchableOpacity
              onPress={() => (stage === "email" ? router.back() : setStage("email"))}
              className="items-center justify-center w-10 h-10 mb-4 rounded-full bg-white/20"
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>

            <Text className="text-3xl font-black tracking-tight text-white">
              {stage === "email" ? "Forgot password?" : "Check your email"}
            </Text>
            <Text className="mt-2 text-sm font-medium text-blue-100">
              {stage === "email"
                ? "Enter your email and we'll send you a reset code."
                : `We sent a 6-digit code to ${email}`}
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
          <View className="flex-1 p-6 mx-5 -mt-5 bg-white rounded-3xl shadow-soft-2">
            {/* Error */}
            {error ? (
              <View className="px-4 py-3 mb-4 border border-red-100 bg-red-50 rounded-xl">
                <Text className="text-sm text-center text-red-500">{error}</Text>
              </View>
            ) : null}

            {/* Info */}
            {info ? (
              <View className="px-4 py-3 mb-4 border border-blue-100 bg-blue-50 rounded-xl">
                <Text className="text-sm text-center text-blue-700">{info}</Text>
              </View>
            ) : null}

            {stage === "email" ? (
              <>
                {/* Email */}
                <View className="mb-6">
                  <Text className="mb-2 ml-1 text-xs font-semibold tracking-wide uppercase text-brand-on-surface-muted">
                    Email
                  </Text>
                  <View className="flex-row items-center px-4 bg-brand-surface-low rounded-xl">
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

                {/* Send Code Button */}
                <TouchableOpacity
                  onPress={handleSendCode}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#004ac6", "#2563eb"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 14,
                      paddingVertical: 15,
                      alignItems: "center",
                    }}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-base font-bold text-white">
                        Send Reset Code
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View className="flex-row justify-center gap-1 mt-6">
                  <Text className="text-sm text-brand-on-surface-muted">
                    Remembered it?
                  </Text>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-sm font-bold text-blue-600">Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Code */}
                <View className="mb-4">
                  <Text className="mb-2 ml-1 text-xs font-semibold tracking-wide uppercase text-brand-on-surface-muted">
                    Verification Code
                  </Text>
                  <View className="flex-row items-center px-4 bg-brand-surface-low rounded-xl">
                    <Ionicons name="keypad-outline" size={18} color="#737686" />
                    <TextInput
                      className="flex-1 text-base text-brand-on-surface py-3.5 pl-3"
                      placeholder="6-digit code"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={code}
                      onChangeText={setCode}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                {/* New Password */}
                <View className="mb-4">
                  <Text className="mb-2 ml-1 text-xs font-semibold tracking-wide uppercase text-brand-on-surface-muted">
                    New Password
                  </Text>
                  <View className="flex-row items-center px-4 bg-brand-surface-low rounded-xl">
                    <Ionicons name="lock-closed-outline" size={18} color="#737686" />
                    <TextInput
                      className="flex-1 text-base text-brand-on-surface py-3.5 pl-3"
                      placeholder="At least 8 characters"
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

                {/* Confirm Password */}
                <View className="mb-6">
                  <Text className="mb-2 ml-1 text-xs font-semibold tracking-wide uppercase text-brand-on-surface-muted">
                    Confirm Password
                  </Text>
                  <View className="flex-row items-center px-4 bg-brand-surface-low rounded-xl">
                    <Ionicons name="lock-closed-outline" size={18} color="#737686" />
                    <TextInput
                      className="flex-1 text-base text-brand-on-surface py-3.5 pl-3"
                      placeholder="Re-enter new password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                  onPress={handleReset}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#004ac6", "#2563eb"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 14,
                      paddingVertical: 15,
                      alignItems: "center",
                    }}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-base font-bold text-white">
                        Reset Password
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Resend */}
                <View className="flex-row justify-center gap-1 mt-6">
                  <Text className="text-sm text-brand-on-surface-muted">
                    Didn&apos;t get the code?
                  </Text>
                  <TouchableOpacity onPress={handleResend} disabled={isSubmitting}>
                    <Text className="text-sm font-bold text-blue-600">Resend</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
