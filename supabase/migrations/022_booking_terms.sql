-- Record the timestamp at which the traveler agreed to the cancellation policy
ALTER TABLE public.guide_bookings
  ADD COLUMN IF NOT EXISTS terms_agreed_at timestamptz;
