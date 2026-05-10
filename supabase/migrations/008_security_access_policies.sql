-- 008_security_access_policies.sql
-- Harden profile updates and enforce tier access for curated itinerary locations.

-- Users may view their own profile, but direct client updates are limited to
-- non-billing profile fields. Stripe/subscription fields are updated by
-- trusted server-side service-role code only.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

REVOKE UPDATE ON public.profiles FROM anon;
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;

CREATE POLICY "Users can update own profile full name"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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
  THEN
    RAISE EXCEPTION 'Tier and subscription fields can only be updated by trusted server code.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_client_subscription_profile_update ON public.profiles;
CREATE TRIGGER prevent_client_subscription_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_client_subscription_profile_update();

CREATE OR REPLACE FUNCTION public.tier_rank(tier user_tier)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE tier
    WHEN 'explorer' THEN 0
    WHEN 'nomad' THEN 1
    WHEN 'elite' THEN 2
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_tier_rank()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT public.tier_rank(profiles.tier)
      FROM public.profiles
      WHERE profiles.id = auth.uid()
    ),
    0
  );
$$;

DROP POLICY IF EXISTS "Allow public read access" ON public.locations;

CREATE POLICY "Users can read locations for accessible itinerary tiers"
  ON public.locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.itineraries
      WHERE itineraries.id = locations.itinerary_id
        AND public.current_user_tier_rank() >= public.tier_rank(itineraries.tier)
    )
  );
