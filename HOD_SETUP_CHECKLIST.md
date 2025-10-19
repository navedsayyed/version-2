# 🚀 HOD System Setup Checklist

Follow these steps in order to set up the complete HOD-based complaint management system.

---

## ✅ Phase 1: HOD Profiles Setup

### Step 1: Create HOD Authentication Accounts
- [ ] Go to Supabase Dashboard → Authentication → Users → Add User
- [ ] Create account for **ag.chaurdhari@college.edu** (Password: ________)
- [ ] Create account for **bg.dabhade@college.edu** (Password: ________)
- [ ] Create account for **rs.khandare@college.edu** (Password: ________)
- [ ] Create account for **pc.patil@college.edu** (Password: ________)
- [ ] Create account for **vinayak.apsingkar@college.edu** (Password: ________)

### Step 2: Copy UUIDs
- [ ] Copy UUID for Mr. A.G. Chaurdhari: __________________________________
- [ ] Copy UUID for Mr. B.G. Dabhade: __________________________________
- [ ] Copy UUID for Mr. R.S. Khandare: __________________________________
- [ ] Copy UUID for Mr. P.C. Patil: __________________________________
- [ ] Copy UUID for Mr. Vinayak Apsingkar: __________________________________

### Step 3: Update SQL Script
- [ ] Open `database/setup_hod_profiles.sql`
- [ ] Replace all 5 `REPLACE_WITH_AUTH_ID` placeholders with actual UUIDs
- [ ] Save the file

### Step 4: Run SQL Script
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Copy entire content of `database/setup_hod_profiles.sql`
- [ ] Paste and run the script
- [ ] Verify: Check if 5 HOD profiles appear in users table

### Step 5: Test HOD Login
- [ ] Login as **bg.dabhade@college.edu** (Electrical HOD)
- [ ] Verify dashboard shows "HOD Dashboard"
- [ ] Check if department shows "Electrical"
- [ ] Logout

---

## ✅ Phase 2: Technicians Setup

### Step 1: Create Technician Authentication Accounts

#### Civil Department (2 technicians)
- [ ] Create account for **rajesh.civil@college.edu** (UUID: __________________)
- [ ] Create account for **amit.civil@college.edu** (UUID: __________________)

#### Electrical Department (3 technicians)
- [ ] Create account for **suresh.electrical@college.edu** (UUID: __________________)
- [ ] Create account for **prakash.electrical@college.edu** (UUID: __________________)
- [ ] Create account for **ganesh.electrical@college.edu** (UUID: __________________)

#### Mechanical Department (2 technicians)
- [ ] Create account for **mahesh.mechanical@college.edu** (UUID: __________________)
- [ ] Create account for **santosh.mechanical@college.edu** (UUID: __________________)

#### IT Department (3 technicians)
- [ ] Create account for **rahul.it@college.edu** (UUID: __________________)
- [ ] Create account for **vikram.it@college.edu** (UUID: __________________)
- [ ] Create account for **anil.it@college.edu** (UUID: __________________)

#### Housekeeping Department (2 technicians)
- [ ] Create account for **deepak.housekeeping@college.edu** (UUID: __________________)
- [ ] Create account for **kiran.housekeeping@college.edu** (UUID: __________________)

### Step 2: Update Technician SQL Script
- [ ] Open `database/setup_technicians.sql`
- [ ] Replace all `REPLACE_WITH_AUTH_ID` with actual UUIDs
- [ ] Save the file

### Step 3: Run Technician SQL Script
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Copy entire content of `database/setup_technicians.sql`
- [ ] Paste and run the script
- [ ] Verify: Check if 12 technicians appear in users table

---

## ✅ Phase 3: Testing Complete System

### Test 1: User Submits Electrical Complaint
- [ ] Login as a regular user (student)
- [ ] Create new complaint with type **"Electrical"**
- [ ] Submit complaint
- [ ] Go to Supabase → complaints table
- [ ] Verify `complaint_type = 'Electrical'`

### Test 2: Electrical HOD Sees Complaint
- [ ] Login as **bg.dabhade@college.edu** (Electrical HOD)
- [ ] Go to Overview tab
- [ ] Verify the electrical complaint appears in "Recent Complaints"
- [ ] Go to Complaints tab
- [ ] Verify complaint appears there too
- [ ] Check status filter works (All/Pending/Completed)

### Test 3: Other HODs Don't See Complaint
- [ ] Login as **ag.chaurdhari@college.edu** (Civil HOD)
- [ ] Go to Overview and Complaints tabs
- [ ] Verify the electrical complaint DOES NOT appear
- [ ] Logout

