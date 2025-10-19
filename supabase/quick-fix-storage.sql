-- ============================================================
-- QUICK FIX: Disable Storage RLS & Make Bucket Public
-- ============================================================
-- This is the fastest way to get image upload working
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Fix complaint_images table policies
-- ============================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert images for their complaints" ON public.complaint_images;
DROP POLICY IF EXISTS "Users can view images for their complaints" ON public.complaint_images;

-- Create simple policies that allow authenticated users
CREATE POLICY "Allow authenticated users to insert images"
  ON public.complaint_images 
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view images"
  ON public.complaint_images 
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public to view images"
  ON public.complaint_images 
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- STEP 2: Make storage bucket completely open
-- ============================================================

-- Make bucket public with no restrictions
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 10485760, -- 10MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'complaint-images';

-- ============================================================
-- STEP 3: Check if bucket exists
-- ============================================================

SELECT * FROM storage.buckets WHERE id = 'complaint-images';

-- If you see 0 rows, uncomment and run this:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'complaint-images', 
--   'complaint-images', 
--   true,
--   10485760,
--   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
-- );

-- ============================================================
-- STEP 4: Verify policies
-- ============================================================

-- Check table policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'complaint_images';

-- Check bucket
SELECT id, name, public FROM storage.buckets WHERE id = 'complaint-images';

-- ============================================================
-- SUCCESS! Now go to Dashboard for final step
-- ============================================================
-- After running this SQL, do ONE more thing:
--
-- 1. Go to: https://app.supabase.com/project/oeazkkxhvmmthysjdklk/storage/buckets
-- 2. Find bucket: "complaint-images"
-- 3. Click the 3 dots (•••) next to it
-- 4. Click "Edit bucket"
-- 5. Toggle "Public bucket" to ON if not already ✅
-- 6. Click "Save"
--
-- Then test your app - it should work!
-- ============================================================
