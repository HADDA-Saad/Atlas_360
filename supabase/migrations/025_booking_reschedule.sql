-- Track when a booking was last rescheduled by the traveler
ALTER TABLE public.guide_bookings
  ADD COLUMN IF NOT EXISTS rescheduled_at timestamptz;
