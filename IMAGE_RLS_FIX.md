# ✅ Image Upload RLS Error - Complete Fix

## 🎉 Good News!
**Complaint submission is working!** ✅

## 🐛 Current Issue
**Image upload failing with:** 
```
StorageApiError: new row violates row-level security policy
```

This means:
1. ✅ Complaint is created successfully
2. ❌ Image upload to storage is blocked by RLS

## 🔧 Complete Fix (2 Parts)

### Part 1: Fix complaint_images Table RLS

Run this in Supabase SQL Editor:

```sql
-- Fix complaint_images INSERT policy
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
```

### Part 2: Fix Storage Bucket Policies

```sql
-- Make bucket public
UPDATE storage.buckets 
SET public = true
WHERE id = 'complaint-images';

-- Delete old policies
DELETE FROM storage.policies WHERE bucket_id = 'complaint-images';

-- Create storage policies
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'complaint-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint-images');
```

## 🚀 Quick Fix (Run This!)

**Use the complete fix file I created:**

1. Open: `supabase/complete-image-fix.sql`
2. Copy ALL the code
3. Go to Supabase SQL Editor
4. Paste and run
5. Check the results at the bottom
6. Test in your app!

## 🧪 Testing

After running the SQL:

1. **Open your app**
2. **Fill complaint form**
3. **Add a photo** (camera or gallery)
4. **Submit**
5. **Should see:** ✅
   - "Submitted!" message
   - No storage errors
   - Image appears in "My Complaints"

## 🔍 Verify in Supabase

### Check Complaint Created:
- Table Editor → complaints
- Should see your complaint ✅

### Check Image Uploaded:
- Storage → complaint-images → complaints folder
- Should see image file ✅

### Check Image Record:
- Table Editor → complaint_images
- Should see row with complaint_id and url ✅

## 📝 What These Policies Do

### complaint_images Table Policy:
- Allows users to insert image records
- Only for complaints they own
- Checks if complaint.user_id = auth.uid()

### Storage Bucket Policies:
- Allow authenticated users to upload files
- Allow everyone to read files (public bucket)
- Restrict deletes/updates to authenticated users

## 🆘 If Still Not Working

### Quick Test - Disable RLS Temporarily:

```sql
-- Disable RLS on complaint_images (testing only!)
ALTER TABLE public.complaint_images DISABLE ROW LEVEL SECURITY;

-- Test image upload

-- Re-enable RLS
ALTER TABLE public.complaint_images ENABLE ROW LEVEL SECURITY;
```

### Check Storage Bucket Exists:

```sql
SELECT * FROM storage.buckets WHERE id = 'complaint-images';
```

If no results, create bucket in Dashboard:
- Storage → New Bucket
- Name: `complaint-images`
- Public: ✅ Yes

## ✨ Expected Result After Fix

1. ✅ Fill complaint form
2. ✅ Add image
3. ✅ Submit
4. ✅ Complaint created
5. ✅ Image uploaded to storage
6. ✅ Image record in database
7. ✅ Image shows in "My Complaints"
8. ✅ No errors!

## 🎯 The Two RLS Checks

Your image upload goes through TWO RLS checks:

1. **Storage RLS** - Can I upload to this bucket?
   - Fixed by storage policies

2. **Table RLS** - Can I insert this record?
   - Fixed by complaint_images policy

Both must pass for successful upload!

---

## 🎊 Status

**Complaints**: ✅ WORKING!
**Images**: ⏳ Run the SQL fix → Will be WORKING!

Run `complete-image-fix.sql` and you're done! 🚀
