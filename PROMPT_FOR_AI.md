# Atlas 360 — AI Agent Prompt
**Read `CLAUDE.md` and `guidelines.md` first before doing anything.**  
**Read `WORKFLOW.md` for full context on every task.**  
**Work on one section at a time. After each section, stop and confirm before proceeding.**

---

## Before You Start

Run these two SQL migrations in Supabase Dashboard → SQL Editor **before writing any code**:

```sql
-- Migration 012: Rich stop content
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS rich_description text,
  ADD COLUMN IF NOT EXISTS photo_urls       text[] DEFAULT '{}';

-- Migration 013: Forked itinerary tracking
ALTER TABLE public.user_itineraries
  ADD COLUMN IF NOT EXISTS forked_from uuid REFERENCES public.itineraries(id) ON DELETE SET NULL;
```

Save both as files in `supabase/migrations/012_stop_rich_content.sql` and `supabase/migrations/013_forked_itinerary.sql`.

**If you cannot run migrations yourself, stop and tell the user:** "Please run migrations 012 and 013 in your Supabase SQL editor before I continue."

---

## Section 1 — Stop Detail Popup: Richer Content & Photos

**File:** `src/components/StopPopupModal.tsx`

Rewrite the content area of `StopPopupModal` so it renders this structure inside both the `Dialog` (desktop) and `Sheet` (mobile) variants. Do not change the outer Dialog/Sheet wrapper logic.

### New content layout (replace the existing `const content` block):

```
1. Hero image — full width, 220px tall (160px on mobile), object-cover, rounded-xl.
   - Use location.image_url if truthy.
   - If no image: render a decorative SVG placeholder with Morocco-themed geometric pattern
     (a simple zellige-style grid in primary/muted colors, labeled with the location name).

2. Stop header row:
   - Left: category badge (use CategoryBadge component, see below) + "Day X · Stop Y of Z" label in muted text
   - Right: if rating is loaded and not null, show "★ 4.3" pill in primary color

3. Description block:
   - If location.rich_description exists: render it as formatted paragraphs (split on \n\n)
     in 14px muted-foreground text, line-height 1.75. Max height 180px with overflow-y auto
     and a fade-out gradient at bottom if content overflows.
   - Else: render location.description in full (no line-clamp).
   - If neither: render nothing (no placeholder text).

4. Info chips row (horizontal, flex-wrap, gap-2):
   - Best time chip: clock icon + location.best_time (only if truthy)
   - Duration chip: timer icon + formatted duration (use existing formatDuration helper)
   - Category chip: tag icon + location.category (only if truthy)
   All chips: text-[11px] uppercase tracking-wider, bg-muted/40, border border-border,
   px-2.5 py-1 rounded-md, text-muted-foreground.

5. Transport to next stop — keep existing design exactly as-is.

6. Insider tip — keep existing tips callout (Info icon + italic text) exactly as-is.

7. Photo gallery strip (only render if location.photo_urls?.length > 0):
   - Label: "Photos" in 10px uppercase tracking-wider muted text
   - Horizontal scroll container (overflow-x auto, flex, gap-2, pb-2, no-scrollbar)
   - Each photo: 80px wide × 60px tall, rounded-lg, object-cover, cursor-pointer
   - On photo click: open a simple lightbox (use the existing Dialog component —
     nest a second Dialog inside for the lightbox, showing the image at max 90vw × 80vh)
   - If photo_urls is empty or undefined, render nothing (no placeholder).

8. Inline review micro-widget — NEW compact component (see below).

9. CTA row — keep existing "Open 360° View" and "Find Nearby Places" buttons exactly as-is.
```

### New component: `CategoryBadge`
Add this small component inside `StopPopupModal.tsx` (not exported):
```tsx
function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return null
  const labels: Record<string, string> = {
    landmark: 'Landmark', market: 'Market', museum: 'Museum',
    nature: 'Nature', food: 'Food & Drink', viewpoint: 'Viewpoint',
    religious: 'Religious site',
  }
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20
                     text-[10px] font-semibold uppercase tracking-widest text-primary">
      {labels[category.toLowerCase()] ?? category}
    </span>
  )
}
```

### New component: `InlineReviewWidget`
Add this inside `StopPopupModal.tsx` (not exported). It receives `locationId: string`.

