-- ============================================================================
-- Add Department Column to Users Table
-- This migration adds the department column needed for HOD system
-- ============================================================================

-- Add department column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Add check constraint for valid departments
ALTER TABLE public.users
ADD CONSTRAINT users_department_check 
CHECK (department IS NULL OR department IN ('Civil', 'Electrical', 'Mechanical', 'IT', 'Housekeeping'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- IMPORTANT: Run this BEFORE running setup_hod_profiles.sql
-- ============================================================================
