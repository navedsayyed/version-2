-- ============================================================================
-- HOD Profile Setup Script
-- This script creates 5 HOD profiles for the Complaint Management System
-- Each HOD manages specific complaint types based on their department
-- ============================================================================

-- First, let's understand the department to complaint_type mapping:
-- 
-- 1. CIVIL: wall, ceiling, floor, door, window (Construction/Structural)
-- 2. ELECTRICAL: electrical, lighting, power, ac, heating (Electrical Systems)
-- 3. MECHANICAL: plumbing, furniture (Mechanical/Plumbing Systems)
-- 4. IT: network, computer, projector, lab, teaching (IT Equipment)
-- 5. HOUSEKEEPING: cleanliness, security (Maintenance/Cleanliness)

-- ============================================================================
-- STEP 1: Insert HOD profiles into auth.users (if not already created)
-- Note: You need to create these accounts through Supabase Auth first
-- ============================================================================

-- These are the emails that need to be registered:
-- 1. ajay.chaudhari@ggsf.edu.in
-- 2. bhimrao.dabhade@ggsf.edu.in
-- 3. rohit.khandare@ggsf.edu.in
-- 4. pramod.patil@ggsf.edu.in
-- 5. vinayak.apsingkar@ggsf.edu.in

-- ============================================================================
-- STEP 2: Insert HOD profiles into public.users table
-- ============================================================================

-- 1. Mr. Ajay Chaudhari - Infrastructure Civil Activities
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  'REPLACE_WITH_AUTH_ID_1', -- Get this ID after creating auth account
  'ajay.chaudhari@ggsf.edu.in',
  'Mr. Ajay Chaudhari',
  '+91-9876543211',
  'admin',
  'Civil',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- 2. Mr. Bhimrao Dabhade - Infrastructure Electrical Activities
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  'REPLACE_WITH_AUTH_ID_2',
  'bhimrao.dabhade@ggsf.edu.in',
  'Mr. Bhimrao Dabhade',
  '+91-9876543212',
  'admin',
  'Electrical',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- 3. Mr. Rohit Khandare - Infrastructure Mechanical Activities
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  'REPLACE_WITH_AUTH_ID_3',
  'rohit.khandare@ggsf.edu.in',
  'Mr. Rohit Khandare',
  '+91-9876543213',
  'admin',
  'Mechanical',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- 4. Mr. Pramod Patil - Infrastructure IT Activities
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  'REPLACE_WITH_AUTH_ID_4',
  'pramod.patil@ggsf.edu.in',
  'Mr. Pramod Patil',
  '+91-9876543214',
  'admin',
  'IT',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- 5. Mr. Vinayak Apsingkar - Housekeeping Activities
INSERT INTO public.users (id, email, full_name, phone, role, department, created_at)
VALUES (
  'REPLACE_WITH_AUTH_ID_5',
  'vinayak.apsingkar@ggsf.edu.in',
  'Mr. Vinayak Apsingkar',
  '+91-9876543215',
  'admin',
  'Housekeeping',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- ============================================================================
-- STEP 3: Verify the insertions
-- ============================================================================

SELECT 
  full_name,
  email,
  phone,
  role,
  department,
  created_at
FROM public.users
WHERE role = 'admin'
ORDER BY department;

-- ============================================================================
-- DEPLOYMENT INSTRUCTIONS
-- ============================================================================

/*
1. Go to Supabase Dashboard → Authentication → Users
2. Create 5 new users manually:
   - Email: ajay.chaudhari@ggsf.edu.in, Password: [secure-password]
   - Email: bhimrao.dabhade@ggsf.edu.in, Password: [secure-password]
   - Email: rohit.khandare@ggsf.edu.in, Password: [secure-password]
   - Email: pramod.patil@ggsf.edu.in, Password: [secure-password]
   - Email: vinayak.apsingkar@ggsf.edu.in, Password: [secure-password]

3. Copy each user's UUID from the Authentication panel

4. Replace REPLACE_WITH_AUTH_ID_1 through REPLACE_WITH_AUTH_ID_5 with the actual UUIDs

5. Run this SQL script in Supabase SQL Editor

6. Verify by checking the users table

COMPLAINT TYPE ROUTING:
=======================
When a user submits a complaint, the complaint_type will be mapped to departments:

Civil Department (Mr. Ajay Chaudhari):
  - wall, ceiling, floor, door, window

Electrical Department (Mr. Bhimrao Dabhade):
  - electrical, lighting, power, ac, heating

Mechanical Department (Mr. Rohit Khandare):
  - plumbing, furniture

IT Department (Mr. Pramod Patil):
  - network, computer, projector, lab, teaching

Housekeeping Department (Mr. Vinayak Apsingkar):
  - cleanliness, security

*/
