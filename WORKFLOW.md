# Atlas 360 — Product Improvement Workflow
**Version:** 1.0 · May 2026  
**Stack:** Next.js 16 · Supabase · Stripe · Google Maps API  
**Status legend:** 🔴 Not started · 🟡 In progress · ✅ Done

---

## Overview of Tasks

| # | Task | Effort | Priority |
|---|------|--------|----------|
| 1 | Stop detail popup — richer content + photo | Medium | 🔴 Critical |
| 2 | Review system — compact inline input, expand list | Medium | 🔴 Critical |
| 3 | Home page — remove inline planning form, add Help CTA | Low | 🔴 Critical |
| 4 | Hero background — replace sunset/sea with Sahara image | Low | 🔴 Critical |
| 5 | Elite: edit pre-built itinerary stops | High | 🔴 High |
| 6 | Stop description — enrich DB fields + seed data | Medium | 🔴 High |

---

## Task 1 — Stop Detail Popup: Richer Content & Photos

**Files to change:**
- `src/components/StopPopupModal.tsx` — main component to redesign
- `src/types/index.ts` — add `rich_description`, `photo_urls` fields if needed
- `supabase/migrations/` — migration to add `photo_urls text[]` column to `locations`

**What to build:**
The current `StopPopupModal` shows a small description, a tiny image, basic chips (best time, duration), a tips callout, and transport info. Reviews take up too much space via `ReviewPanel`. Replace this with a proper editorial stop card:

### New layout (top to bottom):
1. **Full-width hero image** — location.image_url if available, fallback to Moroccan pattern SVG. Height: 220px on desktop, 180px mobile.
2. **Stop header** — Name (Cormorant Garamond 28px), category badge, Day X · Stop Y label.
3. **Rich description block** — Use `location.description` but display it fully (no line-clamp). Add a new DB field `rich_description text` for longer editorial text (2–3 paragraphs). If `rich_description` is present, show it; else fall back to `description`.
4. **Info chips row** — Best time, Duration, Category — horizontal chips, compact.
5. **Transport to next stop** — Keep existing design, compact.
6. **Insider tip** — Keep existing tips callout.
7. **Photo gallery strip** — New: if `photo_urls text[]` has entries, render a horizontal scroll strip of thumbnails (80×60px). Clicking a thumbnail opens it fullscreen. If no photos yet, show a "Photos coming soon" placeholder.
8. **Inline review micro-widget** — See Task 2 for spec. Just the star average + count + one-line input. NOT the full ReviewPanel.
9. **CTA row** — "Open 360° View" + "Nearby Places" buttons. Keep existing.

**External requirement:**  
> ⚠️ You need to add `rich_description text` and `photo_urls text[]` columns to the `locations` table. Run migration 012 (see below). Then seed the first 3 itineraries with proper editorial content via Supabase SQL editor or a seed script.

**Migration to create:**
```sql
-- supabase/migrations/012_stop_rich_content.sql
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS rich_description text,
  ADD COLUMN IF NOT EXISTS photo_urls       text[] DEFAULT '{}';
```

**Prompt for AI agent:** See `PROMPT_FOR_AI.md` → Section 1.

---

## Task 2 — Review System: Compact Inline Input, Expandable List

**Files to change:**
- `src/components/reviews/ReviewPanel.tsx` — full redesign
- `src/components/StopPopupModal.tsx` — embed the new compact variant
- `src/app/itinerary/[id]/page.tsx` — keep full ReviewPanel below the stops list

**What to build:**

### Compact variant (used inside StopPopupModal and sidebar cards):
- Shows: star average + review count as a single line: `★ 4.3 · 12 reviews`
- Below that: show the **2 most recent reviews** as tiny cards (avatar initial, stars, 1-line truncated text, date).
- Add a single `textarea` row (1 line height, expands on focus) for new review input — star picker inline, "Publish" button appears only when text is entered.
- No headers, no "Traveler feedback" label, no description paragraph.
- Total height target: ~180px when collapsed, ~280px when writing.

### Full variant (used below stop list on itinerary page):
- Keep the existing full layout but improve the review cards: add avatar initials circle (first letter of email hash), show full body text, date on right.
- Limit visible reviews to 3 by default, with a "Show all X reviews" expand toggle.
- Move the "Photo feedback is planned" notice to a small icon tooltip, not a card.
- Input form: clean, 2-line textarea, stars prominent above it, Publish/Update button right-aligned.

**No external requirements.** Purely frontend + existing API.

**Prompt for AI agent:** See `PROMPT_FOR_AI.md` → Section 2.

---

## Task 3 — Home Page: Remove Inline Planning Form, Add Help CTA

