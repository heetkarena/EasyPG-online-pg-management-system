# EasyPG - Complete API Routes Documentation

This document outlines all API routes implemented in the EasyPG application as per the README specifications.

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "9876543210",
  "user_type": "student"
}
```

**Response:** 201 Created
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "user_type": "student"
  }
}
```

---

### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "user_type": "student"
}
```

**Response:** 200 OK
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "9876543210",
    "user_type": "student",
    "is_verified": true
  }
}
```

---

### GET /api/auth/verify
Verify JWT token validity.

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "message": "Token is valid",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "9876543210",
    "user_type": "student",
    "is_verified": true
  }
}
```

---

### POST /api/auth/logout
Logout user (invalidates token).

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "message": "Logged out successfully"
}
```

---

## Property Endpoints

### GET /api/properties
Retrieve properties with optional filters.

**Query Parameters:**
- `city` (string): Filter by city
- `min_rent`, `max_rent` (integer): Price range
- `property_type` (string): Type of property
- `gender_preference` (string): Gender preference
- `page`, `per_page` (integer): Pagination

**Response:** 200 OK
```json
{
  "properties": [
    {
      "id": "uuid",
      "property_name": "Vedaditya Boys Hostel",
      "property_type": "boys_pg",
      "city": "Rajkot",
      "state": "Gujarat",
      "address": "Kankot Rd, Near Government Engineering College",
      "rent_per_month": 5500,
      "security_deposit": 15000,
      "available_rooms": 5,
      "total_rooms": 10,
      "gender_preference": "male",
      "amenities": ["wifi", "parking", "meals"],
      "images": [{"image_url": "url", "image_order": 1}],
      "owner": {
        "name": "Owner Name",
        "phone": "9876543210",
        "email": "owner@example.com"
      },
      "created_at": "2025-01-01T00:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 10,
    "per_page": 10,
    "total": 100,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### POST /api/properties
Create a new property (Owner only).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "property_name": "Vedaditya Boys Hostel",
  "property_type": "boys_pg",
  "address": "Kankot Rd, Near Government Engineering College",
  "city": "Rajkot",
  "state": "Gujarat",
  "pincode": "360001",
  "landmark": "Near Government Engineering College",
  "total_rooms": 10,
  "available_rooms": 5,
  "bathrooms": 4,
  "floors": 2,
  "rent_per_month": 5500,
  "security_deposit": 15000,
  "maintenance_charges": 500,
  "amenities": ["wifi", "parking", "meals"],
  "gender_preference": "male",
  "food_policy": "Veg and Non-Veg",
  "visitor_policy": "Allowed on weekends",
  "description": "Spacious and well-maintained hostel..."
}
```

**Response:** 201 Created
```json
{
  "message": "Property created successfully",
  "property": {
    "id": "uuid",
    "property_name": "Vedaditya Boys Hostel",
    "status": "pending"
  }
}
```

---

### GET /api/properties/<property_id>
Get detailed information about a specific property.

**Response:** 200 OK
```json
{
  "property": {
    "id": "uuid",
    "property_name": "Vedaditya Boys Hostel",
    "property_type": "boys_pg",
    "description": "Spacious and well-maintained hostel...",
    "address": "Kankot Rd, Near Government Engineering College",
    "city": "Rajkot",
    "state": "Gujarat",
    "pincode": "360001",
    "landmark": "Near Government Engineering College",
    "total_rooms": 10,
    "available_rooms": 5,
    "bathrooms": 4,
    "floors": 2,
    "rent_per_month": 5500,
    "security_deposit": 15000,
    "maintenance_charges": 500,
    "amenities": ["wifi", "parking", "meals"],
    "gender_preference": "male",
    "food_policy": "Veg and Non-Veg",
    "visitor_policy": "Allowed on weekends",
    "status": "approved",
    "images": [{"image_url": "url", "image_order": 1}],
    "owner": {
      "name": "Owner Name",
      "phone": "9876543210",
      "email": "owner@example.com"
    },
    "rating": 4.5,
    "review_count": 25,
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "review_title": "Great hostel",
        "review_text": "Very comfortable and well-maintained...",
        "student_name": "John Doe",
        "created_at": "2025-01-01T00:00:00"
      }
    ],
    "created_at": "2025-01-01T00:00:00"
  }
}
```

