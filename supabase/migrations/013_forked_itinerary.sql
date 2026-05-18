-- Migration 013: Forked itinerary tracking
ALTER TABLE public.user_itineraries
  ADD COLUMN IF NOT EXISTS forked_from uuid REFERENCES public.itineraries(id) ON DELETE SET NULL;
