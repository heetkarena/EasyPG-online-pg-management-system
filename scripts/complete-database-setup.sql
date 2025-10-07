-- Complete Database Setup for EasyPG
-- This script creates all necessary tables, functions, triggers, and policies

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.property_images CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('student', 'owner', 'admin')) NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  auth_user_id UUID,
  last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_name TEXT NOT NULL,
  property_type TEXT CHECK (property_type IN ('boys_pg', 'girls_pg', 'co_living', 'hostel', 'shared_apartment')) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  nearby_places TEXT[],
  total_rooms INTEGER NOT NULL,
  available_rooms INTEGER NOT NULL,
  room_types TEXT[],
  bathrooms INTEGER,
  floors INTEGER,
  built_year INTEGER,
  rent_per_month DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2),
  maintenance_charges DECIMAL(10,2),
  electricity_charges TEXT CHECK (electricity_charges IN ('included', 'extra', 'per_unit')) DEFAULT 'extra',
  amenities TEXT[],
  gender_preference TEXT CHECK (gender_preference IN ('boys_only', 'girls_only', 'co_living')) NOT NULL,
  food_policy TEXT,
  visitor_policy TEXT,
  smoking_policy TEXT,
  drinking_policy TEXT,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  alternate_contact TEXT,
  special_instructions TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')) DEFAULT 'pending',
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property images table
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  total_amount DECIMAL(10,2),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  booking_notes TEXT,
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
  review_title TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
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
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
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

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE (auth_user_id = auth.uid() OR id::text = auth.uid()::text) AND user_type = 'admin'
    )
  );

-- RLS Policies for properties table
CREATE POLICY "Anyone can view approved properties" ON public.properties
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Owners can manage own properties" ON public.properties
  FOR ALL USING (owner_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid() OR id::text = auth.uid()::text
  ));

CREATE POLICY "Admins can manage all properties" ON public.properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE (auth_user_id = auth.uid() OR id::text = auth.uid()::text) AND user_type = 'admin'
    )
  );

-- RLS Policies for property images
CREATE POLICY "Anyone can view property images" ON public.property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_id AND status = 'approved'
    )
  );

CREATE POLICY "Property owners can manage images" ON public.property_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      JOIN public.users u ON p.owner_id = u.id
      WHERE p.id = property_id AND (u.auth_user_id = auth.uid() OR u.id::text = auth.uid()::text)
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid() OR id::text = auth.uid()::text
    ) OR
    EXISTS (
      SELECT 1 FROM public.properties p
      JOIN public.users u ON p.owner_id = u.id
      WHERE p.id = property_id AND (u.auth_user_id = auth.uid() OR u.id::text = auth.uid()::text)
    )
  );

CREATE POLICY "Students can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid() AND user_type = 'student'
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Students can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid() AND user_type = 'student'
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    sender_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid() OR id::text = auth.uid()::text
    ) OR
    receiver_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid() OR id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid() OR id::text = auth.uid()::text
    )
  );

-- Function to handle new user registration
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
    created_at,
    last_sign_in_at
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last sign in
CREATE OR REPLACE FUNCTION public.handle_user_signin()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users 
  SET last_sign_in_at = NOW()
  WHERE auth_user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_signin ON auth.users;
CREATE TRIGGER on_auth_user_signin
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_signin();

-- Create admin user
INSERT INTO public.users (email, full_name, user_type, created_at)
VALUES (
  'admin@easypg.com',
  'System Administrator',
  'admin',
  NOW()
) ON CONFLICT (email) DO UPDATE SET 
  user_type = 'admin',
  full_name = 'System Administrator';

-- Create test users
INSERT INTO public.users (email, full_name, phone, user_type, created_at) VALUES
('student1@test.com', 'Rahul Sharma', '+91-9876543210', 'student', NOW()),
('student2@test.com', 'Priya Patel', '+91-9876543211', 'student', NOW()),
('owner1@test.com', 'Amit Kumar', '+91-9876543212', 'owner', NOW()),
('owner2@test.com', 'Sunita Devi', '+91-9876543213', 'owner', NOW())
ON CONFLICT (email) DO NOTHING;

-- Create sample properties
INSERT INTO public.properties (
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
  'Comfort Zone PG',
  'boys_pg',
  'Modern PG facility with all amenities including WiFi, meals, and 24/7 security.',
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
  ARRAY['wifi', 'parking', 'meals', 'security', 'laundry', 'gym'],
  'boys_only',
  'Amit Kumar',
  '+91-9876543212',
  'owner1@test.com',
  'approved',
  u.id,
  NOW()
FROM public.users u WHERE u.email = 'owner1@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.properties (
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
  'Sunrise Girls Hostel',
  'girls_pg',
  'Safe and secure accommodation for working women with all modern facilities.',
  '456 MG Road, Koramangala',
  'Bangalore',
  'Karnataka',
  '560034',
  30,
  12,
  ARRAY['Single Occupancy', 'Double Occupancy', 'Triple Occupancy'],
  15,
  5,
  8500.00,
  10000.00,
  'extra',
  ARRAY['wifi', 'meals', 'security', 'laundry', 'common_room'],
  'girls_only',
  'Sunita Devi',
  '+91-9876543213',
  'owner2@test.com',
  'approved',
  u.id,
  NOW()
FROM public.users u WHERE u.email = 'owner2@test.com'
ON CONFLICT DO NOTHING;
