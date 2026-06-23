-- Create user_itineraries table
CREATE TABLE public.user_itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_itinerary_stops table
CREATE TABLE public.user_itinerary_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid NOT NULL REFERENCES public.user_itineraries(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  day_number integer NOT NULL DEFAULT 1,
  order_index integer NOT NULL DEFAULT 0,
  custom_notes text
);

-- Enable RLS
ALTER TABLE public.user_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_itinerary_stops ENABLE ROW LEVEL SECURITY;

-- Policies for user_itineraries

-- Users can manage their own itineraries
CREATE POLICY "Users can manage their own itineraries" 
ON public.user_itineraries 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Anyone can read public itineraries
CREATE POLICY "Anyone can read public itineraries" 
ON public.user_itineraries 
FOR SELECT 
USING (is_public = true);

-- Policies for user_itinerary_stops

-- Users can manage stops for their own itineraries
CREATE POLICY "Users can manage stops for their own itineraries" 
ON public.user_itinerary_stops 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_itineraries 
    WHERE user_itineraries.id = user_itinerary_stops.itinerary_id 
    AND user_itineraries.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_itineraries 
    WHERE user_itineraries.id = user_itinerary_stops.itinerary_id 
    AND user_itineraries.user_id = auth.uid()
  )
);

-- Anyone can read stops for public itineraries
CREATE POLICY "Anyone can read stops for public itineraries" 
ON public.user_itinerary_stops 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_itineraries 
    WHERE user_itineraries.id = user_itinerary_stops.itinerary_id 
    AND user_itineraries.is_public = true
  )
);
