-- Migration: Add algolia_schema column to organizations table
-- Run this once against your PostgreSQL database

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS algolia_schema TEXT;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'organizations'
  AND column_name = 'algolia_schema';
