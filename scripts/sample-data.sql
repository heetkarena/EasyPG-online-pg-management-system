-- Sample data for EasyPG application
-- Run this after creating the database schema

-- Insert admin user
INSERT INTO users (id, email, password_hash, full_name, phone, user_type, is_verified) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@easypg.com', '$2b$12$LQv3c1yqBwLFaAK.rOUK6.7p84vDFy8qcjzcog5/YEAm3eQlFYe7K', 'Admin User', '9999999999', 'admin', true);

-- Insert sample PG owners
INSERT INTO users (id, email, password_hash, full_name, phone, user_type, is_verified, college_name, occupation) VALUES
('11111111-1111-1111-1111-111111111111', 'owner1@easypg.com', '$2b$12$LQv3c1yqBwLFaAK.rOUK6.7p84vDFy8qcjzcog5/YEAm3eQlFYe7K', 'Rajesh Kumar', '9876543210', 'owner', true, NULL, 'Property Owner'),
('11111111-1111-1111-1111-111111111112', 'owner2@easypg.com', '$2b$12$LQv3c1yqBwLFaAK.rOUK6.7p84vDFy8qcjzcog5/YEAm3eQlFYe7K', 'Priya Sharma', '9876543211', 'owner', true, NULL, 'Property Owner'),
('11111111-1111-1111-1111-111111111113', 'owner3@easypg.com', '$2b$12$LQv3c1yqBwLFaAK.rOUK6.7p84vDFy8qcjzcog5/YEAm3eQlFYe7K', 'Amit Patel', '9876543212', 'owner', true, NULL, 'Property Owner');

-- Insert sample students
INSERT INTO users (id, email, password_hash, full_name, phone, user_type, is_verified, college_name, occupation) VALUES
('22222222-2222-2222-2222-222222222221', 'student1@easypg.com', '$2b$12$LQv3c1yqBwLFaAK.rOUK6.7p84vDFy8qcjzcog5/YEAm3eQlFYe7K', 'Arjun Singh', '9876543220', 'student', true, 'IIT Bangalore', 'Student'),
('22222222-2222-2222-2222-222222222222', 'student2@easypg.com', '$2b$12$LQv3c1yqBwLFaAK.rOUK6.7p84vDFy8qcjzcog5/YEAm3eQlFYe7K', 'Sneha Reddy', '9876543221', 'student', true, 'IISC Bangalore', 'Student'),
('22222222-2222-2222-2222-222222222223', 'student3@easypg.com', '$2b$12$LQv3c1yqBwLFaAK.rOUK6.7p84vDFy8qcjzcog5/YEAm3eQlFYe7K', 'Vikram Agarwal', '9876543222', 'student', true, 'NIT Karnataka', 'Student');

-- Insert sample properties
INSERT INTO properties (
    id, owner_id, property_name, property_type, description,
    address, city, state, pincode, landmark,
    total_rooms, available_rooms, bathrooms, floors,
    rent_per_month, security_deposit, maintenance_charges,
    amenities, gender_preference, food_policy, visitor_policy,
    status
) VALUES
(
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    'Green Valley PG',
    'boys_pg',
    'Modern PG accommodation with all amenities near IT parks. Fully furnished rooms with AC, WiFi, and home-cooked meals.',
    '123 Green Valley Road, Koramangala 4th Block',
    'Bangalore',
    'Karnataka',
    '560034',
    'Near Forum Mall',
    20, 5, 8, 3,
    8500.00, 10000.00, 500.00,
    '["wifi", "ac", "meals", "laundry", "parking", "security", "gym", "power_backup"]',
    'boys_only',
    'Vegetarian and Non-vegetarian meals provided',
    'Visitors allowed until 9 PM',
    'approved'
),
(
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111112',
    'Sunrise Residency',
    'girls_pg',
    'Safe and secure PG for working women and students. 24x7 security, CCTV surveillance, and nutritious meals.',
    '456 Sunrise Layout, HSR Layout Sector 2',
    'Bangalore',
    'Karnataka',
    '560102',
    'Near Central Mall',
    15, 3, 6, 2,
    9200.00, 12000.00, 600.00,
    '["wifi", "ac", "meals", "laundry", "security", "power_backup", "water_purifier"]',
    'girls_only',
    'Homely vegetarian meals',
    'No male visitors allowed',
    'approved'
),
(
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111113',
    'Metro Heights PG',
    'co_living',
    'Modern co-living space with shared common areas and private rooms. Perfect for young professionals.',
    '789 Metro Heights, Whitefield Main Road',
    'Bangalore',
    'Karnataka',
    '560066',
    'Near Phoenix MarketCity',
    25, 8, 10, 4,
    7800.00, 8000.00, 400.00,
    '["wifi", "meals", "laundry", "parking", "security", "gym", "common_area", "netflix"]',
    'co_living',
    'Continental and Indian cuisine',
    'Visitors allowed until 10 PM',
    'approved'
),
(
    '33333333-3333-3333-3333-333333333334',
    '11111111-1111-1111-1111-111111111111',
    'City Center Hostel',
    'hostel',
    'Budget-friendly hostel accommodation in the heart of the city. Shared and private rooms available.',
    '321 MG Road, City Center',
    'Bangalore',
    'Karnataka',
    '560001',
    'Near Trinity Metro Station',
    30, 12, 12, 5,
    6500.00, 5000.00, 300.00,
    '["wifi", "meals", "laundry", "security", "common_area"]',
    'co_living',
    'Basic meals provided',
    'Visitors allowed until 8 PM',
    'approved'
),
(
    '33333333-3333-3333-3333-333333333335',
    '11111111-1111-1111-1111-111111111112',
    'Elite Ladies PG',
    'girls_pg',
    'Premium PG for working professionals and students. Fully furnished AC rooms with attached bathrooms.',
    '567 Richmond Road, Shanti Nagar',
    'Bangalore',
    'Karnataka',
    '560025',
    'Near UB City Mall',
    12, 2, 12, 3,
    12000.00, 15000.00, 800.00,
    '["wifi", "ac", "meals", "laundry", "parking", "security", "gym", "power_backup", "housekeeping"]',
    'girls_only',
    'Premium vegetarian meals',
    'Restricted visitor policy',
    'approved'
);

