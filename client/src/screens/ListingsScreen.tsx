import React from "react";
import { useAppAuth } from "@/src/context/auth-context";
import SavedScreen from "./SavedScreen";
import HostListings from "./HostListings";

export default function ListingsScreen() {
  const { dbUser } = useAppAuth();
  const isHost = dbUser?.role === "host";

  if (isHost) return <HostListings />;
  return <SavedScreen />;
}
