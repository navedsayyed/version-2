# Complete Complaint Routing Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER SUBMITS COMPLAINT                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Did user scan QR code? │
              └────────┬────────┬───────┘
                       │        │
                   YES │        │ NO
                       ▼        ▼
         ┌──────────────────┐  ┌─────────────────────┐
         │ QR CODE ROUTING  │  │ TYPE-BASED ROUTING  │
         │ (Floor-Based)    │  │ (Complaint Type)    │
         └────────┬─────────┘  └──────────┬──────────┘
                  │                       │
                  ▼                       ▼
    ┌─────────────────────────┐  ┌──────────────────────────┐
    │ Read floor from QR data │  │ Read complaint type      │
    │ Floor 1 → Civil         │  │ Computer → IT            │
    │ Floor 3 → IT            │  │ Electrical → Electrical  │
    │ Floor 4 → Electrical    │  │ AC → Mechanical          │
    │ Floor 5 → Mechanical    │  │ Wall → Civil             │
    └────────┬────────────────┘  └──────────┬───────────────┘
             │                              │
             └──────────┬───────────────────┘
                        ▼
         ┌──────────────────────────────┐
         │  COMPLAINT STORED IN DATABASE │
         │  with department assignment   │
         └──────────────┬─────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │    COMPLAINT APPEARS IN:     │
         │  ✓ HOD Dashboard (Overview)  │
         │  ✓ Admin Dashboard (Dept.)   │
         │  ✓ Department Tab            │
         └──────────────┬─────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  HOD/ADMIN ASSIGNS TO        │
         │  TECHNICIAN FROM DEPARTMENT  │
         └──────────────┬─────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │ TECHNICIAN RESOLVES COMPLAINT│
         └──────────────────────────────┘
```

## Example Flow 1: User Scans Floor 3 QR Code

```
👤 User on Floor 3, Computer Lab 305
    │
    ▼
📱 Opens ComplaintPro app
    │
    ▼
📷 Taps "Scan QR Code"
    │
    ▼
🔍 Scans QR: {"floor":"3","class":"305","department":"IT","building":"B"}
    │
    ▼
✅ Form auto-fills:
   Location: Building B - Floor 3
   Place: IT - Room 305
   Department: IT
   Floor: 3
   Class: 305
    │
    ▼
📝 User fills rest:
   Title: "Projector not working"
   Type: "Projector/Display" (or any type)
   Description: "Screen is blank"
    │
    ▼
🚀 Submits complaint
    │
    ▼
🎯 System routing logic:
   ├─ Checks: complaintForm.floor = "3"
   ├─ Calls: getDepartmentFromFloor("3")
   ├─ Returns: "IT"
   └─ Routes to: IT Department
    │
    ▼
💾 Saved to database:
   complaint_type: "projector"
   department: "IT"  ← Floor-based routing
   floor: "3"
   status: "in-progress"
    │
    ▼
📊 Appears in dashboards:
   ├─ IT HOD Dashboard (Mr. P.C. Patil)
   ├─ Admin Dashboard (IT section)
   └─ Available for IT technician assignment
    │
    ▼
👨‍🔧 IT Technician gets assigned
    │
    ▼
✅ Issue resolved!
```

## Example Flow 2: User Doesn't Scan QR Code

```
👤 User anywhere in building
    │
    ▼
📱 Opens ComplaintPro app
    │
    ▼
📝 Fills form manually (no QR scan):
   Title: "AC not cooling"
   Type: "Air Conditioning"
   Location: "Building A - Floor 2"
   Place: "Room 201"
   Description: "AC blowing warm air"
    │
    ▼
🚀 Submits complaint
    │
    ▼
🎯 System routing logic:
   ├─ Checks: complaintForm.floor = "" (empty)
   ├─ No floor data → Uses type-based routing
   ├─ Reads: complaint_type = "ac"
   ├─ Maps: "ac" → "Mechanical"
   └─ Routes to: Mechanical Department
    │
    ▼
💾 Saved to database:
   complaint_type: "ac"
   department: null (or "Mechanical" from type mapping)
   floor: ""
   status: "in-progress"
    │
    ▼
📊 Appears in dashboards:
   ├─ Mechanical HOD Dashboard (Mr. R.S. Khandare)
   ├─ Admin Dashboard (Mechanical section)
   └─ Available for Mechanical technician assignment
    │
    ▼
👨‍🔧 Mechanical Technician gets assigned
    │
    ▼
✅ Issue resolved!
```

## Comparison: Floor-Based vs Type-Based Routing

### Scenario A: Computer Problem on Floor 1 (Civil Floor)

**WITH QR Code (Floor 1):**
```
QR Floor 1 + "Computer/Desktop" type
    ↓
Routes to: CIVIL Department
Reason: Floor 1 is Civil's responsibility
```

**WITHOUT QR Code:**
```
"Computer/Desktop" type only
    ↓