### Test 4: HOD Sees Department Technicians
- [ ] Login as **bg.dabhade@college.edu** (Electrical HOD)
- [ ] Go to Technicians tab (bottom navigation)
- [ ] Verify only 3 electrical technicians appear:
  - [ ] Suresh Jadhav
  - [ ] Prakash Shinde
  - [ ] Ganesh Desai
- [ ] Verify no technicians from other departments appear

### Test 5: Test All Complaint Types

#### Civil Complaints
- [ ] Submit complaint type: **Wall**
- [ ] Login as **ag.chaurdhari@college.edu**
- [ ] Verify complaint appears → `complaint_type = 'Civil'`

#### Mechanical Complaints
- [ ] Submit complaint type: **Plumbing**
- [ ] Login as **rs.khandare@college.edu**
- [ ] Verify complaint appears → `complaint_type = 'Mechanical'`

#### IT Complaints
- [ ] Submit complaint type: **Computer**
- [ ] Login as **pc.patil@college.edu**
- [ ] Verify complaint appears → `complaint_type = 'IT'`

#### Housekeeping Complaints
- [ ] Submit complaint type: **Cleanliness**
- [ ] Login as **vinayak.apsingkar@college.edu**
- [ ] Verify complaint appears → `complaint_type = 'Housekeeping'`

---

## ✅ Phase 4: Performance Stats Testing

### Test HOD Dashboard Stats
- [ ] Login as any HOD (e.g., Electrical HOD)
- [ ] Go to Overview tab
- [ ] Verify "Total Complaints" count is correct
- [ ] Verify "Pending" count matches pending complaints
- [ ] Verify "Completed" count matches completed complaints
- [ ] Verify "Total Technicians" shows correct number
- [ ] Check "Department Performance" section shows floor-wise data
- [ ] Check "Technician Performance" shows individual stats

---

## ✅ Phase 5: Filter Testing

### Test Complaint Filters
- [ ] Login as any HOD with multiple complaints
- [ ] Go to Complaints tab
- [ ] Click "Department" filter → Verify shows all department complaints
- [ ] Click "My Technicians" filter → Verify shows only assigned complaints
- [ ] Click status dropdown → Select "Pending" → Verify filters work
- [ ] Click status dropdown → Select "Completed" → Verify filters work
- [ ] Click status dropdown → Select "All" → Verify shows all complaints

---

## 🎯 Completion Criteria

Your system is ready when:
- ✅ All 5 HODs can login with their email/password
- ✅ All 12 technicians can login
- ✅ User complaints are automatically routed to correct HOD
- ✅ Each HOD sees only their department complaints
- ✅ Each HOD sees only their department technicians
- ✅ Filters work correctly (Department/Technicians + Status)
- ✅ Stats show accurate counts for each HOD
- ✅ No HOD sees complaints from other departments

---

## 📊 Expected Results Summary

| HOD | Department | Complaint Types They See | Technicians Count |
|-----|-----------|-------------------------|------------------|
| Mr. A.G. Chaurdhari | Civil | wall, ceiling, floor, door, window | 2 |
| Mr. B.G. Dabhade | Electrical | electrical, lighting, power, ac, heating | 3 |
| Mr. R.S. Khandare | Mechanical | plumbing, furniture | 2 |
| Mr. P.C. Patil | IT | network, computer, projector, lab, teaching | 3 |
| Mr. Vinayak Apsingkar | Housekeeping | cleanliness, security | 2 |

**Total System Users:**
- 5 HODs (admin role)
- 12 Technicians (technician role)
- Unlimited Students/Users (user role)

---

## 🐛 Troubleshooting

### Issue: HOD sees complaints from other departments
**Solution:** Check `complaint_type` field in complaints table. Should match HOD's department.

### Issue: Technicians not showing in HOD dashboard
**Solution:** Verify technician's `department` field matches HOD's `department` in users table.

### Issue: Complaint not routed to any HOD
**Solution:** Check `utils/departmentMapping.js` - ensure complaint type exists in mapping.

### Issue: HOD dashboard shows "No complaints"
**Solution:** Submit test complaints with types matching that HOD's department.

---

## 📞 Support Files Reference

- **HOD_SYSTEM_GUIDE.md** - Complete system documentation
- **database/setup_hod_profiles.sql** - HOD profile SQL script
- **database/setup_technicians.sql** - Technician profile SQL script
- **utils/departmentMapping.js** - Complaint routing logic
- **config/supabaseClient.js** - Database operations
- **screens/AdminDashboard.js** - HOD dashboard implementation

---

**Setup Date:** _______________  
**Setup By:** _______________  
**Version:** 2.0 - HOD System
