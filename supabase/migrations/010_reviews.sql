-- 010_reviews.sql
-- Add authenticated text/star reviews for curated itineraries and stops.

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('itinerary', 'location')),
  itinerary_id uuid REFERENCES public.itineraries(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 3 AND 1200),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (target_type = 'itinerary' AND itinerary_id IS NOT NULL AND location_id IS NULL)
    OR
    (target_type = 'location' AND location_id IS NOT NULL AND itinerary_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_reviews_itinerary_id
  ON public.reviews(itinerary_id)
  WHERE target_type = 'itinerary';

CREATE INDEX IF NOT EXISTS idx_reviews_location_id
  ON public.reviews(location_id)
  WHERE target_type = 'location';

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_user_itinerary
  ON public.reviews(user_id, itinerary_id)
  WHERE target_type = 'itinerary';

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_user_location
  ON public.reviews(user_id, location_id)
  WHERE target_type = 'location';

CREATE OR REPLACE FUNCTION public.set_reviews_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_reviews_updated_at();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published reviews" ON public.reviews;
CREATE POLICY "Anyone can read published reviews"
  ON public.reviews FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Users can create own reviews" ON public.reviews;
CREATE POLICY "Users can create own reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'published');

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'published');

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
