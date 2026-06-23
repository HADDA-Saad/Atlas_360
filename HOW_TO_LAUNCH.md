# 🚀 Atlas 360 — How to Launch from A to Z

This guide takes you from a **completely fresh machine** (nothing installed) to a **fully running Atlas 360** in your browser. It assumes you have never seen this project before. Follow the steps in order.

> **What you are about to run:** Atlas 360 is a Next.js 16 web app. It needs three external accounts to work fully — **Supabase** (database + login), **Stripe** (payments), and **Google Maps** (maps + 360° panoramas) — plus an optional **Google Gemini** key for the AI itinerary feature. All of these have **free tiers**, so you do not need to pay anything to test the project.

---

## 1. Install the prerequisites

Install these on your computer first. (Skip any you already have.)

| Tool | Why | Where to get it |
| :--- | :--- | :--- |
| **Node.js** (v20 LTS recommended; v18.17+ minimum) | Runs the app and installs packages | https://nodejs.org — download the **LTS** version |
| **npm** | Installs dependencies (comes bundled with Node.js) | Installed automatically with Node.js |
| **Git** *(optional)* | Only if you clone from GitHub instead of using the zip | https://git-scm.com |
| **A code editor** (e.g. VS Code) | To edit the environment file | https://code.visualstudio.com |
| **Stripe CLI** *(optional)* | Only needed to test live payment webhooks locally | https://docs.stripe.com/stripe-cli |

**Check Node is installed.** Open a terminal (Command Prompt / PowerShell / Terminal) and run:

```bash
node -v
npm -v
```

You should see version numbers (e.g. `v20.x.x`). If you see an error, Node.js is not installed correctly — reinstall it.

---

## 2. Get the project onto your machine

**Option A — from the zip file** (what you most likely have):
1. Unzip `Atlas-360-main.zip`.
2. Open a terminal **inside** the unzipped `Atlas-360-main` folder.

**Option B — from GitHub:**
```bash
git clone <repository-url>
cd Atlas-360-main
```

> ✅ You are in the right folder if you can see `package.json` when you run `ls` (Mac/Linux) or `dir` (Windows).

---

## 3. Install the dependencies

From inside the project folder, run:

```bash
npm install
```

This reads `package.json` and downloads every library the project needs (Next.js, React, Supabase, Stripe, Google Maps, etc.) into a `node_modules` folder. It can take a couple of minutes the first time. This is normal.

---

## 4. Create the three external accounts and collect the keys

This is the most important part. The app reads its secret keys from a file called **`.env.local`** that you will create in the next step. First, gather the values below.

> You do **not** strictly need every key to see the app run. The minimum to **open the site and log in** is the **Supabase** block. Maps, payments and AI need their own keys to work, but the app will still start without them.

### 4.1 Supabase (database + authentication) — **required**

1. Go to **https://supabase.com**, sign up (free), and click **New Project**.
2. Give it a name, choose a region, and set a database password (save it somewhere).
3. Wait ~2 minutes for the project to be created.
4. In the left sidebar go to **Project Settings → API**. From there copy:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **`anon` `public` key** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **`service_role` key** (click *Reveal*) → this is your `SUPABASE_SERVICE_ROLE_KEY`
     > ⚠️ The `service_role` key is a **secret admin key**. Never expose it in the browser or commit it to GitHub. It is only used server-side.

### 4.2 Google Maps Platform (maps + 360° Street View) — needed for the map features

1. Go to **https://console.cloud.google.com** and sign in with a Google account.
2. Create a new **project** (top bar → project dropdown → New Project).
3. Open **APIs & Services → Library** and **enable** these APIs:
   - **Maps JavaScript API**
   - **Street View Static API** (and *Street View* if listed)
   - **Places API** (for restaurant/hotel recommendations)
