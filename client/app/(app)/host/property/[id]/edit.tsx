import React from "react";
import { useLocalSearchParams } from "expo-router";
import AddPropertyScreen from "@/src/screens/AddPropertyScreen";

export default function EditPropertyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AddPropertyScreen editId={id} />;
}
