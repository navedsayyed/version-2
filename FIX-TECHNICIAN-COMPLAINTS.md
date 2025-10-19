# 🔧 FIX: Technician Can't See User Complaints

## 🐛 **The Problem**
Technician logs in successfully but sees empty dashboard (no complaints), even though complaints exist in the database.

---

## 🎯 **Root Cause**
**RLS (Row Level Security)** is blocking the SELECT query!

When you disabled RLS on `complaint_images` table earlier, you didn't disable/fix it for the `complaints` table. 

The `complaints` table likely has:
- ✅ RLS enabled
- ❌ No SELECT policy (or restrictive policy)
- ❌ Result: Nobody can read complaints!

---

## ✅ **SOLUTION (Run This SQL)**

### **Quick Fix:**

**File:** `supabase/fix-technician-view-complaints.sql`

1. **Open SQL Editor:**
   ```
   https://app.supabase.com/project/oeazkkxhvmmthysjdklk/sql/new
   ```

2. **Run this SQL:**

```sql
-- Drop any restrictive SELECT policies
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow users to view own complaints" ON public.complaints;

-- Create new policy: Allow ALL authenticated users to read ALL complaints
CREATE POLICY "Allow authenticated users to view all complaints"
ON public.complaints FOR SELECT
TO authenticated
USING (true);

-- Verify it worked
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'complaints' AND cmd = 'SELECT';
```

3. **Expected result:**
   - Should see: `"Allow authenticated users to view all complaints"` with cmd = `SELECT` ✅

---

## 🧪 **Test the Fix:**

### **Step 1: Verify in SQL Editor**

Run this query to test:

```sql
-- This is the EXACT query your app uses
SELECT 
  c.id,
  c.title,
  c.status,
  c.created_at,
  u.full_name as reporter,
  ci.url as image
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN complaint_images ci ON c.id = ci.complaint_id
WHERE c.status = 'in-progress'
ORDER BY c.created_at DESC;
```

**Expected:** Should return rows with complaint data ✅

---

### **Step 2: Test in App**

1. **Restart your React Native app** (force quit)

2. **Check Metro console** (terminal)

3. **Login as technician:**
   - Email: `technician@test.com`
   - Password: `Test@123`

4. **Watch console logs:**
   ```
   TechnicianDashboard: Loading complaints...
   Complaints data received: [ { id: 1, title: '...', ... } ]
   Complaints count: 3
   ```

5. **Should see complaints on screen!** ✅
   - All user-submitted complaints
   - With photos
   - Status: In Progress

---

## 🔍 **Debug Console Logs**

I added detailed logging. You'll see:

### **If Working:**
```
TechnicianDashboard: Loading complaints...
Complaints data received: [ { id: ..., title: ..., ... } ]
Complaints count: 3
Formatted complaints: [ { id: ..., ... } ]
Setting complaints to state...
```

### **If RLS Blocking:**
```
TechnicianDashboard: Loading complaints...
Complaints data received: null
Complaints count: 0
No complaints found in database
```

### **If Other Error:**
```
Error loading complaints: { message: '...', ... }
```

---

## 🆘 **If Still Not Working:**

### **Check 1: Do Complaints Exist?**

```sql
SELECT COUNT(*) as total, status 
FROM complaints 
GROUP BY status;
```

**Expected:**
- Some rows with `status = 'in-progress'`
- If 0 rows, create a test complaint as user first

### **Check 2: Is RLS Enabled?**

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'complaints';
```

**Expected:**
- `rowsecurity = t` (true) → RLS is enabled
- If RLS is enabled, you NEED SELECT policy

### **Check 3: Do SELECT Policies Exist?**

```sql
SELECT policyname, cmd, using
FROM pg_policies
WHERE tablename = 'complaints' AND cmd = 'SELECT';
```

**Expected:**
- At least 1 SELECT policy
- `using` should be `true` or non-restrictive
- If 0 rows, no SELECT policy exists!

---

## 🚀 **Alternative Fix (Simplest)**

If you want the **fastest solution** for development:

```sql
-- Just disable RLS entirely on complaints table
ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'complaints';
-- Should show rowsecurity = f (false) ✅
```

**Pros:**
- ✅ Works immediately
- ✅ No policy needed
- ✅ Good for development

**Cons:**
- ❌ Less secure for production
- ❌ Anyone can read/write

---

## 📊 **What Each Solution Does:**

### **Option 1: Create SELECT Policy (Recommended)**
```sql
CREATE POLICY "..." ON complaints FOR SELECT USING (true);
```
- ✅ Allows all authenticated users to read all complaints
- ✅ Still blocks anonymous users
- ✅ Can add more rules later (e.g., technicians only)

### **Option 2: Disable RLS (Simplest)**
```sql
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
```
- ✅ No restrictions at all
- ✅ Good for development
- ⚠️ Less secure

---

## ✅ **Expected Result After Fix:**

### **Technician Dashboard Shows:**

```
┌─────────────────────────────────────┐
│ Assigned Work              🔔       │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Water Leak                      │ │
│ │ [Plumbing]                      │ │
│ │ 📍 Building A - 3rd Floor       │ │
│ │ 📅 10/6/2025                    │ │
│ │ Reported by: John Doe           │ │
│ │ Description text...             │ │
│ │ [Photo of issue]                │ │
│ │ Tap to view details →           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Broken Light                    │ │
│ │ [Electrical]                    │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**All complaints from all users** ✅

---

## 🎯 **Why This Happened:**

### **Timeline:**

1. ✅ Created complaints table with RLS enabled
2. ✅ Created INSERT policy (users can create complaints)
3. ❌ Never created SELECT policy (nobody can read!)
4. ❌ Result: Technician queries return 0 rows

### **The Fix:**

Add SELECT policy → Now authenticated users can read all complaints ✅

---

## 📝 **Summary:**

### **To Fix:**
1. ✅ Run `fix-technician-view-complaints.sql`
2. ✅ Verify SELECT policy created
3. ✅ Restart app
4. ✅ Login as technician
5. ✅ See all complaints with photos!

### **Files Created:**
- `supabase/diagnose-complaints-visibility.sql` - Full diagnostics
- `supabase/fix-technician-view-complaints.sql` - Quick fix
- `FIX-TECHNICIAN-COMPLAINTS.md` - This guide

---

## 🎊 **After the Fix:**

✅ Technicians see ALL in-progress complaints  
✅ From ALL users (not just their own)  
✅ With photos  
✅ With reporter names  
✅ Pull-to-refresh works  

---

**Run the SQL fix and test!** 🚀

Let me know what you see in the console logs after applying the fix!