-- Insert sample property images
INSERT INTO property_images (property_id, image_url, image_title, image_order, is_primary) VALUES
('33333333-3333-3333-3333-333333333331', '/static/images/green-valley-1.jpg', 'Green Valley PG - Front View', 1, true),
('33333333-3333-3333-3333-333333333331', '/static/images/green-valley-2.jpg', 'Green Valley PG - Room', 2, false),
('33333333-3333-3333-3333-333333333331', '/static/images/green-valley-3.jpg', 'Green Valley PG - Common Area', 3, false),
('33333333-3333-3333-3333-333333333332', '/static/images/sunrise-1.jpg', 'Sunrise Residency - Exterior', 1, true),
('33333333-3333-3333-3333-333333333332', '/static/images/sunrise-2.jpg', 'Sunrise Residency - Room', 2, false),
('33333333-3333-3333-3333-333333333333', '/static/images/metro-1.jpg', 'Metro Heights PG - Building', 1, true),
('33333333-3333-3333-3333-333333333333', '/static/images/metro-2.jpg', 'Metro Heights PG - Co-living Space', 2, false);

-- Insert sample bookings
INSERT INTO bookings (
    id, property_id, student_id, room_type, check_in_date, check_out_date,
    monthly_rent, security_deposit, total_amount, status, booking_notes
) VALUES
(
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333331',
    '22222222-2222-2222-2222-222222222221',
    'Single AC Room',
    '2024-03-01',
    '2024-09-01',
    8500.00, 10000.00, 18500.00,
    'confirmed',
    'Booking confirmed for 6 months'
),
(
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333332',
    '22222222-2222-2222-2222-222222222222',
    'Single AC Room',
    '2024-03-15',
    '2024-12-15',
    9200.00, 12000.00, 21200.00,
    'confirmed',
    'Long term stay confirmed'
);

-- Insert sample reviews
INSERT INTO reviews (
    id, property_id, student_id, booking_id, rating, review_title, review_text,
    cleanliness_rating, food_rating, safety_rating, location_rating,
    is_verified, moderation_status
) VALUES
(
    '55555555-5555-5555-5555-555555555551',
    '33333333-3333-3333-3333-333333333331',
    '22222222-2222-2222-2222-222222222221',
    '44444444-4444-4444-4444-444444444441',
    5, 'Excellent PG with great amenities',
    'I have been staying here for 6 months and the experience has been amazing. The food is great, rooms are clean, and the location is perfect for IT professionals.',
    5, 5, 4, 5,
    true, 'approved'
),
(
    '55555555-5555-5555-5555-555555555552',
    '33333333-3333-3333-3333-333333333332',
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444442',
    4, 'Good place for working women',
    'Safe and secure environment. The owner is very caring and the food is homely. Only complaint is the WiFi speed could be better.',
    4, 5, 5, 4,
    true, 'approved'
);

-- Insert sample messages
INSERT INTO messages (sender_id, receiver_id, property_id, message_text, is_read) VALUES
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'Hi, I am interested in booking a room. Is it available from next month?', true),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333331', 'Yes, we have rooms available. When would you like to visit?', true),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333332', 'What are the meal timings?', false);

