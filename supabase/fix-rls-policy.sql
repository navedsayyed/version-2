-- ============================================================
-- FIX RLS POLICY FOR COMPLAINTS INSERT
-- ============================================================
-- Run this in Supabase SQL Editor if complaints still fail to insert
-- This ensures users can insert their own complaints
-- ============================================================

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can create their own complaints" ON public.complaints;

-- Create new INSERT policy with better logic
CREATE POLICY "Users can create their own complaints"
  ON public.complaints 
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'complaints' AND cmd = 'INSERT';

-- ============================================================
-- TEST THE POLICY
-- ============================================================
-- You can test by trying to insert a complaint:
-- (Replace the UUID with your actual user ID from auth.users)

-- INSERT INTO public.complaints (user_id, title, type, description, location, place, status)
-- VALUES (
--   auth.uid(),
--   'Test Complaint',
--   'electrical',
--   'Test description',
--   'Building A',
--   'Room 101',
--   'in-progress'
-- );

-- ============================================================
-- ALTERNATIVE: Temporarily Disable RLS (NOT RECOMMENDED FOR PRODUCTION)
-- ============================================================
-- Only use this for testing if the above doesn't work
-- Remember to re-enable RLS after fixing the issue!

-- ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DEBUG: Check Current User
-- ============================================================
-- Run this to see what user is currently authenticated:
-- SELECT auth.uid(), auth.email();