**Files to change:**
- `src/app/page.tsx` — remove `<PlanningSupportSection />`
- `src/components/landing/PlanningSupportSection.tsx` — keep file, just un-mount from home
- `src/components/Navbar.tsx` — add "Help" nav link
- `src/app/help/page.tsx` — create new Help page (or `/about` redirect)

**What to build:**

### Home page (`page.tsx`):
Remove `<PlanningSupportSection />` from the landing page render. The full planning request form is already reachable from the itinerary sidebar and stop popup. Duplicating it on the home page adds noise.

Replace the bottom of the home page with a clean **"Need help planning your trip?"** CTA strip:
```
[ Light strip | "Need help planning your Morocco trip?" | "Get planning help →" button ]
```
This button links to `/help` (new page) where the full `AssistanceRequestForm` lives, presented properly.

### Navbar:
Add `{ name: 'HELP', href: '/help' }` to `NAV_LINKS` in `Navbar.tsx`. Place it between DESTINATIONS and ABOUT.

### New Help page (`src/app/help/page.tsx`):
- Title: "Planning Support"
- Two columns: left = explanation of what Atlas 360 helps with, right = `AssistanceRequestForm` for both `planning` and `booking_help` (tabbed or two sections).
- Include the 3 benefit chips from the current PlanningSupportSection (Route timing, Booking guidance, Local logistics).

**No external requirements.**

**Prompt for AI agent:** See `PROMPT_FOR_AI.md` → Section 3.

---

## Task 4 — Hero Background: Replace with Moroccan Sahara Image

**Files to change:**
- `src/components/landing/HeroSection.tsx` — change `backgroundImage` URL
- `public/Images/` — add new Sahara image

**What to build:**

The current hero uses `/Images/sunset backfground.png` (a sea/sunset image). Replace with a Moroccan Sahara scene: sand dunes, camels, warm golden light — matching the existing warm Moroccan night design theme.

**External requirement:**  
> ⚠️ You need to source and add a Sahara image. Options:
> 1. **Free option:** Download from Unsplash (`unsplash.com/s/photos/morocco-sahara-camels`) — search "Morocco Sahara dunes camels sunset". Choose one ~2000px wide, warm tone. Save as `public/Images/sahara-hero.jpg`.
> 2. **Paid option:** License from Getty or Shutterstock for commercial use if you plan to monetise.
> 3. **AI option:** Generate via Midjourney or DALL-E 3: *"Aerial view of Moroccan Sahara desert at golden hour, sand dunes, silhouette of camel caravan, warm amber light, cinematic, editorial travel photography style"*. Save as `public/Images/sahara-hero.jpg`.

Once the image is in `public/Images/sahara-hero.jpg`, the AI agent changes one line in HeroSection.tsx:
```tsx
// Change:
backgroundImage: 'url("/Images/sunset backfground.png")',
// To:
backgroundImage: 'url("/Images/sahara-hero.jpg")',
```

Also adjust the gradient overlay if needed — the Sahara image is likely brighter at the top, so ensure the text remains readable.

**Prompt for AI agent:** See `PROMPT_FOR_AI.md` → Section 4.

---

## Task 5 — Elite: Edit Pre-Built Itinerary Stops

**Files to change:**
- `src/app/itinerary/[id]/page.tsx` — add "Edit stops" button for Elite users on curated itineraries
- `src/app/compose/ComposerClient.tsx` — extend to support pre-seeding with existing stops
- `src/app/api/itineraries/[id]/locations/route.ts` — already exists, verify it returns all location fields
- `src/app/api/user-itineraries/route.ts` — already handles creating user itineraries; extend for "fork from curated"
- `supabase/migrations/013_forked_itinerary.sql` — add `forked_from uuid` column to `user_itineraries`

**What to build:**

Elite users should be able to click "Customise this itinerary" on any curated itinerary, which:

1. **Forks the itinerary** — creates a new `user_itinerary` record with all the same stops copied into `user_itinerary_stops`, linked by `location_id`. Adds a `forked_from uuid REFERENCES itineraries(id)` column to `user_itineraries` for provenance tracking.

2. **Redirects to the Composer** — `/compose?from=<new_user_itinerary_id>` — where the user sees all the pre-loaded stops (their copies) and can drag, remove, or add new stops from the stops pool.

3. **Save & view** — Standard save flow already works. The forked itinerary appears in their dashboard as a custom itinerary.

### UI changes:

**Itinerary page** (`src/app/itinerary/[id]/page.tsx`):  
For Elite users viewing a curated (not user-created) itinerary, show a button in the header area:
```tsx
{viewerTier === 'elite' && !customItinerary && (
  <ForkItineraryButton itineraryId={id} itineraryTitle={title} stops={stops} />
)}
```

