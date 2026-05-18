import { z } from "zod";
import {
  WifiHigh,
  Snowflake,
  ForkKnife,
  TShirt,
  Car,
  ShieldCheck,
  VideoCamera,
  Barbell,
  Lightning,
  Drop,
  Bed,
} from "phosphor-react-native";
import type { FacilityType, PropertyInput, PropertyType, PropertyGender, OccupancyType } from "@/src/services/api";

// ─── Facility Metadata ──────────────────────────────────

export const FACILITY_META: {
  type: FacilityType;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
}[] = [
  { type: "wifi", label: "Wi-Fi", Icon: WifiHigh },
  { type: "ac", label: "Air Conditioning", Icon: Snowflake },
  { type: "food", label: "Food / Mess", Icon: ForkKnife },
  { type: "laundry", label: "Laundry", Icon: TShirt },
  { type: "parking", label: "Parking", Icon: Car },
  { type: "security", label: "Security", Icon: ShieldCheck },
  { type: "cctv", label: "CCTV", Icon: VideoCamera },
  { type: "gym", label: "Gym", Icon: Barbell },
  { type: "power_backup", label: "Power Backup", Icon: Lightning },
  { type: "water_supply", label: "Water Supply", Icon: Drop },
  { type: "furnished", label: "Furnished", Icon: Bed },
];

// ─── Photo State (local to wizard) ──────────────────────

export type PhotoState = {
  localId: string;
  uri?: string;
  url?: string;
  publicId?: string;
  status: "uploading" | "uploaded" | "failed";
  error?: string;
};

// ─── Form State ──────────────────────────────────────────

export const STEPS = [
  "Basics",
  "Location",
  "Room & Pricing",
  "Amenities",
  "Photos",
  "About",
  "Review",
] as const;
export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type FormState = {
  step: StepIndex;
  propertyType: PropertyType;
  name: string;
  city: string;
  pincode: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  rent: string;
  gender: PropertyGender;
  occupancyType: OccupancyType;
  facilities: FacilityType[];
  photos: PhotoState[];
  description: string;
};

export const INITIAL_STATE: FormState = {
  step: 0,
  propertyType: "pg",
  name: "",
  city: "",
  pincode: "",
  location: "",
  latitude: null,
  longitude: null,
  rent: "",
  gender: "any",
  occupancyType: "single",
  facilities: [],
  photos: [],
  description: "",
};

// ─── Actions ─────────────────────────────────────────────

export type Action =
  | { type: "SET_FIELD"; field: "name" | "city" | "pincode" | "location" | "rent" | "description"; value: string }
  | { type: "SET_CITY"; value: string }
  | { type: "SET_COORDINATES"; latitude: number | null; longitude: number | null }
  | { type: "SET_PROPERTY_TYPE"; value: PropertyType }
  | { type: "SET_GENDER"; value: PropertyGender }
  | { type: "SET_OCCUPANCY_TYPE"; value: OccupancyType }
  | { type: "TOGGLE_FACILITY"; value: FacilityType }
  | { type: "ADD_PHOTO"; photo: PhotoState }
  | { type: "UPDATE_PHOTO"; localId: string; patch: Partial<PhotoState> }
  | { type: "REMOVE_PHOTO"; localId: string }
  | { type: "SET_COVER"; localId: string }
  | { type: "GOTO"; step: StepIndex }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "HYDRATE"; state: Partial<FormState> }
  | { type: "RESET" };

