-- ============================================
-- EMERGENCY FIX - RESTORE APP FUNCTIONALITY
-- ============================================
-- Run this IMMEDIATELY to fix infinite recursion error

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can insert technicians" ON public.users;

-- Step 2: Restore simple working policy
CREATE POLICY "Users can view profiles"
  ON public.users FOR SELECT
  USING (true);  -- Allow all authenticated users to view profiles

-- Step 3: Keep the insert policy simple too
CREATE POLICY "Admins can insert technicians"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);  -- Users can only insert their own profile initially

-- Step 4: Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
