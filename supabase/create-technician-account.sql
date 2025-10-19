-- ============================================================
-- CREATE TECHNICIAN TEST ACCOUNT
-- ============================================================
-- This creates a technician user for testing
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Create Auth User (Technician)
-- ============================================================
-- Note: You need to create the auth user via Supabase Dashboard first,
-- then run this SQL to set their role to 'technician'

-- After creating auth user in Dashboard, get their UUID and insert into users table:
-- Replace 'USER_UUID_HERE' with the actual UUID from auth.users

-- Example (update the UUID after creating auth user):
-- INSERT INTO public.users (id, email, full_name, role, phone)
-- VALUES (
--   'USER_UUID_HERE',  -- Replace with actual UUID from Dashboard
--   'technician@test.com',
--   'Test Technician',
--   'technician',
--   '1234567890'
-- );

-- ============================================================
-- STEP 2: Create Technician via Dashboard (EASIER METHOD)
-- ============================================================
-- 1. Go to: Authentication → Users
--    https://app.supabase.com/project/oeazkkxhvmmthysjdklk/auth/users
--
-- 2. Click "Add user" → "Create new user"
--
-- 3. Fill in:
--    Email: technician@test.com
--    Password: Test@123
--    Auto Confirm User: YES (toggle ON)
--
-- 4. Click "Create user"
--
-- 5. Copy the user UUID from the users list
--
-- 6. Run this SQL (replace UUID):

-- INSERT INTO public.users (id, email, full_name, role, phone)
-- VALUES (
--   'PASTE_USER_UUID_HERE',
--   'technician@test.com',
--   'Test Technician',
--   'technician',
--   '1234567890'
-- );

-- ============================================================
-- VERIFY
-- ============================================================

-- Check if technician user exists in auth
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'technician@test.com';

-- Check if technician profile exists
SELECT id, email, full_name, role 
FROM public.users 
WHERE email = 'technician@test.com';

-- ============================================================
-- TECHNICIAN LOGIN CREDENTIALS
-- ============================================================
-- Email: technician@test.com
-- Password: Test@123
-- Role: technician
-- ============================================================

-- ============================================================
-- ALTERNATIVE: Manual SQL Insert (Advanced)
-- ============================================================
-- If you want to create via SQL only (requires knowing password hash):

-- Note: This is complex because auth.users is managed by Supabase Auth
-- It's MUCH easier to use the Dashboard method above!

-- If you still want SQL method, you need to:
-- 1. Generate password hash
-- 2. Insert into auth.users
-- 3. Insert into public.users

-- Example (don't use this directly - use Dashboard instead):
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'technician@test.com',
--   crypt('Test@123', gen_salt('bf')),
--   now(),
--   now(),
--   now()
-- )
-- RETURNING id;

-- ============================================================
-- CLEANUP (if you want to delete and recreate)
-- ============================================================

-- Delete from public.users
-- DELETE FROM public.users WHERE email = 'technician@test.com';

-- Delete from auth.users (do this in Dashboard -> Authentication -> Users)

-- ============================================================
-- SUMMARY
-- ============================================================
-- Use Dashboard to create technician user:
-- 1. Auth → Users → Add user
-- 2. Email: technician@test.com
-- 3. Password: Test@123
-- 4. Auto Confirm: YES
-- 5. Copy UUID
-- 6. Run INSERT into public.users with that UUID
-- ============================================================
