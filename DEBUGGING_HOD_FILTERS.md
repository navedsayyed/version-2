# Debugging Guide - HOD Dashboard Filtering Issue

## Current Issue

You're reporting that complaints are not showing up correctly in the tabs. Let's debug this step by step.

## Test Scenario

You said you submitted TWO complaints:

### Complaint 1:
- **Floor:** 1 (QR scanned)
- **Type:** Civil/Infrastructure type (e.g., "Wall Damage")
- **Expected:**
  - ✅ Should show in **Department Tab** (Floor 1 = Civil)
  - ✅ Should show in **My Technicians Tab** (Wall type = Civil)

### Complaint 2:
- **Floor:** 1 (QR scanned)
- **Type:** Different type (e.g., "Computer")
- **Expected:**
  - ✅ Should show in **Department Tab** (Floor 1 = Civil)
  - ❌ Should NOT show in **My Technicians Tab** (Computer type = IT)

---

## Debugging Steps

### Step 1: Check Console Logs

I've added debug logging to the code. Open the app and:

1. Login as Civil HOD
2. Go to Complaints tab
3. Click on **Department** tab
4. Open browser console (F12) or React Native debugger
5. Look for logs like:

```
=== FILTERING DEBUG ===
Total complaints loaded: 5
Current filter: department
HOD Department: Civil

Complaint 123: department="Civil", type="wall", matches=true
Complaint 124: department="Civil", type="computer", matches=true
Complaint 125: department="IT", type="computer", matches=false
...

Department tab filtered count: 2
```

6. Click on **My Technicians** tab
7. Check logs:

```
=== FILTERING DEBUG ===
Total complaints loaded: 5
Current filter: technicians
HOD Department: Civil

Complaint 123: type="wall" → "Civil", matches=true
Complaint 124: type="computer" → "IT", matches=false
Complaint 125: type="computer" → "IT", matches=false
...

My Technicians tab filtered count: 1
```

---

### Step 2: Verify Data in Database

Check if complaints are being saved correctly:

1. Open Supabase dashboard
2. Go to Table Editor → `complaints`
3. Find your test complaints
4. Check these fields:

| id | type | department | floor | title |
|----|------|------------|-------|-------|
| 123 | wall | Civil | 1 | Wall damage test |
| 124 | computer | Civil | 1 | Computer issue test |

**Expected values:**
- Both complaints should have `department = "Civil"` (because Floor 1 → Civil)
- Complaint 1: `type = "wall"` or similar Civil type
- Complaint 2: `type = "computer"` or similar non-Civil type

---

### Step 3: Check Complaint Type Mapping

Verify the complaint type is mapped correctly in `utils/departmentMapping.js`:

```javascript
export const complaintTypeToDepartment = {
  'wall': 'Civil',           // ✅ Should map to Civil
  'ceiling': 'Civil',        // ✅ Should map to Civil
  'furniture': 'Civil',      // ✅ Should map to Civil
  'computer': 'IT',          // ✅ Should map to IT
  'network': 'IT',           // ✅ Should map to IT
  // etc.
};
```

---

## Common Issues & Solutions

### Issue 1: Complaints Not Showing in Department Tab

**Symptoms:**
- You scanned Floor 1 QR code
- Complaint submitted successfully
- Civil HOD doesn't see it in Department tab

**Possible Causes:**

1. **`department` field is NULL**
   - Check database: Is `department` field empty?
   - Solution: Make sure QR code has floor info
   - Solution: Check `getDepartmentFromFloor()` is working

2. **`department` field has wrong value**
   - Check database: Is `department = "IT"` instead of "Civil"?
   - Solution: Verify floor mapping in `departmentMapping.js`

3. **HOD logged in with wrong department**
   - Check: What is HOD's profile department?
   - Solution: Update HOD profile to correct department

**Debug Query:**
```sql
SELECT id, title, type, department, floor 
FROM complaints 
WHERE floor = '1'
ORDER BY created_at DESC
LIMIT 10;
```

Expected: All Floor 1 complaints should have `department = 'Civil'`

---

### Issue 2: Complaints Not Showing in My Technicians Tab

**Symptoms:**
- You submitted Infrastructure/Civil type complaint
- Civil HOD doesn't see it in My Technicians tab

**Possible Causes:**

1. **Complaint type not mapped to Civil**
   - Check: What is the `type` value in database?
   - Check: Does this type map to "Civil" in `departmentMapping.js`?
   - Solution: Add missing type to mapping

2. **Type mapping using wrong department name**
   - Check: Mapping says `'wall': 'civil'` (lowercase)?
   - Should be: `'wall': 'Civil'` (uppercase C)
   - Solution: Fix capitalization in mapping

**Debug Query:**
```sql
SELECT id, title, type, department 
FROM complaints 
WHERE type IN ('wall', 'ceiling', 'floor', 'furniture', 'structure')
ORDER BY created_at DESC
LIMIT 10;
```

Expected: These should show in Civil HOD's My Technicians tab

---

### Issue 3: Complaint Shows in Wrong Tab

**Symptoms:**
- Floor 1 + Computer complaint shows in My Technicians tab
- Should only show in Department tab

**Cause:**
- Filter logic is incorrect

**Current Logic (Should be working):**
```javascript
// Department Tab
if (complaintFilter === 'department') {
  filtered = complaints.filter(c => c.department === 'Civil');
}

// My Technicians Tab  
if (complaintFilter === 'technicians') {
  filtered = complaints.filter(c => 
    getDepartmentForComplaintType(c.type) === 'Civil'
  );
}
```

---

## Quick Test Commands

### Test 1: Check all complaints loaded
Open console and run:
```javascript
console.log('All complaints:', complaints);
```

### Test 2: Check HOD department
```javascript
console.log('HOD Profile:', hodProfile);
console.log('HOD Department:', hodProfile?.department);
```

### Test 3: Check type mapping
```javascript
const { getDepartmentForComplaintType } = require('./utils/departmentMapping');
console.log('wall maps to:', getDepartmentForComplaintType('wall'));
console.log('computer maps to:', getDepartmentForComplaintType('computer'));
```

---

## Expected Behavior Table

| Complaint | Floor QR | Type | Dept Field | Department Tab (Civil HOD) | My Technicians Tab (Civil HOD) |
|-----------|----------|------|------------|---------------------------|-------------------------------|
| #1 | Floor 1 | Wall | Civil | ✅ Shows | ✅ Shows (both match) |
| #2 | Floor 1 | Computer | Civil | ✅ Shows | ❌ Hidden (type=IT) |
| #3 | Floor 3 | Wall | IT | ❌ Hidden (floor=IT) | ✅ Shows (type=Civil) |
| #4 | No QR | Infrastructure | null | ❌ Hidden (no dept) | ✅ Shows (type=Civil) |
| #5 | Floor 3 | Computer | IT | ❌ Hidden | ❌ Hidden (both=IT) |

---

## Next Steps

1. **Enable debug mode**: The code now has console logs
2. **Test with Civil HOD**: Login and switch between tabs
3. **Check console output**: Look for the debug logs
4. **Share the logs**: Send me the console output
5. **Check database**: Verify complaint data is correct

---

## If Still Not Working

Please provide:

1. **Console logs** from both tabs
2. **Screenshot** of Supabase complaints table
3. **Complaint details**:
   - What floor QR was scanned?
   - What complaint type was selected?
   - What is the title?
4. **HOD details**:
   - What is the HOD's department in profile?
   - Which tab are you checking?

With this information, I can pinpoint the exact issue!
