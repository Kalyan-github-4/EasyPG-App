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
import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

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

  // Focus tracking
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // ─── Sign Up ──────────────────────────────────────────

  const handleSignUp = useCallback(async () => {
    Keyboard.dismiss();
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
    Keyboard.dismiss();
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
      <View style={s.root}>
        <SafeAreaView edges={["top"]} style={s.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={s.flex}
          >
            <ScrollView
              contentContainerStyle={s.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Logo */}
              <View style={s.logoSection}>
                <Image
                  source={require("../../assets/images/logo.png")}
                  style={s.logo}
                  resizeMode="contain"
                />
              </View>

              {/* Verification Icon */}
              <View style={s.verifyIconWrap}>
                <View style={s.verifyIconCircle}>
                  <Ionicons name="mail-outline" size={32} color={BRAND} />
                </View>
              </View>

              <Text style={s.verifyHeading}>Check your email</Text>
              <Text style={s.verifySubtext}>
                We sent a 6-digit code to{"\n"}
                <Text style={{ fontWeight: "700", color: TEXT_PRIMARY }}>{email}</Text>
              </Text>

              {/* Error */}
              {error ? (
                <View style={s.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={ERROR_TEXT} />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Code Input */}
              <View style={[s.fieldGroup, { marginTop: 24 }]}>
                <Text style={s.label}>Verification Code</Text>
                <TextInput
                  style={s.codeInput}
                  placeholder="000000"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={verificationCode}
                  onChangeText={(t) => { setVerificationCode(t); setError(""); }}
                  editable={!isSubmitting}
                />
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                onPress={handleVerify}
                disabled={isSubmitting || verificationCode.length < 6}
                activeOpacity={0.85}
                style={[
                  s.primaryBtn,
                  (isSubmitting || verificationCode.length < 6) && s.primaryBtnDisabled,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.primaryBtnText}>Verify Email</Text>
                )}
              </TouchableOpacity>

              {/* Back */}
              <TouchableOpacity
                onPress={() => { setPendingVerification(false); setError(""); }}
                activeOpacity={0.6}
                style={s.backBtn}
              >
                <Ionicons name="arrow-back" size={16} color={BRAND} />
                <Text style={s.backBtnText}>Back to sign up</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Sign Up Form ─────────────────────────────────────

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
            {/* ── Logo & Brand ────────────────────────────── */}
            <View style={s.logoSection}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={s.logo}
                resizeMode="contain"
              />
              <Text style={s.brandName}>EasyPG</Text>
              <Text style={s.tagline}>Find Home, Away From Home</Text>
            </View>

            {/* ── Form ────────────────────────────────────── */}
            <View style={s.formSection}>
              <Text style={s.heading}>Create account</Text>
              <Text style={s.subheading}>Join EasyPG to get started</Text>

              {/* Error */}
              {error ? (
                <View style={s.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={ERROR_TEXT} />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Name Row */}
              <View style={s.nameRow}>
                <View style={s.nameField}>
                  <Text style={s.label}>First Name</Text>
                  <View
                    style={[
                      s.inputRow,
                      focusedField === "firstName" && s.inputRowFocused,
                    ]}
                  >
                    <TextInput
                      style={s.inputNoIcon}
                      placeholder="John"
                      placeholderTextColor={TEXT_MUTED}
                      returnKeyType="next"
                      value={firstName}
                      onChangeText={setFirstName}
                      onFocus={() => setFocusedField("firstName")}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => lastNameRef.current?.focus()}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
                <View style={s.nameField}>
                  <Text style={s.label}>Last Name</Text>
                  <View
                    style={[
                      s.inputRow,
                      focusedField === "lastName" && s.inputRowFocused,
                    ]}
                  >
                    <TextInput
                      ref={lastNameRef}
                      style={s.inputNoIcon}
                      placeholder="Doe"
                      placeholderTextColor={TEXT_MUTED}
                      returnKeyType="next"
                      value={lastName}
                      onChangeText={setLastName}
                      onFocus={() => setFocusedField("lastName")}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => emailRef.current?.focus()}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
              </View>

              {/* Email */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>
                  Email <Text style={{ color: ERROR_TEXT }}>*</Text>
                </Text>
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
                    ref={emailRef}
                    style={s.input}
                    placeholder="your@email.com"
                    placeholderTextColor={TEXT_MUTED}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    value={email}
                    onChangeText={(t) => { setEmail(t); setError(""); }}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>
                  Password <Text style={{ color: ERROR_TEXT }}>*</Text>
                </Text>
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
                    ref={passwordRef}
                    style={s.input}
                    placeholder="Create a strong password"
                    placeholderTextColor={TEXT_MUTED}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(""); }}
                    onFocus={() => {
                      setFocusedField("password");
                      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
                    }}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={handleSignUp}
                    editable={!isSubmitting}
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
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                onPress={handleSignUp}
                disabled={isSubmitting}
                activeOpacity={0.85}
                style={[
                  s.primaryBtn,
                  { marginTop: 8 },
                  isSubmitting && s.primaryBtnDisabled,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.primaryBtnText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={s.divider}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>or</Text>
                <View style={s.dividerLine} />
              </View>

              {/* Social Buttons */}
              <View style={s.socialRow}>
                <TouchableOpacity
                  onPress={handleGoogleSignUp}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                  style={s.socialBtn}
                >
                  <Ionicons name="logo-google" size={18} color="#4285F4" />
                  <Text style={s.socialBtnText}>Google</Text>
                </TouchableOpacity>

                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    onPress={handleAppleSignUp}
                    disabled={isSubmitting}
                    activeOpacity={0.7}
                    style={[s.socialBtn, s.socialBtnApple]}
                  >
                    <Ionicons name="logo-apple" size={18} color="#fff" />
                    <Text style={[s.socialBtnText, { color: "#fff" }]}>
                      Apple
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Sign In Link */}
              <View style={s.switchRow}>
                <Text style={s.switchText}>Already have an account?</Text>
                <Link href="/(auth)/sign-in" asChild>
                  <TouchableOpacity activeOpacity={0.6}>
                    <Text style={s.switchLink}> Sign In</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
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

  /* Logo */
  logoSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 4,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 6,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "800",
    color: BRAND,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },

  /* Form */
  formSection: {
    paddingTop: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    marginTop: 4,
    marginBottom: 20,
  },

  /* Error */
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

  /* Fields */
  fieldGroup: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  nameField: {
    flex: 1,
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
  inputNoIcon: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 2,
  },

  /* Code Input (verification) */
  codeInput: {
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: INPUT_BORDER,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    paddingVertical: 16,
    letterSpacing: 12,
  },

  /* Primary Button */
  primaryBtn: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* Divider */
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: INPUT_BORDER,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: "500",
  },

  /* Social */
  socialRow: {
    flexDirection: "row",
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: INPUT_BORDER,
  },
  socialBtnApple: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },

  /* Switch */
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

  /* Verify Screen */
  verifyIconWrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  verifyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyHeading: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 8,
  },
  verifySubtext: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 20,
  },

  /* Back button */
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
    paddingVertical: 8,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND,
  },
});
