-- 028_remove_trip_pass.sql
-- Remove trip_pass tier (idempotent — no-ops if already removed)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_tier' AND e.enumlabel = 'trip_pass'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN tier DROP DEFAULT;
    ALTER TABLE public.itineraries ALTER COLUMN tier DROP DEFAULT;
    ALTER TYPE user_tier RENAME TO user_tier_old;
    CREATE TYPE user_tier AS ENUM ('explorer', 'nomad', 'elite');
    ALTER TABLE public.profiles ALTER COLUMN tier TYPE user_tier
      USING (CASE WHEN tier::text = 'trip_pass' THEN 'explorer'::user_tier ELSE tier::text::user_tier END);
    ALTER TABLE public.itineraries ALTER COLUMN tier TYPE user_tier
      USING (CASE WHEN tier::text = 'trip_pass' THEN 'explorer'::user_tier ELSE tier::text::user_tier END);
    ALTER TABLE public.profiles ALTER COLUMN tier SET DEFAULT 'explorer'::user_tier;
    ALTER TABLE public.itineraries ALTER COLUMN tier SET DEFAULT 'explorer'::user_tier;
    DROP TYPE user_tier_old;
  END IF;
END $$;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS trip_pass_expires_at;
