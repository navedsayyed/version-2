-- ============================================================
-- ADD COMPLETION PHOTO & NOTES COLUMNS TO COMPLAINTS TABLE
-- ============================================================
-- This adds columns to store "after" photos and completion notes
-- when technicians mark work as completed
-- ============================================================

-- Add new columns to complaints table
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS completion_notes TEXT,
ADD COLUMN IF NOT EXISTS completion_image_url TEXT,
ADD COLUMN IF NOT EXISTS completion_image_path TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Verify columns were added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'complaints'
AND column_name IN ('completion_notes', 'completion_image_url', 'completion_image_path', 'completed_at')
ORDER BY ordinal_position;

-- Expected result:
-- completion_notes        | text         | YES
-- completion_image_url    | text         | YES
-- completion_image_path   | text         | YES
-- completed_at            | timestamptz  | YES

-- ============================================================
-- USAGE:
-- ============================================================
-- When technician marks work as complete:
-- 1. Upload "after" photo to storage (same as complaint photos)
-- 2. Update complaint with:
--    - status = 'completed'
--    - completion_notes = technician's notes
--    - completion_image_url = public URL of after photo
--    - completion_image_path = storage path
--    - completed_at = NOW()
-- ============================================================

-- Example update (don't run this, just reference):
-- UPDATE complaints SET
--   status = 'completed',
--   completion_notes = 'Fixed the AC unit, replaced filters',
--   completion_image_url = 'https://...photo.jpg',
--   completion_image_path = 'complaints/completed_123.jpg',
--   completed_at = NOW()
-- WHERE id = 1;

-- ============================================================
-- SUCCESS! ✅
-- After running this, your app can store completion photos!
-- ============================================================
