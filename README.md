<img width="1041" height="585" alt="canvas" src="https://github.com/user-attachments/assets/366808e3-faa7-4466-91b8-425d508ee16b" />
                                                                
                                                                # Atlas 360
                                                              
                                                 Immersive Moroccan Travel Itineraries in 360°

</div>

---

## About the Project

**Atlas 360** is a premium, luxury-editorial web application designed to let users explore curated Moroccan travel itineraries. Built with an immersive interactive Google Maps interface, travelers can select an itinerary, view exact coordinates for their journey, and click any location marker to instantly open a 360° Google Street View panorama of that specific spot. 

### Key Features
- **Curated Itineraries:** Browse handcrafted journeys like the *Marrakech Medina Walk* or the *Chefchaouen Blue City*.
- **Interactive Mapping:** Powered by Google Maps API featuring custom markers that react to your selected journey.
- **360° Panoramas:** Integrated Street View modal allowing you to look around iconic Moroccan destinations before you even buy a ticket.
- **Premium Aesthetics:** A bespoke "Warm Moroccan Night" dark theme utilizing custom fonts (*Cormorant Garamond* and *Outfit*), grain textures, and tailored animations.
- **Secure Authentication:** Full sign-up and login workflows powered by Supabase.

---

## Tech Stack

*   **Frontend:** Next.js 16 (App Router), React, TypeScript
*   **Styling:** Tailwind CSS v4, shadcn/ui
*   **Database & Authentication:** Supabase (PostgreSQL + Auth)
*   **Maps Engine:** `@vis.gl/react-google-maps`

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.17 or higher)
*   npm or yarn or pnpm
*   A Supabase account
*   A Google Cloud account (for Maps API)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/atlas-360.git
   cd atlas-360
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root of the project:
   ```env
   # Your Supabase Base URL (Do not include /rest/v1/)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   
   # Your Supabase public API key
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # Google Maps API Key (Ensure Maps Javascript API & Street View Static API are enabled)
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
   ```

4. **Initialize the Database**
   * Log into your Supabase Dashboard and open the **SQL Editor**.
   * Run the contents of `supabase/migrations/001_initial_schema.sql` to build the tables and RLS policies.
   * Run the contents of `supabase/seed.sql` to populate the introductory itineraries and map coordinates.

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 to view it in the browser.

---

## Project Structure

```text
src/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── api/              # Supabase data fetching endpoints
│   └── auth/             # Login & Signup pages
├── components/           # React Components
│   ├── AtlasApp.tsx      # Main application state orchestration
│   ├── MapView.tsx       # Interactive Google Maps integration
│   ├── PanoramaModal.tsx # 360° view overlay handler
│   └── ui/               # shadcn/ui generic components
├── lib/                  # Utilities and Supabase SDK setup
└── types/                # Typescript Definitions

supabase/                 # SQL Migrations and Seed data
```

## Authentication & Testing

### Testing the Workflow
1. Visit the **Sign Up** page and create a new account.
2. By default, Supabase requires email confirmation. You can either:
   - Click the confirmation link in the email sent to you.
   - Go to your **Supabase Dashboard > Authentication > Users** and manually select "Confirm User".
3. Once confirmed, you can use the **Login** page to access the full application state.

### Creating an Admin Account
Currently, Atlas 360 operates on a standard authenticated user model. To manage users or provide "admin" capabilities:
- **User Management**: Use the **Supabase Dashboard > Authentication** section to view, confirm, or delete users.
- **Admin Roles**: To restrict specific actions to admins in the future, you can add a `is_admin` boolean to your user metadata or a dedicated `profiles` table with role definitions.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---
