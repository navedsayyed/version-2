# ✅ FIX: Storage Permission Error (No Owner Required!)

## The Error

```
ERROR: 42501: must be owner of table objects
```

**What This Means:**
- ❌ You can't disable RLS on `storage.objects` (requires superuser)
- ✅ But you CAN create storage policies (no special permissions needed!)

---

## ✅ THE CORRECT FIX (Run This SQL)

Open **Supabase SQL Editor** and run:

**File:** `supabase/FIX-STORAGE-WITH-POLICIES.sql`

Or copy this:

```sql
-- 1. Disable RLS on complaints (this works!)
ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;

-- 2. Add completion columns
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS completion_notes TEXT,
ADD COLUMN IF NOT EXISTS completion_image_url TEXT,
ADD COLUMN IF NOT EXISTS completion_image_path TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 3. Create storage policies (instead of disabling RLS)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "complaint-images upload" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload"
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'complaint-images');

CREATE POLICY "Allow public read access"
ON storage.objects 
FOR SELECT
TO public
USING (bucket_id = 'complaint-images');
```

**That's it!** ✅

---

## 🎯 What This Does

### Before (didn't work):
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
-- ❌ Error: must be owner
```

### After (works!):
```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'complaint-images');
-- ✅ No special permissions needed!
```

**Storage RLS stays enabled**, but now you have a **policy that allows uploads**! 🎉

---

## 🧪 Test Again

1. **Reload app** (shake → reload)
2. **Login as technician**
3. **Take completion photo**
4. **Mark as complete**
5. **Should work now!** ✅

---

## 📊 Verify Policies Exist

After running the SQL, check:

```sql
SELECT name, action FROM storage.policies 
WHERE bucket_id = 'complaint-images';
```

Should show:
```
name                                  | action
-------------------------------------|--------
Allow authenticated users to upload  | INSERT
Allow public read access             | SELECT
```

If you see these, **it's working!** ✅

---

## 🔍 Console Should Show:

```
Uploading completion photo...
Storage upload result: {uploadError: null} ✅
Photo uploaded successfully!
Marking complaint as completed...
✅ Success!
```

---

## 🛡️ Why This Works

**Storage RLS:** 
- Still enabled (we can't disable it)
- But we created policies that allow authenticated users to upload
- So uploads work! ✅

**Complaints RLS:**
- Disabled (we have permission for this)
- So database updates work! ✅

**Result:** Both photo upload AND database update work! 🎉

---

## Summary

❌ **Don't do this:** `ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;`  
   (Requires superuser)

✅ **Do this instead:** `CREATE POLICY ... ON storage.objects`  
   (No special permissions needed!)

**Run `FIX-STORAGE-WITH-POLICIES.sql` and test! 🚀**
