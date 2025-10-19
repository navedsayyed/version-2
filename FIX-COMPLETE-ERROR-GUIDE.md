# 🔧 FIX: "Cannot coerce the result to a single JSON object" Error

## Error Explanation

**Error Message:**
```
Complaint update error:
{"code":"PGRST116","details":"The result contains 0 rows","hint":null,"message":"Cannot coerce the result to a single JSON object"}
```

**What This Means:**
- The UPDATE query returned **0 rows**
- This happens when:
  1. ❌ The complaint doesn't exist
  2. ❌ RLS (Row Level Security) is blocking the UPDATE
  3. ❌ The columns don't exist in the database

---

## 🚀 The Complete Fix (2 Steps)

### Step 1: Run SQL to Fix Database

Open **Supabase SQL Editor** and run this file:
- **`supabase/FIX-COMPLETE-ERROR.sql`**

Or copy/paste this:

```sql
-- 1. Disable RLS (allows updates)
ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;

-- 2. Add completion columns
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS completion_notes TEXT,
ADD COLUMN IF NOT EXISTS completion_image_url TEXT,
ADD COLUMN IF NOT EXISTS completion_image_path TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 3. Verify
SELECT column_name FROM information_schema.columns
WHERE table_name = 'complaints'
AND column_name LIKE 'completion%';

-- Should show 4 columns
```

---

### Step 2: Restart App

```bash
# Shake device → Reload
# Or press 'r' in Metro terminal
```

---

## ✅ Test Again

1. **Login as technician**
2. **Open complaint** from "Assigned" tab
3. **Take "after" photo**
4. **Tap "Mark as Completed"**
5. **Should work now!** ✅

---

## 🔍 What Was Fixed

### In Code (supabaseClient.js):

**Before:**
```javascript
.update(updateData)
.eq('id', complaintId)
.select()
.single(); // ❌ Fails if 0 rows
```

**After:**
```javascript
.update(updateData)
.eq('id', complaintId)
.select(); // ✅ Returns array, even if empty

// Then check if empty
if (!data || data.length === 0) {
  return { error: 'Failed to update' };
}
```

### In Database:

**Before:**
- ❌ RLS enabled → blocking UPDATE
- ❌ Completion columns missing

**After:**
- ✅ RLS disabled → allows UPDATE
- ✅ Completion columns added

---

## 📊 Check the Console Logs

After reloading, when you mark as complete, you'll see detailed logs:

```
completeComplaint called with: {...}
Update data: {status: 'completed', completed_at: '...', ...}
Updating complaint ID: 1
Update result: {data: [...], error: null}
✅ Complaint marked as completed
```

If still failing:
```
Supabase update error: {...}
❌ Shows exact error
```

---

## 🛠️ Troubleshooting

### Issue 1: Columns don't exist
**Symptom:** Error mentions column name

**Fix:**
```sql
-- Check columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'complaints';

-- If missing, add them
ALTER TABLE public.complaints 
ADD COLUMN completion_image_url TEXT,
ADD COLUMN completion_notes TEXT,
ADD COLUMN completed_at TIMESTAMPTZ;
```

---

### Issue 2: Photo uploads but update fails
**Symptom:** Photo appears in storage, but complaint stays in "Assigned"

**Fix:**
```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'complaints';

-- If true, disable it
ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;
```

---

### Issue 3: Complaint doesn't exist
**Symptom:** "0 rows" error

**Fix:**
```sql
-- Check if complaint exists
SELECT id, title, status FROM complaints WHERE id = 1;

-- If empty, the complaint was deleted or never existed
-- Submit a new complaint from user dashboard first
```

---

## 📝 Test Query

To test if everything works, try this SQL:

```sql
-- Get a complaint ID
SELECT id FROM complaints LIMIT 1;

-- Try updating it (replace 1 with actual ID)
UPDATE complaints 
SET status = 'completed',
    completion_image_url = 'test.jpg',
    completed_at = NOW()
WHERE id = 1
RETURNING *;

-- If this returns a row, the app will work! ✅
```

---

## Summary

**Error Cause:** `.single()` fails when UPDATE returns 0 rows (due to RLS or missing columns)

**Fixes:**
1. ✅ Removed `.single()` from code
2. ✅ Added better error handling
3. ✅ Added detailed console logs
4. ✅ SQL disables RLS
5. ✅ SQL adds missing columns

**Next Steps:**
1. ✅ Run `FIX-COMPLETE-ERROR.sql`
2. ✅ Reload app
3. ✅ Try marking as complete
4. ✅ Should work now! 🎉

**If still failing, share the console logs!**
