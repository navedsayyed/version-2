# HOD Dashboard Visual Guide

## Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│               HOD DASHBOARD                          │
│               IT Department                          │
│                                          🔔          │
├─────────────────────────────────────────────────────┤
│   [Overview]          [Complaints]                   │
│                           ▲                          │
│                        Active Tab                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│   ┌──────────────┐  ┌──────────────┐               │
│   │ Department   │  │My Technicians│               │
│   │   (Active)   │  │              │               │
│   └──────────────┘  └──────────────┘               │
│                                                      │
│   📋 All Complaints  ▼                              │
│                                                      │
│   🔵 Status: [All ▼] [Pending] [Completed]         │
│                                                      │
│   Showing 12 complaint(s) in your department        │
│                                                      │
│   ┌───────────────────────────────────────────┐    │
│   │ WW                    🟢 Completed         │    │
│   │ Computer Lab Network Issue                 │    │
│   │ 📍 Floor 3 • Room 305                      │    │
│   │ Assigned to: Rajesh Kumar                  │    │
│   └───────────────────────────────────────────┘    │
│                                                      │
│   ┌───────────────────────────────────────────┐    │
│   │ AA                    🟡 In-Progress       │    │
│   │ Projector not working                      │    │
│   │ 📍 Floor 3 • Room 301                      │    │
│   │ Unassigned                                 │    │
│   └───────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Two Views Explained

### View 1: Department Tab

```
┌─────────────────────────────────────────────────────┐
│  🏢 DEPARTMENT TAB                                   │
│  Shows: ALL complaints for IT Department            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ✅ FROM FLOOR 3 (IT's Floor - via QR code):        │
│  ├─ Computer issue (Room 305) - Assigned            │
│  ├─ Projector issue (Room 301) - Unassigned         │
│  ├─ AC problem (Room 302) - Assigned                │
│  └─ Furniture broken (Room 307) - Unassigned        │
│                                                      │
│  ✅ IT TYPES (Any floor - manual entry):            │
│  ├─ Computer issue (Floor 2) - Unassigned           │
│  ├─ Network problem (Floor 1) - Assigned            │
│  └─ Printer issue (Floor 4) - Unassigned            │
│                                                      │
│  📊 Total: 12 complaints                            │
│  ├─ 7 Unassigned (need attention)                   │
│  ├─ 4 In-Progress (assigned to technicians)         │
│  └─ 1 Completed                                      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### View 2: My Technicians Tab

```
┌─────────────────────────────────────────────────────┐
│  👥 MY TECHNICIANS TAB                               │
│  Shows: ONLY assigned complaints                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ✅ ASSIGNED TO IT TECHNICIANS:                      │
│  ├─ Rajesh Kumar (3 tasks)                          │
│  │  ├─ Computer Lab Network (Floor 3) - Completed   │
│  │  ├─ AC Problem (Floor 3) - In-Progress          │
│  │  └─ Network Issue (Floor 1) - In-Progress       │
│  │                                                   │
│  └─ Priya Sharma (1 task)                           │
│     └─ Projector Setup (Floor 2) - In-Progress      │
│                                                      │
│  📊 Total: 5 complaints (only assigned)             │
│  ├─ 4 In-Progress                                    │
│  └─ 1 Completed                                      │
│                                                      │
│  ❌ 7 Unassigned complaints DON'T show here         │
│     (they only appear in Department tab)            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Complaint Lifecycle - What HOD Sees

```
┌─────────────────────────────────────────────────────────────┐
│                  COMPLAINT LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

STAGE 1: Complaint Submitted
├─ User scans Floor 3 QR code
├─ Selects "Projector" issue
└─ Submits complaint

        ⬇️

STAGE 2: Appears in HOD Dashboard
┌──────────────────────┬──────────────────────┐
│  Department Tab      │  My Technicians Tab  │
├──────────────────────┼──────────────────────┤
│  ✅ Shows complaint  │  ❌ Doesn't show     │
│  Status: Unassigned  │  (not assigned yet)  │
│  Floor 3, Room 305   │                      │
└──────────────────────┴──────────────────────┘

        ⬇️

STAGE 3: HOD Assigns Technician
├─ IT HOD clicks on complaint
├─ Selects "Rajesh Kumar" from technician list
└─ Assigns the work

        ⬇️

STAGE 4: Both Tabs Show Complaint
┌──────────────────────┬──────────────────────┐
│  Department Tab      │  My Technicians Tab  │
├──────────────────────┼──────────────────────┤
│  ✅ Still shows      │  ✅ NOW shows        │
│  Status: In-Progress │  Status: In-Progress │
│  Assigned: Rajesh    │  Assigned: Rajesh    │
│  Floor 3, Room 305   │  Floor 3, Room 305   │
└──────────────────────┴──────────────────────┘

        ⬇️

STAGE 5: Technician Works on It
├─ Rajesh sees it in his Technician Dashboard
├─ Goes to Floor 3, Room 305
└─ Fixes the projector

        ⬇️

STAGE 6: Technician Marks Complete
├─ Rajesh uploads completion photo
├─ Marks status as "Completed"
└─ Adds completion notes

        ⬇️

STAGE 7: HOD Sees Completed Work
┌──────────────────────┬──────────────────────┐
│  Department Tab      │  My Technicians Tab  │
├──────────────────────┼──────────────────────┤
│  ✅ Still shows      │  ✅ Still shows      │
│  Status: Completed   │  Status: Completed   │
│  Completed: Rajesh   │  Completed: Rajesh   │
│  ✅ View Report      │  ✅ View Report      │
└──────────────────────┴──────────────────────┘
```