export function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "SET_CITY":
      return {
        ...state,
        city: action.value,
        latitude: null,
        longitude: null,
      };

    case "SET_COORDINATES":
      return {
        ...state,
        latitude: action.latitude,
        longitude: action.longitude,
      };

    case "SET_PROPERTY_TYPE":
      return { ...state, propertyType: action.value };

    case "SET_GENDER":
      return { ...state, gender: action.value };

    case "SET_OCCUPANCY_TYPE":
      return { ...state, occupancyType: action.value };

    case "TOGGLE_FACILITY": {
      const has = state.facilities.includes(action.value);
      return {
        ...state,
        facilities: has
          ? state.facilities.filter((f) => f !== action.value)
          : [...state.facilities, action.value],
      };
    }

    case "ADD_PHOTO":
      return { ...state, photos: [...state.photos, action.photo] };

    case "UPDATE_PHOTO":
      return {
        ...state,
        photos: state.photos.map((p) =>
          p.localId === action.localId ? { ...p, ...action.patch } : p
        ),
      };

    case "REMOVE_PHOTO":
      return {
        ...state,
        photos: state.photos.filter((p) => p.localId !== action.localId),
      };

    case "SET_COVER": {
      const idx = state.photos.findIndex((p) => p.localId === action.localId);
      if (idx <= 0) return state;
      const reordered = [...state.photos];
      const [picked] = reordered.splice(idx, 1);
      reordered.unshift(picked);
      return { ...state, photos: reordered };
    }

    case "GOTO":
      return { ...state, step: action.step };

    case "NEXT":
      return state.step < 6 ? { ...state, step: (state.step + 1) as StepIndex } : state;

    case "BACK":
      return state.step > 0 ? { ...state, step: (state.step - 1) as StepIndex } : state;

    case "HYDRATE":
      return { ...INITIAL_STATE, ...action.state, step: 0 };

    case "RESET":
      return INITIAL_STATE;

    default:
      return state;
  }
}

// ─── Validation (zod schemas per step) ──────────────────

export const facilityEnum = z.enum([
  "wifi",
  "ac",
  "food",
  "laundry",
  "parking",
  "security",
  "gym",
  "power_backup",
  "water_supply",
  "furnished",
  "cctv",
]);

const basicsSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(120),
  city: z.string().trim().min(2, "Please pick a city").max(80),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  location: z.string().trim().min(5, "Please enter a full address").max(500),
});

const mapSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const roomsSchema = z.object({
  rent: z
    .string()
    .regex(/^\d+$/, "Rent must be a number")
    .transform((v) => Number(v))
    .refine((n) => n > 0 && n <= 1_000_000, "Enter a realistic rent"),
});

const amenitiesSchema = z.object({
  facilities: z.array(facilityEnum).min(1, "Select at least one amenity"),
});

const aboutSchema = z.object({
  description: z.string().trim().max(2000).optional(),
});

export function validateStep(step: StepIndex, state: FormState): string | null {
  try {
    switch (step) {
      case 0:
        basicsSchema.parse({
          name: state.name,
          city: state.city,
          pincode: state.pincode,
          location: state.location,
        });
        return null;
      case 1:
        mapSchema.parse({
          latitude: state.latitude,
          longitude: state.longitude,
        });
        return null;
      case 2:
        roomsSchema.parse({ rent: state.rent });
        return null;
      case 3:
        amenitiesSchema.parse({ facilities: state.facilities });
        return null;
      case 4: {
        const uploaded = state.photos.filter((p) => p.status === "uploaded").length;
        const uploading = state.photos.filter((p) => p.status === "uploading").length;
        const failed = state.photos.filter((p) => p.status === "failed").length;
        if (uploading > 0) return "Wait for uploads to finish";
        if (failed > 0) return "Retry or remove failed uploads";
        if (uploaded < 1) return "Add at least one photo";
        if (uploaded > 10) return "Maximum 10 photos";
        return null;
      }
      case 5:
        aboutSchema.parse({ description: state.description });
        return null;
      case 6:
        return null;
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return err.issues[0]?.message || "Invalid input";
    }
    return "Invalid input";
  }
  return null;
}

/** Build API payload from a valid form state. */
export function buildPayload(state: FormState): PropertyInput {
  return {
    propertyType: state.propertyType,
    name: state.name.trim(),
    city: state.city.trim(),
    pincode: state.pincode.trim(),
    location: state.location.trim(),
    latitude: state.latitude ?? undefined,
    longitude: state.longitude ?? undefined,
    rent: Number(state.rent),
    gender: state.gender,
    occupancyType: state.occupancyType,
    description: state.description.trim() || undefined,
    facilities: state.facilities,
    photos: state.photos
      .filter((p) => p.status === "uploaded" && p.url && p.publicId)
      .map((p, idx) => ({
        url: p.url!,
        publicId: p.publicId!,
        displayOrder: idx,
      })),
  };
}
