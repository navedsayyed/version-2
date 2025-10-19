-- ============================================================
-- CHECK: What status values exist in complaints?
-- ============================================================

-- See all complaints with their actual status values
SELECT 
  id,
  title,
  status,
  created_at,
  user_id
FROM complaints
ORDER BY created_at DESC;

-- Count by status
SELECT 
  status,
  COUNT(*) as count
FROM complaints
GROUP BY status;

-- Check if status has extra spaces or different capitalization
SELECT 
  DISTINCT 
  status,
  LENGTH(status) as length,
  '"' || status || '"' as status_with_quotes
FROM complaints;

-- ============================================================
-- LIKELY ISSUE:
-- Your complaints probably have status = 'pending' or NULL
-- But the app is filtering for status = 'in-progress'
-- ============================================================

-- FIX: Update all complaints to 'in-progress'
UPDATE complaints 
SET status = 'in-progress' 
WHERE status IS NULL OR status != 'in-progress';

-- Verify the fix
SELECT status, COUNT(*) FROM complaints GROUP BY status;

-- Now test the query app uses
SELECT 
  c.id,
  c.title,
  c.status,
  u.full_name as reporter
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.status = 'in-progress';

-- If you see rows above, it's FIXED! ✅
