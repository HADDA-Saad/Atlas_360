
```markdown
# Atlas 360 — Project Guidelines & Memory File
# Claude Code MUST read this file before taking any action.

## Project Overview
Atlas 360 is a Next.js web application that lets users explore curated Moroccan
travel itineraries on an interactive Google Maps base map, and click any location
marker to open an immersive Google Street View 360° panorama of that exact spot.

## MVP Scope (Phase 1 — Due Now)
- 3 hardcoded itineraries in a Supabase PostgreSQL database
- Interactive Google Maps with location markers
- Google Street View panorama modal on marker click
- Supabase Auth (email/password login)
- Clean, responsive UI (Next.js + Tailwind CSS + shadcn/ui)
- NO AI features in this phase — AI is Phase 2

## Tech Stack
- Framework: Next.js 14 (App Router, TypeScript)
- Styling: Tailwind CSS + shadcn/ui
- Database + Auth: Supabase (PostgreSQL)
- Map + 360°: Google Maps JavaScript API (@vis.gl/react-google-maps)
- Package manager: npm

## Critical Commands
- Dev server: `npm run dev` (runs on localhost:3000)
- Add shadcn component: `npx shadcn@latest add [component-name]`
- Supabase types: `npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts`

## Project File Structure
src/
  app/
    page.tsx                  ← Home / map page
    itineraries/
      page.tsx                ← Itinerary listing
      [id]/page.tsx           ← Single itinerary detail + map
    auth/
      login/page.tsx
      signup/page.tsx
    api/
      itineraries/route.ts    ← GET all itineraries
      locations/[id]/route.ts ← GET locations for one itinerary
  components/
    MapView.tsx               ← Google Maps wrapper
    MarkerLayer.tsx           ← Location markers on map
    PanoramaModal.tsx         ← Street View 360° modal
    ItineraryCard.tsx         ← Card for listing page
    ItinerarySidebar.tsx      ← Sidebar showing stops list
    Navbar.tsx
  lib/
    supabase/
      client.ts               ← Browser Supabase client
      server.ts               ← Server Supabase client
  types/
    index.ts                  ← Itinerary, Location TypeScript types

## Database Schema (Supabase PostgreSQL)
Table: itineraries
  - id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
  - title: text NOT NULL
  - description: text
  - region: text
  - duration_days: integer
  - cover_image_url: text
  - created_at: timestamptz DEFAULT now()

Table: locations
  - id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
  - itinerary_id: uuid REFERENCES itineraries(id) ON DELETE CASCADE
  - name: text NOT NULL
  - description: text
  - lat: float8 NOT NULL
  - lng: float8 NOT NULL
  - order_index: integer NOT NULL
  - created_at: timestamptz DEFAULT now()

## The 3 Hardcoded Itineraries (Seed Data)

### Itinerary 1: "Marrakech Medina Walk"
Region: Marrakech | Duration: 2 days
Stops:
1. Jemaa el-Fna Square        lat: 31.6258, lng: -7.9891
2. Bahia Palace                lat: 31.6211, lng: -7.9836
3. Koutoubia Mosque            lat: 31.6245, lng: -7.9942
4. Souks of Marrakech          lat: 31.6312, lng: -7.9874
5. Saadian Tombs               lat: 31.6185, lng: -7.9869

### Itinerary 2: "Fes el-Bali Heritage"
Region: Fes | Duration: 2 days
Stops:
1. Bab Bou Jeloud              lat: 34.0641, lng: -4.9783
2. Chouara Tanneries           lat: 34.0651, lng: -4.9729
3. Al-Qarawiyyin Mosque        lat: 34.0645, lng: -4.9741
4. Nejjarine Fountain          lat: 34.0635, lng: -4.9749
5. Bou Inania Madrasa          lat: 34.0637, lng: -4.9780

### Itinerary 3: "Chefchaouen Blue City"
Region: Chefchaouen | Duration: 1 day
Stops:
1. Place Uta el-Hammam         lat: 35.1688, lng: -5.2685
2. Kasbah Museum               lat: 35.1686, lng: -5.2687
3. Blue Painted Streets        lat: 35.1692, lng: -5.2679
4. Ras el-Ma Waterfall         lat: 35.1710, lng: -5.2645
5. Spanish Mosque Viewpoint    lat: 35.1703, lng: -5.2720

## Environment Variables Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

## Coding Rules — ALWAYS Follow
1. Use TypeScript for every file. No `any` types.
2. Use the App Router (not Pages Router). All files go in `src/app/`.
3. Use Server Components by default. Only add `'use client'` when needed (event handlers, hooks, maps).
4. Use Tailwind CSS for ALL styling. No inline styles, no CSS modules.
5. All Supabase queries use the typed client from `src/lib/supabase/`.
6. Google Maps components use `@vis.gl/react-google-maps` — not the legacy `@react-google-maps/api`.
7. Never hardcode API keys. Always use environment variables.
8. After every code change, confirm the dev server still runs with no TypeScript errors.

## Do Not Ever
- Do not use the Pages Router (`pages/` directory)
- Do not use `@react-google-maps/api` (use `@vis.gl/react-google-maps` instead)
- Do not put Supabase keys in any file other than `.env.local`
- Do not modify `tailwind.config.ts` or `globals.css` unless explicitly asked
- Do not remove existing working components when adding new ones
- Do not skip TypeScript types
```