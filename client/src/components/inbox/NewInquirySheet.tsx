import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import {
  X,
  MagnifyingGlass,
  Check,
  House,
  CaretRight,
} from "phosphor-react-native";

import * as api from "@/src/services/api";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated: (threadId: string) => void;
  /** When provided, skip the property picker and go straight to compose */
  presetProperty?: api.Property;
};

type Stage = "pick" | "compose";

export default function NewInquirySheet({
  visible,
  onClose,
  onCreated,
  presetProperty,
}: Props) {
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();

  const [stage, setStage] = useState<Stage>(presetProperty ? "compose" : "pick");
  const [properties, setProperties] = useState<api.Property[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<api.Property | null>(
    presetProperty ?? null
  );
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset on each open
  useEffect(() => {
    if (visible) {
      setStage(presetProperty ? "compose" : "pick");
      setSelected(presetProperty ?? null);
      setQuery("");
      setMessage("");
      setError(null);
    }
  }, [visible, presetProperty]);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listProperties();
      setProperties(list.filter((p) => p.isAvailable));
    } catch (err: any) {
      setError(err?.message || "Couldn't load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible && !presetProperty && !properties) loadProperties();
  }, [visible, presetProperty, properties, loadProperties]);

  const filtered = useMemo(() => {
    const list = properties || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    );
  }, [properties, query]);

  const proceed = (p: api.Property) => {
    setSelected(p);
    setStage("compose");
    Keyboard.dismiss();
  };

  const handleSend = async () => {
    const body = message.trim();
    if (!selected || !body || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const thread = await api.createInquiry(token, {
        propertyId: selected.id,
        message: body,
      });
      onCreated(thread.inquiry.id);
    } catch (err: any) {
      setError(err?.message || "Couldn't send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#F1F5F9",
              backgroundColor: "#fff",
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                stage === "compose" && !presetProperty
                  ? setStage("pick")
                  : onClose()
              }
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F1F5F9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color="#0F172A" weight="bold" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A" }}>
                {stage === "pick" ? "New message" : "Write message"}
              </Text>
              <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
                {stage === "pick"
                  ? "Choose a property to message about"
                  : selected?.name}
              </Text>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View
              style={{
                margin: 16,
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FECACA",
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 12, color: "#991B1B" }}>{error}</Text>
            </View>
          ) : null}

          {/* Body */}
          {stage === "pick" ? (
            <PropertyPickerStage
              properties={filtered}
              loading={loading}
              query={query}
              setQuery={setQuery}
              onRetry={loadProperties}
              onSelect={proceed}
            />
          ) : (
            <ComposerStage
              property={selected!}
              message={message}
              setMessage={setMessage}
              submitting={submitting}
              onSend={handleSend}
              bottomInset={insets.bottom}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Stage 1: pick property ────────────────────────

function PropertyPickerStage({
  properties,
  loading,
  query,
  setQuery,
  onRetry,
  onSelect,
}: {
  properties: api.Property[];
  loading: boolean;
  query: string;
  setQuery: (v: string) => void;
  onRetry: () => void;
  onSelect: (p: api.Property) => void;
}) {
  return (
    <>
      <View style={{ padding: 16, backgroundColor: "#fff" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F1F5F9",
            borderRadius: 12,
            paddingHorizontal: 12,
          }}
        >
          <MagnifyingGlass size={16} color="#94A3B8" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search properties"
            placeholderTextColor="#94A3B8"
            style={{
              flex: 1,
              fontSize: 14,
              color: "#0F172A",
              paddingVertical: 10,
              paddingHorizontal: 8,
            }}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <X size={14} color="#94A3B8" weight="bold" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              activeOpacity={0.85}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                gap: 12,
                backgroundColor: "#fff",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  backgroundColor: "#E2E8F0",
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.photos?.[0]?.url ? (
                  <Image
                    source={{ uri: item.photos?.[0]?.url }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <House size={18} color="#94A3B8" weight="fill" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}
                >
                  {item.name}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}
                >
                  ₹{item.rent.toLocaleString("en-IN")} / month · {item.location}
                </Text>
              </View>
              <CaretRight size={14} color="#CBD5E1" weight="bold" />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => (
            <View
              style={{ height: 1, marginLeft: 76, backgroundColor: "#F1F5F9" }}
            />
          )}
          ListEmptyComponent={
            <View
              style={{
                padding: 40,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 13, color: "#94A3B8" }}>
                {query ? "No properties match" : "No properties available"}
              </Text>
              {!query ? (
                <TouchableOpacity
                  onPress={onRetry}
                  style={{ marginTop: 12 }}
                  hitSlop={8}
                >
                  <Text style={{ fontSize: 13, color: "#2563EB", fontWeight: "700" }}>
                    Retry
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />
      )}
    </>
  );
}

// ─── Stage 2: compose message ──────────────────────

function ComposerStage({
  property,
  message,
  setMessage,
  submitting,
  onSend,
  bottomInset,
}: {
  property: api.Property;
  message: string;
  setMessage: (v: string) => void;
  submitting: boolean;
  onSend: () => void;
  bottomInset: number;
}) {
  return (
    <View style={{ flex: 1 }}>
      {/* Property card */}
      <View
        style={{
          margin: 16,
          backgroundColor: "#fff",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#F1F5F9",
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 10,
            backgroundColor: "#E2E8F0",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {property.photos?.[0]?.url ? (
            <Image
              source={{ uri: property.photos?.[0]?.url }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <House size={22} color="#94A3B8" weight="fill" />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>
            {property.name}
          </Text>
          <Text style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>
            ₹{property.rent.toLocaleString("en-IN")} / month
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
            {property.location}
          </Text>
        </View>
      </View>

      {/* Message input */}
      <View
        style={{
          marginHorizontal: 16,
          backgroundColor: "#fff",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          padding: 14,
          flex: 1,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: "800",
            color: "#94A3B8",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Your message
        </Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Hi! I'm interested in this property. Is it still available? Could we arrange a visit this weekend?"
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
          style={{
            flex: 1,
            fontSize: 14,
            color: "#0F172A",
            lineHeight: 20,
          }}
          editable={!submitting}
          autoFocus
        />
        <Text
          style={{
            fontSize: 11,
            color: "#CBD5E1",
            textAlign: "right",
            marginTop: 6,
          }}
        >
          {message.length} / 2000
        </Text>
      </View>

      {/* Send bar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(bottomInset, 12),
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
        }}
      >
        <TouchableOpacity
          onPress={onSend}
          disabled={!message.trim() || submitting}
          activeOpacity={0.85}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor:
              message.trim() && !submitting ? "#2563EB" : "#CBD5E1",
            borderRadius: 14,
            paddingVertical: 14,
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Check size={17} color="#fff" weight="bold" />
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>
                Send message
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
