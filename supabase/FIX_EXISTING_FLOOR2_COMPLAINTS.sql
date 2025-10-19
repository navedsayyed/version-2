-- Fix existing Floor 2 complaints that went to Civil department
-- This updates all old complaints to route correctly

-- Step 1: Check current Floor 2 complaints
SELECT id, title, floor, department, created_at
FROM public.complaints
WHERE floor = '2'
ORDER BY created_at DESC;

-- Step 2: Update all Floor 2 complaints to "First Year" department
UPDATE public.complaints
SET department = 'First Year'
WHERE floor = '2'
  AND (department = 'Civil' OR department IS NULL);

-- Step 3: Verify the update
SELECT id, title, floor, department, created_at
FROM public.complaints
WHERE floor = '2'
ORDER BY created_at DESC;

-- Step 4: Check what Civil admin should see (only Floor 1)
SELECT id, title, floor, department, created_at
FROM public.complaints
WHERE department = 'Civil' OR floor = '1'
ORDER BY created_at DESC;

-- Step 5: Check what First Year admin should see (only Floor 2)
SELECT id, title, floor, department, created_at
FROM public.complaints
WHERE department = 'First Year' OR floor = '2'
ORDER BY created_at DESC;
