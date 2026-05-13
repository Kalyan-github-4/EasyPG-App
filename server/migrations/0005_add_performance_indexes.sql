-- ─────────────────────────────────────────────────────────────
-- Migration 0005: Add performance indexes
--
-- Every WHERE / ORDER BY clause that was missing a supporting
-- index caused PostgreSQL to do a full sequential scan.
-- These indexes cover all hot query paths across every route.
-- ─────────────────────────────────────────────────────────────

BEGIN;

-- ─── users ───────────────────────────────────────────────────
-- syncUser middleware: WHERE clerk_id = ?  (runs on EVERY authenticated request)
CREATE INDEX IF NOT EXISTS idx_users_clerk_id
  ON users (clerk_id);

-- ─── properties ──────────────────────────────────────────────
-- GET /properties/me  →  WHERE host_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_properties_host_id
  ON properties (host_id);

-- GET /properties (public list)  →  ORDER BY created_at DESC
-- GET /properties/me             →  ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_properties_created_at_desc
  ON properties (created_at DESC);

-- Composite: host_id + created_at covers both the filter and the sort
-- in /properties/me with a single index scan (more efficient than two separate indexes)
CREATE INDEX IF NOT EXISTS idx_properties_host_created
  ON properties (host_id, created_at DESC);

-- ─── property_photos ─────────────────────────────────────────
-- batchEnrich / loadPropertyWithRelations: WHERE property_id IN (...)
-- DISTINCT ON query in enrichThreads:       WHERE property_id IN (...) ORDER BY property_id, display_order
CREATE INDEX IF NOT EXISTS idx_property_photos_property_id
  ON property_photos (property_id, display_order);

-- ─── facilities ──────────────────────────────────────────────
-- batchEnrich / loadPropertyWithRelations: WHERE property_id IN (...)
CREATE INDEX IF NOT EXISTS idx_facilities_property_id
  ON facilities (property_id);

-- ─── saved_listings ──────────────────────────────────────────
-- GET /saved         →  WHERE guest_id = ? ORDER BY saved_at DESC
-- POST/DELETE /saved →  WHERE guest_id = ? AND property_id = ?
CREATE INDEX IF NOT EXISTS idx_saved_listings_guest_id
  ON saved_listings (guest_id, saved_at DESC);

-- Composite for the duplicate-check in POST /saved/:propertyId
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_listings_guest_property
  ON saved_listings (guest_id, property_id);

-- ─── booking_requests ────────────────────────────────────────
-- GET /bookings/me   →  WHERE guest_id = ? ORDER BY requested_at DESC
CREATE INDEX IF NOT EXISTS idx_booking_requests_guest_id
  ON booking_requests (guest_id, requested_at DESC);

-- GET /bookings/host →  WHERE property_id IN (...) ORDER BY requested_at DESC
CREATE INDEX IF NOT EXISTS idx_booking_requests_property_id
  ON booking_requests (property_id, requested_at DESC);

-- Duplicate-check in POST /bookings:
-- WHERE guest_id = ? AND property_id = ? AND status = 'pending'
CREATE INDEX IF NOT EXISTS idx_booking_requests_pending_check
  ON booking_requests (guest_id, property_id, status);

-- ─── inquiries ───────────────────────────────────────────────
-- GET /inquiries  →  WHERE (guest_id = ? OR host_id = ?) ORDER BY last_message_at DESC
CREATE INDEX IF NOT EXISTS idx_inquiries_guest_id
  ON inquiries (guest_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_inquiries_host_id
  ON inquiries (host_id, last_message_at DESC);

-- Duplicate-check in POST /inquiries:
-- WHERE guest_id = ? AND property_id = ?
CREATE UNIQUE INDEX IF NOT EXISTS idx_inquiries_guest_property
  ON inquiries (guest_id, property_id);

-- ─── inquiry_messages ────────────────────────────────────────
-- GET /inquiries/:id  →  WHERE inquiry_id = ? ORDER BY created_at ASC
CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry_id
  ON inquiry_messages (inquiry_id, created_at ASC);

-- ─── notifications ───────────────────────────────────────────
-- Future: WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON notifications (user_id, created_at DESC);

-- ─── user_devices ────────────────────────────────────────────
-- Future: WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id
  ON user_devices (user_id);

COMMIT;
