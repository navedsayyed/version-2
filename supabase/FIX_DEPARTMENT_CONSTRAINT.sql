-- Step 1: Check what the current department constraint allows
-- Run this first to see the constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass 
AND conname = 'users_department_check';

-- Step 2: Drop the old constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_department_check;

-- Step 3: Add new constraint with "First Year" included
ALTER TABLE public.users
ADD CONSTRAINT users_department_check 
CHECK (department IN ('Civil', 'IT', 'Electrical', 'Mechanical', 'Housekeeping', 'First Year') OR department IS NULL);

-- Step 4: Now insert the user (replace with your actual values)
INSERT INTO public.users (id, email, full_name, role, department, floor, phone)
VALUES (
  'cec8550a-ad41-4ce0-a3a3-2f47e1f10b1a',
  'umakant.butkar@ggsf.edu.in',
  'Umakant Butkar',
  'admin',
  'First Year',
  '2',
  '+91-9096481982'
);

-- Step 5: Verify it worked
SELECT email, full_name, role, department, floor, phone
FROM public.users
WHERE email = 'umakant.butkar@ggsf.edu.in';
