-- Fix Database Setup Script
-- This script will resolve all authentication issues

-- First, clean up existing data to avoid conflicts
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;

-- Create users table with proper structure
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('student', 'owner', 'admin')) NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  auth_user_id UUID -- This will link to auth.users when user signs up normally
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_name TEXT NOT NULL,
  property_type TEXT CHECK (property_type IN ('boys_pg', 'girls_pg', 'co_living', 'hostel')) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  total_rooms INTEGER NOT NULL,
  available_rooms INTEGER NOT NULL,
  room_types TEXT[],
  bathrooms INTEGER,
  floors INTEGER,
  rent_per_month DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2),
  electricity_charges TEXT CHECK (electricity_charges IN ('included', 'extra')),
  amenities TEXT[],
  gender_preference TEXT CHECK (gender_preference IN ('boys_only', 'girls_only', 'co_living')),
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE,
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id OR auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_user_id OR auth.uid()::text = id::text);

CREATE POLICY "Service role can manage users" ON public.users
  FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE (auth_user_id = auth.uid() OR id::text = auth.uid()::text) AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE (auth_user_id = auth.uid() OR id::text = auth.uid()::text) AND user_type = 'admin'
    )
  );

-- Create RLS policies for properties
CREATE POLICY "Anyone can view approved properties" ON public.properties
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Owners can manage own properties" ON public.properties
  FOR ALL USING (owner_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all properties" ON public.properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE (auth_user_id = auth.uid() OR id::text = auth.uid()::text) AND user_type = 'admin'
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    auth_user_id, 
    email, 
    full_name, 
    phone, 
    user_type, 
    created_at
  )
  VALUES (
    NEW.id,
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

-- Create ONE admin user (replace with your actual email)
INSERT INTO public.users (email, full_name, user_type, created_at)
VALUES (
  'admin@easypg.com',
  'System Administrator',
  'admin',
  NOW()
);

-- Create test users for immediate testing
INSERT INTO public.users (email, full_name, phone, user_type, created_at) VALUES
('student1@test.com', 'Rahul Sharma', '+91-9876543210', 'student', NOW()),
('student2@test.com', 'Priya Patel', '+91-9876543211', 'student', NOW()),
('owner1@test.com', 'Amit Kumar', '+91-9876543212', 'owner', NOW()),
('owner2@test.com', 'Sunita Devi', '+91-9876543213', 'owner', NOW());

-- Add sample property
INSERT INTO public.properties (
  id,
  property_name,
  property_type,
  description,
  address,
  city,
  state,
  pincode,
  total_rooms,
  available_rooms,
  room_types,
  bathrooms,
  floors,
  rent_per_month,
  security_deposit,
  electricity_charges,
  amenities,
  gender_preference,
  owner_name,
  owner_phone,
  owner_email,
  status,
  owner_id,
  created_at
) 
SELECT 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Comfort Zone PG',
  'boys_pg',
  'Modern PG facility with all amenities.',
  '123 Tech Park Road, Electronic City',
  'Bangalore',
  'Karnataka',
  '560100',
  25,
  8,
  ARRAY['Single Occupancy', 'Double Occupancy'],
  10,
  4,
  9500.00,
  12000.00,
  'included',
  ARRAY['wifi', 'parking', 'meals', 'security'],
  'boys_only',
  'Amit Kumar',
  '+91-9876543212',
  'owner1@test.com',
  'approved',
  u.id,
  NOW()
FROM public.users u WHERE u.email = 'owner1@test.com';
