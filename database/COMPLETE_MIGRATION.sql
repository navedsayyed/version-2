-- ============================================================================
-- COMPLETE DATABASE MIGRATION FOR HOD SYSTEM
-- Run this script ONCE to add all missing columns needed for HOD system
-- ============================================================================

-- ============================================================================
-- STEP 1: Add department column to users table
-- ============================================================================

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department TEXT;

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_department_check;

ALTER TABLE public.users
ADD CONSTRAINT users_department_check 
CHECK (department IS NULL OR department IN ('Civil', 'Electrical', 'Mechanical', 'IT', 'Housekeeping'));

CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);

-- ============================================================================
-- STEP 2: Add complaint_type column to complaints table
-- ============================================================================

ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS complaint_type TEXT;

CREATE INDEX IF NOT EXISTS idx_complaints_complaint_type ON public.complaints(complaint_type);

-- ============================================================================
-- STEP 3: Verify all columns exist
-- ============================================================================

-- Check users table
SELECT 'users table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check complaints table  
SELECT 'complaints table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'complaints' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '✅ Migration complete! Both department and complaint_type columns added.' as status;

-- ============================================================================
-- WHAT THIS DOES:
-- ============================================================================

/*
1. Adds 'department' column to users table
   - Stores: Civil, Electrical, Mechanical, IT, Housekeeping
   - Used by: HODs and Technicians
   - Purpose: Filter complaints and technicians by department

2. Adds 'complaint_type' column to complaints table
   - Stores: Civil, Electrical, Mechanical, IT, Housekeeping (department name)
   - Purpose: Route complaints to correct HOD
   - Example: complaint_type = "Electrical" → only Electrical HOD sees it

3. Adds indexes for better performance
   - idx_users_department: Fast lookup of users by department
   - idx_complaints_complaint_type: Fast filtering of complaints by department

NEXT STEPS:
-----------
After running this script:
1. Run database/setup_hod_profiles.sql (create 5 HODs)
2. Run database/setup_technicians.sql (create 12 technicians)
3. Test by submitting a complaint
*/
