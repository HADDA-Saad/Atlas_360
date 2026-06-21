-- 021_booking_messages.sql
-- In-app message thread per booking (unlocks when status = 'paid' or 'completed')

CREATE TABLE IF NOT EXISTS public.booking_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid        NOT NULL REFERENCES public.guide_bookings(id) ON DELETE CASCADE,
  sender_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;

-- Only the booking's traveler or guide can read messages, and only when booking is paid/completed
DROP POLICY IF EXISTS "booking participants can read messages" ON public.booking_messages;
CREATE POLICY "booking participants can read messages" ON public.booking_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guide_bookings gb
      WHERE gb.id = booking_id
        AND (gb.traveler_id = auth.uid() OR gb.guide_id = auth.uid())
        AND gb.status IN ('paid', 'completed')
    )
  );

-- Only booking participants can send messages, and only when booking is paid/completed
DROP POLICY IF EXISTS "booking participants can insert messages" ON public.booking_messages;
CREATE POLICY "booking participants can insert messages" ON public.booking_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.guide_bookings gb
      WHERE gb.id = booking_id
        AND (gb.traveler_id = auth.uid() OR gb.guide_id = auth.uid())
        AND gb.status IN ('paid', 'completed')
    )
  );

CREATE INDEX IF NOT EXISTS booking_messages_booking_idx
  ON public.booking_messages(booking_id, created_at ASC);
