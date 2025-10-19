# 👨‍🔧 TECHNICIAN ACCOUNT SETUP GUIDE

## 🎯 Goal
Create a technician account so you can login and see all user complaints with images.

---

## ✅ **STEP 1: Create Technician Auth User** (2 minutes)

### **Via Supabase Dashboard (Recommended)**

1. **Go to Authentication:**
   ```
   https://app.supabase.com/project/oeazkkxhvmmthysjdklk/auth/users
   ```

2. **Click "Add user"** button (top right)

3. **Select: "Create new user"**

4. **Fill in the form:**
   - **Email:** `technician@test.com`
   - **Password:** `Test@123`
   - **Auto Confirm User:** ✅ **Toggle ON** (important!)
   - Leave other fields empty

5. **Click "Create user"**

6. **Copy the UUID:**
   - After creation, you'll see the user in the list
   - Copy the **UUID** (looks like: `12345678-1234-1234-1234-123456789abc`)
   - You'll need this for Step 2!

---

## ✅ **STEP 2: Add Technician Profile** (1 minute)

### **Run This SQL:**

1. **Go to SQL Editor:**
   ```
   https://app.supabase.com/project/oeazkkxhvmmthysjdklk/sql/new
   ```

2. **Paste this SQL** (replace `YOUR_UUID_HERE` with the UUID you copied):

```sql
-- Insert technician profile
INSERT INTO public.users (id, email, full_name, role, phone)
VALUES (
  'YOUR_UUID_HERE',  -- ⚠️ REPLACE THIS with UUID from Step 1
  'technician@test.com',
  'Test Technician',
  'technician',
  '1234567890'
);

-- Verify it was created
SELECT id, email, full_name, role 
FROM public.users 
WHERE email = 'technician@test.com';
```

3. **Click RUN**

4. **Check results:**
   - You should see 1 row returned
   - Email: `technician@test.com`
   - Role: `technician` ✅

---

## ✅ **STEP 3: Login as Technician** (30 seconds)

### **In Your App:**

1. **Open your React Native app**

2. **If already logged in, logout:**
   - Go to Profile tab → Logout

3. **Login with technician credentials:**
   - **Email:** `technician@test.com`
   - **Password:** `Test@123`

4. **Expected:**
   - ✅ Login succeeds
   - ✅ App navigates to **Technician Dashboard**
   - ✅ You see "Assigned Work" at the top

---

## ✅ **STEP 4: View User Complaints** (Test)

### **What You Should See:**

1. **Technician Dashboard shows:**
   - All complaints with status "in-progress"
   - Each complaint card displays:
     - ✅ Title
     - ✅ Type badge
     - ✅ Location & Place
     - ✅ Submission date
     - ✅ Reporter name (from users table)
     - ✅ Description
     - ✅ Photo (if uploaded)

2. **Pull to refresh:**
   - Swipe down to reload complaints
   - Loading indicator appears

3. **Empty state:**
   - If no in-progress complaints, shows:
     - "No pending assignments"
     - "All assigned work has been completed!"

---

## 🧪 **Test Complete Flow:**

### **As User:**
1. Login as regular user
2. Submit a complaint with photo
3. Logout

### **As Technician:**
1. Login as technician
2. See the complaint appear in dashboard
3. Complaint shows all details + photo ✅

---

## 🔍 **Verify in Supabase:**

### **Check Auth User:**
```sql
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'technician@test.com';
```
- ✅ Should return 1 row
- ✅ `email_confirmed_at` should have a date (not null)

### **Check User Profile:**
```sql
SELECT id, email, full_name, role, created_at 
FROM public.users 
WHERE email = 'technician@test.com';
```
- ✅ Should return 1 row
- ✅ `role` should be 'technician'

### **Check Complaints Visible:**
```sql
SELECT 
  c.id,
  c.title,
  c.status,
  u.full_name as reporter,
  ci.url as image_url
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN complaint_images ci ON c.id = ci.complaint_id
WHERE c.status = 'in-progress'
ORDER BY c.created_at DESC;
```
- ✅ Should show all in-progress complaints
- ✅ With reporter names and image URLs

---

## 📋 **Technician Login Credentials:**

```
Email:    technician@test.com
Password: Test@123
Role:     technician
```

**Save these for future testing!**

---

## 🎨 **What Changed in the App:**

### **Files Updated:**

1. **`config/supabaseClient.js`:**
   - Added `getAllComplaints()` function
   - Fetches all complaints (not just user's own)
   - Includes user info via join

2. **`screens/TechnicianDashboard.js`:**
   - Replaced mock data with real Supabase queries
   - Added loading state
   - Added pull-to-refresh
   - Shows real user names and photos

### **Features Working:**

- ✅ Load all in-progress complaints
- ✅ Show reporter name (from users table)
- ✅ Show complaint photos
- ✅ Pull-to-refresh to reload
- ✅ Loading indicator
- ✅ Empty state when no complaints

---

## 🚀 **Next Steps (Future):**

After basic viewing works, you can add:

1. **Status Updates:**
   - Technician can mark complaint as "completed"
   - Update button in ComplaintDetail screen

2. **Assign Complaints:**
   - Admin assigns specific complaints to specific technicians
   - Add `technician_id` filter in queries

3. **Filters:**
   - Filter by type (electrical, plumbing, etc.)
   - Filter by location
   - Search by title/description

4. **Notifications:**
   - Notify technician when new complaint assigned
   - Notify user when status updated

---

## 🆘 **Troubleshooting:**

### **Issue: Can't create auth user**

**Error:** "User already exists"

**Fix:** Delete existing user first:
- Dashboard → Auth → Users
- Find `technician@test.com`
- Click 3 dots → Delete user
- Try Step 1 again

### **Issue: Login fails**

**Error:** "Invalid login credentials"

**Possible causes:**
1. Auto Confirm was not enabled
   - Go to Auth → Users
   - Check if `email_confirmed_at` is null
   - If null, click user → Send confirmation email

2. Wrong password
   - Use exactly: `Test@123` (case-sensitive)

### **Issue: Complaints don't appear**

**Check:**
1. Are there any complaints in database?
   ```sql
   SELECT COUNT(*) FROM complaints WHERE status = 'in-progress';
   ```

2. Is the JOIN working?
   ```sql
   SELECT c.*, u.full_name 
   FROM complaints c
   LEFT JOIN users u ON c.user_id = u.id
   LIMIT 1;
   ```

3. Check console logs in app for errors

### **Issue: Images don't show**

**Check:**
1. Do complaint_images records exist?
   ```sql
   SELECT * FROM complaint_images LIMIT 5;
   ```

2. Are URLs valid?
   - Should start with: `https://oeazkkxhvmmthysjdklk.supabase.co/storage/...`

3. Is storage bucket public?
   - Storage → complaint-images → Should show "Public" badge

---

## ✅ **Success Checklist:**

Before testing:

- [ ] Created auth user in Dashboard
- [ ] Copied UUID
- [ ] Ran SQL to insert user profile
- [ ] Verified user exists with role 'technician'
- [ ] Tested login with technician credentials
- [ ] Can see Technician Dashboard
- [ ] Complaints load with images
- [ ] Pull-to-refresh works

---

## 🎊 **You're Ready!**

After completing all steps:

1. ✅ User submits complaints with photos
2. ✅ Technician logs in
3. ✅ Technician sees all complaints
4. ✅ Photos appear in complaint cards
5. ✅ Real-time updates via pull-to-refresh

**Test it out!** 🚀
