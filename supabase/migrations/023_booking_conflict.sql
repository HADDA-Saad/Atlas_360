-- Atomic overlap prevention for guide bookings
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Prevent two active (accepted/paid) bookings from overlapping dates for the same guide.
-- Error code on violation: 23P01 (exclusion_violation)
ALTER TABLE public.guide_bookings
  ADD CONSTRAINT no_overlapping_active_bookings
  EXCLUDE USING gist (
    guide_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  )
  WHERE (status IN ('accepted', 'paid'));

-- Track when the payment hold expires (set when guide accepts; traveler has 24 h to pay)
ALTER TABLE public.guide_bookings
  ADD COLUMN IF NOT EXISTS hold_expires_at timestamptz;
