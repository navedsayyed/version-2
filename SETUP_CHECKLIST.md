# ✅ Setup Checklist for Your App

## What You've Completed ✅

- ✅ **Created Supabase Project**: version-2 (oeazkkxhvmmthysjdklk)
- ✅ **Created Database Tables**: users, complaints, complaint_images
- ✅ **Updated App Credentials**: config/supabaseClient.js and .env updated

---

## Next Steps to Complete Setup

### 1. Create Storage Bucket (REQUIRED) 📦
Your app needs this to upload complaint images.

**How to do it:**
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Open project **version-2**
3. Click **Storage** in the left sidebar
4. Click **New bucket**
5. Enter bucket name: `complaint-images`
6. Set **Public bucket**: ✅ Yes
7. Click **Create bucket**

---

### 2. Create a Test User (REQUIRED) 👤
You need at least one user to test login.

**How to do it:**
1. In Supabase Dashboard, click **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `test@example.com` (or your email)
   - Password: `Test123!` (or your password)
4. Click **Create user**

**Important:** Remember this email and password - you'll use it to login!

---

### 3. Verify the User Profile Was Created
The database should automatically create a user profile.

**Check it:**
1. Go to **Table Editor** → **users** table
2. You should see a row with your test user's email
3. The `role` should be `user`

**If you DON'T see the user in the table:**
Run this in SQL Editor:
```sql
-- Manually create the profile
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, '', 'user'
FROM auth.users
WHERE email = 'test@example.com';
```

---

### 4. Test the App 🚀

**Start the app:**
```powershell
npx expo start
```

**Test login:**
1. Enter the email and password you created
2. Click **Sign In**
3. You should be redirected to User Dashboard

**Test complaint submission:**
1. Fill in the complaint form:
   - Title: "Test Complaint"
   - Complaint Type: "Maintenance"
   - Location: "Building A"
   - Place: "Room 101"
   - Description: "This is a test"
2. (Optional) Click "Pick an image"
3. Click **Submit Complaint**
4. Wait for success message

**Verify in Supabase:**
1. Go to **Table Editor** → **complaints**
2. You should see your test complaint
3. Check **Storage** → **complaint-images** for uploaded images

---

## Troubleshooting

### "Failed to sign in"
- ✅ Check email/password is correct
- ✅ Verify user exists in Authentication → Users
- ✅ Check if credentials in `config/supabaseClient.js` are correct

### "Failed to fetch user data"
- ✅ Check if user exists in **Table Editor** → **users** table
- ✅ If not, run the manual INSERT query above

### "Failed to create complaint"
- ✅ Check if you're logged in (should show user's name in dashboard)
- ✅ Verify RLS policies are enabled (already in your SQL)
- ✅ Check browser console for detailed errors

### "Image upload failed"
- ✅ Verify `complaint-images` bucket exists in Storage
- ✅ Check bucket is set to **Public**
- ✅ Try uploading without image first

---

## Quick Test Commands

**Check if @supabase/supabase-js is installed:**
```powershell
npm list @supabase/supabase-js
```

**If not installed, run:**
```powershell
npm install @supabase/supabase-js
```

**Start the app:**
```powershell
npx expo start
```

---

## Your Supabase Details

📋 **Project**: version-2  
🆔 **Project ID**: oeazkkxhvmmthysjdklk  
🌐 **URL**: https://oeazkkxhvmmthysjdklk.supabase.co  
🔑 **Dashboard**: https://app.supabase.com/project/oeazkkxhvmmthysjdklk

---

## Summary

### ✅ Completed
1. Supabase project created
2. Database tables created (users, complaints, complaint_images)
3. App credentials updated

### 🔲 To Do
1. Create storage bucket: `complaint-images`
2. Create test user in Authentication
3. Start app and test login
4. Test complaint submission

---

## Need Help?

If you encounter any issues:
1. Check the terminal for error messages
2. Check Supabase Dashboard → Logs
3. Let me know the exact error message

You're almost done! Just 2 more steps (storage bucket + test user) and you can start testing! 🎉
