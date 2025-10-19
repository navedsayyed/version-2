-- ============================================================
-- ULTIMATE FIX: Completely Disable RLS for Image Upload
-- ============================================================
-- This will make image upload work immediately
-- Run ALL queries in order in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- OPTION 1: Disable RLS on complaint_images (Simplest!)
-- ============================================================

-- This completely removes RLS restrictions
ALTER TABLE public.complaint_images DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- OPTION 2: If you want to keep RLS enabled, use this instead
-- ============================================================

-- Comment out OPTION 1 above and use these policies:

-- Drop all existing policies
-- DROP POLICY IF EXISTS "Users can insert images for their complaints" ON public.complaint_images;
-- DROP POLICY IF EXISTS "Users can view images for their complaints" ON public.complaint_images;
-- DROP POLICY IF EXISTS "Allow authenticated users to insert images" ON public.complaint_images;
-- DROP POLICY IF EXISTS "Allow authenticated users to view images" ON public.complaint_images;
-- DROP POLICY IF EXISTS "Allow public to view images" ON public.complaint_images;

-- Create super permissive policies
-- CREATE POLICY "Allow all inserts"
--   ON public.complaint_images 
--   FOR INSERT
--   WITH CHECK (true);

-- CREATE POLICY "Allow all selects"
--   ON public.complaint_images 
--   FOR SELECT
--   USING (true);

-- ============================================================
-- Make storage bucket public
-- ============================================================

UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'complaint-images';

-- ============================================================
-- Verify everything
-- ============================================================

-- Check if RLS is disabled (should show "f" for false)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'complaint_images';

-- Check bucket
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'complaint-images';

-- ============================================================
-- FINAL STEP: Dashboard
-- ============================================================
-- Go to Supabase Dashboard:
-- https://app.supabase.com/project/oeazkkxhvmmthysjdklk/storage/buckets
--
-- Click on "complaint-images" bucket
-- Click "Policies" tab
-- Click "Add policy" or "New policy"
-- Choose: "Allow public access" template
-- Save it
--
-- This allows anyone to upload/read from the storage bucket
-- ============================================================

-- ============================================================
-- TEST IT!
-- ============================================================
-- After running this:
-- 1. Close and restart your React Native app
-- 2. Submit a complaint with an image
-- 3. Should work now! ✅
-- ============================================================
