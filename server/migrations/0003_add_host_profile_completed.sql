ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "host_profile_completed" boolean NOT NULL DEFAULT false;