Routes to: IT Department
Reason: Computer type maps to IT
```

**Why the difference?**
Floor-based routing ensures that **physical floor responsibility** takes priority. If a computer breaks on Floor 1 (Civil's floor), Civil department handles it or coordinates with IT.

## Priority System

```
┌─────────────────────────────────────────┐
│         ROUTING PRIORITY ORDER           │
├─────────────────────────────────────────┤
│  1️⃣ HIGHEST: QR Code Floor-Based       │
│     If floor info exists in QR data     │
│     Use: getDepartmentFromFloor()       │
├─────────────────────────────────────────┤
│  2️⃣ MEDIUM: Complaint Type-Based       │
│     If no floor info, use type          │
│     Use: complaintTypeToDepartment      │
├─────────────────────────────────────────┤
│  3️⃣ LOWEST: Default to General         │
│     If no routing info at all           │
│     Fallback: General/Admin review      │
└─────────────────────────────────────────┘
```

## Department Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    CIVIL DEPARTMENT                           │
│  HOD: Mr. A.G. Chaudhari                                     │
│  Floors: 1, 2                                                 │
│  Types: Infrastructure, Building, Furniture, Structure       │
├──────────────────────────────────────────────────────────────┤
│  Receives complaints from:                                   │
│  ✓ Floor 1 & 2 QR codes (any type)                          │
│  ✓ Infrastructure/Structure types (any floor)               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    IT DEPARTMENT                              │
│  HOD: Mr. P.C. Patil                                         │
│  Floors: 3                                                    │
│  Types: Computer, Network, Lab, Software, Projector          │
├──────────────────────────────────────────────────────────────┤
│  Receives complaints from:                                   │
│  ✓ Floor 3 QR codes (any type)                              │
│  ✓ Computer/IT types (any floor)                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 ELECTRICAL DEPARTMENT                         │
│  HOD: Mr. B.G. Dabhade                                       │
│  Floors: 4                                                    │
│  Types: Electrical, Lighting, Power, Switch, Fan             │
├──────────────────────────────────────────────────────────────┤
│  Receives complaints from:                                   │
│  ✓ Floor 4 QR codes (any type)                              │
│  ✓ Electrical types (any floor)                             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 MECHANICAL DEPARTMENT                         │
│  HOD: Mr. R.S. Khandare                                      │
│  Floors: 5                                                    │
│  Types: AC, Heating, Plumbing, Drainage, Elevator            │
├──────────────────────────────────────────────────────────────┤
│  Receives complaints from:                                   │
│  ✓ Floor 5 QR codes (any type)                              │
│  ✓ Mechanical types (any floor)                             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 HOUSEKEEPING DEPARTMENT                       │
│  HOD: Mr. Vinayak Apsingkar                                  │
│  Floors: All (cross-floor responsibility)                    │
│  Types: Cleanliness, Washroom, Garbage, Pest, Garden         │
├──────────────────────────────────────────────────────────────┤
│  Receives complaints from:                                   │
│  ✓ Housekeeping types (any floor, any QR code)              │
│  ✓ Security issues (cross-department)                        │
└──────────────────────────────────────────────────────────────┘
```

## Quick Reference: Floor → Department

```
🏢 Building Layout

Floor 5  🔧 MECHANICAL    (AC, Heating, Plumbing, Elevator)
Floor 4  ⚡ ELECTRICAL     (Lights, Power, Wiring, Switches)
Floor 3  💻 IT/COMPUTER    (Computers, Network, Labs)
Floor 2  🏗️ CIVIL          (Infrastructure, Building)
Floor 1  🏗️ CIVIL          (Infrastructure, Building)
Ground   🏢 ALL DEPTS      (Entry, Reception, General areas)
```

## Admin Dashboard View

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD - COMPLAINT OVERVIEW                   │
├─────────────────────────────────────────────────────────┤
│  📊 Total Complaints: 45                                │
├─────────────────────────────────────────────────────────┤
│  BY DEPARTMENT:                                         │
│  ├─ 🏗️ Civil: 12 (Floors 1, 2 + type-based)           │
│  ├─ ⚡ Electrical: 8 (Floor 4 + type-based)            │
│  ├─ 🔧 Mechanical: 10 (Floor 5 + type-based)           │
│  ├─ 💻 IT: 9 (Floor 3 + type-based)                    │
│  └─ 🧹 Housekeeping: 6 (type-based, all floors)        │
├─────────────────────────────────────────────────────────┤
│  BY FLOOR (from QR codes):                              │
│  ├─ Floor 1: 8 complaints → Civil Dept                 │
│  ├─ Floor 2: 4 complaints → Civil Dept                 │
│  ├─ Floor 3: 9 complaints → IT Dept                    │
│  ├─ Floor 4: 8 complaints → Electrical Dept            │
│  ├─ Floor 5: 10 complaints → Mechanical Dept           │
│  └─ No floor: 6 complaints → Type-based routing        │
└─────────────────────────────────────────────────────────┘
```

## Summary

✅ **Floor-based routing** = Physical location determines department
✅ **Type-based routing** = Problem type determines department
✅ **Smart priority system** = QR code floor data takes precedence
✅ **Dual routing** = System never fails to route complaints
✅ **Clear responsibility** = Each department knows their floors
✅ **Better organization** = Complaints organized by location AND type
