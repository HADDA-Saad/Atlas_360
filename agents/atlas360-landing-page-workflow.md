# Atlas 360 — Landing Page Build Workflow

## HOW TO USE THIS DOCUMENT

1. **Run each numbered prompt in order**, one at a time. Do not combine steps.
2. **Each prompt follows the Three-Section Pattern**: Task / Background / Do Not.
3. After each step, **verify the output works** before moving to the next prompt.
4. If Claude Code breaks something, paste the **"Do Not" section** from the relevant prompt again as a correction prompt.

---

## STEP 1 — Move Map Application to New Route

**Paste this prompt into Claude Code:**

```
## TASK
Move the existing map-based application from the root route (`/`) to a new route (`/explore`) so we can make room for the new landing page.

## BACKGROUND
The current `src/app/page.tsx` contains the map and itinerary viewer. We are building a new landing page at the root.
1. Create a new directory: `src/app/explore`
2. Move `src/app/page.tsx` to `src/app/explore/page.tsx`
3. Update any relative imports in the moved file if necessary.
4. Ensure that navigating to `/explore` in the browser correctly loads the map application.

## DO NOT
- Do not modify the logic of the map or sidebar components
- Do not delete any existing features
- Do not create the new landing page yet
```

---

## STEP 2 — Navigation and Footer Components

**Paste this prompt into Claude Code:**

