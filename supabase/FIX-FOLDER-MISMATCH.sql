-- ============================================================
-- FIX: Update Storage Policies to Match "complaints" Folder
-- ============================================================
-- Your current policies check for 'private' folder
-- But your app uploads to 'complaints' folder
-- This fixes the mismatch
-- ============================================================

-- OPTION 1: Delete old policies and create folder-agnostic ones
-- (Works with any folder: complaints, private, etc.)
-- ============================================================

-- Delete the policies with the wrong folder name
DROP POLICY IF EXISTS "Give users authenticated access to folder qfsjq2_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users authenticated access to folder qfsjq2_1" ON storage.objects;

-- Create new policies that work with any folder
CREATE POLICY "Allow authenticated users to read images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'complaint-images');

CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'complaint-images');

-- ============================================================
-- OPTION 2: If you want to restrict to 'complaints' folder only
-- ============================================================

-- Uncomment these if you want to restrict uploads to 'complaints' folder:

-- DROP POLICY IF EXISTS "Allow authenticated users to read images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;

-- CREATE POLICY "Allow read from complaints folder"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'complaint-images' 
--   AND (storage.foldername(name))[1] = 'complaints'
-- );

-- CREATE POLICY "Allow upload to complaints folder"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'complaint-images' 
--   AND (storage.foldername(name))[1] = 'complaints'
-- );

-- ============================================================
-- VERIFY
-- ============================================================

-- Check all storage policies for complaint-images bucket
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage';

-- ============================================================
-- SUCCESS!
-- ============================================================
-- After running this, test your app upload again
-- It should work now! ✅
-- ============================================================
