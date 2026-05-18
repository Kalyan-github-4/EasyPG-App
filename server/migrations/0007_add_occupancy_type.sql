-- Migration: Add occupancy_type enum and column to properties
-- Created: 2026-05-18

BEGIN;

-- Create the enum type (IF NOT EXISTS for safety)
DO $$ BEGIN
  CREATE TYPE occupancy_type AS ENUM ('single', 'double', 'triple', 'shared');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add the column with a default so existing rows get 'single'
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS occupancy_type occupancy_type NOT NULL DEFAULT 'single';

COMMIT;
