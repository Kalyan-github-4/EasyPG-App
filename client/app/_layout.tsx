import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
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
 *
 * NOTE: segments is [] on the very first render before the router
 * has mounted. We skip redirect logic until segments is non-empty
 * to avoid a flash-to-sign-in on cold start.
 */
function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Not ready yet — wait for Clerk and for the router to determine the segment
    if (!isLoaded || segments[0] === undefined) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (isSignedIn && inAuthGroup) {
      router.replace("/(app)/(tabs)");
    }
  }, [isSignedIn, isLoaded, segments, router]);

  if (!isLoaded) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", gap: 24 }}
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={{ width: 72, height: 72 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
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
      <SafeAreaProvider>
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
            <StatusBar style="auto" />
          </ThemeProvider>
        </ClerkLoaded>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
