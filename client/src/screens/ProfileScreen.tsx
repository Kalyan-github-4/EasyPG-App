import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAppAuth } from "@/src/context/auth-context";
import * as api from "@/src/services/api";
import { pickAndUploadAvatar } from "@/src/services/uploads";

import ProfileHeader from "@/src/components/profile/ProfileHeader";
import ProfileCard from "@/src/components/profile/ProfileCard";
import BecomeHostCTA from "@/src/components/profile/BecomeHostCTA";
import SignOutButton from "@/src/components/profile/SignOutButton";
import {
  SectionLabel,
  MenuCard,
  MenuItem,
  Divider,
} from "@/src/components/profile/MenuPrimitives";

type ProfileStat = {
  value: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function ProfileScreen() {
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const { dbUser, refreshUser } = useAppAuth();
  const router = useRouter();

  const [switching, setSwitching] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [stats, setStats] = useState<ProfileStat[]>([
    { value: "0", label: "Saved", icon: "heart-outline" },
    { value: "0", label: "Visited", icon: "eye-outline" },
    { value: "0", label: "Reviews", icon: "star-outline" },
  ]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  const handleChangeAvatar = async () => {
    if (uploadingAvatar) return;
    try {
      setUploadingAvatar(true);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const picked = await pickAndUploadAvatar(token);
      if (!picked) return; // cancelled or permission denied
      await api.updateProfile(token, { avatarUrl: picked.url });
      await refreshUser();
    } catch (err: any) {
      Alert.alert("Couldn't update photo", err?.message || "Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSwitchToGuest = () => {
    Alert.alert(
      "Switch to guest view?",
      "Your listings stay saved but won't be visible to you until you switch back. You can return to host view anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: async () => {
            setSwitching(true);
            try {
              const token = await getToken();
              if (!token) throw new Error("Not authenticated");
              await api.setRole(token, "guest");
              await refreshUser();
              router.replace("/(app)/(tabs)");
            } catch (err: any) {
              Alert.alert(
                "Couldn't switch",
                err?.message || "Please try again."
              );
            } finally {
              setSwitching(false);
            }
          },
        },
      ]
    );
  };

  const handleSwitchToHost = async () => {
    setSwitching(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await api.setRole(token, "host");
      await refreshUser();
      router.replace("/(app)/(tabs)");
    } catch (err: any) {
      Alert.alert("Couldn't switch", err?.message || "Please try again.");
    } finally {
      setSwitching(false);
    }
  };

  const avatarUrl = dbUser?.avatarUrl || clerkUser?.imageUrl;
  const displayName = dbUser?.name || clerkUser?.fullName || "User";
  const email =
    dbUser?.email || clerkUser?.primaryEmailAddress?.emailAddress || "";
  const role = dbUser?.role || "guest";
  const isHost = role === "host";
  const hasHostProfile = Boolean(dbUser?.hostProfileCompleted);
  const memberSince = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "New";

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const token = await getToken();
        if (!token || !active) return;

        const savedPromise = api.listSavedIds(token).catch(() => [] as string[]);
        const visitedPromise = isHost
          ? api.listHostBookings(token).catch(() => [] as api.BookingRequest[])
          : api.listMyBookings(token).catch(() => [] as api.BookingRequest[]);
        const reviewsPromise = isHost
          ? api.listMyProperties(token).catch(() => [] as api.Property[])
          : Promise.resolve([] as api.Property[]);

        const [savedIds, visits, myProperties] = await Promise.all([
          savedPromise,
          visitedPromise,
          reviewsPromise,
        ]);

        if (!active) return;

        const reviewCount = myProperties.reduce(
          (total, property) => total + property.reviewCount,
          0
        );

        setStats([
          { value: String(savedIds.length), label: "Saved", icon: "heart-outline" },
          { value: String(visits.length), label: "Visited", icon: "eye-outline" },
          { value: String(reviewCount), label: "Reviews", icon: "star-outline" },
        ]);
      } catch {
        // Keep fallback values when stats can't be loaded.
      }
    };

    loadStats();

    return () => {
      active = false;
    };
  }, [getToken, isHost]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <ProfileHeader />

        <ProfileCard
          avatarUrl={avatarUrl}
          displayName={displayName}
          email={email}
          isHost={isHost}
          memberSince={memberSince}
          uploadingAvatar={uploadingAvatar}
          onAvatarPress={handleChangeAvatar}
          stats={stats}
        />

        {!isHost && (
          <BecomeHostCTA
            title={hasHostProfile ? "Switch to host" : "Become a Host"}
            subtitle={
              hasHostProfile
                ? "Return to host view without filling the form again"
                : "List your PG and start earning"
            }
            buttonLabel={hasHostProfile ? "Switch" : "Continue"}
            iconName={hasHostProfile ? "swap-horizontal" : "home"}
            onPress={hasHostProfile ? handleSwitchToHost : () => router.push("/(app)/become-host")}
          />
        )}

        {/* ── Account section ── */}
        <SectionLabel label="Account" />
        <MenuCard>
          <MenuItem
            icon="person-outline"
            label="Personal Info"
            subtitle="Name, phone, email"
            onPress={() => router.push("/(app)/profile/edit" as any)}
          />
        </MenuCard>

        {/* ── Activity — guests only ── */}
        {!isHost && (
          <>
            <SectionLabel label="Activity" />
            <MenuCard>
              <MenuItem
                icon="calendar-outline"
                label="My Visits"
                subtitle="Visit requests you've sent"
                onPress={() => router.push("/(app)/visits" as any)}
              />
              <Divider />
              <MenuItem
                icon="chatbubble-outline"
                label="Messages"
                subtitle="Conversations with hosts"
                onPress={() => router.push("/(app)/inbox" as any)}
              />
            </MenuCard>
          </>
        )}

        {/* ── Hosting section — hosts only ── */}
        {isHost && (
          <>
            <SectionLabel label="Hosting" />
            <MenuCard>
              <MenuItem
                icon="calendar-outline"
                label="Visit Requests"
                subtitle="Guests wanting to tour"
                onPress={() => router.push("/(app)/host/bookings" as any)}
              />
              <Divider />
              <MenuItem
                icon="chatbubble-outline"
                label="Guest Messages"
                subtitle="Inquiries from guests"
                onPress={() => router.push("/(app)/inbox" as any)}
              />
              <Divider />
              <MenuItem
                icon="swap-horizontal-outline"
                label="Switch to guest view"
                subtitle="Browse PGs as a guest"
                onPress={handleSwitchToGuest}
                loading={switching}
              />
            </MenuCard>
          </>
        )}

        <SignOutButton onPress={handleSignOut} />

        <Text
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#CBD5E1",
            marginTop: 20,
          }}
        >
          EasyPG v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
