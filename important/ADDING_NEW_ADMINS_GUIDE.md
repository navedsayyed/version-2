# Complete Guide: Adding New Admins to ComplaintPro

This guide covers how to add new admins - both **floor-based admins** (like First Year) and **department-based admins** (like Civil, IT, etc.)

---

## Table of Contents
1. [Adding Floor-Based Admin (Year Coordinator, Floor Manager)](#1-adding-floor-based-admin)
2. [Adding Department-Based Admin (HOD of Technical Department)](#2-adding-department-based-admin)
3. [Quick Reference](#3-quick-reference)

---

## 1. Adding Floor-Based Admin
**Example:** Second Year HOD, Third Year HOD, Building Manager, etc.

These admins manage a **physical floor** and see ALL complaints from that floor (any type).

### Step 1: Update Database Constraint
Add the new department name to allowed values:

```sql
-- Add new department to constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_department_check;

ALTER TABLE public.users
ADD CONSTRAINT users_department_check 
CHECK (department IN (
  'Civil', 
  'IT', 
  'Electrical', 
  'Mechanical', 
  'Housekeeping', 
  'First Year',
  'Second Year',  -- ⭐ Add new department here
  'Third Year',   -- ⭐ Add another if needed
  'Fourth Year'   -- ⭐ And more...
) OR department IS NULL);
```

### Step 2: Update Floor Mapping in Code
Open: `utils/departmentMapping.js`

Find the `floorToDepartment` object and update:

```javascript
export const floorToDepartment = {
  '1': 'Civil',          // Floor 1
  '2': 'First Year',     // Floor 2 (First Year)
  '3': 'Second Year',    // ⭐ Floor 3 → Second Year
  '4': 'Third Year',     // ⭐ Floor 4 → Third Year
  '5': 'Fourth Year',    // ⭐ Floor 5 → Fourth Year
  // Add more as needed
};
```

### Step 3: Create Admin Account in Supabase

**3a. Create Authentication Account**
1. Open Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Fill in:
   - Email: `admin.email@college.edu`
   - Password: (temporary password)
   - ✅ Check "Auto Confirm User"
4. Click "Create User"
5. **COPY THE USER ID** (UUID)

**3b. Create User Profile**
Run this SQL (replace values):

```sql
INSERT INTO public.users (id, email, full_name, role, department, phone)
VALUES (
  'PASTE_USER_ID_HERE',           -- Paste copied UUID
  'admin.email@college.edu',      -- Admin email
  'Admin Full Name',              -- Admin name
  'admin',                        -- Role
  'Second Year',                  -- ⭐ Department name (matches step 1)
  '+91-XXXXXXXXXX'                -- Phone number
);
```

### Step 4: Verify
```sql
SELECT email, full_name, role, department
FROM public.users
WHERE email = 'admin.email@college.edu';
```

### Step 5: Test
1. Restart your app
2. Login with new admin credentials
3. Dashboard should show: "Second Year Department" (or whatever you named it)
4. Submit a complaint with Floor 3 QR code
5. Verify it appears for Second Year admin

---

## 2. Adding Department-Based Admin
**Example:** New HOD for a technical department (Sports, Library, Admin Office, etc.)

These admins manage a **complaint type** and see ALL complaints of their type (from any floor).

### Step 1: Update Database Constraint
Same as floor-based admin above:

```sql
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_department_check;

ALTER TABLE public.users
ADD CONSTRAINT users_department_check 
CHECK (department IN (
  'Civil', 
  'IT', 
  'Electrical', 
  'Mechanical', 
  'Housekeeping', 
  'First Year',
  'Sports',      -- ⭐ Add new department
  'Library',     -- ⭐ Add another
  'Accounts'     -- ⭐ And more...
) OR department IS NULL);
```

### Step 2: Update Complaint Type Mapping
Open: `utils/departmentMapping.js`

Find the `complaintTypeToDepartment` object and add new types:

```javascript
export const complaintTypeToDepartment = {
  // Existing mappings...
  'wall': 'Civil',
  'electrical': 'Electrical',
  // ... etc ...
  
  // ⭐ Add new complaint types for new department
  'sports-equipment': 'Sports',
  'playground': 'Sports',
  'sports-other': 'Sports',
  
  'books': 'Library',
  'reading-room': 'Library',
  'library-other': 'Library',
  
  'fees': 'Accounts',
  'payment': 'Accounts',
  'accounts-other': 'Accounts',
};
```

### Step 3: Create Admin Account
Same as Step 3 in floor-based admin:

```sql
INSERT INTO public.users (id, email, full_name, role, department, phone)
VALUES (
  'PASTE_USER_ID_HERE',
  'sports.hod@college.edu',
  'Sports HOD Name',
  'admin',
  'Sports',                    -- ⭐ Department name
  '+91-XXXXXXXXXX'
);
```

### Step 4: Verify & Test
Same as floor-based admin steps 4 and 5.

---

## 3. Quick Reference

### Summary Table

| Admin Type | What They Manage | What They See | Example |
|-----------|------------------|---------------|---------|
| **Floor-Based** | Physical floor | ALL complaints from that floor (any type) | First Year HOD → Floor 2 |
| **Department-Based** | Complaint type | ALL complaints of that type (any floor) | Civil HOD → Infrastructure issues |

### Files to Update

| Step | What | Where | How |
|------|------|-------|-----|
| 1 | Database constraint | Supabase SQL Editor | Add department name to CHECK constraint |
| 2a | Floor mapping (floor-based only) | `utils/departmentMapping.js` | Update `floorToDepartment` object |
| 2b | Type mapping (dept-based only) | `utils/departmentMapping.js` | Update `complaintTypeToDepartment` object |
| 3 | Create auth account | Supabase Dashboard | Authentication → Users → Add User |
| 4 | Create profile | Supabase SQL Editor | INSERT into public.users |
| 5 | Test | Mobile app | Login and verify |

### Complete SQL Template

```sql
-- Template for adding any new admin

-- Step 1: Update constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_department_check;
ALTER TABLE public.users ADD CONSTRAINT users_department_check 
CHECK (department IN ('Civil', 'IT', 'Electrical', 'Mechanical', 'Housekeeping', 
                      'First Year', 'NEW_DEPT_NAME_HERE') OR department IS NULL);

-- Step 2: Insert admin (after creating auth account)
INSERT INTO public.users (id, email, full_name, role, department, phone)
VALUES (
  'USER_ID_FROM_AUTH',
  'admin@email.com',
  'Admin Full Name',
  'admin',
  'NEW_DEPT_NAME_HERE',
  '+91-XXXXXXXXXX'
);

-- Step 3: Verify
SELECT * FROM public.users WHERE email = 'admin@email.com';
```

---

## Examples

### Example 1: Adding "Library" Department Admin

**1. Update constraint:**
```sql
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_department_check;
ALTER TABLE public.users ADD CONSTRAINT users_department_check 
CHECK (department IN ('Civil', 'IT', 'Electrical', 'Mechanical', 'Housekeeping', 
                      'First Year', 'Library') OR department IS NULL);
```

**2. Update `utils/departmentMapping.js`:**
```javascript
export const complaintTypeToDepartment = {
  // ... existing types ...
  'books': 'Library',
  'reading-room': 'Library',
  'library-card': 'Library',
  'library-other': 'Library',
};
```

**3. Create account and profile** (follow steps above)

**4. Update complaint form** (optional):
If you want users to select "Library" as a complaint type, update the complaint form options in `UserDashboard.js`.

---

### Example 2: Adding "Third Year" Floor Admin (Floor 6)

**1. Update constraint:**
```sql
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_department_check;
ALTER TABLE public.users ADD CONSTRAINT users_department_check 
CHECK (department IN ('Civil', 'IT', 'Electrical', 'Mechanical', 'Housekeeping', 
                      'First Year', 'Second Year', 'Third Year') OR department IS NULL);
```

**2. Update `utils/departmentMapping.js`:**
```javascript
export const floorToDepartment = {
  '1': 'Civil',
  '2': 'First Year',
  '3': 'Second Year',
  '6': 'Third Year',    // ⭐ Floor 6 → Third Year
};
```

**3. Create account and profile** with `department = 'Third Year'`

**4. Create Floor 6 QR codes:**
```json
{"class":"601","floor":"6","department":"Third Year","building":"A"}
```

---

## Troubleshooting

### ❌ Error: "violates check constraint users_department_check"
**Solution:** You forgot to update the constraint. Run Step 1 again.

### ❌ Error: "duplicate key value violates unique constraint"
**Solution:** User already exists. Use UPDATE instead of INSERT.

### ❌ Admin sees no complaints
**Solution:** 
- Check department name matches exactly (case-sensitive!)
- For floor-based: Check floor mapping in `departmentMapping.js`
- For dept-based: Check type mapping in `departmentMapping.js`
- Restart the app after code changes

### ❌ Wrong admin sees the complaint
**Solution:**
- Check the complaint's `department` field in database
- Update existing complaints: `UPDATE complaints SET department='NewDept' WHERE floor='X'`
- Verify floor/type mappings in `departmentMapping.js`

---

## Checklist

When adding a new admin, check off these steps:

- [ ] Updated database constraint to include new department name
- [ ] Updated `departmentMapping.js` (floor or type mapping)
- [ ] Created auth account in Supabase Dashboard
- [ ] Copied User ID from created account
- [ ] Created user profile with INSERT SQL
- [ ] Verified user exists with SELECT query
- [ ] Restarted the app
- [ ] Tested login with new admin
- [ ] Submitted test complaint
- [ ] Verified complaint appears for correct admin

---

## Notes

- **Department names are case-sensitive!** `'First Year'` ≠ `'first year'`
- **Always restart app after code changes** in `departmentMapping.js`
- **Update existing complaints** if you change floor mappings
- **Constraint must be updated FIRST** before inserting admins
- **Floor-based admins** take priority over department-based routing
- **Keep department names consistent** across database, code, and QR codes

---

## Support

If you need help:
1. Check this guide's troubleshooting section
2. Verify all steps were completed in order
3. Check Supabase logs for SQL errors
4. Ensure app was restarted after code changes
5. Test with a fresh complaint (not old ones)

---

**Last Updated:** October 2025  
**Version:** 1.0
