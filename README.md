<img width="1041" height="585" alt="canvas" src="https://github.com/user-attachments/assets/366808e3-faa7-4466-91b8-425d508ee16b" />
                                                                
                                                                # Atlas 360
                                                              
                                                 Immersive Moroccan Travel Itineraries in 360°

</div>

---

## About the Project

**Atlas 360** is a premium, luxury-editorial web application designed to let users explore curated Moroccan travel itineraries. Travelers can select an itinerary, view exact coordinates on an interactive Google Map, and click any location marker to instantly open a 360° Google Street View panorama.

Beyond exploration, Atlas 360 features a full marketplace for local tour guides and a premium subscription system, all backed by a robust, fully tested architecture.

### Key Features

- **Interactive Mapping & 360° Panoramas:** Powered by Google Maps API, featuring custom markers and an integrated Street View modal to look around iconic Moroccan destinations.
- **Local Guide Marketplace:** Browse verified local guides, check their real-time availability calendars, and send booking requests.
- **Premium Subscriptions & Trip Passes:** Monetization powered by Stripe, including recurring tier subscriptions (Explorer, Nomad, Elite) and one-time Trip Passes.
- **Secure Authentication:** Full sign-up, login, and protected route workflows powered by Supabase.
- **Bulletproof Testing:** Comprehensive test coverage including 38 Unit/Integration tests (Vitest) and 17 automated browser tests (Playwright).

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Database & Authentication:** Supabase (PostgreSQL + Auth)
- **Payments:** Stripe Checkout & Webhooks
- **Maps Engine:** `@vis.gl/react-google-maps`
- **Testing:** Vitest, Playwright

---

## Getting Started

### Prerequisites

- Node.js (v18.17 or higher)
- npm, yarn, or pnpm
- Supabase account
- Stripe account
- Google Cloud account (Maps API)

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
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
   NEXT_PUBLIC_GOOGLE_MAP_ID=your-google-map-id
   PLACES_API_KEY=your-places-api-key

   # Stripe
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   STRIPE_NOMAD_PRICE_ID=price_your-nomad-price-id
   STRIPE_ELITE_PRICE_ID=price_your-elite-price-id
   ```

4. **Initialize the Database**
   - Log into your Supabase Dashboard and open the **SQL Editor**.
   - Run the contents of `supabase/migrations/001_initial_schema.sql` to build the tables and RLS policies.
   - Run the contents of `supabase/seed.sql` to populate the introductory itineraries and map coordinates.

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 to view it in the browser.

---

## Testing

Atlas 360 is fully tested. We use a separate `.env.test` file to keep testing credentials out of version control.

**For a full, beginner-friendly guide on how to set up your test accounts and run the test suite, please read the [Testing Guide](TESTING.md).**

```bash
# Run Unit and Integration Tests (Vitest)
npm run test

# Run End-to-End Browser Tests (Playwright)
npm run test:e2e
```

---

## Project Structure

```text
src/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── api/              # Secure endpoints for Stripe webhooks and bookings
│   ├── auth/             # Login & Signup flows
│   ├── dashboard/        # Protected user and guide dashboards
│   └── pricing/          # Subscription and Trip Pass purchase flows
├── components/           # React Components
│   ├── MapView.tsx       # Interactive Google Maps integration
│   ├── PanoramaModal.tsx # 360° view overlay handler
│   └── ui/               # shadcn/ui generic components
├── lib/                  # Utilities, Supabase SDK, and pricing logic
├── tests/                # Automated test suites
│   ├── e2e/              # Playwright browser tests
│   ├── integration/      # API and webhook testing
│   └── unit/             # Utility function testing
└── types/                # Typescript Definitions

supabase/                 # SQL Migrations and Seed data
```

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
