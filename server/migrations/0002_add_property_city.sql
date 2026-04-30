-- Adds a structured `city` column to properties.
-- Existing rows are backfilled by matching known city names inside `location`.
-- After this migration, hosts MUST select a city from a controlled list when
-- creating/editing a property; the API validates the field as non-empty.

BEGIN;

-- Step 1: add column nullable so backfill can run.
ALTER TABLE "properties" ADD COLUMN "city" varchar(80);

-- Step 2: backfill from existing location strings.
-- Order matters: longer/more-specific city names go first to avoid
-- accidentally matching "Medinipur" inside "West Medinipur" etc.
UPDATE "properties" SET "city" =
  CASE
    WHEN "location" ILIKE '%Jhargram%'   THEN 'Jhargram'
    WHEN "location" ILIKE '%Kharagpur%'  THEN 'Kharagpur'
    WHEN "location" ILIKE '%Medinipur%'  THEN 'Medinipur'
    WHEN "location" ILIKE '%Hyderabad%'  THEN 'Hyderabad'
    WHEN "location" ILIKE '%Chennai%'    THEN 'Chennai'
    ELSE NULL
  END
WHERE "city" IS NULL;

-- Step 3: any rows that didn't match get a sentinel so we can enforce NOT NULL.
-- These need to be edited by their host afterwards.
UPDATE "properties" SET "city" = 'Unknown' WHERE "city" IS NULL;

-- Step 4: enforce the contract.
ALTER TABLE "properties" ALTER COLUMN "city" SET NOT NULL;

COMMIT;
