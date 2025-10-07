-- EasyPG Database Schema
-- PostgreSQL database schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_type_enum AS ENUM ('student', 'owner', 'admin');
CREATE TYPE property_type_enum AS ENUM ('boys_pg', 'girls_pg', 'co_living', 'hostel', 'shared_apartment');
CREATE TYPE gender_preference_enum AS ENUM ('boys_only', 'girls_only', 'co_living');
CREATE TYPE property_status_enum AS ENUM ('pending', 'approved', 'rejected', 'inactive');
CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    user_type user_type_enum NOT NULL DEFAULT 'student',
    is_verified BOOLEAN DEFAULT false,
    profile_image_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    college_name VARCHAR(255),
    occupation VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_name VARCHAR(255) NOT NULL,
    property_type property_type_enum NOT NULL,
    description TEXT,
    
    -- Location details
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    landmark VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Property details
    total_rooms INTEGER NOT NULL CHECK (total_rooms > 0),
    available_rooms INTEGER NOT NULL CHECK (available_rooms >= 0),
    bathrooms INTEGER NOT NULL CHECK (bathrooms > 0),
    floors INTEGER NOT NULL CHECK (floors > 0),
    carpet_area INTEGER, -- in sq ft
    
    -- Pricing
    rent_per_month DECIMAL(10, 2) NOT NULL CHECK (rent_per_month > 0),
    security_deposit DECIMAL(10, 2) NOT NULL CHECK (security_deposit >= 0),
    maintenance_charges DECIMAL(10, 2) DEFAULT 0,
    electricity_charges DECIMAL(10, 2) DEFAULT 0,
    
    -- Amenities (stored as JSON array)
    amenities JSONB DEFAULT '[]',
    
    -- Rules and policies
    gender_preference gender_preference_enum NOT NULL,
    food_policy TEXT,
    visitor_policy TEXT,
    smoking_allowed BOOLEAN DEFAULT false,
    drinking_allowed BOOLEAN DEFAULT false,
    
    -- Status and verification
    status property_status_enum DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- SEO and search
    search_keywords TEXT,
    featured BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property images table
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_title VARCHAR(255),
    image_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Booking details
    room_type VARCHAR(100),
    check_in_date DATE NOT NULL,
    check_out_date DATE,
    booking_duration_months INTEGER,
    
    -- Pricing details
    monthly_rent DECIMAL(10, 2) NOT NULL,
    security_deposit DECIMAL(10, 2) NOT NULL,
    maintenance_charges DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Booking status and notes
    status booking_status_enum DEFAULT 'pending',
    booking_notes TEXT,
    cancellation_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(255),
    review_text TEXT,
    
    -- Review categories (all rated 1-5)
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
    safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
    location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
    
    -- Verification and moderation
    is_verified BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    moderation_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    
    -- Helpful votes
    helpful_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Message content
    message_text TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, document
    attachment_url TEXT,
    
    -- Message status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment details
    payment_type VARCHAR(50) NOT NULL, -- rent, deposit, maintenance, booking_fee
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50), -- upi, card, netbanking, cash
    
    -- Payment gateway details
    transaction_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_order_id VARCHAR(255),
    
    -- Payment status
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    failure_reason TEXT,
    
    -- Due dates
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved properties table (wishlist)
CREATE TABLE saved_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination
    UNIQUE(student_id, property_id)
);

-- Property visits table
CREATE TABLE property_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Visit details
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    visit_status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
    
    -- Visit notes
    student_notes TEXT,
    owner_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- booking, payment, message, review, system
    
    -- Related entities
    related_id UUID, -- can refer to booking_id, property_id, etc.
    action_url TEXT,
    
    -- Notification status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table (for admin monitoring)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Activity details
    activity_type VARCHAR(100) NOT NULL, -- login, logout, property_created, booking_made, etc.
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Related entities
    related_table VARCHAR(50),
    related_id UUID,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_rent ON properties(rent_per_month);
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_student_id ON bookings(student_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_student_id ON reviews(student_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_property_id ON messages(property_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_saved_properties_student_id ON saved_properties(student_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);

-- Create full-text search indexes
CREATE INDEX idx_properties_search ON properties USING gin(to_tsvector('english', property_name || ' ' || description || ' ' || city || ' ' || landmark));

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_visits_updated_at BEFORE UPDATE ON property_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Anyone can view approved properties" ON properties
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Owners can manage their properties" ON properties
    FOR ALL USING (auth.uid() = owner_id);

-- Property images follow property access
CREATE POLICY "Property images follow property access" ON property_images
    FOR SELECT USING (
        property_id IN (
            SELECT id FROM properties WHERE status = 'approved'
        )
    );

-- Bookings policies
CREATE POLICY "Users can view their bookings" ON bookings
    FOR SELECT USING (
        auth.uid() = student_id OR 
        auth.uid() IN (SELECT owner_id FROM properties WHERE id = property_id)
    );

CREATE POLICY "Students can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Saved properties policies
CREATE POLICY "Students can manage saved properties" ON saved_properties
    FOR ALL USING (auth.uid() = student_id);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Create some helper functions
CREATE OR REPLACE FUNCTION get_property_average_rating(property_uuid UUID)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE property_id = property_uuid AND moderation_status = 'approved'
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_property_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- Update available rooms when booking is confirmed
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE properties 
        SET available_rooms = available_rooms - 1
        WHERE id = NEW.property_id AND available_rooms > 0;
    END IF;
    
    -- Restore room when booking is cancelled
    IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
        UPDATE properties 
        SET available_rooms = available_rooms + 1
        WHERE id = NEW.property_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_status_change
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_property_availability();

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for students, PG owners, and admins';
COMMENT ON TABLE properties IS 'PG property listings with details and amenities';
COMMENT ON TABLE bookings IS 'Student bookings for PG accommodations';
COMMENT ON TABLE reviews IS 'Student reviews and ratings for properties';
COMMENT ON TABLE messages IS 'Direct messaging between users';
COMMENT ON TABLE payments IS 'Payment transactions and history';
COMMENT ON TABLE saved_properties IS 'Student wishlist/saved properties';
COMMENT ON TABLE property_visits IS 'Scheduled property visits';
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE activity_logs IS 'System activity logs for monitoring';
