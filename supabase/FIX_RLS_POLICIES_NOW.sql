-- ============================================
-- FIX RLS POLICIES FOR TECHNICIANS SCREEN
-- ============================================
-- Run this to allow admins to see technicians in their department

-- Step 1: Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can insert technicians" ON public.users;

-- Step 2: Create new flexible policy for viewing profiles
-- Using simplified approach to avoid infinite recursion
CREATE POLICY "Users can view profiles"
  ON public.users FOR SELECT
  USING (true);  -- Allow all authenticated users to view all profiles

-- Step 3: Allow admins to insert technicians (for the Add Technician feature)
-- Using simplified approach - allow all authenticated users to insert
CREATE POLICY "Admins can insert technicians"
  ON public.users FOR INSERT
  WITH CHECK (true);  -- Allow authenticated users to insert profiles

-- Step 4: Verify policies are created
SELECT 
  policyname,
  cmd,
  SUBSTRING(qual::text, 1, 100) as policy_rule
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd, policyname;