---

### PUT /api/properties/<property_id>
Update property details (Owner only).

**Headers:** `Authorization: Bearer {token}`

**Request Body:** (Any subset of fields to update)
```json
{
  "property_name": "Updated Name",
  "available_rooms": 4,
  "rent_per_month": 6000
}
```

**Response:** 200 OK
```json
{
  "message": "Property updated successfully"
}
```

---

### DELETE /api/properties/<property_id>
Delete/archive a property (Owner only).

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "message": "Property deleted successfully"
}
```

---

## Saved Properties Endpoints

### GET /api/saved-properties
Get student's saved/favorite properties.

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "properties": [
    {
      "id": "uuid",
      "property_name": "Vedaditya Boys Hostel",
      "city": "Rajkot",
      "rent_per_month": 5500,
      "rating": 4.5,
      "images": [{"image_url": "url", "image_order": 1}],
      "owner": {
        "name": "Owner Name",
        "phone": "9876543210",
        "email": "owner@example.com"
      },
      "saved_at": "2025-01-01T00:00:00"
    }
  ]
}
```

---

### POST /api/saved-properties
Save a property to favorites.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "property_id": "uuid"
}
```

**Response:** 201 Created
```json
{
  "message": "Property saved successfully"
}
```

---

### DELETE /api/saved-properties/<property_id>
Remove property from favorites.

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "message": "Property removed from saved"
}
```

---

## Messaging Endpoints

### GET /api/messages
Get all conversations for the user.

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "conversations": [
    {
      "user_id": "uuid",
      "user_name": "Owner Name",
      "user_email": "owner@example.com",
      "last_message": "Hi, are you interested in the property?",
      "last_message_at": "2025-01-01T00:00:00",
      "unread": true
    }
  ]
}
```

---

### POST /api/messages
Send a message to another user.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "receiver_id": "uuid",
  "message": "Hi, I'm interested in your property"
}
```

**Response:** 201 Created
```json
{
  "message": "Message sent successfully"
}
```

---

### GET /api/messages/<user_id>
Get conversation history with a specific user.

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "receiver_id": "uuid",
      "message": "Hi, are you interested in the property?",
      "is_read": true,
      "created_at": "2025-01-01T00:00:00"
    }
  ]
}
```

---

## Bookings Endpoints

### GET /api/bookings
Get user's bookings (Student view) or property bookings (Owner view).

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "bookings": [
    {
      "id": "uuid",
      "property_name": "Vedaditya Boys Hostel",
      "city": "Rajkot",
      "monthly_rent": 5500,
      "total_amount": 20000,
      "check_in_date": "2025-02-01",
      "check_out_date": "2025-05-01",
      "status": "confirmed",
      "created_at": "2025-01-01T00:00:00"
    }
  ]
}
```

---

### POST /api/bookings
Create a new booking.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "property_id": "uuid",
  "check_in_date": "2025-02-01",
  "check_out_date": "2025-05-01",
  "monthly_rent": 5500,
  "total_amount": 20000
}
```

**Response:** 201 Created
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": "uuid"
  }
}
```

---

### PUT /api/bookings/<booking_id>
Update booking status.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response:** 200 OK
```json
{
  "message": "Booking updated successfully"
}
```

---

## Reviews Endpoints

