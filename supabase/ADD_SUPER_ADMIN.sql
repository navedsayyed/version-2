-- Add super_admin role to users.role check and grant RLS privileges similar to admin

-- 1) Relax role check to include super_admin
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('user', 'technician', 'admin', 'super_admin'));

-- 2) Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 3) Update complaints RLS policies so super_admin can view/update all complaints
DROP POLICY IF EXISTS "Admins can view all complaints" ON public.complaints;
CREATE POLICY "Admins can view all complaints"
  ON public.complaints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can update all complaints" ON public.complaints;
CREATE POLICY "Admins can update all complaints"
  ON public.complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- 4) Super admin can manage users table (already open with USING(true)). No change needed.

-- 5) Example: Promote a user to super_admin (replace email)
-- UPDATE public.users SET role = 'super_admin' WHERE email = 'principal@example.com';
