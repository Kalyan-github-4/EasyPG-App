import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { TokenCache } from "@clerk/clerk-expo";

/**
 * Secure token cache for Clerk using expo-secure-store.
 * Falls back to no-op on web where SecureStore isn't available.
 */
function createTokenCache(): TokenCache {
  return {
    async getToken(key: string) {
      try {
        const item = await SecureStore.getItemAsync(key);
        if (item) {
          console.log(`[TokenCache] Found cached token for key: ${key.substring(0, 10)}...`);
        }
        return item;
      } catch (error) {
        console.error("[TokenCache] getToken error:", error);
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    async saveToken(key: string, token: string) {
      try {
        await SecureStore.setItemAsync(key, token);
      } catch (error) {
        console.error("[TokenCache] saveToken error:", error);
      }
    },
    async clearToken(key: string) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error("[TokenCache] clearToken error:", error);
      }
    },
  };
}

// SecureStore is not available on web
export const tokenCache = Platform.OS !== "web" ? createTokenCache() : undefined;
