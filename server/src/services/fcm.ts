import { db } from "../db/index.js";
import { notifications, userDevices } from "../db/schema/index.js";
import { eq } from "drizzle-orm";

/**
 * Send push notification via Expo Push API
 * No Firebase needed — uses Expo tokens directly
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  // 1. Save to notifications table
  await db.insert(notifications).values({
    userId,
    title,
    body,
    type: data?.type || "general",
    referenceId: data?.referenceId || null,
    isRead: false,
  });

  // 2. Get all Expo tokens for user
  const devices = await db
    .select()
    .from(userDevices)
    .where(eq(userDevices.userId, userId));

  if (devices.length === 0) {
    console.log(`[Push] No devices registered for user ${userId}`);
    return;
  }

  // 3. Send push via Expo Push API
  const tickets: string[] = [];
  const staleTokens: string[] = [];

  for (const device of devices) {
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: device.fcmToken,
          sound: "default",
          title,
          body,
          data: data || {},
        }),
      });

      const result = await response.json();

      if (result.errors?.length > 0) {
        console.error(`[Push] Error sending to ${device.fcmToken}:`, result.errors);
        
        // Check if token is invalid (stale)
        if (
          result.errors[0]?.code === "INVALID_EXPIRATION_TIME" ||
          result.errors[0]?.code === "DEVICE_NOT_FOUND"
        ) {
          staleTokens.push(device.fcmToken);
        }
      } else if (result.data?.id) {
        tickets.push(result.data.id);
        console.log(`[Push] Sent to ${device.fcmToken}, ticket: ${result.data.id}`);
      }
    } catch (error) {
      console.error(`[Push] Failed to send to ${device.fcmToken}:`, error);
    }
  }

  // 4. Remove stale tokens
  for (const token of staleTokens) {
    console.log(`[Push] Removing stale token: ${token}`);
    await db.delete(userDevices).where(eq(userDevices.fcmToken, token));
  }

  return { tickets, staleTokens };
}