Behavior:
- On mount, fetch `GET /api/reviews?target_type=location&location_id={locationId}`
- Show: average rating as `★ X.X · N reviews` (or "No reviews yet" if count is 0)
- Show the 2 most recent reviews as minimal cards:
  - Each card: star row (read-only, size sm) + 1-line truncated body text + date, all in ~13px
  - Card: no border, just a light bg-muted/30 rounded-lg p-2
- Below the reviews: a single-line `input` (not textarea) for quick review text,
  with a star rating picker (5 clickable stars, horizontal) to its left.
  - On focus: input expands to a 3-line textarea (use onFocus to switch component state)
  - When text.length >= 3: show a small "Publish" button inline
  - On submit: POST to `/api/reviews` with `{ target_type: 'location', location_id, rating, body }`
  - On success: refetch and refresh the widget
- If user is not logged in: show "Log in to leave a review" link instead of the input
- Check login state via `createClient().auth.getUser()` in a useEffect
- Total design: compact, no section title, blends into the popup naturally

---

## Section 2 — Review System: Compact Inline + Better Full Panel

### Part A — `src/components/reviews/ReviewPanel.tsx`

Improve the **full variant** (used below the stop list on the itinerary page) as follows:

1. **Review cards**: Replace the `UserCircle` icon with an initials avatar circle.
   - Generate initials from `review.user_id` — take the first 2 hex characters of the UUID and use them as display text. Color: cycle through 4 options based on `parseInt(review.user_id[0], 16) % 4` → primary / amber / teal / muted.
   - Avatar: 32px circle, bg based on color above, initials in 12px white bold.

2. **Show 3 reviews by default** — add a `const [showAll, setShowAll] = useState(false)` state.
   - If `response.reviews.length > 3` and `!showAll`, slice to first 3 and render a
     `"Show all {response.reviews.length} reviews"` text button below.
   - On click: `setShowAll(true)`.

3. **Photo feedback notice** — change from a card to a small icon tooltip.
   - Replace the `ImageIcon` card with: `<span title="Photo reviews are coming soon" className="text-[11px] text-muted-foreground/50 flex items-center gap-1"><ImageIcon size={12}/> Photo reviews coming soon</span>`.

4. **Input form cleanup**:
   - Move the star picker to be the first thing in the form, above the textarea.
   - Label above stars: "Your rating" in 10px uppercase muted text.
   - Textarea placeholder: "What stood out? What should future travelers know?"
   - Button row: delete button (if own review) on left, Publish/Update on right.
   - Keep all existing submit/delete logic exactly as-is.

### Part B — `src/components/StopPopupModal.tsx`

Remove the full `ReviewPanel` import and usage from `StopPopupModal`. Replace with `InlineReviewWidget` built in Section 1. The full `ReviewPanel` stays only on the itinerary page (`src/app/itinerary/[id]/page.tsx`).

---

## Section 3 — Home Page Cleanup + Help Page

### Part A — `src/app/page.tsx`

Remove `import PlanningSupportSection` and `<PlanningSupportSection />` from the render.

Add a new import:
```tsx
import HelpCtaStrip from '@/components/landing/HelpCtaStrip'
```

Add `<HelpCtaStrip />` as the **last section** before the closing `</div>`.

### Part B — Create `src/components/landing/HelpCtaStrip.tsx`

```tsx
import Link from 'next/link'

export default function HelpCtaStrip() {
  return (
    <section className="border-t border-border bg-card/40 py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12 flex flex-col sm:flex-row
                      items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary mb-2">
            Planning support
          </p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl
                         font-semibold text-foreground tracking-tight">
            Need help planning your Morocco trip?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">
            Our team helps with route timing, bookings, logistics, and local experiences.
          </p>
        </div>
        <Link
          href="/help"
          className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4
                     bg-primary text-primary-foreground text-[12px] font-semibold
                     uppercase tracking-widest shadow-lg shadow-primary/20
                     hover:bg-primary/90 transition-colors"
        >
          Get planning help →
        </Link>
      </div>
    </section>
  )
}
```

### Part C — Create `src/app/help/page.tsx`

