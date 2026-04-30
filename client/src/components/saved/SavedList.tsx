import React from "react";
import { FlatList } from "react-native";
import SavedPGCard from "./SavedPGCard";
import { PGListing } from "@/src/data/pgData";

type Props = {
  data: PGListing[];
  onRemove: (id: string) => void;
};

export default function SavedList({ data, onRemove }: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SavedPGCard
          pg={item}
          onRemove={() => onRemove(item.id)}
        />
      )}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    />
  );
}