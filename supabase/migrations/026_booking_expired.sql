-- Index for fast on-read sweep: pending bookings older than 48h
CREATE INDEX IF NOT EXISTS idx_guide_bookings_pending_created
  ON public.guide_bookings (status, created_at)
  WHERE status = 'pending';
