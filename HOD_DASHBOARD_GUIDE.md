# HOD Dashboard - Department & Technician Views Explained

## Overview

The HOD Dashboard has **two main tabs** under the Complaints section:
1. **Department Tab** - Shows all complaints for the HOD's department
2. **My Technicians Tab** - Shows complaints assigned to the HOD's technicians

---

## 1. Department Tab - What HOD Sees

### Purpose
Shows **ALL complaints that belong to this department**, regardless of assignment status.

### Who Sees What?

#### Civil Department HOD (Mr. A.G. Chaudhari)
```
✅ Complaints from Floor 1 (any complaint type)
✅ Complaints from Floor 2 (any complaint type)
✅ "Infrastructure" type complaints (any floor)
✅ "Building Structure" type complaints (any floor)
✅ "Furniture" type complaints (any floor)
✅ "Wall/Paint" type complaints (any floor)
✅ All other Civil-related complaint types
```

**Example Scenarios:**
- User scans Floor 1 QR + selects "Computer" problem → **Civil HOD sees it** (Floor 1 is Civil's floor)
- User doesn't scan QR + selects "Wall Damage" → **Civil HOD sees it** (Wall Damage = Civil type)
- User scans Floor 3 QR + selects "Furniture" problem → **IT HOD sees it** (Floor 3 = IT floor, floor routing takes priority)

#### IT Department HOD (Mr. P.C. Patil)
```
✅ Complaints from Floor 3 (any complaint type)
✅ "Computer/Desktop" type complaints (any floor)
✅ "Network" type complaints (any floor)
✅ "Projector" type complaints (any floor)
✅ "Lab Equipment" type complaints (any floor)
✅ All other IT-related complaint types
```

#### Electrical Department HOD (Mr. B.G. Dabhade)
```
✅ Complaints from Floor 4 (any complaint type)
✅ "Electrical Wiring" type complaints (any floor)
✅ "Lighting" type complaints (any floor)
✅ "Power Outage" type complaints (any floor)
✅ "Fan" type complaints (any floor)
✅ All other Electrical-related complaint types
```

#### Mechanical Department HOD (Mr. R.S. Khandare)
```
✅ Complaints from Floor 5 (any complaint type)
✅ "Air Conditioning" type complaints (any floor)
✅ "Plumbing" type complaints (any floor)
✅ "Heating" type complaints (any floor)
✅ "Elevator" type complaints (any floor)
✅ All other Mechanical-related complaint types
```

#### Housekeeping Department HOD (Mr. Vinayak Apsingkar)
```
✅ "Cleanliness" type complaints (any floor)
✅ "Washroom" type complaints (any floor)
✅ "Garbage" type complaints (any floor)
✅ "Pest Control" type complaints (any floor)
✅ All other Housekeeping-related complaint types
Note: Housekeeping doesn't have a dedicated floor, serves all floors
```

---

## 2. My Technicians Tab - Assigned Work

### Purpose
Shows **ONLY complaints that have been assigned to technicians** in this department.

### What HOD Sees
```
✅ Complaints assigned to ANY technician in their department
✅ Both in-progress and completed assigned complaints
✅ Technician name shown for each complaint
✅ Status of each assigned complaint
```

### What HOD Does NOT See
```
❌ Unassigned complaints (those appear only in Department tab)
❌ Complaints assigned to other departments' technicians
❌ Complaints not yet picked up by anyone
```

---

## Comparison: Department vs My Technicians

### Example: Civil Department

**Department Tab Shows:**
```
Total: 15 complaints
├─ 8 from Floor 1 (5 unassigned, 3 assigned)
├─ 3 from Floor 2 (2 unassigned, 1 assigned)
└─ 4 Infrastructure types from other floors (all unassigned)

Status Mix:
├─ 10 unassigned (waiting for assignment)
├─ 4 in-progress (assigned to technicians)
└─ 1 completed (finished by technician)
```

**My Technicians Tab Shows:**
```
Total: 5 complaints (only assigned ones)
├─ 3 assigned to Technician A (2 in-progress, 1 completed)
└─ 2 assigned to Technician B (2 in-progress)

Status Mix:
├─ 4 in-progress
└─ 1 completed

Note: 10 unassigned complaints DON'T show here
```

---

## Workflow Example

### Scenario: Broken Chair on Floor 1

#### Step 1: User Submits Complaint
```
📱 User scans Floor 1 QR code
📝 Title: "Chair broken in Room 101"
🏷️ Type: "Furniture Repair"
📍 Floor: 1, Room: 101
```

#### Step 2: Routing
```
🎯 Floor 1 → Civil Department
📊 Appears in Civil HOD Dashboard
```

#### Step 3: Department Tab
```
Civil HOD sees:
├─ Department Tab: ✅ Shows complaint
│   Status: Unassigned
│   Location: Floor 1, Room 101
│   Type: Furniture Repair
│
└─ My Technicians Tab: ❌ Doesn't show (not assigned yet)
```

#### Step 4: HOD Assigns Technician
```
Civil HOD clicks complaint
→ Assigns to "Rajesh Kumar" (Civil Technician)
```

#### Step 5: Both Tabs Updated
```
Civil HOD sees:
├─ Department Tab: ✅ Still shows complaint
│   Status: In-Progress
│   Assigned to: Rajesh Kumar
│
└─ My Technicians Tab: ✅ NOW shows complaint
    Status: In-Progress
    Assigned to: Rajesh Kumar
    Location: Floor 1, Room 101
```

#### Step 6: Technician Completes Work
```
Civil HOD sees:
├─ Department Tab: ✅ Still shows complaint
│   Status: Completed
│   Completed by: Rajesh Kumar
│
└─ My Technicians Tab: ✅ Still shows complaint
    Status: Completed
    Completed by: Rajesh Kumar
```

---

## Filter Options in Department Tab

### Status Filter
```
🔵 All: Shows all department complaints (assigned + unassigned)
🟡 Pending: Shows only in-progress complaints
🟢 Completed: Shows only finished complaints
```

### View Options
```
📋 Department: All complaints for this department
👥 My Technicians: Only assigned complaints
```

---

## Technical Implementation

### Department Tab Query Logic
```javascript
// HOD sees complaints from TWO sources:

1. Floor-Based Routing (QR Code)
   ↓
   complaint.department === "Civil"
   (Floor 1, 2 → Civil)

2. Type-Based Routing (Manual)
   ↓
   getDepartmentForComplaintType(complaint.type) === "Civil"
   ("Furniture" → Civil)

If EITHER matches → HOD sees the complaint
```

### My Technicians Tab Query Logic
```javascript
// HOD sees complaints where:

complaint.assigned_to === (any technician in department)

Filter Steps:
1. Get all technicians in HOD's department
2. Get technician IDs: [tech1.id, tech2.id, tech3.id]
3. Show complaints where assigned_to matches any ID
```

---

## Real-World Examples

### Example 1: Computer Issue on Floor 1

**Complaint:**
- Location: Floor 1, Room 105
- Type: Computer/Desktop
- QR Code: Scanned (Floor 1)

**Routing:**
- Floor 1 → **Civil Department** (floor-based routing takes priority)

**Who Sees It:**
- ✅ **Civil HOD** - Department Tab (Floor 1 is Civil's floor)
- ❌ IT HOD - Doesn't see it (even though it's a computer issue)

**Assignment:**
- Civil HOD can assign to Civil technician
- OR Civil HOD can coordinate with IT department

---

### Example 2: AC Issue (No QR Code)

**Complaint:**
- Location: Manually entered "Building A, Floor 2"
- Type: Air Conditioning
- QR Code: Not scanned

**Routing:**
- No floor routing available
- Type "AC" → **Mechanical Department** (type-based routing)

**Who Sees It:**
- ✅ **Mechanical HOD** - Department Tab (AC = Mechanical type)
- ❌ Civil HOD - Doesn't see it (even though Floor 2 is Civil's floor, no QR was scanned)

