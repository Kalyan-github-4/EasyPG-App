import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import {
  ArrowLeft,
  CalendarBlank,
  House,
  MapPin,
  Trash,
  CheckCircle,
  XCircle,
  Hourglass,
} from "phosphor-react-native";

import * as api from "@/src/services/api";

export default function GuestVisitsScreen() {
  const { getToken } = useAuth();

  const [bookings, setBookings] = useState<api.BookingRequest[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const list = await api.listMyBookings(token);
      setBookings(list);
    } catch (err: any) {
      setError(err?.message || "Couldn't load your visits");
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

  const handleCancel = (b: api.BookingRequest) => {
    Alert.alert(
      "Cancel request?",
      `Cancel your visit request for ${b.property.name}?`,
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Cancel request",
          style: "destructive",
          onPress: async () => {
            setCancellingId(b.booking.id);
            try {
              const token = await getToken();
              if (!token) throw new Error("Not authenticated");
              await api.cancelBooking(token, b.booking.id);
              setBookings(
                (prev) => prev?.filter((x) => x.booking.id !== b.booking.id) ?? null
              );
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Couldn't cancel");
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const list = bookings || [];
  const pending = list.filter((b) => b.booking.status === "pending");
  const accepted = list.filter((b) => b.booking.status === "accepted");
  const rejected = list.filter((b) => b.booking.status === "rejected");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#F1F5F9",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={18} color="#0F172A" weight="bold" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "800",
              color: "#0F172A",
              letterSpacing: -0.3,
            }}
          >
            My Visits
          </Text>
          <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
            {list.length} {list.length === 1 ? "request" : "requests"}
          </Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
            />
          }
        >
          {/* Error */}
          {error ? (
            <View
              style={{
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FECACA",
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ flex: 1, fontSize: 12, color: "#991B1B" }}>
                {error}
              </Text>
              <TouchableOpacity onPress={onRefresh}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: "#DC2626",
                  }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {list.length === 0 && !error ? (
            <EmptyState />
          ) : (
            <>
              {pending.length > 0 ? (
                <Section title="Awaiting response" count={pending.length}>
                  {pending.map((b) => (
                    <BookingCard
                      key={b.booking.id}
                      booking={b}
                      cancelling={cancellingId === b.booking.id}
                      onCancel={() => handleCancel(b)}
                      onPress={() =>
                        router.push({
                          pathname: "/(app)/pg/[id]",
                          params: { id: b.property.id },
                        })
                      }
                    />
                  ))}
                </Section>
              ) : null}

              {accepted.length > 0 ? (
                <Section title="Accepted" count={accepted.length}>
                  {accepted.map((b) => (
                    <BookingCard
                      key={b.booking.id}
                      booking={b}
                      onPress={() =>
                        router.push({
                          pathname: "/(app)/pg/[id]",
                          params: { id: b.property.id },
                        })
                      }
                    />
                  ))}
                </Section>
              ) : null}

              {rejected.length > 0 ? (
                <Section title="Declined" count={rejected.length}>
                  {rejected.map((b) => (
                    <BookingCard
                      key={b.booking.id}
                      booking={b}
                      onPress={() =>
                        router.push({
                          pathname: "/(app)/pg/[id]",
                          params: { id: b.property.id },
                        })
                      }
                    />
                  ))}
                </Section>
              ) : null}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: "#0F172A",
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Text>
        <View
          style={{
            backgroundColor: "#F1F5F9",
            borderRadius: 999,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "800", color: "#64748B" }}>
            {count}
          </Text>
        </View>
      </View>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

function StatusBadge({ status }: { status: api.BookingStatus }) {
  const config = {
    pending: { color: "#F59E0B", bg: "#FFFBEB", label: "Pending", Icon: Hourglass },
    accepted: { color: "#10B981", bg: "#ECFDF5", label: "Accepted", Icon: CheckCircle },
    rejected: { color: "#EF4444", bg: "#FEF2F2", label: "Declined", Icon: XCircle },
  }[status];
  const { color, bg, label, Icon } = config;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: bg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      <Icon size={11} color={color} weight="fill" />
      <Text style={{ fontSize: 11, fontWeight: "800", color }}>{label}</Text>
    </View>
  );
}

function BookingCard({
  booking,
  cancelling,
  onPress,
  onCancel,
}: {
  booking: api.BookingRequest;
  cancelling?: boolean;
  onPress: () => void;
  onCancel?: () => void;
}) {
  const { booking: b, property } = booking;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        padding: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <House size={12} color="#94A3B8" weight="fill" />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: "#0F172A",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {property.name}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <MapPin size={11} color="#94A3B8" />
            <Text
              style={{ fontSize: 11, color: "#64748B", flex: 1 }}
              numberOfLines={1}
            >
              {property.location}
            </Text>
          </View>
        </View>
        <StatusBadge status={b.status} />
      </View>

      {b.visitDate ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
          }}
        >
          <CalendarBlank size={14} color="#2563EB" weight="fill" />
          <Text style={{ fontSize: 12, color: "#0F172A", fontWeight: "600" }}>
            {new Date(b.visitDate).toLocaleString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            })}
          </Text>
        </View>
      ) : null}

      {b.note ? (
        <Text
          style={{
            fontSize: 12,
            color: "#475569",
            lineHeight: 18,
            marginTop: 8,
          }}
          numberOfLines={2}
        >
          "{b.note}"
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <Text style={{ fontSize: 11, color: "#94A3B8" }}>
          Sent{" "}
          {new Date(b.requestedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </Text>
        {b.status === "pending" && onCancel ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            disabled={cancelling}
            hitSlop={6}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 8,
              backgroundColor: "#FEF2F2",
            }}
          >
            <Trash size={11} color="#DC2626" weight="bold" />
            <Text
              style={{ fontSize: 11, fontWeight: "800", color: "#DC2626" }}
            >
              {cancelling ? "Cancelling…" : "Cancel"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        marginTop: 8,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: "#EFF6FF",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <CalendarBlank size={28} color="#2563EB" weight="duotone" />
      </View>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "800",
          color: "#0F172A",
          marginBottom: 6,
          letterSpacing: -0.2,
        }}
      >
        No visit requests yet
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: "#64748B",
          textAlign: "center",
          lineHeight: 18,
          marginBottom: 16,
        }}
      >
        Browse properties and tap "Request Visit" to schedule a tour with the
        host.
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(app)/pgs" as any)}
        activeOpacity={0.85}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: "#2563EB",
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>
          Browse properties
        </Text>
      </TouchableOpacity>
    </View>
  );
}
