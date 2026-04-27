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

# Fake search data for local route simulation
FAKE_PROPERTIES = [
    {
        'id': 'pg-101',
        'property_name': 'Cozy Stay PG',
        'property_type': 'boys_pg',
        'city': 'Mumbai',
        'state': 'Maharashtra',
        'address': 'Andheri West, Mumbai',
        'rent_per_month': 8500,
        'security_deposit': 15000,
        'available_rooms': 4,
        'total_rooms': 8,
        'gender_preference': 'boys_only',
        'amenities': ['wifi', 'meals', 'security', 'ac'],
        'images': [
            {'image_url': 'https://images.unsplash.com/photo-1560185127-6d0fcf0e6a16?auto=format&fit=crop&w=900&q=80'},
        ],
        'owner': {'name': 'Rohan Sharma', 'phone': '9876543210', 'email': 'rohan@example.com'},
        'created_at': '2024-01-15T10:00:00Z'
    },
    {
        'id': 'pg-102',
        'property_name': 'Sunrise Girls Hostel',
        'property_type': 'girls_pg',
        'city': 'Bangalore',
        'state': 'Karnataka',
        'address': 'Koramangala, Bangalore',
        'rent_per_month': 9500,
        'security_deposit': 18000,
        'available_rooms': 5,
        'total_rooms': 10,
        'gender_preference': 'girls_only',
        'amenities': ['wifi', 'laundry', 'security', 'meals'],
        'images': [
            {'image_url': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'},
        ],
        'owner': {'name': 'Priya Patel', 'phone': '9123456780', 'email': 'priya@example.com'},
        'created_at': '2024-02-20T12:30:00Z'
    },
    {
        'id': 'pg-103',
        'property_name': 'City Central Co-Living',
        'property_type': 'co_living',
        'city': 'Pune',
        'state': 'Maharashtra',
        'address': 'Koregaon Park, Pune',
        'rent_per_month': 12000,
        'security_deposit': 20000,
        'available_rooms': 3,
        'total_rooms': 6,
        'gender_preference': 'co_living',
        'amenities': ['wifi', 'gym', 'parking', 'power_backup'],
        'images': [
            {'image_url': 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80'},
        ],
        'owner': {'name': 'Amit Verma', 'phone': '9012345678', 'email': 'amit@example.com'},
        'created_at': '2024-03-05T09:10:00Z'
    },
    {
        'id': 'pg-104',
        'property_name': 'Green Valley Hostel',
        'property_type': 'hostel',
        'city': 'Chennai',
        'state': 'Tamil Nadu',
        'address': 'Adyar, Chennai',
        'rent_per_month': 7800,
        'security_deposit': 14000,
        'available_rooms': 6,
        'total_rooms': 12,
        'gender_preference': 'co_living',
        'amenities': ['wifi', 'meals', 'security', 'laundry'],
        'images': [
            {'image_url': 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80'},
        ],
        'owner': {'name': 'Swathi Rao', 'phone': '9988776655', 'email': 'swathi@example.com'},
        'created_at': '2024-04-12T14:45:00Z'
    },
]


def filter_fake_properties(properties, city=None, property_type=None, gender_preference=None, min_rent=None, max_rent=None, amenities=None):
    filtered = []
    amenities = amenities or []

    for prop in properties:
        if city:
            query = city.strip().lower()
            if query not in prop['city'].lower() and query not in prop['property_name'].lower() and query not in prop['address'].lower():
                continue

        if property_type and prop['property_type'] != property_type:
            continue

        if gender_preference and prop['gender_preference'] != gender_preference:
            continue

        if min_rent is not None and prop['rent_per_month'] < min_rent:
            continue

        if max_rent is not None and prop['rent_per_month'] > max_rent:
            continue

        if amenities:
            if not all(item in prop['amenities'] for item in amenities):
                continue

        filtered.append(prop)

    return filtered


@app.route('/api/search', methods=['GET'])
def api_search_properties():
    try:
        city = request.args.get('city')
        property_type = request.args.get('property_type')
        gender_preference = request.args.get('gender_preference')
        min_rent = request.args.get('min_rent', type=int)
        max_rent = request.args.get('max_rent', type=int)
        amenities = request.args.getlist('amenities')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)

        results = filter_fake_properties(
            FAKE_PROPERTIES,
            city=city,
            property_type=property_type,
            gender_preference=gender_preference,
            min_rent=min_rent,
            max_rent=max_rent,
            amenities=amenities,
        )

        total = len(results)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_results = results[start:end]

        return jsonify({
            'properties': paginated_results,
            'pagination': {
                'page': page,
                'pages': (total + per_page - 1) // per_page,
                'per_page': per_page,
                'total': total,
                'has_next': end < total,
                'has_prev': page > 1,
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


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

@app.route('/list-property')
def list_property_page():
    return render_template('list-property.html')

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

# API Routes - Saved Properties
@app.route('/api/saved-properties', methods=['GET'])
@jwt_required
def get_saved_properties():
    try:
        user_id = request.current_user_id

        # Get saved properties for the user
        result = supabase.table('saved_properties').select('*, properties(*, users!properties_owner_id_fkey(full_name, phone, email), property_images(*))').eq('student_id', user_id).execute()

        property_list = []
        if result.data:
            for saved in result.data:
                prop = saved['properties']

                # Process images
                images = []
                if prop.get('property_images'):
                    images = [{'image_url': img['image_url'], 'image_order': img['image_order']} for img in prop['property_images']]

                # Process amenities
                amenities = []
                if prop.get('amenities'):
                    amenities = prop['amenities'].split(',') if isinstance(prop['amenities'], str) else prop['amenities']

                # Get owner info
                owner_info = {'name': 'Unknown', 'phone': '', 'email': ''}
                if prop.get('users'):
                    owner_info = {
                        'name': prop['users']['full_name'],
                        'phone': prop['users']['phone'],
                        'email': prop['users']['email']
                    }

                property_list.append({
                    'id': prop['id'],
                    'property_name': prop['property_name'],
                    'city': prop['city'],
                    'rent_per_month': prop['rent_per_month'],
                    'rating': 4.5,
                    'images': images,
                    'owner': owner_info,
                    'saved_at': saved['created_at']
                })

        return jsonify({'properties': property_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/saved-properties', methods=['POST'])
@jwt_required
def save_property():
    try:
        user_id = request.current_user_id
        data = request.get_json()

        if not data.get('property_id'):
            return jsonify({'error': 'property_id is required'}), 400

        # Check if already saved
        existing = supabase.table('saved_properties').select('*').eq('student_id', user_id).eq('property_id', data['property_id']).execute()

        if existing.data:
            return jsonify({'error': 'Property already saved'}), 400

        saved_data = {
            'id': str(uuid.uuid4()),
            'student_id': user_id,
            'property_id': data['property_id'],
            'created_at': datetime.utcnow().isoformat()
        }

        result = supabase.table('saved_properties').insert(saved_data).execute()

        if result.data:
            return jsonify({'message': 'Property saved successfully'}), 201
        else:
            return jsonify({'error': 'Failed to save property'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/saved-properties/<property_id>', methods=['DELETE'])
@jwt_required
def remove_saved_property(property_id):
    try:
        user_id = request.current_user_id

        # Delete saved property
        result = supabase.table('saved_properties').delete().eq('student_id', user_id).eq('property_id', property_id).execute()

        return jsonify({'message': 'Property removed from saved'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Routes - Messages
@app.route('/api/messages', methods=['GET'])
@jwt_required
def get_messages():
    try:
        user_id = request.current_user_id

        # Get conversations for the user
        result = supabase.table('messages').select('*, sender:sender_id(id, full_name, email), receiver:receiver_id(id, full_name, email)').or_(f'sender_id.eq.{user_id},receiver_id.eq.{user_id}').order('created_at', desc=True).execute()

        conversations = []
        seen_conversations = set()

        if result.data:
            for msg in result.data:
                other_user = msg['receiver'] if msg['sender_id'] == user_id else msg['sender']
                conv_key = tuple(sorted([user_id, other_user['id']]))

                if conv_key not in seen_conversations:
                    seen_conversations.add(conv_key)
                    conversations.append({
                        'user_id': other_user['id'],
                        'user_name': other_user['full_name'],
                        'user_email': other_user['email'],
                        'last_message': msg['message'],
                        'last_message_at': msg['created_at'],
                        'unread': not msg['is_read'] and msg['receiver_id'] == user_id
                    })

        return jsonify({'conversations': conversations}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/messages', methods=['POST'])
@jwt_required
def send_message():
    try:
        user_id = request.current_user_id
        data = request.get_json()

        required_fields = ['receiver_id', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        message_data = {
            'id': str(uuid.uuid4()),
            'sender_id': user_id,
            'receiver_id': data['receiver_id'],
            'message': data['message'],
            'is_read': False,
            'created_at': datetime.utcnow().isoformat()
        }

        result = supabase.table('messages').insert(message_data).execute()

        if result.data:
            return jsonify({'message': 'Message sent successfully'}), 201
        else:
            return jsonify({'error': 'Failed to send message'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/messages/<user_id>', methods=['GET'])
@jwt_required
def get_conversation(user_id):
    try:
        current_user_id = request.current_user_id

        # Get all messages between two users
        result = supabase.table('messages').select('*').or_(f'sender_id.eq.{current_user_id},receiver_id.eq.{current_user_id}').or_(f'sender_id.eq.{user_id},receiver_id.eq.{user_id}').order('created_at', asc=True).execute()

        messages = []
        if result.data:
            for msg in result.data:
                if (msg['sender_id'] == current_user_id and msg['receiver_id'] == user_id) or (msg['sender_id'] == user_id and msg['receiver_id'] == current_user_id):
                    messages.append({
                        'id': msg['id'],
                        'sender_id': msg['sender_id'],
                        'receiver_id': msg['receiver_id'],
                        'message': msg['message'],
                        'is_read': msg['is_read'],
                        'created_at': msg['created_at']
                    })

        return jsonify({'messages': messages}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Routes - Bookings
@app.route('/api/bookings', methods=['GET'])
@jwt_required
def get_bookings():
    try:
        user_id = request.current_user_id

        # Get user type
        user_result = supabase.table('users').select('*').eq('id', user_id).execute()
        if not user_result.data:
            return jsonify({'error': 'User not found'}), 404

        user = user_result.data[0]

        if user['user_type'] == 'student':
            result = supabase.table('bookings').select('*, properties(property_name, city, rent_per_month)').eq('student_id', user_id).execute()
        else:
            result = supabase.table('bookings').select('*, properties(property_name, city, rent_per_month), users!bookings_student_id_fkey(full_name, phone)').eq('properties.owner_id', user_id).execute()

        bookings_list = []
        if result.data:
            for booking in result.data:
                bookings_list.append({
                    'id': booking['id'],
                    'property_name': booking['properties']['property_name'],
                    'city': booking['properties']['city'],
                    'monthly_rent': booking['monthly_rent'],
                    'total_amount': booking['total_amount'],
                    'check_in_date': booking['check_in_date'],
                    'check_out_date': booking['check_out_date'],
                    'status': booking['status'],
                    'created_at': booking['created_at']
                })

        return jsonify({'bookings': bookings_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bookings', methods=['POST'])
@jwt_required
def create_booking():
    try:
        user_id = request.current_user_id
        data = request.get_json()

        required_fields = ['property_id', 'check_in_date', 'check_out_date', 'monthly_rent']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        booking_data = {
            'id': str(uuid.uuid4()),
            'property_id': data['property_id'],
            'student_id': user_id,
            'check_in_date': data['check_in_date'],
            'check_out_date': data['check_out_date'],
            'monthly_rent': data['monthly_rent'],
            'total_amount': data.get('total_amount', 0),
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        result = supabase.table('bookings').insert(booking_data).execute()

        if result.data:
            return jsonify({'message': 'Booking created successfully', 'booking': {'id': result.data[0]['id']}}), 201
        else:
            return jsonify({'error': 'Failed to create booking'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bookings/<booking_id>', methods=['PUT'])
@jwt_required
def update_booking(booking_id):
    try:
        user_id = request.current_user_id
        data = request.get_json()

        if not data.get('status'):
            return jsonify({'error': 'status is required'}), 400

        # Get booking
        booking_result = supabase.table('bookings').select('*').eq('id', booking_id).execute()
        if not booking_result.data:
            return jsonify({'error': 'Booking not found'}), 404

        booking = booking_result.data[0]

        # Check authorization
        property_result = supabase.table('properties').select('*').eq('id', booking['property_id']).execute()
        if property_result.data and property_result.data[0]['owner_id'] != user_id and booking['student_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        update_data = {
            'status': data['status'],
            'updated_at': datetime.utcnow().isoformat()
        }

        result = supabase.table('bookings').update(update_data).eq('id', booking_id).execute()

        if result.data:
            return jsonify({'message': 'Booking updated successfully'}), 200
        else:
            return jsonify({'error': 'Failed to update booking'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Routes - Reviews
@app.route('/api/reviews', methods=['POST'])
@jwt_required
def create_review():
    try:
        user_id = request.current_user_id
        data = request.get_json()

        required_fields = ['property_id', 'rating', 'review_title', 'review_text']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        if not 1 <= data['rating'] <= 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400

        review_data = {
            'id': str(uuid.uuid4()),
            'property_id': data['property_id'],
            'student_id': user_id,
            'rating': data['rating'],
            'review_title': data['review_title'],
            'review_text': data['review_text'],
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        result = supabase.table('reviews').insert(review_data).execute()

        if result.data:
            return jsonify({'message': 'Review posted successfully'}), 201
        else:
            return jsonify({'error': 'Failed to post review'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/properties/<property_id>/reviews', methods=['GET'])
def get_property_reviews(property_id):
    try:
        result = supabase.table('reviews').select('*, users!reviews_student_id_fkey(full_name)').eq('property_id', property_id).order('created_at', desc=True).execute()

        reviews_list = []
        if result.data:
            for review in result.data:
                reviews_list.append({
                    'id': review['id'],
                    'rating': review['rating'],
                    'review_title': review['review_title'],
                    'review_text': review['review_text'],
                    'student_name': review['users']['full_name'] if review.get('users') else 'Anonymous',
                    'created_at': review['created_at']
                })

        return jsonify({'reviews': reviews_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Routes - User Profile
@app.route('/api/profile', methods=['GET'])
@jwt_required
def get_profile():
    try:
        user_id = request.current_user_id

        result = supabase.table('users').select('*').eq('id', user_id).execute()

        if not result.data:
            return jsonify({'error': 'User not found'}), 404

        user = result.data[0]

        return jsonify({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'phone': user['phone'],
                'user_type': user['user_type'],
                'is_verified': user['is_verified'],
                'created_at': user['created_at']
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile', methods=['PUT'])
@jwt_required
def update_profile():
    try:
        user_id = request.current_user_id
        data = request.get_json()

        update_data = {
            'updated_at': datetime.utcnow().isoformat()
        }

        if data.get('full_name'):
            update_data['full_name'] = data['full_name']

        if data.get('phone'):
            if not validate_phone(data['phone']):
                return jsonify({'error': 'Invalid phone number format'}), 400
            update_data['phone'] = data['phone']

        result = supabase.table('users').update(update_data).eq('id', user_id).execute()

        if result.data:
            user = result.data[0]
            return jsonify({'message': 'Profile updated successfully', 'user': {'id': user['id'], 'full_name': user['full_name'], 'phone': user['phone']}}), 200
        else:
            return jsonify({'error': 'Failed to update profile'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile/password', methods=['PUT'])
@jwt_required
def change_password():
    try:
        user_id = request.current_user_id
        data = request.get_json()

        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'current_password and new_password are required'}), 400

        if len(data['new_password']) < 6:
            return jsonify({'error': 'New password must be at least 6 characters long'}), 400

        # Get user
        user_result = supabase.table('users').select('*').eq('id', user_id).execute()
        if not user_result.data:
            return jsonify({'error': 'User not found'}), 404

        user = user_result.data[0]

        # Verify current password
        if not verify_password(data['current_password'], user['password_hash']):
            return jsonify({'error': 'Current password is incorrect'}), 401

        # Hash new password
        new_password_hash = hash_password(data['new_password'])

        # Update password
        result = supabase.table('users').update({
            'password_hash': new_password_hash,
            'updated_at': datetime.utcnow().isoformat()
        }).eq('id', user_id).execute()

        if result.data:
            return jsonify({'message': 'Password changed successfully'}), 200
        else:
            return jsonify({'error': 'Failed to change password'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Routes - Property Management (Update & Delete)
@app.route('/api/properties/<property_id>', methods=['PUT'])
@jwt_required
def update_property(property_id):
    try:
        user_id = request.current_user_id

        # Get property
        prop_result = supabase.table('properties').select('*').eq('id', property_id).execute()
        if not prop_result.data:
            return jsonify({'error': 'Property not found'}), 404

        prop = prop_result.data[0]

        # Check authorization
        if prop['owner_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()

        update_data = {
            'updated_at': datetime.utcnow().isoformat()
        }

        # Update allowed fields
        allowed_fields = ['property_name', 'description', 'address', 'city', 'state', 'pincode',
                         'total_rooms', 'available_rooms', 'rent_per_month', 'security_deposit',
                         'gender_preference', 'amenities', 'food_policy', 'visitor_policy']

        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        result = supabase.table('properties').update(update_data).eq('id', property_id).execute()

        if result.data:
            return jsonify({'message': 'Property updated successfully'}), 200
        else:
            return jsonify({'error': 'Failed to update property'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/properties/<property_id>', methods=['DELETE'])
@jwt_required
def delete_property(property_id):
    try:
        user_id = request.current_user_id

        # Get property
        prop_result = supabase.table('properties').select('*').eq('id', property_id).execute()
        if not prop_result.data:
            return jsonify({'error': 'Property not found'}), 404

        prop = prop_result.data[0]

        # Check authorization
        if prop['owner_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        # Delete property (soft delete by marking as rejected)
        result = supabase.table('properties').update({'status': 'deleted'}).eq('id', property_id).execute()

        if result.data:
            return jsonify({'message': 'Property deleted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to delete property'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Routes - Payments
@app.route('/api/payments', methods=['POST'])
@jwt_required
def create_payment():
    try:
        user_id = request.current_user_id
        data = request.get_json()

        required_fields = ['booking_id', 'amount', 'payment_method']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        payment_data = {
            'id': str(uuid.uuid4()),
            'booking_id': data['booking_id'],
            'user_id': user_id,
            'amount': data['amount'],
            'payment_method': data['payment_method'],
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        result = supabase.table('payments').insert(payment_data).execute()

        if result.data:
            return jsonify({'message': 'Payment created successfully', 'payment': {'id': result.data[0]['id'], 'status': 'pending'}}), 201
        else:
            return jsonify({'error': 'Failed to create payment'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/payments/<payment_id>', methods=['GET'])
@jwt_required
def get_payment(payment_id):
    try:
        result = supabase.table('payments').select('*').eq('id', payment_id).execute()

        if not result.data:
            return jsonify({'error': 'Payment not found'}), 404

        payment = result.data[0]

        return jsonify({
            'payment': {
                'id': payment['id'],
                'booking_id': payment['booking_id'],
                'amount': payment['amount'],
                'payment_method': payment['payment_method'],
                'status': payment['status'],
                'created_at': payment['created_at']
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
    port = int(os.environ.get('PORT'))
    app.run(debug=True, host='0.0.0.0', port=port)

