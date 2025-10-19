-- ============================================================
-- EMERGENCY FIX: Disable ALL RLS to Get Upload Working NOW
-- ============================================================
-- This will make image upload work immediately
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- STEP 1: Disable RLS on complaint_images table
ALTER TABLE public.complaint_images DISABLE ROW LEVEL SECURITY;

-- STEP 2: Make storage bucket completely public with no restrictions
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 10485760,  -- 10MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'complaint-images';

-- STEP 3: If bucket doesn't exist, create it (run if UPDATE above returns 0 rows)
-- Uncomment these lines if the UPDATE returned "UPDATE 0" (meaning bucket doesn't exist):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'complaint-images',
--   'complaint-images',
--   true,
--   10485760,
--   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET public = true, file_size_limit = 10485760;

-- ============================================================
-- VERIFY THE CHANGES
-- ============================================================

-- Check if RLS is disabled (should show rowsecurity = f)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'complaint_images';
-- Expected: rowsecurity = f (false = disabled) ✅

-- Check bucket is public
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'complaint-images';
-- Expected: public = t (true) ✅

-- ============================================================
-- SUCCESS INDICATORS
-- ============================================================
-- If you see:
-- 1. rowsecurity = f  ✅
-- 2. public = t  ✅
-- Then the fix is applied!
--
-- NOW: Go to Dashboard and set storage policies (REQUIRED!)
-- ============================================================
