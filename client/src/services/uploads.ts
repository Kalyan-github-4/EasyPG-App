import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { API_BASE_URL, ApiError } from "./api";

export type UploadedImage = { url: string; publicId: string };

type UploadResponse = { success: true; url: string; publicId: string };

/**
 * Prompt the user to pick an image, then upload it to our backend
 * which proxies to Cloudinary. Returns { url, publicId } or null if cancelled.
 */
export async function pickAndUploadImage(
  token: string | null
): Promise<UploadedImage | null> {
  if (!token) throw new ApiError("Not authenticated", 401);

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert(
      "Permission needed",
      "Please allow photo library access to upload images."
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  return uploadAsset(result.assets[0], token, "/uploads/image");
}

/**
 * Prompt for a profile photo (square crop) and upload to /uploads/avatar.
 * Returns { url, publicId } or null if cancelled / permission denied.
 */
export async function pickAndUploadAvatar(
  token: string | null
): Promise<UploadedImage | null> {
  if (!token) throw new ApiError("Not authenticated", 401);

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert(
      "Permission needed",
      "Please allow photo library access to update your profile picture."
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  return uploadAsset(result.assets[0], token, "/uploads/avatar");
}

async function uploadAsset(
  asset: ImagePicker.ImagePickerAsset,
  token: string,
  path: string
): Promise<UploadedImage> {
  const form = new FormData();
  form.append("image", {
    uri: asset.uri,
    name: asset.fileName || `upload-${Date.now()}.jpg`,
    type: asset.mimeType || "image/jpeg",
  } as any);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const data = (await res.json().catch(() => ({}))) as Partial<UploadResponse> & {
    message?: string;
  };

  if (!res.ok || !data.url || !data.publicId) {
    throw new ApiError(data.message || "Upload failed", res.status, data);
  }

  return { url: data.url, publicId: data.publicId };
}
