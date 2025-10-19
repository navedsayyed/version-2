-- ============================================================
-- DIAGNOSE TECHNICIAN LOGIN ISSUE
-- ============================================================
-- Check what's happening with the technician user
-- ============================================================

-- STEP 1: Check the user profile data
SELECT 
  id, 
  email, 
  full_name, 
  role,
  length(role) as role_length,
  ascii(substring(role from 1 for 1)) as first_char_ascii,
  created_at
FROM public.users 
WHERE email = 'technician@test.com';

-- Expected:
-- role: technician (exactly, no extra spaces)
-- role_length: 10

-- STEP 2: Check if there are any whitespace issues
SELECT 
  email,
  role,
  CASE 
    WHEN role = 'technician' THEN 'Exact match ✅'
    WHEN trim(role) = 'technician' THEN 'Has whitespace (needs trim)'
    ELSE 'Different value: ' || role
  END as role_check
FROM public.users 
WHERE email = 'technician@test.com';

-- STEP 3: Fix any whitespace or case issues
UPDATE public.users 
SET role = trim(lower(role))
WHERE email = 'technician@test.com'
AND role != 'technician';

-- STEP 4: Force set to 'technician' (guaranteed fix)
UPDATE public.users 
SET role = 'technician'
WHERE email = 'technician@test.com';

-- STEP 5: Verify the fix
SELECT id, email, full_name, role 
FROM public.users 
WHERE email = 'technician@test.com';

-- Should show: role = technician (exactly)

-- ============================================================
-- STEP 6: Check auth user status
-- ============================================================
SELECT 
  id, 
  email, 
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed ✅'
    ELSE 'Not confirmed ❌'
  END as confirmation_status
FROM auth.users 
WHERE email = 'technician@test.com';

-- email_confirmed_at must have a date for login to work

-- ============================================================
-- CLEANUP: If you want to start fresh
-- ============================================================

-- Uncomment these if you want to delete and recreate:

-- Delete from public.users
-- DELETE FROM public.users WHERE email = 'technician@test.com';

-- Then delete from auth.users via Dashboard:
-- Authentication → Users → Find user → Delete

-- Then recreate using the setup guide

-- ============================================================
-- SUMMARY
-- ============================================================
-- After running this:
-- 1. role should be exactly 'technician' (no spaces, lowercase)
-- 2. email_confirmed_at should have a date
-- 3. Try logging in again
-- 4. Should navigate to TechnicianDashboard ✅
-- ============================================================
