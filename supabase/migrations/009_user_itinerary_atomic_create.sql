-- 009_user_itinerary_atomic_create.sql
-- Create custom itineraries and stops in one database transaction.

CREATE OR REPLACE FUNCTION public.create_user_itinerary_with_stops(
  p_user_id uuid,
  p_title text,
  p_description text,
  p_stops jsonb
)
RETURNS public.user_itineraries
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  new_itinerary public.user_itineraries%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Cannot create an itinerary for another user.'
      USING ERRCODE = '42501';
  END IF;

  IF p_title IS NULL OR btrim(p_title) = '' THEN
    RAISE EXCEPTION 'Title is required.'
      USING ERRCODE = '22023';
  END IF;

  IF p_stops IS NULL OR jsonb_typeof(p_stops) <> 'array' OR jsonb_array_length(p_stops) = 0 THEN
    RAISE EXCEPTION 'At least one stop is required.'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.user_itineraries (user_id, title, description, is_public)
  VALUES (p_user_id, btrim(p_title), NULLIF(btrim(COALESCE(p_description, '')), ''), false)
  RETURNING * INTO new_itinerary;

  INSERT INTO public.user_itinerary_stops (
    itinerary_id,
    location_id,
    day_number,
    order_index,
    custom_notes
  )
  SELECT
    new_itinerary.id,
    stop.location_id,
    GREATEST(stop.day_number, 1),
    GREATEST(stop.order_index, 0),
    NULLIF(btrim(COALESCE(stop.custom_notes, '')), '')
  FROM jsonb_to_recordset(p_stops) AS stop(
    location_id uuid,
    day_number integer,
    order_index integer,
    custom_notes text
  );

  RETURN new_itinerary;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_user_itinerary_with_stops(uuid, text, text, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_user_itinerary_with_stops(
  p_itinerary_id uuid,
  p_user_id uuid,
  p_title text,
  p_description text,
  p_stops jsonb
)
RETURNS public.user_itineraries
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  updated_itinerary public.user_itineraries%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Cannot update an itinerary for another user.'
      USING ERRCODE = '42501';
  END IF;

  IF p_title IS NULL OR btrim(p_title) = '' THEN
    RAISE EXCEPTION 'Title is required.'
      USING ERRCODE = '22023';
  END IF;

  IF p_stops IS NULL OR jsonb_typeof(p_stops) <> 'array' OR jsonb_array_length(p_stops) = 0 THEN
    RAISE EXCEPTION 'At least one stop is required.'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.user_itineraries
  SET
    title = btrim(p_title),
    description = NULLIF(btrim(COALESCE(p_description, '')), ''),
    updated_at = now()
  WHERE id = p_itinerary_id
    AND user_id = p_user_id
  RETURNING * INTO updated_itinerary;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Itinerary not found.'
      USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM public.user_itinerary_stops
  WHERE itinerary_id = p_itinerary_id;

  INSERT INTO public.user_itinerary_stops (
    itinerary_id,
    location_id,
    day_number,
    order_index,
    custom_notes
  )
  SELECT
    p_itinerary_id,
    stop.location_id,
    GREATEST(stop.day_number, 1),
    GREATEST(stop.order_index, 0),
    NULLIF(btrim(COALESCE(stop.custom_notes, '')), '')
  FROM jsonb_to_recordset(p_stops) AS stop(
    location_id uuid,
    day_number integer,
    order_index integer,
    custom_notes text
  );

  RETURN updated_itinerary;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_itinerary_with_stops(uuid, uuid, text, text, jsonb) TO authenticated;
