# Floor-Specific Admin Management Setup

## Overview
This update adds **floor-specific filtering** for admins, allowing multiple admins for the same department to manage different floors independently.

## Changes Made

### 1. Database Schema Update
Added `floor` column to `users` table to store floor assignment for admins and technicians.

### 2. Complaint Filtering Logic
Admins now see only complaints from their assigned floor(s).

### 3. UI Updates
Admin dashboard header now shows floor assignment: "Civil Department - Floor 2"

## Setup Instructions

### Step 1: Run Database Migration

1. Open Supabase SQL Editor
2. Run the SQL script: `supabase/ADD_FLOOR_TO_USERS.sql`
3. This will:
   - Add `floor` column to users table
   - Update existing users with default floor values

### Step 2: Create Floor 2 Admin (Umakant Butkar - First Year HOD)

**Option A: If umakant.butkar@ggsf.edu.in already has an account:**

```sql
-- Update existing account to be Floor 2 Admin
UPDATE public.users
SET 
  role = 'admin',
  department = NULL,        -- Not department-specific
  floor = '2',             -- Manages ALL of Floor 2
  full_name = 'Umakant Butkar',
  phone = '+91-XXXXXXXXXX' -- Update with real number
WHERE email = 'umakant.butkar@ggsf.edu.in';
```

**Option B: If account doesn't exist yet:**

1. Create auth account in Supabase Dashboard:
   - Go to Authentication → Users → Add User
   - Email: `umakant.butkar@ggsf.edu.in`
   - Password: (set temporary password)
   - Auto Confirm User: ✅ (check this)

2. Copy the User ID (UUID) from the created account

3. Run this SQL (replace USER_ID and phone):
```sql
INSERT INTO public.users (id, email, full_name, role, department, floor, phone)
VALUES (
  'PASTE_USER_ID_HERE',
  'umakant.butkar@ggsf.edu.in',
  'Umakant Butkar',
  'admin',
  NULL,              -- Not department-specific
  '2',               -- Floor 2 (First Year)
  '+91-XXXXXXXXXX'   -- Real phone number
);
```

### Step 3: Keep Existing Department Admins (Type-Based)

Your existing department admins (Civil, IT, Electrical, etc.) should have NO floor restriction:

```sql
-- Make sure department admins see all floors
UPDATE public.users
SET floor = NULL  -- NULL = manage by complaint type, not floor
WHERE role = 'admin'
  AND email != 'umakant.butkar@ggsf.edu.in';
```

### Step 4: Verify Setup

Check that everything is configured correctly:

```sql
SELECT 
  email, 
  full_name, 
  role, 
  department, 
  floor
FROM public.users
WHERE department = 'Civil' 
  AND role IN ('admin', 'technician')
ORDER BY role, floor;
```

Expected result:
```
| Email                          | Full Name       | Role  | Department  | Floor |
|-------------------------------|-----------------|-------|-------------|-------|
| civil_hod@email.com           | Civil HOD       | admin | Civil       | NULL  |
| it_hod@email.com              | IT HOD          | admin | IT          | NULL  |
| umakant.butkar@ggsf.edu.in   | Umakant Butkar  | admin | NULL        | 2     |
| tech1@email.com               | Technician 1    | tech  | Civil       | 1,2   |
```

**Explanation:**
- Civil HOD, IT HOD: `floor = NULL` → See all complaints of their type
- Umakant Butkar: `floor = 2`, `department = NULL` → Sees all Floor 2 complaints
- Technicians: Assigned to specific floors they service

## How It Works

### Two Types of Admins

**1. Floor-Based Admin (Manages Physical Floor)**
- **Example:** Umakant Butkar - First Year HOD, Floor 2
- **Assignment:** `floor = '2'`, `department = NULL`
- **Sees:** ALL complaints from Floor 2 (any type: IT, Electrical, Civil, etc.)
- **Use Case:** Year coordinators, floor supervisors who manage a physical location

**2. Department-Based Admin (Manages Complaint Type)**
- **Example:** Civil HOD, IT HOD, Electrical HOD
- **Assignment:** `floor = NULL`, `department = 'Civil'`
- **Sees:** ALL complaints of their department type (from any floor)
- **Use Case:** Department heads who manage specific technical areas

### Admin Priority Logic

**PRIORITY 1: Floor Assignment (if exists)**
- If admin has `floor = '2'` → Shows ONLY Floor 2 complaints (ignores type/department)
- This is for physical location managers