4. Go to **APIs & Services → Credentials → Create Credentials → API key**.
   - The created key → this is your `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
   - You can reuse the same key for `PLACES_API_KEY`, **or** create a second restricted key just for Places.
5. **Create a Map ID** (needed for the styled/advanced map): in the Google Cloud console go to **Google Maps Platform → Map Management → Create Map ID** (type: *JavaScript*, *Vector* recommended).
   - The Map ID → this is your `NEXT_PUBLIC_GOOGLE_MAP_ID`.
   > 💡 Google gives a recurring free monthly credit, so light development use is normally free. To be safe, you may set a budget alert in **Billing**.

### 4.3 Stripe (subscriptions + payments) — needed for the pricing/booking payment features

1. Go to **https://stripe.com**, sign up (free), and stay in **Test mode** (toggle at the top right — keep it ON for development).
2. Go to **Developers → API keys** and copy:
   - **Secret key** (`sk_test_...`) → this is your `STRIPE_SECRET_KEY`.
3. **Create the subscription products and prices.** Go to **Product catalogue → Add product** and create:
   - **Nomad** product → add a **monthly** price (99 MAD) and a **yearly** price.
   - **Elite** product → add a **monthly** price (199 MAD) and a **yearly** price.
   - After saving each price, copy its **Price ID** (`price_...`):
     - Nomad monthly → `STRIPE_NOMAD_PRICE_ID`
     - Nomad yearly → `STRIPE_NOMAD_YEARLY_PRICE_ID`
     - Elite monthly → `STRIPE_ELITE_PRICE_ID`
     - Elite yearly → `STRIPE_ELITE_YEARLY_PRICE_ID`
4. **Webhook secret** (`STRIPE_WEBHOOK_SECRET`) — this confirms payments back to the app. You get it in **two possible ways**:
   - **Local development (recommended):** install the Stripe CLI and run
     ```bash
     stripe listen --forward-to localhost:3000/api/webhooks/stripe
     ```
     The CLI prints a secret starting with `whsec_...` — use that as `STRIPE_WEBHOOK_SECRET`. Keep this command running in its own terminal while you test payments.
   - **Hosted/deployed app:** in **Developers → Webhooks → Add endpoint**, point it at `https://your-domain/api/webhooks/stripe`, then copy the endpoint's **Signing secret** (`whsec_...`).

   > 💳 **Test card:** in Stripe test mode, pay with card number `4242 4242 4242 4242`, any future expiry, any CVC, any postcode.

### 4.4 Google Gemini (AI itinerary generation) — optional

1. Go to **https://aistudio.google.com/app/apikey** and create an API key (free tier available).
2. The key → this is your `GEMINI_API_KEY`.
3. Leave `GEMINI_MODEL` unset to use the default (`gemini-2.5-flash`), or set it explicitly.

### 4.5 OpenWeather (weather widget) — optional

1. Go to **https://openweathermap.org/api**, create a free account, and copy your API key.
2. The key → this is your `NEXT_PUBLIC_OPENWEATHER_API_KEY`.

---

## 5. Create the `.env.local` file

In the **root** of the project (same folder as `package.json`), create a new file named exactly **`.env.local`** and paste the block below, replacing every `your-...` with the real values you collected in step 4.

```env
# ============================================================
#  ATLAS 360 — ENVIRONMENT VARIABLES (.env.local)
#  Replace every "your-..." value with your real key.
# ============================================================

# ---------- Supabase (REQUIRED) ----------
# From: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# ---------- App URL (REQUIRED) ----------
# Local development uses localhost. Change when deployed.
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ---------- Google Maps (for maps + 360° panoramas) ----------
# From: Google Cloud Console → APIs & Services → Credentials
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_GOOGLE_MAP_ID=your-google-map-id
PLACES_API_KEY=your-google-places-api-key

# ---------- Stripe (for subscriptions + payments) ----------
# From: Stripe Dashboard → Developers → API keys / Products
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_NOMAD_PRICE_ID=price_your-nomad-monthly-id
STRIPE_NOMAD_YEARLY_PRICE_ID=price_your-nomad-yearly-id
STRIPE_ELITE_PRICE_ID=price_your-elite-monthly-id
STRIPE_ELITE_YEARLY_PRICE_ID=price_your-elite-yearly-id

# ---------- Google Gemini (optional: AI itineraries) ----------
# From: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

# ---------- OpenWeather (optional: weather widget) ----------
# From: https://openweathermap.org/api
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key

# ---------- Cron (optional: auto-release expired holds) ----------
# Only needed in production to protect the scheduled job.
# Invent any long random string here.
CRON_SECRET=any-long-random-string
```

### What each variable does (quick reference)

