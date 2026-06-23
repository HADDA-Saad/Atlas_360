-- 015_trip_pass.sql
-- Add trip_pass tier and expiration tracking to profiles

-- Add trip_pass to the user_tier enum
ALTER TYPE user_tier ADD VALUE IF NOT EXISTS 'trip_pass';

-- Add expiration column for one-time trip passes
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trip_pass_expires_at timestamptz;
