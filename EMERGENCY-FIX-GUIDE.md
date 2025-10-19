# 🚨 EMERGENCY FIX - Image Upload Error

## ❌ Current Problem
**Error:** `StorageApiError: new row violates row-level security policy`

**Status:** Complaint created ✅ but image upload fails ❌

---

## ✅ **FASTEST FIX (Do This Now!)**

### **Step 1: Run SQL** (2 minutes)

1. **Open:** `supabase/EMERGENCY-FIX.sql`
2. **Copy ALL** the code
3. **Go to:** [Supabase SQL Editor](https://app.supabase.com/project/oeazkkxhvmmthysjdklk/sql/new)
4. **Paste** and click **RUN**
5. **Check results:**
   - `rowsecurity = f` (RLS disabled) ✅
   - `public = t` (bucket is public) ✅

---

### **Step 2: Dashboard Storage Policy** (1 minute)

**You MUST do this - SQL alone is not enough!**

#### **Option A: Make Bucket Fully Public (Easiest!)**

1. Go to: [Storage Buckets](https://app.supabase.com/project/oeazkkxhvmmthysjdklk/storage/buckets)
2. Find: **`complaint-images`**
3. Click **3 dots (•••)** → **"Edit bucket"**
4. Toggle **"Public bucket"** to **ON** ✅
5. Click **"Save"**
6. ✅ **Done!**

#### **Option B: Create Storage Policy** (More Control)

1. Go to: [Storage Buckets](https://app.supabase.com/project/oeazkkxhvmmthysjdklk/storage/buckets)
2. Click on **`complaint-images`** bucket
3. Click **"Policies"** tab
4. Click **"New Policy"**
5. Choose: **"Give users access to a folder only to authenticated users"**
6. Click **"Use this template"**
7. Click **"Review"** → **"Save policy"**
8. ✅ **Done!**

---

### **Step 3: Test** (30 seconds)

1. **Force quit** your React Native app
2. **Restart** the app
3. **Login**
4. **Fill complaint form**
5. **Add image**
6. **Submit**
7. **Expected:** ✅ No errors! Image uploads!

---

## 🔍 **What This Fix Does**

### **SQL Part:**
```sql
ALTER TABLE public.complaint_images DISABLE ROW LEVEL SECURITY;
```
- ✅ Removes all database RLS restrictions on `complaint_images` table
- ✅ Any authenticated user can insert/read image records

### **Dashboard Part:**
- ✅ Allows authenticated users to upload files to storage
- ✅ Allows anyone to read/view images (public bucket)

---

## 🎯 **Why Both Steps Are Needed**

**Two separate RLS checks happen during upload:**

1. **Storage RLS** → Dashboard policies control this
   - Without this: `storage.objects` RLS blocks the upload
   - Fix: Dashboard → Make bucket public OR create storage policy

2. **Table RLS** → SQL controls this
   - Without this: `complaint_images` table RLS blocks insert
   - Fix: SQL → Disable RLS on table

**Both must pass for upload to succeed!**

---

## 🆘 **If Still Not Working**

### **Check 1: Is bucket created?**

Run in SQL Editor:
```sql
SELECT * FROM storage.buckets WHERE id = 'complaint-images';
```

**If 0 rows returned**, create the bucket:

**Via Dashboard:**
1. Storage → **"New bucket"**
2. Name: `complaint-images`
3. Public: ✅ **Yes**
4. Click **"Create bucket"**

**OR via SQL** (uncomment lines in `EMERGENCY-FIX.sql`):
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-images', 'complaint-images', true);
```

### **Check 2: Verify RLS is disabled**

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'complaint_images';
```

Should show: `rowsecurity = f` ✅

**If still `t` (true)**, run again:
```sql
ALTER TABLE public.complaint_images DISABLE ROW LEVEL SECURITY;
```

### **Check 3: Clear app cache**

Sometimes React Native caches Supabase errors:

```bash
# In your project terminal:
npx expo start --clear
```

Then restart app and test.

---

## ✨ **Expected Result After Fix**

### **Before:**
1. ❌ Fill form
2. ❌ Add image
3. ❌ Submit
4. ❌ Error: "StorageApiError: new row violates row-level security policy"
5. ❌ Warning: "Complaint created but image upload failed"

### **After:**
1. ✅ Fill form
2. ✅ Add image
3. ✅ Submit
4. ✅ "Submitted!" message
5. ✅ Complaint appears in "My Complaints" **with image**
6. ✅ No errors!

---

## 📊 **Verify in Supabase Dashboard**

After successful upload:

### **1. Check Complaint:**
- **Table Editor** → `complaints`
- Your complaint row exists ✅

### **2. Check Image File:**
- **Storage** → `complaint-images` → `complaints` folder
- Image file exists (e.g., `123_1696608000000.jpg`) ✅

### **3. Check Image Record:**
- **Table Editor** → `complaint_images`
- Row with `complaint_id` and `url` exists ✅

---

## 🔐 **Security Note**

This fix **disables RLS** for development/testing.

**For production**, you'd want proper policies like:

```sql
-- Re-enable RLS
ALTER TABLE public.complaint_images ENABLE ROW LEVEL SECURITY;

-- Create secure policy
CREATE POLICY "Users can insert images for their complaints"
ON public.complaint_images FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.complaints
    WHERE id = complaint_id 
    AND user_id = auth.uid()
  )
);
```

But for now, **let's just get it working!** ✅

---

## 📝 **Quick Checklist**

- [ ] Ran `EMERGENCY-FIX.sql` in Supabase SQL Editor
- [ ] Verified `rowsecurity = f` in results
- [ ] Made bucket public in Dashboard (Option A) **OR**
- [ ] Created storage policy in Dashboard (Option B)
- [ ] Force quit and restarted app
- [ ] Tested upload - it worked! ✅

---

## 🎊 **You're Done!**

After completing both steps (SQL + Dashboard), your image upload will work! 🚀

**Test it and let me know!**