**New component** `src/app/itinerary/[id]/ForkItineraryButton.tsx` (client component):
- Button: "Customise this itinerary →" (amber/gold color, matches Elite tier)
- On click: POST to `/api/user-itineraries/fork` with `{ source_itinerary_id, stops[] }`
- On success: redirect to `/compose?from=<new_id>`

**New API route** `src/app/api/user-itineraries/fork/route.ts`:
- Accepts `{ source_itinerary_id: string, title: string }`
- Fetches all locations for the source itinerary
- Creates a new `user_itinerary` with `forked_from = source_itinerary_id`
- Inserts all stops as `user_itinerary_stops` with matching `location_id`, `day_number`, `order_index`
- Returns `{ id: string }` of the new user itinerary

**Composer** (`ComposerClient.tsx`):
- Read a `?from=<id>` query param on mount
- If present, fetch the `user_itinerary` and pre-populate the day lanes with those stops
- The user then edits as normal

**Migration:**
```sql
-- supabase/migrations/013_forked_itinerary.sql
ALTER TABLE public.user_itineraries
  ADD COLUMN IF NOT EXISTS forked_from uuid REFERENCES public.itineraries(id) ON DELETE SET NULL;
```

**RLS:** No changes needed — `user_itineraries` already has `user_id = auth.uid()` policies.

**External requirement:**  
> ⚠️ No external services required. This is purely a backend + frontend feature. After building, you should test with an Elite account by visiting a curated itinerary and clicking "Customise this itinerary."

**Prompt for AI agent:** See `PROMPT_FOR_AI.md` → Section 5.

---

## Task 6 — Stop Description: Enrich DB Fields + Seed Data

**Files to change:**
- `supabase/seed.sql` — update with richer `description` and `rich_description` for each stop
- `supabase/migrations/012_stop_rich_content.sql` — (from Task 1)

**What to build:**

The current seed data has very minimal stop descriptions. Each stop needs:
- `description` (1–2 sentences, shown in sidebar/popup header)
- `rich_description` (2–3 paragraphs with cultural context, what to see, visitor tips)
- `photo_urls` (for now, use 2–3 reliable Wikimedia Commons image URLs per stop as placeholders)
- `best_time` — already partially seeded, verify all stops have it
- `tips` — verify all stops have practical tips

**External requirement:**  
> ⚠️ The AI agent will generate editorial content for all 15 stops (3 itineraries × 5 stops). Review the generated text before pushing to production — it should match Atlas 360's luxury editorial voice. Fact-check any specific claims (opening hours, entry fees) against current sources.

**Prompt for AI agent:** See `PROMPT_FOR_AI.md` → Section 6.

---

## Implementation Order

```
Week 1:
  Task 4 (Hero image)          — 30 min, you add image file then AI edits 1 line
  Task 3 (Home page cleanup)   — 2–3 hours
  Task 1 (Stop popup redesign) — after running migration 012
  Task 2 (Review redesign)     — can run in parallel with Task 1

Week 2:
  Task 6 (Seed data enrichment) — prerequisite for Task 1 to look good
  Task 5 (Elite fork feature)   — biggest task, 1–2 days
```

---

## Migrations Checklist

| Migration file | Task | Run before |
|---|---|---|
| `012_stop_rich_content.sql` | Adds `rich_description`, `photo_urls` | Task 1 and Task 6 |
| `013_forked_itinerary.sql` | Adds `forked_from` to user_itineraries | Task 5 |

Run both in **Supabase Dashboard → SQL Editor** before the AI agent starts coding.

---

## Testing Checklist

After all tasks are complete, test these flows:

- [ ] **Explorer** visits a curated itinerary → clicks a stop pin → popup shows image, full description, photo strip placeholder, inline micro-review
- [ ] **Explorer** tries to click "Customise this itinerary" → button is not visible (correct)
- [ ] **Nomad** can see reviews but "Customise" button not visible
- [ ] **Elite** sees "Customise this itinerary" button → clicks → forked itinerary created → redirected to Composer with pre-loaded stops → can remove/add stops → save → appears in dashboard
- [ ] **Home page** — no planning form visible → "Get planning help →" link → Help page with form
- [ ] **Navbar** — "HELP" link visible → routes to /help page correctly
- [ ] **Hero** — Sahara image loads, text is readable, parallax works
- [ ] **Review compact widget** — inside stop popup: shows rating, 2 reviews, one-line input
- [ ] **Review full panel** — below stop list: shows up to 3 reviews, expand toggle, clean form
