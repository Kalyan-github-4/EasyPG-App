import { pgTable, uuid, varchar, text, pgEnum, timestamp, boolean, integer, uniqueIndex, index, numeric, doublePrecision, } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["guest", "host"]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "accepted",
  "rejected",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "pg",
  "mess",
  "hostel",
]);

export const propertyGenderEnum = pgEnum("property_gender", [
  "boys",
  "girls",
  "any",
]);

export const facilityTypeEnum = pgEnum("facility_type", [
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

// ─── Users ───────────────────────────────────────────────
// Synced from Clerk via webhooks or on first API request.
// `clerkId` is the Clerk user ID (e.g., "user_2x...").
// All auth (password, OAuth, sessions) is managed by Clerk.

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").notNull().default("guest"),
  hostProfileCompleted: boolean("host_profile_completed").notNull().default(false),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// ─── Properties ──────────────────────────────────────────

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostId: uuid("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyType: propertyTypeEnum("property_type").notNull().default("pg"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  city: varchar("city", { length: 80 }).notNull(),
  pincode: varchar("pincode", { length: 10 }),
  location: varchar("location", { length: 500 }).notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  rent: integer("rent").notNull(),
  gender: propertyGenderEnum("gender").notNull().default("any"),
  isAvailable: boolean("is_available").default(true).notNull(),
  isTrusted: boolean("is_trusted").default(false).notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).default("0.0").notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
},
  (table) => ({
    cityIdx: index("properties_city_idx").on(table.city),
    hostIdx: index("properties_host_idx").on(table.hostId),
    rentIdx: index("properties_rent_idx").on(table.rent),
    availabilityIdx: index("properties_available_idx").on(table.isAvailable),
    genderIdx: index("properties_gender_idx").on(table.gender),
  })
);

// ─── Property Photos ─────────────────────────────────────

export const propertyPhotos = pgTable("property_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  publicId: varchar("public_id", { length: 255 }),
  displayOrder: integer("display_order").default(0).notNull(),
});

// ─── Facilities ──────────────────────────────────────────

export const facilities = pgTable("facilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  type: facilityTypeEnum("type").notNull(),
});

// ─── Saved Listings ──────────────────────────────────────

export const savedListings = pgTable("saved_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  guestId: uuid("guest_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
},
  (table) => ({
    uniqueSavedListing: uniqueIndex("unique_saved_listing").on(table.guestId, table.propertyId),
  }));

// ─── Booking Requests ────────────────────────────────────

export const bookingRequests = pgTable("booking_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  guestId: uuid("guest_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  status: bookingStatusEnum("status").default("pending").notNull(),
  note: text("note"),
  visitDate: timestamp("visit_date"),
  respondedAt: timestamp("responded_at"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// ─── Inquiries (conversation threads) ────────────────────

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  guestId: uuid("guest_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  hostId: uuid("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  lastMessagePreview: varchar("last_message_preview", { length: 280 }),
  guestUnread: integer("guest_unread").default(0).notNull(),
  hostUnread: integer("host_unread").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (table) => ({
    guestIdx: index("inquiries_guest_idx").on(table.guestId),
    hostIdx: index("inquiries_host_idx").on(table.hostId),
    propertyIdx: index("inquiries_property_idx").on(table.propertyId),
  })
);

// ─── Inquiry messages ────────────────────────────────────

export const inquiryMessages = pgTable("inquiry_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  inquiryId: uuid("inquiry_id").notNull().references(() => inquiries.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (table) => ({
    inquiryIdx: index("messages_inquiry_idx").on(table.inquiryId),
  })
);

// ─── User Devices (for push notifications, Phase 6) ─────
export const userDevices = pgTable("user_devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fcmToken: text("fcm_token").notNull(),
  platform: varchar("platform", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (table) => ({
    uniqueFcmToken: uniqueIndex("unique_fcm_token").on(
      table.fcmToken
    ),
    userIdx: index("user_devices_user_idx").on(table.userId),
  })
);

// ─── Notifications (Phase 6) ─────────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  referenceId: uuid("reference_id"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  savedListings: many(savedListings),
  bookingRequests: many(bookingRequests),
  devices: many(userDevices),
  notifications: many(notifications),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  host: one(users, {
    fields: [properties.hostId],
    references: [users.id],
  }),
  photos: many(propertyPhotos),
  facilities: many(facilities),
  savedBy: many(savedListings),
  bookingRequests: many(bookingRequests),
}));

export const propertyPhotosRelations = relations(
  propertyPhotos,
  ({ one }) => ({
    property: one(properties, {
      fields: [propertyPhotos.propertyId],
      references: [properties.id],
    }),
  })
);

export const facilitiesRelations = relations(facilities, ({ one }) => ({
  property: one(properties, {
    fields: [facilities.propertyId],
    references: [properties.id],
  }),
}));

export const savedListingsRelations = relations(savedListings, ({ one }) => ({
  guest: one(users, {
    fields: [savedListings.guestId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [savedListings.propertyId],
    references: [properties.id],
  }),
}));

export const bookingRequestsRelations = relations(
  bookingRequests,
  ({ one }) => ({
    guest: one(users, {
      fields: [bookingRequests.guestId],
      references: [users.id],
    }),
    property: one(properties, {
      fields: [bookingRequests.propertyId],
      references: [properties.id],
    }),
  })
);

export const inquiriesRelations = relations(inquiries, ({ one, many }) => ({
  guest: one(users, {
    fields: [inquiries.guestId],
    references: [users.id],
  }),
  host: one(users, {
    fields: [inquiries.hostId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [inquiries.propertyId],
    references: [properties.id],
  }),
  messages: many(inquiryMessages),
}));

export const inquiryMessagesRelations = relations(inquiryMessages, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [inquiryMessages.inquiryId],
    references: [inquiries.id],
  }),
  sender: one(users, {
    fields: [inquiryMessages.senderId],
    references: [users.id],
  }),
}));

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(users, {
    fields: [userDevices.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
