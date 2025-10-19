# 🔧 Storage Policies Setup - Dashboard Method

## ⚠️ Why Dashboard Instead of SQL?

Supabase's storage policies can't be directly modified via SQL `INSERT/DELETE` statements. 
You need to use the **Supabase Dashboard** interface.

---

## 📋 Step-by-Step Guide

### **Step 1: Run the SQL Fix First**

1. Open: `supabase/fix-storage-policies.sql`
2. Copy all the code
3. Paste in [Supabase SQL Editor](https://app.supabase.com/project/oeazkkxhvmmthysjdklk/sql/new)
4. Click **RUN**
5. ✅ This fixes the `complaint_images` table policies

---

### **Step 2: Set Up Storage Policies in Dashboard**

#### **A. Navigate to Storage Settings**

1. Go to [Supabase Dashboard](https://app.supabase.com/project/oeazkkxhvmmthysjdklk)
2. Click **Storage** in left sidebar
3. Find your bucket: **`complaint-images`**
4. Click on **`complaint-images`**
5. Click **"Policies"** tab at the top

---

#### **B. Create Policy 1: Allow Uploads**

Click **"New Policy"** button

**Option 1: Use Template (Easiest!)**
- Find template: **"Allow authenticated uploads"**
- Click **"Use this template"**
- Leave everything as default
- Click **"Review"**
- Click **"Save policy"**

**Option 2: Custom Policy**
```
Policy Name: Allow authenticated uploads
Allowed Operations: ✅ INSERT
Target Roles: authenticated
Policy Definition: (bucket_id = 'complaint-images')
```

---

#### **C. Create Policy 2: Allow Reads**

Click **"New Policy"** again

**Option 1: Use Template (Easiest!)**
- Find template: **"Allow public access"** or **"Allow public reads"**
- Click **"Use this template"**
- Leave everything as default
- Click **"Review"**
- Click **"Save policy"**

**Option 2: Custom Policy**
```
Policy Name: Allow public reads
Allowed Operations: ✅ SELECT
Target Roles: public, authenticated
Policy Definition: (bucket_id = 'complaint-images')
```

---

### **Step 3: Verify Policies Are Active**

In the **Policies** tab, you should see:

✅ **Policy 1:** Allow authenticated uploads (INSERT)
✅ **Policy 2:** Allow public reads (SELECT)

---

## 🎯 Alternative: Make Bucket Fully Public (Simpler)

If you want the simplest solution:

1. Go to **Storage** → **complaint-images**
2. Click **"Settings"** tab
3. Toggle **"Public bucket"** to **ON** ✅
4. This allows anyone to read, authenticated users to upload

---

## 🧪 Test After Setup

1. Open your React Native app
2. Fill out a complaint form
3. Add an image (camera or gallery)
4. Click **Submit**
5. **Expected:** ✅
   - "Submitted!" message
   - No RLS errors
   - Image appears in "My Complaints"

---

## 📸 Quick Screenshots Guide

### Where to Find Policies:
```
Dashboard → Storage → complaint-images → Policies Tab
```

### What You'll See:
- **New Policy** button (top right)
- List of existing policies
- Templates to choose from

---

## 🆘 If Still Getting RLS Error

### Quick Fix: Disable RLS Temporarily

Run this in SQL Editor to test if storage is the issue:

```sql
-- Disable RLS on complaint_images table temporarily
ALTER TABLE public.complaint_images DISABLE ROW LEVEL SECURITY;
```

Test image upload. If it works, the issue is table RLS, not storage.

Then re-enable:
```sql
-- Re-enable RLS
ALTER TABLE public.complaint_images ENABLE ROW LEVEL SECURITY;
```

---

## ✅ Final Checklist

After completing all steps:

- [ ] Ran `fix-storage-policies.sql` in SQL Editor
- [ ] Created "Allow authenticated uploads" policy in Dashboard
- [ ] Created "Allow public reads" policy in Dashboard
- [ ] Bucket is marked as **Public** ✅
- [ ] Tested image upload in app
- [ ] Image appears in "My Complaints"

---

## 🎊 You're Done!

Once both policies are set up in the Dashboard, your image upload will work perfectly! 🚀

The two-part fix:
1. ✅ **SQL:** Fixed `complaint_images` table RLS
2. ✅ **Dashboard:** Set up storage bucket policies

Both are needed for successful image uploads!
