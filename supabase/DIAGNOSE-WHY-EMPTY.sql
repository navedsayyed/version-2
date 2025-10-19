-- ============================================================
-- DIAGNOSE: Why is Technician Dashboard Still Empty?
-- ============================================================
-- Run each query and share the results
-- ============================================================

-- Query 1: Check if complaints exist
SELECT COUNT(*) as total_complaints FROM complaints;
-- Expected: Should be > 0

-- Query 2: Check in-progress complaints
SELECT COUNT(*) as in_progress_complaints 
FROM complaints 
WHERE status = 'in-progress';
-- Expected: Should be > 0

-- Query 3: See actual complaint data
SELECT 
  id,
  title,
  status,
  user_id,
  created_at
FROM complaints
ORDER BY created_at DESC
LIMIT 5;
-- Expected: Should show your complaints

-- Query 4: Test the EXACT query your app uses
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
-- Expected: Should show complaints with user info

-- Query 5: Check if users table has data
SELECT id, email, full_name, role FROM users;
-- Expected: Should show both user and technician accounts

-- Query 6: Verify policies are active
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
-- Expected: Should show SELECT policy

-- ============================================================
-- SHARE RESULTS
-- ============================================================
-- Copy and paste the results of each query above
-- This will help diagnose the exact issue
-- ============================================================
