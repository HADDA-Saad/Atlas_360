# Atlas 360 — Claude Code Build Workflow
## MVP Due Tomorrow: Complete Prompt Sequence + guidelines.md

---

## HOW TO USE THIS DOCUMENT

1. **Start with Step 0** — create the `guidelines.md` file in your project root. Claude Code will read it automatically in every session, giving it persistent project memory.
2. **Run each numbered prompt in order**, one at a time. Do not combine steps.
3. **Each prompt follows the Three-Section Pattern**: Task / Background / Do Not.
4. After each step, **verify the output works** before moving to the next prompt.
5. If Claude Code breaks something, paste the **"Do Not" section** from the relevant prompt again as a correction prompt.


## STEP 1 — Project Initialization

**Paste this prompt into Claude Code:**

```
## TASK
Initialize a new Next.js 14 project called "atlas-360" with the complete dependency set and project structure for the Atlas 360 MVP.

## BACKGROUND
I am building Atlas 360, a Moroccan travel platform with Google Maps and 360° Street View. Read guidelines.md for the full project context, tech stack, and file structure before proceeding.

## EXACT COMMANDS TO RUN IN ORDER
1. npx create-next-app@latest atlas-360 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
2. cd atlas-360
3. npm install @supabase/supabase-js @supabase/ssr @vis.gl/react-google-maps
4. npx shadcn@latest init -d
5. npx shadcn@latest add button card badge dialog sheet separator skeleton
6. Create the exact folder structure defined in guidelines.md under "Project File Structure"
7. Create .env.local with the three environment variable keys from guidelines.md (empty values, just the keys)
8. Create guidelines.md in the project root with the content I will provide separately

## DO NOT
- Do not start writing any component code yet
- Do not modify the default tailwind.config.ts
- Do not install any packages not listed above
- Do not use the Pages Router

After completing setup, confirm by running `npm run dev` and report that the server starts without errors.
```

---

## STEP 2 — Supabase Setup & Database Schema

**Paste this prompt into Claude Code:**

```
## TASK
Set up the Supabase client infrastructure and create all database migration SQL for the Atlas 360 schema.

## BACKGROUND
Read guidelines.md. I have a Supabase project already created at my Supabase dashboard. I need:
1. Two typed Supabase client files (browser and server)
2. The complete SQL migration script to create both tables
3. The SQL seed script to insert all 3 itineraries and their 15 location stops
4. The TypeScript types file for Itinerary and Location

## SPECIFIC DELIVERABLES

### File 1: src/lib/supabase/client.ts
A browser-side Supabase client using createBrowserClient from @supabase/ssr.
Must export: `createClient()` function that returns a typed SupabaseClient.

### File 2: src/lib/supabase/server.ts
A server-side Supabase client using createServerClient from @supabase/ssr with Next.js cookies().
Must export: `createClient()` async function for use in Server Components and API routes.

### File 3: src/types/index.ts
TypeScript interfaces for:
- Itinerary: matching the database schema in guidelines.md
- Location: matching the database schema in guidelines.md
- ItineraryWithLocations: Itinerary & { locations: Location[] }

### File 4: supabase/migrations/001_initial_schema.sql
Full SQL to create both tables with correct types, constraints, foreign keys, and RLS policies.
Include: CREATE TABLE, primary keys, foreign key with CASCADE, indexes on itinerary_id and order_index.
Enable Row Level Security. Add policy: "Allow public read access" for SELECT on both tables.
Add policy: "Allow authenticated insert" for INSERT on itineraries and locations.

### File 5: supabase/seed.sql
SQL INSERT statements for all 3 itineraries and all 15 locations.
Use the exact names, coordinates, and order_index values from guidelines.md.
Use fixed UUIDs (gen_random_uuid() is fine) so the foreign keys link correctly.

## DO NOT
- Do not use the legacy createClient from @supabase/supabase-js directly in components
- Do not hardcode the Supabase URL or key — use process.env variables
- Do not create any UI components in this step
- Do not modify any files created in Step 1
```

---

## STEP 3 — API Routes

**Paste this prompt into Claude Code:**

