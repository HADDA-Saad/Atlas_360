-- Ensure itinerary_id is nullable on guide_bookings (safety net; column should already be nullable)
ALTER TABLE public.guide_bookings
  ALTER COLUMN itinerary_id DROP NOT NULL;
