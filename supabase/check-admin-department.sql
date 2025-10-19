-- CHECK WHAT DEPARTMENT YOUR ADMIN HAS
-- Replace 'your-it-admin-email@example.com' with your actual IT admin email

SELECT 
  email,
  full_name,
  role,
  department
FROM public.users
WHERE role = 'admin' AND email = 'your-it-admin-email@example.com';

-- OR see all admins
SELECT 
  email,
  full_name,
  role,
  department
FROM public.users
WHERE role = 'admin'
ORDER BY department;

-- Then check IT technicians
SELECT 
  email,
  full_name,
  role,
  department
FROM public.users
WHERE role = 'technician' AND department = 'IT'
ORDER BY full_name;