Build a clean Help page with:
- Page title: "Planning Support | Atlas 360"
- Left column (prose): explain what Atlas 360 helps with — route timing, hotel and restaurant booking guidance, local logistics, and special trip requests. Include the 3 benefit chips (Route timing, Booking guidance, Local logistics) as small cards.
- Right column: render `<AssistanceRequestForm>` twice — one for `requestType="planning"` and one for `requestType="booking_help"`, separated by a divider, or use a tab toggle between them.
- Style: match the existing page styles (atlas-grain background, Cormorant headings, same padding/spacing as dashboard or pricing pages).
- Export metadata: `export const metadata: Metadata = { title: 'Planning Support | Atlas 360' }`

### Part D — `src/components/Navbar.tsx`

In the `NAV_LINKS` array, add:
```tsx
{ name: 'HELP', href: '/help' },
```
Place it between `DESTINATIONS` and `ABOUT`.

---

## Section 4 — Hero Background Image

**File:** `src/components/landing/HeroSection.tsx`

**Wait:** Only do this after the user confirms they have placed the Sahara image at `public/Images/sahara-hero.jpg`.

Tell the user: "Please add your Sahara image to `public/Images/sahara-hero.jpg` before I make this change."

Once confirmed, make **one change** in `HeroSection.tsx`:

```tsx
// Find this line:
backgroundImage: 'url("/Images/sunset backfground.png")',
// Replace with:
backgroundImage: 'url("/Images/sahara-hero.jpg")',
```

Also adjust the gradient overlay to ensure text readability — Sahara images are often bright in the middle. Change the gradient overlay div to:
```tsx
<div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
```
(Increases the top opacity slightly from 'to-transparent' to 'to-background/20' to ensure navbar area is readable.)

---

## Section 5 — Elite: Fork & Edit Pre-Built Itineraries

**Do this section last.** It has the most moving parts. Work file by file.

### Step 5.1 — New API route: `src/app/api/user-itineraries/fork/route.ts`

```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check Elite tier
  const { data: profile } = await supabase
    .from('profiles').select('tier').eq('id', user.id).single()
  if (profile?.tier !== 'elite') {
    return NextResponse.json({ error: 'Elite tier required' }, { status: 403 })
  }

  const { source_itinerary_id, title } = await request.json() as {
    source_itinerary_id: string
    title: string
  }

  // Fetch source locations
  const { data: locations, error: locErr } = await supabase
    .from('locations')
    .select('*')
    .eq('itinerary_id', source_itinerary_id)
    .order('day_number').order('order_index')

  if (locErr || !locations) {
    return NextResponse.json({ error: 'Could not fetch source itinerary' }, { status: 500 })
  }

  // Create new user itinerary
  const { data: newItinerary, error: itinErr } = await supabase
    .from('user_itineraries')
    .insert({
      user_id: user.id,
      title: `${title} (my version)`,
      is_public: false,
      forked_from: source_itinerary_id,
    })
    .select('id')
    .single()

  if (itinErr || !newItinerary) {
    return NextResponse.json({ error: 'Could not create itinerary' }, { status: 500 })
  }

  // Insert stops
  const stops = locations.map((loc) => ({
    itinerary_id: newItinerary.id,
    location_id: loc.id,
    day_number: loc.day_number ?? 1,
    order_index: loc.order_index,
    custom_notes: null,
  }))

  const { error: stopsErr } = await supabase
    .from('user_itinerary_stops')
    .insert(stops)

  if (stopsErr) {
    return NextResponse.json({ error: 'Could not copy stops' }, { status: 500 })
  }

  return NextResponse.json({ id: newItinerary.id })
}
```

### Step 5.2 — New component: `src/app/itinerary/[id]/ForkItineraryButton.tsx`

Create a client component with:
- `'use client'`
- Props: `{ itineraryId: string, itineraryTitle: string }`
- State: `isForking: boolean`
- On click: POST to `/api/user-itineraries/fork` with `{ source_itinerary_id: itineraryId, title: itineraryTitle }`
- On success: `router.push('/compose?from=' + data.id)`
- On error: show error in a toast or inline text
- Button style: matches Elite amber theme — `border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-[11px] uppercase tracking-widest px-4 py-2 rounded-full transition-colors`
- Button label: "Customise this itinerary →" (loading: "Forking...")