### POST /api/reviews
Post a review for a property.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "property_id": "uuid",
  "rating": 5,
  "review_title": "Great hostel",
  "review_text": "Very comfortable and well-maintained environment..."
}
```

**Response:** 201 Created
```json
{
  "message": "Review posted successfully"
}
```

---

### GET /api/properties/<property_id>/reviews
Get all reviews for a property.

**Response:** 200 OK
```json
{
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "review_title": "Great hostel",
      "review_text": "Very comfortable and well-maintained...",
      "student_name": "John Doe",
      "created_at": "2025-01-01T00:00:00"
    }
  ]
}
```

---

## User Profile Endpoints

### GET /api/profile
Get current user's profile.

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "9876543210",
    "user_type": "student",
    "is_verified": true,
    "created_at": "2025-01-01T00:00:00"
  }
}
```

---

### PUT /api/profile
Update user profile.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "full_name": "John Updated Doe",
  "phone": "9999999999"
}
```

**Response:** 200 OK
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "full_name": "John Updated Doe",
    "phone": "9999999999"
  }
}
```

---

### PUT /api/profile/password
Change user password.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

**Response:** 200 OK
```json
{
  "message": "Password changed successfully"
}
```

---

## Payment Endpoints

### POST /api/payments
Create a new payment.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "booking_id": "uuid",
  "amount": 5500,
  "payment_method": "credit_card"
}
```

**Response:** 201 Created
```json
{
  "message": "Payment created successfully",
  "payment": {
    "id": "uuid",
    "status": "pending"
  }
}
```

---

### GET /api/payments/<payment_id>
Get payment details.

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "payment": {
    "id": "uuid",
    "booking_id": "uuid",
    "amount": 5500,
    "payment_method": "credit_card",
    "status": "pending",
    "created_at": "2025-01-01T00:00:00"
  }
}
```

---

## Dashboard Endpoints

### GET /api/dashboard/stats
Get user dashboard statistics (Student/Owner specific).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (optional): Override user type (for admin viewing)

**Response for Student:** 200 OK
```json
{
  "stats": {
    "saved_pgs": 12,
    "applications": 3,
    "visits": 2,
    "messages": 5
  }
}
```

**Response for Owner:** 200 OK
```json
{
  "stats": {
    "total_properties": 5,
    "occupied_rooms": 12,
    "monthly_revenue": 45000,
    "inquiries": 8
  }
}
```

---

### GET /api/dashboard/recent-pgs
Get recently viewed properties for students.

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Vedaditya Boys Hostel",
      "location": "Kankot Rd, Near Government Engineering College, Rajkot",
      "price": 6500,
      "rating": 4.5,
      "reviews": 124,
      "status": "Available",
      "image": "/static/images/pg1.jpg"
    }
  ]
}
```

---

### GET /api/dashboard/recent-properties
Get owner's recent properties.

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Vedaditya Boys Hostel",
      "location": "Rajkot, Gujarat",
      "price": 5500,
      "rating": 4.5,
      "reviews": 25,
      "status": "Approved",
      "image": "/static/images/placeholder.jpg"
    }
  ]
}
```

---

## Error Response Format

All endpoints return errors in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- `200 OK`: Successful GET/PUT request
- `201 Created`: Successful POST request
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User lacks permission
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Authentication

All protected routes (marked with Authorization header) require a JWT token in the `Authorization` header:

```
Authorization: Bearer {jwt_token}
```

The JWT token is obtained from the `/api/auth/login` endpoint and is valid for 7 days.

---

## Rate Limiting

No rate limiting is currently implemented. For production deployment, consider implementing rate limiting to prevent abuse.

---

## Database Tables Required

The following Supabase tables are required:
- `users` - User accounts
- `properties` - Property listings
- `bookings` - Booking records
- `messages` - User messages
- `reviews` - Property reviews
- `saved_properties` - User's saved properties
- `payments` - Payment records
- `property_images` - Property images

---

## Implementation Status

✅ All routes documented in README have been implemented
✅ JWT authentication for protected routes
✅ Request validation and error handling
✅ Pagination support for property listings
✅ User authorization checks
✅ Database integration via Supabase

---

**Last Updated:** 2025-04-21