---

## Real Example: Civil Department HOD

```
┌─────────────────────────────────────────────────────────┐
│  Civil Department - Mr. A.G. Chaudhari                   │
│  Responsible for: Floor 1, Floor 2, Infrastructure       │
└─────────────────────────────────────────────────────────┘

📋 DEPARTMENT TAB (All Civil Complaints)
├─ Floor 1 Issues (via QR code):
│  ├─ Room 101: Broken chair - Unassigned
│  ├─ Room 105: Computer problem - Unassigned
│  └─ Room 108: Wall damage - Assigned to Suresh
│
├─ Floor 2 Issues (via QR code):
│  ├─ Room 201: Ceiling leak - In-Progress (Suresh)
│  └─ Room 205: Door repair - Unassigned
│
└─ Infrastructure Issues (any floor, manual):
   ├─ Floor 4: Window broken - Unassigned
   └─ Floor 5: Furniture damaged - Assigned to Ramesh

Total: 7 complaints in Department tab

👥 MY TECHNICIANS TAB (Only Assigned)
├─ Suresh Kumar:
│  ├─ Wall damage (Floor 1, Room 108) - Completed
│  └─ Ceiling leak (Floor 2, Room 201) - In-Progress
│
└─ Ramesh Patil:
   └─ Furniture damage (Floor 5) - In-Progress

Total: 3 complaints in My Technicians tab

Note: 4 unassigned complaints only show in Department tab
```

---

## Flow Diagram: Floor-Based vs Type-Based Routing

```
USER SUBMITS COMPLAINT
         │
         ├─── Scanned QR? ───┐
         │                   │
        YES                 NO
         │                   │
         ▼                   ▼
   Floor-Based         Type-Based
   Routing             Routing
         │                   │
         ▼                   ▼
   Floor 1 → Civil     "Computer" → IT
   Floor 3 → IT        "AC" → Mechanical
   Floor 4 → Electrical "Wall" → Civil
   Floor 5 → Mechanical etc.
         │                   │
         └────────┬──────────┘
                  ▼
         APPEARS IN HOD
         DEPARTMENT TAB
                  │
                  ▼
         ┌───────────────────┐
         │ HOD Assigns Tech? │
         └────────┬──────────┘
                  │
         YES ─────┤
                  │
                  ▼
         ALSO APPEARS IN
         MY TECHNICIANS TAB
```

---

## Quick Reference Card

### Department Tab
```
Purpose: See ALL department complaints
Shows:
  ✅ Unassigned complaints
  ✅ Assigned complaints  
  ✅ Completed complaints
  ✅ Complaints from department's floors (QR)
  ✅ Complaints of department's types (Manual)

Use For:
  • Seeing all pending work
  • Finding unassigned complaints
  • Getting department overview
  • Assigning new complaints
```

### My Technicians Tab
```
Purpose: Track assigned work
Shows:
  ❌ Unassigned complaints
  ✅ Assigned complaints
  ✅ Completed complaints
  ✅ Only complaints assigned to department's technicians

Use For:
  • Monitoring technician workload
  • Checking assignment status
  • Reviewing completed work
  • Following up on in-progress tasks
```

---

## Common Questions

**Q: Why don't I see a complaint in My Technicians tab?**
A: It's either unassigned or assigned to another department's technician. Check Department tab.

**Q: I see a computer problem in my Civil department. Why?**
A: It came from Floor 1 (your floor). Floor-based routing takes priority over type.

**Q: Can I assign a Floor 3 complaint to my Civil technician?**
A: No, Floor 3 complaints go to IT department. Only IT HOD can assign them.

**Q: Why is the count different in Department vs My Technicians?**
A: Department shows ALL complaints. My Technicians shows ONLY assigned ones.

**Q: What happens to unassigned complaints?**
A: They appear in Department tab waiting for HOD to assign to a technician.
