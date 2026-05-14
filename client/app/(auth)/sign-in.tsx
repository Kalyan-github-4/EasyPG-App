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
import { useSignIn, useSSO } from "@clerk/clerk-expo";
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

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const passwordRef = useRef<TextInput>(null);

  // ─── Email/Password Sign In ───────────────────────────

  const handleSignIn = useCallback(async () => {
    Keyboard.dismiss();
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
      } else if (result.status === "needs_first_factor") {
        // Clerk requires an explicit first-factor attempt (some configurations)
        const factorResult = await signIn.attemptFirstFactor({
          strategy: "password",
          password,
        });
        if (factorResult.status === "complete") {
          await setActive({ session: factorResult.createdSessionId });
          router.replace("/(app)/(tabs)");
        } else if (factorResult.status === "needs_second_factor") {
          setError(
            "Two-factor authentication is required for this account. Please use the Clerk dashboard to sign in."
          );
        } else {
          setError(
            `Sign-in incomplete (status: ${factorResult.status}). Please contact support.`
          );
        }
      } else if (result.status === "needs_second_factor") {
        setError(
          "Two-factor authentication is required. Please sign in via web or contact support."
        );
      } else {
        console.warn("Clerk sign-in unexpected status:", result.status, result);
        setError(
          `Unexpected sign-in status (${result.status}). Please try again.`
        );
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
              <Text style={s.heading}>Welcome back</Text>
              <Text style={s.subheading}>Sign in to your account</Text>

              {/* Error */}
              {error ? (
                <View style={s.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={ERROR_TEXT} />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Email */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Email</Text>
                <View
                  style={[
                    s.inputRow,
                    emailFocused && s.inputRowFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={emailFocused ? BRAND : TEXT_MUTED}
                  />
                  <TextInput
                    style={s.input}
                    placeholder="your@email.com"
                    placeholderTextColor={TEXT_MUTED}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    value={email}
                    onChangeText={(t) => { setEmail(t); setError(""); }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Password</Text>
                <View
                  style={[
                    s.inputRow,
                    passwordFocused && s.inputRowFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={passwordFocused ? BRAND : TEXT_MUTED}
                  />
                  <TextInput
                    ref={passwordRef}
                    style={s.input}
                    placeholder="Enter your password"
                    placeholderTextColor={TEXT_MUTED}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(""); }}
                    onFocus={() => {
                      setPasswordFocused(true);
                      // Scroll down so the password field stays visible above keyboard
                      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
                    }}
                    onBlur={() => setPasswordFocused(false)}
                    onSubmitEditing={handleSignIn}
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
                      color={passwordFocused ? BRAND : TEXT_MUTED}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <View style={s.forgotRow}>
                <Link href="/(auth)/forgot-password" asChild>
                  <TouchableOpacity activeOpacity={0.6}>
                    <Text style={s.forgotText}>Forgot password?</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={handleSignIn}
                disabled={isSubmitting}
                activeOpacity={0.85}
                style={[
                  s.primaryBtn,
                  isSubmitting && s.primaryBtnDisabled,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.primaryBtnText}>Sign In</Text>
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
                  onPress={handleGoogleSignIn}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                  style={s.socialBtn}
                >
                  <Ionicons name="logo-google" size={18} color="#4285F4" />
                  <Text style={s.socialBtnText}>Google</Text>
                </TouchableOpacity>

                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    onPress={handleAppleSignIn}
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

              {/* Sign Up Link */}
              <View style={s.switchRow}>
                <Text style={s.switchText}>Don&apos;t have an account?</Text>
                <Link href="/(auth)/sign-up" asChild>
                  <TouchableOpacity activeOpacity={0.6}>
                    <Text style={s.switchLink}> Sign Up</Text>
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
    paddingTop: 32,
    paddingBottom: 8,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "800",
    color: BRAND,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },

  /* Form */
  formSection: {
    paddingTop: 28,
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
    marginBottom: 24,
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

  /* Forgot */
  forgotRow: {
    alignItems: "flex-end",
    marginBottom: 24,
    marginTop: 2,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND,
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
    opacity: 0.7,
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
    marginVertical: 24,
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
    marginTop: 28,
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
});
