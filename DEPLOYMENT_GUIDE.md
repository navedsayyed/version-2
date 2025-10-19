# 🚀 HOD System Deployment Guide - UPDATED

## ⚠️ IMPORTANT: Database Schema Update Required!

Your `users` table is missing the `department` column. Follow these steps **IN ORDER**:

---

## 📋 Step-by-Step Deployment

### **STEP 1: Run Complete Database Migration** ⚡ CRITICAL - DO THIS FIRST!

Go to **Supabase Dashboard → SQL Editor**

Copy and paste the entire contents of **`database/COMPLETE_MIGRATION.sql`**

Or copy this:
```sql
-- Add department column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department TEXT;

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_department_check;

ALTER TABLE public.users
ADD CONSTRAINT users_department_check 
CHECK (department IS NULL OR department IN ('Civil', 'Electrical', 'Mechanical', 'IT', 'Housekeeping'));

CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);

-- Add complaint_type column to complaints table
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS complaint_type TEXT;

CREATE INDEX IF NOT EXISTS idx_complaints_complaint_type ON public.complaints(complaint_type);
```

Click **Run** ✅

**Verify it worked:**
You should see at the end of the results:
- `department` column in users table ✅
- `complaint_type` column in complaints table ✅

---

### **STEP 2: Create 5 HOD Auth Accounts** 👥

Go to **Supabase Dashboard → Authentication → Users → Add User**

Create these accounts **ONE BY ONE**:

1. **Email:** `ajay.chaudhari@ggsf.edu.in`
   - Password: [Choose secure password]
   - Auto Confirm: ✅ Yes

2. **Email:** `bhimrao.dabhade@ggsf.edu.in`
   - Password: [Choose secure password]
   - Auto Confirm: ✅ Yes

3. **Email:** `rohit.khandare@ggsf.edu.in`
   - Password: [Choose secure password]
   - Auto Confirm: ✅ Yes

4. **Email:** `pramod.patil@ggsf.edu.in`
   - Password: [Choose secure password]
   - Auto Confirm: ✅ Yes

5. **Email:** `vinayak.apsingkar@ggsf.edu.in`
   - Password: [Choose secure password]
   - Auto Confirm: ✅ Yes

---

### **STEP 3: Copy UUIDs** 📝

After creating each account, **copy their UUID** from the Authentication panel.

Example: `550e8400-e29b-41d4-a716-446655440000`

Write them down:
- Ajay Chaudhari UUID: `____________________`
- Bhimrao Dabhade UUID: `____________________`
- Rohit Khandare UUID: `____________________`
- Pramod Patil UUID: `____________________`
- Vinayak Apsingkar UUID: `____________________`

---

### **STEP 4: Update SQL Script** 📄

Open `database/setup_hod_profiles.sql`

**Find and Replace:**
- `REPLACE_WITH_AUTH_ID_1` → Ajay's UUID
- `REPLACE_WITH_AUTH_ID_2` → Bhimrao's UUID
- `REPLACE_WITH_AUTH_ID_3` → Rohit's UUID
- `REPLACE_WITH_AUTH_ID_4` → Pramod's UUID
- `REPLACE_WITH_AUTH_ID_5` → Vinayak's UUID

**Example:**
```sql
-- BEFORE:
'REPLACE_WITH_AUTH_ID_1'

-- AFTER:
'550e8400-e29b-41d4-a716-446655440000'
```

---

### **STEP 5: Run HOD Setup Script** 🚀

1. Go to **Supabase Dashboard → SQL Editor**
2. Copy **ENTIRE** content of `database/setup_hod_profiles.sql`
3. Paste and click **Run**

✅ You should see: **Success. No rows returned**

---

### **STEP 6: Verify HOD Profiles** ✅

Run this query in SQL Editor:
```sql
SELECT 
  full_name,
  email,
  role,
  department
FROM public.users
WHERE role = 'admin'
ORDER BY department;
```

