-- 017_guides_schema.sql
-- Create guides, guide_bookings, and guide_availability tables with RLS policies

-- Create guides table
CREATE TABLE IF NOT EXISTS public.guides (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  bio text,
  languages text[] NOT NULL DEFAULT '{}',
  regions text[] NOT NULL DEFAULT '{}',
  daily_rate_mad integer NOT NULL DEFAULT 0,
  whatsapp_number text,
  is_verified boolean DEFAULT false,
  rating float8,
  created_at timestamptz DEFAULT now()
);

-- Create guide_bookings table
CREATE TABLE IF NOT EXISTS public.guide_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  traveler_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  itinerary_id uuid REFERENCES public.itineraries(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_price integer NOT NULL,
  commission_amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, accepted, declined, paid, completed, cancelled
  stripe_checkout_id text,
  created_at timestamptz DEFAULT now()
);

-- Create guide_availability table
CREATE TABLE IF NOT EXISTS public.guide_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  reason text,
  UNIQUE(guide_id, blocked_date)
);

-- Enable Row Level Security
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guides
DROP POLICY IF EXISTS "Allow public read access on verified guides" ON public.guides;
CREATE POLICY "Allow public read access on verified guides" ON public.guides
  FOR SELECT
  USING (is_verified = true OR auth.uid() = id);

DROP POLICY IF EXISTS "Allow guides to manage own profile" ON public.guides;
CREATE POLICY "Allow guides to manage own profile" ON public.guides
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for guide_bookings
DROP POLICY IF EXISTS "Allow access to own bookings" ON public.guide_bookings;
CREATE POLICY "Allow access to own bookings" ON public.guide_bookings
  FOR ALL
  USING (auth.uid() = traveler_id OR auth.uid() = guide_id);

-- RLS Policies for guide_availability
DROP POLICY IF EXISTS "Allow guides to manage own availability" ON public.guide_availability;
CREATE POLICY "Allow guides to manage own availability" ON public.guide_availability
  FOR ALL
  USING (auth.uid() = guide_id);

-- Update the new user trigger to handle guide registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create a guide profile if metadata dictates it
  IF (NEW.raw_user_meta_data->>'is_guide')::boolean = true THEN
    INSERT INTO public.guides (id, daily_rate_mad)
    VALUES (NEW.id, 0)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
