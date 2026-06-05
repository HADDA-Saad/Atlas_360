-- 016_assistance_ops.sql
-- Add assigned_team_member and internal_notes to assistance_requests

ALTER TABLE public.assistance_requests
ADD COLUMN IF NOT EXISTS assigned_team_member text,
ADD COLUMN IF NOT EXISTS internal_notes text;
