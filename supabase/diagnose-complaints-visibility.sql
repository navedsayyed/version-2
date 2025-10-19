-- ============================================================
-- DIAGNOSE: Why Technician Can't See Complaints
-- ============================================================

-- STEP 1: Check if complaints exist in database
SELECT 
  id,
  title,
  status,
  user_id,
  created_at
FROM complaints
ORDER BY created_at DESC
LIMIT 10;

-- Expected: Should see complaints you created as user

-- STEP 2: Check specifically for in-progress complaints
SELECT 
  COUNT(*) as total_complaints,
  COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
FROM complaints;

-- Expected: Should show at least some in-progress complaints

-- STEP 3: Check RLS status on complaints table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'complaints';

-- If rowsecurity = t (true), RLS is enabled
-- This might block technicians from reading complaints!

-- STEP 4: Check what RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'complaints';

-- STEP 5: Check a specific complaint with all its data
SELECT 
  c.id,
  c.title,
  c.type,
  c.status,
  c.location,
  c.place,
  c.description,
  c.created_at,
  u.full_name as reporter_name,
  u.email as reporter_email,
  ci.url as image_url
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN complaint_images ci ON c.id = ci.complaint_id
WHERE c.status = 'in-progress'
ORDER BY c.created_at DESC
LIMIT 5;

-- This is the EXACT query the app uses
-- If this returns data, the app should show it

-- ============================================================
-- FIX 1: Disable RLS on complaints (if blocking reads)
-- ============================================================

-- If RLS is blocking, temporarily disable it for testing:
-- ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;

-- Or create a policy that allows technicians to read all complaints:
-- CREATE POLICY "Technicians can view all complaints"
-- ON public.complaints FOR SELECT
-- TO authenticated
-- USING (true);

-- ============================================================
-- FIX 2: Check if SELECT policies exist
-- ============================================================

-- List all SELECT policies on complaints table
SELECT policyname, cmd, using
FROM pg_policies
WHERE tablename = 'complaints' AND cmd = 'SELECT';

-- If no SELECT policies exist and RLS is enabled, 
-- NO ONE can read complaints!

-- ============================================================
-- RECOMMENDED FIX: Create proper SELECT policy
-- ============================================================

-- Allow all authenticated users to read all complaints
CREATE POLICY "Allow authenticated users to view all complaints"
ON public.complaints FOR SELECT
TO authenticated
USING (true);

-- Verify it was created
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'complaints' AND cmd = 'SELECT';

-- ============================================================
-- VERIFY THE FIX
-- ============================================================

-- Test the same query the app uses
SELECT 
  c.*,
  u.full_name,
  u.email,
  ci.url
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN complaint_images ci ON c.id = ci.complaint_id
WHERE c.status = 'in-progress'
ORDER BY c.created_at DESC;

-- If this returns data, technician should see complaints in app! ✅

-- ============================================================
-- SUMMARY
-- ============================================================
-- Common issues:
-- 1. RLS enabled but no SELECT policy → Nobody can read
-- 2. SELECT policy only allows user_id = auth.uid() → Only own complaints
-- 3. No complaints with status 'in-progress' → Nothing to show
--
-- Solution: Create SELECT policy that allows authenticated users 
-- to read all complaints (not just their own)
-- ============================================================
