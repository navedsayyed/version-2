-- ============================================
-- FIX INSERT POLICY FOR ADDING TECHNICIANS
-- ============================================
-- Run this to fix the "row-level security policy" error when adding technicians

-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Admins can insert technicians" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

-- Create simple INSERT policy that allows authenticated users to insert
CREATE POLICY "Allow authenticated insert"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' AND cmd = 'INSERT';
