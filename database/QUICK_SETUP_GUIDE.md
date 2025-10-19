# 🚀 Quick Setup Guide - Fix "Technician has no department assigned"

## ⚠️ Current Issue
You're getting the error: **"Technician has no department assigned"**

This happens because your database doesn't have:
1. The `department` column in the `users` table
2. The `complaint_type` column in the `complaints` table
3. Technician profiles with assigned departments

## 📋 Setup Steps (Follow in Order)

### Step 1: Run Database Migration ✅
**This adds the missing columns**

1. Open **Supabase Dashboard** → Go to your project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy **ALL** contents from `COMPLETE_MIGRATION.sql` and paste
5. Click **Run** (or press Ctrl+Enter)
6. ✅ You should see: "Success. No rows returned"

---

### Step 2: Create Technician Auth Accounts 🔐
**Create login accounts for your 12 technicians**

1. In Supabase Dashboard → Go to **Authentication** → **Users**
2. Click **Add user** → Select **Create new user**
3. Create these 12 accounts:

**Civil Department (2 technicians):**
- Email: `rajesh.kumar@tech.com`, Password: `Tech@1234`
- Email: `amit.sharma@tech.com`, Password: `Tech@1234`

**Electrical Department (3 technicians):**
- Email: `suresh.patil@tech.com`, Password: `Tech@1234`
- Email: `vikram.singh@tech.com`, Password: `Tech@1234`
- Email: `anil.desai@tech.com`, Password: `Tech@1234`

**Mechanical Department (2 technicians):**
- Email: `manish.gupta@tech.com`, Password: `Tech@1234`
- Email: `rahul.verma@tech.com`, Password: `Tech@1234`

**IT Department (3 technicians):**
- Email: `prashant.joshi@tech.com`, Password: `Tech@1234`
- Email: `deepak.reddy@tech.com`, Password: `Tech@1234`
- Email: `kiran.mehta@tech.com`, Password: `Tech@1234`

**Housekeeping Department (2 technicians):**
- Email: `santosh.yadav@tech.com`, Password: `Tech@1234`
- Email: `ramesh.nair@tech.com`, Password: `Tech@1234`

4. After creating each user, **copy their UUID** (the ID shown in the user list)

---

### Step 3: Update Technician SQL Script 📝

1. Open `setup_technicians.sql` in your editor
2. Replace the UUIDs with the ones you copied in Step 2
3. Match them correctly:
   - **Line 2**: Rajesh Kumar (Civil) → Replace UUID
   - **Line 3**: Amit Sharma (Civil) → Replace UUID
   - **Line 6**: Suresh Patil (Electrical) → Replace UUID
   - **Line 7**: Vikram Singh (Electrical) → Replace UUID
   - **Line 8**: Anil Desai (Electrical) → Replace UUID
   - And so on...

---

### Step 4: Run Technician Setup SQL ✅

1. Go back to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy the **updated** `setup_technicians.sql` (with your UUIDs)
4. Click **Run**
5. ✅ You should see: "Success. No rows returned"

---

### Step 5: Verify Setup ✅

Run this query in SQL Editor to check:

```sql
-- Check if departments were added
SELECT full_name, email, role, department 
FROM users 
WHERE role = 'technician'
ORDER BY department;
```

You should see all 12 technicians with their departments!

---

## 🧪 Test the Fix

1. **Restart your app** (stop Expo and run `npm start` again)
2. **Login as a technician**:
   - Email: `suresh.patil@tech.com`
   - Password: `Tech@1234`
3. **Check Profile Tab**:
   - Should show "Electrical" department ✅
   - Should show real name, email, phone
4. **Check Assigned Tab**:
   - Should only show electrical complaints (if any exist)
   - No more "Technician has no department assigned" error ✅

---

## 🐛 Troubleshooting

### Error: "column users.department does not exist"
→ You didn't run Step 1 (COMPLETE_MIGRATION.sql)

### Error: "Technician has no department assigned"
→ You didn't run Step 4 (setup_technicians.sql) OR the UUIDs don't match

### Profile shows dummy data
→ Fixed! The profile screen now loads real data from database

### Technician sees all complaints (not just their department)
→ Fixed! Both dashboard screens now filter by department

---

## 📝 What Changed in Code

### ✅ Fixed Files:
1. **TechnicianDashboard.js** - Now filters complaints by technician's department
2. **CompletedWorkScreen.js** - Now filters completed complaints by department
3. **TechnicianProfileScreen.js** - Now loads real profile from database (not dummy data)

### 🔧 Database Changes:
- Added `department` column to `users` table
- Added `complaint_type` column to `complaints` table
- Indexes added for better performance

---

## 🎯 After Setup, Your System Will:

✅ Show technicians only their department's complaints
✅ Show real profile data (name, email, phone, department)
✅ Filter complaints automatically by department
✅ No more "department not assigned" errors

---

**Need Help?** Check the main `DEPLOYMENT_GUIDE.md` for detailed explanations.
