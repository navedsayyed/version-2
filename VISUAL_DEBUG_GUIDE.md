# What Should Happen - Visual Guide

## Your Test Case

You submitted **2 complaints** from Floor 1:

```
┌─────────────────────────────────────────────┐
│  COMPLAINT 1                                 │
├─────────────────────────────────────────────┤
│  📱 QR Scanned: Floor 1                     │
│  🏗️ Type Selected: Infrastructure/Wall     │
│  💾 Saved as:                                │
│     - department: "Civil"                    │
│     - type: "wall" (or similar)              │
│     - floor: "1"                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  COMPLAINT 2                                 │
├─────────────────────────────────────────────┤
│  📱 QR Scanned: Floor 1                     │
│  🖥️ Type Selected: Computer/Desktop         │
│  💾 Saved as:                                │
│     - department: "Civil"                    │
│     - type: "computer"                       │
│     - floor: "1"                             │
└─────────────────────────────────────────────┘
```

---

## What Civil HOD Should See

### Department Tab (Floor-Based)
```
┌─────────────────────────────────────────────┐
│  📋 DEPARTMENT TAB                           │
│  Shows: complaints.department === "Civil"   │
├─────────────────────────────────────────────┤
│                                              │
│  ✅ COMPLAINT 1 (Wall)                      │
│     Reason: department="Civil" ✓            │
│                                              │
│  ✅ COMPLAINT 2 (Computer)                  │
│     Reason: department="Civil" ✓            │
│                                              │
│  Total: 2 complaints                         │
└─────────────────────────────────────────────┘
```

### My Technicians Tab (Type-Based)
```
┌─────────────────────────────────────────────┐
│  👥 MY TECHNICIANS TAB                       │
│  Shows: type maps to "Civil"                │
├─────────────────────────────────────────────┤
│                                              │
│  ✅ COMPLAINT 1 (Wall)                      │
│     Reason: type="wall" → "Civil" ✓         │
│                                              │
│  ❌ COMPLAINT 2 (Computer)                  │
│     Reason: type="computer" → "IT" ✗        │
│                                              │
│  Total: 1 complaint                          │
└─────────────────────────────────────────────┘
```

---

## Side-by-Side Comparison

```
                DEPARTMENT TAB          MY TECHNICIANS TAB
                (Floor-Based)           (Type-Based)

Complaint 1:    ✅ Shows                ✅ Shows
(Wall)          Floor 1 = Civil         Wall type = Civil
                                        
Complaint 2:    ✅ Shows                ❌ Doesn't show
(Computer)      Floor 1 = Civil         Computer type = IT
```

---

## What Might Be Wrong

### Problem 1: Both complaints show in BOTH tabs
```
ISSUE: My Technicians tab shows Computer complaint
CAUSE: Type mapping might be wrong
CHECK: Does "computer" map to "Civil" instead of "IT"?
```

### Problem 2: No complaints show in Department tab
```
ISSUE: Department tab is empty
CAUSE: department field might be NULL or wrong value
CHECK: Database - is department field = "Civil"?
```

### Problem 3: No complaints show in My Technicians tab
```
ISSUE: My Technicians tab is empty
CAUSE: Type mapping not working
CHECK: Does "wall" map to "Civil" in departmentMapping.js?
```

---

## How to Verify in Database

Open Supabase and run this query:

```sql
SELECT 
  id,
  title,
  type,
  department,
  floor,
  created_at
FROM complaints
WHERE floor = '1'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected result:**
```
id  | title              | type     | department | floor
----|-------------------|----------|------------|------
123 | Wall damage       | wall     | Civil      | 1
124 | Computer broken   | computer | Civil      | 1
```

Both should have `department = "Civil"` because Floor 1 → Civil.

---

## Debug with Console Logs

I added debug logs. When you switch tabs, you'll see:

### When you click Department Tab:
```
=== FILTERING DEBUG ===
Total complaints loaded: 2
Current filter: department
HOD Department: Civil

Complaint 123: department="Civil", type="wall", matches=true
Complaint 124: department="Civil", type="computer", matches=true

Department tab filtered count: 2
```

### When you click My Technicians Tab:
```
=== FILTERING DEBUG ===
Total complaints loaded: 2
Current filter: technicians
HOD Department: Civil

Complaint 123: type="wall" → "Civil", matches=true
Complaint 124: type="computer" → "IT", matches=false

My Technicians tab filtered count: 1
```

---

## Quick Fix Checklist

- [ ] Check Supabase: Both complaints have `department = "Civil"`?
- [ ] Check Supabase: Complaint 1 has `type = "wall"` or similar Civil type?
- [ ] Check Supabase: Complaint 2 has `type = "computer"` or similar IT type?
- [ ] Check HOD profile: Department = "Civil"?
- [ ] Check console logs: What do the debug messages show?
- [ ] Check departmentMapping.js: Does "wall" → "Civil"?
- [ ] Check departmentMapping.js: Does "computer" → "IT"?

---

## What to Send Me

If still not working, please share:

1. **Screenshot of complaints in Supabase** (show: id, type, department, floor)
2. **Screenshot of console logs** (the debug messages)
3. **Answer these questions:**
   - What complaint types did you select?
   - What floor QR did you scan?
   - Which tab is empty/wrong?
   - What is the HOD's department in their profile?

This will help me find the exact problem!
