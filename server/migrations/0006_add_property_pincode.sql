-- Adds a pincode column to properties.
-- Existing rows are left nullable so older listings remain valid.

BEGIN;

ALTER TABLE "properties"
ADD COLUMN IF NOT EXISTS "pincode" varchar(10);

COMMIT;