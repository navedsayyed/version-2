-- Simple solution: Treat "First Year" as a regular department
-- No need for floor column!

-- Step 1: Update Umakant Butkar to be like other admins
UPDATE public.users
SET 
  full_name = 'Umakant Butkar',
  role = 'admin',
  department = 'First Year',  -- Just another department name
  floor = NULL,               -- Remove floor, not needed
  phone = '+91-9096481982'
WHERE email = 'umakant.butkar@ggsf.edu.in';

-- Step 2: Verify
SELECT email, full_name, role, department, floor
FROM public.users
WHERE email = 'umakant.butkar@ggsf.edu.in';

-- Expected result:
-- email: umakant.butkar@ggsf.edu.in
-- full_name: Umakant Butkar
-- role: admin
-- department: First Year
-- floor: NULL

-- Now he works exactly like other admins (Civil, IT, etc.)!
