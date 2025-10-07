-- Create test users for demonstration
-- Note: In production, users register through the signup form

-- Test Student User 1
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'student1@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Rahul Sharma", "phone": "+91-9876543210", "user_type": "student"}',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Test Student User 2
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'student2@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Priya Patel", "phone": "+91-9876543211", "user_type": "student"}',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Test PG Owner User 1
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'owner1@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Amit Kumar", "phone": "+91-9876543212", "user_type": "owner"}',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Test PG Owner User 2
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'owner2@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Sunita Devi", "phone": "+91-9876543213", "user_type": "owner"}',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Test Admin User
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '00000000-0000-0000-0000-000000000000',
  'admin@test.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "System Administrator", "phone": "+91-9999999999", "user_type": "admin"}',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Now create corresponding profiles in public.users table
-- These will be created automatically by the trigger, but let's ensure they exist

INSERT INTO public.users (id, email, full_name, phone, user_type, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'student1@test.com', 'Rahul Sharma', '+91-9876543210', 'student', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('22222222-2222-2222-2222-222222222222', 'student2@test.com', 'Priya Patel', '+91-9876543211', 'student', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('33333333-3333-3333-3333-333333333333', 'owner1@test.com', 'Amit Kumar', '+91-9876543212', 'owner', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('44444444-4444-4444-4444-444444444444', 'owner2@test.com', 'Sunita Devi', '+91-9876543213', 'owner', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('55555555-5555-5555-5555-555555555555', 'admin@test.com', 'System Administrator', '+91-9999999999', 'admin', NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  user_type = EXCLUDED.user_type;

-- Ensure RLS policies are correct
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own data
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy for service role to insert users (for registration)
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Policy for admins to view all users
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Policy for admins to update all users
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Policy for admins to delete users
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, user_type, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student'),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert a default admin user (you'll need to update this with your email)
-- This creates a user profile that can be promoted to admin
INSERT INTO public.users (id, email, full_name, user_type, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Placeholder ID
  'admin@easypg.com', -- Change this to your email
  'System Administrator',
  'admin',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Add some test properties from these owners
INSERT INTO public.properties (
  id,
  property_name,
  property_type,
  description,
  address,
  city,
  state,
  pincode,
  landmark,
  nearby_places,
  total_rooms,
  available_rooms,
  room_types,
  bathrooms,
  floors,
  built_year,
  rent_per_month,
  security_deposit,
  maintenance_charges,
  electricity_charges,
  amenities,
  gender_preference,
  food_policy,
  visitor_policy,
  smoking_policy,
  drinking_policy,
  owner_name,
  owner_phone,
  owner_email,
  alternate_contact,
  special_instructions,
  status,
  owner_id,
  created_at
) VALUES 
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Comfort Zone PG',
  'boys_pg',
  'Modern PG facility with all amenities for working professionals and students.',
  '123 Tech Park Road, Electronic City',
  'Bangalore',
  'karnataka',
  '560100',
  'Near Infosys Campus',
  ARRAY['Metro Station', 'IT Park', 'Shopping Mall', 'Hospital'],
  25,
  8,
  ARRAY['Single Occupancy', 'Double Occupancy'],
  10,
  4,
  2019,
  9500.00,
  12000.00,
  600.00,
  'included',
  ARRAY['wifi', 'parking', 'meals', 'security', 'laundry', 'gym'],
  'boys_only',
  'provided',
  'restricted',
  'not_allowed',
  'not_allowed',
  'Amit Kumar',
  '+91-9876543212',
  'owner1@test.com',
  '+91-9876543222',
  'Prefer IT professionals. Quiet environment maintained.',
  'pending',
  '33333333-3333-3333-3333-333333333333',
  NOW() - INTERVAL '1 day'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Safe Haven Girls PG',
  'girls_pg',
  'Secure and comfortable accommodation for girls with 24/7 security.',
  '456 Women Safety Complex, Koramangala',
  'Bangalore',
  'karnataka',
  '560095',
  'Near Forum Mall',
  ARRAY['Metro Station', 'Shopping Mall', 'Hospital', 'Bank/ATM'],
  18,
  5,
  ARRAY['Single Occupancy', 'Double Occupancy', 'Triple Occupancy'],
  8,
  3,
  2020,
  8800.00,
  10000.00,
  500.00,
  'actual',
  ARRAY['wifi', 'security', 'cctv', 'meals', 'laundry', 'housekeeping'],
  'girls_only',
  'provided',
  'allowed',
  'not_allowed',
  'not_allowed',
  'Sunita Devi',
  '+91-9876543213',
  'owner2@test.com',
  NULL,
  'Only for girls. Visitors allowed till 8 PM.',
  'approved',
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '2 days'
);

-- Add some test bookings
INSERT INTO public.bookings (
  property_id,
  student_id,
  room_type,
  move_in_date,
  status,
  rent_amount,
  security_deposit,
  created_at
) VALUES 
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '22222222-2222-2222-2222-222222222222',
  'Single Occupancy',
  '2024-02-15',
  'confirmed',
  8800.00,
  10000.00,
  NOW() - INTERVAL '1 day'
);

-- Add some test reviews
INSERT INTO public.reviews (
  property_id,
  student_id,
  rating,
  review_text,
  created_at
) VALUES 
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '22222222-2222-2222-2222-222222222222',
  5,
  'Excellent PG with great security and food. Highly recommended for girls!',
  NOW() - INTERVAL '12 hours'
);
