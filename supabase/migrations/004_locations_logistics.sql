ALTER TABLE public.itineraries
  ADD COLUMN IF NOT EXISTS tier user_tier NOT NULL DEFAULT 'explorer';

ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS day_number integer,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS transport text,
  ADD COLUMN IF NOT EXISTS tips text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS image_url text;
