# Environment Setup & API Configuration Guide

This guide provides step-by-step instructions on how to set up the necessary API keys and configuration values in your `.env.local` file for **Atlas 360** (excluding Supabase configurations).

---

## Quick Reference Template

Copy this template into your `.env.local` file at the root of the `atlas-360` directory and fill in your keys:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Configuration (Payment & Subscriptions)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (Optional - Dynamic fallback prices are used if empty)
STRIPE_NOMAD_PRICE_ID=price_...
STRIPE_NOMAD_YEARLY_PRICE_ID=price_...
STRIPE_ELITE_PRICE_ID=price_...
STRIPE_ELITE_YEARLY_PRICE_ID=price_...
STRIPE_CONCIERGE_PRICE_ID=price_...
STRIPE_CONCIERGE_YEARLY_PRICE_ID=price_...

# Google Maps Platform Configuration
PLACES_API_KEY=AIzaSy...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
NEXT_PUBLIC_GOOGLE_MAP_ID=...

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash
```

---

## 1. Stripe Setup (Payments & Subscriptions)

Stripe is used to handle subscription payments for the *Nomad*, *Elite*, and *Concierge* plans, as well as holding guide bookings in séquestre (escrow).

> [!NOTE]
> All keys should be set up using Stripe's **Test Mode** during local development to avoid real financial transactions.

### A. Retrieve API Keys
1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/).
2. Toggle **Test mode** in the top-right corner.
3. Navigate to **Developers** > **API keys**.
4. Copy the **Publishable key** and assign it to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
5. Reveal and copy the **Secret key** and assign it to `STRIPE_SECRET_KEY`.

### B. Configure Stripe Webhook Secret (Required for subscription upgrades)
To receive payment updates, you must set up a local webhook tunnel using the Stripe CLI:
1. Download and install the [Stripe CLI](https://docs.stripe.com/stripe-cli).
2. Open a terminal and log in to your account:
   ```bash
   stripe login
   ```
3. Start forwarding events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the printed webhook signing secret (it begins with `whsec_...`) and assign it to `STRIPE_WEBHOOK_SECRET`.

### C. Create Pricing Products & Price IDs (Optional)
If you want to bind subscriptions to custom Stripe products:
1. In the Stripe dashboard, go to **Product Catalog** > **Add Product**.
2. Create three subscription products:
   - **Nomad**: Set price to `99 MAD` recurring monthly, and `990 MAD` recurring yearly.
   - **Elite**: Set price to `199 MAD` recurring monthly, and `1990 MAD` recurring yearly.
   - **Concierge**: Set price to `1000 MAD` recurring monthly, and `10000 MAD` recurring yearly.
3. Copy the individual **Price IDs** (starting with `price_...`) and fill in the corresponding variables:
   - `STRIPE_NOMAD_PRICE_ID` / `STRIPE_NOMAD_YEARLY_PRICE_ID`
   - `STRIPE_ELITE_PRICE_ID` / `STRIPE_ELITE_YEARLY_PRICE_ID`
   - `STRIPE_CONCIERGE_PRICE_ID` / `STRIPE_CONCIERGE_YEARLY_PRICE_ID`

---

## 2. Google Maps Platform Setup

Google Maps Platform APIs are used to render interactive maps, locate tourist stops, provide search autocomplete/recommendations, and display 360-degree Street View panoramas.

### A. Enable APIs in Google Cloud
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Navigate to **APIs & Services** > **Library** and search for and enable the following APIs:
   - **Maps JavaScript API** (Renders client-side maps)
   - **Places API (New)** (Powering the itinerary location searches & info tabs)
   - **Street View Static API** (To serve 360° panoramas)
   - **Geocoding API** (Converts coordinate locations into addresses)

### B. Generate API Keys
1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **API Key**.
3. Create two keys for safety and access control:
   - **Public Key** (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`): Used in the client React code. Restrict this key to your domain referrers (e.g., `http://localhost:3000/*` and production URLs).
   - **Server Key** (`PLACES_API_KEY`): Used inside server routes (Next.js backend) to perform Place searches. Restrict this key by IP address (optional) but keep it secure.
   
   *Note: If developing locally, you can use the same key for both variables during initial setup.*

### C. Generate a Map ID (Required for Advanced Markers)
The map interface uses Google Cloud Advanced Markers to style custom markers:
1. In the Google Cloud Console, go to **Google Maps Platform** > **Map Management**.
2. Click **Create Map ID**.
3. Set the **Map Name** (e.g., "Atlas 360 Map").
4. Select **JavaScript** as the API, and choose **Vector** as the Map Type (Advanced Markers require a Vector map style).
5. Click **Save** and copy the generated **Map ID** string.
6. Assign it to `NEXT_PUBLIC_GOOGLE_MAP_ID`.

---

## 3. Gemini AI Setup (Itinerary Generator)

The AI itinerary builder uses Google Gemini to generate custom daily travel schedules for Elite and Concierge users.

### A. Obtain API Key
1. Sign in to [Google AI Studio](https://aistudio.google.com/).
2. Click **Create API Key** in the left sidebar.
3. Click **Create API Key in new project** or bind to an existing Google Cloud project.
4. Copy the generated key and assign it to `GEMINI_API_KEY`.

### B. Model Selection
- Set `GEMINI_MODEL` to a supported Gemini model name:
  - `gemini-1.5-flash` (Recommended: fast and lightweight)
  - `gemini-2.5-flash` (Modern: improved structured outputs)
  - `gemini-3.1-flash-lite` (Default: structured JSON mode support)

---

## 4. Local App URL

- `NEXT_PUBLIC_APP_URL`: Set this to `http://localhost:3000` during local development so that Stripe and Auth callbacks redirect back to your local port. When deploying, update this to your production domain (e.g., `https://atlas360.ma`).
