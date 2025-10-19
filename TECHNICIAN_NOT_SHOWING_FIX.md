# Technician Not Showing - Troubleshooting Guide

## Problem
- Login as IT Department Admin
- Technicians screen shows **0 Total Technicians**
- **Add (+) button not visible**
- Message: "No technicians assigned yet"

---

## ✅ FIXES APPLIED

### Fix 1: FAB Button Position
**Problem:** Add button hidden behind bottom navigation bar

**Solution:**
```javascript
fab: {
  bottom: 90,  // Moved up from 24
  zIndex: 999, // Added to ensure visibility
  elevation: 8 // Increased from 6
}
```

**Result:** The blue (+) button should now be visible above the bottom navigation

---

### Fix 2: Debug Logging Added
**Location:** Console/Terminal where Expo runs

**What to check:**
```
=== HOD PROFILE ===
HOD Department: IT (or Civil, Electrical, Mechanical)
HOD Role: admin
HOD Full Name: Your Name

=== LOADING TECHNICIANS ===
Department: IT
All technicians in database: [array]
Technicians for this department: [filtered array]
Number of technicians found: 0 (or actual count)
```

---

## 🔍 DIAGNOSIS STEPS

### Step 1: Check Console Logs

1. **Reload the app** (shake phone → reload, or press R in terminal)
2. **Check terminal/console** for debug output
3. **Look for:**
   - What department does admin have?
   - How many total technicians exist?
   - Do technicians match the department?

### Step 2: Verify Button Visibility

After reloading:
- Look at **bottom-right corner** of Technicians screen
- Should see a **blue circular button** with **+** icon
- Button should be **above** the bottom navigation bar

### Step 3: Check Database

Run this in **Supabase SQL Editor**:

```sql
-- Check all technicians
SELECT email, full_name, role, department 
FROM public.users 
WHERE role = 'technician';

-- Check IT department specifically
SELECT email, full_name, role, department 
FROM public.users 
WHERE role = 'technician' AND department = 'IT';
```

---

## 🐛 POSSIBLE ISSUES & SOLUTIONS

### Issue 1: Department Name Mismatch ❌

**Symptom:** Console shows different department names

Example:
```
Admin has: "IT"
Technicians have: "Information Technology"
OR
Admin has: "IT"
Technicians have: "it" (lowercase)
```

**Solution:** Make department names **EXACTLY** match (case-sensitive!)

Fix admin:
```sql
UPDATE public.users 
SET department = 'IT'
WHERE id = 'your-admin-id';
```

Fix technicians:
```sql
UPDATE public.users 
SET department = 'IT'
WHERE role = 'technician' AND department ILIKE '%it%';
```

---

### Issue 2: No Technicians Exist ❌

**Symptom:** 
```
All technicians in database: []
Number of technicians found: 0
```

**Solution:** Add technicians using the app!

1. **Click the blue (+) button** (should be visible now)
2. **Fill form:**
   - Full Name: Rajesh Kumar
   - Email: rajesh.it@test.com
   - Phone: 9876543210
   - Password: test123
3. **Click "Add Technician"**
4. **Share credentials** with technician

**Alternative:** Add via Supabase Dashboard
1. Go to **Authentication → Users**
2. Click **"Add User"**
3. Enter:
   - Email: tech1@test.com
   - Password: test123456
   - Confirm password
4. Click **"Create User"**
5. Go to **Table Editor → users table**
6. Click **"Insert row"**
7. Enter:
   ```
   id: [paste UUID from auth.users]
   email: tech1@test.com
   full_name: Rajesh Kumar
   phone: 9876543210
   role: technician
   department: IT
   ```
8. Click **"Save"**

---

### Issue 3: Wrong Role ❌

**Symptom:** Users exist but not showing

**Check:**
```sql
SELECT email, role FROM public.users WHERE email = 'tech@example.com';
```

**Solution:** Fix role
```sql
UPDATE public.users 
SET role = 'technician'
WHERE email = 'tech@example.com';
```

---

### Issue 4: Wrong Department ❌

**Symptom:** Technicians exist but in different department

**Check:**
```sql
SELECT email, department FROM public.users WHERE role = 'technician';
```

