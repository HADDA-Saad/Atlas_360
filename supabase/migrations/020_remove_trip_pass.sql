-- 020_remove_trip_pass.sql
-- Remove default constraints
ALTER TABLE public.profiles ALTER COLUMN tier DROP DEFAULT;
ALTER TABLE public.itineraries ALTER COLUMN tier DROP DEFAULT;

-- Rename old enum
ALTER TYPE user_tier RENAME TO user_tier_old;

-- Create new enum
CREATE TYPE user_tier AS ENUM ('explorer', 'nomad', 'elite');

-- Convert columns to new enum type, mapping 'trip_pass' to 'explorer'
ALTER TABLE public.profiles 
  ALTER COLUMN tier TYPE user_tier 
  USING (CASE WHEN tier::text = 'trip_pass' THEN 'explorer'::user_tier ELSE tier::text::user_tier END);

ALTER TABLE public.itineraries 
  ALTER COLUMN tier TYPE user_tier 
  USING (CASE WHEN tier::text = 'trip_pass' THEN 'explorer'::user_tier ELSE tier::text::user_tier END);

-- Restore default constraints
ALTER TABLE public.profiles ALTER COLUMN tier SET DEFAULT 'explorer'::user_tier;
ALTER TABLE public.itineraries ALTER COLUMN tier SET DEFAULT 'explorer'::user_tier;

-- Drop old enum type
DROP TYPE user_tier_old;

-- Drop trip_pass_expires_at column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS trip_pass_expires_at;