```
## TASK
Build the two Next.js API Route handlers that serve itinerary and location data from Supabase.

## BACKGROUND
Read guidelines.md. The Supabase client infrastructure from Step 2 is already in place at src/lib/supabase/server.ts. The TypeScript types are at src/types/index.ts.

## SPECIFIC DELIVERABLES

### File 1: src/app/api/itineraries/route.ts
GET handler that:
- Uses the server Supabase client
- Queries: SELECT * FROM itineraries ORDER BY created_at ASC
- Returns: NextResponse.json(itineraries) with proper error handling
- On error: returns NextResponse.json({ error: message }, { status: 500 })

### File 2: src/app/api/itineraries/[id]/locations/route.ts
GET handler that:
- Accepts the itinerary [id] param
- Queries: SELECT * FROM locations WHERE itinerary_id = id ORDER BY order_index ASC
- Returns: NextResponse.json(locations) with proper error handling
- Validates that id is a valid UUID string; returns 400 if not

## TESTING
After creating both routes, confirm they return valid JSON by logging the expected output shape.

## DO NOT
- Do not use fetch() inside the API routes to call your own API
- Do not skip error handling
- Do not use the browser Supabase client (src/lib/supabase/client.ts) in these server-side routes
- Do not modify any files from Steps 1 or 2
```

---

## STEP 4 — The Google Maps + Markers Component

**Paste this prompt into Claude Code:**

```
## TASK
Build the core interactive Google Maps component with location markers for Atlas 360.
This is the most critical UI component — the entire 360° experience depends on it working correctly.

## BACKGROUND
Read guidelines.md. I am using the @vis.gl/react-google-maps library (NOT @react-google-maps/api).
The component must:
1. Render a Google Maps base map centered on Morocco
2. Accept a `locations` prop (Location[] from src/types/index.ts)
3. Render a custom styled marker at each location's lat/lng
4. When a marker is clicked, call an `onMarkerClick(location: Location)` callback prop
5. Visually highlight the currently selected marker differently from unselected ones

## SPECIFIC DELIVERABLES

### File 1: src/components/MapView.tsx
'use client' component using @vis.gl/react-google-maps.

Props interface:
  locations: Location[]
  onMarkerClick: (location: Location) => void
  selectedLocationId?: string
  itineraryPath?: boolean (if true, draw a polyline connecting markers in order)

Implementation:
- Use <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
- Use <Map> with: defaultCenter={{ lat: 31.7917, lng: -7.0926 }} (center of Morocco)
  defaultZoom={6}, mapId="atlas360-map"
- Use <AdvancedMarker> for each location
- When itineraryPath is true, render a <Polyline> through the sorted location coordinates
- Selected marker: render with a larger, accent-colored pin (use a div with Tailwind inside AdvancedMarker)
- Unselected markers: smaller, muted color pin
- Clicking a marker calls onMarkerClick(location)
- Map style: use mapTypeId="roadmap", disable default POI labels for a cleaner look

### File 2: src/components/MarkerPin.tsx
A small 'use client' sub-component for the custom pin:
Props: { isSelected: boolean; label: string; index: number }
Render a styled div pin: circular, terracotta color (#C1440E) when selected, slate when not.
Show the stop number (index) inside the pin.
Smooth CSS transition on selection state change.

## DO NOT
- Do not use @react-google-maps/api — only @vis.gl/react-google-maps
- Do not put the APIProvider in this component — it will go in the layout
- Do not use Google Maps markers API v2 directly — use AdvancedMarker from @vis.gl/react-google-maps
- Do not fetch data inside MapView — it only renders what it receives via props
- Do not modify any files from previous steps
```

---

## STEP 5 — The 360° Panorama Modal

**Paste this prompt into Claude Code:**

