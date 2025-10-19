# Super Admin Setup and Usage

This app now supports a Super Admin role who can:

- View department-wise progress and visualize complaint stats
- Manage Admins (create admins by department or floor)
- See all complaints across departments

## 1) Enable the role in database

Run this SQL in Supabase SQL editor:

1. Open `supabase/ADD_SUPER_ADMIN.sql` and run the entire file.
2. Promote your principal/admin head to super admin:

```
-- Replace with actual email
UPDATE public.users SET role = 'super_admin' WHERE email = 'principal@yourcollege.edu';
```

Notes:
- If you have a department constraint, ensure it includes 'First Year' (already included by `FIX_DEPARTMENT_CONSTRAINT.sql`).
- Users table already has `department TEXT` and optional `floor TEXT` columns.

## 2) Login and navigation

- Login with the super admin user. The app routes to Super Admin dashboard automatically.
- Tabs:
  - Overview: Department-wise progress with a simple bar chart and progress bars
  - Manage Admins: List current admins and add new ones

## 3) Add new Admins

- Tap “Add Admin”
- Choose Department Mode to assign by department (standard HOD)
- Choose Floor Mode to assign a floor-specific admin (e.g., Floor 2 for First Year)
- A new auth user is created and a profile is upserted into `public.users` with role `admin`.

## 4) Policies and permissions

- Super Admin can read/update all complaints (RLS updated in SQL script)
- Users table has open SELECT/INSERT/UPDATE for authenticated to allow admin creation flows

## 5) Next upgrades

- Replace the basic bar visualization with a proper chart library (e.g., `react-native-chart-kit`)
- Add edit/remove admin actions
- Add department/floor filters and search in Manage Admins
