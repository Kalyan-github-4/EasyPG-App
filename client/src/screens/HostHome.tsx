import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import {
  ArrowRight,
  CalendarBlank,
  Camera,
  ChatCircle,
  CurrencyInr,
  Eye,
  House,
  Lightning,
  PlusCircle,
  Star,
  TrendUp,
  Users,
  WarningCircle,
} from "phosphor-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useAppAuth } from "@/src/context/auth-context";
import * as api from "@/src/services/api";

import HostHeader from "@/src/components/host/HostHeader";
import PropertyFeaturedCard from "@/src/components/home/PropertyFeaturedCard";
import EmptyHostHome from "@/src/components/host/EmptyHostHome";
import { PropertyFeaturedRailSkeleton } from "@/src/components/home/PropertyFeaturedCardSkeleton";
import Skeleton from "@/src/components/ui/Skeleton";
import StatCard from "@/src/components/ui/StatCard";
import QuickAction from "@/src/components/ui/QuickAction";
import SectionHeader from "@/src/components/ui/SectionHeader";
import ListingInsightRow from "@/src/components/host/ListingInsightRow";
import TipCard from "@/src/components/host/TipCard";
import { formatShortRent } from "@/src/lib/format";

type Props = { firstName: string };

export default function HostHome({ firstName }: Props) {
  const { getToken } = useAuth();
  const { dbUser } = useAppAuth();
  const [properties, setProperties] = useState<api.Property[] | null>(null);
  const [bookings, setBookings] = useState<api.BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const [mine, bks] = await Promise.all([
        api.listMyProperties(token),
        api.listHostBookings(token).catch(() => [] as api.BookingRequest[]),
      ]);
      setProperties(mine);
      setBookings(bks);
    } catch (err: any) {
      setError(err?.message || "Couldn't load your properties");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  // ─── Computed data ──────────────────────────────
  const list = properties || [];
  const hasListings = list.length > 0;
  const availableCount = list.filter((p) => p.isAvailable).length;
  const totalRent = list.reduce((a, p) => a + p.rent, 0);
  const avgRent = hasListings ? Math.round(totalRent / list.length) : 0;
  const pendingCount = bookings.filter((b) => b.booking.status === "pending").length;
  const acceptedCount = bookings.filter((b) => b.booking.status === "accepted").length;
  const avgRating = hasListings
    ? (list.reduce((a, p) => a + p.rating, 0) / list.length).toFixed(1)
    : "—";
  const totalReviews = list.reduce((a, p) => a + p.reviewCount, 0);
  const propertiesWithPhotos = list.filter((p) => p.photos.length > 0).length;

  const subtitleText = hasListings
    ? `${list.length} ${list.length === 1 ? "listing" : "listings"} · ${availableCount} available`
    : "Let's get your first PG online";

  // ─── Navigation ────────────────────────────────
  const goToListings = () => router.push("/(app)/host/listings" as any);
  const goToProperty = (id: string) => router.push(`/(app)/host/property/${id}` as any);
  const goToProfile = () => router.push("/(app)/profile" as any);
  const goToBookings = () => router.push("/(app)/host/bookings" as any);
  const goToMessages = () => router.push("/(app)/inbox" as any);
  const goToAddProperty = () => router.push("/(app)/host/add-property" as any);

  // ─── Loading state ─────────────────────────────
  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
          <HostHeader firstName={firstName} avatarUrl={dbUser?.avatarUrl} subtitle="Loading your dashboard…" onProfilePress={goToProfile} />
          <View style={{ paddingHorizontal: 20, marginTop: 20, gap: 14 }}>
            <Skeleton width="100%" height={100} borderRadius={20} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Skeleton width="48%" height={90} borderRadius={18} />
              <Skeleton width="48%" height={90} borderRadius={18} />
            </View>
            <Skeleton width="100%" height={60} borderRadius={16} />
          </View>
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Skeleton width={140} height={20} />
          </View>
          <View style={{ marginTop: 14 }}>
            <PropertyFeaturedRailSkeleton count={3} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        <HostHeader
          firstName={firstName}
          avatarUrl={dbUser?.avatarUrl}
          subtitle={subtitleText}
          onProfilePress={goToProfile}
        />

        {/* Error banner */}
        {error ? (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              backgroundColor: "#FEF2F2",
              borderWidth: 1,
              borderColor: "#FECACA",
              borderRadius: 16,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <WarningCircle size={20} color="#DC2626" weight="fill" />
            <Text style={{ flex: 1, fontSize: 13, color: "#991B1B" }}>{error}</Text>
            <TouchableOpacity onPress={onRefresh}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#DC2626" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── Empty state ── */}
        {!hasListings && <EmptyHostHome onOpenListings={goToListings} />}

        {/* ── Dashboard ── */}
        {hasListings && (
          <>
            {/* ── Attention card ── */}
            {pendingCount > 0 ? (
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={goToBookings}
                style={{ marginHorizontal: 20, marginTop: 20, borderRadius: 22, overflow: "hidden" }}
              >
                <LinearGradient
                  colors={["#DC2626", "#F97316"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 20, flexDirection: "row", alignItems: "center", gap: 14 }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Lightning size={24} color="#fff" weight="fill" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: -0.3 }}>
                      {pendingCount} pending {pendingCount === 1 ? "request" : "requests"}
                    </Text>
                    <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                      Respond quickly to keep your rating high
                    </Text>
                  </View>
                  <ArrowRight size={18} color="#fff" weight="bold" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={goToBookings}
                style={{ marginHorizontal: 20, marginTop: 20, borderRadius: 22, overflow: "hidden" }}
              >
                <LinearGradient
                  colors={["#059669", "#10B981"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 20, flexDirection: "row", alignItems: "center", gap: 14 }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CalendarBlank size={24} color="#fff" weight="fill" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: -0.3 }}>
                      All caught up ✓
                    </Text>
                    <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                      {acceptedCount > 0 ? `${acceptedCount} accepted visit${acceptedCount === 1 ? "" : "s"}` : "No pending requests right now"}
                    </Text>
                  </View>
                  <ArrowRight size={18} color="#fff" weight="bold" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* ── Stats grid ── */}
            <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <StatCard
                  icon={<House size={20} color="#2563EB" weight="fill" />}
                  value={String(list.length)}
                  label="Total Listings"
                  bg="#EFF6FF"
                />
                <StatCard
                  icon={<Eye size={20} color="#10B981" weight="fill" />}
                  value={String(availableCount)}
                  label="Available"
                  bg="#ECFDF5"
                />
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <StatCard
                  icon={<CurrencyInr size={20} color="#F59E0B" weight="fill" />}
                  value={formatShortRent(avgRent)}
                  label="Avg Rent"
                  bg="#FFFBEB"
                />
                <StatCard
                  icon={<Star size={20} color="#8B5CF6" weight="fill" />}
                  value={avgRating}
                  label={`${totalReviews} review${totalReviews === 1 ? "" : "s"}`}
                  bg="#F5F3FF"
                />
              </View>
            </View>

            {/* ── Quick Actions ── */}
            <View style={{ marginTop: 24 }}>
              <SectionHeader title="Quick Actions" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
              >
                <QuickAction
                  icon={<PlusCircle size={22} color="#2563EB" weight="fill" />}
                  label="Add Property"
                  bg="#EFF6FF"
                  onPress={goToAddProperty}
                />
                <QuickAction
                  icon={<CalendarBlank size={22} color="#F59E0B" weight="fill" />}
                  label="Bookings"
                  bg="#FFFBEB"
                  badge={pendingCount > 0 ? pendingCount : undefined}
                  onPress={goToBookings}
                />
                <QuickAction
                  icon={<ChatCircle size={22} color="#10B981" weight="fill" />}
                  label="Messages"
                  bg="#ECFDF5"
                  onPress={goToMessages}
                />
                <QuickAction
                  icon={<House size={22} color="#8B5CF6" weight="fill" />}
                  label="All Listings"
                  bg="#F5F3FF"
                  onPress={goToListings}
                />
              </ScrollView>
            </View>

            {/* ── Listings rail ── */}
            <View style={{ marginTop: 28 }}>
              <SectionHeader title="Your Properties" actionLabel="See all" onAction={goToListings} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 8 }}
                decelerationRate="fast"
              >
                {list.map((p) => (
                  <PropertyFeaturedCard key={p.id} property={p} onPress={() => goToProperty(p.id)} />
                ))}
              </ScrollView>
            </View>

            {/* ── Property insights ── */}
            <View style={{ marginTop: 28 }}>
              <SectionHeader title="Listing Health" />
              <View style={{ paddingHorizontal: 20, gap: 10 }}>
                {list.slice(0, 4).map((p) => (
                  <ListingInsightRow key={p.id} property={p} onPress={() => goToProperty(p.id)} />
                ))}
                {list.length > 4 ? (
                  <TouchableOpacity
                    onPress={goToListings}
                    style={{
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB" }}>
                      View all {list.length} listings →
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* ── Host tips ── */}
            <View style={{ marginTop: 28 }}>
              <SectionHeader title="Boost Your Listings" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12, alignItems: "stretch" }}
              >
                <TipCard
                  Icon={Camera}
                  title="Add great photos"
                  body={`${propertiesWithPhotos}/${list.length} listings have photos. Listings with 5+ photos get 3x more inquiries.`}
                  gradient={["#2563EB", "#60A5FA"]}
                />
                <TipCard
                  Icon={Star}
                  title="Respond in 1 hour"
                  body="Fast replies help you rank higher in search results and build trust."
                  gradient={["#F59E0B", "#FBBF24"]}
                />
                <TipCard
                  Icon={TrendUp}
                  title="Stay competitive"
                  body={`Your average rent is ${formatShortRent(avgRent)}. Review nearby PGs to stay competitive.`}
                  gradient={["#10B981", "#34D399"]}
                />
                <TipCard
                  Icon={Users}
                  title="Complete your profile"
                  body="Hosts with a photo and phone number get 2x more bookings."
                  gradient={["#8B5CF6", "#A78BFA"]}
                />
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
