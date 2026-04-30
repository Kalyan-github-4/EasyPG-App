-- ─────────────────────────────────────────────────────────────
-- Manual migration: rename student → guest, owner → host
--
-- Run this once against the live DB to preserve existing rows.
-- After running, drizzle's schema snapshot will match — future
-- `db:push` / `db:generate` runs won't propose destructive diffs.
--
-- If the DB is empty (or you're OK reseeding), you can skip this
-- file and just run `npm run db:push` + `npm run db:seed`.
-- ─────────────────────────────────────────────────────────────

BEGIN;

-- 1) Rename user_role enum values
ALTER TYPE "public"."user_role" RENAME VALUE 'student' TO 'guest';
ALTER TYPE "public"."user_role" RENAME VALUE 'owner'   TO 'host';

-- 2) Rename default role on users.role
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'guest';

-- 3) Rename columns
ALTER TABLE "properties"        RENAME COLUMN "owner_id"       TO "host_id";
ALTER TABLE "saved_listings"    RENAME COLUMN "student_id"     TO "guest_id";
ALTER TABLE "booking_requests"  RENAME COLUMN "student_id"     TO "guest_id";
ALTER TABLE "inquiries"         RENAME COLUMN "student_id"     TO "guest_id";
ALTER TABLE "inquiries"         RENAME COLUMN "owner_id"       TO "host_id";
ALTER TABLE "inquiries"         RENAME COLUMN "student_unread" TO "guest_unread";
ALTER TABLE "inquiries"         RENAME COLUMN "owner_unread"   TO "host_unread";

COMMIT;
