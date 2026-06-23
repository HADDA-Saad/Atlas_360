-- 031_security_patches.sql
-- Enforce database-level security to prevent client manipulation of protected columns
-- and prevent self-booking/self-reviewing.

-- 1. Prevent Self-Booking & Self-Reviewing
ALTER TABLE public.guide_bookings 
  ADD CONSTRAINT prevent_self_booking CHECK (traveler_id != guide_id);

ALTER TABLE public.reviews 
  ADD CONSTRAINT prevent_self_review CHECK (user_id != guide_id OR guide_id IS NULL);

-- 2. Protect Guide Bookings (Escrow Integrity)
CREATE OR REPLACE FUNCTION public.prevent_client_booking_manipulation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow service_role (Admin API) to bypass checks
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
    OR NEW.total_price IS DISTINCT FROM OLD.total_price
    OR NEW.commission_amount IS DISTINCT FROM OLD.commission_amount
  THEN
    RAISE EXCEPTION 'Protected booking fields (status, total_price, commission_amount) can only be updated by trusted server code.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_booking_integrity ON public.guide_bookings;
CREATE TRIGGER ensure_booking_integrity
  BEFORE UPDATE ON public.guide_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_client_booking_manipulation();

-- 3. Protect Guides (Verification & Rating Integrity)
CREATE OR REPLACE FUNCTION public.prevent_client_guide_manipulation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified
    OR NEW.rating IS DISTINCT FROM OLD.rating
  THEN
    RAISE EXCEPTION 'Protected guide fields (is_verified, rating) can only be updated by trusted server code.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_guide_integrity ON public.guides;
CREATE TRIGGER ensure_guide_integrity
  BEFORE UPDATE ON public.guides
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_client_guide_manipulation();

-- 4. Protect Reviews (Moderation Integrity)
CREATE OR REPLACE FUNCTION public.prevent_client_review_manipulation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.photo_approved IS DISTINCT FROM OLD.photo_approved
    OR NEW.target_type IS DISTINCT FROM OLD.target_type
  THEN
    RAISE EXCEPTION 'Protected review fields (photo_approved, target_type) can only be updated by trusted server code.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_review_integrity ON public.reviews;
CREATE TRIGGER ensure_review_integrity
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_client_review_manipulation();
