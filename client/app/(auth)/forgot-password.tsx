import React, { useState, useCallback, useRef } from "react";
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
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type Stage = "email" | "otp" | "reset";

export default function ForgotPasswordScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Refs for OTP inputs
  const otpRefs = useRef<(TextInput | null)[]>([]);

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
      setStage("otp");
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

  // ─── Stage 2: Verify OTP ─────────────────────────

  const handleVerifyOtp = useCallback(async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    // Move to stage 3 — actual verification happens when they set the password
    setError("");
    setInfo("");
    setStage("reset");
  }, [otp]);

  // ─── Stage 3: Set new password ────────────────────

  const handleReset = useCallback(async () => {
    if (!isLoaded) return;
    const code = otp.join("");
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
      // If code was wrong, go back to OTP stage
      if (
        err.errors?.[0]?.code === "form_code_incorrect" ||
        message.toLowerCase().includes("code")
      ) {
        setStage("otp");
        setOtp(["", "", "", "", "", ""]);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, otp, password, confirmPassword, signIn, setActive, router]);

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
      setOtp(["", "", "", "", "", ""]);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Couldn't resend the code.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, email, signIn]);

  // ─── OTP Input Handler ────────────────────────────

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "");
    const newOtp = [...otp];

    if (digit.length > 1) {
      // Handle paste of full OTP
      const digits = digit.slice(0, 6).split("");
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const lastIndex = Math.min(digits.length - 1, 5);
      otpRefs.current[lastIndex]?.focus();
      return;
    }

    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleBack = () => {
    if (stage === "email") {
      router.back();
    } else if (stage === "otp") {
      setStage("email");
      setError("");
      setInfo("");
    } else {
      setStage("otp");
      setError("");
    }
  };

  // ─── Step Indicator ───────────────────────────────

  const stages: Stage[] = ["email", "otp", "reset"];
  const currentStepIndex = stages.indexOf(stage);

  const stageLabels = {
    email: { title: "Forgot password?", subtitle: "Enter your email and we'll send you a reset code." },
    otp: { title: "Verify your email", subtitle: `Enter the 6-digit code sent to ${email}` },
    reset: { title: "Create new password", subtitle: "Your identity is verified. Set a new password." },
  };

  // ─── UI ──────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <LinearGradient
        colors={["#0B1F47", "#1A3A7A", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}
      >
        <SafeAreaView edges={["top"]}>
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}>
            <TouchableOpacity
              onPress={handleBack}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Logo */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={require("../../assets/images/icon.png")}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}>EasyPG</Text>
            </View>

            <Text
              style={{
                fontSize: 26,
                fontWeight: "900",
                color: "#fff",
                letterSpacing: -0.3,
              }}
            >
              {stageLabels[stage].title}
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                fontWeight: "500",
                color: "rgba(191, 219, 254, 0.9)",
                lineHeight: 20,
              }}
            >
              {stageLabels[stage].subtitle}
            </Text>

            {/* Step Indicator */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 20,
              }}
            >
              {stages.map((s, i) => (
                <View
                  key={s}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor:
                      i <= currentStepIndex
                        ? "#FFFFFF"
                        : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

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
              padding: 24,
              marginHorizontal: 20,
              marginTop: -16,
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
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

            {/* Info */}
            {info ? (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 16,
                  backgroundColor: "#EFF6FF",
                  borderWidth: 1,
                  borderColor: "#BFDBFE",
                  borderRadius: 14,
                }}
              >
                <Text style={{ fontSize: 13, textAlign: "center", color: "#2563EB" }}>
                  {info}
                </Text>
              </View>
            ) : null}

            {/* ═══════ STAGE 1: EMAIL ═══════ */}
            {stage === "email" && (
              <>
                <View style={{ marginBottom: 24 }}>
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
                    Email Address
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

                <TouchableOpacity
                  onPress={handleSendCode}
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
                      <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>
                        Send Reset Code
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 4,
                    marginTop: 22,
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#94A3B8" }}>
                    Remembered it?
                  </Text>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ fontSize: 14, fontWeight: "800", color: "#2563EB" }}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ═══════ STAGE 2: OTP VERIFICATION ═══════ */}
            {stage === "otp" && (
              <>
                {/* OTP Badge */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "center",
                    gap: 8,
                    backgroundColor: "#EFF6FF",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginBottom: 24,
                  }}
                >
                  <Ionicons name="shield-checkmark" size={16} color="#2563EB" />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>
                    Verification Step
                  </Text>
                </View>

                {/* OTP Input Boxes */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 10,
                    marginBottom: 24,
                  }}
                >
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => { otpRefs.current[index] = ref; }}
                      style={{
                        width: 48,
                        height: 56,
                        borderRadius: 14,
                        backgroundColor: digit ? "#EFF6FF" : "#F8FAFC",
                        borderWidth: 2,
                        borderColor: digit ? "#2563EB" : "#E2E8F0",
                        textAlign: "center",
                        fontSize: 22,
                        fontWeight: "800",
                        color: "#0F172A",
                      }}
                      keyboardType="number-pad"
                      maxLength={index === 0 ? 6 : 1}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={({ nativeEvent }) =>
                        handleOtpKeyPress(nativeEvent.key, index)
                      }
                      editable={!isSubmitting}
                      autoFocus={index === 0}
                    />
                  ))}
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={isSubmitting || otp.join("").length !== 6}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={
                      otp.join("").length === 6
                        ? ["#0B3D91", "#2563EB"]
                        : ["#CBD5E1", "#CBD5E1"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 14,
                      paddingVertical: 16,
                      alignItems: "center",
                      shadowColor: otp.join("").length === 6 ? "#2563EB" : "transparent",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: otp.join("").length === 6 ? 4 : 0,
                    }}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>
                          Verify Code
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Resend */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 4,
                    marginTop: 22,
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#94A3B8" }}>
                    Didn&apos;t get the code?
                  </Text>
                  <TouchableOpacity onPress={handleResend} disabled={isSubmitting}>
                    <Text style={{ fontSize: 14, fontWeight: "800", color: "#2563EB" }}>
                      Resend
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ═══════ STAGE 3: NEW PASSWORD ═══════ */}
            {stage === "reset" && (
              <>
                {/* Verified Badge */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "center",
                    gap: 8,
                    backgroundColor: "#F0FDF4",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginBottom: 24,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#10B981" }}>
                    Email Verified
                  </Text>
                </View>

                {/* New Password */}
                <View style={{ marginBottom: 16 }}>
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
                    New Password
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
                      placeholder="At least 8 characters"
                      placeholderTextColor="#CBD5E1"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      editable={!isSubmitting}
                      autoFocus
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
                  {/* Password strength hint */}
                  {password.length > 0 && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 8,
                        marginLeft: 2,
                      }}
                    >
                      <Ionicons
                        name={password.length >= 8 ? "checkmark-circle" : "close-circle"}
                        size={14}
                        color={password.length >= 8 ? "#10B981" : "#EF4444"}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          color: password.length >= 8 ? "#10B981" : "#EF4444",
                          fontWeight: "600",
                        }}
                      >
                        {password.length >= 8
                          ? "Password is strong enough"
                          : `${8 - password.length} more character${8 - password.length !== 1 ? "s" : ""} needed`}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Confirm Password */}
                <View style={{ marginBottom: 24 }}>
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
                    Confirm Password
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      backgroundColor: "#F8FAFC",
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor:
                        confirmPassword.length > 0 && password !== confirmPassword
                          ? "#FCA5A5"
                          : "#E2E8F0",
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
                      placeholder="Re-enter new password"
                      placeholderTextColor="#CBD5E1"
                      secureTextEntry={!showPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      editable={!isSubmitting}
                    />
                    {confirmPassword.length > 0 && password === confirmPassword && (
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    )}
                  </View>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 8,
                        marginLeft: 2,
                      }}
                    >
                      <Ionicons name="close-circle" size={14} color="#EF4444" />
                      <Text style={{ fontSize: 11, color: "#EF4444", fontWeight: "600" }}>
                        Passwords don't match
                      </Text>
                    </View>
                  )}
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                  onPress={handleReset}
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
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Ionicons name="key" size={18} color="#fff" />
                        <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>
                          Reset Password
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
