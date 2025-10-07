#!/usr/bin/env python3
"""
EasyPG Application Runner
A beginner-friendly PG accommodation platform
"""

import os
import sys
from dotenv import load_dotenv
from app import app
from app import db

# Load environment variables
load_dotenv()


def create_sample_data():
    """Create sample data for testing"""
    from app import User, Property, PropertyImage, bcrypt
    import json
    
    # Check if sample data already exists
    if Property.query.count() > 0:
        print("Sample data already exists!")
        return
    
    print("Creating sample data...")
    
    try:
        # Create sample users
        student_password = bcrypt.generate_password_hash('student123').decode('utf-8')
        owner_password = bcrypt.generate_password_hash('owner123').decode('utf-8')
        
        student = User(
            email='student@example.com',
            password_hash=student_password,
            full_name='John Student',
            phone='9876543210',
            user_type='student',
            is_verified=True
        )
        
        owner = User(
            email='owner@example.com',
            password_hash=owner_password,
            full_name='Jane Owner',
            phone='9876543211',
            user_type='owner',
            is_verified=True
        )
        
        db.session.add(student)
        db.session.add(owner)
        db.session.commit()
        
        # Create sample properties
        properties_data = [
            {
                'property_name': 'Green Valley PG',
                'property_type': 'boys_pg',
                'description': 'A comfortable and safe PG accommodation for boys with all modern amenities.',
                'address': '123 Green Valley Road, Koramangala',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'pincode': '560034',
                'landmark': 'Near Forum Mall',
                'total_rooms': 20,
                'available_rooms': 5,
                'bathrooms': 10,
                'floors': 3,
                'rent_per_month': 8500,
                'security_deposit': 15000,
                'maintenance_charges': 500,
                'amenities': 'wifi,parking,meals,security,power_backup',
                'gender_preference': 'boys_only',
                'food_policy': 'Vegetarian meals included',
                'visitor_policy': 'Visitors allowed till 9 PM',
                'status': 'approved',
                'owner_id': owner.id
            },
            {
                'property_name': 'Sunrise Residency',
                'property_type': 'girls_pg',
                'description': 'Premium PG accommodation for girls with excellent security and facilities.',
                'address': '456 HSR Layout, Sector 2',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'pincode': '560102',
                'landmark': 'Near Central Mall',
                'total_rooms': 15,
                'available_rooms': 3,
                'bathrooms': 8,
                'floors': 2,
                'rent_per_month': 9200,
                'security_deposit': 18000,
                'maintenance_charges': 600,
                'amenities': 'wifi,meals,security,power_backup,laundry',
                'gender_preference': 'girls_only',
                'food_policy': 'Both veg and non-veg available',
                'visitor_policy': 'Female visitors only',
                'status': 'approved',
                'owner_id': owner.id
            },
            {
                'property_name': 'Metro Heights PG',
                'property_type': 'co_living',
                'description': 'Modern co-living space with shared amenities and private rooms.',
                'address': '789 Whitefield Main Road',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'pincode': '560066',
                'landmark': 'Near ITPL',
                'total_rooms': 25,
                'available_rooms': 8,
                'bathrooms': 12,
                'floors': 4,
                'rent_per_month': 7800,
                'security_deposit': 12000,
                'maintenance_charges': 400,
                'amenities': 'wifi,parking,security,gym,power_backup',
                'gender_preference': 'co_living',
                'food_policy': 'Cafeteria available',
                'visitor_policy': 'Visitors allowed with prior notice',
                'status': 'approved',
                'owner_id': owner.id
            },
            {
                'property_name': 'City Center PG',
                'property_type': 'boys_pg',
                'description': 'Premium PG in the heart of the city with luxury amenities.',
                'address': '321 MG Road, Brigade Road',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'pincode': '560001',
                'landmark': 'Near UB City Mall',
                'total_rooms': 12,
                'available_rooms': 2,
                'bathrooms': 6,
                'floors': 2,
                'rent_per_month': 12000,
                'security_deposit': 25000,
                'maintenance_charges': 800,
                'amenities': 'wifi,parking,meals,gym,security,power_backup,ac',
                'gender_preference': 'boys_only',
                'food_policy': 'Premium meals included',
                'visitor_policy': 'Visitors allowed till 10 PM',
                'status': 'approved',
                'owner_id': owner.id
            }
        ]
        
        for prop_data in properties_data:
            property_obj = Property(**prop_data)
            db.session.add(property_obj)
            db.session.commit()
            
            # Add sample images
            sample_images = [
                f'/static/images/pg{properties_data.index(prop_data) + 1}_1.jpg',
                f'/static/images/pg{properties_data.index(prop_data) + 1}_2.jpg',
                f'/static/images/pg{properties_data.index(prop_data) + 1}_3.jpg'
            ]
            
            for i, image_url in enumerate(sample_images):
                image = PropertyImage(
                    property_id=property_obj.id,
                    image_url=image_url,
                    image_order=i
                )
                db.session.add(image)
        
        db.session.commit()
        print("Sample data created successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating sample data: {e}")
def main():
    """Main function to run the application"""
    
    # Create database tables
    with app.app_context():
        db.create_all()
        print("Database tables created!")
        
        # Create sample data
        create_sample_data()
    
    print("\n" + "="*50)
    print("🏠 EasyPG - PG Management System")
    print("="*50)
    print("🚀 Server starting...")
    print("📱 Frontend: http://localhost:5000")
    print("🔧 API Base: http://localhost:5000/api")
    print("="*50)
    
    # Run the Flask development server
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    # Get configuration from environment variables
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    
    print(f"Starting EasyPG Application...")
    print(f"Debug mode: {debug}")
    print(f"Running on http://{host}:{port}")
    
    # Run the Flask application
    app.run(
        debug=debug,
        host=host,
        port=port,
        threaded=True
    )
