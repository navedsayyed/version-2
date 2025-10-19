# HOD-Based Complaint Management System
## Complete Setup & Implementation Guide

---

## 📋 Overview

This system implements a hierarchical complaint management structure where:
- **Students/Users** submit complaints based on issue type
- **Complaints** are automatically routed to the appropriate HOD based on complaint type
- **HODs** manage their department's complaints and technicians
- **Technicians** handle assigned work from their HOD

---

## 👥 HOD Profiles

### 1. **Mr. A.G. Chaurdhari** - Infrastructure Civil Activities
- **Department:** Civil
- **Email:** ag.chaurdhari@college.edu
- **Handles:** Construction & Structural Issues
- **Complaint Types:**
  - Wall Damage
  - Ceiling Damage
  - Floor Damage
  - Door Issues
  - Window/Glass Issues

### 2. **Mr. B.G. Dabhade** - Infrastructure Electrical Activities
- **Department:** Electrical
- **Email:** bg.dabhade@college.edu
- **Handles:** Electrical Systems
- **Complaint Types:**
  - Electrical Problems
  - Lighting Issues
  - Power Outages
  - Air Conditioning
  - Heating Systems

### 3. **Mr. R.S. Khandare** - Infrastructure Mechanical Activities
- **Department:** Mechanical
- **Email:** rs.khandare@college.edu
- **Handles:** Mechanical & Plumbing Systems
- **Complaint Types:**
  - Plumbing Issues
  - Furniture Repair

### 4. **Mr. P.C. Patil** - Infrastructure IT Activities
- **Department:** IT
- **Email:** pc.patil@college.edu
- **Handles:** IT Equipment & Network
- **Complaint Types:**
  - Network/Internet Issues
  - Computer Problems
  - Projector/Display Issues
  - Lab Equipment
  - Teaching Equipment

### 5. **Mr. Vinayak Apsingkar** - Housekeeping Activities
- **Department:** Housekeeping
- **Email:** vinayak.apsingkar@college.edu
- **Handles:** Maintenance & Cleanliness
- **Complaint Types:**
  - Cleanliness Issues
  - Security Concerns

---

## 🔄 System Flow

### Step 1: User Submits Complaint
```
User selects complaint type (e.g., "Electrical") 
    ↓
System maps type to department using departmentMapping.js
    ↓
complaint_type field is set to "Electrical"
    ↓
Complaint is stored in database
```

### Step 2: HOD Access
```
Mr. B.G. Dabhade logs in (Electrical HOD)
    ↓
Dashboard loads profile.department = "Electrical"
    ↓
Queries complaints WHERE complaint_type = "Electrical"
    ↓
Shows only electrical complaints in Overview/Complaints tabs
```

### Step 3: HOD Manages Technicians
```
Dashboard loads technicians WHERE department = "Electrical"
    ↓
HOD sees only their department technicians
    ↓
HOD can assign complaints to their technicians
    ↓
Technicians see assigned work in their dashboard
```

---

## 🗂️ Database Structure

### users table
```sql
- id (UUID, Primary Key)
- name (TEXT) - e.g., "Mr. B.G. Dabhade"
- email (TEXT) - e.g., "bg.dabhade@college.edu"
- phone (TEXT) - e.g., "+91-9876543212"
- role (TEXT) - Values: 'user', 'technician', 'admin'
- department (TEXT) - Values: 'Civil', 'Electrical', 'Mechanical', 'IT', 'Housekeeping'
- created_at (TIMESTAMP)
```