**Expected Result:**
| full_name | email | role | department |
|-----------|-------|------|------------|
| Mr. Ajay Chaudhari | ajay.chaudhari@ggsf.edu.in | admin | Civil |
| Mr. Bhimrao Dabhade | bhimrao.dabhade@ggsf.edu.in | admin | Electrical |
| Mr. Vinayak Apsingkar | vinayak.apsingkar@ggsf.edu.in | admin | Housekeeping |
| Mr. Pramod Patil | pramod.patil@ggsf.edu.in | admin | IT |
| Mr. Rohit Khandare | rohit.khandare@ggsf.edu.in | admin | Mechanical |

---

### **STEP 7: Test HOD Login** 🧪

1. Open your app
2. Click **Login**
3. Use: `bhimrao.dabhade@ggsf.edu.in` + password
4. You should see **HOD Dashboard**
5. Department should show **"Electrical"**

---

## 🎯 What's Fixed

### ✅ Issues Resolved:
1. **Column name error** - Changed `name` → `full_name`
2. **Missing department column** - Added migration script
3. **Wrong email addresses** - Updated to real @ggsf.edu.in emails
4. **Database schema mismatch** - Fixed all column names

### ✅ Updated Files:
- `database/add_department_column.sql` - NEW! Adds department column
- `database/setup_hod_profiles.sql` - Updated with:
  - Real GGSF email addresses
  - Correct column names (`full_name` instead of `name`)
  - Real HOD first names (Ajay, Bhimrao, Rohit, Pramod, Vinayak)

---

## 📊 HOD Mapping

| HOD Name | Email | Department | Handles |
|----------|-------|------------|---------|
| Mr. Ajay Chaudhari | ajay.chaudhari@ggsf.edu.in | Civil | Wall, Ceiling, Floor, Door, Window |
| Mr. Bhimrao Dabhade | bhimrao.dabhade@ggsf.edu.in | Electrical | Electrical, Lighting, Power, AC, Heating |
| Mr. Rohit Khandare | rohit.khandare@ggsf.edu.in | Mechanical | Plumbing, Furniture |
| Mr. Pramod Patil | pramod.patil@ggsf.edu.in | IT | Network, Computer, Projector, Lab, Teaching |
| Mr. Vinayak Apsingkar | vinayak.apsingkar@ggsf.edu.in | Housekeeping | Cleanliness, Security |

---

## 🐛 Troubleshooting

### Error: "column 'name' does not exist"
✅ **FIXED** - We now use `full_name` column

### Error: "column 'department' does not exist"
⚡ **RUN STEP 1** - Add department column first!

### HOD can't login
- Check if email/password are correct
- Verify account was created in Supabase Auth
- Check if UUID was added to setup script

### HOD sees no complaints
- Submit a test complaint as a user first
- Make sure complaint type matches HOD's department
- Example: "Electrical" complaint → only Bhimrao sees it

---

## 📁 Files You Need

1. **database/add_department_column.sql** - Run THIS FIRST!
2. **database/setup_hod_profiles.sql** - Run after adding department column
3. **utils/departmentMapping.js** - Already created (automatic routing)
4. **config/supabaseClient.js** - Already updated (auto-mapping)

---

## ✨ System Flow

```
User selects "Electrical" complaint
         ↓
departmentMapping.js maps to "Electrical" department
         ↓
Stored as complaint_type = "Electrical"
         ↓
Mr. Bhimrao Dabhade (Electrical HOD) sees it
         ↓
Other HODs (Civil, IT, etc.) DON'T see it ✅
```

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Department column exists in users table
- ✅ All 5 HODs can login
- ✅ Each HOD sees their department name in dashboard
- ✅ User submits complaint → Goes to correct HOD
- ✅ Other HODs don't see that complaint
- ✅ No database errors

---

**Ready to deploy!** Follow the steps in order and you'll be good to go! 🚀
