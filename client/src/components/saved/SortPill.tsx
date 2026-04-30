import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowsDownUp, CaretUp, CaretDown, Check } from "phosphor-react-native";
import { SortKey, SORT_LABELS } from "./types";

type Props = {
  sortBy: SortKey;
  onChange: (k: SortKey) => void;
};

export default function SortPill({ sortBy, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const Caret = open ? CaretUp : CaretDown;

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.85}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: "#fff",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: "#E2E8F0",
        }}
      >
        <ArrowsDownUp size={14} color="#64748B" weight="bold" />
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>
          {SORT_LABELS[sortBy]}
        </Text>
        <Caret size={14} color="#94A3B8" weight="bold" />
      </TouchableOpacity>

      {open && (
        <View
          style={{
            position: "absolute",
            top: 42,
            right: 0,
            backgroundColor: "#fff",
            borderRadius: 14,
            paddingVertical: 6,
            minWidth: 200,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
            zIndex: 10,
          }}
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => {
            const active = sortBy === k;
            return (
              <TouchableOpacity
                key={k}
                onPress={() => {
                  onChange(k);
                  setOpen(false);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? "700" : "500",
                    color: active ? "#2563EB" : "#334155",
                  }}
                >
                  {SORT_LABELS[k]}
                </Text>
                {active && <Check size={16} color="#2563EB" weight="bold" />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
