-- 019_admin_role.sql
-- Add user roles (member, moderator, admin) to profiles

-- Add role column to profiles with check constraint
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin'));

-- Update existing user records to 'admin' if their emails match the administrator accounts
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id AND u.email IN ('jaz.ouchene@gmail.com', 'jazoulizaka@gmail.com', 'jazoulizka@gmail.com', 'admin@atlas360.ma', 'operations@atlas360.com', 'support@atlas360.com');

-- Auto-confirm existing admin user accounts in Supabase Auth to bypass email verification
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email IN ('jaz.ouchene@gmail.com', 'jazoulizaka@gmail.com', 'jazoulizka@gmail.com', 'admin@atlas360.ma', 'operations@atlas360.com', 'support@atlas360.com');

-- Update the new user trigger function to automatically set administrative privileges and auto-confirm email if matching
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role text := 'member';
BEGIN
  IF NEW.email IN ('jaz.ouchene@gmail.com', 'jazoulizaka@gmail.com', 'jazoulizka@gmail.com', 'admin@atlas360.ma', 'operations@atlas360.com', 'support@atlas360.com') THEN
    default_role := 'admin';
    
    -- Auto-confirm email to bypass verification step
    UPDATE auth.users
    SET email_confirmed_at = now()
    WHERE id = NEW.id;
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    default_role
  )
  ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role;

  -- Create a guide profile if metadata dictates it
  IF (NEW.raw_user_meta_data->>'is_guide')::boolean = true THEN
    INSERT INTO public.guides (id, daily_rate_mad)
    VALUES (NEW.id, 0)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
