-- 018_guide_reviews_and_media.sql
-- Drop constraints to expand review target types and add guide review support

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_target_type_check;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_check;

ALTER TABLE public.reviews ADD CONSTRAINT reviews_target_type_check CHECK (target_type IN ('itinerary', 'location', 'guide'));

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS guide_id uuid REFERENCES public.guides(id) ON DELETE CASCADE;

ALTER TABLE public.reviews ADD CONSTRAINT reviews_check CHECK (
  (target_type = 'itinerary' AND itinerary_id IS NOT NULL AND location_id IS NULL AND guide_id IS NULL)
  OR
  (target_type = 'location' AND location_id IS NOT NULL AND itinerary_id IS NULL AND guide_id IS NULL)
  OR
  (target_type = 'guide' AND guide_id IS NOT NULL AND itinerary_id IS NULL AND location_id IS NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_user_guide
  ON public.reviews(user_id, guide_id)
  WHERE target_type = 'guide';

-- Add columns for photo uploads and moderation
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS photo_approved boolean DEFAULT false;

-- Trigger to update guide's average rating
CREATE OR REPLACE FUNCTION public.update_guide_average_rating()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'guide' THEN
      UPDATE public.guides
      SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM public.reviews
        WHERE target_type = 'guide' AND guide_id = OLD.guide_id
      )
      WHERE id = OLD.guide_id;
    END IF;
    RETURN OLD;
  ELSE
    IF NEW.target_type = 'guide' THEN
      UPDATE public.guides
      SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM public.reviews
        WHERE target_type = 'guide' AND guide_id = NEW.guide_id
      )
      WHERE id = NEW.guide_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_guide_rating ON public.reviews;
CREATE TRIGGER update_guide_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_guide_average_rating();

-- Storage review-photos setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read access to review photos" ON storage.objects;
CREATE POLICY "Allow public read access to review photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "Allow authenticated users to upload review photos" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload review photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'review-photos' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Allow owners to delete their own review photos" ON storage.objects;
CREATE POLICY "Allow owners to delete their own review photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'review-photos' AND auth.uid() = owner);

-- Allow public read access to profiles of verified guides
DROP POLICY IF EXISTS "Allow public read access on guide profiles" ON public.profiles;
CREATE POLICY "Allow public read access on guide profiles"
  ON public.profiles FOR SELECT
  USING (id IN (SELECT id FROM public.guides WHERE is_verified = true));
