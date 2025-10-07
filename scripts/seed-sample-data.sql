-- Insert sample users (these would normally be created through Supabase Auth)
-- Note: In production, users are created through auth.users first, then this table is populated via triggers

-- Sample admin user
INSERT INTO public.users (id, email, full_name, phone, user_type) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@easypg.com',
  'System Administrator',
  '+91-9999999999',
  'admin'
) ON CONFLICT (id) DO NOTHING;

-- Sample PG owner
INSERT INTO public.users (id, email, full_name, phone, user_type) 
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'owner@example.com',
  'Rajesh Kumar',
  '+91-9876543210',
  'owner'
) ON CONFLICT (id) DO NOTHING;

-- Sample student
INSERT INTO public.users (id, email, full_name, phone, user_type) 
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'student@example.com',
  'Priya Sharma',
  '+91-9876543211',
  'student'
) ON CONFLICT (id) DO NOTHING;

-- Sample properties
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
  owner_id
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Green Valley PG',
  'boys_pg',
  'A comfortable and well-maintained PG for working professionals and students. Located in a prime area with excellent connectivity.',
  '123, Green Valley Apartments, Koramangala 5th Block, Bangalore',
  'Bangalore',
  'karnataka',
  '560095',
  'Near Forum Mall',
  ARRAY['Metro Station', 'Shopping Mall', 'Hospital', 'IT Park'],
  20,
  5,
  ARRAY['Single Occupancy', 'Double Occupancy'],
  8,
  3,
  2018,
  8500.00,
  10000.00,
  500.00,
  'included',
  ARRAY['wifi', 'parking', 'meals', 'security', 'laundry'],
  'boys_only',
  'provided',
  'restricted',
  'not_allowed',
  'not_allowed',
  'Rajesh Kumar',
  '+91-9876543210',
  'owner@example.com',
  '+91-9876543220',
  'Prefer working professionals. No loud music after 10 PM.',
  'approved',
  '00000000-0000-0000-0000-000000000002'
), (
  '10000000-0000-0000-0000-000000000002',
  'Sunrise Residency',
  'girls_pg',
  'Safe and secure accommodation for girls with 24/7 security and CCTV surveillance. Home-like environment with nutritious meals.',
  '456, Sunrise Apartments, HSR Layout Sector 2, Bangalore',
  'Bangalore',
  'karnataka',
  '560102',
  'Near HSR BDA Complex',
  ARRAY['Metro Station', 'Hospital', 'Shopping Mall', 'Bank/ATM'],
  15,
  3,
  ARRAY['Single Occupancy', 'Double Occupancy', 'Triple Occupancy'],
  6,
  2,
  2020,
  9200.00,
  12000.00,
  600.00,
  'actual',
  ARRAY['wifi', 'security', 'cctv', 'meals', 'laundry', 'housekeeping'],
  'girls_only',
  'provided',
  'allowed',
  'not_allowed',
  'not_allowed',
  'Sunita Devi',
  '+91-9876543212',
  'sunita@example.com',
  NULL,
  'Strictly for girls only. Visitors allowed till 8 PM.',
  'approved',
  '00000000-0000-0000-0000-000000000002'
), (
  '10000000-0000-0000-0000-000000000003',
  'Metro Heights PG',
  'co_living',
  'Modern co-living space with all amenities. Perfect for young professionals who value community living.',
  '789, Metro Heights, Whitefield Main Road, Bangalore',
  'Bangalore',
  'karnataka',
  '560066',
  'Near ITPL',
  ARRAY['Metro Station', 'IT Park', 'Shopping Mall', 'Restaurant'],
  25,
  8,
  ARRAY['Single Occupancy', 'Double Occupancy', 'Shared Room with Common Bath'],
  10,
  4,
  2021,
  7800.00,
  8000.00,
  400.00,
  'fixed',
  ARRAY['wifi', 'parking', 'gym', 'tv', 'ac', 'power_backup'],
  'co_living',
  'kitchen_access',
  'allowed',
  'designated_area',
  'social_only',
  'Amit Patel',
  '+91-9876543213',
  'amit@example.com',
  '+91-9876543223',
  'Community events every weekend. Gym access included.',
  'pending',
  '00000000-0000-0000-0000-000000000002'
) ON CONFLICT (id) DO NOTHING;

-- Sample property images
INSERT INTO public.property_images (property_id, image_url, image_order) VALUES
('10000000-0000-0000-0000-000000000001', '/placeholder.svg?height=400&width=600&text=Green+Valley+PG+Exterior', 0),
('10000000-0000-0000-0000-000000000001', '/placeholder.svg?height=400&width=600&text=Green+Valley+PG+Room', 1),
('10000000-0000-0000-0000-000000000001', '/placeholder.svg?height=400&width=600&text=Green+Valley+PG+Kitchen', 2),
('10000000-0000-0000-0000-000000000002', '/placeholder.svg?height=400&width=600&text=Sunrise+Residency+Exterior', 0),
('10000000-0000-0000-0000-000000000002', '/placeholder.svg?height=400&width=600&text=Sunrise+Residency+Room', 1),
('10000000-0000-0000-0000-000000000003', '/placeholder.svg?height=400&width=600&text=Metro+Heights+PG+Exterior', 0)
ON CONFLICT DO NOTHING;

-- Sample booking
INSERT INTO public.bookings (
  property_id,
  student_id,
  room_type,
  move_in_date,
  status,
  rent_amount,
  security_deposit
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  'Single Occupancy',
  '2024-02-01',
  'confirmed',
  8500.00,
  10000.00
) ON CONFLICT DO NOTHING;

-- Sample review
INSERT INTO public.reviews (
  property_id,
  student_id,
  rating,
  review_text
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  5,
  'Excellent PG with great facilities. The owner is very cooperative and the food is homely. Highly recommended!'
) ON CONFLICT DO NOTHING;
