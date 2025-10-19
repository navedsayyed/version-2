-- ============================================================
-- COMPLETE FIX: Show Complaints in Technician Dashboard
-- ============================================================
-- Run each section and check results
-- ============================================================

-- STEP 1: Check what status values currently exist
-- ============================================================
SELECT 
  '=== CURRENT STATUS VALUES ===' as info,
  status,
  COUNT(*) as count,
  LENGTH(status) as status_length,
  '"' || status || '"' as status_quoted
FROM complaints
GROUP BY status;

-- What you might see:
-- "pending" instead of "in-progress"
-- Extra spaces like " in-progress "
-- NULL values
-- Different spelling

-- STEP 2: See ALL complaints with their details
-- ============================================================
SELECT 
  '=== ALL COMPLAINTS ===' as info,
  id,
  title,
  status,
  created_at,
  user_id
FROM complaints
ORDER BY created_at DESC;

-- STEP 3: Fix the status values
-- ============================================================
-- This updates ALL complaints to 'in-progress' status
UPDATE complaints 
SET status = 'in-progress'
WHERE status != 'in-progress' OR status IS NULL;

-- Check how many were updated
SELECT 
  '=== UPDATE RESULT ===' as info,
  COUNT(*) as total_complaints,
  COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_count
FROM complaints;

-- STEP 4: Verify the query that app uses now returns data
-- ============================================================
SELECT 
  '=== TEST APP QUERY ===' as info,
  c.id,
  c.title,
  c.type,
  c.status,
  u.full_name as reporter_name,
  ci.url as image_url
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN complaint_images ci ON c.id = ci.complaint_id
WHERE c.status = 'in-progress'
ORDER BY c.created_at DESC;

-- If you see rows here, SUCCESS! ✅
-- The technician dashboard will now show these complaints

-- ============================================================
-- FINAL STEPS:
-- ============================================================
-- 1. After running this SQL, complaints should now have status='in-progress'
-- 2. Reload your React Native app (shake device -> Reload)
-- 3. Login as technician@test.com / Test@123
-- 4. Should see all complaints! 🎉
-- ============================================================
