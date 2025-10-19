-- ============================================================
-- FIX: Storage RLS Using Policies (No Owner Required!)
-- ============================================================
-- You don't need to disable RLS on storage.objects
-- Instead, create policies that allow uploads
-- ============================================================

-- STEP 1: Disable RLS on complaints table (this works)
-- ============================================================
ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;

-- STEP 2: Add completion columns (this works)
-- ============================================================
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS completion_notes TEXT,
ADD COLUMN IF NOT EXISTS completion_image_url TEXT,
ADD COLUMN IF NOT EXISTS completion_image_path TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- STEP 3: Fix Storage Policies (instead of disabling RLS)
-- ============================================================

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "complaint-images upload" ON storage.objects;
DROP POLICY IF EXISTS "complaint-images read" ON storage.objects;

-- Create policy: Allow ALL authenticated users to upload
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'complaint-images');

-- Create policy: Allow ALL authenticated users to update
CREATE POLICY "Allow authenticated users to update"
ON storage.objects 
FOR UPDATE
TO authenticated
USING (bucket_id = 'complaint-images');

-- Create policy: Allow everyone to read/view images
CREATE POLICY "Allow public read access"
ON storage.objects 
FOR SELECT
TO public
USING (bucket_id = 'complaint-images');

-- STEP 4: Verify policies exist
-- ============================================================
SELECT 
  id,
  name,
  action,
  definition
FROM storage.policies
WHERE bucket_id = 'complaint-images'
ORDER BY name;

-- Should show 3 policies:
-- 1. Allow authenticated users to upload
-- 2. Allow authenticated users to update  
-- 3. Allow public read access

-- ============================================================
-- VERIFY BUCKET SETTINGS
-- ============================================================
SELECT 
  id,
  name,
  public as is_public
FROM storage.buckets
WHERE name = 'complaint-images';

-- Should show: is_public = true

-- ============================================================
-- IF BUCKET IS NOT PUBLIC, MAKE IT PUBLIC:
-- ============================================================
-- Go to Supabase Dashboard:
-- Storage → complaint-images → Settings
-- Toggle "Public bucket" to ON ✅

-- Or run this (might need permissions):
-- UPDATE storage.buckets 
-- SET public = true 
-- WHERE name = 'complaint-images';

-- ============================================================
-- AFTER RUNNING THIS:
-- ============================================================
-- 1. Reload your app (shake → reload)
-- 2. Try marking complaint as complete
-- 3. Photo should upload successfully! ✅
-- ============================================================
