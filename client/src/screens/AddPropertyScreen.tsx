import React, { useEffect, useReducer, useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import FormShell from "@/src/components/add-property/FormShell";
import Skeleton from "@/src/components/ui/Skeleton";
import StepBasics from "@/src/components/add-property/StepBasics";
import LocationPicker from "@/src/components/add-property/LocationPicker";
import StepRooms from "@/src/components/add-property/StepRooms";
import StepAmenities from "@/src/components/add-property/StepAmenities";
import StepPhotos from "@/src/components/add-property/StepPhotos";
import StepAbout from "@/src/components/add-property/StepAbout";
import StepReview from "@/src/components/add-property/StepReview";

import {
  reducer,
  INITIAL_STATE,
  validateStep,
  buildPayload,
} from "@/src/components/add-property/types";
import type { FormState, PhotoState } from "@/src/components/add-property/types";
import {
  useDraftPersistence,
  loadDraft,
  clearDraft,
  hasAnyContent,
} from "@/src/components/add-property/useAddPropertyDraft";
import * as api from "@/src/services/api";

const STEP_TITLES = [
  { title: "Basics", subtitle: "Name, address, and pincode" },
  { title: "Location", subtitle: "Search and fine-tune the pin" },
  { title: "Pricing", subtitle: "Monthly rent" },
  { title: "Amenities", subtitle: "What's included" },
  { title: "Photos", subtitle: "Show your property" },
  { title: "Description", subtitle: "About your PG" },
  { title: "Review", subtitle: "Confirm and submit" },
];

type Props = {
  editId?: string;
};

function propertyToState(p: api.Property): Partial<FormState> {
  const photos: PhotoState[] = p.photos
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((ph, idx) => ({
      localId: `existing-${ph.id}-${idx}`,
      url: ph.url,
      publicId: ph.publicId || "",
      status: "uploaded" as const,
    }));

  return {
    propertyType: p.propertyType,
    name: p.name,
    city: p.city,
    pincode: p.pincode ?? "",
    location: p.location,
    latitude: p.latitude ?? null,
    longitude: p.longitude ?? null,
    rent: String(p.rent),
    facilities: p.facilities,
    description: p.description || "",
    photos,
  };
}

export default function AddPropertyScreen({ editId }: Props) {
  const { getToken } = useAuth();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(Boolean(editId));
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const isEdit = Boolean(editId);

  // ─── Hydrate on mount ─────────────────────────────
  useEffect(() => {
    (async () => {
      if (editId) {
        try {
          const property = await api.getProperty(editId);
          dispatch({ type: "HYDRATE", state: propertyToState(property) });
        } catch (err: any) {
          Alert.alert(
            "Couldn't load property",
            err?.message || "Please try again.",
            [{ text: "OK", onPress: () => router.back() }],
            { cancelable: false }
          );
          return;
        } finally {
          setLoadingExisting(false);
        }
        setHydrated(true);
        return;
      }

      const draft = await loadDraft();
      if (hasAnyContent(draft)) {
        Alert.alert(
          "Resume your draft?",
          "We found a property listing you started earlier. Pick up where you left off?",
          [
            {
              text: "Discard",
              style: "destructive",
              onPress: async () => {
                await clearDraft();
                setHydrated(true);
              },
            },
            {
              text: "Resume",
              onPress: () => {
                dispatch({ type: "HYDRATE", state: draft! });
                setHydrated(true);
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        setHydrated(true);
      }
    })();
  }, [editId]);

  // ─── Auto-save draft (only in create mode) ────────
  useDraftPersistence(state, hydrated && !isEdit);

  // ─── Clear error when state changes ──────────────
  useEffect(() => {
    setErrorText(null);
  }, [
    state.step,
    state.name,
    state.city,
    state.pincode,
    state.location,
    state.latitude,
    state.longitude,
    state.rent,
    state.facilities,
    state.photos,
    state.description,
  ]);

  // ─── Navigation handlers ─────────────────────────
  const handleBack = () => {
    if (state.step === 0) {
      confirmExit();
      return;
    }
    dispatch({ type: "BACK" });
  };

  const confirmExit = () => {
    if (isEdit) {
      router.back();
      return;
    }
    if (!hasAnyContent(state)) {
      router.replace("/(app)/(tabs)" as any);
      return;
    }
    Alert.alert(
      "Discard draft?",
      "Your progress will be saved and you can resume later.",
      [
        { text: "Keep editing", style: "cancel" },
        {
          text: "Leave",
          onPress: () => router.replace("/(app)/(tabs)" as any),
        },
      ]
    );
  };

  const handleNext = async () => {
    const err = validateStep(state.step, state);
    if (err) {
      setErrorText(err);
      return;
    }

    if (state.step < 5) {
      dispatch({ type: "NEXT" });
      return;
    }

    await handleSubmit();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorText(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const payload = buildPayload(state);

      if (isEdit && editId) {
        await api.updateProperty(token, editId, payload);
        Alert.alert(
          "Saved",
          "Your changes are live on EasyPG.",
          [{ text: "Done", onPress: () => router.back() }],
          { cancelable: false }
        );
      } else {
        const property = await api.createProperty(token, payload);
        await clearDraft();
        Alert.alert(
          "Listed! 🎉",
          "Your property is live on EasyPG.",
          [
            {
              text: "Done",
              onPress: () => router.replace("/(app)/(tabs)" as any),
            },
          ],
          { cancelable: false }
        );
        if (!property?.id) console.warn("Create property returned no id");
      }
    } catch (err: any) {
      setErrorText(
        err?.message ||
          (isEdit
            ? "Failed to save changes. Please try again."
            : "Failed to create property. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading existing property ───────────────────
  if (loadingExisting) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8F9FA", paddingTop: 60 }}>
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <Skeleton width={120} height={14} />
          <Skeleton width="70%" height={22} />
          <Skeleton width="50%" height={13} />
        </View>
        <View style={{ paddingHorizontal: 20, marginTop: 32, gap: 16 }}>
          <Skeleton width="100%" height={48} borderRadius={12} />
          <Skeleton width="100%" height={48} borderRadius={12} />
          <Skeleton width="100%" height={120} borderRadius={12} />
        </View>
      </View>
    );
  }

  const stepMeta = STEP_TITLES[state.step];
  const nextLabel =
    state.step === 5 ? (isEdit ? "Save Changes" : "Publish Listing") : "Next";

  return (
    <FormShell
      step={state.step}
      title={isEdit ? "Edit property" : stepMeta.title}
      subtitle={isEdit ? stepMeta.title : stepMeta.subtitle}
      onBack={handleBack}
      onNext={handleNext}
      nextLabel={nextLabel}
      nextLoading={submitting}
      errorText={errorText}
    >
      {state.step === 0 && <StepBasics state={state} dispatch={dispatch} />}
      {state.step === 1 && (
        <LocationPicker
          city={state.city}
          location={state.location}
          pincode={state.pincode}
          value={
            state.latitude !== null && state.longitude !== null
              ? { latitude: state.latitude, longitude: state.longitude }
              : null
          }
          onChange={(coords: { latitude: number; longitude: number }) =>
            dispatch({
              type: "SET_COORDINATES",
              latitude: coords.latitude,
              longitude: coords.longitude,
            })
          }
        />
      )}
      {state.step === 2 && <StepRooms state={state} dispatch={dispatch} />}
      {state.step === 3 && <StepAmenities state={state} dispatch={dispatch} />}
      {state.step === 4 && <StepPhotos state={state} dispatch={dispatch} />}
      {state.step === 5 && <StepAbout state={state} dispatch={dispatch} />}
      {state.step === 6 && <StepReview state={state} dispatch={dispatch} />}
    </FormShell>
  );
}
