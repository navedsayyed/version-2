-- ============================================================================
-- Technician Profile Setup Script
-- Add technicians under each HOD's department
-- ============================================================================

-- IMPORTANT: Create auth accounts first in Supabase Authentication panel
-- Then use the auth UUIDs in these INSERT statements

-- ============================================================================
-- CIVIL DEPARTMENT TECHNICIANS (Under Mr. A.G. Chaurdhari)
-- ============================================================================

-- Civil Technician 1
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  'ea73adef-6bf9-4cad-a794-fea949172ea6',
  'rajesh.civil@college.edu',
  'Rajesh Kumar',
  '+91-9876543301',
  'technician',
  'Civil',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- Civil Technician 2
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  '717bf286-205f-4862-9cb1-013a63743d86',
  'amit.civil@college.edu',
  'Amit Patil',
  '+91-9876543302',
  'technician',
  'Civil',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- ============================================================================
-- ELECTRICAL DEPARTMENT TECHNICIANS (Under Mr. B.G. Dabhade)
-- ============================================================================

-- Electrical Technician 1
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  'd2e553bb-34a4-454e-b817-64f87faf5ce2',
  'suresh.electrical@college.edu',
  'Suresh Jadhav',
  '+91-9876543303',
  'technician',
  'Electrical',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- Electrical Technician 2
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  'd3bd0359-58a4-411d-9354-34eba4312eed',
  'prakash.electrical@college.edu',
  'Prakash Shinde',
  '+91-9876543304',
  'technician',
  'Electrical',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- Electrical Technician 3
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  '60c8db7a-ee47-46b9-a7d9-611d3af894e3',
  'ganesh.electrical@college.edu',
  'Ganesh Desai',
  '+91-9876543305',
  'technician',
  'Electrical',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- ============================================================================
-- MECHANICAL DEPARTMENT TECHNICIANS (Under Mr. R.S. Khandare)
-- ============================================================================

-- Mechanical Technician 1
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  '335b6376-b88a-46c8-bdfa-ff57831be89b',
  'mahesh.mechanical@college.edu',
  'Mahesh Pawar',
  '+91-9876543306',
  'technician',
  'Mechanical',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- Mechanical Technician 2
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  'f5b6d5fe-70bc-4189-b5b1-0657ffbe4120',
  'santosh.mechanical@college.edu',
  'Santosh Gaikwad',
  '+91-9876543307',
  'technician',
  'Mechanical',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- ============================================================================
-- IT DEPARTMENT TECHNICIANS (Under Mr. P.C. Patil)
-- ============================================================================

-- IT Technician 1
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  '84253b15-4558-4909-bb19-9d55957e89c4',
  'rahul.it@college.edu',
  'Rahul Sharma',
  '+91-9876543308',
  'technician',
  'IT',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- IT Technician 2
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  '0aaa2f6e-494c-493c-bc4a-4130016ba396',
  'vikram.it@college.edu',
  'Vikram Kulkarni',
  '+91-9876543309',
  'technician',
  'IT',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- IT Technician 3
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  '389d7d2e-fbfc-4caa-9251-769fc9d81f30',
  'anil.it@college.edu',
  'Anil Bhosale',
  '+91-9876543310',
  'technician',
  'IT',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- ============================================================================
-- HOUSEKEEPING DEPARTMENT TECHNICIANS (Under Mr. Vinayak Apsingkar)
-- ============================================================================

-- Housekeeping Technician 1
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  '7e3baed4-26ed-4e52-9a69-2e6614c727e1',
  'deepak.housekeeping@college.edu',
  'Deepak More',
  '+91-9876543311',
  'technician',
  'Housekeeping',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- Housekeeping Technician 2
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  'a9d79d00-7b4f-43fb-8d3e-df99591a77cc',
  'kiran.housekeeping@college.edu',
  'Kiran Kamble',
  '+91-9876543312',
  'technician',
  'Housekeeping',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- ============================================================================
-- VERIFY TECHNICIANS
-- ============================================================================

-- Count technicians by department
SELECT 
  department,
  COUNT(*) as technician_count
FROM public.users
WHERE role = 'technician'
GROUP BY department
ORDER BY department;

-- List all technicians
SELECT 
  full_name,
  email,
  phone,
  department,
  created_at
FROM public.users
WHERE role = 'technician'
ORDER BY department, full_name;

-- ============================================================================
-- DEPARTMENT SUMMARY
-- ============================================================================

/*
TECHNICIAN DISTRIBUTION:

Civil Department (Mr. A.G. Chaurdhari):
  - Rajesh Kumar
  - Amit Patil
  → 2 technicians

Electrical Department (Mr. B.G. Dabhade):
  - Suresh Jadhav
  - Prakash Shinde
  - Ganesh Desai
  → 3 technicians (more electrical work expected)

Mechanical Department (Mr. R.S. Khandare):
  - Mahesh Pawar
  - Santosh Gaikwad
  → 2 technicians

IT Department (Mr. P.C. Patil):
  - Rahul Sharma
  - Vikram Kulkarni
  - Anil Bhosale
  → 3 technicians (high demand for IT support)

Housekeeping Department (Mr. Vinayak Apsingkar):
  - Deepak More
  - Kiran Kamble
  → 2 technicians

TOTAL: 12 technicians across 5 departments
*/

-- ============================================================================
-- DEPLOYMENT STEPS
-- ============================================================================

/*
1. Go to Supabase Dashboard → Authentication → Users
2. Create auth accounts for each technician (use emails from above)
3. Copy each user's UUID
4. Replace REPLACE_WITH_AUTH_ID with actual UUIDs in this script
5. Run this SQL script in Supabase SQL Editor
6. Verify using the SELECT queries at the end
7. Test by logging in as HOD and checking Technicians tab
*/
