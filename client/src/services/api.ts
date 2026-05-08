/**
 * API service for communicating with the EasyPG backend.
 * All authenticated requests attach the Clerk JWT token.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: Record<string, unknown>;
  token?: string | null;
};

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || "Request failed", response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Network error — is the server running?", 0, error);
  }
}
export async function registerDevice(
  token: string,
  data: { fcmToken: string; platform: "ios" | "android" }
): Promise<void> {
  await request("/devices", { method: "POST", token, body: data });
}

export async function unregisterDevice(
  token: string,
  fcmToken: string
): Promise<void> {
  await request("/devices", { method: "DELETE", token, body: { fcmToken } });
}

// ─── Notification Endpoints ──────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
}

/** Fetch user's notifications */
export async function listNotifications(token: string): Promise<Notification[]> {
  const res = await request<NotificationsResponse>("/notifications", { token });
  return res.notifications;
}

/** Mark a single notification as read */
export async function markNotificationRead(
  token: string,
  id: string
): Promise<void> {
  await request<{ success: boolean }>(`/notifications/${id}/read`, {
    method: "PATCH",
    token,
  });
}

/** Mark all notifications as read */
export async function markAllNotificationsRead(token: string): Promise<void> {
  await request<{ success: boolean }>("/notifications/read-all", {
    method: "PATCH",
    token,
  });
}

// ─── User Endpoints ──────────────────────────────────────

export type UserRole = "guest" | "host";

