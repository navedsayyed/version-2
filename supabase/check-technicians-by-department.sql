-- RUN THIS TO SEE TECHNICIANS BY DEPARTMENT
-- This will show exactly which technicians belong to which department

SELECT 
  department,
  COUNT(*) as tech_count,
  STRING_AGG(full_name || ' (' || email || ')', ', ') as technicians
FROM public.users
WHERE role = 'technician'
GROUP BY department
ORDER BY department;

-- OR see them in a list format:
SELECT 
  department,
  full_name,
  email,
  phone
FROM public.users
WHERE role = 'technician'
ORDER BY department, full_name;
