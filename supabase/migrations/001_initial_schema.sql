-- Atlas 360 — Initial Database Schema
-- Creates itineraries and locations tables with RLS policies

-- ============================================
-- Table: itineraries
-- ============================================
CREATE TABLE IF NOT EXISTS itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  region text,
  duration_days integer,
  cover_image_url text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- Table: locations
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  lat float8 NOT NULL,
  lng float8 NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_locations_itinerary_id ON locations(itinerary_id);
CREATE INDEX idx_locations_order_index ON locations(order_index);

-- ============================================
-- Row Level Security
-- ============================================

-- Enable RLS on both tables
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Allow public (anonymous) read access on itineraries
CREATE POLICY "Allow public read access" ON itineraries
  FOR SELECT
  USING (true);

-- Allow public (anonymous) read access on locations
CREATE POLICY "Allow public read access" ON locations
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert itineraries
CREATE POLICY "Allow authenticated insert" ON itineraries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to insert locations
CREATE POLICY "Allow authenticated insert" ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
