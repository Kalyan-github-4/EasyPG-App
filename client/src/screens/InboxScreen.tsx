import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { CaretLeft, ChatCircleDots, PencilSimple, X } from "phosphor-react-native";

import * as api from "@/src/services/api";
import { useAppAuth } from "@/src/context/auth-context";
import ThreadRow from "@/src/components/inbox/ThreadRow";
import NewInquirySheet from "@/src/components/inbox/NewInquirySheet";
import { ThreadListSkeleton } from "@/src/components/inbox/ThreadRowSkeleton";

export default function InboxScreen() {
  const { getToken } = useAuth();
  const { dbUser } = useAppAuth();
  const { propertyId: propertyFilterRaw } = useLocalSearchParams<{
    propertyId?: string;
  }>();
  const propertyFilter = typeof propertyFilterRaw === "string" ? propertyFilterRaw : undefined;

  const isGuest = dbUser?.role === "guest";

  const [threads, setThreads] = useState<api.InquiryThread[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const list = await api.listInquiries(token, {
        propertyId: propertyFilter,
      });
      setThreads(list);
    } catch (err: any) {
      setError(err?.message || "Couldn't load conversations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, propertyFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Reload on focus (returning from thread screen)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const goToThread = useCallback(
    (id: string) => router.push(`/(app)/inbox/${id}` as any),
    []
  );

  const clearFilter = () => router.setParams({ propertyId: "" });

  const totalUnread = useMemo(() => {
    if (!threads || !dbUser) return 0;
    return threads.reduce((sum, t) => {
      const u =
        t.inquiry.guestId === dbUser.id
          ? t.inquiry.guestUnread
          : t.inquiry.hostUnread;
      return sum + u;
    }, 0);
  }, [threads, dbUser]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 6,
            paddingBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#F1F5F9",
              alignItems: "center",
              justifyContent: "center",
            }}
            hitSlop={8}
          >
            <CaretLeft size={18} color="#0F172A" weight="bold" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: "#0F172A",
                letterSpacing: -0.5,
              }}
            >
              Inbox
            </Text>
            <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
              Loading conversations…
            </Text>
          </View>
        </View>
        <ThreadListSkeleton count={6} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 6,
          paddingBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F1F5F9",
            alignItems: "center",
            justifyContent: "center",
          }}
          hitSlop={8}
        >
          <CaretLeft size={18} color="#0F172A" weight="bold" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#0F172A",
              letterSpacing: -0.5,
            }}
          >
            Inbox
          </Text>
          <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
            {totalUnread > 0
              ? `${totalUnread} unread`
              : `${threads?.length || 0} ${
                  threads?.length === 1 ? "conversation" : "conversations"
                }`}
          </Text>
        </View>

        {isGuest ? (
          <TouchableOpacity
            onPress={() => setShowCompose(true)}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#0F172A",
              paddingHorizontal: 13,
              paddingVertical: 9,
              borderRadius: 12,
            }}
          >
            <PencilSimple size={14} color="#fff" weight="bold" />
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff" }}>
              New
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter banner */}
      {propertyFilter ? (
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 10,
            backgroundColor: "#EFF6FF",
            borderWidth: 1,
            borderColor: "#BFDBFE",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 9,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 12,
              fontWeight: "600",
              color: "#1E3A8A",
            }}
          >
            Filtered to one property
          </Text>
          <TouchableOpacity onPress={clearFilter} hitSlop={8}>
            <X size={14} color="#2563EB" weight="bold" />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Error */}
      {error ? (
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 10,
            backgroundColor: "#FEF2F2",
            borderWidth: 1,
            borderColor: "#FECACA",
            borderRadius: 12,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text style={{ flex: 1, fontSize: 12, color: "#991B1B" }}>{error}</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={{ fontSize: 12, fontWeight: "800", color: "#DC2626" }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* List */}
      <FlatList
        data={threads || []}
        keyExtractor={(item) => item.inquiry.id}
        renderItem={({ item }) => (
          <ThreadRow
            thread={item}
            currentUserId={dbUser?.id || ""}
            onPress={() => goToThread(item.inquiry.id)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, marginLeft: 84, backgroundColor: "#F1F5F9" }} />
        )}
        contentContainerStyle={{ paddingBottom: 90, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 32,
              paddingTop: 60,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#EFF6FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <ChatCircleDots size={32} color="#2563EB" weight="duotone" />
            </View>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: "#0F172A",
                textAlign: "center",
              }}
            >
              {propertyFilter
                ? "No conversations yet"
                : isGuest
                ? "Start a conversation"
                : "No inquiries yet"}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#64748B",
                textAlign: "center",
                marginTop: 6,
                lineHeight: 19,
                maxWidth: 280,
              }}
            >
              {isGuest
                ? "Tap New to message a property host about availability, visits, or questions."
                : "Messages from guests interested in your properties will show up here."}
            </Text>
          </View>
        }
      />

      {/* Compose sheet — guests only */}
      {isGuest ? (
        <NewInquirySheet
          visible={showCompose}
          onClose={() => setShowCompose(false)}
          onCreated={(threadId) => {
            setShowCompose(false);
            router.push(`/(app)/inbox/${threadId}` as any);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}
