-- Alter user_tier enum to add concierge
ALTER TYPE user_tier ADD VALUE IF NOT EXISTS 'concierge';
