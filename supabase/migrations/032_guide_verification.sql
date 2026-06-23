-- 032_guide_verification.sql

-- 1. Add profile_picture_url to guides
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS profile_picture_url text;

-- 2. Create guide_verifications table
CREATE TABLE IF NOT EXISTS public.guide_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date NOT NULL,
  id_document_url text NOT NULL,
  license_document_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(guide_id)
);

-- Enable RLS
ALTER TABLE public.guide_verifications ENABLE ROW LEVEL SECURITY;

-- Guides can read their own verification requests
CREATE POLICY "Guides can view own verification request"
  ON public.guide_verifications FOR SELECT
  USING (auth.uid() = guide_id);

-- Guides can insert their own verification request
CREATE POLICY "Guides can insert own verification request"
  ON public.guide_verifications FOR INSERT
  WITH CHECK (auth.uid() = guide_id);

-- Guides can update their own verification request IF it's rejected or pending
CREATE POLICY "Guides can update own verification request"
  ON public.guide_verifications FOR UPDATE
  USING (auth.uid() = guide_id AND status IN ('pending', 'rejected'))
  WITH CHECK (auth.uid() = guide_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_guide_verifications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_guide_verifications_updated_at ON public.guide_verifications;
CREATE TRIGGER set_guide_verifications_updated_at
  BEFORE UPDATE ON public.guide_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_guide_verifications_updated_at();

-- Protect guide_verifications.status from client manipulation
CREATE OR REPLACE FUNCTION public.prevent_client_verification_manipulation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
    OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
  THEN
    RAISE EXCEPTION 'Protected verification fields (status, admin_notes) can only be updated by trusted server code.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_verification_integrity ON public.guide_verifications;
CREATE TRIGGER ensure_verification_integrity
  BEFORE UPDATE ON public.guide_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_client_verification_manipulation();

-- 3. Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('guide_documents', 'guide_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for 'avatars' (public)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policies for 'guide_documents' (private)
-- Guides can upload their own documents (folder = guide_id)
CREATE POLICY "Guides can upload their own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'guide_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Guides can view their own documents
CREATE POLICY "Guides can view their own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'guide_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Guides can update/delete their own documents
CREATE POLICY "Guides can update their own documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'guide_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Guides can delete their own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'guide_documents' AND (storage.foldername(name))[1] = auth.uid()::text);
