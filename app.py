from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_cors import CORS
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import jwt
import bcrypt
import re
import uuid
from functools import wraps
import json

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')

# Initialize CORS
CORS(app)

# Supabase Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be provided")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Utility Functions
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    pattern = r'^[6-9]\d{9}$'
    return re.match(pattern, phone) is not None

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_jwt_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')

def verify_jwt_token(token):
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def jwt_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        user_id = verify_jwt_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        request.current_user_id = user_id
        return f(*args, **kwargs)
    
    return decorated_function

# Routes - Static Pages
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard_page():
    return render_template('dashboard.html')

@app.route('/search')
def search_page():
    return render_template('search.html')

@app.route('/profile')
def profile_page():
    return render_template('profile.html')

@app.route('/messages')
def messages_page():
    return render_template('messages.html')

@app.route('/payments')
def payments_page():
    return render_template('payments.html')

@app.route('/settings')
def settings_page():
    return render_template('settings.html')

@app.route('/saved')
def saved_page():
    return render_template('saved.html')

# API Routes - Authentication
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()   
        
        # Validate required fields
        required_fields = ['email', 'password', 'full_name', 'phone', 'user_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate phone format
        if not validate_phone(data['phone']):
            return jsonify({'error': 'Invalid phone number format'}), 400
        
        # Validate password length
        if len(data['password']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Validate user type
        if data['user_type'] not in ['student', 'owner']:
            return jsonify({'error': 'Invalid user type'}), 400
        
        # Check if user already exists
        existing_user = supabase.table('users').select('*').eq('email', data['email']).execute()
        if existing_user.data:
            return jsonify({'error': 'Email already registered'}), 400
        
        # Hash password
        password_hash = hash_password(data['password'])
        
        # Create user data
        user_data = {
            'id': str(uuid.uuid4()),
            'email': data['email'],
            'password_hash': password_hash,
            'full_name': data['full_name'],
            'phone': data['phone'],
            'user_type': data['user_type'],
            'is_verified': True,  # Auto-verify for demo
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Insert user into Supabase
        result = supabase.table('users').insert(user_data).execute()
        
        if result.data:
            user = result.data[0]
            return jsonify({
                'message': 'User registered successfully',
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'user_type': user['user_type']
                }
            }), 201
        else:
            return jsonify({'error': 'Failed to create user'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user in Supabase
        result = supabase.table('users').select('*').eq('email', data['email']).execute()
        
        if not result.data:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        user = result.data[0]
        
        # Verify password
        if not verify_password(data['password'], user['password_hash']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check user type if specified
        if data.get('user_type') and user['user_type'] != data['user_type']:
            return jsonify({'error': 'Invalid user type for this account'}), 401
        
        # Generate JWT token
        access_token = generate_jwt_token(user['id'])
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'phone': user['phone'],
                'user_type': user['user_type'],
                'is_verified': user['is_verified']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/verify', methods=['GET'])
@jwt_required
def verify_token():
    try:
        user_id = request.current_user_id
        
        # Get user from Supabase
        result = supabase.table('users').select('*').eq('id', user_id).execute()
        
        if not result.data:
            return jsonify({'error': 'User not found'}), 404
        
        user = result.data[0]
        
        return jsonify({
            'message': 'Token is valid',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'phone': user['phone'],
                'user_type': user['user_type'],
                'is_verified': user['is_verified']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required
def logout():
    # In a real application, you might want to blacklist the token
    return jsonify({'message': 'Logged out successfully'}), 200

# API Routes - Search 
# @app.route('api/search', methods=['GET'])
# def search():
#     try:
#         pass
#     except Exception as e:
#         pass

# API Routes - Dashboard
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required
def get_dashboard_stats():
    try:
        user_id = request.current_user_id
        
        # Get user info
        user_result = supabase.table('users').select('*').eq('id', user_id).execute()
        if not user_result.data:
            return jsonify({'error': 'User not found'}), 404
        
        user = user_result.data[0]
        user_type = request.args.get('type', user['user_type'])
        
        if user_type == 'student':
            # Student stats
            saved_pgs = 12  # Placeholder - implement saved PGs functionality
            
            # Get applications count
            applications_result = supabase.table('bookings').select('*').eq('student_id', user_id).execute()
            applications = len(applications_result.data) if applications_result.data else 0
            
            visits = 3  # Placeholder - implement visits functionality
            
            # Get messages count
            messages_result = supabase.table('messages').select('*').eq('receiver_id', user_id).execute()
            messages = len(messages_result.data) if messages_result.data else 0
            
            stats = {
                'saved_pgs': saved_pgs,
                'applications': applications,
                'visits': visits,
                'messages': messages
            }
        else:
            # Owner stats
            properties_result = supabase.table('properties').select('*').eq('owner_id', user_id).execute()
            total_properties = len(properties_result.data) if properties_result.data else 0
            
            # Calculate occupied rooms
            occupied_rooms = 0
            monthly_revenue = 0
            if properties_result.data:
                for prop in properties_result.data:
                    occupied_rooms += (prop['total_rooms'] - prop['available_rooms'])
                    
                    # Get bookings for this property
                    bookings_result = supabase.table('bookings').select('*').eq('property_id', prop['id']).eq('status', 'confirmed').execute()
                    if bookings_result.data:
                        for booking in bookings_result.data:
                            monthly_revenue += booking['monthly_rent']
            
            # Get inquiries count
            inquiries_result = supabase.table('messages').select('*').eq('receiver_id', user_id).execute()
            inquiries = len(inquiries_result.data) if inquiries_result.data else 0
            
            stats = {
                'total_properties': total_properties,
                'occupied_rooms': occupied_rooms,
                'monthly_revenue': monthly_revenue,
                'inquiries': inquiries
            }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/recent-pgs', methods=['GET'])
@jwt_required
def get_recent_pgs():
    try:
        # For demo purposes, return sample data
        # In a real app, you'd track user's recently viewed PGs
        recent_pgs = [
            {
                'id': '1',
                'name': 'Vedaditya Boys Hostel',
                'location': 'Kankot Rd, Near Government Engineering Collage, Rajkot',
                'price': 6500,
                'rating': 4.5,
                'reviews': 124,
                'status': 'Available',
                'image': '/static/images/pg1.jpg'
            },
            {
                'id': '2',
                'name': 'Param Boys Hostel',
                'location': 'Kankot Rd, Near Labhubhai Trivedi Engineering Collage, Rajkot',
                'price': 8200,
                'rating': 4.3,
                'reviews': 89,
                'status': 'Applied',
                'image': '/static/images/pg2.jpg'
            },
            {
                'id': '3',
                'name': 'J. K. Boys Hostel',
                'location': 'Kankot Rd, Near Government Engineering Collage, Rajkot',
                'price': 7800,
                'rating': 4.1,
                'reviews': 156,
                'status': 'Saved',
                'image': '/static/images/pg3.jpg'
            }
        ]
        
        return jsonify({'items': recent_pgs}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/recent-properties', methods=['GET'])
@jwt_required
def get_recent_properties():
    try:
        user_id = request.current_user_id
        
        # Get user's recent properties from Supabase
        result = supabase.table('properties').select('*, property_images(*)').eq('owner_id', user_id).order('updated_at', desc=True).limit(6).execute()
        
        property_list = []
        if result.data:
            for prop in result.data:
                # Get first image
                image_url = '/static/images/placeholder.jpg'
                if prop.get('property_images') and len(prop['property_images']) > 0:
                    image_url = prop['property_images'][0]['image_url']
                
                # Get reviews count (placeholder)
                reviews_count = 0  # You can implement this by querying reviews table
                
                property_list.append({
                    'id': prop['id'],
                    'name': prop['property_name'],
                    'location': f"{prop['city']}, {prop['state']}",
                    'price': prop['rent_per_month'],
                    'rating': 4.5,  # Placeholder - calculate from reviews
                    'reviews': reviews_count,
                    'status': prop['status'].title(),
                    'image': image_url
                })
        
        return jsonify({'items': property_list}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Routes - Properties
@app.route('/api/properties', methods=['GET'])
def get_properties():
    try:
        # Get query parameters
        city = request.args.get('city')
        min_rent = request.args.get('min_rent', type=int)
        max_rent = request.args.get('max_rent', type=int)
        property_type = request.args.get('property_type')
        gender_preference = request.args.get('gender_preference')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Build query
        query = supabase.table('properties').select('*, users!properties_owner_id_fkey(full_name, phone, email), property_images(*)')
        
        # Apply filters
        query = query.eq('status', 'approved')
        
        if city:
            query = query.ilike('city', f'%{city}%')
        
        if min_rent:
            query = query.gte('rent_per_month', min_rent)
        
        if max_rent:
            query = query.lte('rent_per_month', max_rent)
        
        if property_type:
            query = query.eq('property_type', property_type)
        
        if gender_preference:
            query = query.eq('gender_preference', gender_preference)
        
        # Execute query
        result = query.execute()
        
        property_list = []
        if result.data:
            for prop in result.data:
                # Process images
                images = []
                if prop.get('property_images'):
                    images = [{'image_url': img['image_url'], 'image_order': img['image_order']} for img in prop['property_images']]
                
                # Process amenities
                amenities = []
                if prop.get('amenities'):
                    amenities = prop['amenities'].split(',') if isinstance(prop['amenities'], str) else prop['amenities']
                
                # Get owner info
                owner_info = {
                    'name': 'Unknown',
                    'phone': '',
                    'email': ''
                }
                if prop.get('users'):
                    owner_info = {
                        'name': prop['users']['full_name'],
                        'phone': prop['users']['phone'],
                        'email': prop['users']['email']
                    }
                
                property_list.append({
                    'id': prop['id'],
                    'property_name': prop['property_name'],
                    'property_type': prop['property_type'],
                    'city': prop['city'],
                    'state': prop['state'],
                    'address': prop['address'],
                    'rent_per_month': prop['rent_per_month'],
                    'security_deposit': prop['security_deposit'],
                    'available_rooms': prop['available_rooms'],
                    'total_rooms': prop['total_rooms'],
                    'gender_preference': prop['gender_preference'],
                    'amenities': amenities,
                    'images': images,
                    'owner': owner_info,
                    'created_at': prop['created_at']
                })
        
        # Simple pagination (Supabase handles this differently)
        total = len(property_list)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_properties = property_list[start:end]
        
        return jsonify({
            'properties': paginated_properties,
            'pagination': {
                'page': page,
                'pages': (total + per_page - 1) // per_page,
                'per_page': per_page,
                'total': total,
                'has_next': end < total,
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/properties', methods=['POST'])
@jwt_required
def create_property():
    try:
        user_id = request.current_user_id
        
        # Get user info
        user_result = supabase.table('users').select('*').eq('id', user_id).execute()
        if not user_result.data:
            return jsonify({'error': 'User not found'}), 404
        
        user = user_result.data[0]
        
        # Check if user is owner
        if user['user_type'] != 'owner':
            return jsonify({'error': 'Only PG owners can create properties'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = [
            'property_name', 'property_type', 'address', 'city', 'state', 'pincode',
            'total_rooms', 'available_rooms', 'bathrooms', 'floors',
            'rent_per_month', 'security_deposit', 'gender_preference'
        ]
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create property data
        property_data = {
            'id': str(uuid.uuid4()),
            'property_name': data['property_name'],
            'property_type': data['property_type'],
            'description': data.get('description', ''),
            'address': data['address'],
            'city': data['city'],
            'state': data['state'],
            'pincode': data['pincode'],
            'landmark': data.get('landmark', ''),
            'total_rooms': data['total_rooms'],
            'available_rooms': data['available_rooms'],
            'bathrooms': data['bathrooms'],
            'floors': data['floors'],
            'rent_per_month': data['rent_per_month'],
            'security_deposit': data['security_deposit'],
            'maintenance_charges': data.get('maintenance_charges', 0),
            'amenities': ','.join(data.get('amenities', [])),
            'gender_preference': data['gender_preference'],
            'food_policy': data.get('food_policy', ''),
            'visitor_policy': data.get('visitor_policy', ''),
            'owner_id': user_id,
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Insert property into Supabase
        result = supabase.table('properties').insert(property_data).execute()
        
        if result.data:
            property_obj = result.data[0]
            return jsonify({
                'message': 'Property created successfully',
                'property': {
                    'id': property_obj['id'],
                    'property_name': property_obj['property_name'],
                    'status': property_obj['status']
                }
            }), 201
        else:
            return jsonify({'error': 'Failed to create property'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/properties/<property_id>', methods=['GET'])
def get_property(property_id):
    try:
        # Get property with related data
        result = supabase.table('properties').select('*, users!properties_owner_id_fkey(full_name, phone, email), property_images(*), reviews(*, users!reviews_student_id_fkey(full_name))').eq('id', property_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Property not found'}), 404
        
        prop = result.data[0]
        
        # Calculate average rating
        avg_rating = 0
        if prop.get('reviews'):
            total_rating = sum(review['rating'] for review in prop['reviews'])
            avg_rating = round(total_rating / len(prop['reviews']), 1)
        
        # Process images
        images = []
        if prop.get('property_images'):
            images = [{'image_url': img['image_url'], 'image_order': img['image_order']} for img in prop['property_images']]
        
        # Process amenities
        amenities = []
        if prop.get('amenities'):
            amenities = prop['amenities'].split(',') if isinstance(prop['amenities'], str) else prop['amenities']
        
        # Process reviews
        reviews = []
        if prop.get('reviews'):
            reviews = [{
                'id': review['id'],
                'rating': review['rating'],
                'review_title': review.get('review_title', ''),
                'review_text': review.get('review_text', ''),
                'student_name': review['users']['full_name'] if review.get('users') else 'Anonymous',
                'created_at': review['created_at']
            } for review in prop['reviews']]
        
        # Get owner info
        owner_info = {
            'name': 'Unknown',
            'phone': '',
            'email': ''
        }
        if prop.get('users'):
            owner_info = {
                'name': prop['users']['full_name'],
                'phone': prop['users']['phone'],
                'email': prop['users']['email']
            }
        
        property_data = {
            'id': prop['id'],
            'property_name': prop['property_name'],
            'property_type': prop['property_type'],
            'description': prop['description'],
            'address': prop['address'],
            'city': prop['city'],
            'state': prop['state'],
            'pincode': prop['pincode'],
            'landmark': prop['landmark'],
            'total_rooms': prop['total_rooms'],
            'available_rooms': prop['available_rooms'],
            'bathrooms': prop['bathrooms'],
            'floors': prop['floors'],
            'rent_per_month': prop['rent_per_month'],
            'security_deposit': prop['security_deposit'],
            'maintenance_charges': prop['maintenance_charges'],
            'amenities': amenities,
            'gender_preference': prop['gender_preference'],
            'food_policy': prop['food_policy'],
            'visitor_policy': prop['visitor_policy'],
            'status': prop['status'],
            'images': images,
            'owner': owner_info,
            'rating': avg_rating,
            'review_count': len(reviews),
            'reviews': reviews,
            'created_at': prop['created_at']
        }
        
        return jsonify({'property': property_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize database tables (run once)
@app.route('/api/init-db', methods=['POST'])
def init_database():
    try:
        # This endpoint can be used to create sample data
        # In a real application, you would set up your Supabase tables through the dashboard
        
        # Create admin user if not exists
        admin_result = supabase.table('users').select('*').eq('email', 'admin@easypg.com').execute()
        
        if not admin_result.data:
            admin_data = {
                'id': str(uuid.uuid4()),
                'email': 'admin@easypg.com',
                'password_hash': hash_password('admin123'),
                'full_name': 'Admin User',
                'phone': '9999999999',
                'user_type': 'admin',
                'is_verified': True,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            supabase.table('users').insert(admin_data).execute()
            
        return jsonify({'message': 'Database initialized successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