```
## TASK
Build the PanoramaModal component that opens a Google Street View 360° immersive panorama
when a map marker is clicked. This is the signature feature of Atlas 360.

## BACKGROUND
Read guidelines.md. The Google Maps API is already loaded via the APIProvider in MapView.tsx.
The modal receives a Location object (with lat and lng) and must initialize a Street View
panorama pointing at those exact coordinates.

How Google Street View works programmatically:
- The window.google.maps.StreetViewPanorama constructor takes a DOM element and options
- Set position: { lat: location.lat, lng: location.lng }
- Set pov (point of view): { heading: 0, pitch: 0 } — user can rotate after open
- Set motionTracking: false, addressControl: false, fullscreenControl: true
- The panorama renders inside a div ref — the div must have a fixed height or it won't show

## SPECIFIC DELIVERABLES

### File: src/components/PanoramaModal.tsx
'use client' component.

Props interface:
  location: Location | null
  isOpen: boolean
  onClose: () => void

Implementation:
- Use shadcn/ui Dialog component as the modal wrapper
- Inside the Dialog: render a div with ref={panoramaRef} and className="w-full h-[70vh]"
- Use useEffect to initialize the StreetViewPanorama when isOpen becomes true and location is set
- Access the Google Maps API via: new window.google.maps.StreetViewPanorama(panoramaRef.current, options)
- Display the location name as a title above the panorama inside the Dialog header
- Display a subtle note: "360° Street View — drag to look around"
- On modal close, call onClose(). Clean up the panorama instance in the useEffect cleanup.
- Use the useMapsLibrary('streetView') hook from @vis.gl/react-google-maps to ensure the API is fully loaded before initializing the panorama. Do not call window.google.maps until the library is loaded.
- Add a listener for the 'status_changed' event on the panorama instance. If panorama.getStatus() === 'ZERO_RESULTS', show a UI error message over the modal saying "No 360° imagery available exactly here."
- Handle the edge case where Street View has no imagery at a location: catch the error and display
  a fallback message: "No Street View available at this location. Try a nearby spot!"

TypeScript: declare the StreetViewPanorama types using the @types/google.maps package.
Run: npm install --save-dev @types/google.maps

## DO NOT
- Do not use an iframe to embed Street View — use the JS API directly
- Do not use any library other than the native Google Maps JavaScript API for the panorama
- Do not skip the cleanup in useEffect (memory leak risk)
- Do not modify MapView.tsx or any previous files
```

---

## STEP 6 — Itinerary Sidebar & Cards

**Paste this prompt into Claude Code:**

```
## TASK
Build the ItinerarySidebar and ItineraryCard components that allow users to browse
itineraries and see the list of stops for the currently selected itinerary.

## BACKGROUND
Read guidelines.md. These components are the left-panel UI of the main page.
The sidebar has two states:
  State A (no itinerary selected): shows a list of ItineraryCard components
  State B (itinerary selected): shows the stop list for that itinerary, with each
  stop clickable to fly the map to that location and highlight the marker.

## SPECIFIC DELIVERABLES

### File 1: src/components/ItineraryCard.tsx
'use client' component.
Props: { itinerary: Itinerary; isSelected: boolean; onClick: () => void }
Design: Card with the itinerary title, region badge, duration, and description (truncated to 2 lines).
Use shadcn/ui Card component. Highlight selected card with a terracotta left border accent.
Smooth hover and selection transitions.

### File 2: src/components/ItinerarySidebar.tsx
'use client' component.
Props:
  itineraries: Itinerary[]
  selectedItinerary: Itinerary | null
  locations: Location[]
  selectedLocationId: string | undefined
  onItinerarySelect: (itinerary: Itinerary) => void
  onLocationSelect: (location: Location) => void
  onBack: () => void

State A: map itineraries to <ItineraryCard> components
State B: show a "← Back" button, the itinerary title, and a numbered list of stops.
Each stop is a clickable row: shows the stop number, name, and a small compass icon.
Clicking a stop calls onLocationSelect(location).
Highlight the currently selected stop with the terracotta accent color.

Sidebar should be scrollable independently of the map. Use overflow-y-auto.
Width: 380px on desktop, full-width drawer on mobile (use shadcn Sheet for mobile).

## DO NOT
- Do not fetch data in these components — they receive everything via props
- Do not use any map-related imports here
- Do not break existing component files
```

---

## STEP 7 — Main Page: Wire Everything Together

**Paste this prompt into Claude Code:**

