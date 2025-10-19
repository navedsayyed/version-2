-- ============================================================
-- FIXED: Image Upload RLS - Compatible with Supabase Storage
-- ============================================================
-- This version uses the correct approach for Supabase storage policies
-- Run this in Supabase SQL Editor
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

-- Also add SELECT policy so users can view their images
DROP POLICY IF EXISTS "Users can view images for their complaints" ON public.complaint_images;

CREATE POLICY "Users can view images for their complaints"
  ON public.complaint_images 
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id 
      AND user_id = auth.uid()
    )
  );

-- ============================================================
-- STEP 2: Make storage bucket public (if not already)
-- ============================================================

-- Update bucket settings
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
WHERE id = 'complaint-images';

-- ============================================================
-- STEP 3: Verify Setup
-- ============================================================

-- Check complaint_images table policies
SELECT 
  policyname, 
  cmd, 
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

-- ============================================================
-- IMPORTANT: Storage Policies Setup in Dashboard
-- ============================================================
-- Since we can't directly modify storage policies via SQL in Supabase,
-- you need to set them up in the Dashboard:
--
-- 1. Go to: Storage → complaint-images bucket
-- 2. Click "Policies" tab
-- 3. Click "New Policy"
-- 4. Create these 2 policies:
--
-- POLICY 1: Allow uploads
--   Policy Name: Allow authenticated uploads
--   Policy Definition: SELECT
--   Target Roles: authenticated
--   Using Expression: (bucket_id = 'complaint-images'::text)
--   With Check: (bucket_id = 'complaint-images'::text)
--
-- POLICY 2: Allow reads
--   Policy Name: Allow public reads
--   Policy Definition: SELECT
--   Target Roles: public, authenticated
--   Using Expression: (bucket_id = 'complaint-images'::text)
-- ============================================================

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
-- After running this SQL:
-- 1. complaint_images table policies are set ✅
-- 2. Storage bucket is public ✅
-- 3. Go to Dashboard to add storage policies (see above)
-- 4. Test image upload in your app!
-- ============================================================
