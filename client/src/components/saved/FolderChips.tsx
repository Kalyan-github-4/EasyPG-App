import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { WishlistFolder } from "./types";

type Props = {
  folders: WishlistFolder[];
  activeFolder: string;
  savedIds: string[];
  onSelect: (id: string) => void;
};

export default function FolderChips({ folders, activeFolder, savedIds, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingVertical: 14 }}
    >
      {folders.map((folder) => {
        const active = activeFolder === folder.id;
        const count = folder.pgIds.filter((id) => savedIds.includes(id)).length;
        const FolderIconComp = folder.Icon;
        return (
          <TouchableOpacity
            key={folder.id}
            onPress={() => onSelect(folder.id)}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 12,
              backgroundColor: active ? "#0F172A" : "#fff",
              borderWidth: 1,
              borderColor: active ? "#0F172A" : "#E2E8F0",
            }}
          >
            <FolderIconComp
              size={14}
              color={active ? "#fff" : "#64748B"}
              weight={active ? "fill" : "regular"}
            />
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: active ? "#fff" : "#334155" }}
            >
              {folder.name}
            </Text>
            <View
              style={{
                backgroundColor: active ? "rgba(255,255,255,0.22)" : "#F1F5F9",
                borderRadius: 8,
                paddingHorizontal: 6,
                paddingVertical: 2,
                minWidth: 22,
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "800", color: active ? "#fff" : "#94A3B8" }}
              >
                {count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
