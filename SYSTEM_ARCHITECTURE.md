# 🏛️ HOD-Based Complaint Management System Architecture

## 📊 System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          COMPLAINT MANAGEMENT SYSTEM                      │
│                               (College Level)                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  STEP 1: USER SUBMITS COMPLAINT                                          │
└──────────────────────────────────────────────────────────────────────────┘

    👨‍🎓 Student/User
         │
         │ (Opens App → New Complaint)
         ▼
    ┌─────────────────┐
    │ Select Type:    │
    │ ⚡ Electrical   │  ← User picks complaint type
    │ 🔧 Plumbing     │
    │ 🖥️  Computer    │
    │ 🧹 Cleanliness  │
    └─────────────────┘
         │
         │ (Submit)
         ▼
    ┌──────────────────────────────────────┐
    │  departmentMapping.js                │
    │  Maps: "electrical" → "Electrical"   │
    └──────────────────────────────────────┘
         │
         │ (Auto-routing)
         ▼
    ┌─────────────────────────────────────────┐
    │  Supabase Database                      │
    │  INSERT INTO complaints                 │
    │  - type: "electrical"                   │
    │  - complaint_type: "Electrical" ✓       │
    │  - status: "in-progress"                │
    └─────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────┐
│  STEP 2: AUTOMATIC ROUTING TO CORRECT HOD                                │
└──────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────────┐
                        │   COMPLAINTS TABLE  │
                        │ complaint_type =    │
                        │   "Electrical"      │
                        └──────────┬──────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
            ▼                      ▼                      ▼
     ❌ Civil HOD          ✅ Electrical HOD        ❌ IT HOD
     Can't see it          CAN SEE IT!            Can't see it
     
     (department ≠         (department =           (department ≠
      "Electrical")         "Electrical")          "Electrical")


┌──────────────────────────────────────────────────────────────────────────┐
│  STEP 3: HOD DASHBOARD VIEW                                              │
└──────────────────────────────────────────────────────────────────────────┘

    ⚡ Mr. B.G. Dabhade (Electrical HOD) logs in
         │
         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  📊 HOD DASHBOARD                                        │
    │                                                          │
    │  ┌────────────┬────────────┬────────────┬────────────┐ │
    │  │  Overview  │ Complaints │Technicians │  Profile   │ │
    │  └────────────┴────────────┴────────────┴────────────┘ │
    │                                                          │
    │  FILTERS APPLIED:                                       │
    │  ✓ WHERE complaint_type = "Electrical"                 │
    │  ✓ WHERE technician.department = "Electrical"          │
    │                                                          │
    │  📋 Complaints Visible:                                 │
    │  • Electrical problems     ✅                           │
    │  • Lighting issues         ✅                           │
    │  • Power outages           ✅                           │
    │  • AC/Heating              ✅                           │
    │                                                          │
    │  👥 Technicians Visible:                                │
    │  • Suresh Jadhav          ✅                           │
    │  • Prakash Shinde         ✅                           │
    │  • Ganesh Desai           ✅                           │
    │                                                          │
    │  ❌ Cannot see:                                         │
    │  • Civil complaints (walls, doors)                     │
    │  • IT complaints (computers)                           │
    │  • Other department technicians                        │
    └─────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────┐
│  ORGANIZATIONAL HIERARCHY                                                 │
└──────────────────────────────────────────────────────────────────────────┘

                    🏛️ COLLEGE
                         │
        ┌────────────────┼────────────────┬────────────┐
        │                │                │            │
        ▼                ▼                ▼            ▼
    
    🔧 CIVIL         ⚡ ELECTRICAL    🔩 MECHANICAL   🖥️ IT         🧹 HOUSEKEEPING
    Mr. Chaurdhari   Mr. Dabhade      Mr. Khandare    Mr. Patil    Mr. Apsingkar
         │                │                │              │              │
    ┌────┴────┐      ┌────┴────┐      ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
    │         │      │    │    │      │         │   │    │    │   │         │
    👷 Tech1  👷 T2  👷 T1 👷 T2 👷 T3  👷 Tech1  👷 T2  👷 T1 👷 T2 👷 T3  👷 Tech1  👷 T2
    Rajesh   Amit   Suresh Prakash   Mahesh    Santosh  Rahul  Vikram Anil  Deepak  Kiran
                      │                                   │
                      └───── (2 Tech) ─────────────── (3 Tech) ──────┘


