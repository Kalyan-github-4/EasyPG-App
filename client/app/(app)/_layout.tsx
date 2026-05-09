import { Stack } from "expo-router";
import { AuthProvider } from "@/src/context/auth-context";

export default function AppLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen name="pg/[id]" />
        <Stack.Screen name="pgs" />
        <Stack.Screen name="become-host" />
        <Stack.Screen name="search" />
        <Stack.Screen name="visits" />
        <Stack.Screen name="host/add-property" />
        <Stack.Screen name="host/bookings" />
        <Stack.Screen name="host/listings" />
        <Stack.Screen name="host/property/[id]/index" />
        <Stack.Screen name="host/property/[id]/edit" />
        <Stack.Screen name="host/property/[id]/members/index" />
        <Stack.Screen name="host/property/[id]/members/[memberId]" />
        <Stack.Screen name="inbox/index" />
        <Stack.Screen name="inbox/[id]" />
        <Stack.Screen name="profile/edit" />
      </Stack>
    </AuthProvider>
  );
}

