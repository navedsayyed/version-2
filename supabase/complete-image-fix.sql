-- ============================================================
-- COMPLETE FIX FOR IMAGE UPLOAD RLS ERROR
-- ============================================================
-- Run ALL of these queries in Supabase SQL Editor
-- This will fix both complaint_images table RLS and storage bucket RLS
-- ============================================================

-- ============================================================
-- STEP 1: Fix complaint_images table RLS policy
-- ============================================================

-- Drop and recreate INSERT policy for complaint_images
DROP POLICY IF EXISTS "Users can insert images for their complaints" ON public.complaint_images;

CREATE POLICY "Users can insert images for their complaints"
  ON public.complaint_images 
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id 
      AND user_id = auth.uid()
    )
  );

-- ============================================================
-- STEP 2: Ensure storage bucket exists and is public
-- ============================================================

-- Make sure bucket is public
UPDATE storage.buckets 
SET public = true,
    file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
WHERE id = 'complaint-images';

-- If bucket doesn't exist, create it (uncomment if needed):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'complaint-images', 
--   'complaint-images', 
--   true,
--   5242880,
--   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
-- )
-- ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================================
-- STEP 3: Create storage policies for the bucket
-- ============================================================

-- Delete existing policies to start fresh
DELETE FROM storage.policies WHERE bucket_id = 'complaint-images';

-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'complaint-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 2: Allow authenticated users to read their uploads
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'complaint-images'
);

-- Policy 3: Allow users to update their uploads
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'complaint-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow users to delete their uploads
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'complaint-images' 
  AND auth.role() = 'authenticated'
);

-- ============================================================
-- STEP 4: Verify everything
-- ============================================================

-- Check complaint_images table policies
SELECT 
  policyname, 
  cmd, 
  with_check,
  tablename
FROM pg_policies 
WHERE tablename = 'complaint_images';

-- Check storage bucket settings
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'complaint-images';

-- Check storage policies
SELECT 
  name,
  action,
  check_clause,
  bucket_id
FROM storage.policies
WHERE bucket_id = 'complaint-images';

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
-- If you see results from all the SELECT queries above, 
-- the policies are set up correctly!
-- 
-- Now test in your app:
-- 1. Submit a complaint with an image
-- 2. Image should upload successfully ✅
-- ============================================================
