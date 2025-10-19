-- CHECK AND ADD TECHNICIANS
-- Run this in Supabase SQL Editor to verify and add technicians

-- 1. CHECK ALL USERS WITH ROLE
SELECT 
  id,
  email,
  full_name,
  role,
  department,
  phone
FROM public.users
ORDER BY role, department;

-- 2. CHECK SPECIFICALLY TECHNICIANS
SELECT 
  id,
  email,
  full_name,
  role,
  department,
  phone
FROM public.users
WHERE role = 'technician'
ORDER BY department;

-- 3. CHECK IT DEPARTMENT TECHNICIANS SPECIFICALLY
SELECT 
  id,
  email,
  full_name,
  role,
  department,
  phone
FROM public.users
WHERE role = 'technician' AND department = 'IT';

-- 4. CHECK ALL DEPARTMENTS (to see if case-sensitive)
SELECT DISTINCT department FROM public.users;

-- ==========================================
-- IF YOU NEED TO ADD TEST TECHNICIANS
-- (Only run if you don't have any technicians)
-- ==========================================

-- First, check if these emails already exist
-- SELECT * FROM auth.users WHERE email IN ('tech1.it@test.com', 'tech2.it@test.com');

-- If they don't exist, you need to:
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add User" 
-- 3. Add these users:
--    Email: tech1.it@test.com, Password: test123456
--    Email: tech2.it@test.com, Password: test123456
-- 4. Then run this to add their profiles:

/*
-- Add IT Technician 1
INSERT INTO public.users (id, email, full_name, phone, role, department)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'tech1.it@test.com'),
  'tech1.it@test.com',
  'Rajesh Kumar',
  '9876543210',
  'technician',
  'IT'
);

-- Add IT Technician 2  
INSERT INTO public.users (id, email, full_name, phone, role, department)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'tech2.it@test.com'),
  'tech2.it@test.com',
  'Amit Sharma',
  '9876543211',
  'technician',
  'IT'
);

-- Add Civil Technician 1
INSERT INTO public.users (id, email, full_name, phone, role, department)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'tech1.civil@test.com'),
  'tech1.civil@test.com',
  'Suresh Patil',
  '9876543212',
  'technician',
  'Civil'
);

-- Add Civil Technician 2
INSERT INTO public.users (id, email, full_name, phone, role, department)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'tech2.civil@test.com'),
  'tech2.civil@test.com',
  'Ramesh Singh',
  '9876543213',
  'technician',
  'Civil'
);
*/

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Count technicians by department
SELECT 
  department,
  COUNT(*) as technician_count
FROM public.users
WHERE role = 'technician'
GROUP BY department
ORDER BY department;

-- Count all users by role
SELECT 
  role,
  COUNT(*) as count
FROM public.users
GROUP BY role
ORDER BY role;
