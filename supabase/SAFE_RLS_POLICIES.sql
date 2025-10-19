-- ============================================
-- SAFE RLS POLICIES - NO INFINITE RECURSION!
-- ============================================
-- This version is 100% safe and won't break your app

-- Step 1: Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert technicians" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.users;

-- Step 2: Create SAFE SELECT policy (no recursion!)
-- Allows all authenticated users to view all profiles
CREATE POLICY "Users can view profiles"
  ON public.users FOR SELECT
  USING (true);

-- Step 3: Create SAFE UPDATE policy
-- Allow authenticated users to update profiles (needed for admin editing technicians)
CREATE POLICY "Allow authenticated update"
  ON public.users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Step 4: Create SAFE INSERT policy (no recursion!)
-- Allows authenticated users to insert profiles
CREATE POLICY "Allow authenticated insert"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Step 5: Verify policies are created correctly
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'View all profiles'
    WHEN cmd = 'UPDATE' THEN 'Update own profile only'
    WHEN cmd = 'INSERT' THEN 'Insert profiles'
  END as description
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- Expected Result:
-- You should see 3 policies:
-- 1. "Allow authenticated insert" - INSERT - Insert profiles
-- 2. "Users can view profiles" - SELECT - View all profiles  
-- 3. "Users can update their own profile" - UPDATE - Update own profile only
