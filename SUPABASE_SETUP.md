# Supabase Setup Instructions

This guide will help you set up Supabase for your Complaint Management App.

## ✅ Prerequisites

- Node.js and npm installed
- Expo CLI installed
- Supabase account (https://supabase.com)

## 📋 Setup Steps

### 1. Install Dependencies

```powershell
npm install @supabase/supabase-js
```

### 2. Supabase Dashboard Setup

#### A. Create Storage Bucket
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to **Storage** → **Buckets**
3. Click **New Bucket**
4. Name: `complaint-images`
5. Set **Public bucket**: ✅ Yes
6. Click **Create bucket**

#### B. Configure Storage Policies (Optional for Public Bucket)
If you want to make the bucket private and use RLS:
1. Go to Storage → complaint-images → Policies
2. Add policies for INSERT, SELECT based on user authentication

### 3. Run SQL Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **RUN** or press `Ctrl+Enter`
5. Verify tables were created:
   - Go to **Table Editor**
   - You should see: `users`, `complaints`, `complaint_images`

### 4. Create Test Users

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Click **Create user**

#### Option B: Via App Signup (If you implement signup screen)
Use the app's signup functionality

#### Set User Role (Important!)
After creating a user, you need to set their role:
1. Go to **SQL Editor**
2. Run this query to make a user an admin:
```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'youremail@example.com';
```

Or for technician:
```sql
UPDATE public.users 
SET role = 'technician' 
WHERE email = 'tech@example.com';
```

Default role is `user` (no need to update for regular users)

### 5. Verify Setup

Run these queries in SQL Editor to verify:

```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check if users table has data
SELECT * FROM public.users;

-- Check storage buckets
SELECT * FROM storage.buckets;
```

## 🧪 Testing

### Test Login
1. Start your app: `npm start` or `npx expo start`
2. Open the app
3. Enter the email and password of the user you created
4. Click **Sign In**
5. You should be redirected to the appropriate dashboard based on role

### Test Complaint Submission
1. Navigate to User Dashboard
2. Fill in the complaint form:
   - Title
   - Complaint Type
   - Location
   - Place
   - Description
   - (Optional) Add a photo
3. Click **Submit Complaint**
4. Verify in Supabase:
   - Go to **Table Editor** → `complaints`
   - You should see your new complaint
   - Go to **Storage** → `complaint-images`
   - You should see uploaded images (if you added any)

### Test Complaints List
1. Switch to "My Complaints" tab
2. You should see the complaint you just created
3. Toggle between "In Progress" and "Completed" tabs

## 🔐 Security Notes

### Row Level Security (RLS)
The SQL schema includes RLS policies that:
- Users can only see their own complaints
- Technicians can see assigned complaints
- Admins can see all complaints

### Storage Policies
If using a public bucket:
- Anyone can view images (via public URL)
- Only authenticated users can upload

If using a private bucket:
- Add RLS policies to control access
- Use signed URLs instead of public URLs

## 🐛 Troubleshooting

### "Failed to fetch user data"
- Check that the user exists in Authentication
- Verify the `users` table has a corresponding row
- Check the trigger `on_auth_user_created` is enabled

### "Failed to load complaints"
- Verify RLS policies are set correctly
- Check user has proper role in `users` table
- Look at browser console for detailed errors

### "Image upload failed"
- Verify `complaint-images` bucket exists
- Check bucket is public or has proper RLS policies
- Verify storage path format is correct

### "Invalid credentials"
- Double-check email and password
- Verify user exists in Authentication tab
- Check if email is confirmed (if email confirmation is enabled)

## 📁 File Structure

```
ComplaintManagementApp/
├── config/
│   └── supabaseClient.js       # Supabase client & helper functions
├── supabase/
│   └── schema.sql              # Database schema
├── screens/
│   ├── LoginScreen.js          # Updated with Supabase auth
│   └── UserDashboard.js        # Updated with Supabase storage
└── .env                        # Environment variables
```

## 🔑 Environment Variables

Current configuration (in `config/supabaseClient.js`):
```javascript
Project: version-2
SUPABASE_URL=https://oeazkkxhvmmthysjdklk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**✅ Tables Created Successfully!** You've already set up the database schema.

**Security Note**: For production, move these to environment variables using:
- `.env` file with `react-native-dotenv`
- Expo environment variables
- Or another secure method

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)

## 🎯 Next Steps

1. **Implement Signup Screen**: Create a signup flow for new users
2. **Add Profile Management**: Let users update their profile
3. **Implement Logout**: Add logout functionality
4. **Technician Dashboard**: Connect technician screens to Supabase
5. **Admin Dashboard**: Connect admin screens to Supabase
6. **Real-time Updates**: Use Supabase real-time subscriptions
7. **Push Notifications**: Integrate with Expo notifications

## ✨ Features Implemented

- ✅ User authentication (login)
- ✅ User profile management
- ✅ Complaint submission
- ✅ Image upload to storage
- ✅ Complaint listing
- ✅ Role-based access control
- ✅ Row Level Security

## 🚀 Ready to Deploy!

Your app is now connected to Supabase and ready for testing!
