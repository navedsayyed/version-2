# 🚨 QUICK FIX: Database Setup for HOD System

## ⚠️ Error You're Seeing:
```
Could not find the 'complaint_type' column of 'complaints' in the schema cache
```

## ✅ Solution: Run This SQL Script

### 🎯 Copy & Paste This Into Supabase SQL Editor:

```sql
-- ============================================================================
-- COMPLETE DATABASE MIGRATION FOR HOD SYSTEM
-- ============================================================================

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

-- Verify
SELECT '✅ Migration complete!' as status;
```

---

## 📋 Complete Setup Order

### 1️⃣ **Run Migration** (ABOVE SQL) ⚡ DO THIS NOW!
   - Adds `department` to users table
   - Adds `complaint_type` to complaints table

### 2️⃣ **Create HOD Accounts**
   - Go to Supabase → Authentication → Users
   - Create 5 accounts with @ggsf.edu.in emails
   - Copy their UUIDs

### 3️⃣ **Update & Run setup_hod_profiles.sql**
   - Replace UUIDs in the file
   - Run in SQL Editor

### 4️⃣ **Run setup_technicians.sql** (Already has UUIDs!)
   - Just copy and paste entire file
   - Run in SQL Editor

### 5️⃣ **Test!**
   - Submit complaint as user
   - Login as HOD
   - See complaint in dashboard ✅

---

## 🎯 What Each Column Does

**`users.department`**
- Stores: `Civil`, `Electrical`, `Mechanical`, `IT`, `Housekeeping`
- Used by: HODs and Technicians
- Example: Bhimrao has `department = 'Electrical'`

**`complaints.complaint_type`**
- Stores: `Civil`, `Electrical`, `Mechanical`, `IT`, `Housekeeping`
- Mapped from user's selection (e.g., "electrical" → "Electrical")
- Used to route complaints to correct HOD
- Example: `complaint_type = 'Electrical'` → only Electrical HOD sees it

---

## 🐛 Why You Got the Error

Your complaints table was missing the `complaint_type` column that the code expects.

The system flow:
1. User selects "electrical" ❌ Column missing → ERROR
2. System tries to store `complaint_type = "Electrical"` ❌ 

After running migration:
1. User selects "electrical" ✅
2. System stores `complaint_type = "Electrical"` ✅
3. Electrical HOD sees it ✅

---

## ✅ After Running Migration

You can now:
- ✅ Submit complaints (no more error!)
- ✅ Complaints route to correct HOD
- ✅ HODs see only their department complaints
- ✅ System works as designed!

---

**File to run:** `database/COMPLETE_MIGRATION.sql`  
**Or:** Just copy the SQL code above into Supabase SQL Editor!

🚀 **This will fix your error immediately!**
