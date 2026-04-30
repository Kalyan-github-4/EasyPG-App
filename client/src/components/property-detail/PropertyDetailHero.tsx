import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ArrowLeftIcon, HeartIcon, HouseIcon } from "phosphor-react-native";

import type { Property } from "@/src/services/api";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 320;

type Props = {
  property: Property;
  saved: boolean;
  savingToggle?: boolean;
  imgIndex: number;
  onImageScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onBack: () => void;
  onToggleSave: () => void;
  onShare: () => void;
  topInset: number;
};

export default function PropertyDetailHero({
  property,
  saved,
  savingToggle,
  imgIndex,
  onImageScroll,
  onBack,
  onToggleSave,
  onShare,
  topInset,
}: Props) {
  const photos = property.photos;
  const hasPhotos = photos.length > 0;

  return (
    <View style={{ height: HERO_HEIGHT, backgroundColor: "#E2E8F0" }}>
      {hasPhotos ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onImageScroll}
          scrollEventThrottle={16}
        >
          {photos.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: photo.url }}
              style={{ width, height: HERO_HEIGHT }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <HouseIcon size={64} color="#94A3B8" weight="duotone" />
        </View>
      )}

      <HeaderActionButtons
        topInset={topInset}
        saved={saved}
        savingToggle={savingToggle}
        onBack={onBack}
        onToggleSave={onToggleSave}
        onShare={onShare}
      />

      {hasPhotos && photos.length > 1 ? (
        <CounterDots photosLength={photos.length} imgIndex={imgIndex} />
      ) : null}
    </View>
  );
}

function HeaderActionButtons({
  topInset,
  saved,
  savingToggle,
  onBack,
  onToggleSave,
  onShare,
}: {
  topInset: number;
  saved: boolean;
  savingToggle?: boolean;
  onBack: () => void;
  onToggleSave: () => void;
  onShare: () => void;
}) {
  return (
    <>
      <TouchableOpacity
        onPress={onBack}
        style={{
          position: "absolute",
          top: topInset + 12,
          left: 16,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "rgba(0,0,0,0.32)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowLeftIcon size={20} color="#fff" weight="bold" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToggleSave}
        disabled={savingToggle}
        style={{
          position: "absolute",
          top: topInset + 12,
          right: 66,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: saved ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.32)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <HeartIcon
          size={20}
          weight={saved ? "fill" : "regular"}
          color={saved ? "#EF4444" : "#fff"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onShare}
        style={{
          position: "absolute",
          top: topInset + 12,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "rgba(0,0,0,0.32)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="share-social-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </>
  );
}

function CounterDots({
  photosLength,
  imgIndex,
}: {
  photosLength: number;
  imgIndex: number;
}) {
  return (
    <>
      <View
        style={{
          position: "absolute",
          bottom: 14,
          right: 16,
          backgroundColor: "rgba(0,0,0,0.55)",
          borderRadius: 12,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
          {imgIndex + 1} / {photosLength}
        </Text>
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 16,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {Array.from({ length: photosLength }).map((_, i) => (
          <View
            key={i}
            style={{
              width: i === imgIndex ? 20 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === imgIndex ? "#fff" : "rgba(255,255,255,0.45)",
            }}
          />
        ))}
      </View>
    </>
  );
}