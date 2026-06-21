-- 030_booking_hold_expires.sql
-- Add hold_expires_at to guide_bookings: set when a guide accepts,
-- gives the traveler a 24-hour window to pay before the hold lapses.
ALTER TABLE public.guide_bookings
  ADD COLUMN IF NOT EXISTS hold_expires_at timestamptz;
