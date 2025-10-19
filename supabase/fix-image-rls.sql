-- ============================================================
-- FIX RLS POLICY FOR COMPLAINT_IMAGES INSERT
-- ============================================================
-- Run this in Supabase SQL Editor to fix image upload
-- ============================================================

-- Drop existing INSERT policy for complaint_images
DROP POLICY IF EXISTS "Users can insert images for their complaints" ON public.complaint_images;

-- Create new INSERT policy that allows users to upload images for their complaints
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

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'complaint_images' AND cmd = 'INSERT';

-- ============================================================
-- ALSO: Fix Storage Bucket Policies
-- ============================================================
-- The storage bucket also needs proper policies

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'complaint-images';

-- If bucket doesn't exist, create it:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('complaint-images', 'complaint-images', true);

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================
-- Allow authenticated users to upload to complaint-images bucket

-- Delete old policies if they exist
DELETE FROM storage.policies WHERE bucket_id = 'complaint-images';

-- Allow INSERT (upload) for authenticated users
INSERT INTO storage.objects_policies (bucket_id, name, definition)
VALUES (
  'complaint-images',
  'Allow authenticated uploads',
  'bucket_id = ''complaint-images'' AND auth.uid() IS NOT NULL'
);

-- Allow SELECT (read) for everyone (since bucket is public)
INSERT INTO storage.objects_policies (bucket_id, name, definition)
VALUES (
  'complaint-images',
  'Allow public reads',
  'bucket_id = ''complaint-images'''
);

-- ============================================================
-- ALTERNATIVE: Make bucket public (simpler approach)
-- ============================================================
-- If the above doesn't work, ensure bucket is public:

UPDATE storage.buckets 
SET public = true 
WHERE name = 'complaint-images';

-- ============================================================
-- TEST: Try uploading via SQL
-- ============================================================
-- First check if you can insert into complaint_images table:

-- INSERT INTO public.complaint_images (complaint_id, url, storage_path)
-- VALUES (
--   1, -- Replace with actual complaint ID
--   'https://test.com/image.jpg',
--   'complaints/test.jpg'
-- );

-- ============================================================
-- VERIFY EVERYTHING
-- ============================================================

-- Check complaint_images policies
SELECT * FROM pg_policies WHERE tablename = 'complaint_images';

-- Check storage bucket settings
SELECT * FROM storage.buckets WHERE name = 'complaint-images';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'complaint_images';
