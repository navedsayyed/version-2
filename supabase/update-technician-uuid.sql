-- ============================================================
-- UPDATE TECHNICIAN USER WITH CORRECT UUID
-- ============================================================
-- Correct UUID: 8f4dfd5c-5352-4078-aa48-535183180509
-- ============================================================

-- STEP 1: Check if old user exists
SELECT id, email, full_name, role 
FROM public.users 
WHERE id = '1588362d-0609-43b0-911b-3dd079c8b20d';

-- STEP 2: Delete old incorrect user (if exists)
DELETE FROM public.users 
WHERE id = '1588362d-0609-43b0-911b-3dd079c8b20d';

-- STEP 3: Check if correct user already exists
SELECT id, email, full_name, role 
FROM public.users 
WHERE id = '8f4dfd5c-5352-4078-aa48-535183180509';

-- STEP 4: Insert or update with correct UUID
INSERT INTO public.users (id, email, full_name, role, phone)
VALUES (
  '8f4dfd5c-5352-4078-aa48-535183180509',
  'technician@test.com',
  'Test Technician',
  'technician',
  '1234567890'
)
ON CONFLICT (id) DO UPDATE 
SET 
  email = 'technician@test.com',
  full_name = 'Test Technician',
  role = 'technician',
  phone = '1234567890';

-- STEP 5: Verify it worked
SELECT id, email, full_name, role 
FROM public.users 
WHERE id = '8f4dfd5c-5352-4078-aa48-535183180509';

-- Expected:
-- id: 8f4dfd5c-5352-4078-aa48-535183180509
-- email: technician@test.com
-- full_name: Test Technician
-- role: technician ✅

-- STEP 6: Verify auth user exists
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE id = '8f4dfd5c-5352-4078-aa48-535183180509';

-- Expected:
-- id: 8f4dfd5c-5352-4078-aa48-535183180509
-- email: technician@test.com
-- email_confirmed_at: (some date - not null) ✅

-- ============================================================
-- ALL DONE!
-- ============================================================
-- Now login with:
-- Email: technician@test.com
-- Password: Test@123
-- Should navigate to TechnicianDashboard ✅
-- ============================================================
