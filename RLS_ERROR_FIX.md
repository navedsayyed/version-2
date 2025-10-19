# 🔒 RLS Policy Error - Complete Fix Guide

## 🐛 The Error

```
Error: new row violates row-level security policy for table "complaints"
Code: 42501
```

This means the Row Level Security (RLS) policy is blocking the insert because it thinks you're not authorized.

## 🔍 Root Causes

1. **Mismatched User IDs** - The `user_id` in complaint doesn't match `auth.uid()`
2. **User Not in Users Table** - User exists in `auth.users` but not in `public.users`
3. **Invalid Auth Token** - Authentication token expired or invalid
4. **RLS Policy Too Restrictive** - Policy logic has issues

## ✅ Solution Steps

### Step 1: Check if User Exists in Users Table

1. Go to Supabase Dashboard: https://app.supabase.com/project/oeazkkxhvmmthysjdklk/editor
2. Click **Table Editor** → **users** table
3. Look for your email address

**If user is NOT there:**

Run this in SQL Editor:
```sql
-- Check auth users
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL@example.com';

-- If user exists in auth but not in public.users, create profile:
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, '', 'user'
FROM auth.users
WHERE email = 'YOUR_EMAIL@example.com'
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Fix RLS Policy

Run this in Supabase SQL Editor:

```sql
-- Drop and recreate the INSERT policy
DROP POLICY IF EXISTS "Users can create their own complaints" ON public.complaints;

CREATE POLICY "Users can create their own complaints"
  ON public.complaints 
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );
```

### Step 3: Verify Authentication

Add this debug code to check user ID (temporary):

In your app, before submitting complaint:
```javascript
const { user } = await getCurrentUser();
console.log('Current user ID:', user?.id);
console.log('Current user email:', user?.email);
```

### Step 4: Test Insert Directly in SQL

Test if you can insert manually:

```sql
-- First, get your user ID
SELECT auth.uid(), auth.email();

-- Then try to insert
INSERT INTO public.complaints (user_id, title, type, description, location, place, status)
VALUES (
  auth.uid(),
  'Test Complaint',
  'electrical',
  'Test description',
  'Building A',
  'Room 101',
  'in-progress'
);
```

If this works but the app doesn't, it's an app authentication issue.
If this fails too, it's an RLS policy issue.

## 🔧 Code Changes Made

I updated the `submitComplaint` function to:

1. **Get fresh auth user** before submitting
2. **Use auth user ID directly** instead of cached currentUser
3. **Better error logging** to see what's failing

```javascript
// Get fresh auth user to ensure we have the correct ID
const { user: authUser, error: authError } = await getCurrentUser();

if (authError || !authUser) {
  Alert.alert('Error', 'You must be logged in to submit a complaint');
  return;
}

// Use fresh auth user ID
const complaintData = {
  user_id: authUser.id, // ✅ Correct auth ID
  title,
  type,
  // ...
};
```

## 🧪 Testing Steps

### 1. Logout and Login Again

```
1. Open app
2. Go to Profile → Logout (if available)
3. Login with your credentials
4. Try to submit complaint
```

This ensures you have a fresh auth token.

### 2. Check User Profile Exists

In Supabase Dashboard:
- Table Editor → users
- Find your email
- Should have: id, email, role = 'user'

### 3. Try Submitting Complaint

1. Fill form completely
2. Submit
3. Check console for logs: "Submitting complaint with user_id: ..."
4. If error, note the exact error message

## 🆘 Quick Fixes

### Option A: Temporarily Disable RLS (Testing Only!)

**⚠️ WARNING: Only for testing! Re-enable for production!**

```sql
-- DISABLE RLS for testing
ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;

-- Test your app, see if complaints submit

-- IMPORTANT: Re-enable RLS after testing!
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
```

### Option B: Simplify RLS Policy

Use a more permissive policy temporarily:

```sql
DROP POLICY IF EXISTS "Users can create their own complaints" ON public.complaints;

CREATE POLICY "Allow authenticated users to insert"
  ON public.complaints 
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

This allows ANY authenticated user to insert (less secure but good for testing).

## 🔍 Debugging Checklist

- [ ] User exists in `auth.users` table
- [ ] User exists in `public.users` table
- [ ] User's `id` matches in both tables
- [ ] User has `role = 'user'` in `public.users`
- [ ] RLS is enabled on `complaints` table
- [ ] INSERT policy exists for complaints
- [ ] Auth token is valid (login is recent)
- [ ] `user_id` in complaint matches `auth.uid()`

## 📋 SQL Queries to Run

### Check Everything:

```sql
-- 1. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'complaints';

-- 2. Check RLS policies
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'complaints';

-- 3. Check your user
SELECT id, email, role 
FROM public.users 
WHERE email = 'YOUR_EMAIL@example.com';

-- 4. Check auth user
SELECT id, email 
FROM auth.users 
WHERE email = 'YOUR_EMAIL@example.com';

-- 5. Test auth.uid()
SELECT auth.uid(), auth.email();
```

## ✨ Expected Behavior After Fix

1. ✅ Login works
2. ✅ User profile loads
3. ✅ Complaint form fills
4. ✅ Submit button pressed
5. ✅ Console shows: "Submitting complaint with user_id: {uuid}"
6. ✅ Complaint created in database
7. ✅ Success message appears
8. ✅ Complaint appears in "My Complaints"

## 🎯 Most Likely Issue

**User doesn't exist in `public.users` table**

This happens if:
- The trigger `on_auth_user_created` didn't fire
- User was created before the trigger was added
- Trigger has an error

**Fix:**
```sql
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'full_name', 'user'
FROM auth.users
WHERE email = 'YOUR_EMAIL@example.com'
ON CONFLICT (id) DO NOTHING;
```

## 📞 Still Not Working?

If none of this works:

1. **Export your schema** and share the error
2. **Check Supabase logs** in Dashboard → Logs
3. **Try with a new user** to isolate the issue
4. **Verify Supabase project URL and keys** are correct

---

## 🎊 Status After Fix

Once you run the SQL fixes and restart the app, complaint submission should work perfectly! ✅
