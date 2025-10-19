# 🎯 EXACT DASHBOARD FIX - Follow These Steps

## ⚠️ **YOU MUST DO THIS - SQL ALONE WON'T WORK!**

The SQL you ran disabled the **table** RLS, but storage bucket has **separate** policies that can ONLY be set in the Dashboard.

---

## 📍 **METHOD 1: Make Bucket Public** (30 seconds - EASIEST!)

### **Step-by-Step:**

1. **Open this URL:**
   ```
   https://app.supabase.com/project/oeazkkxhvmmthysjdklk/storage/buckets
   ```

2. **You'll see a list of buckets**
   - Look for: `complaint-images`

3. **Click the 3 dots (•••)** on the right side of `complaint-images`

4. **Click "Edit bucket"**

5. **You'll see a toggle:**
   - **"Public bucket"**
   - Toggle it to **ON** (should turn green/blue)

6. **Click "Save"** at the bottom

7. **✅ DONE!** Now test your app.

---

## 📍 **METHOD 2: Create Storage Policy** (2 minutes - More secure)

### **Step-by-Step:**

1. **Open this URL:**
   ```
   https://app.supabase.com/project/oeazkkxhvmmthysjdklk/storage/buckets
   ```

2. **Click on the bucket name:** `complaint-images`
   (Not the 3 dots - click the actual name)

3. **You'll see tabs at the top**
   - Click **"Policies"** tab

4. **Click "New Policy"** button (top right, green button)

5. **You'll see policy templates**
   - Find: **"Give users access to a folder only to authenticated users"**
   - This is usually the 3rd option

6. **Click that template**

7. **Click "Use this template"** button (bottom right)

8. **Review screen will appear**
   - Don't change anything
   - Click "Save policy"

9. **✅ DONE!** Now test your app.

---

## 🔍 **How to Verify It Worked**

### **Check 1: Bucket is Public (if you used Method 1)**

1. Go to: https://app.supabase.com/project/oeazkkxhvmmthysjdklk/storage/buckets
2. Look at `complaint-images` bucket
3. You should see a **badge or icon** indicating it's public

### **Check 2: Policy Exists (if you used Method 2)**

1. Go to: https://app.supabase.com/project/oeazkkxhvmmthysjdklk/storage/buckets
2. Click on `complaint-images`
3. Click "Policies" tab
4. You should see **at least 1 policy listed**

---

## 🧪 **Test Your App After Dashboard Fix**

1. **Force quit** your React Native app (swipe up and close it)
2. **Restart** the app
3. **Login**
4. **Go to New Complaint tab**
5. **Fill the form:**
   - Title: "Test"
   - Type: Choose any
   - Location: "Test location"
   - Place: "Test place"
   - Description: "Test description"
6. **Add an image** (camera or gallery)
7. **Click "Submit Complaint"**
8. **Expected:** ✅
   - "Submitted!" message appears
   - NO errors in console
   - Image appears in "My Complaints" tab

---

## 🆘 **If Still Not Working**

### **Check: Did you do BOTH steps?**

- ✅ **Step 1:** Ran `EMERGENCY-FIX.sql` in SQL Editor
- ✅ **Step 2:** Did Dashboard fix (Method 1 OR Method 2)

**Both are required!**

### **Check: Is bucket created?**

Run in SQL Editor:
```sql
SELECT * FROM storage.buckets WHERE id = 'complaint-images';
```

**If you see 0 rows**, the bucket doesn't exist! Create it:

1. Go to: Storage → Buckets
2. Click "New bucket"
3. Name: `complaint-images`
4. Public: ✅ YES
5. Click "Create bucket"

Then try uploading again.

### **Check: Clear Metro cache**

Sometimes React Native caches errors:

```bash
# Stop your app
# Then run:
npx expo start --clear
```

Restart app and test.

---

## 📊 **What Each Part Does**

### **SQL Fix (you already did this):**
- ✅ Disables RLS on `complaint_images` **table**
- ✅ Allows inserting image records into database

### **Dashboard Fix (you MUST do this):**
- ✅ Allows **uploading files** to storage bucket
- ✅ This is WHY you still get errors!

**Storage has its own separate RLS system!**

---

## 🎬 **Video Guide** (If you're stuck)

If you can't find the settings, here's exactly where to click:

### **For Method 1 (Public Bucket):**
```
Dashboard → Storage (left sidebar)
→ Find "complaint-images" in list
→ Click 3 dots (•••) on right
→ "Edit bucket"
→ Toggle "Public bucket" ON
→ Save
```

### **For Method 2 (Policies):**
```
Dashboard → Storage (left sidebar)
→ Click "complaint-images" (the name, not dots)
→ "Policies" tab at top
→ "New Policy" button
→ Choose template "Give users access..."
→ "Use this template"
→ "Save policy"
```

---

## ✨ **After You Do This**

The upload will finally work because:

1. ✅ Table RLS disabled (SQL) → Can insert records
2. ✅ Storage policy set (Dashboard) → Can upload files

Both checks will pass! ✅

---

## 📝 **Quick Checklist**

Before testing:

- [ ] Ran `EMERGENCY-FIX.sql` ✅ (you did this)
- [ ] Did Dashboard fix (Method 1 OR 2) ⏳ **← DO THIS NOW!**
- [ ] Force quit and restarted app
- [ ] Tested upload

---

**Do the Dashboard fix (Method 1 is fastest) and test again!** 🚀

The Dashboard step is **not optional** - it's **required** for storage uploads to work!
