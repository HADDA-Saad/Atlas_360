-- 029_add_guides_profiles_fk.sql
-- Add FK from guides.id → profiles.id (idempotent — no-op if already present)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_guides_profiles') THEN
    ALTER TABLE public.guides
      ADD CONSTRAINT fk_guides_profiles
      FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
