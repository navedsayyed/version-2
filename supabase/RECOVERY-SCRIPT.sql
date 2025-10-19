-- ============================================================
-- QUICK RECOVERY: Start Fresh After Data Loss
-- ============================================================

-- STEP 1: Disable RLS so new complaints can be inserted
ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;

-- STEP 2: Check what users exist now
SELECT 
  '=== Current Users ===' as info,
  id,
  email,
  full_name,
  role
FROM public.users
ORDER BY created_at DESC;

-- STEP 3: Check technician account still exists
SELECT 
  '=== Technician Account ===' as info,
  id,
  email,
  full_name,
  role
FROM public.users
WHERE email = 'technician@test.com';

-- If technician doesn't exist, create it:
-- (Only run this if above query returns 0 rows)
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  phone,
  created_at,
  updated_at
) VALUES (
  '8f4dfd5c-5352-4078-aa48-535183180509',
  'technician@test.com',
  'Test Technician',
  'technician',
  '1234567890',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- STEP 4: Verify complaints table is empty (as expected)
SELECT 
  '=== Complaints Count ===' as info,
  COUNT(*) as total
FROM complaints;

-- STEP 5: Remove CASCADE to prevent future data loss
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users
ADD CONSTRAINT users_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE RESTRICT;

-- STEP 6: Do the same for complaints table
ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_user_id_fkey;
ALTER TABLE public.complaints
ADD CONSTRAINT complaints_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE RESTRICT;

-- STEP 7: Verify constraints are updated
SELECT 
  '=== Foreign Key Constraints ===' as info,
  conname as constraint_name,
  conrelid::regclass as table_name,
  confdeltype as on_delete_action
FROM pg_constraint
WHERE contype = 'f' 
AND conrelid::regclass::text IN ('users', 'complaints')
ORDER BY conrelid;

-- Legend for on_delete_action:
-- 'c' = CASCADE (bad - auto-deletes)
-- 'r' = RESTRICT (good - prevents deletion)
-- 'a' = NO ACTION
-- 'n' = SET NULL

-- ============================================================
-- AFTER RUNNING THIS:
-- 1. Go to your app
-- 2. Sign up as new user (email: user@test.com, password: Test@123)
-- 3. Submit a new complaint with photo
-- 4. Login as technician (technician@test.com / Test@123)
-- 5. Check "Assigned Work" - should show the complaint!
-- ============================================================
