import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import {
  Plus,
  ArrowRight,
  CalendarBlank,
  Camera,
  Star,
  TrendUp,
} from "phosphor-react-native";

import { useAppAuth } from "@/src/context/auth-context";
import * as api from "@/src/services/api";

import HostHeader from "@/src/components/host/HostHeader";
import PropertyFeaturedCard from "@/src/components/home/PropertyFeaturedCard";
import EmptyHostHome from "@/src/components/host/EmptyHostHome";
import { PropertyFeaturedRailSkeleton } from "@/src/components/home/PropertyFeaturedCardSkeleton";
import Skeleton from "@/src/components/ui/Skeleton";
import { LinearGradient } from "expo-linear-gradient";

type Props = { firstName: string };

export default function HostHome({ firstName }: Props) {
  const { getToken } = useAuth();
  const { dbUser } = useAppAuth();

  const [properties, setProperties] = useState<api.Property[] | null>(null);
  const [pendingVisits, setPendingVisits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const [mine, bookings] = await Promise.all([
        api.listMyProperties(token),
        api.listHostBookings(token).catch(() => []),
      ]);
      setProperties(mine);
      setPendingVisits(
        bookings.filter((b) => b.booking.status === "pending").length
      );
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

  const goToAdd = () => router.push("/(app)/host/add-property" as any);
  const goToProperty = (id: string) =>
    router.push(`/(app)/host/property/${id}` as any);

  // ─── Loading ───────────────────────────────────
  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#F8FAFC" }}
        edges={["top"]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
        >
          <HostHeader
            firstName={firstName}
            avatarUrl={dbUser?.avatarUrl}
            subtitle="Loading your listings…"
          />

          {/* Hero card skeleton */}
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <Skeleton width="100%" height={140} borderRadius={24} />
          </View>

          {/* Stats strip skeleton */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 24,
              marginBottom: 28,
              gap: 10,
            }}
          >
            <Skeleton width="32%" height={64} borderRadius={16} />
            <Skeleton width="32%" height={64} borderRadius={16} />
            <Skeleton width="32%" height={64} borderRadius={16} />
          </View>

          {/* Listings rail skeleton */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              marginBottom: 14,
            }}
          >
            <Skeleton width={140} height={20} />
            <Skeleton width={60} height={12} />
          </View>
          <PropertyFeaturedRailSkeleton count={3} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const list = properties || [];
  const availableCount = list.filter((p) => p.isAvailable).length;
  const hasListings = list.length > 0;
  const avgRent = hasListings
    ? Math.round(list.reduce((a, p) => a + p.rent, 0) / list.length)
    : 0;

  const subtitleText = hasListings
    ? `${list.length} ${list.length === 1 ? "listing" : "listings"} · ${availableCount} available`
    : "Let's get your first PG online";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
      >
        <HostHeader
          firstName={firstName}
          avatarUrl={dbUser?.avatarUrl}
          subtitle={subtitleText}
        />

        {/* Error banner */}
        {error ? (
          <View
            style={{
              marginHorizontal: 24,
              backgroundColor: "#FEF2F2",
              borderWidth: 1,
              borderColor: "#FECACA",
              borderRadius: 14,
              padding: 14,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ flex: 1, fontSize: 13, color: "#991B1B" }}>
              {error}
            </Text>
            <TouchableOpacity onPress={onRefresh}>
              <Text
                style={{ fontSize: 13, fontWeight: "800", color: "#DC2626" }}
              >
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── Empty state ── */}
        {!hasListings && <EmptyHostHome onAdd={goToAdd} />}

        {/* ── Populated state ── */}
        {hasListings && (
          <>
            {/* Hero insights card — Airbnb's "What's happening" */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => router.push("/(app)/host/bookings" as any)}
              style={{
                marginHorizontal: 24,
                marginBottom: 24,
                borderRadius: 24,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["#1E3A8A", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 22 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.18)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CalendarBlank size={18} color="#fff" weight="fill" />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "rgba(255,255,255,0.9)",
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                    }}
                  >
                    {pendingVisits > 0 ? "Needs attention" : "Today"}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: "#fff",
                    letterSpacing: -0.5,
                    lineHeight: 30,
                    marginBottom: 6,
                  }}
                >
                  {pendingVisits > 0
                    ? `${pendingVisits} visit ${
                        pendingVisits === 1 ? "request" : "requests"
                      } awaiting you`
                    : "You're all caught up"}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: 19,
                    marginBottom: 18,
                  }}
                >
                  {pendingVisits > 0
                    ? "Respond quickly to keep your response rate high"
                    : "No pending tour requests — view past visits anytime"}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.18)",
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: 999,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#fff",
                      }}
                    >
                      {pendingVisits > 0 ? "Review requests" : "View all visits"}
                    </Text>
                    <ArrowRight size={14} color="#fff" weight="bold" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Stats strip — inline, Airbnb-style */}
            <View
              style={{
                marginHorizontal: 24,
                backgroundColor: "#fff",
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "#F1F5F9",
                flexDirection: "row",
                paddingVertical: 16,
                marginBottom: 32,
              }}
            >
              <StatCell
                value={String(list.length)}
                label={list.length === 1 ? "Listing" : "Listings"}
              />
              <StatDivider />
              <StatCell value={String(availableCount)} label="Available" />
              <StatDivider />
              <StatCell
                value={avgRent > 0 ? formatShortRent(avgRent) : "—"}
                label="Avg rent"
              />
            </View>

            {/* Listings rail */}
            <SectionHeader
              title="Your listings"
              actionLabel="View all"
              onAction={() => router.push("/(app)/host/listings" as any)}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                gap: 14,
                paddingBottom: 8,
              }}
              decelerationRate="fast"
            >
              {list.map((p) => (
                <PropertyFeaturedCard
                  key={p.id}
                  property={p}
                  onPress={() => goToProperty(p.id)}
                />
              ))}
            </ScrollView>

            {/* Host tips — horizontal scroll, Airbnb-style */}
            <View style={{ marginTop: 36 }}>
              <SectionHeader title="Tips for hosts" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  gap: 12,
                }}
              >
                <TipCard
                  Icon={Camera}
                  title="Add great photos"
                  body="Listings with 5+ photos get 3x more inquiries."
                  tint="#2563EB"
                />
                <TipCard
                  Icon={Star}
                  title="Respond within 1 hour"
                  body="Fast replies help you rank higher in search."
                  tint="#F59E0B"
                />
                <TipCard
                  Icon={TrendUp}
                  title="Keep rent competitive"
                  body="Review nearby PGs and price smartly."
                  tint="#10B981"
                />
              </ScrollView>
            </View>

            {/* Add another property — subtle card at end */}
            <TouchableOpacity
              onPress={goToAdd}
              activeOpacity={0.9}
              style={{
                marginHorizontal: 24,
                marginTop: 32,
                backgroundColor: "#fff",
                borderRadius: 18,
                borderWidth: 1.5,
                borderStyle: "dashed",
                borderColor: "#CBD5E1",
                paddingVertical: 20,
                paddingHorizontal: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: "#EFF6FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={22} color="#2563EB" weight="bold" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}
                >
                  List another property
                </Text>
                <Text
                  style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}
                >
                  Takes about 2 minutes
                </Text>
              </View>
              <ArrowRight size={18} color="#94A3B8" weight="bold" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Local helpers ─────────────────────────────────────────────

function formatShortRent(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}k`;
  return `₹${n}`;
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          color: "#0F172A",
          letterSpacing: -0.4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: "#64748B",
          fontWeight: "600",
          marginTop: 3,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function StatDivider() {
  return (
    <View
      style={{
        width: 1,
        backgroundColor: "#F1F5F9",
        marginVertical: 4,
      }}
    />
  );
}

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
        paddingHorizontal: 24,
        marginBottom: 14,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          color: "#0F172A",
          letterSpacing: -0.5,
        }}
      >
        {title}
      </Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text
            style={{ fontSize: 13, color: "#2563EB", fontWeight: "700" }}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function TipCard({
  Icon,
  title,
  body,
  tint,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
  title: string;
  body: string;
  tint: string;
}) {
  return (
    <View
      style={{
        width: 220,
        backgroundColor: "#fff",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        padding: 16,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: `${tint}15`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Icon size={18} color={tint} weight="fill" />
      </View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "800",
          color: "#0F172A",
          marginBottom: 4,
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: "#64748B",
          lineHeight: 17,
        }}
      >
        {body}
      </Text>
    </View>
  );
}
