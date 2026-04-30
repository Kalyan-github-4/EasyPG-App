import { Stack } from "expo-router";
import { AuthProvider } from "@/src/context/auth-context";

export default function AppLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pg/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="pgs" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="become-host" options={{ animation: "slide_from_right" }} />
      </Stack>
    </AuthProvider>
  );
}
