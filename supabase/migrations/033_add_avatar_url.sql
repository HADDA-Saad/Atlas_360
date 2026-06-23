-- Add avatar_url and birth_date to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date date;

-- Migrate existing Guide data into profiles so it appears in their Settings!
UPDATE public.profiles p
SET avatar_url = g.profile_picture_url
FROM public.guides g
WHERE p.id = g.id AND p.avatar_url IS NULL;

UPDATE public.profiles p
SET birth_date = gv.birth_date
FROM public.guide_verifications gv
WHERE p.id = gv.guide_id AND p.birth_date IS NULL;
