-- ============================================================
-- TECHNICIAN ALREADY EXISTS - Verify and Update
-- ============================================================
-- The error means the user already exists
-- Let's check and fix it
-- ============================================================

-- STEP 1: Check if user exists and what role they have
SELECT id, email, full_name, role, phone, created_at 
FROM public.users 
WHERE id = '1588362d-0609-43b0-911b-3dd079c8b20d';

-- STEP 2: If role is NOT 'technician', update it
UPDATE public.users 
SET 
  role = 'technician',
  full_name = 'Test Technician',
  phone = '1234567890'
WHERE id = '1588362d-0609-43b0-911b-3dd079c8b20d';

-- STEP 3: Verify the update worked
SELECT id, email, full_name, role 
FROM public.users 
WHERE id = '1588362d-0609-43b0-911b-3dd079c8b20d';

-- Expected result:
-- id: 1588362d-0609-43b0-911b-3dd079c8b20d
-- email: technician@test.com
-- full_name: Test Technician
-- role: technician ✅

-- ============================================================
-- STEP 4: Check auth user is confirmed
-- ============================================================
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'technician@test.com';

-- email_confirmed_at should have a date (not null)
-- If it's null, the user can't login!

-- ============================================================
-- ALL DONE!
-- ============================================================
-- Now try logging in with:
-- Email: technician@test.com
-- Password: Test@123
-- ============================================================