**Assignment:**
- Mechanical HOD assigns to Mechanical technician
- Appears in Mechanical HOD's "My Technicians" tab after assignment

---

### Example 3: Electrical Issue on Floor 5

**Complaint:**
- Location: Floor 5, Room 502
- Type: Lighting Problem
- QR Code: Scanned (Floor 5)

**Routing:**
- Floor 5 → **Mechanical Department** (floor-based routing)

**Who Sees It:**
- ✅ **Mechanical HOD** - Department Tab (Floor 5 is Mechanical's floor)
- ❌ Electrical HOD - Doesn't see it (even though it's a lighting issue)

**Note:**
- This ensures floor responsibility is clear
- Mechanical HOD can coordinate with Electrical if needed
- System prioritizes physical location over issue type

---

## Summary

| Feature | Department Tab | My Technicians Tab |
|---------|---------------|-------------------|
| **Shows** | All department complaints | Only assigned complaints |
| **Unassigned** | ✅ Yes | ❌ No |
| **Assigned** | ✅ Yes | ✅ Yes |
| **Completed** | ✅ Yes | ✅ Yes |
| **Purpose** | Overview of all department work | Track technician assignments |
| **Use Case** | See what needs attention | Monitor assigned work progress |

**Key Point:** 
- **Department Tab** = "All problems in my department" (assigned + unassigned)
- **My Technicians Tab** = "Work I've assigned to my team" (assigned only)
