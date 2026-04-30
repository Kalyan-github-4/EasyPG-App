import React from "react";
import { useUser } from "@clerk/clerk-expo";
import { useAppAuth } from "@/src/context/auth-context";
import GuestHome from "./GuestHome";
import HostHome from "./HostHome";

export default function HomeScreen() {
  const { dbUser } = useAppAuth();
  const { user: clerkUser } = useUser();

  const isHost = dbUser?.role === "host";

  // Prefer DB name → fall back to Clerk's firstName → then "there"
  const firstName =
    dbUser?.name?.split(" ")[0] ||
    clerkUser?.firstName ||
    "there";

  if (isHost) return <HostHome firstName={firstName} />;
  return <GuestHome firstName={firstName} />;
}
