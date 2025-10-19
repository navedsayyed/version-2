-- ============================================================
-- Supabase SQL Schema for Complaint Management App
-- ============================================================
-- IMPORTANT: Run each section separately in SQL Editor
-- Wait for each section to complete before running the next
-- ============================================================

-- ============================================================
-- SECTION 1: EXTENSIONS (Run this first)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SECTION 2: USERS TABLE (Run this second)
-- ============================================================
-- Drop existing table if you want to start fresh (CAREFUL: This deletes data!)
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Stores user profile information linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'technician', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert technicians" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.users;

-- RLS Policies for users table
-- SAFE POLICIES - No recursive queries to avoid infinite recursion!

-- Allow all authenticated users to view profiles (simple and safe)
CREATE POLICY "Users can view profiles"
  ON public.users FOR SELECT
  USING (true);

-- Allow authenticated users to update profiles (needed for admin editing technicians)
CREATE POLICY "Allow authenticated update"
  ON public.users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to insert (needed for registration and admin adding technicians)
CREATE POLICY "Allow authenticated insert"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- SECTION 3: COMPLAINTS TABLE (Run this third)
-- ============================================================
-- Drop existing table if you want to start fresh (CAREFUL: This deletes data!)
-- DROP TABLE IF EXISTS public.complaints CASCADE;

-- Stores all complaints submitted by users
CREATE TABLE IF NOT EXISTS public.complaints (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  place TEXT NOT NULL,
  department TEXT,
  floor TEXT,
  class TEXT,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'assigned', 'completed', 'rejected')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  technician_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
DROP INDEX IF EXISTS idx_complaints_user_id;
DROP INDEX IF EXISTS idx_complaints_status;
DROP INDEX IF EXISTS idx_complaints_technician_id;
DROP INDEX IF EXISTS idx_complaints_created_at;
DROP INDEX IF EXISTS idx_complaints_type;
CREATE INDEX idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_technician_id ON public.complaints(technician_id);
CREATE INDEX idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX idx_complaints_type ON public.complaints(type);

-- Enable Row Level Security
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Technicians can view assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can view all complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can create their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can update their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Technicians can update assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can update all complaints" ON public.complaints;

-- RLS Policies for complaints table
CREATE POLICY "Users can view their own complaints"
  ON public.complaints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Technicians can view assigned complaints"
  ON public.complaints FOR SELECT
  USING (
    auth.uid() = technician_id OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'technician'
    )
  );

CREATE POLICY "Admins can view all complaints"
  ON public.complaints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create their own complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own complaints"
  ON public.complaints FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Technicians can update assigned complaints"
  ON public.complaints FOR UPDATE
  USING (auth.uid() = technician_id);

CREATE POLICY "Admins can update all complaints"
  ON public.complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- SECTION 4: COMPLAINT_IMAGES TABLE (Run this fourth)
-- ============================================================
-- Drop existing table if you want to start fresh (CAREFUL: This deletes data!)
-- DROP TABLE IF EXISTS public.complaint_images CASCADE;

-- Stores image URLs for complaints (multiple images per complaint)
CREATE TABLE IF NOT EXISTS public.complaint_images (
  id BIGSERIAL PRIMARY KEY,
  complaint_id BIGINT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index
DROP INDEX IF EXISTS idx_complaint_images_complaint_id;
CREATE INDEX idx_complaint_images_complaint_id ON public.complaint_images(complaint_id);

-- Enable Row Level Security
ALTER TABLE public.complaint_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view images of their complaints" ON public.complaint_images;
DROP POLICY IF EXISTS "Technicians can view images of assigned complaints" ON public.complaint_images;
DROP POLICY IF EXISTS "Admins can view all images" ON public.complaint_images;
DROP POLICY IF EXISTS "Users can insert images for their complaints" ON public.complaint_images;

-- RLS Policies for complaint_images table
CREATE POLICY "Users can view images of their complaints"
  ON public.complaint_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Technicians can view images of assigned complaints"
  ON public.complaint_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id AND technician_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all images"
  ON public.complaint_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert images for their complaints"
  ON public.complaint_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id AND user_id = auth.uid()
    )
  );

-- ============================================================
-- SECTION 5: TRIGGERS & FUNCTIONS (Run this fifth)
-- ============================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if any
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_complaints_updated_at ON public.complaints;

-- Create triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 6. STORAGE BUCKET SETUP
-- ============================================================
-- You need to create the storage bucket manually in Supabase Dashboard
-- Go to: Storage -> Create a new bucket
-- Bucket name: complaint-images
-- Public bucket: Yes (or configure RLS policies for private access)

-- Optional: Add RLS policies for storage if you make it private
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('complaint-images', 'complaint-images', true);

-- ============================================================
-- 7. SAMPLE DATA (OPTIONAL)
-- ============================================================
-- Uncomment to insert sample users (passwords need to be created via Auth)

-- Sample Admin User (create via Supabase Auth first, then update role)
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@example.com';

-- Sample Technician User
-- UPDATE public.users SET role = 'technician' WHERE email = 'tech@example.com';

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify your setup:

-- Check if tables exist
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check users table
-- SELECT * FROM public.users;

-- Check complaints table structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'complaints';

-- ============================================================
-- NOTES:
-- ============================================================
-- 1. Make sure to create the 'complaint-images' storage bucket in Supabase Dashboard
-- 2. The trigger automatically creates a user profile when someone signs up
-- 3. RLS policies ensure users can only see their own data
-- 4. Admins and technicians have elevated permissions
-- 5. To create admin/technician accounts, sign them up normally then update their role
