# 🚨 FINAL FIX: Storage Upload Error Solution

## 🎯 The Problem

Error: `StorageApiError: new row violates row-level security policy`

This happens when trying to insert into `complaint_images` table OR upload to storage bucket.

---

## ✅ **SIMPLEST SOLUTION** (Do This!)

### **Step 1: Run the SQL Fix**

1. **Open:** `supabase/disable-rls-fix.sql`
2. **Copy** all the code
3. **Go to:** [Supabase SQL Editor](https://app.supabase.com/project/oeazkkxhvmmthysjdklk/sql/new)
4. **Paste** and click **RUN**

This will:
- ✅ Disable RLS on `complaint_images` table (no more table restrictions)
- ✅ Make storage bucket public

---

### **Step 2: Set Storage Policies in Dashboard**

#### **Navigate:**
```
https://app.supabase.com/project/oeazkkxhvmmthysjdklk/storage/buckets
```

#### **Visual Steps:**

1. **Find your bucket:**
   - Look for: `complaint-images`
   - You'll see it in the list

2. **Click on the bucket name:** `complaint-images`

3. **Click the "Policies" tab** (at the top)

4. **Click "New Policy"** button (top right)

5. **You'll see policy templates:**
   
   **Option A: Use "Allow public access" template** (Recommended!)
   - Click **"Allow public access"**
   - Click **"Use this template"**
   - Click **"Review"**
   - Click **"Save policy"**
   - ✅ Done!

   **Option B: Use "Allow authenticated uploads"**
   - Click **"Allow authenticated uploads"**
   - Click **"Use this template"**
   - Click **"Review"**
   - Click **"Save policy"**
   - Then create another policy: "Allow public reads"
   - ✅ Done!

6. **Verify:** You should see at least 1 policy listed

---

### **Alternative: Just Make Bucket Public** (Even Simpler!)

1. Go to: [Storage Buckets](https://app.supabase.com/project/oeazkkxhvmmthysjdklk/storage/buckets)

2. Find `complaint-images` bucket

3. Click the **3 dots (•••)** on the right side

4. Click **"Edit bucket"**

5. **Toggle "Public bucket" to ON** ✅

6. Click **"Save"**

7. **Done!** This bypasses all RLS for storage.

---

## 🧪 **Test After Fix**

1. **Close your app completely** (force quit)
2. **Restart the app**
3. **Login**
4. **Fill complaint form**
5. **Add an image**
6. **Submit**
7. **Expected:** 
   - ✅ "Submitted!" message
   - ✅ No errors
   - ✅ Image appears in "My Complaints"

---

## 🔍 **Verify in Supabase Dashboard**

### **Check 1: Complaint Created**
- Go to: Table Editor → `complaints`
- Your complaint should be there ✅

### **Check 2: Image Uploaded to Storage**
- Go to: Storage → `complaint-images` bucket
- Open `complaints` folder
- You should see image files ✅

### **Check 3: Image Record in Database**
- Go to: Table Editor → `complaint_images`
- You should see a row with:
  - `complaint_id`: Your complaint ID
  - `url`: Public URL to image
  - `storage_path`: Path in storage ✅

---

## 🆘 **If Still Not Working**

### **Check 1: Is Bucket Created?**

Run in SQL Editor:
```sql
SELECT * FROM storage.buckets WHERE id = 'complaint-images';
```

**No results?** Create the bucket:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-images', 'complaint-images', true);
```

### **Check 2: Is RLS Disabled?**

Run in SQL Editor:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'complaint_images';
```

Should show `rowsecurity: f` (false = disabled) ✅

**Still shows `t` (true)?** Run:
```sql
ALTER TABLE public.complaint_images DISABLE ROW LEVEL SECURITY;
```

### **Check 3: Test Storage Upload Directly**

Try uploading a file manually in Dashboard:
1. Go to Storage → `complaint-images`
2. Click **"Upload file"**
3. Select any image
4. Click **"Upload"**

**If this fails**, the bucket needs policies set in Dashboard (Step 2 above).

---

## 📊 **What Each Fix Does**

### **SQL Fix (disable-rls-fix.sql):**
```sql
ALTER TABLE public.complaint_images DISABLE ROW LEVEL SECURITY;
```
- Removes all restrictions on `complaint_images` table
- Any authenticated user can insert/read
- **Pro:** Simple, works immediately
- **Con:** Less secure (but fine for development)

### **Dashboard Storage Policy:**
- Allows uploads to storage bucket
- Without this, files can't be saved to storage
- **Must be done in Dashboard** (can't be done via SQL)

---

## ✨ **Expected Result**

After both fixes:

1. ✅ User fills form
2. ✅ User adds image
3. ✅ User clicks Submit
4. ✅ Complaint created in `complaints` table
5. ✅ Image uploaded to Storage bucket
6. ✅ Image record inserted in `complaint_images` table
7. ✅ Image appears in "My Complaints" list
8. ✅ No RLS errors!

---

## 🔐 **Security Note**

Disabling RLS is fine for development and testing. 

For production, you'd want proper policies like:
```sql
-- Only allow users to insert images for their own complaints
CREATE POLICY "Users own images"
  ON complaint_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints 
      WHERE id = complaint_id 
      AND user_id = auth.uid()
    )
  );
```

But for now, let's just get it working! ✅

---

## 📝 **Summary**

**Two steps:**
1. ✅ Run `disable-rls-fix.sql` (disables table RLS)
2. ✅ Set storage policy in Dashboard (allows storage uploads)

**Then test!** Should work perfectly. 🚀

Let me know after you complete both steps!
