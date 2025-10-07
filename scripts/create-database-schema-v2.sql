-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('student', 'owner', 'admin')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Information
  property_name TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('boys_pg', 'girls_pg', 'co_living', 'hostel', 'shared_apartment')),
  description TEXT NOT NULL,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  nearby_places TEXT[] DEFAULT '{}',
  
  -- Property Details
  total_rooms INTEGER NOT NULL CHECK (total_rooms > 0),
  available_rooms INTEGER NOT NULL CHECK (available_rooms >= 0),
  room_types TEXT[] DEFAULT '{}',
  bathrooms INTEGER NOT NULL CHECK (bathrooms > 0),
  floors INTEGER NOT NULL CHECK (floors > 0),
  built_year INTEGER CHECK (built_year > 1900 AND built_year <= EXTRACT(YEAR FROM NOW())),
  
  -- Pricing
  rent_per_month DECIMAL(10,2) NOT NULL CHECK (rent_per_month > 0),
  security_deposit DECIMAL(10,2) NOT NULL CHECK (security_deposit >= 0),
  maintenance_charges DECIMAL(10,2) DEFAULT 0,
  electricity_charges TEXT NOT NULL CHECK (electricity_charges IN ('included', 'actual', 'fixed')),
  
  -- Amenities
  amenities TEXT[] DEFAULT '{}',
  
  -- Rules & Policies
  gender_preference TEXT NOT NULL CHECK (gender_preference IN ('boys_only', 'girls_only', 'co_living')),
  food_policy TEXT CHECK (food_policy IN ('provided', 'cooking_allowed', 'no_cooking', 'kitchen_access')),
  visitor_policy TEXT CHECK (visitor_policy IN ('allowed', 'restricted', 'not_allowed', 'prior_permission')),
  smoking_policy TEXT CHECK (smoking_policy IN ('allowed', 'designated_area', 'not_allowed')),
  drinking_policy TEXT CHECK (drinking_policy IN ('allowed', 'not_allowed', 'social_only')),
  
  -- Contact Information
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  alternate_contact TEXT,
  
  -- Additional Information
  special_instructions TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
  
  -- Foreign Keys
  owner_id UUID REFERENCES public.users(id) NOT NULL
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  image_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  student_id UUID REFERENCES public.users(id) NOT NULL,
  room_type TEXT NOT NULL,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  move_in_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  rent_amount DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  student_id UUID REFERENCES public.users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, student_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  receiver_id UUID REFERENCES public.users(id) NOT NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_city') THEN
    CREATE INDEX idx_properties_city ON public.properties(city);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_status') THEN
    CREATE INDEX idx_properties_status ON public.properties(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_owner_id') THEN
    CREATE INDEX idx_properties_owner_id ON public.properties(owner_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_rent') THEN
    CREATE INDEX idx_properties_rent ON public.properties(rent_per_month);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_property_type') THEN
    CREATE INDEX idx_properties_property_type ON public.properties(property_type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_property_images_property_id') THEN
    CREATE INDEX idx_property_images_property_id ON public.property_images(property_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_property_id') THEN
    CREATE INDEX idx_bookings_property_id ON public.bookings(property_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_student_id') THEN
    CREATE INDEX idx_bookings_student_id ON public.bookings(student_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reviews_property_id') THEN
    CREATE INDEX idx_reviews_property_id ON public.reviews(property_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_property_id') THEN
    CREATE INDEX idx_messages_property_id ON public.messages(property_id);
  END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  -- Users policies
  DROP POLICY IF EXISTS "Users can read own data" ON public.users;
  DROP POLICY IF EXISTS "Users can update own data" ON public.users;
  
  -- Properties policies
  DROP POLICY IF EXISTS "Anyone can read approved properties" ON public.properties;
  DROP POLICY IF EXISTS "Owners can read own properties" ON public.properties;
  DROP POLICY IF EXISTS "Owners can insert properties" ON public.properties;
  DROP POLICY IF EXISTS "Owners can update own properties" ON public.properties;
  DROP POLICY IF EXISTS "Admins can read all properties" ON public.properties;
  DROP POLICY IF EXISTS "Admins can update all properties" ON public.properties;
  
  -- Property images policies
  DROP POLICY IF EXISTS "Anyone can read property images" ON public.property_images;
  DROP POLICY IF EXISTS "Owners can manage property images" ON public.property_images;
  
  -- Bookings policies
  DROP POLICY IF EXISTS "Students can read own bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Owners can read property bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Students can create bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Students can update own bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Owners can update property bookings" ON public.bookings;
  
  -- Reviews policies
  DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Students can create reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Students can update own reviews" ON public.reviews;
  
  -- Messages policies
  DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
  DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
END $$;

-- Create RLS policies

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Anyone can read approved properties" ON public.properties
  FOR SELECT USING (status = 'approved');

-- Owners can read their own properties
CREATE POLICY "Owners can read own properties" ON public.properties
  FOR SELECT USING (auth.uid() = owner_id);

-- Owners can insert their own properties
CREATE POLICY "Owners can insert properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own properties
CREATE POLICY "Owners can update own properties" ON public.properties
  FOR UPDATE USING (auth.uid() = owner_id);

-- Admins can read all properties
CREATE POLICY "Admins can read all properties" ON public.properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Admins can update all properties
CREATE POLICY "Admins can update all properties" ON public.properties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Property images policies
CREATE POLICY "Anyone can read property images" ON public.property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_id AND status = 'approved'
    )
  );

-- Owners can manage their property images
CREATE POLICY "Owners can manage property images" ON public.property_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_id AND owner_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Students can read own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Owners can read property bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Students can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Owners can update property bookings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_id AND owner_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Students can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = student_id);

-- Messages policies
CREATE POLICY "Users can read own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Create storage bucket for property images (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'property-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('property-images', 'property-images', true);
  END IF;
END $$;

-- Drop existing storage policies and recreate them
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;
END $$;

-- Create storage policies for property images
CREATE POLICY "Anyone can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own property images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'property-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own property images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
