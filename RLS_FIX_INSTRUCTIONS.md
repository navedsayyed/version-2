# 🔥 URGENT FIX: Technicians Not Showing

## ✅ ROOT CAUSE FOUND!

The problem is **RLS (Row Level Security) Policy** on the `users` table.

Your current policy:
```sql
CREATE POLICY "Users can view their own profile"
  USING (auth.uid() = id);
```

This policy **ONLY** allows users to see **themselves**. So:
- ❌ Admins cannot see technicians
- ❌ Query returns 0 results
- ❌ All technicians: 0 (blocked by RLS)

---

## 🚀 SOLUTION

### Step 1: Run the Fix SQL

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy and paste** the contents of `FIX_RLS_POLICIES_NOW.sql`
4. **Click "Run"**

The file is located at:
```
supabase/FIX_RLS_POLICIES_NOW.sql
```

### Step 2: Verify the Fix

After running the SQL, run this to verify:

```sql
SELECT 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd, policyname;
```

You should see:
- ✅ `Users can view profiles` (SELECT)
- ✅ `Users can update their own profile` (UPDATE)
- ✅ `Enable insert for authenticated users` (INSERT)
- ✅ `Admins can insert technicians` (INSERT)

### Step 3: Test in Your App

1. **Reload your app** (shake device → reload)
2. **Login as IT Admin**
3. **Go to Technicians screen**
4. **You should now see:**
   - Total Technicians: X (not 0!)
   - List of all IT technicians
   - Blue (+) button to add more

---

## 📋 WHAT THE FIX DOES

The new RLS policy allows:

### ✅ Users Can View:
1. **Their own profile** (always)
2. **Technicians in same department** (if you're admin)
3. **Other users in same department** (if you're technician/admin)

### ✅ Admins Can:
1. **View all technicians** in their department
2. **Insert new technicians** (Add Technician button)
3. **Manage their team**

### ✅ Security Maintained:
- ❌ Users cannot see other departments
- ❌ Technicians cannot see admins from other departments
- ❌ Users can only update their own profile
- ✅ Department isolation maintained

---

## 🎯 TESTING

After applying the fix:

### Test 1: View Technicians
- Login as IT Admin
- Go to Technicians screen
- Should see all IT department technicians

### Test 2: Add Technician
- Click blue (+) button
- Fill form:
  ```
  Name: Test Tech
  Email: test@example.com
  Phone: 1234567890
  Password: test123
  ```
- Click "Add Technician"
- Should see success message
- List should update automatically

### Test 3: Cross-Department Isolation
- Login as Civil Admin
- Go to Technicians screen
- Should ONLY see Civil technicians (not IT)

---

## 📊 BEFORE vs AFTER

### BEFORE (Broken):
```
Query: SELECT * FROM users WHERE role='technician' AND department='IT'
Result: [] (empty - blocked by RLS)
Debug Alert: "All technicians: 0"
```

### AFTER (Fixed):
```
Query: SELECT * FROM users WHERE role='technician' AND department='IT'
Result: [{ Rajesh Kumar }, { Amit Sharma }, ...] (success!)
Debug Alert: "All technicians: 5" (or actual count)
```

---

## ⚠️ IMPORTANT

After running `FIX_RLS_POLICIES_NOW.sql`, you should:

1. ✅ Update your main schema.sql file (already done!)
2. ✅ Reload your app to see changes
3. ✅ Test adding a technician
4. ✅ Remove debug alerts later (if you want)

---

## 🎉 SUMMARY

**Problem:** RLS policy too restrictive
**Solution:** Updated policy to allow admins to view technicians
**Status:** ✅ Ready to fix!
**Action:** Run `FIX_RLS_POLICIES_NOW.sql` in Supabase SQL Editor

---

## Need Help?

If you still see 0 technicians after running the SQL:

1. Check SQL ran successfully (no errors)
2. Verify policies exist:
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'users';
   ```
3. Reload app completely (close and reopen)
4. Check console logs again (should show technicians now)
