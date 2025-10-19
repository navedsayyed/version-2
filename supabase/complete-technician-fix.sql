-- ============================================================
-- COMPLETE FIX: Technician Dashboard Shows Real Complaints
-- ============================================================
-- Run ALL of these in order
-- ============================================================

-- STEP 1: Create SELECT policy for complaints table
-- ============================================================

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow users to view own complaints" ON public.complaints;

-- Create policy allowing ALL authenticated users to read ALL complaints
CREATE POLICY "Allow authenticated users to view all complaints"
ON public.complaints FOR SELECT
TO authenticated
USING (true);

-- ============================================================
-- STEP 2: Verify complaints exist in database
-- ============================================================

-- Check how many complaints exist
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
FROM complaints;

-- Expected: Should show at least 1 in-progress complaint

-- ============================================================
-- STEP 3: Test the exact query the app uses
-- ============================================================

SELECT 
  c.id,
  c.title,
  c.type,
  c.description,
  c.location,
  c.place,
  c.status,
  c.created_at,
  u.full_name as reporter_name,
  u.email as reporter_email,
  ci.url as image_url
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN complaint_images ci ON c.id = ci.complaint_id
WHERE c.status = 'in-progress'
ORDER BY c.created_at DESC;

-- If this returns rows, your app should show them!

-- ============================================================
-- STEP 4: Check RLS status
-- ============================================================

-- Check if RLS is enabled on complaints
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'complaints';

-- Check all policies on complaints
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'complaints';

-- ============================================================
-- STEP 5 (OPTIONAL): If still not working, disable RLS
-- ============================================================

-- Uncomment this if SELECT policy still doesn't work:
-- ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- SUCCESS INDICATORS
-- ============================================================
-- After running this, you should see:
-- 1. SELECT policy created ✅
-- 2. Test query returns complaint rows ✅
-- 3. App shows real complaints (not dummy data) ✅
-- ============================================================
