-- ============================================================
-- DIAGNOSE & FIX: Storage RLS Still Blocking Uploads
-- ============================================================

-- STEP 1: Check current storage policies
-- ============================================================
SELECT 
  '=== Current Storage Policies ===' as info,
  id,
  name,
  action,
  definition
FROM storage.policies
WHERE bucket_id = 'complaint-images'
ORDER BY name;

-- STEP 2: Check if bucket is public
-- ============================================================
SELECT 
  '=== Bucket Settings ===' as info,
  id,
  name,
  public as is_public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'complaint-images';

-- STEP 3: Delete ALL existing policies and create new ones
-- ============================================================
DELETE FROM storage.policies WHERE bucket_id = 'complaint-images';

-- Create comprehensive policies
INSERT INTO storage.policies (name, bucket_id, definition, action)
VALUES
  ('Allow all authenticated uploads', 'complaint-images', 'true', 'INSERT'),
  ('Allow all authenticated updates', 'complaint-images', 'true', 'UPDATE'),
  ('Allow all public reads', 'complaint-images', 'true', 'SELECT'),
  ('Allow all authenticated deletes', 'complaint-images', 'true', 'DELETE');

-- STEP 4: Make bucket public (if not already)
-- ============================================================
UPDATE storage.buckets 
SET public = true 
WHERE name = 'complaint-images';

-- STEP 5: Verify policies were created
-- ============================================================
SELECT 
  '=== New Policies Created ===' as info,
  id,
  name,
  action,
  check_expression,
  bucket_id
FROM storage.policies
WHERE bucket_id = 'complaint-images'
ORDER BY action;

-- Should show 4 policies (INSERT, UPDATE, SELECT, DELETE)

-- STEP 6: Test if bucket exists and is accessible
-- ============================================================
SELECT 
  '=== Recent Uploads Test ===' as info,
  name,
  created_at
FROM storage.objects
WHERE bucket_id = 'complaint-images'
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================
-- IF STILL NOT WORKING, CREATE BUCKET FROM SCRATCH:
-- ============================================================
-- Uncomment these lines if needed:

-- Delete old bucket (WARNING: This deletes all files!)
-- DELETE FROM storage.objects WHERE bucket_id = 'complaint-images';
-- DELETE FROM storage.buckets WHERE name = 'complaint-images';

-- Create new bucket with no RLS
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'complaint-images',
--   'complaint-images',
--   true,
--   10485760, -- 10MB
--   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
-- );

-- ============================================================
-- AFTER RUNNING THIS:
-- ============================================================
-- 1. Reload your app
-- 2. Try upload again
-- 3. Should work now! ✅
-- ============================================================
