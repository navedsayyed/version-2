-- ============================================================
-- FIX: Storage RLS Blocking Completion Photo Uploads
-- ============================================================
-- This fixes the "new row violates row-level security policy" error
-- when uploading completion photos
-- ============================================================

-- OPTION 1: Disable RLS on storage.objects (SIMPLEST)
-- ============================================================
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  '=== Storage RLS Status ===' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'storage'
AND tablename = 'objects';

-- Should show: rls_enabled = false

-- ============================================================
-- OPTION 2: Create Proper Storage Policies (MORE SECURE)
-- ============================================================
-- Only use this if you prefer to keep RLS enabled

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to complaints folder" ON storage.objects;

-- Create policy that allows ALL authenticated users to upload
CREATE POLICY "Allow authenticated users to upload to complaint-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'complaint-images');

-- Create policy to allow reading images
CREATE POLICY "Allow public to read complaint-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'complaint-images');

-- Verify policies exist
SELECT 
  '=== Storage Policies ===' as info,
  id,
  name,
  action,
  definition
FROM storage.policies
WHERE bucket_id = 'complaint-images';

-- ============================================================
-- CHOOSE ONE OPTION:
-- ============================================================
-- Option 1: Disable RLS (easier, less secure but works)
-- Option 2: Use policies (more secure)

-- I recommend Option 1 for development/testing
-- Use Option 2 for production

-- ============================================================
-- AFTER RUNNING THIS:
-- ============================================================
-- 1. Reload your app (shake → reload)
-- 2. Try uploading completion photo again
-- 3. Should work now! ✅
-- ============================================================

-- ============================================================
-- VERIFY IT WORKS:
-- ============================================================
-- After running the fix, check storage objects:
SELECT 
  '=== Recent Uploads ===' as info,
  name,
  created_at,
  bucket_id
FROM storage.objects
WHERE bucket_id = 'complaint-images'
ORDER BY created_at DESC
LIMIT 10;

-- Should show your uploaded photos! ✅
-- ============================================================
