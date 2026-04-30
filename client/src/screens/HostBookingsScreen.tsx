import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Linking,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import {
  ArrowLeft,
  CalendarBlank,
  House,
  Phone,
  CheckCircle,
  XCircle,
  Hourglass,
  Check,
  X,
} from "phosphor-react-native";

import * as api from "@/src/services/api";

type Tab = "pending" | "accepted" | "rejected";

export default function HostBookingsScreen() {
  const { getToken } = useAuth();

  const [bookings, setBookings] = useState<api.BookingRequest[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("pending");

  const load = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const list = await api.listHostBookings(token);
      setBookings(list);
    } catch (err: any) {
      setError(err?.message || "Couldn't load visit requests");
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

  const respond = async (
    b: api.BookingRequest,
    status: "accepted" | "rejected"
  ) => {
    setRespondingId(b.booking.id);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const updated = await api.respondBooking(token, b.booking.id, status);
      setBookings(
        (prev) =>
          prev?.map((x) => (x.booking.id === updated.booking.id ? updated : x)) ??
          null
      );
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Couldn't respond");
    } finally {
      setRespondingId(null);
    }
  };

  const list = bookings || [];
  const pending = list.filter((b) => b.booking.status === "pending");
  const accepted = list.filter((b) => b.booking.status === "accepted");
  const rejected = list.filter((b) => b.booking.status === "rejected");

  const visible =
    tab === "pending" ? pending : tab === "accepted" ? accepted : rejected;

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
            Visit Requests
          </Text>
          <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
            {pending.length} awaiting · {accepted.length} accepted
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
          paddingHorizontal: 16,
          gap: 4,
        }}
      >
        <TabButton
          label="Pending"
          count={pending.length}
          active={tab === "pending"}
          onPress={() => setTab("pending")}
        />
        <TabButton
          label="Accepted"
          count={accepted.length}
          active={tab === "accepted"}
          onPress={() => setTab("accepted")}
        />
        <TabButton
          label="Declined"
          count={rejected.length}
          active={tab === "rejected"}
          onPress={() => setTab("rejected")}
        />
      </View>

      {loading && !refreshing ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
            />
          }
        >
          {error ? (
            <View
              style={{
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FECACA",
                borderRadius: 10,
                padding: 12,
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

          {visible.length === 0 && !error ? (
            <EmptyState tab={tab} />
          ) : (
            visible.map((b) => (
              <HostBookingCard
                key={b.booking.id}
                booking={b}
                responding={respondingId === b.booking.id}
                onAccept={() => respond(b, "accepted")}
                onReject={() => respond(b, "rejected")}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function TabButton({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: active ? "#2563EB" : "transparent",
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: active ? "#2563EB" : "#64748B",
            letterSpacing: -0.2,
          }}
        >
          {label}
        </Text>
        {count > 0 ? (
          <View
            style={{
              minWidth: 18,
              height: 18,
              paddingHorizontal: 5,
              borderRadius: 9,
              backgroundColor: active ? "#2563EB" : "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "800",
                color: active ? "#fff" : "#64748B",
              }}
            >
              {count}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
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

function HostBookingCard({
  booking,
  responding,
  onAccept,
  onReject,
}: {
  booking: api.BookingRequest;
  responding: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const { booking: b, property, guest } = booking;
  const isPending = b.status === "pending";
  const initial = (guest.name || "?").trim()[0]?.toUpperCase() || "?";

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        padding: 14,
      }}
    >
      {/* Guest row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#EFF6FF",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {guest.avatarUrl ? (
            <Image
              source={{ uri: guest.avatarUrl }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Text
              style={{ fontSize: 17, fontWeight: "800", color: "#2563EB" }}
            >
              {initial}
            </Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}
            numberOfLines={1}
          >
            {guest.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 2,
            }}
          >
            <House size={11} color="#94A3B8" weight="fill" />
            <Text
              style={{ fontSize: 11, color: "#64748B", flex: 1 }}
              numberOfLines={1}
            >
              {property.name}
            </Text>
          </View>
        </View>
        <StatusBadge status={b.status} />
      </View>

      {/* Visit date */}
      {b.visitDate ? (
        <View
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <CalendarBlank size={14} color="#2563EB" weight="fill" />
          <Text style={{ fontSize: 12, color: "#0F172A", fontWeight: "700" }}>
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

      {/* Note */}
      {b.note ? (
        <View
          style={{
            marginTop: 10,
            backgroundColor: "#F8FAFC",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Text
            style={{ fontSize: 12, color: "#475569", lineHeight: 18 }}
            numberOfLines={4}
          >
            {b.note}
          </Text>
        </View>
      ) : null}

      {/* Actions */}
      {isPending ? (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 12,
          }}
        >
          <TouchableOpacity
            onPress={onReject}
            disabled={responding}
            activeOpacity={0.85}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 11,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: "#FECACA",
              backgroundColor: "#fff",
            }}
          >
            <X size={14} color="#DC2626" weight="bold" />
            <Text
              style={{ fontSize: 13, fontWeight: "800", color: "#DC2626" }}
            >
              Decline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAccept}
            disabled={responding}
            activeOpacity={0.85}
            style={{
              flex: 1.4,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 11,
              borderRadius: 10,
              backgroundColor: responding ? "#CBD5E1" : "#10B981",
            }}
          >
            <Check size={14} color="#fff" weight="bold" />
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff" }}>
              {responding ? "Saving…" : "Accept"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : b.status === "accepted" && guest.phone ? (
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`tel:${guest.phone!.replace(/\s+/g, "")}`)
          }
          activeOpacity={0.85}
          style={{
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            paddingVertical: 11,
            borderRadius: 10,
            backgroundColor: "#EFF6FF",
          }}
        >
          <Phone size={14} color="#2563EB" weight="fill" />
          <Text
            style={{ fontSize: 13, fontWeight: "800", color: "#2563EB" }}
          >
            Call {guest.phone}
          </Text>
        </TouchableOpacity>
      ) : null}

      <Text
        style={{
          fontSize: 11,
          color: "#94A3B8",
          marginTop: 10,
        }}
      >
        Requested{" "}
        {new Date(b.requestedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const messages = {
    pending: {
      title: "No pending requests",
      body: "When guests ask to visit your properties, they'll appear here.",
    },
    accepted: {
      title: "No accepted visits yet",
      body: "Visits you accept will appear here so you can track them.",
    },
    rejected: {
      title: "Nothing declined",
      body: "Requests you decline will appear here.",
    },
  }[tab];

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
        {messages.title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: "#64748B",
          textAlign: "center",
          lineHeight: 18,
        }}
      >
        {messages.body}
      </Text>
    </View>
  );
}
