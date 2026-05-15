import React, { useState, useCallback, useRef } from "react";
import {
  View, Text, Modal, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator, Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { X, House, CalendarCheck, Check, CaretLeft, CaretRight } from "phosphor-react-native";
import * as api from "@/src/services/api";

// ─── helpers ────────────────────────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const pad = (n: number) => String(n).padStart(2, "0");

// ─── sub-components ─────────────────────────────────────────────────────────
function CalendarPicker({
  selected,
  onChange,
}: {
  selected: Date;
  onChange: (d: Date) => void;
}) {
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setViewMonth(m);
    setViewYear(y);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const selectDay = (d: number) => {
    const next = new Date(selected);
    next.setFullYear(viewYear, viewMonth, d);
    onChange(next);
  };

  const isSelected = (d: number) =>
    d === selected.getDate() &&
    viewMonth === selected.getMonth() &&
    viewYear === selected.getFullYear();

  const isPast = (d: number) =>
    new Date(viewYear, viewMonth, d) < today;

  return (
    <View className="mb-5 overflow-hidden bg-white border border-slate-200 rounded-2xl">
      {/* header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100">
        <TouchableOpacity onPress={() => changeMonth(-1)} className="p-1">
          <CaretLeft size={18} color="#64748B" />
        </TouchableOpacity>
        <Text className="text-sm font-bold text-slate-900">
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} className="p-1">
          <CaretRight size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View className="p-2">
        {/* day-of-week row */}
        <View className="flex-row mb-1">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <Text
              key={i}
              className="flex-1 text-center text-[11px] text-slate-400 font-semibold"
            >
              {d}
            </Text>
          ))}
        </View>

        {/* day grid */}
        {Array.from({ length: Math.ceil((firstDow + daysInMonth) / 7) }).map((_, row) => (
          <View key={row} className="flex-row">
            {Array.from({ length: 7 }).map((_, col) => {
              const d = row * 7 + col - firstDow + 1;
              const valid = d >= 1 && d <= daysInMonth;
              if (!valid) return <View key={col} className="flex-1 aspect-square" />;
              const past = isPast(d);
              const sel = isSelected(d);
              return (
                <TouchableOpacity
                  key={col}
                  onPress={() => !past && selectDay(d)}
                  activeOpacity={past ? 1 : 0.7}
                  className="items-center justify-center flex-1 aspect-square"
                >
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      sel ? "bg-blue-600" : ""
                    }`}
                  >
                    <Text
                      className={`text-[13px] ${
                        sel
                          ? "text-white font-bold"
                          : past
                          ? "text-slate-300"
                          : "text-slate-800"
                      }`}
                    >
                      {d}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

function TimePicker({
  selected,
  onChange,
}: {
  selected: Date;
  onChange: (d: Date) => void;
}) {
  const raw = selected.getHours();
  const isPM = raw >= 12;
  const hour12 = raw % 12 || 12;
  const minute = selected.getMinutes();

  const update = (h24: number, m: number) => {
    const next = new Date(selected);
    next.setHours(h24, m, 0, 0);
    onChange(next);
  };

  const changeHour = (delta: number) => {
    let h = hour12 + delta;
    if (h > 12) h = 1;
    if (h < 1)  h = 12;
    const h24 = isPM ? (h % 12) + 12 : h % 12;
    update(h24, minute);
  };

  const changeMinute = (delta: number) => {
    let m = minute + delta * 5;
    if (m >= 60) m = 0;
    if (m < 0)   m = 55;
    update(isPM ? (hour12 % 12) + 12 : hour12 % 12, m);
  };

  const toggleAmPm = (pm: boolean) => {
    const h24 = pm ? (hour12 % 12) + 12 : hour12 % 12;
    update(h24, minute);
  };

  const Spinner = ({
    value,
    onUp,
    onDown,
  }: {
    value: string;
    onUp: () => void;
    onDown: () => void;
  }) => (
    <View className="items-center gap-1">
      <TouchableOpacity onPress={onUp} className="px-3 py-1">
        <CaretLeft size={18} color="#64748B" style={{ transform: [{ rotate: "90deg" }] }} />
      </TouchableOpacity>
      <View className="items-center justify-center h-12 w-14 bg-slate-100 rounded-xl">
        <Text className="text-2xl font-bold text-slate-900">{value}</Text>
      </View>
      <TouchableOpacity onPress={onDown} className="px-3 py-1">
        <CaretLeft size={18} color="#64748B" style={{ transform: [{ rotate: "-90deg" }] }} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="p-4 mb-5 bg-white border border-slate-200 rounded-2xl">
      <View className="flex-row items-center justify-center gap-2">
        <Spinner value={pad(hour12)} onUp={() => changeHour(1)} onDown={() => changeHour(-1)} />
        <Text className="text-2xl font-bold text-slate-400 mb-0.5">:</Text>
        <Spinner value={pad(minute)} onUp={() => changeMinute(1)} onDown={() => changeMinute(-1)} />

        <View className="gap-2 ml-2">
          {(["AM", "PM"] as const).map((label) => {
            const active = (label === "PM") === isPM;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => toggleAmPm(label === "PM")}
                className={`px-3 py-1.5 rounded-lg border ${
                  active
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-slate-200"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    active ? "text-white" : "text-slate-500"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── main sheet ─────────────────────────────────────────────────────────────
type Props = {
  visible: boolean;
  property: api.Property;
  onClose: () => void;
  onCreated: (booking: api.BookingRequest) => void;
};

export default function BookingRequestSheet({ visible, property, onClose, onCreated }: Props) {
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [visitDate, setVisitDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(11, 0, 0, 0);
    return d;
  });

  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // stable callbacks — no stale closure issues
  const handleDateChange = useCallback((d: Date) => setVisitDate(d), []);
  const handleTimeChange = useCallback((d: Date) => setVisitDate(d), []);
  const handleNoteFocus = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, []);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const created = await api.createBooking(token, {
        propertyId: property.id,
        note: note.trim() || undefined,
        visitDate: visitDate.toISOString(),
      });
      onCreated(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const raw = visitDate.getHours();
  const isPM = raw >= 12;
  const h12 = raw % 12 || 12;
  const formattedDate = visitDate.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
  const formattedTime = `${pad(h12)}:${pad(visitDate.getMinutes())} ${isPM ? "PM" : "AM"}`;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-slate-50">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 160 }}
          >
            {/* HEADER */}
            <View className="flex-row items-center px-4 py-3.5 border-b border-slate-200 bg-white">
              <TouchableOpacity
                onPress={onClose}
                className="w-[38px] h-[38px] rounded-full bg-slate-100 items-center justify-center mr-3"
              >
                <X size={18} color="#0F172A" weight="bold" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-[17px] font-extrabold text-slate-900">Request a visit</Text>
                <Text className="text-[11px] text-slate-400 mt-0.5">Host will review your request</Text>
              </View>
            </View>

            <View className="p-4">
              {/* PROPERTY CARD */}
              <View className="flex-row p-3 mb-6 bg-white border rounded-2xl border-slate-200">
                <View className="w-[60px] h-[60px] rounded-xl overflow-hidden bg-slate-200 items-center justify-center mr-3">
                  {property?.photos?.[0]?.url ? (
                    <Image source={{ uri: property.photos?.[0]?.url }} className="w-full h-full" />
                  ) : (
                    <House size={22} color="#94A3B8" weight="fill" />
                  )}
                </View>
                <View className="flex-1">
                  <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900">
                    {property?.name || "Property"}
                  </Text>
                  <Text className="text-[11px] text-slate-600 mt-1">
                    ₹{property?.rent?.toLocaleString("en-IN")} / month
                  </Text>
                  <Text numberOfLines={1} className="text-[11px] text-slate-400 mt-0.5">
                    {property?.location}
                  </Text>
                </View>
              </View>

              {/* DATE PICKER */}
              <Text className="text-[11px] font-extrabold text-slate-400 mb-2.5 tracking-wide">
                VISIT DATE
              </Text>
              <CalendarPicker selected={visitDate} onChange={handleDateChange} />

              {/* TIME PICKER */}
              <Text className="text-[11px] font-extrabold text-slate-400 mb-2.5 tracking-wide">
                PREFERRED TIME
              </Text>
              <TimePicker selected={visitDate} onChange={handleTimeChange} />

              {/* NOTE */}
              <Text className="text-[11px] font-extrabold text-slate-400 mb-2.5 tracking-wide">
                NOTE FOR HOST
              </Text>
              <View className="bg-white rounded-2xl border border-slate-200 p-3.5 min-h-[110px] mb-5">
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  onFocus={handleNoteFocus}
                  multiline
                  maxLength={2000}
                  placeholder="Write something..."
                  textAlignVertical="top"
                  placeholderTextColor="#94A3B8"
                  className="text-sm min-h-20 text-slate-900"
                />
              </View>

              {/* SUMMARY */}
              <View className="flex-row items-center p-3 bg-blue-50 rounded-xl">
                <CalendarCheck size={18} color="#2563EB" weight="fill" />
                <Text className="ml-2.5 flex-1 text-xs text-blue-700">
                  Visiting on <Text className="font-extrabold">{formattedDate}</Text> at{" "}
                  <Text className="font-extrabold">{formattedTime}</Text>
                </Text>
              </View>

              {error ? (
                <View className="mt-3.5 bg-red-50 rounded-xl p-3">
                  <Text className="text-xs text-red-800">{error}</Text>
                </View>
              ) : null}

              {/* SUBMIT */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className={`mt-5 ${loading ? "bg-slate-300" : "bg-blue-600"} rounded-2xl py-3.5 flex-row items-center justify-center`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Check size={18} color="#fff" weight="bold" />
                    <Text className="ml-2 text-white font-bold text-[15px]">Send Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}