-- Insert sample saved properties
INSERT INTO saved_properties (student_id, property_id, notes) VALUES
('22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333332', 'Good backup option'),
('22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333333', 'Like the co-living concept'),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333331', 'Considering for next year'),
('22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333334', 'Budget-friendly option');

-- Insert sample property visits
INSERT INTO property_visits (property_id, student_id, scheduled_date, scheduled_time, visit_status, student_notes) VALUES
('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222223', '2024-03-20', '15:00:00', 'scheduled', 'Want to see the gym and common areas'),
('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222221', '2024-03-22', '11:00:00', 'completed', 'Visit completed, liked the security measures');

-- Insert sample payments
INSERT INTO payments (
    booking_id, student_id, owner_id, payment_type, amount,
    payment_method, transaction_id, status, due_date, paid_at
) VALUES
(
    '44444444-4444-4444-4444-444444444441',
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'deposit', 10000.00, 'upi', 'TXN123456789', 'completed',
    '2024-02-25', '2024-02-24 14:30:00'
),
(
    '44444444-4444-4444-4444-444444444441',
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'rent', 8500.00, 'upi', 'TXN123456790', 'completed',
    '2024-03-01', '2024-03-01 10:15:00'
);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, notification_type, related_id, is_read) VALUES
('22222222-2222-2222-2222-222222222221', 'Booking Confirmed', 'Your booking for Green Valley PG has been confirmed.', 'booking', '44444444-4444-4444-4444-444444444441', true),
('11111111-1111-1111-1111-111111111111', 'New Booking Request', 'You have received a new booking request for Green Valley PG.', 'booking', '44444444-4444-4444-4444-444444444441', true),
('22222222-2222-2222-2222-222222222222', 'Payment Due', 'Your monthly rent payment is due in 3 days.', 'payment', '44444444-4444-4444-4444-444444444442', false);

-- Insert sample activity logs
INSERT INTO activity_logs (user_id, activity_type, description, ip_address, related_table, related_id) VALUES
('22222222-2222-2222-2222-222222222221', 'login', 'User logged in successfully', '192.168.1.100', 'users', '22222222-2222-2222-2222-222222222221'),
('11111111-1111-1111-1111-111111111111', 'property_created', 'New property listed', '192.168.1.101', 'properties', '33333333-3333-3333-3333-333333333331'),
('22222222-2222-2222-2222-222222222221', 'booking_made', 'New booking created', '192.168.1.100', 'bookings', '44444444-4444-4444-4444-444444444441');

-- Update property availability based on confirmed bookings
UPDATE properties SET available_rooms = available_rooms - 1 
WHERE id IN (
    SELECT DISTINCT property_id FROM bookings WHERE status = 'confirmed'
);

-- Create some helpful views
CREATE VIEW property_summary AS
SELECT 
    p.*,
    u.full_name as owner_name,
    u.phone as owner_phone,
    u.email as owner_email,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(r.id) as review_count,
    COUNT(b.id) as booking_count
FROM properties p
LEFT JOIN users u ON p.owner_id = u.id
LEFT JOIN reviews r ON p.id = r.property_id AND r.moderation_status = 'approved'
LEFT JOIN bookings b ON p.id = b.property_id
GROUP BY p.id, u.full_name, u.phone, u.email;

CREATE VIEW user_dashboard_stats AS
SELECT 
    u.id as user_id,
    u.user_type,
    CASE 
        WHEN u.user_type = 'student' THEN
            jsonb_build_object(
                'saved_properties', (SELECT COUNT(*) FROM saved_properties WHERE student_id = u.id),
                'bookings', (SELECT COUNT(*) FROM bookings WHERE student_id = u.id),
                'reviews_written', (SELECT COUNT(*) FROM reviews WHERE student_id = u.id),
                'messages_sent', (SELECT COUNT(*) FROM messages WHERE sender_id = u.id)
            )
        WHEN u.user_type = 'owner' THEN
            jsonb_build_object(
                'total_properties', (SELECT COUNT(*) FROM properties WHERE owner_id = u.id),
                'total_bookings', (SELECT COUNT(*) FROM bookings b JOIN properties p ON b.property_id = p.id WHERE p.owner_id = u.id),
                'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM payments pay JOIN bookings b ON pay.booking_id = b.id JOIN properties p ON b.property_id = p.id WHERE p.owner_id = u.id AND pay.status = 'completed'),
                'avg_rating', (SELECT COALESCE(AVG(rating), 0) FROM reviews r JOIN properties p ON r.property_id = p.id WHERE p.owner_id = u.id)
            )
    END as stats
FROM users u;

-- Grant necessary permissions (adjust based on your RLS setup)
-- Note: In production, you would set up proper RLS policies instead of these grants

COMMENT ON VIEW property_summary IS 'Summary view of properties with owner info and ratings';
COMMENT ON VIEW user_dashboard_stats IS 'Dashboard statistics for users based on their type';