Shows:
```
tech1@test.com | Civil
tech2@test.com | Electrical
```

But you're logged in as **IT Admin**!

**Solution:** Reassign technicians
```sql
UPDATE public.users 
SET department = 'IT'
WHERE email IN ('tech1@test.com', 'tech2@test.com');
```

---

### Issue 5: Auth Account Missing ❌

**Symptom:** User in `users` table but can't login

**Check:**
```sql
-- Check users table
SELECT id, email FROM public.users WHERE role = 'technician';

-- Then check auth
-- Go to Authentication → Users in Supabase Dashboard
-- Look for matching emails
```

**Solution:** 
- Either delete user from `users` table and re-add via app
- Or create auth account manually in Supabase Dashboard

---

## ✅ VERIFICATION CHECKLIST

After fixes:

- [ ] **Reload app** (shake device → reload)
- [ ] **Check console logs** appear
- [ ] **Blue (+) button visible** at bottom-right
- [ ] Button is **above bottom navigation**
- [ ] Click **+ button** opens modal
- [ ] Modal shows **correct department**
- [ ] Fill form and **add test technician**
- [ ] **Success message** appears
- [ ] List **refreshes automatically**
- [ ] New technician **appears in list**
- [ ] **Count updates** (0 → 1)

---

## 🎯 QUICK TEST

### Test Scenario: Add First Technician to IT

1. **Login:** IT Admin credentials
2. **Navigate:** Admin Dashboard → Technicians tab
3. **Verify:** Blue (+) button visible bottom-right
4. **Click:** + button
5. **Fill:**
   ```
   Full Name: Rajesh Kumar
   Email: rajesh.it@test.com
   Phone: 9876543210
   Password: test12345
   ```
6. **Check:** Department badge shows "📍 IT Department"
7. **Submit:** Click "Add Technician"
8. **Wait:** 2-3 seconds
9. **Success:** Alert shows credentials
10. **Verify:** List shows 1 technician
11. **Test Login:** Logout → Login as rajesh.it@test.com

**Expected Result:** ✅ All steps pass

---

## 📊 EXPECTED CONSOLE OUTPUT

```
=== HOD PROFILE ===
HOD Department: IT
HOD Role: admin
HOD Full Name: Naved Sayyed

=== LOADING TECHNICIANS ===
Department: IT
All technicians in database: [
  {
    id: "abc-123-def",
    email: "rajesh.it@test.com",
    full_name: "Rajesh Kumar",
    role: "technician",
    department: "IT"
  }
]
Technicians for this department: [
  {
    id: "abc-123-def",
    email: "rajesh.it@test.com",
    full_name: "Rajesh Kumar",
    role: "technician",
    department: "IT",
    assignedWork: 0,
    completedWork: 0
  }
]
Number of technicians found: 1
```

---

## 🚨 EMERGENCY FIX

If nothing works, run this SQL to add a test technician directly:

```sql
-- 1. First create auth account in Supabase Dashboard:
--    Authentication → Users → Add User
--    Email: test.tech@example.com
--    Password: test123456

-- 2. Then run this (replace 'YOUR_ADMIN_DEPARTMENT' with your actual department):
INSERT INTO public.users (id, email, full_name, phone, role, department)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test.tech@example.com'),
  'test.tech@example.com',
  'Test Technician',
  '1234567890',
  'technician',
  'IT'  -- Change to: Civil, Electrical, or Mechanical if needed
);
```

---

## 📝 WHAT TO SHARE

If still not working, share:

1. **Console logs** (copy entire output)
2. **Screenshot** of Technicians screen
3. **SQL query results:**
   ```sql
   SELECT role, department, COUNT(*) 
   FROM public.users 
   GROUP BY role, department;
   ```

---

## Summary

**Status After Fixes:**
- ✅ FAB button position corrected (bottom: 90, zIndex: 999)
- ✅ Debug logging enabled
- ✅ Ready to add technicians via UI
- ✅ SQL scripts provided for manual fixes

**Next Action:**
1. Reload app
2. Check if (+) button appears
3. Check console logs
4. Try adding a technician
5. Share console output if issues persist