```
## TASK
Update the Navbar and create a new Footer component based on the landing page design.

## BACKGROUND
The landing page has a specific header and footer design. 
1. Update `src/components/Navbar.tsx`:
   - Logo "Atlas 360" on the left in primary terracotta color (`text-atlas-primary`).
   - Center navigation links: "ITINERARIES", "DESTINATIONS", "ABOUT", "JOURNAL" (styled with uppercase, small text, wide letter spacing, text-white/80 hover:text-white).
   - Right side: User icon/login button.
   - Background: Transparent with a subtle dark gradient at the top, or solid dark when scrolled.
   - Position: Fixed or absolute at the top so it sits over the hero image.
2. Create `src/components/Footer.tsx`:
   - Dark background (`bg-[#151515]`).
   - Logo (terracotta) and copyright text on the left ("© 2026 Atlas 360. Crafted with heritage and precision.").
   - Links on the right: "Terms of Service", "Privacy Policy", "Contact Support", "Cultural Ethics", "Our Story".
   - A scroll-to-top button (arrow pointing up in a dark circular button with terracotta border) centered above the footer content.
3. Add `<Footer />` to `src/app/layout.tsx` so it appears on the landing page (conditionally hide it on the map `/explore` page using `usePathname` so it doesn't break the map layout).

## DO NOT
- Do not break the existing authentication logic in the Navbar
- Do not change global CSS variables yet
```

---

## STEP 3 — Hero Section Component

**Paste this prompt into Claude Code:**

```
## TASK
Create the Hero section for the new landing page.

## BACKGROUND
Create `src/components/landing/HeroSection.tsx`.
Design requirements:
- Full viewport height (`min-h-screen`).
- Background: A large hero image of a desert sunset (use a placeholder from Unsplash). Add a dark overlay gradient so text is readable.
- Content (bottom-left aligned, inside a container, with padding at the bottom):
  - Headline: "Unveil the Soul of Morocco" (large serif or elegant sans-serif, white, bold).
  - Subtitle: "Curated itineraries for the modern explorer." (medium size, sand/gray text, serif/elegant font).
  - Button: "Explore Itineraries" with a terracotta background (`bg-atlas-primary` hover:bg-orange-700), text-black or white, linking to `/explore`.
  - Add smooth fade-in animations if possible.

## DO NOT
- Do not put this component in `page.tsx` yet
- Do not use fixed pixel heights; use responsive utilities (`min-h-screen`, `w-full`, etc.)
```

---

## STEP 4 — Heritage Section Component

**Paste this prompt into Claude Code:**

```
## TASK
Create the Heritage section for the landing page highlighting the brand's story and aesthetic.

## BACKGROUND
Create `src/components/landing/HeritageSection.tsx`.
Design requirements:
- Background: Dark (`bg-[#1A1A1A]` or `bg-atlas-dark`).
- Two-column layout on desktop:
  - Left column:
    - Small terracotta label: "OUR HERITAGE" (uppercase, tracking-widest, text-xs).
    - Heading: "Tradition meets contemporary luxury." (white, elegant typography, large).
    - Paragraph text: Brand story explaining the "untamed beauty of the Maghreb" and "bridging the gap between the ancient soul of Morocco and the needs of the modern traveler. Every itinerary is a hand-crafted narrative, designed to lead you through secret medinas, towering peaks, and the infinite stillness of the Sahara."
    - Signature: "— The Atlas 360 Founders" (italic, terracotta accent line).
  - Right column:
    - A 2x2 masonry-style grid of 4 images (geometric pattern, spices, courtyard, rug).
    - Use placeholder images (from Unsplash) with subtle rounded corners and varying aspect ratios for visual interest. The images should have subtle hover effects.

## DO NOT
- Do not forget responsive design: stack the columns vertically on mobile screens.
```

---

## STEP 5 — Curated Journeys Section Component

**Paste this prompt into Claude Code:**

```
## TASK
Create the Selected Experiences section showcasing featured itineraries.

## BACKGROUND
Create `src/components/landing/CuratedJourneysSection.tsx`.
Design requirements:
- Background: Slightly lighter dark shade (e.g., `bg-[#222222]`).
- Container padding: py-24.
- Header:
  - Left: Small label "SELECTED EXPERIENCES" (terracotta) and large heading "Curated Journeys" (white).
  - Right: Link "View All Experiences ->" (white, hover:text-terracotta) linking to `/explore`.
  - Arrange header to be flex-row on desktop, flex-col on mobile.
- Grid of 3 itinerary cards (`grid-cols-1 md:grid-cols-3 gap-6`):
  - Use data for: 
    1. "The Red City & Beyond" (7 DAYS, Marrakech)
    2. "Sands of the Sahara" (12 DAYS, Ouarzazate)
    3. "Coastal Whispers" (5 DAYS, Essaouira)
  - Each card needs:
    - A hero image for the destination (Unsplash placeholders).
    - A badge in the top right corner over the image showing duration (e.g., "7 DAYS") with a dark semi-transparent background and gold/terracotta text.
    - Card body with dark background (`bg-[#1A1A1A]`), thin border (`border-gray-800`).
    - Title (white, elegant font).
    - Short description (gray text).
    - "View Details" outlined button spanning full width (`border-gray-600 text-white hover:bg-gray-800`).
  - Cards should have hover effects (image scale-up).

## DO NOT
- Do not fetch this data from the database for now if it's too complex; using hardcoded mock data for the landing page featured cards is perfectly acceptable for the MVP.
- Do not use the exact same `ItineraryCard` from the sidebar if the design differs significantly. Create a specific `FeaturedItineraryCard` within this component.
```

---

## STEP 6 — Assemble the Landing Page

**Paste this prompt into Claude Code:**

```
## TASK
Assemble the new root landing page using the components created in the previous steps.

## BACKGROUND
Create `src/app/page.tsx` (the new root page).
1. Import and render in order:
   - `<HeroSection />`
   - `<HeritageSection />`
   - `<CuratedJourneysSection />`
2. Ensure the page scrolls smoothly. 
3. Test all links (especially "Explore Itineraries" and "View All Experiences" navigating to `/explore`).
4. Ensure the page has no horizontal scrolling (`overflow-x-hidden`).

## DO NOT
- Do not include the Map or Panorama components on this page.
- Do not leave any placeholder text where actual content was provided in the mockups.
```
