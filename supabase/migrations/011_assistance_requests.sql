-- 011_assistance_requests.sql
-- Capture planning-help and booking-help requests from travelers.

CREATE TABLE IF NOT EXISTS public.assistance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  request_type text NOT NULL CHECK (request_type IN ('planning', 'booking_help')),
  contact_name text,
  contact_email text NOT NULL,
  message text NOT NULL CHECK (char_length(btrim(message)) BETWEEN 10 AND 2000),
  itinerary_id uuid,
  place_id text,
  place_name text,
  place_type text CHECK (place_type IS NULL OR place_type IN ('lodging', 'restaurant')),
  source_path text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'contacted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistance_requests_user_id
  ON public.assistance_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_assistance_requests_status
  ON public.assistance_requests(status, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_assistance_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_assistance_requests_updated_at ON public.assistance_requests;
CREATE TRIGGER set_assistance_requests_updated_at
  BEFORE UPDATE ON public.assistance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_assistance_requests_updated_at();

ALTER TABLE public.assistance_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create assistance requests" ON public.assistance_requests;
CREATE POLICY "Anyone can create assistance requests"
  ON public.assistance_requests FOR INSERT
  WITH CHECK (
    user_id IS NULL OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can read own assistance requests" ON public.assistance_requests;
CREATE POLICY "Users can read own assistance requests"
  ON public.assistance_requests FOR SELECT
  USING (auth.uid() = user_id);
