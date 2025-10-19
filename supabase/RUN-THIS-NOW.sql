-- ============================================================
-- QUICK FIX: Run this in Supabase SQL Editor RIGHT NOW
-- ============================================================

-- Step 1: Create SELECT policy (allows reading complaints)
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow users to view own complaints" ON public.complaints;

CREATE POLICY "Allow authenticated users to view all complaints"
ON public.complaints FOR SELECT
TO authenticated
USING (true);

-- Step 2: Test it works
SELECT 
  c.id,
  c.title,
  c.status,
  u.full_name as reporter
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.status = 'in-progress';

-- If you see rows above, SUCCESS! ✅
-- Now restart your React Native app and login as technician

-- ============================================================
-- After running this:
-- 1. Restart Metro bundler: npm start
-- 2. Reload app (shake device -> Reload)
-- 3. Login as: technician@test.com / Test@123
-- 4. You should see all complaints! 🎉
-- ============================================================
