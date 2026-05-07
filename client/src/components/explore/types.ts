import type { Property } from "@/src/services/api";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type EnrichedProperty = Property & {
  distanceKm?: number;
};

export type FilterOption<T extends string> = {
  id: T;
  label: string;
};
