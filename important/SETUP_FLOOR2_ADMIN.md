# Complete Setup Guide: Add Floor 2 Admin (Umakant Butkar)

## What You Need:
- ✅ Email: umakant.butkar@ggsf.edu.in
- ✅ Name: Umakant Butkar
- ✅ Phone: (you have this)
- ✅ Password: (create a temporary one, they can change later)

---

## Step 1: Add Floor Column to Database

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com
   - Login to your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and paste this SQL:**

```sql
-- Add floor column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS floor TEXT;
```

4. **Click "RUN"** button (bottom right)
5. **Wait for success message:** ✅ "Success. No rows returned"

---

## Step 2: Create Authentication Account

1. **Go to Authentication**
   - Click "Authentication" in left sidebar
   - Click "Users" tab

2. **Click "Add User" button** (top right)

3. **Fill in the form:**
   - **Email:** `umakant.butkar@ggsf.edu.in`
   - **Password:** Create a strong temporary password (min 6 characters)
   - **Auto Confirm User:** ✅ **CHECK THIS BOX** (important!)
   - Leave other fields empty

4. **Click "Create User"**

5. **IMPORTANT: Copy the User ID**
   - After user is created, you'll see a list
   - Find the new user in the list
   - Click on the user row
   - **COPY THE ID** (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
   - Save this ID somewhere temporarily

---

## Step 3: Create User Profile

1. **Go back to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

2. **Copy this SQL and REPLACE the values:**

```sql
-- Create profile for Umakant Butkar (Floor 2 Admin)
INSERT INTO public.users (id, email, full_name, role, department, floor, phone)
VALUES (
  'PASTE_USER_ID_HERE',           -- ⚠️ Replace with the ID you copied
  'umakant.butkar@ggsf.edu.in',
  'Umakant Butkar',
  'admin',
  'First Year',
  '2',
  '+91-XXXXXXXXXX'                -- ⚠️ Replace with real phone number
);
```

3. **BEFORE RUNNING - Replace these:**
   - Replace `PASTE_USER_ID_HERE` with the actual User ID you copied
   - Replace `+91-XXXXXXXXXX` with the real phone number

4. **Example after replacing:**
```sql
INSERT INTO public.users (id, email, full_name, role, department, floor, phone)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- ✅ Real ID
  'umakant.butkar@ggsf.edu.in',
  'Umakant Butkar',
  'admin',
  'First Year',
  '2',
  '+91-9876543210'                          -- ✅ Real phone
);
```

5. **Click "RUN"**

6. **Wait for success:** ✅ "Success. 1 row inserted"

---

## Step 4: Verify It Worked

1. **Still in SQL Editor, run this query:**

```sql
-- Check if user was created correctly
SELECT 
  email, 
  full_name, 
  role, 
  department, 
  floor, 
  phone
FROM public.users
WHERE email = 'umakant.butkar@ggsf.edu.in';
```

2. **Click "RUN"**

3. **You should see this result:**

```
| email                         | full_name      | role  | department  | floor | phone          |
|------------------------------|----------------|-------|-------------|-------|----------------|
| umakant.butkar@ggsf.edu.in  | Umakant Butkar | admin | First Year  | 2     | +91-9876543210 |
```

✅ If you see this, **SUCCESS!**

---

## Step 5: Test Login

1. **Open your app**
2. **Login with:**
   - Email: `umakant.butkar@ggsf.edu.in`
   - Password: (the temporary password you created)

3. **You should see:**
   - HOD Dashboard opens
   - Header shows: "First Year Department - Floor 2"
   - Can see all complaints from Floor 2

---

## Step 6: Send Credentials to Admin

Send this message to Umakant Butkar:

```
Hello Umakant Sir,

Your admin account for ComplaintPro has been created:

Email: umakant.butkar@ggsf.edu.in
Password: [temporary password]

Please login to the app and change your password.

You will manage all complaints from Floor 2 (First Year).

Thank you!
```

---

## What This Admin Can Do:

✅ **See ALL complaints from Floor 2** (IT, Electrical, Civil, Mechanical - all types)
✅ **Manage Floor 2 technicians** (can add technicians for Floor 2)
✅ **View Floor 2 statistics**
✅ **Assign complaints to technicians**

---

## Troubleshooting

### ❌ Problem: "Email already exists"
**Solution:** The email is already registered. Use Step 3 with UPDATE instead:

```sql
UPDATE public.users
SET 
  full_name = 'Umakant Butkar',
  role = 'admin',
  department = 'First Year',
  floor = '2',
  phone = '+91-XXXXXXXXXX'
WHERE email = 'umakant.butkar@ggsf.edu.in';
```

### ❌ Problem: "User not found after login"
**Solution:** Check if profile was created:

```sql
SELECT * FROM public.users WHERE email = 'umakant.butkar@ggsf.edu.in';
```

If empty, repeat Step 3.

### ❌ Problem: "Dashboard shows wrong department"
**Solution:** Update the profile:

```sql
UPDATE public.users
SET department = 'First Year', floor = '2'
WHERE email = 'umakant.butkar@ggsf.edu.in';
```

---

## Summary

✅ Step 1: Add floor column to database
✅ Step 2: Create auth account in Supabase
✅ Step 3: Create user profile with INSERT
✅ Step 4: Verify with SELECT query
✅ Step 5: Test login in app
✅ Step 6: Send credentials to admin

**Total time:** ~5 minutes

---

## Need Help?

If something goes wrong:
1. Check Supabase SQL Editor for error messages
2. Verify the User ID was copied correctly
3. Make sure "Auto Confirm User" was checked
4. Check if email already exists in users table
5. Verify RLS policies allow the insert

---

**You're ready to add the Floor 2 Admin!** 🎉
