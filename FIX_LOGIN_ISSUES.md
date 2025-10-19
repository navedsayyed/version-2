# Fix Technician Login Issues

## 🚨 Problem

**Error when adding technician:**
```
duplicate key value violates unique constraint "users_pkey"
```

**Symptoms:**
- ✅ Profile appears in database
- ❌ Error message shown in app
- ❌ Can't login with credentials
- ❌ "Credentials not correct" error

---

## 🔍 Why This Happens

When you call `supabase.auth.signUp()`:

1. ✅ **Auth account created** in `auth.users` table
2. 🔄 **Supabase trigger might auto-create profile** in `public.users`
3. ❌ **Your app tries to insert profile** → Duplicate error!
4. ❌ **Profile might have wrong data** (empty role, no department)

**Result:** Auth account exists, but profile is incomplete or has wrong info.

---

## ✅ Solution

### Part 1: Fix the Code (Already Done!)

I've updated `AdminTechniciansScreen.js` to:
- ✅ Use `upsert` instead of `insert` (handles duplicates)
- ✅ Add 1-second delay for triggers to complete
- ✅ Pass user data in auth.signUp options

### Part 2: Fix Existing Broken Users

Run the SQL in `FIX_EXISTING_TECHNICIAN.sql` to fix users that are already created but broken.

---

## 🔧 Fix Existing User (shaikhrayyan@gmail.com)

### Step 1: Check Current State

Run this in Supabase SQL Editor:

```sql
-- Check if auth account exists
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'shaikhrayyan@gmail.com';

-- Check if profile exists  
SELECT id, email, full_name, role, department
FROM public.users
WHERE email = 'shaikhrayyan@gmail.com';
```

### Step 2: Fix the Profile

```sql
-- Update profile with correct information
UPDATE public.users
SET 
  full_name = 'Rayyan Shaikh',
  role = 'technician',
  department = 'Civil',  -- Change to correct department
  phone = '+91-9876543210'  -- Add phone if available
WHERE email = 'shaikhrayyan@gmail.com';
```

### Step 3: Confirm Email (Important!)

```sql
-- Manually confirm the email
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'shaikhrayyan@gmail.com';
```

### Step 4: Test Login

1. **Reload your app**
2. **Try login:**
   - Email: `shaikhrayyan@gmail.com`
   - Password: (whatever you entered when creating)
3. **Should work now!** ✅

---

## 🎯 For Future Technician Additions

### The Fixed Code Will:

1. ✅ Create auth account
2. ✅ Wait 1 second for triggers
3. ✅ **Upsert** profile (updates if exists, inserts if not)
4. ✅ No more duplicate errors
5. ✅ Correct data always

### To Add New Technician Now:

1. Reload your app (to get fixed code)
2. Click + button
3. Fill form:
   ```
   Name: Test Technician 2
   Email: test2@example.com
   Phone: 9876543210
   Password: test123456
   ```
4. Click "Add Technician"
5. Should work without errors! ✅

---

## 🐛 Troubleshooting

### Issue 1: Still can't login after fixing

**Try:**
```sql
-- Check email is confirmed
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email = 'shaikhrayyan@gmail.com';
```

If `email_confirmed_at` is NULL:
```sql
UPDATE auth.users
SET email_confirmed_at = NOW(), confirmed_at = NOW()
WHERE email = 'shaikhrayyan@gmail.com';
```

### Issue 2: "User already registered" when adding

**This means:**
- Auth account exists
- But profile might be wrong

**Solution:**
```sql
-- Just update the existing profile
UPDATE public.users
SET 
  full_name = 'Correct Name',
  role = 'technician',
  department = 'Correct Department',
  phone = 'Correct Phone'
WHERE email = 'existing@email.com';

-- And confirm email
UPDATE auth.users
SET email_confirmed_at = NOW(), confirmed_at = NOW()
WHERE email = 'existing@email.com';
```

### Issue 3: Multiple duplicate users in auth

**Check:**
```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'shaikhrayyan@gmail.com'
ORDER BY created_at DESC;
```

**If multiple exist, delete old ones:**
```sql
-- Keep only the newest (copy its ID first)
DELETE FROM auth.users 
WHERE email = 'shaikhrayyan@gmail.com' 
AND id != 'PASTE_NEWEST_ID_HERE';
```

---

## 📋 Complete Fix Checklist

For **shaikhrayyan@gmail.com** (or any broken user):

- [ ] Run Step 1 queries (check current state)
- [ ] Run Step 2 (update profile with correct data)
- [ ] Run Step 3 (confirm email)
- [ ] Reload app
- [ ] Test login
- [ ] Should work! ✅

For **future additions**:

- [ ] Reload app to get fixed code
- [ ] Try adding new technician
- [ ] Should work without errors! ✅

---

## 🎉 Summary

**Root Cause:**
- Supabase auto-creates profile via trigger
- App tries to insert again → Duplicate error
- Profile might have wrong data

**Fix Applied:**
- ✅ Code updated to use `upsert`
- ✅ Added delay for triggers
- ✅ SQL provided to fix existing users

**Next Steps:**
1. Run SQL to fix `shaikhrayyan@gmail.com`
2. Reload app
3. Test login
4. Try adding new technician
5. Everything should work! 🚀

---

## 📞 Quick Fix Commands

**Fix existing user:**
```sql
UPDATE public.users SET full_name='Rayyan Shaikh', role='technician', department='Civil' WHERE email='shaikhrayyan@gmail.com';
UPDATE auth.users SET email_confirmed_at=NOW(), confirmed_at=NOW() WHERE email='shaikhrayyan@gmail.com';
```

**Test:**
- Login with: shaikhrayyan@gmail.com + password
- Should work! ✅