┌──────────────────────────────────────────────────────────────────────────┐
│  COMPLAINT TYPE → DEPARTMENT MAPPING                                      │
└──────────────────────────────────────────────────────────────────────────┘

USER SELECTS:              SYSTEM MAPS TO:           VISIBLE TO:
─────────────              ────────────────          ────────────
🏗️  Wall                  → Civil                   → Mr. Chaurdhari
🏗️  Ceiling               → Civil                   → Mr. Chaurdhari
🏗️  Floor                 → Civil                   → Mr. Chaurdhari
🚪 Door                   → Civil                   → Mr. Chaurdhari
🪟 Window                 → Civil                   → Mr. Chaurdhari

⚡ Electrical             → Electrical              → Mr. Dabhade
💡 Lighting               → Electrical              → Mr. Dabhade
🔌 Power                  → Electrical              → Mr. Dabhade
❄️  AC                    → Electrical              → Mr. Dabhade
🔥 Heating                → Electrical              → Mr. Dabhade

🚰 Plumbing               → Mechanical              → Mr. Khandare
🪑 Furniture              → Mechanical              → Mr. Khandare

🌐 Network                → IT                      → Mr. Patil
🖥️  Computer              → IT                      → Mr. Patil
📽️  Projector             → IT                      → Mr. Patil
🔬 Lab Equipment          → IT                      → Mr. Patil
📚 Teaching Equipment     → IT                      → Mr. Patil

🧹 Cleanliness            → Housekeeping            → Mr. Apsingkar
🛡️  Security              → Housekeeping            → Mr. Apsingkar


┌──────────────────────────────────────────────────────────────────────────┐
│  DATA FLOW SEQUENCE                                                       │
└──────────────────────────────────────────────────────────────────────────┘

1️⃣  USER ACTION
    👨‍🎓 Student creates complaint → Selects "Electrical" type

2️⃣  APP PROCESSING
    📱 UserDashboard.js → submitComplaint()
    └→ config/supabaseClient.js → createComplaint()
       └→ utils/departmentMapping.js → getDepartmentForComplaintType()
          └→ Returns: "Electrical"

3️⃣  DATABASE INSERT
    💾 Supabase complaints table
    INSERT {
      user_id: "student-uuid",
      type: "electrical",
      complaint_type: "Electrical",  ← Key field for routing
      title: "Lab lights not working",
      status: "in-progress"
    }

4️⃣  HOD QUERY
    👔 Mr. Dabhade logs in
    📊 AdminDashboard.js → loadComplaints()
    QUERY: SELECT * FROM complaints 
           WHERE complaint_type = "Electrical"  ← Filters automatically
    RESULT: Shows only electrical complaints ✅

5️⃣  TECHNICIAN QUERY
    🔧 AdminDashboard.js → loadTechnicians()
    QUERY: SELECT * FROM users 
           WHERE role = "technician" 
           AND department = "Electrical"  ← Only electrical techs
    RESULT: Suresh, Prakash, Ganesh ✅

6️⃣  ASSIGNMENT (Future Feature)
    👔 HOD assigns complaint to → 👷 Suresh Jadhav
    UPDATE complaints SET assigned_to = "suresh-uuid"
    Suresh sees complaint in his dashboard ✅


┌──────────────────────────────────────────────────────────────────────────┐
│  DATABASE SCHEMA                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  users                                                                    │
├───────────────┬──────────┬────────────────────────────────────────────┬──┤
│ id            │ UUID     │ Primary Key                                │  │
│ name          │ TEXT     │ "Mr. B.G. Dabhade"                        │  │
│ email         │ TEXT     │ "bg.dabhade@college.edu"                  │  │
│ phone         │ TEXT     │ "+91-9876543212"                          │  │
│ role          │ TEXT     │ 'user' | 'technician' | 'admin'           │  │
│ department    │ TEXT     │ 'Civil' | 'Electrical' | 'Mechanical'     │  │
│               │          │ 'IT' | 'Housekeeping'                      │  │
│ created_at    │ TIMESTAMP│ Auto-generated                             │  │
└───────────────┴──────────┴────────────────────────────────────────────┴──┘

