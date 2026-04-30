import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import type { FormState, Action, PhotoState } from "./types";
import { API_BASE_URL, ApiError } from "@/src/services/api";

type Props = {
  state: FormState;
  dispatch: React.Dispatch<Action>;
};

const MAX_PHOTOS = 10;

export default function StepPhotos({ state, dispatch }: Props) {
  const { getToken } = useAuth();

  const pickPhoto = async () => {
    if (state.photos.length >= MAX_PHOTOS) {
      Alert.alert("Limit reached", `You can upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    const localId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    dispatch({
      type: "ADD_PHOTO",
      photo: { localId, uri: asset.uri, status: "uploading" },
    });

    uploadPhoto(asset, localId, getToken, dispatch);
  };

  const retryUpload = async (photo: PhotoState) => {
    if (!photo.uri) return;
    dispatch({
      type: "UPDATE_PHOTO",
      localId: photo.localId,
      patch: { status: "uploading", error: undefined },
    });
    uploadPhoto({ uri: photo.uri } as any, photo.localId, getToken, dispatch);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={styles.h1}>Show off your place</Text>
      <Text style={styles.sub}>
        Add 1–{MAX_PHOTOS} photos. The first photo is your cover. Bright, wide shots work
        best.
      </Text>

      <View style={styles.grid}>
        {state.photos.map((photo, idx) => (
          <PhotoTile
            key={photo.localId}
            photo={photo}
            isCover={idx === 0}
            onRemove={() => dispatch({ type: "REMOVE_PHOTO", localId: photo.localId })}
            onSetCover={() => dispatch({ type: "SET_COVER", localId: photo.localId })}
            onRetry={() => retryUpload(photo)}
          />
        ))}

        {state.photos.length < MAX_PHOTOS && (
          <TouchableOpacity
            onPress={pickPhoto}
            activeOpacity={0.7}
            style={styles.addTile}
          >
            <Ionicons name="add" size={32} color="#2563EB" />
            <Text style={styles.addText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function PhotoTile({
  photo,
  isCover,
  onRemove,
  onSetCover,
  onRetry,
}: {
  photo: PhotoState;
  isCover: boolean;
  onRemove: () => void;
  onSetCover: () => void;
  onRetry: () => void;
}) {
  const uri = photo.url || photo.uri;

  return (
    <View style={styles.tile}>
      {uri ? (
        <Image source={{ uri }} style={styles.tileImage} />
      ) : (
        <View style={[styles.tileImage, { backgroundColor: "#E2E8F0" }]} />
      )}

      {/* Status overlay */}
      {photo.status === "uploading" && (
        <View style={styles.overlay}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.overlayText}>Uploading…</Text>
        </View>
      )}
      {photo.status === "failed" && (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.8}
          style={[styles.overlay, { backgroundColor: "rgba(220, 38, 38, 0.75)" }]}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.overlayText}>Retry</Text>
        </TouchableOpacity>
      )}

      {/* Cover badge */}
      {isCover && photo.status === "uploaded" && (
        <View style={styles.coverBadge}>
          <Text style={styles.coverBadgeText}>COVER</Text>
        </View>
      )}

      {/* Set cover button (only if not cover and uploaded) */}
      {!isCover && photo.status === "uploaded" && (
        <TouchableOpacity
          onPress={onSetCover}
          activeOpacity={0.8}
          style={styles.setCoverBtn}
        >
          <Text style={styles.setCoverText}>Set cover</Text>
        </TouchableOpacity>
      )}

      {/* Remove button */}
      <TouchableOpacity onPress={onRemove} activeOpacity={0.8} style={styles.removeBtn}>
        <Ionicons name="close" size={14} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

async function uploadPhoto(
  asset: ImagePicker.ImagePickerAsset,
  localId: string,
  getToken: () => Promise<string | null>,
  dispatch: React.Dispatch<Action>
) {
  try {
    const token = await getToken();
    if (!token) throw new ApiError("Not authenticated", 401);

    const form = new FormData();
    form.append("image", {
      uri: asset.uri,
      name: (asset as any).fileName || `upload-${Date.now()}.jpg`,
      type: (asset as any).mimeType || "image/jpeg",
    } as any);

    const res = await fetch(`${API_BASE_URL}/uploads/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.url || !data.publicId) {
      throw new Error(data.message || "Upload failed");
    }

    dispatch({
      type: "UPDATE_PHOTO",
      localId,
      patch: {
        status: "uploaded",
        url: data.url,
        publicId: data.publicId,
      },
    });
  } catch (err: any) {
    dispatch({
      type: "UPDATE_PHOTO",
      localId,
      patch: { status: "failed", error: err?.message || "Upload failed" },
    });
  }
}

const styles = {
  h1: { fontSize: 22, fontWeight: "800" as const, color: "#0F172A", marginBottom: 6 },
  sub: { fontSize: 14, color: "#64748B", marginBottom: 20, lineHeight: 20 },
  grid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
  },
  tile: {
    width: "48%" as const,
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: "hidden" as const,
    backgroundColor: "#E2E8F0",
    position: "relative" as const,
  },
  tileImage: { width: "100%" as const, height: "100%" as const },
  addTile: {
    width: "48%" as const,
    aspectRatio: 4 / 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#BFDBFE",
    borderStyle: "dashed" as const,
    backgroundColor: "#F8FAFF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  addText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#2563EB",
    marginTop: 4,
  },
  overlay: {
    ...({
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    } as const),
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
  },
  overlayText: { color: "#fff", fontSize: 12, fontWeight: "700" as const },
  coverBadge: {
    position: "absolute" as const,
    top: 8,
    left: 8,
    backgroundColor: "#0F172A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  coverBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800" as const,
    letterSpacing: 0.5,
  },
  setCoverBtn: {
    position: "absolute" as const,
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  setCoverText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700" as const,
  },
  removeBtn: {
    position: "absolute" as const,
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};
