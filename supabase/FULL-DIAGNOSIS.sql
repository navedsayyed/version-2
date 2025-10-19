-- ============================================================
-- COMPLETE DIAGNOSIS - Run ALL of this and share results
-- ============================================================

-- Query 1: Do complaints exist at all?
SELECT '=== QUERY 1: Total complaints ===' as info;
SELECT COUNT(*) as total_complaints FROM complaints;

-- Query 2: What are the actual status values?
SELECT '=== QUERY 2: Status values ===' as info;
SELECT 
  status,
  COUNT(*) as count,
  LENGTH(status) as length,
  ASCII(SUBSTRING(status, 1, 1)) as first_char_ascii
FROM complaints
GROUP BY status;

-- Query 3: See the actual raw data
SELECT '=== QUERY 3: Raw complaints data ===' as info;
SELECT 
  id,
  title,
  status,
  type,
  user_id,
  created_at
FROM complaints
ORDER BY created_at DESC
LIMIT 10;

-- Query 4: Check if user_id matches users table
SELECT '=== QUERY 4: Check user_id relationship ===' as info;
SELECT 
  c.id as complaint_id,
  c.title,
  c.user_id as complaint_user_id,
  u.id as actual_user_id,
  u.full_name as user_name,
  CASE 
    WHEN u.id IS NULL THEN '❌ USER NOT FOUND'
    ELSE '✅ USER EXISTS'
  END as user_exists
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id;

-- Query 5: Test with NO status filter
SELECT '=== QUERY 5: All complaints without status filter ===' as info;
SELECT 
  c.id,
  c.title,
  c.status,
  c.type,
  u.full_name as reporter
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
ORDER BY c.created_at DESC;

-- Query 6: Test exact query app uses WITH status filter
SELECT '=== QUERY 6: With in-progress filter (what app uses) ===' as info;
SELECT 
  c.id,
  c.title,
  c.status,
  u.full_name as reporter
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.status = 'in-progress'
ORDER BY c.created_at DESC;

-- ============================================================
-- COPY ALL RESULTS AND SHARE THEM!
-- This will show us exactly what's wrong
-- ============================================================
