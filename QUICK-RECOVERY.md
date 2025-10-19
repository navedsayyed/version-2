# 🔄 Quick Recovery Guide

## What Happened

Your user account and all complaints were **automatically deleted** by the database because of `ON DELETE CASCADE`. This happened when a DELETE statement was executed (probably from one of the SQL files).

**I'm sorry this happened!** 😞 But we can recover quickly!

---

## 🚀 Recovery in 3 Steps

### Step 1: Run Recovery SQL

Open **Supabase SQL Editor** and run this file:
- **`supabase/RECOVERY-SCRIPT.sql`**

This will:
- ✅ Disable RLS (allow complaints to be inserted)
- ✅ Recreate technician account if deleted
- ✅ Change CASCADE to RESTRICT (prevent future data loss)
- ✅ Verify everything is ready

---

### Step 2: Create New User Account

In your app:
1. Click **"Sign up"** (create new account)
2. Email: `user@test.com`
3. Password: `Test@123`
4. Sign up and login

**OR** if you already have an account, just login with it.

---

### Step 3: Submit Test Complaint

1. Go to **User Dashboard**
2. Fill out complaint form:
   - Title: "Test complaint"
   - Type: "electrical"
   - Description: "Testing after recovery"
   - Location: "Building A"
   - Place: "Room 101"
3. **Add a photo** (tap camera icon)
4. Click **Submit**
5. Should see success message ✅
6. Check **"My Complaints" tab** - complaint should appear

---

### Step 4: Verify Technician Can See It

1. **Logout** from user
2. **Login as technician**:
   - Email: `technician@test.com`
   - Password: `Test@123`
3. Go to **"Assigned Work"** tab
4. **Should see your complaint!** 🎉

---

## 🛡️ Prevention

The recovery script changes `ON DELETE CASCADE` to `ON DELETE RESTRICT`, which means:

**Before (BAD):**
- Delete user → Automatically deletes all their complaints 😱

**After (GOOD):**
- Try to delete user → Database blocks it and says "Cannot delete user with complaints" ✅

This protects your data!

---

## Summary

1. ✅ Run `RECOVERY-SCRIPT.sql` in Supabase
2. ✅ Create new user account in app
3. ✅ Submit test complaint with photo
4. ✅ Login as technician and verify you see it
5. ✅ Future deletions won't cascade!

**You're ready to start fresh!** 🚀
