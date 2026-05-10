import { VerificationLevel } from "./pgData";

export type Facility = { icon: string; label: string };
export type RoomType = { type: string; price: number };

export type Review = {
  id: string;
  userName: string;
  userInitial: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
};

export type PGDetail = {
  id: string;
  name: string;
  location: string;
  address: string;
  lat: number;
  lng: number;
  rent: number;
  rating: number;
  reviewCount: number;
  verification: VerificationLevel;
  images: string[];
  about: string;
  facilities: Facility[];
  roomTypes: RoomType[];
  host: { name: string; phone: string; initial: string };
  reviews: Review[];
};
