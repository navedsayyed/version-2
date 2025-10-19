-- ============================================================
-- QUICK FIX: Allow Technicians to See All Complaints
-- ============================================================
-- This creates a SELECT policy so technicians can view all complaints
-- ============================================================

-- OPTION 1: Create SELECT policy for all authenticated users (RECOMMENDED)
-- ============================================================

-- Drop existing restrictive SELECT policy if exists
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow users to view own complaints" ON public.complaints;

-- Create new policy allowing all authenticated users to read all complaints
CREATE POLICY "Allow authenticated users to view all complaints"
ON public.complaints FOR SELECT
TO authenticated
USING (true);

-- ============================================================
-- OPTION 2: Disable RLS entirely (SIMPLE but less secure)
-- ============================================================

-- Uncomment this if you want the simplest solution:
-- ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFY
-- ============================================================

-- Check policies
SELECT policyname, cmd, qual as using_clause
FROM pg_policies
WHERE tablename = 'complaints';

-- Test query (same as app uses)
SELECT 
  c.id,
  c.title,
  c.status,
  c.created_at,
  u.full_name as reporter,
  ci.url as image
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN complaint_images ci ON c.id = ci.complaint_id
WHERE c.status = 'in-progress'
ORDER BY c.created_at DESC;

-- If this returns data, technician will see complaints in app! ✅

-- ============================================================
-- SUCCESS!
-- ============================================================
-- After running this:
-- 1. Restart your React Native app
-- 2. Login as technician
-- 3. Should see all user complaints! ✅
-- ============================================================
