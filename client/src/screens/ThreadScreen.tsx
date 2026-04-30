import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { CaretLeft, PaperPlaneTilt, House } from "phosphor-react-native";

import * as api from "@/src/services/api";
import { useAppAuth } from "@/src/context/auth-context";
import MessageBubble from "@/src/components/inbox/MessageBubble";
import MessageThreadSkeleton from "@/src/components/inbox/MessageBubbleSkeleton";
import Skeleton from "@/src/components/ui/Skeleton";

const POLL_MS = 5000;

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getToken } = useAuth();
  const { dbUser } = useAppAuth();
  const insets = useSafeAreaInsets();

  const [thread, setThread] = useState<api.InquiryThread | null>(null);
  const [messages, setMessages] = useState<api.InquiryMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef<FlatList<api.InquiryMessage>>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasMarkedReadRef = useRef(false);

  const loadOnce = useCallback(
    async (silent = false) => {
      if (!id) return;
      if (!silent) setError(null);
      try {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const data = await api.getInquiry(token, id);
        setThread(data.thread);
        setMessages(data.messages);
        if (!hasMarkedReadRef.current) {
          hasMarkedReadRef.current = true;
          api.markInquiryRead(token, id).catch(() => {
            // non-blocking
          });
        }
      } catch (err: any) {
        if (!silent) {
          setError(err?.message || "Couldn't load this conversation");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id, getToken]
  );

  useEffect(() => {
    loadOnce();
  }, [loadOnce]);

  // Polling for new messages
  useEffect(() => {
    if (!id) return;
    pollRef.current = setInterval(() => loadOnce(true), POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id, loadOnce]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length === 0) return;
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
  }, [messages.length]);

  const handleSend = async () => {
    const body = input.trim();
    if (!body || sending || !id) return;

    setSending(true);
    const optimistic: api.InquiryMessage = {
      id: `temp-${Date.now()}`,
      inquiryId: id,
      senderId: dbUser?.id || "",
      body,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const real = await api.sendInquiryMessage(token, id, body);
      // Replace optimistic with real
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? real : m))
      );
      // Background refresh thread metadata
      loadOnce(true);
    } catch (err: any) {
      // Roll back
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(body);
      Alert.alert("Couldn't send", err?.message || "Please try again.");
    } finally {
      setSending(false);
    }
  };

  // ─── Loading ──────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#F8FAFC" }}
        edges={["top"]}
      >
        {/* Header skeleton */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#F1F5F9",
            backgroundColor: "#fff",
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
          >
            <CaretLeft size={18} color="#0F172A" weight="bold" />
          </TouchableOpacity>
          <Skeleton width={38} height={38} borderRadius={19} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={11} />
          </View>
        </View>

        {/* Property strip skeleton */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: "#EFF6FF",
            borderBottomWidth: 1,
            borderBottomColor: "#BFDBFE",
          }}
        >
          <Skeleton width={40} height={40} borderRadius={8} color="#DBEAFE" />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width="55%" height={12} color="#DBEAFE" />
            <Skeleton width="75%" height={11} color="#DBEAFE" />
          </View>
        </View>

        <MessageThreadSkeleton />
      </SafeAreaView>
    );
  }

  // ─── Error ────────────────────────────────────────
  if (!thread) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#F8FAFC" }}
        edges={["top"]}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>
            Conversation not found
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#64748B",
              marginTop: 6,
              textAlign: "center",
            }}
          >
            {error || "We couldn't load this conversation."}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 20,
              backgroundColor: "#0F172A",
              paddingHorizontal: 18,
              paddingVertical: 11,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff" }}>
              Go back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const openProperty = () => {
    if (dbUser?.role === "host") {
      router.push(`/(app)/host/property/${thread.property.id}` as any);
    }
  };

  const myId = dbUser?.id || "";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#F1F5F9",
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
          >
            <CaretLeft size={18} color="#0F172A" weight="bold" />
          </TouchableOpacity>

          {/* Avatar */}
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#EFF6FF",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {thread.counterpart.avatarUrl ? (
              <Image
                source={{ uri: thread.counterpart.avatarUrl }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#2563EB" }}>
                {thread.counterpart.name.trim()[0]?.toUpperCase() || "?"}
              </Text>
            )}
          </View>

          {/* Name + property */}
          <TouchableOpacity
            onPress={openProperty}
            activeOpacity={dbUser?.role === "host" ? 0.7 : 1}
            style={{ flex: 1 }}
          >
            <Text
              numberOfLines={1}
              style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}
            >
              {thread.counterpart.name}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 1,
              }}
            >
              <House size={10} color="#94A3B8" weight="fill" />
              <Text
                numberOfLines={1}
                style={{ flex: 1, fontSize: 11, color: "#94A3B8" }}
              >
                {thread.property.name}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Property context strip */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 14,
          paddingVertical: 10,
          backgroundColor: "#EFF6FF",
          borderBottomWidth: 1,
          borderBottomColor: "#BFDBFE",
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: "#DBEAFE",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {thread.property.coverUrl ? (
            <Image
              source={{ uri: thread.property.coverUrl }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <House size={18} color="#2563EB" weight="fill" />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ fontSize: 12, fontWeight: "800", color: "#1E3A8A" }}
          >
            {thread.property.name}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 11, color: "#1E40AF" }}>
            ₹{thread.property.rent.toLocaleString("en-IN")} / month ·{" "}
            {thread.property.location}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const isMine = item.senderId === myId;
          const next = messages[index + 1];
          const showTail =
            !next ||
            next.senderId !== item.senderId ||
            new Date(next.createdAt).getTime() -
              new Date(item.createdAt).getTime() >
              2 * 60_000;
          return (
            <MessageBubble
              body={item.body}
              createdAt={item.createdAt}
              isMine={isMine}
              showTail={showTail}
            />
          );
        }}
        contentContainerStyle={{
          paddingVertical: 12,
          flexGrow: 1,
          justifyContent: messages.length === 0 ? "center" : "flex-end",
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingHorizontal: 32 }}>
            <Text
              style={{
                fontSize: 13,
                color: "#94A3B8",
                textAlign: "center",
              }}
            >
              Say hello and introduce yourself. Ask about availability, visits,
              or anything else you&apos;d like to know.
            </Text>
          </View>
        }
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Composer */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#F1F5F9",
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
            minHeight: 40,
            maxHeight: 120,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message…"
            placeholderTextColor="#94A3B8"
            multiline
            style={{
              fontSize: 14,
              color: "#0F172A",
              lineHeight: 20,
              minHeight: 24,
              maxHeight: 100,
            }}
            editable={!sending}
          />
        </View>
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || sending}
          activeOpacity={0.85}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: input.trim() && !sending ? "#2563EB" : "#CBD5E1",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <PaperPlaneTilt size={17} color="#fff" weight="fill" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
