Add filtering and search to two pages:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. src/app/explore/page.tsx (or wherever the curated itineraries grid renders)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add a client-side filter/search bar above the itineraries grid.
All filtering is client-side against the already-fetched data — no new
API calls.

Controls (horizontal row, same width as the grid, mb-8):

A) Search input

- Placeholder: "Search destinations..."
- Filters on itinerary title and description (case-insensitive)
- Icon: magnifying glass inside the input, left side

B) City/Region filter — dropdown or pill group

- Options derived dynamically from itinerary data: read a `region`
  or `city` field if it exists, else parse from title.
- If no region field exists on the itineraries table, add a
  `region text` column via migration:
  supabase/migrations/014_itinerary_region.sql:
  ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS region text;
  Then seed values: 'Marrakech', 'Fès', 'Chefchaouen', 'Sahara',
  'Casablanca', 'Rabat', 'Coastal' — update existing rows to match.
- Render as horizontal pill buttons: "All" (default) + one per
  unique region. Active pill: bg-primary text-white. Inactive:
  border border-border text-muted-foreground hover:border-primary.

C) Duration filter — dropdown

- Options: "Any duration", "1 day", "2–3 days", "4–5 days", "6+ days"
- Filter against itinerary `duration_days` field (add column if
  missing: ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS
  duration_days int;)

D) Sort — dropdown

- Options: "Default", "Best reviewed" (avg rating desc),
  "Shortest first", "Longest first", "Newest"
- For "Best reviewed": fetch average ratings from the reviews table
  grouped by itinerary_id and join client-side. Add a
  GET /api/itineraries/ratings route that returns
  { itinerary_id: string, average: number }[] — query:
  SELECT itinerary_id, AVG(rating) as average
  FROM reviews
  WHERE target_type = 'itinerary'
  GROUP BY itinerary_id

Show a "X itineraries found" count in 11px muted text below the controls.
If filters return 0 results: show an empty state — "No itineraries match
your filters" + a "Clear filters" link.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2. src/app/dashboard/page.tsx — My Custom Itineraries section
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Above the custom itineraries list, add:

A) Search input — filters on itinerary title, client-side.

B) Sort dropdown

- Options: "Newest first" (default, by created_at desc),
  "Oldest first", "A → Z", "Z → A"

C) Visibility filter — pill toggle

- "All" / "Private" / "Public"
- Filters on is_public field.

All client-side. No new API calls — filter against the already-fetched
user itineraries array.

Show "X itineraries" count in muted text next to the section heading.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STYLING RULES FOR ALL CONTROLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Search input: bg-card border border-border rounded-xl px-4 py-2.5
  text-sm w-full max-w-xs focus:border-primary/50 outline-none
- Dropdowns: same base style as search input, appearance-none,
  pr-8 for chevron space, cursor-pointer
- All controls in a flex-wrap gap-3 row
- On mobile: stack vertically, full width
