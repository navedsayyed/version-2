-- ============================================================
-- QUICK TEST: Copy Results and Share
-- ============================================================

-- TEST 1: Do complaints exist?
SELECT 'TEST 1: Total Complaints' as test;
SELECT COUNT(*) as count FROM complaints;

-- TEST 2: Are they in-progress?
SELECT 'TEST 2: In-Progress Complaints' as test;
SELECT COUNT(*) as count FROM complaints WHERE status = 'in-progress';

-- TEST 3: What statuses exist?
SELECT 'TEST 3: Status Breakdown' as test;
SELECT status, COUNT(*) as count 
FROM complaints 
GROUP BY status;

-- TEST 4: Can we see the data with JOIN?
SELECT 'TEST 4: Complaints with User Info' as test;
SELECT 
  c.id,
  c.title,
  c.status,
  c.created_at,
  u.full_name as reporter_name,
  u.email as reporter_email
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.status = 'in-progress'
ORDER BY c.created_at DESC;

-- TEST 5: Are policies correct?
SELECT 'TEST 5: RLS Policies' as test;
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'complaints';

-- ============================================================
-- COPY ALL RESULTS ABOVE AND SHARE
-- This will tell us exactly what's wrong!
-- ============================================================
