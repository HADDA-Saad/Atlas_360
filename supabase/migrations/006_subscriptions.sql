-- 006_subscriptions.sql
-- Add Stripe and subscription fields to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id varchar,
ADD COLUMN IF NOT EXISTS subscription_status varchar;
