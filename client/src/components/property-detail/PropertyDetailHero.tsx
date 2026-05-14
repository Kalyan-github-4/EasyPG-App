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
import { ArrowLeftIcon, HeartIcon, HouseIcon, ShareNetworkIcon } from "phosphor-react-native";
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
    <View className="h-[320px] bg-slate-200">
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
        <View className="items-center justify-center flex-1">
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
        style={{ top: topInset + 12 }}
        className="absolute items-center justify-center w-10 h-10 rounded-full left-4 bg-black/30"
      >
        <ArrowLeftIcon size={20} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToggleSave}
        disabled={savingToggle}
        style={{ top: topInset + 12 }}
        className={`absolute right-[66px] w-10 h-10 rounded-full items-center justify-center ${
          saved ? "bg-white/95" : "bg-black/30"
        }`}
      >
        <HeartIcon
          size={20}
          weight={saved ? "fill" : "regular"}
          color={saved ? "#EF4444" : "#fff"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onShare}
        style={{ top: topInset + 12 }}
        className="absolute items-center justify-center w-10 h-10 rounded-full right-4 bg-black/30"
      >
        <ShareNetworkIcon size={20} color="#fff" />
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
      <View className="absolute bottom-[30px] right-4 bg-black/55 rounded-2xl px-2.5 py-1">
        <Text className="text-xs font-bold text-white">
          {imgIndex + 1} / {photosLength}
        </Text>
      </View>
      <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
        {Array.from({ length: photosLength }).map((_, i) => (
          <View
            key={i}
            className={`h-1.5 rounded-full ${
              i === imgIndex ? "w-5 bg-white" : "w-1.5 bg-white/45"
            }`}
          />
        ))}
      </View>
    </>
  );
}