```
## TASK
Build the main home page (src/app/page.tsx) that wires together all components into the
complete Atlas 360 experience: sidebar on the left, map on the right, panorama modal on marker click.

## BACKGROUND
Read guidelines.md. All components are built:
- MapView.tsx — renders the Google Maps with markers
- PanoramaModal.tsx — opens 360° Street View
- ItinerarySidebar.tsx — browsing and stop selection
The page fetches data server-side, passes it to a client wrapper, which manages all state.

## SPECIFIC DELIVERABLES

### File 1: src/app/page.tsx (Server Component)
- Fetches all itineraries from Supabase directly (using server client, not the API route)
- Passes itineraries to a client component <AtlasApp>
- Wraps the page in the APIProvider from @vis.gl/react-google-maps with the Google Maps API key

### File 2: src/components/AtlasApp.tsx ('use client')
State:
  - selectedItinerary: Itinerary | null
  - locations: Location[] (fetched client-side when an itinerary is selected)
  - selectedLocation: Location | null
  - isPanoramaOpen: boolean
  - isLoadingLocations: boolean

Layout:
  - Full viewport height: h-screen overflow-hidden
  - Flex row: sidebar (w-[380px] flex-shrink-0) + map (flex-1)
  - On mobile: sidebar becomes a bottom sheet or toggle-able panel

Logic:
  - When user selects an itinerary: fetch /api/itineraries/[id]/locations, set locations state,
    set selectedItinerary. Show a loading skeleton in the sidebar while fetching.
  - When user clicks a marker: set selectedLocation, set isPanoramaOpen to true
  - When user clicks a stop in sidebar: set selectedLocation, fly map to that location,
    set isPanoramaOpen to true
  - When panorama modal closes: set isPanoramaOpen to false, keep selectedLocation set
    (so the marker stays highlighted on the map)

Map behavior:
  - Pass selectedLocationId to MapView so it can highlight the active marker
  - Pass itineraryPath={true} when locations are loaded (draw the route line)

### File 3: src/app/layout.tsx
Update the root layout to include:
- A simple Navbar with the Atlas 360 logo/name and auth buttons (Login / Sign Up)
- Inter font (or a better font of your choice) via next/font
- The Google APIProvider should be in page.tsx, not layout.tsx

## DO NOT
- Do not fetch data inside MapView or PanoramaModal
- Do not put all logic in a single massive component — use the file structure above
- Do not break any of the already-built components
- Do not use useEffect to fetch itineraries on initial load — use server-side data fetching
```

---

## STEP 8 — Authentication (Supabase Auth)

**Paste this prompt into Claude Code:**

```
## TASK
Implement Supabase email/password authentication with login and signup pages,
protected route middleware, and auth state in the Navbar.

## BACKGROUND
Read guidelines.md. I am using @supabase/ssr for server-side auth. The Supabase server
client is already set up at src/lib/supabase/server.ts. Auth is needed to protect future
features (saving itineraries) but the MVP map is accessible without login.

## SPECIFIC DELIVERABLES

### File 1: src/app/auth/login/page.tsx
A centered login form page using shadcn/ui Card, Input, Button.
Fields: email, password.
On submit: call supabase.auth.signInWithPassword(). On success: redirect to '/'.
Show error message if login fails.
Include a link to the signup page.

### File 2: src/app/auth/signup/page.tsx
A signup form page with: email, password, confirm password fields.
On submit: call supabase.auth.signUp(). On success: show "Check your email for a confirmation link."
Include a link to the login page.

### File 3: src/middleware.ts (Next.js middleware)
Use @supabase/ssr createServerClient to refresh the auth session on every request.
Protect no routes for now (the map is public). Just refresh the session token so it doesn't expire.
Match on: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'

### File 4: Update src/components/Navbar.tsx
Make it a 'use client' component that reads the auth state.
Show: "Login" and "Sign Up" buttons when logged out.
Show: user email + "Logout" button when logged in.
Use supabase.auth.getUser() in a useEffect to set user state.
Listen to supabase.auth.onAuthStateChange to reactively update the UI.

## DO NOT
- Do not protect the main map page — it stays public
- Do not use the legacy supabase.auth.session() (deprecated)
- Do not store the session in localStorage manually — @supabase/ssr handles this
- Do not modify MapView.tsx, PanoramaModal.tsx, or any map components
```

---

## STEP 9 — UI Polish & Final Touches

