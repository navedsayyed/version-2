# Fix Empty Technician Dashboard - Complete Guide

## Problem
You can login as technician, but the dashboard is empty. No complaints are showing even though users have submitted them.

## Root Cause
The `complaints` table has **Row Level Security (RLS)** enabled, but there's **no SELECT policy** that allows reading the data. Without a SELECT policy, even authenticated users can't read any rows.

---

## Solution: Run SQL to Create SELECT Policy

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Open your project: **version-2**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy and Paste This SQL

```sql
-- Create SELECT policy to allow reading complaints
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow users to view own complaints" ON public.complaints;

CREATE POLICY "Allow authenticated users to view all complaints"
ON public.complaints FOR SELECT
TO authenticated
USING (true);
```

### Step 3: Run the Query
- Click **Run** button (or press Ctrl+Enter)
- Wait for "Success" message

### Step 4: Verify It Works
Run this test query to see if data is now visible:

```sql
SELECT 
  c.id,
  c.title,
  c.status,
  u.full_name as reporter
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.status = 'in-progress';
```

**Expected Result:** Should show complaint rows with titles and reporter names ✅

---

## Test in Your App

### Step 1: Restart React Native
```bash
# Stop the current Metro bundler (Ctrl+C in terminal)
# Then restart:
npm start
```

### Step 2: Reload App
- In Expo Go app, shake device and tap "Reload"
- Or press `r` in Metro terminal

### Step 3: Login as Technician
- Email: `technician@test.com`
- Password: `Test@123`

### Step 4: Check Console Logs
Open Metro terminal and look for these logs:
```
TechnicianDashboard: Loading complaints...
Complaints data received: [Array of complaints]
Complaints count: 1 (or more)
Formatted complaints: [Array with full details]
```

### Step 5: Verify Dashboard
You should now see:
- ✅ Real complaint cards (not dummy data)
- ✅ Actual titles from database
- ✅ Reporter names from users
- ✅ Real photos if uploaded
- ✅ Actual submission dates

---

## Still Not Working?

### Check 1: Are there complaints in database?
Run this in SQL Editor:
```sql
SELECT COUNT(*) FROM complaints WHERE status = 'in-progress';
```
Should return at least 1. If it's 0, go to user dashboard and submit a complaint first.

### Check 2: Check RLS policies
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'complaints';
```
Should show the SELECT policy we just created.

### Check 3: Nuclear Option (Disable RLS entirely)
If SELECT policy still doesn't work, run this:
```sql
ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;
```
⚠️ This makes all complaints readable by anyone (less secure but works)

---

## What Changed?

### Before:
- ✅ Complaints table had INSERT policy (users could create complaints)
- ❌ No SELECT policy (nobody could read complaints)
- ❌ getAllComplaints() query returned empty array

### After:
- ✅ INSERT policy still exists (users can create)
- ✅ **NEW:** SELECT policy allows reading all complaints
- ✅ getAllComplaints() query returns real data
- ✅ Technician dashboard shows all complaints

---

## Summary

The issue was **PostgreSQL Row Level Security**. When RLS is enabled on a table, you need explicit policies for each operation (INSERT, SELECT, UPDATE, DELETE). The table had an INSERT policy (so users could submit complaints), but no SELECT policy (so nobody could read them back).

By creating a SELECT policy with `USING (true)`, we allow all authenticated users to read all complaints. This is perfect for technicians who need to see all work assignments!

**After running the SQL, restart your app and you should see all real complaints! 🎉**
