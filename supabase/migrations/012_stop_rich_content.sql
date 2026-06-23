-- Migration 012: Rich stop content
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS rich_description text,
  ADD COLUMN IF NOT EXISTS photo_urls       text[] DEFAULT '{}';