| Variable | Required? | Purpose | Where it comes from |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Address of your database | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public key for browser login | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Secret admin key (server only) | Supabase → Settings → API |
| `NEXT_PUBLIC_APP_URL` | ✅ | Base URL used in redirects/checkout | `http://localhost:3000` locally |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps | Loads interactive maps + Street View | Google Cloud → Credentials |
| `NEXT_PUBLIC_GOOGLE_MAP_ID` | Maps | Styled/advanced map rendering | Google Cloud → Map Management |
| `PLACES_API_KEY` | Maps | Nearby restaurants/hotels | Google Cloud → Credentials |
| `STRIPE_SECRET_KEY` | Payments | Authenticates with Stripe | Stripe → API keys |
| `STRIPE_WEBHOOK_SECRET` | Payments | Verifies payment confirmations | Stripe CLI or Webhook endpoint |
| `STRIPE_NOMAD_PRICE_ID` | Payments | Nomad monthly plan | Stripe → Products |
| `STRIPE_NOMAD_YEARLY_PRICE_ID` | Payments | Nomad yearly plan | Stripe → Products |
| `STRIPE_ELITE_PRICE_ID` | Payments | Elite monthly plan | Stripe → Products |
| `STRIPE_ELITE_YEARLY_PRICE_ID` | Payments | Elite yearly plan | Stripe → Products |
| `GEMINI_API_KEY` | Optional | AI itinerary generation | Google AI Studio |
| `GEMINI_MODEL` | Optional | Which Gemini model to use | Defaults to `gemini-2.5-flash` |
| `NEXT_PUBLIC_OPENWEATHER_API_KEY` | Optional | Weather on itineraries | OpenWeather |
| `CRON_SECRET` | Optional | Protects the scheduled hold-release job | Any random string you choose |

> 🔒 `.env.local` is already ignored by Git (see `.gitignore`), so your secrets will **not** be uploaded to GitHub.

---

## 6. Set up the database (Supabase)

The app's tables, security rules and starter data live in SQL files inside the `supabase/` folder. You apply them through the Supabase web dashboard — no command-line database tools needed.

### 6.1 Run the migrations (creates the tables)

1. Open your project on **https://supabase.com** → left sidebar → **SQL Editor** → **New query**.
2. Open the `supabase/migrations/` folder. Run the files **one by one, in numerical order**, by copying each file's contents into the SQL editor and clicking **Run**. The order is:

   ```
   001_initial_schema.sql
   002_profiles.sql
   004_locations_logistics.sql
   006_subscriptions.sql
   007_user_itineraries.sql
   008_security_access_policies.sql
   009_user_itinerary_atomic_create.sql
   010_reviews.sql
   011_assistance_requests.sql
   012_stop_rich_content.sql
   013_forked_itinerary.sql
   014_itinerary_region.sql
   015_trip_pass.sql
   016_assistance_ops.sql
   017_guides_schema.sql
   018_guide_reviews_and_media.sql
   019_notifications.sql
   020_fix_booking_itinerary_nullable.sql
   021_booking_messages.sql
   022_booking_terms.sql
   023_booking_conflict.sql
   025_booking_reschedule.sql
   026_booking_expired.sql
   027_admin_role.sql
   028_remove_trip_pass.sql
   029_add_guides_profiles_fk.sql
   030_booking_hold_expires.sql
   031_ai_planner.sql
   031_security_patches.sql
   032_guide_verification.sql
   033_add_avatar_url.sql
   ```

   > Run them **strictly in this order** — later files depend on tables created by earlier ones. (Numbers 003 and 024 are intentionally absent.) If two files share number `031`, run `031_ai_planner.sql` then `031_security_patches.sql`.

### 6.2 Seed the starter content (curated itineraries, locations)

After all migrations succeed, run the seed files (same SQL Editor) to populate the introductory itineraries and map coordinates:

```
supabase/seed.sql
supabase/seed_rich.sql
supabase/seed_nomad_routes.sql
supabase/seed_nomad_rich.sql
```

> These add the demo Moroccan itineraries and stops you see on the map. They are optional but strongly recommended so the app isn't empty.

### 6.3 Storage buckets (for guide documents & avatars)

Guide verification uploads ID/licence documents and profile pictures. If the migrations didn't create the storage buckets automatically, create them manually in **Supabase → Storage → New bucket** (e.g. a private bucket for verification documents and one for avatars). You can skip this until you test guide verification.

---

## 7. Run the app

From the project root:

```bash
npm run dev
```

Wait for the line that says it's ready, then open:

👉 **http://localhost:3000**

You should see the Atlas 360 home page. 🎉

### Make yourself an admin (to see the Administration space)

Admin access is granted by a **role in the database**, not by signing up:
1. Sign up normally in the app (create an account).
2. In Supabase → **Table Editor** → open the `profiles` table → find your row → set its `role` column to `admin` → save.
3. Refresh the app — you now have access to the **Operations & Moderation** admin space.

---

## 8. (Optional) Test payments locally

