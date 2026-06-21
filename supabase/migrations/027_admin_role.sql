-- 027_admin_role.sql
-- Add role column to profiles and switch admin auth from hardcoded emails to DB role

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member'
  CHECK (role IN ('member', 'moderator', 'admin'));

-- Promote existing admin accounts
UPDATE public.profiles p SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id
  AND u.email IN ('jaz.ouchene@gmail.com', 'jazoulizaka@gmail.com', 'jazoulizka@gmail.com', 'saadhad08@gmail.com');

-- Auto-confirm those admin accounts
UPDATE auth.users SET email_confirmed_at = now()
WHERE email IN ('jaz.ouchene@gmail.com', 'jazoulizaka@gmail.com', 'jazoulizka@gmail.com', 'saadhad08@gmail.com')
  AND email_confirmed_at IS NULL;

-- Update the new-user trigger: preserve guide creation from 017, add role handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE default_role text := 'member';
BEGIN
  IF NEW.email IN ('jaz.ouchene@gmail.com', 'jazoulizaka@gmail.com', 'jazoulizka@gmail.com', 'saadhad08@gmail.com') THEN
    default_role := 'admin';
    UPDATE auth.users SET email_confirmed_at = now() WHERE id = NEW.id;
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', default_role)
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

  IF (NEW.raw_user_meta_data->>'is_guide')::boolean = true THEN
    INSERT INTO public.guides (id, daily_rate_mad) VALUES (NEW.id, 0)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Extend the profile-guard trigger to also protect the role column
CREATE OR REPLACE FUNCTION public.prevent_client_subscription_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.tier IS DISTINCT FROM OLD.tier
    OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
    OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
    OR NEW.role IS DISTINCT FROM OLD.role
  THEN
    RAISE EXCEPTION 'Protected profile fields can only be updated by trusted server code.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;