┌──────────────────────────────────────────────────────────────────────────┐
│  complaints                                                               │
├───────────────┬──────────┬────────────────────────────────────────────┬──┤
│ id            │ UUID     │ Primary Key                                │  │
│ user_id       │ UUID     │ FK → users (who submitted)                 │  │
│ type          │ TEXT     │ Original selection: 'electrical'           │  │
│ complaint_type│ TEXT     │ Mapped department: 'Electrical' ⭐         │  │
│ title         │ TEXT     │ "Lab lights not working"                   │  │
│ description   │ TEXT     │ Detailed description                       │  │
│ location      │ TEXT     │ Building/Room                              │  │
│ place         │ TEXT     │ Specific location                          │  │
│ floor         │ TEXT     │ Floor number                               │  │
│ status        │ TEXT     │ 'in-progress' | 'completed'                │  │
│ assigned_to   │ UUID     │ FK → users (technician assigned)           │  │
│ created_at    │ TIMESTAMP│ Auto-generated                             │  │
└───────────────┴──────────┴────────────────────────────────────────────┴──┘

⭐ complaint_type is the KEY FIELD that routes complaints to correct HOD!


┌──────────────────────────────────────────────────────────────────────────┐
│  SECURITY & ISOLATION                                                     │
└──────────────────────────────────────────────────────────────────────────┘

✅ Each HOD sees ONLY their department data:
   - Queries automatically filter by department
   - No manual switching needed
   - Complete data isolation

✅ Technicians see ONLY assigned work:
   - Filter by assigned_to = technician_id
   - Can't access other technicians' work

✅ Students see ONLY their complaints:
   - Filter by user_id = student_id
   - Can't see other students' complaints

✅ Automatic routing prevents:
   - Manual assignment errors
   - Cross-department visibility
   - Data leakage between departments


┌──────────────────────────────────────────────────────────────────────────┐
│  IMPLEMENTATION FILES                                                     │
└──────────────────────────────────────────────────────────────────────────┘

📁 ComplaintManagementApp/
│
├── 📄 HOD_SYSTEM_GUIDE.md           ← Complete documentation
├── 📄 HOD_SETUP_CHECKLIST.md        ← Step-by-step setup
│
├── 📁 database/
│   ├── setup_hod_profiles.sql       ← Create 5 HOD accounts
│   └── setup_technicians.sql        ← Create 12 technician accounts
│
├── 📁 utils/
│   └── departmentMapping.js         ← 🔑 Routing logic (KEY FILE!)
│
├── 📁 config/
│   └── supabaseClient.js            ← ✅ Updated createComplaint()
│
└── 📁 screens/
    ├── AdminDashboard.js            ← ✅ Already filters by department
    ├── UserDashboard.js             ← Complaint submission
    └── AdminTechniciansScreen.js    ← Technician management


┌──────────────────────────────────────────────────────────────────────────┐
│  QUICK REFERENCE CARD                                                     │
└──────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  FOR ADMINISTRATORS: HOD Account Setup                                 │
├────────────────────────────────────────────────────────────────────────┤
│  1. Create auth accounts in Supabase                                   │
│  2. Copy UUIDs                                                         │
│  3. Update setup_hod_profiles.sql                                      │
│  4. Run SQL script                                                     │
│  5. Test login for each HOD                                            │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  FOR HODs: How to Use Dashboard                                        │
├────────────────────────────────────────────────────────────────────────┤
│  1. Login with your @college.edu email                                 │
│  2. Overview tab → See your department stats                           │
│  3. Complaints tab → Filter Department/Technicians                     │
│  4. Technicians tab → View your team                                   │
│  5. Profile tab → Update your details                                  │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  FOR DEVELOPERS: Key Integration Points                                │
├────────────────────────────────────────────────────────────────────────┤
│  • departmentMapping.js → Add new complaint types                      │
│  • createComplaint() → Auto-routes based on mapping                    │
│  • AdminDashboard.js → Filters by profile.department                   │
│  • Supabase RLS → Add policies for row-level security                  │
└────────────────────────────────────────────────────────────────────────┘

```

---

**Version:** 2.0 - HOD System  
**Last Updated:** October 8, 2025  
**Status:** ✅ Implementation Complete
