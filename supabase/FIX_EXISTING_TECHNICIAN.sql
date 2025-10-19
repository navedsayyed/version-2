-- ============================================
-- FIX EXISTING TECHNICIAN LOGIN ISSUE
-- ============================================

-- Problem: Auth account created but profile has issues
-- Solution: Update existing profiles to have correct information

-- Step 1: Check current state of auth users
SELECT 
  id,
  email,
  created_at,
  confirmed_at,
  email_confirmed_at
FROM auth.users
WHERE email IN ('shaikhrayyan@gmail.com', 'technician@test.com')
ORDER BY created_at DESC;

-- Step 2: Check current state of user profiles
SELECT 
  id,
  email,
  full_name,
  phone,
  role,
  department
FROM public.users
WHERE email IN ('shaikhrayyan@gmail.com', 'technician@test.com')
ORDER BY created_at DESC;

-- Step 3: Fix - Update the profile for shaikhrayyan@gmail.com
-- Replace the UUID below with the actual ID from auth.users query above
UPDATE public.users
SET 
  full_name = 'Rayyan Shaikh',
  phone = '+91-XXXXXXXXXX',  -- Replace with actual phone
  role = 'technician',
  department = 'Civil'  -- Replace with correct department
WHERE email = 'shaikhrayyan@gmail.com';

-- Step 4: Verify the fix
SELECT 
  u.email,
  u.full_name,
  u.phone,
  u.role,
  u.department,
  au.email_confirmed_at,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN 'Confirmed ✅'
    ELSE 'Not Confirmed ❌'
  END as email_status
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'shaikhrayyan@gmail.com';

-- ============================================
-- IF LOGIN STILL DOESN'T WORK
-- ============================================

-- Option A: Confirm the email manually (if email confirmation is required)
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'shaikhrayyan@gmail.com';

-- Option B: Check if there are duplicate auth accounts
SELECT 
  id,
  email,
  created_at,
  'Count: ' || COUNT(*) OVER (PARTITION BY email) as duplicate_info
FROM auth.users
WHERE email = 'shaikhrayyan@gmail.com'
ORDER BY created_at DESC;

-- If duplicates exist, delete the older ones (keep the newest):
-- DELETE FROM auth.users 
-- WHERE email = 'shaikhrayyan@gmail.com' 
-- AND id != 'NEWEST_ID_HERE';

-- ============================================
-- RESET PASSWORD (if needed)
-- ============================================

-- If you want to reset the password, use Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Find the user by email
-- 3. Click "..." menu → "Send password reset email"
-- Or manually set a new password hash (advanced):
-- UPDATE auth.users
-- SET encrypted_password = crypt('NEW_PASSWORD', gen_salt('bf'))
-- WHERE email = 'shaikhrayyan@gmail.com';

-- ============================================
-- VERIFICATION CHECKLIST
-- ============================================

-- 1. Auth account exists?
SELECT COUNT(*) as auth_count 
FROM auth.users 
WHERE email = 'shaikhrayyan@gmail.com';
-- Expected: 1

-- 2. Profile exists?
SELECT COUNT(*) as profile_count 
FROM public.users 
WHERE email = 'shaikhrayyan@gmail.com';
-- Expected: 1

-- 3. IDs match?
SELECT 
  au.id as auth_id,
  u.id as profile_id,
  CASE 
    WHEN au.id = u.id THEN 'Match ✅'
    ELSE 'Mismatch ❌'
  END as id_status
FROM auth.users au
FULL OUTER JOIN public.users u ON au.email = u.email
WHERE au.email = 'shaikhrayyan@gmail.com' OR u.email = 'shaikhrayyan@gmail.com';
-- Expected: Match ✅

-- 4. Email confirmed?
SELECT 
  email,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Yes ✅'
    ELSE 'No ❌'
  END as confirmed
FROM auth.users
WHERE email = 'shaikhrayyan@gmail.com';
-- If "No ❌", run Option A above

-- 5. Role is correct?
SELECT 
  email,
  role,
  department
FROM public.users
WHERE email = 'shaikhrayyan@gmail.com';
-- Expected: role='technician', department='Civil' (or your department)
