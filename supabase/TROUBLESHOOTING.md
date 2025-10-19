# 🔧 Fixing "Error acquiring connection to database"

## Quick Fix Solutions

### Option 1: Use the Simple Schema File (RECOMMENDED)
I've created a new file `schema-simple.sql` with step-by-step sections.

**How to use it:**
1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy **STEP 1** from `schema-simple.sql`
4. Paste and click **RUN**
5. Wait for success ✅
6. Repeat for STEP 2, STEP 3, etc.

**DON'T paste the whole file at once!** Run each step separately.

---

### Option 2: Use Table Editor (No SQL needed)
1. Go to **Table Editor** in Supabase Dashboard
2. Click **New table**
3. Create tables manually:

#### Users Table
- Name: `users`
- Columns:
  - `id` - uuid (Primary Key, Reference to auth.users)
  - `email` - text (Unique)
  - `full_name` - text
  - `role` - text (Default: 'user')
  - `phone` - text
  - `avatar_url` - text
  - `created_at` - timestamptz (Default: now())
  - `updated_at` - timestamptz (Default: now())
- Enable RLS: ✅ Yes

#### Complaints Table
- Name: `complaints`
- Columns:
  - `id` - int8 (Primary Key, Auto-increment)
  - `user_id` - uuid (Foreign Key to users.id)
  - `title` - text
  - `type` - text
  - `description` - text
  - `location` - text
  - `place` - text
  - `department` - text (nullable)
  - `floor` - text (nullable)
  - `class` - text (nullable)
  - `status` - text (Default: 'in-progress')
  - `priority` - text (Default: 'medium')
  - `technician_id` - uuid (nullable, Foreign Key to users.id)
  - `assigned_at` - timestamptz (nullable)
  - `completed_at` - timestamptz (nullable)
  - `created_at` - timestamptz (Default: now())
  - `updated_at` - timestamptz (Default: now())
- Enable RLS: ✅ Yes

#### Complaint_Images Table
- Name: `complaint_images`
- Columns:
  - `id` - int8 (Primary Key, Auto-increment)
  - `complaint_id` - int8 (Foreign Key to complaints.id)
  - `url` - text
  - `storage_path` - text
  - `caption` - text (nullable)
  - `created_at` - timestamptz (Default: now())
- Enable RLS: ✅ Yes

---

### Option 3: Check Your Connection
The error might be temporary. Try:

1. **Refresh your browser**
2. **Check Supabase status**: https://status.supabase.com
3. **Wait 30 seconds** and try again
4. **Check your internet connection**

---

### Option 4: Create Storage Bucket First
Sometimes the error happens when trying to reference storage that doesn't exist.

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name: `complaint-images`
4. Public: ✅ Yes
5. Click **Create bucket**

Then try running the SQL again.

---

## Common Causes of This Error

1. ⚠️ **Trying to run the whole file at once**
   - Solution: Run step by step

2. ⚠️ **Tables already exist**
   - Solution: Add `DROP TABLE IF EXISTS` before CREATE TABLE
   - Or use `IF NOT EXISTS` (already in the script)

3. ⚠️ **Connection timeout**
   - Solution: Wait and retry

4. ⚠️ **Too many operations at once**
   - Solution: Use the step-by-step approach

5. ⚠️ **Supabase service issue**
   - Solution: Check https://status.supabase.com

---

## Minimal Setup (Just to Test)

If you just want to test the app quickly, run ONLY these:

```sql
-- Minimal setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.complaints (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  place TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in-progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.complaint_images (
  id BIGSERIAL PRIMARY KEY,
  complaint_id BIGINT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Basic RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_images ENABLE ROW LEVEL SECURITY;
```

This creates the basic structure without all the extra features.

---

## After Successfully Running SQL

1. **Create a test user:**
   - Go to **Authentication** → **Users**
   - Click **Add user**
   - Enter email and password
   - Click **Create user**

2. **Check tables were created:**
   - Go to **Table Editor**
   - You should see: `users`, `complaints`, `complaint_images`

3. **Create storage bucket:**
   - Go to **Storage**
   - Create bucket: `complaint-images`

4. **Test the app!**

---

## Still Having Issues?

If you're still getting the error, try this alternative:

1. Create a **NEW query** in SQL Editor
2. Run just this ONE line:
   ```sql
   SELECT 1;
   ```
3. If this works, your connection is fine
4. If this fails, there's a Supabase service issue

---

## Need Help?

Let me know:
- Which step failed?
- What error message did you see?
- Did any tables get created?

I can provide more specific help based on what's happening!