**PRIORITY 2: Department Assignment (if no floor)**
- If admin has `department = 'Civil'` and `floor = NULL` → Shows Civil complaints from all floors
- This is for technical department heads

### Complaint Routing Examples

**Example 1: QR Code Scan - Floor 2, IT Issue**
```json
{"class":"201","floor":"2","department":"IT","building":"A"}
```
**Who sees it?**
- ✅ Umakant Butkar (Floor 2 Admin) - Because it's Floor 2
- ❌ IT HOD - Only if they don't have floor restriction
- **Reason:** Floor-based admin has PRIORITY

**Example 2: QR Code Scan - Floor 3, Electrical Issue**
```json
{"class":"305","floor":"3","department":"Electrical","building":"B"}
```
**Who sees it?**
- ✅ Electrical HOD - Because it's Electrical type
- ❌ Umakant Butkar - Because it's not Floor 2
- **Reason:** Department-based routing when no floor admin exists

**Example 3: No QR Code - Infrastructure Type**
- User selects type = "Infrastructure" (no floor info)
- **Who sees it?**
  - ✅ Civil HOD - Because Infrastructure → Civil department
  - ❌ Umakant Butkar - Because no floor specified
  - **Reason:** Falls back to type-based routing

### Technician Assignment

Technicians can be assigned to multiple floors:
- `floor = "1"` → Only Floor 1
- `floor = "2"` → Only Floor 2  
- `floor = "1,2"` → Both Floor 1 and 2
- `floor = null` → All floors in their department

## Testing

### Test Case 1: Floor 2 Admin (Umakant Butkar) - ANY Type
1. Login as umakant.butkar@ggsf.edu.in
2. Check dashboard header shows: "Floor 2" (no department name)
3. Scan Floor 2 QR code: `{"class":"201","floor":"2","department":"IT","building":"A"}`
4. Submit complaint with type = "IT/Technical"
5. **Expected:** Umakant sees it (Floor 2, even though IT type)
6. **Expected:** IT HOD also sees it (IT type)

### Test Case 2: Floor 2 Admin - Different Types
1. Login as umakant.butkar@ggsf.edu.in
2. Create multiple complaints from Floor 2:
   - IT issue (Floor 2, type=IT)
   - Electrical issue (Floor 2, type=Electrical)
   - Civil issue (Floor 2, type=Infrastructure)
3. **Expected:** Umakant sees ALL of them (all are Floor 2)
4. **Expected:** Each department HOD also sees their type

### Test Case 3: Department HOD - All Floors
1. Login as Civil HOD
2. Create complaints:
   - Floor 1, type=Infrastructure
   - Floor 3, type=Infrastructure
   - Floor 5, type=Infrastructure
3. **Expected:** Civil HOD sees ALL (all are Civil/Infrastructure type)
4. **Expected:** Floor 2 admin does NOT see them (not Floor 2)

### Test Case 4: No QR Code - Type-Based
1. Submit complaint without QR code, type = "IT/Technical"
2. Complaint has no floor info
3. **Expected:** Only IT HOD sees it (type-based routing)
4. **Expected:** Umakant does NOT see it (no floor info)

## Future Enhancements

### Possible Additions:
1. **Floor selector in admin dashboard** - Switch between assigned floors
2. **Multi-floor view** - Option to see all department floors
3. **Floor-based statistics** - Separate stats for each floor
4. **Technician-floor assignment UI** - Assign technicians to floors from app
5. **Complaint transfer** - Move complaint between floors

## Rollback Plan

If you need to revert the changes:

```sql
-- Remove floor restrictions (all admins see all department complaints)
UPDATE public.users
SET floor = NULL
WHERE role = 'admin';

-- Or remove the floor column entirely
ALTER TABLE public.users
DROP COLUMN IF EXISTS floor;
```

## Support

For any issues:
1. Check Supabase logs for errors
2. Verify floor values are correctly set in users table
3. Ensure complaint floor values match admin floor values
4. Check that RLS policies allow the queries

## Summary

✅ **What Changed:**
- Added floor column to users table
- Admins filter complaints by floor
- UI shows floor assignment
- Supports multiple admins per department (different floors)

✅ **What Stays Same:**
- Complaint submission flow unchanged
- QR code format unchanged
- Technician workflow unchanged
- Type-based routing unchanged

✅ **Benefits:**
- Better workload distribution among admins
- Clear floor responsibility
- Reduces admin dashboard clutter
- Scalable for large buildings with many floors