**Paste this prompt into Claude Code:**

```
## TASK
Apply final UI polish to Atlas 360 to make it look professional for the project presentation.
Focus on visual quality, loading states, and responsiveness.

## BACKGROUND
Read guidelines.md. All core functionality is complete. This step is purely about aesthetics
and UX quality. The design should feel like a premium travel product — dark, rich, map-centric.

## SPECIFIC DELIVERABLES

### 1. Update src/app/globals.css
Add these CSS variables for the Atlas 360 brand palette:
  --atlas-primary: #C1440E   (terracotta — Moroccan clay)
  --atlas-dark: #1A1208      (deep warm black)
  --atlas-sand: #F5E6D0      (desert sand)
  --atlas-text: #2D1B0E      (warm dark brown)

### 2. Loading Skeleton for Sidebar (src/components/SidebarSkeleton.tsx)
Use shadcn/ui Skeleton to create a loading state: 3 skeleton cards with pulsing animation.
Show this in ItinerarySidebar while locations are being fetched.

### 3. Empty State Component (src/components/EmptyState.tsx)
For when no itinerary is selected: show a centered illustration (SVG compass icon),
a heading "Explore Morocco", and subtext "Select an itinerary to begin your journey."

### 4. Map Loading State
In AtlasApp.tsx, add a subtle loading overlay on the map div while locations are fetching.
Semi-transparent with a spinner centered. Remove when loading is complete.

### 5. Responsive Mobile Layout
On screens < 768px:
- The sidebar collapses to a bottom sheet (use shadcn Sheet, triggered by a floating button)
- The map takes full screen
- The floating button shows the selected itinerary name or "Browse Itineraries"

### 6. Navbar Styling
Make the Navbar background: semi-transparent dark (bg-black/70 backdrop-blur-md)
positioned absolute over the map. Atlas 360 logo in the terracotta color.

## DO NOT
- Do not change any functional logic
- Do not modify the API routes
- Do not introduce any new npm packages (use only what's already installed)
- Do not break the panorama modal or map marker click behavior
```

---

## STEP 10 — Final Verification Prompt

**Paste this as your last Claude Code prompt before submitting:**

```
## TASK
Perform a full project audit of Atlas 360 and fix any remaining issues before the deadline.

## BACKGROUND
Read guidelines.md. The project is complete. I need you to verify every critical path works.

## AUDIT CHECKLIST — Check and fix each item:

1. TypeScript: Run `npx tsc --noEmit` — fix ALL type errors. Zero tolerance.

2. Environment variables: Verify all three .env.local keys are referenced correctly
   in the code. No hardcoded values anywhere.

3. Supabase connection: Confirm the server client in src/lib/supabase/server.ts
   correctly uses createServerClient with Next.js cookies().

4. Google Maps APIProvider: Confirm it wraps the Map and PanoramaModal correctly
   so both have access to the Maps JS API.

5. Panorama Modal: Confirm the useEffect has a proper cleanup function to destroy
   the StreetViewPanorama instance when the modal closes.

6. Mobile layout: Confirm the page renders correctly on a 375px wide viewport.

7. Auth middleware: Confirm src/middleware.ts exists and the matcher is correct.

8. Seed data: Output the final supabase/seed.sql content so I can run it in the
   Supabase SQL editor to populate the database.

9. Run `npm run build` and fix any build errors.

10. Write me a 5-bullet README.md explaining: what the project is, the tech stack,
    how to run it locally, how to seed the database, and the Supabase/Google Maps
    API keys needed.

## DO NOT
- Do not refactor working code for style reasons
- Do not add new features
- Do not change the database schema
- Only fix actual errors found in the audit
```

---

## QUICK REFERENCE: If Claude Code Breaks Something

If a step breaks existing functionality, paste this correction prompt:

```
## CORRECTION PROMPT

Something broke. Before touching any code:
1. Read guidelines.md fully
2. Run `npm run dev` and tell me the exact error message
3. Identify ONLY the file(s) causing the error
4. Fix ONLY those files
5. Do NOT refactor, rename, or reorganize any other files
6. After fixing, run `npm run dev` again and confirm it compiles cleanly
```

---


---

