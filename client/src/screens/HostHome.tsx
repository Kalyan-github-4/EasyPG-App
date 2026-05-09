import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  MapPin,
  PlusCircle,
  Sparkle,
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
import { useNotifications } from "@/src/hooks/useNotifications";

const { width: SCREEN_W } = Dimensions.get("window");

type Props = { firstName: string };

export default function HostHome({ firstName }: Props) {
  const { getToken } = useAuth();
  const { dbUser } = useAppAuth();
  const { unreadCount: notifCount } = useNotifications();

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
  const unavailableCount = list.length - availableCount;
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
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
                  accent="#2563EB"
                  bg="#EFF6FF"
                />
                <StatCard
                  icon={<Eye size={20} color="#10B981" weight="fill" />}
                  value={String(availableCount)}
                  label="Available"
                  accent="#10B981"
                  bg="#ECFDF5"
                />
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <StatCard
                  icon={<CurrencyInr size={20} color="#F59E0B" weight="fill" />}
                  value={formatShortRent(avgRent)}
                  label="Avg Rent"
                  accent="#F59E0B"
                  bg="#FFFBEB"
                />
                <StatCard
                  icon={<Star size={20} color="#8B5CF6" weight="fill" />}
                  value={avgRating}
                  label={`${totalReviews} review${totalReviews === 1 ? "" : "s"}`}
                  accent="#8B5CF6"
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
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
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
    </SafeAreaView>
  );
}

// ─── Local helpers ─────────────────────────────────────────────

function formatShortRent(n: number) {
  if (n === 0) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}k`;
  return `₹${n}`;
}

// ─── Stat Card ─────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  accent,
  bg,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent: string;
  bg: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: "#F1F5F9",
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: "#0F172A",
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: "#64748B",
          fontWeight: "600",
          marginTop: 2,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Quick Action Button ───────────────────────────────────────

function QuickAction({
  icon,
  label,
  bg,
  badge,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        alignItems: "center",
        width: 80,
        gap: 8,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {icon}
        {badge ? (
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              paddingHorizontal: 5,
              borderRadius: 9,
              backgroundColor: "#EF4444",
              borderWidth: 2,
              borderColor: "#F8FAFC",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#fff" }}>
              {badge > 9 ? "9+" : badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: "#334155",
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Section Header ────────────────────────────────────────────

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 14,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: "#0F172A",
          letterSpacing: -0.4,
        }}
      >
        {title}
      </Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={{ fontSize: 13, color: "#2563EB", fontWeight: "700" }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ─── Listing Insight Row ───────────────────────────────────────

function ListingInsightRow({
  property,
  onPress,
}: {
  property: api.Property;
  onPress: () => void;
}) {
  const photoCount = property.photos.length;
  const hasIssues = !property.isAvailable || photoCount === 0;
  const statusColor = property.isAvailable ? "#10B981" : "#EF4444";
  const statusLabel = property.isAvailable ? "Active" : "Inactive";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: hasIssues ? "#FEE2E2" : "#F1F5F9",
      }}
    >
      {/* Thumbnail */}
      {property.photos.length > 0 ? (
        <Image
          source={{ uri: property.photos[0].url }}
          style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#E2E8F0" }}
        />
      ) : (
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: "#F1F5F9",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <House size={22} color="#94A3B8" weight="duotone" />
        </View>
      )}

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", letterSpacing: -0.2 }}
        >
          {property.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
          <MapPin size={11} color="#94A3B8" weight="fill" />
          <Text numberOfLines={1} style={{ fontSize: 11, color: "#64748B", flex: 1 }}>
            {property.location}
          </Text>
        </View>
        {/* Issue hints */}
        <View style={{ flexDirection: "row", gap: 6, marginTop: 5 }}>
          {photoCount === 0 ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                backgroundColor: "#FEF3C7",
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Camera size={10} color="#D97706" weight="fill" />
              <Text style={{ fontSize: 9, fontWeight: "700", color: "#D97706" }}>No photos</Text>
            </View>
          ) : null}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              backgroundColor: property.isAvailable ? "#ECFDF5" : "#FEF2F2",
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: statusColor,
              }}
            />
            <Text style={{ fontSize: 9, fontWeight: "700", color: statusColor }}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Rent */}
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
          ₹{property.rent.toLocaleString("en-IN")}
        </Text>
        <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>/month</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Tip Card ──────────────────────────────────────────────────

function TipCard({
  Icon,
  title,
  body,
  gradient,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
  title: string;
  body: string;
  gradient: readonly [string, string, ...string[]];
}) {
  return (
    <View
      style={{
        width: 230,
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 18 }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.22)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <Icon size={20} color="#fff" weight="fill" />
        </View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "800",
            color: "#fff",
            marginBottom: 6,
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.88)",
            lineHeight: 17,
          }}
        >
          {body}
        </Text>
      </LinearGradient>
    </View>
  );
}