### Step 5.3 — `src/app/itinerary/[id]/page.tsx`

In the header area of the curated itinerary view (where the "Magazine" and "Open Composer" links are), add:

```tsx
import ForkItineraryButton from './ForkItineraryButton'

// Add to the header div, next to the Magazine link:
{viewerTier === 'elite' && !customItinerary && (
  <ForkItineraryButton
    itineraryId={id}
    itineraryTitle={title}
  />
)}
```

### Step 5.4 — `src/app/compose/ComposerClient.tsx`

At the top of the component, read the `?from` query param:

```tsx
import { useSearchParams } from 'next/navigation'

// Inside the component:
const searchParams = useSearchParams()
const fromId = searchParams.get('from')
```

Add a `useEffect` that runs when `fromId` is present:
- Fetch `GET /api/user-itineraries/{fromId}` (or use the existing fetch pattern in the composer)
- Extract the stops from the response
- Pre-populate the `days` state with those stops grouped by `day_number`
- Set the itinerary title from the fetched title

**Hint:** Look at how the existing save flow works in `ComposerClient.tsx` to understand the `days` state shape, and mirror that structure when pre-populating.

---

## Section 6 — Enrich Stop Descriptions (Seed Data)

**File:** `supabase/seed.sql` (update) or create a new `supabase/seed_rich.sql`

Generate and insert `UPDATE` statements for all 15 stops across the 3 itineraries. For each stop, write:
- `description`: 1–2 sentence factual summary (what it is, why it matters)
- `rich_description`: 2–3 paragraph editorial text in Atlas 360's voice — warm, knowledgeable, sensory, not generic. Mention sights, sounds, smells, historical context, practical visitor experience.
- `best_time`: if not already set (e.g., "Early morning", "Sunset", "Midday")
- `tips`: if not already set — practical insider tip (1–2 sentences)
- `photo_urls`: for now use 2 Wikimedia Commons URLs per stop (reliable, no licensing issues). Use the format: `ARRAY['https://upload.wikimedia.org/...', 'https://upload.wikimedia.org/...']`

**Use only the stops that exist in the seed data:**

Itinerary 1 — Marrakech Medina Walk:
1. Jemaa el-Fna Square
2. Bahia Palace
3. Koutoubia Mosque
4. Souks of Marrakech
5. Saadian Tombs

Itinerary 2 — Fes el-Bali Heritage:
1. Bab Bou Jeloud
2. Chouara Tanneries
3. Al-Qarawiyyin Mosque
4. Nejjarine Fountain
5. Bou Inania Madrasa

Itinerary 3 — Chefchaouen Blue City:
1. Place Uta el-Hammam
2. Kasbah Museum
3. Blue Painted Streets
4. Ras el-Ma Waterfall
5. Spanish Mosque Viewpoint

**Output format — for each stop:**
```sql
UPDATE locations SET
  rich_description = '...',
  best_time = '...',
  tips = '...',
  photo_urls = ARRAY['url1', 'url2']
WHERE name = '...' AND itinerary_id = (
  SELECT id FROM itineraries WHERE title = '...'
);
```

**Voice guidance:**
- Write like a knowledgeable friend who has been to Morocco multiple times
- Avoid clichés like "hidden gem" or "off the beaten path"
- Include sensory details (the smell of tannery leather, the echo of the call to prayer, the cool shade of a souk alley)
- Keep `rich_description` to 2–3 short paragraphs separated by `\n\n`
- `description` should be factual and concise (for sidebar/popup preview)

---

## General Rules for All Sections

1. **TypeScript only.** No `any`. Add proper types for every new function, prop, and API response.
2. **No inline styles** except where Tailwind cannot handle dynamic values (e.g., `transform: translateY(${scrollY}px)`).
3. **App Router only.** All new pages go in `src/app/`. Use Server Components by default; add `'use client'` only when you need hooks or event handlers.
4. **After each section:** run `npm run build` mentally and check for TypeScript errors before moving to the next section.
5. **Tell the user** if you need any external asset (image file, API key, SQL to run manually) before proceeding. Do not guess or skip.
6. **Do not remove existing working components** while adding new ones. Extend, don't replace, unless explicitly told to rewrite.
