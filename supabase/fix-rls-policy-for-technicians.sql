-- CHECK AND FIX RLS POLICIES FOR TECHNICIANS SCREEN
-- This will allow admins to see technicians in their department

-- 1. First, check existing policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- 2. Drop old restrictive policy if exists
DROP POLICY IF EXISTS "Admins can view users in their department" ON public.users;

-- 3. Create new policy to allow admins to view technicians in their department
CREATE POLICY "Admins can view users in their department"
ON public.users
FOR SELECT
TO authenticated
USING (
  -- Users can see their own profile
  auth.uid() = id
  OR
  -- Admins can see technicians in their department
  (
    EXISTS (
      SELECT 1 FROM public.users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'
      AND admin_user.department = public.users.department
    )
  )
  OR
  -- Users can see other users (for general queries)
  role IN ('user', 'technician', 'admin')
);

-- 4. Verify the policy was created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' 
AND policyname = 'Admins can view users in their department';