### complaints table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- title (TEXT)
- type (TEXT) - User's original selection (e.g., 'electrical', 'plumbing')
- complaint_type (TEXT) - Mapped department (e.g., 'Electrical', 'Mechanical')
- description (TEXT)
- location (TEXT)
- place (TEXT)
- floor (TEXT)
- department (TEXT)
- class (TEXT)
- status (TEXT) - 'in-progress', 'completed'
- assigned_to (UUID, Foreign Key → users) - Assigned technician
- created_at (TIMESTAMP)
```

---

## 🚀 Deployment Steps

### Step 1: Create HOD Accounts in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** for each HOD:

   **HOD 1: Mr. A.G. Chaurdhari**
   - Email: `ag.chaurdhari@college.edu`
   - Password: [Set secure password]
   - Auto Confirm: Yes

   **HOD 2: Mr. B.G. Dabhade**
   - Email: `bg.dabhade@college.edu`
   - Password: [Set secure password]
   - Auto Confirm: Yes

   **HOD 3: Mr. R.S. Khandare**
   - Email: `rs.khandare@college.edu`
   - Password: [Set secure password]
   - Auto Confirm: Yes

   **HOD 4: Mr. P.C. Patil**
   - Email: `pc.patil@college.edu`
   - Password: [Set secure password]
   - Auto Confirm: Yes

   **HOD 5: Mr. Vinayak Apsingkar**
   - Email: `vinayak.apsingkar@college.edu`
   - Password: [Set secure password]
   - Auto Confirm: Yes

3. **Copy each user's UUID** from the Users list

### Step 2: Run SQL Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `database/setup_hod_profiles.sql`
3. Replace `REPLACE_WITH_AUTH_ID_1` through `REPLACE_WITH_AUTH_ID_5` with actual UUIDs
4. Run the script
5. Verify with:
   ```sql
   SELECT name, email, role, department 
   FROM users 
   WHERE role = 'admin' 
   ORDER BY department;
   ```

### Step 3: Create Technician Accounts

For each department, create technician accounts:

```sql
-- Example: Electrical Technician
INSERT INTO users (id, name, email, phone, role, department)
VALUES (
  'TECHNICIAN_AUTH_ID',
  'John Doe',
  'john.electrical@college.edu',
  '+91-9876543220',
  'technician',
  'Electrical'
);
```

Repeat for technicians in: Civil, Mechanical, IT, Housekeeping departments.

### Step 4: Test the System

1. **User Login** → Submit complaint with type "Electrical"
2. **Check Database** → Verify `complaint_type = 'Electrical'`
3. **HOD Login** (bg.dabhade@college.edu) → See the complaint in dashboard
4. **Other HODs** → Should NOT see this complaint

---

## 🔍 Key Files Modified

### 1. `utils/departmentMapping.js` ✨ NEW
- Maps complaint types to departments
- Provides HOD information
- Helper functions for routing

### 2. `config/supabaseClient.js` ✅ UPDATED
- `createComplaint()` now auto-maps complaint type to department
- Sets `complaint_type` field for HOD filtering

### 3. `database/setup_hod_profiles.sql` ✨ NEW
- SQL script to insert 5 HOD profiles
- Includes instructions and documentation

### 4. `screens/AdminDashboard.js` ✅ ALREADY IMPLEMENTED
- Filters complaints by `complaint_type = department`
- Filters technicians by `department`
- HOD sees only their department's data

---

## 📊 Complaint Type Mapping Reference

| User Selects | Maps to Department | HOD Responsible |
|--------------|-------------------|-----------------|
| Wall | Civil | Mr. A.G. Chaurdhari |
| Ceiling | Civil | Mr. A.G. Chaurdhari |
| Floor | Civil | Mr. A.G. Chaurdhari |
| Door | Civil | Mr. A.G. Chaurdhari |
| Window | Civil | Mr. A.G. Chaurdhari |
| Electrical | Electrical | Mr. B.G. Dabhade |
| Lighting | Electrical | Mr. B.G. Dabhade |
| Power | Electrical | Mr. B.G. Dabhade |
| AC | Electrical | Mr. B.G. Dabhade |
| Heating | Electrical | Mr. B.G. Dabhade |
| Plumbing | Mechanical | Mr. R.S. Khandare |
| Furniture | Mechanical | Mr. R.S. Khandare |
| Network | IT | Mr. P.C. Patil |
| Computer | IT | Mr. P.C. Patil |
| Projector | IT | Mr. P.C. Patil |
| Lab | IT | Mr. P.C. Patil |
| Teaching | IT | Mr. P.C. Patil |
| Cleanliness | Housekeeping | Mr. Vinayak Apsingkar |
| Security | Housekeeping | Mr. Vinayak Apsingkar |

---

## ✅ Testing Checklist

- [ ] All 5 HOD accounts created in Supabase Auth
- [ ] SQL script executed successfully
- [ ] HOD profiles visible in users table
- [ ] User can submit complaint with type selection
- [ ] Complaint appears in correct HOD's dashboard
- [ ] Other HODs don't see the complaint
- [ ] HOD sees only their department technicians
- [ ] Technicians see assigned complaints
- [ ] Status filters work (All/Pending/Completed)
- [ ] Department/Technicians filter works in Complaints tab

---

## 🎯 Next Steps

1. **Run the SQL script** to create HOD profiles
2. **Create technician accounts** for each department
3. **Test complaint submission** from user account
4. **Verify routing** by logging in as different HODs
5. **Add assignment functionality** for HODs to assign technicians
6. **Implement notifications** when complaints are assigned/completed

---

## 📞 Support

For issues or questions, contact the development team or refer to:
- `utils/departmentMapping.js` - Mapping logic
- `config/supabaseClient.js` - Database operations
- `screens/AdminDashboard.js` - HOD dashboard implementation

---

**Last Updated:** October 8, 2025  
**Version:** 2.0 - HOD System Implementation
