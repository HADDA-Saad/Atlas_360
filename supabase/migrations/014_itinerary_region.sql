ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS duration_days int;

-- Seed some values
UPDATE public.itineraries SET region = 'Marrakech', duration_days = 3 WHERE title ILIKE '%marrakech%';
UPDATE public.itineraries SET region = 'Fès', duration_days = 2 WHERE title ILIKE '%fes%' OR title ILIKE '%fès%';
UPDATE public.itineraries SET region = 'Chefchaouen', duration_days = 2 WHERE title ILIKE '%chefchaouen%';
UPDATE public.itineraries SET region = 'Sahara', duration_days = 4 WHERE title ILIKE '%sahara%' OR title ILIKE '%merzouga%';
UPDATE public.itineraries SET region = 'Casablanca', duration_days = 1 WHERE title ILIKE '%casablanca%';
UPDATE public.itineraries SET region = 'Rabat', duration_days = 1 WHERE title ILIKE '%rabat%';
UPDATE public.itineraries SET region = 'Coastal', duration_days = 5 WHERE title ILIKE '%coast%' OR title ILIKE '%essaouira%';
