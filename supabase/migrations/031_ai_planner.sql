-- 031_ai_planner.sql
-- Add ai_generations_count column to profiles and secure it from client modifications.
-- Seed a hidden container itinerary for user-generated custom stops.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_generations_count integer NOT NULL DEFAULT 0;

-- Update trigger function to also protect ai_generations_count
CREATE OR REPLACE FUNCTION public.prevent_client_subscription_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.tier IS DISTINCT FROM OLD.tier
    OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
    OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
    OR NEW.role IS DISTINCT FROM OLD.role
    OR NEW.ai_generations_count IS DISTINCT FROM OLD.ai_generations_count
  THEN
    RAISE EXCEPTION 'Protected profile fields can only be updated by trusted server code.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

-- Insert the AI Custom Stops Container itinerary with a static UUID
INSERT INTO public.itineraries (id, title, description, region, duration_days, tier)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'AI Custom Stops Container',
  'A system container used to house custom generated stops that do not belong to standard curated itineraries.',
  'System',
  1,
  'explorer'
)
ON CONFLICT (id) DO NOTHING;
