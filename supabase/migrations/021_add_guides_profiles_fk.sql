-- 021_add_guides_profiles_fk.sql
-- Add foreign key constraint between guides and profiles to allow database-level joins in PostgREST
ALTER TABLE public.guides
ADD CONSTRAINT fk_guides_profiles
FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;