export interface User {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  hostProfileCompleted: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserResponse {
  success: boolean;
  user: User;
}

/** Fetch current user profile (auto-creates user in DB on first call) */
export async function getMe(token: string): Promise<User> {
  const res = await request<UserResponse>("/users/me", { token });
  return res.user;
}

/** Update user profile */
export async function updateProfile(
  token: string,
  data: { name?: string; phone?: string; avatarUrl?: string | null }
): Promise<User> {
  const res = await request<UserResponse>("/users/me", {
    method: "PUT",
    token,
    body: data,
  });
  return res.user;
}

/** Set the current user's role (guest or host) */
export async function setRole(
  token: string,
  role: UserRole
): Promise<User> {
  const res = await request<UserResponse>("/users/me/role", {
    method: "PUT",
    token,
    body: { role },
  });
  return res.user;
}

/** Upgrade current user's role to host */
export async function becomeHost(token: string): Promise<User> {
  return setRole(token, "host");
}

// ─── Property Endpoints ──────────────────────────────────

export type FacilityType =
  | "wifi"
  | "ac"
  | "food"
  | "laundry"
  | "parking"
  | "security"
  | "gym"
  | "power_backup"
  | "water_supply"
  | "furnished"
  | "cctv";

export interface PropertyPhoto {
  id: string;
  propertyId: string;
  url: string;
  publicId: string | null;
  displayOrder: number;
}

export type PropertyType = "pg" | "mess" | "hostel";

export type PropertyGender = "boys" | "girls" | "any";

export interface PropertyHost {
  id: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
}

export interface Property {
  id: string;
  hostId: string;
  propertyType: PropertyType;
  name: string;
  description: string | null;
  city: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  rent: number;
  gender: PropertyGender;
  isAvailable: boolean;
  isTrusted: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  photos: PropertyPhoto[];
  facilities: FacilityType[];
  host?: PropertyHost | null;
}

export interface PropertyInput {
  propertyType?: PropertyType;
  name: string;
  description?: string;
  city: string;
  location: string;
  latitude?: number;
  longitude?: number;
  rent: number;
  gender?: PropertyGender;
  isAvailable?: boolean;
  facilities?: FacilityType[];
  photos?: { url: string; publicId: string; displayOrder?: number }[];
}

interface PropertyListResponse {
  success: boolean;
  properties: Property[];
}

interface PropertyResponse {
  success: boolean;
  property: Property;
}

/** Public list of all properties */
export async function listProperties(): Promise<Property[]> {
  const res = await request<PropertyListResponse>("/properties");
  return res.properties;
}

/** Host's own properties */
export async function listMyProperties(token: string): Promise<Property[]> {
  const res = await request<PropertyListResponse>("/properties/me", { token });
  return res.properties;
}

/** Public property detail */
export async function getProperty(id: string): Promise<Property> {
  const res = await request<PropertyResponse>(`/properties/${id}`);
  return res.property;
}

export async function createProperty(
  token: string,
  data: PropertyInput
): Promise<Property> {
  const res = await request<PropertyResponse>("/properties", {
    method: "POST",
    token,
    body: data as unknown as Record<string, unknown>,
  });
  return res.property;
}

export async function updateProperty(
  token: string,
  id: string,
  data: Partial<PropertyInput>
): Promise<Property> {
  const res = await request<PropertyResponse>(`/properties/${id}`, {
    method: "PUT",
    token,
    body: data as unknown as Record<string, unknown>,
  });
  return res.property;
}

export async function deleteProperty(token: string, id: string): Promise<void> {
  await request<{ success: boolean }>(`/properties/${id}`, {
    method: "DELETE",
    token,
  });
}

// ─── Inquiry Endpoints ───────────────────────────────────

export interface InquiryThread {
  inquiry: {
    id: string;
    guestId: string;
    hostId: string;
    propertyId: string;
    lastMessageAt: string;
    lastMessagePreview: string | null;
    guestUnread: number;
    hostUnread: number;
    createdAt: string;
  };
  property: {
    id: string;
    name: string;
    location: string;
    rent: number;
    coverUrl: string | null;
  };
  counterpart: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface InquiryMessage {
  id: string;
  inquiryId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

interface ThreadListResponse {
  success: boolean;
  threads: InquiryThread[];
}

interface ThreadResponse {
  success: boolean;
  thread: InquiryThread;
  messages: InquiryMessage[];
}

interface CreateInquiryResponse {
  success: boolean;
  thread: InquiryThread;
}

interface SendMessageResponse {
  success: boolean;
  message: InquiryMessage;
}

export async function createInquiry(
  token: string,
  data: { propertyId: string; message: string }
): Promise<InquiryThread> {
  const res = await request<CreateInquiryResponse>("/inquiries", {
    method: "POST",
    token,
    body: data,
  });
  return res.thread;
}

export async function listInquiries(
  token: string,
  filter?: { propertyId?: string }
): Promise<InquiryThread[]> {
  const qs = filter?.propertyId
    ? `?propertyId=${encodeURIComponent(filter.propertyId)}`
    : "";
  const res = await request<ThreadListResponse>(`/inquiries${qs}`, { token });
  return res.threads;
}

export async function getInquiry(
  token: string,
  id: string
): Promise<{ thread: InquiryThread; messages: InquiryMessage[] }> {
  const res = await request<ThreadResponse>(`/inquiries/${id}`, { token });
  return { thread: res.thread, messages: res.messages };
}

export async function sendInquiryMessage(
  token: string,
  id: string,
  body: string
): Promise<InquiryMessage> {
  const res = await request<SendMessageResponse>(`/inquiries/${id}/messages`, {
    method: "POST",
    token,
    body: { body },
  });
  return res.message;
}

export async function markInquiryRead(token: string, id: string): Promise<void> {
  await request<{ success: boolean }>(`/inquiries/${id}/read`, {
    method: "PATCH",
    token,
  });
}

// ─── Booking Endpoints ───────────────────────────────────

export type BookingStatus = "pending" | "accepted" | "rejected";

export interface BookingRequest {
  booking: {
    id: string;
    guestId: string;
    propertyId: string;
    status: BookingStatus;
    note: string | null;
    visitDate: string | null;
    respondedAt: string | null;
    requestedAt: string;
    updatedAt: string;
  };
  property: {
    id: string;
    name: string;
    location: string;
    rent: number;
  };
  guest: {
    id: string;
    name: string;
    phone: string | null;
    avatarUrl: string | null;
  };
}

interface BookingListResponse {
  success: boolean;
  bookings: BookingRequest[];
}

interface BookingResponse {
  success: boolean;
  booking: BookingRequest;
}

export async function createBooking(
  token: string,
  data: { propertyId: string; note?: string; visitDate?: string }
): Promise<BookingRequest> {
  const res = await request<BookingResponse>("/bookings", {
    method: "POST",
    token,
    body: data,
  });
  return res.booking;
}

export async function listMyBookings(token: string): Promise<BookingRequest[]> {
  const res = await request<BookingListResponse>("/bookings/me", { token });
  return res.bookings;
}

export async function listHostBookings(
  token: string,
  filter?: { propertyId?: string }
): Promise<BookingRequest[]> {
  const qs = filter?.propertyId
    ? `?propertyId=${encodeURIComponent(filter.propertyId)}`
    : "";
  const res = await request<BookingListResponse>(`/bookings/host${qs}`, {
    token,
  });
  return res.bookings;
}

export async function respondBooking(
  token: string,
  id: string,
  status: "accepted" | "rejected"
): Promise<BookingRequest> {
  const res = await request<BookingResponse>(`/bookings/${id}/respond`, {
    method: "PATCH",
    token,
    body: { status },
  });
  return res.booking;
}

export async function cancelBooking(token: string, id: string): Promise<void> {
  await request<{ success: boolean }>(`/bookings/${id}`, {
    method: "DELETE",
    token,
  });
}

// ─── Saved Listings ──────────────────────────────────────

interface SavedIdsResponse {
  success: boolean;
  ids: string[];
}

export async function listSaved(token: string): Promise<Property[]> {
  const res = await request<PropertyListResponse>("/saved", { token });
  return res.properties;
}

export async function listSavedIds(token: string): Promise<string[]> {
  const res = await request<SavedIdsResponse>("/saved/ids", { token });
  return res.ids;
}

export async function saveProperty(token: string, id: string): Promise<void> {
  await request<{ success: boolean; saved: boolean }>(`/saved/${id}`, {
    method: "POST",
    token,
  });
}

export async function unsaveProperty(
  token: string,
  id: string
): Promise<void> {
  await request<{ success: boolean; saved: boolean }>(`/saved/${id}`, {
    method: "DELETE",
    token,
  });
}

export { ApiError, API_BASE_URL };
