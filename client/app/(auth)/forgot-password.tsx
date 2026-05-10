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
  Keyboard,
  StyleSheet,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type Stage = "email" | "otp" | "reset";

const BRAND = "#2563EB";
const BRAND_LIGHT = "#EFF6FF";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";
const TEXT_MUTED = "#9CA3AF";
const BG = "#FFFFFF";
const INPUT_BG = "#F9FAFB";
const INPUT_BORDER = "#E5E7EB";
const INPUT_FOCUS = "#2563EB";
const ERROR_BG = "#FEF2F2";
const ERROR_BORDER = "#FECACA";
const ERROR_TEXT = "#DC2626";
const SUCCESS = "#10B981";
const SUCCESS_BG = "#F0FDF4";
const INFO_BG = "#EFF6FF";
const INFO_BORDER = "#BFDBFE";

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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const confirmRef = useRef<TextInput>(null);

  // ─── Stage 1: Request reset code ─────────────────

  const handleSendCode = useCallback(async () => {
    Keyboard.dismiss();
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
    setError("");
    setInfo("");
    setStage("reset");
  }, [otp]);

  // ─── Stage 3: Set new password ────────────────────

  const handleReset = useCallback(async () => {
    Keyboard.dismiss();
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

  const stageConfig = {
    email: {
      title: "Forgot password?",
      subtitle: "Enter your email and we'll send you a reset code.",
      icon: "mail-outline" as const,
    },
    otp: {
      title: "Verify your email",
      subtitle: `Enter the 6-digit code sent to ${email}`,
      icon: "shield-checkmark-outline" as const,
    },
    reset: {
      title: "Create new password",
      subtitle: "Your identity is verified. Set a new password.",
      icon: "key-outline" as const,
    },
  };

  // ─── UI ──────────────────────────────────────────

  return (
    <View style={s.root}>
      <SafeAreaView edges={["top"]} style={s.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={s.flex}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* ── Top Bar ─────────────────────────────── */}
            <View style={s.topBar}>
              <TouchableOpacity
                onPress={handleBack}
                activeOpacity={0.6}
                style={s.backButton}
              >
                <Ionicons name="arrow-back" size={20} color={TEXT_PRIMARY} />
              </TouchableOpacity>

              <Image
                source={require("../../assets/images/logo.png")}
                style={s.topLogo}
                resizeMode="contain"
              />

              {/* Spacer for alignment */}
              <View style={{ width: 40 }} />
            </View>

            {/* ── Step Progress ────────────────────────── */}
            <View style={s.progressRow}>
              {stages.map((stg, i) => (
                <View
                  key={stg}
                  style={[
                    s.progressDot,
                    i <= currentStepIndex ? s.progressDotActive : s.progressDotInactive,
                    i < stages.length - 1 ? { marginRight: 8 } : {},
                  ]}
                />
              ))}
            </View>

            {/* ── Stage Icon + Title ──────────────────── */}
            <View style={s.stageHeader}>
              <View style={s.stageIconCircle}>
                <Ionicons name={stageConfig[stage].icon} size={24} color={BRAND} />
              </View>
              <Text style={s.heading}>{stageConfig[stage].title}</Text>
              <Text style={s.subheading}>{stageConfig[stage].subtitle}</Text>
            </View>

            {/* ── Error / Info ─────────────────────────── */}
            {error ? (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle" size={16} color={ERROR_TEXT} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            {info ? (
              <View style={s.infoBox}>
                <Ionicons name="information-circle" size={16} color={BRAND} />
                <Text style={s.infoText}>{info}</Text>
              </View>
            ) : null}

            {/* ═══════ STAGE 1: EMAIL ═══════ */}
            {stage === "email" && (
              <>
                <View style={s.fieldGroup}>
                  <Text style={s.label}>Email Address</Text>
                  <View
                    style={[
                      s.inputRow,
                      focusedField === "email" && s.inputRowFocused,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={focusedField === "email" ? BRAND : TEXT_MUTED}
                    />
                    <TextInput
                      style={s.input}
                      placeholder="your@email.com"
                      placeholderTextColor={TEXT_MUTED}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      value={email}
                      onChangeText={(t) => { setEmail(t); setError(""); }}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={handleSendCode}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSendCode}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                  style={[s.primaryBtn, isSubmitting && s.primaryBtnDisabled]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={s.primaryBtnText}>Send Reset Code</Text>
                  )}
                </TouchableOpacity>

                <View style={s.switchRow}>
                  <Text style={s.switchText}>Remembered it?</Text>
                  <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6}>
                    <Text style={s.switchLink}> Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ═══════ STAGE 2: OTP VERIFICATION ═══════ */}
            {stage === "otp" && (
              <>
                {/* OTP Input Boxes */}
                <View style={s.otpRow}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => { otpRefs.current[index] = ref; }}
                      style={[
                        s.otpBox,
                        digit ? s.otpBoxFilled : {},
                      ]}
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
                  style={[
                    s.primaryBtn,
                    (isSubmitting || otp.join("").length !== 6) && s.primaryBtnDisabled,
                  ]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={s.primaryBtnText}>Verify Code</Text>
                  )}
                </TouchableOpacity>

                {/* Resend */}
                <View style={s.switchRow}>
                  <Text style={s.switchText}>Didn&apos;t get the code?</Text>
                  <TouchableOpacity onPress={handleResend} disabled={isSubmitting} activeOpacity={0.6}>
                    <Text style={s.switchLink}> Resend</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ═══════ STAGE 3: NEW PASSWORD ═══════ */}
            {stage === "reset" && (
              <>
                {/* Verified Badge */}
                <View style={s.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={SUCCESS} />
                  <Text style={s.verifiedText}>Email Verified</Text>
                </View>

                {/* New Password */}
                <View style={s.fieldGroup}>
                  <Text style={s.label}>New Password</Text>
                  <View
                    style={[
                      s.inputRow,
                      focusedField === "password" && s.inputRowFocused,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={focusedField === "password" ? BRAND : TEXT_MUTED}
                    />
                    <TextInput
                      style={s.input}
                      placeholder="At least 8 characters"
                      placeholderTextColor={TEXT_MUTED}
                      secureTextEntry={!showPassword}
                      returnKeyType="next"
                      value={password}
                      onChangeText={(t) => { setPassword(t); setError(""); }}
                      onFocus={() => {
                        setFocusedField("password");
                        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
                      }}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => confirmRef.current?.focus()}
                      editable={!isSubmitting}
                      autoFocus
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      activeOpacity={0.6}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={focusedField === "password" ? BRAND : TEXT_MUTED}
                      />
                    </TouchableOpacity>
                  </View>
                  {/* Strength hint */}
                  {password.length > 0 && (
                    <View style={s.hintRow}>
                      <Ionicons
                        name={password.length >= 8 ? "checkmark-circle" : "close-circle"}
                        size={14}
                        color={password.length >= 8 ? SUCCESS : ERROR_TEXT}
                      />
                      <Text
                        style={[
                          s.hintText,
                          { color: password.length >= 8 ? SUCCESS : ERROR_TEXT },
                        ]}
                      >
                        {password.length >= 8
                          ? "Password is strong enough"
                          : `${8 - password.length} more character${8 - password.length !== 1 ? "s" : ""} needed`}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Confirm Password */}
                <View style={s.fieldGroup}>
                  <Text style={s.label}>Confirm Password</Text>
                  <View
                    style={[
                      s.inputRow,
                      focusedField === "confirm" && s.inputRowFocused,
                      confirmPassword.length > 0 && password !== confirmPassword
                        ? { borderColor: ERROR_BORDER }
                        : {},
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={focusedField === "confirm" ? BRAND : TEXT_MUTED}
                    />
                    <TextInput
                      ref={confirmRef}
                      style={s.input}
                      placeholder="Re-enter new password"
                      placeholderTextColor={TEXT_MUTED}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      value={confirmPassword}
                      onChangeText={(t) => { setConfirmPassword(t); setError(""); }}
                      onFocus={() => {
                        setFocusedField("confirm");
                        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
                      }}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={handleReset}
                      editable={!isSubmitting}
                    />
                    {confirmPassword.length > 0 && password === confirmPassword && (
                      <Ionicons name="checkmark-circle" size={18} color={SUCCESS} />
                    )}
                  </View>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <View style={s.hintRow}>
                      <Ionicons name="close-circle" size={14} color={ERROR_TEXT} />
                      <Text style={[s.hintText, { color: ERROR_TEXT }]}>
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
                  style={[s.primaryBtn, isSubmitting && s.primaryBtnDisabled]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={s.primaryBtnText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  /* Top Bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: INPUT_BG,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: INPUT_BORDER,
  },
  topLogo: {
    width: 36,
    height: 36,
  },

  /* Progress */
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  progressDotActive: {
    backgroundColor: BRAND,
  },
  progressDotInactive: {
    backgroundColor: INPUT_BORDER,
  },

  /* Stage Header */
  stageHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  stageIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  subheading: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  /* Error / Info */
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: ERROR_BG,
    borderWidth: 1,
    borderColor: ERROR_BORDER,
    borderRadius: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: ERROR_TEXT,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: INFO_BG,
    borderWidth: 1,
    borderColor: INFO_BORDER,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: BRAND,
    lineHeight: 18,
  },

  /* Fields */
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: INPUT_BORDER,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputRowFocused: {
    borderColor: INPUT_FOCUS,
    backgroundColor: BRAND_LIGHT,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    paddingVertical: 14,
  },

  /* Hints */
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginLeft: 2,
  },
  hintText: {
    fontSize: 12,
    fontWeight: "600",
  },

  /* OTP */
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 28,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: INPUT_BG,
    borderWidth: 2,
    borderColor: INPUT_BORDER,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  otpBoxFilled: {
    backgroundColor: BRAND_LIGHT,
    borderColor: BRAND,
  },

  /* Primary Button */
  primaryBtn: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* Switch Row */
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  switchText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND,
  },

  /* Verified Badge */
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    backgroundColor: SUCCESS_BG,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "700",
    color: SUCCESS,
  },
});