If you want subscriptions/booking payments to fully work on your machine:

1. Keep `npm run dev` running in one terminal.
2. In a **second** terminal, run the Stripe listener (requires the Stripe CLI):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Make sure the `whsec_...` it prints is the value in your `.env.local` as `STRIPE_WEBHOOK_SECRET`.
4. In the app, subscribe to a plan and pay with the test card `4242 4242 4242 4242`.

---

## 9. (Optional) Run the automated tests

The project ships with unit/integration tests (Vitest) and end-to-end browser tests (Playwright).

```bash
# Fast unit + integration tests
npm run test

# End-to-end browser tests (the app must be running with `npm run dev`)
npm run test:e2e
```

For the E2E tests you also need a **`.env.test`** file with test accounts — see **`TESTING.md`** for the full beginner walkthrough. In short: copy your `.env.local` into `.env.test` and add:

```env
TEST_USER_EMAIL="your_test_user@example.com"
TEST_USER_PASSWORD="your_secure_password"
TEST_GUIDE_EMAIL="your_guide_account@example.com"
TEST_GUIDE_PASSWORD="your_secure_password"
```

(Create those two accounts in the running app first — one normal, one with the "list my services as a local Tour Guide" box ticked.)

---

## 10. Build for production (optional)

To create and run an optimised production build:

```bash
npm run build
npm run start
```

---

## ❓ Troubleshooting

| Symptom | Likely cause / fix |
| :--- | :--- |
| App starts but **map is blank** | Missing/invalid `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` or `NEXT_PUBLIC_GOOGLE_MAP_ID`, or the Maps/Street View APIs aren't enabled in Google Cloud. |
| **Login/sign-up fails** | Check the three Supabase keys and that the migrations ran. |
| **No itineraries on the map** | You skipped the seed files in step 6.2. |
| **Payment doesn't confirm** | The Stripe webhook listener isn't running, or `STRIPE_WEBHOOK_SECRET` doesn't match the one the CLI printed. |
| **AI itinerary button errors** | Missing `GEMINI_API_KEY`. |
| `npm install` fails | Make sure you're on Node v18.17+ (ideally v20). Delete `node_modules` and run `npm install` again. |
| Changed `.env.local` but nothing changed | Stop the dev server (Ctrl+C) and run `npm run dev` again — env files are only read on start. |

---

### Minimum to just **see the site run**
If you only want to open the app and log in (no maps/payments yet), you only need the **Supabase** block (3 keys) + `NEXT_PUBLIC_APP_URL`, then run the migrations and `npm run dev`. Add the other keys later to unlock maps, payments and AI.



NEXT_PUBLIC_SUPABASE_URL=https://usbcnmsodhnovziklmgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzYmNubXNvZGhub3Z6aWtsbWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTA3MTQsImV4cCI6MjA5MjI4NjcxNH0.lDqIRFrkQ30VB6eJ1APHopM-EYv5-HDSDFVMo8Xnnnk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzYmNubXNvZGhub3Z6aWtsbWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjcxMDcxNCwiZXhwIjoyMDkyMjg2NzE0fQ.61_CWx1Uhv4mNNbXGoLzhB8Jp_p2ab4SJ6n7ziMzr8g
PLACES_API_KEY=AIzaSyB4gmvr3axeqNF483uR8ysRs35xLDmNp0I
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB4gmvr3axeqNF483uR8ysRs35xLDmNp0I
NEXT_PUBLIC_GOOGLE_MAP_ID=AIzaSyB4gmvr3axeqNF483uR8ysRs35xLDmNp0I
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51TQt22CC7HBgo59zwlB2aiHSArnkjECaClmLuvOue47lOA2SSB0rp5y4359pTPxdIcfgZclfAleLWC9twEDoQGGS00Hn6nV2qm
STRIPE_SECRET_KEY=sk_test_51TQt22CC7HBgo59zVUmAZkpRiTEDZYPYzoGGWWm0cp2cX0YFncXLpaSZjiHrJpYpZjLQVopQvBHMixAdPhqYZdMo004soNprqP
STRIPE_WEBHOOK_SECRET=whsec_8aea4f69dcb947c4eda328466380645716d914e0d204dca5c669b645c1a3b639
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_OPENWEATHER_API_KEY=d6a1db58b25f7dd160cecca7a0d2ceb6
GEMINI_API_KEY=AQ.Ab8RN6KZiJI9ako5kmHssE3MS4ozLpDVxFl-3rQj66HVCqnhgQ
