# 🔍 Troubleshooting Empty Technician Dashboard

## Current Status
✅ SELECT policy exists (that's why you got "already exists" error)  
❓ But dashboard still shows no complaints

## Next Steps to Find the Problem

### Step 1: Check Your Metro Console
After logging in as technician, look for these logs:

```
========================================
TechnicianDashboard: Loading complaints...
========================================
Raw Response:
  - Data: [...]
  - Count: X
```

**Share the complete console output** - it will show exactly what's happening!

---

### Step 2: Run Database Queries

Open Supabase SQL Editor and run this:

```sql
-- Check if complaints exist
SELECT COUNT(*) FROM complaints;

-- Check in-progress complaints
SELECT COUNT(*) FROM complaints WHERE status = 'in-progress';

-- See the actual data
SELECT 
  c.id,
  c.title,
  c.status,
  c.user_id,
  u.full_name as reporter
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.status = 'in-progress';
```

**What to look for:**
- First query should return > 0 (complaints exist)
- Second query should return > 0 (in-progress complaints exist)
- Third query should show complaint details

**Share the results!**

---

### Step 3: Verify Technician Login

Check Metro console when logging in. Should see:

```
User role from database: technician
Navigating to dashboard for role: technician
```

If you see `role: user` instead, that's the problem!

---

## Common Issues & Solutions

### Issue 1: No Complaints in Database
**Symptoms:** SQL query returns 0 rows

**Solution:**
1. Login as regular user (not technician)
2. Submit a new complaint with a photo
3. Check SQL query again - should now show data
4. Login as technician - should see the complaint

---

### Issue 2: Complaints Status is Not 'in-progress'
**Symptoms:** SQL shows complaints but status is different

**Solution:** Run this to check statuses:
```sql
SELECT status, COUNT(*) 
FROM complaints 
GROUP BY status;
```

If complaints have different status, update the filter:
```sql
-- Change status to match your data
UPDATE complaints SET status = 'in-progress' WHERE status IS NULL;
```

---

### Issue 3: User Not Linked to Complaint
**Symptoms:** Query shows complaints but reporter is NULL

**Solution:** Check if user_id matches:
```sql
-- Check user IDs
SELECT c.id, c.user_id, u.id as actual_user_id, u.full_name
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id;
```

If user_id doesn't match, the JOIN fails. Check:
```sql
-- See all users
SELECT id, email, full_name FROM users;

-- See all complaints
SELECT id, title, user_id FROM complaints;
```

---

### Issue 4: App Not Updated After SQL Changes
**Symptoms:** SQL works but app still empty

**Solution:**
```bash
# Kill Metro bundler completely
# Press Ctrl+C multiple times

# Clear cache and restart
npx expo start --clear

# In Expo Go app: Shake device → Reload
```

---

### Issue 5: Wrong Supabase Client Config
**Symptoms:** Console shows "Error: Invalid API key" or similar

**Solution:** Check `.env` file:
```
SUPABASE_URL=https://oeazkkxhvmmthysjdklk.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
```

Make sure these match your Supabase dashboard settings.

---

## Debug Checklist

Run through this checklist and share results:

- [ ] **Database has complaints:** `SELECT COUNT(*) FROM complaints;` returns > 0
- [ ] **Complaints are in-progress:** `SELECT COUNT(*) FROM complaints WHERE status = 'in-progress';` returns > 0
- [ ] **SELECT policy exists:** No error when creating policy
- [ ] **Technician account exists:** Can login with technician@test.com / Test@123
- [ ] **Routes to TechnicianDashboard:** Console shows "Navigating to dashboard for role: technician"
- [ ] **getAllComplaints called:** Console shows "TechnicianDashboard: Loading complaints..."
- [ ] **No errors in console:** No red error messages
- [ ] **App restarted:** Killed Metro and restarted with `npm start`

---

## What to Share

To help you further, please share:

1. **Metro Console Output** - Everything after logging in as technician
2. **SQL Query Results** - Run the queries in Step 2 and share results
3. **Screenshots** - Both the empty dashboard and Metro console

This will tell us exactly where the data is getting stuck! 🔍
