-- Add floor field to users table for floor-specific admin management
-- This allows admins to manage only their assigned floor

-- Step 1: Add floor column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS floor TEXT;

-- Step 2: Set up department-based admins (no floor restriction)
-- These admins manage complaints by TYPE, not floor
-- They see all complaints that match their department type
UPDATE public.users
SET floor = NULL  -- NULL means: manage by department/type, not floor
WHERE role = 'admin'
  AND email != 'umakant.butkar@ggsf.edu.in';

-- Step 3: Set up Umakant Butkar as Floor 2 Admin (First Year HOD)
-- This admin sees ALL complaints from Floor 2, regardless of type
-- Floor-based admin = manages a PHYSICAL FLOOR, not complaint types

-- Option A: If account already exists, just update:
UPDATE public.users
SET 
  full_name = 'Umakant Butkar',
  role = 'admin',
  department = 'First Year',  -- Department name: First Year
  floor = '2',                -- Manages Floor 2 (First Year floor)
  phone = '+91-XXXXXXXXXX'    -- Update phone number
WHERE email = 'umakant.butkar@ggsf.edu.in';

-- Option B: If creating new account, first create in Supabase Auth, then:
-- INSERT INTO public.users (id, email, full_name, role, department, floor, phone)
-- VALUES (
--   'PASTE_USER_ID_HERE',           -- Get from Supabase Auth after creation
--   'umakant.butkar@ggsf.edu.in',
--   'Umakant Butkar',
--   'admin',
--   'First Year',                    -- Department: First Year
--   '2',                             -- Floor 2 (First Year)
--   '+91-XXXXXXXXXX'
-- );

-- Step 4: Update all existing technicians to have floors
-- Civil Department technicians
UPDATE public.users
SET floor = '1,2' -- Can handle both floors
WHERE department = 'Civil' 
  AND role = 'technician'
  AND floor IS NULL;

-- IT Department (Floor 3)
UPDATE public.users
SET floor = '3'
WHERE department = 'IT' 
  AND role = 'technician'
  AND floor IS NULL;

-- Electrical Department (Floor 4)
UPDATE public.users
SET floor = '4'
WHERE department = 'Electrical' 
  AND role = 'technician'
  AND floor IS NULL;

-- Mechanical Department (Floor 5)
UPDATE public.users
SET floor = '5'
WHERE department = 'Mechanical' 
  AND role = 'technician'
  AND floor IS NULL;

-- Housekeeping (All floors)
UPDATE public.users
SET floor = '1,2,3,4,5'
WHERE department = 'Housekeeping' 
  AND role = 'technician'
  AND floor IS NULL;

-- Step 5: Verify the changes
SELECT email, full_name, role, department, floor
FROM public.users
WHERE role IN ('admin', 'technician')
ORDER BY department, floor;
