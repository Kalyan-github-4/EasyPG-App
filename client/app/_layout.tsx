import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import "react-native-reanimated";

import { tokenCache } from "@/src/lib/clerk-token-cache";

import "@/global.css";

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in your .env file."
  );
}

/**
 * Navigation guard: redirects based on Clerk auth state.
 * - Not signed in → (auth)
 * - Signed in → (app)
 */
function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthGroup) {
      // Not signed in, redirect to sign-in
      router.replace("/(auth)/sign-in");
    } else if (isSignedIn && inAuthGroup) {
      // Signed in but still on auth screens, redirect to app
      router.replace("/(app)/(tabs)");
    }
  }, [isSignedIn, isLoaded, segments]);

  if (!isLoaded) {
    return (
      <LinearGradient
        colors={["#0F0F1A", "#1A1A2E", "#16213E"]}
        style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 32 }}
      >
        <Image
          source={require("../assets/images/icon.png")}
          style={{ width: 160, height: 60 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#818CF8" />
      </LinearGradient>
    );
  }

  return <>{children}</>;
}

/**
 * Root layout — wraps the entire app in:
 * 1. ClerkProvider (auth state)
 * 2. NavigationGuard (auth redirects)
 * 3. ThemeProvider (consistent dark theme)
 *
 * Route groups:
 * - (auth) — sign-in / sign-up (unauthenticated users)
 * - (app)  — main app with AuthProvider + tabs (authenticated users)
 */
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ThemeProvider value={DefaultTheme}>
          <NavigationGuard>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
            </Stack>
          </NavigationGuard>
          <StatusBar style="light" />
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
