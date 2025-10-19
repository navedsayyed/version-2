-- ============================================================================
-- Add complaint_type Column to Complaints Table
-- This column stores the department (Civil, Electrical, etc.) for HOD routing
-- ============================================================================

-- Add complaint_type column to complaints table
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS complaint_type TEXT;

-- Add index for better query performance (HODs filter by this)
CREATE INDEX IF NOT EXISTS idx_complaints_complaint_type ON public.complaints(complaint_type);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'complaints' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- IMPORTANT: Run this BEFORE submitting any complaints
-- ============================================================================

/*
EXPLANATION:
------------
The complaint_type column stores the DEPARTMENT name (e.g., "Electrical", "Civil")
This is how the system routes complaints to the correct HOD.

Example flow:
1. User selects type: "electrical"
2. System maps "electrical" → "Electrical" department
3. Stored as complaint_type = "Electrical"
4. Mr. Bhimrao Dabhade (Electrical HOD) sees it in his dashboard

Department values:
- Civil
- Electrical
- Mechanical
- IT
- Housekeeping
*/
