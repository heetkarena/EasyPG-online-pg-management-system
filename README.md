# EasyPG - PG Accommodation Management System

A comprehensive web application for managing PG (Paying Guest) accommodations, connecting students with verified PG owners.

## 🎯 Project Overview

EasyPG is a full-stack web application built as a college project that simplifies the process of finding and managing PG accommodations. The platform serves three types of users:

- **Students**: Search, view, and book PG accommodations
- **PG Owners**: List and manage their properties
- **Admins**: Oversee the entire platform

## 🛠 Technology Stack

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Interactive functionality and API integration
- **Font Awesome**: Icons and visual elements

### Backend
- **Python 3.8+**: Core programming language
- **Flask**: Lightweight web framework
- **Supabase**: PostgreSQL database with real-time features
- **JWT**: Secure authentication tokens
- **bcrypt**: Password hashing

### Database
- **PostgreSQL** (via Supabase): Primary database
- **Row Level Security (RLS)**: Data protection
- **Real-time subscriptions**: Live updates

## 📋 Features

### For Students
- 🔍 Advanced property search with filters
- 💾 Save favorite properties
- 💬 Direct messaging with PG owners
- 📅 Schedule property visits
- 💳 Secure online payments
- ⭐ Rate and review properties

### For PG Owners
- 🏠 List and manage properties
- 📊 Dashboard with analytics
- 💬 Communicate with potential tenants
- 💰 Track bookings and payments
- 📈 View property performance

### For Admins
- 👥 User management
- 🏢 Property verification
- 📊 Platform analytics
- 🛡️ System monitoring

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Supabase account
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/easypg.git
   cd easypg
   \`\`\`

2. **Create virtual environment**
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   \`\`\`

3. **Install dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edit `.env` file with your Supabase credentials:
   \`\`\`env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SECRET_KEY=your_secret_key
   JWT_SECRET_KEY=your_jwt_secret
   \`\`\`

5. **Initialize the database**
   \`\`\`bash
   # Run the SQL scripts in your Supabase dashboard
   # 1. database-schema.sql
   # 2. sample-data.sql (optional)
   \`\`\`

6. **Run the application**
   \`\`\`bash
   python run.py
   \`\`\`

7. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## 📚 Project Structure

\`\`\`
easypg/
├── app.py                 # Flask application and routes
├── run.py                 # Application runner
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── README.md             # Project documentation
├── static/               # Static assets
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/               # JavaScript files
│       ├── main.js       # Homepage functionality
│       ├── auth.js       # Authentication logic
│       ├── dashboard.js  # Dashboard functionality
│       └── search.js     # Search functionality
├── templates/            # HTML templates (if using Flask templates)
├── scripts/              # Database scripts
│   ├── database-schema.sql
│   └── sample-data.sql
└── docs/                 # Documentation
    ├── api-documentation.md
    ├── database-design.md
    └── deployment-guide.md
\`\`\`

## 🗄️ Database Schema

### Core Tables

#### Users
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password_hash` (String)
- `full_name` (String)
- `phone` (String)
- `user_type` (Enum: student, owner, admin)
- `is_verified` (Boolean)
- `created_at`, `updated_at` (Timestamps)

#### Properties
- `id` (UUID, Primary Key)
- `owner_id` (UUID, Foreign Key → Users)
- `property_name` (String)
- `property_type` (Enum: boys_pg, girls_pg, co_living, etc.)
- `address`, `city`, `state`, `pincode` (Location fields)
- `total_rooms`, `available_rooms` (Integers)
- `rent_per_month`, `security_deposit` (Decimal)
- `amenities` (Text/JSON)
- `gender_preference` (Enum)
- `status` (Enum: pending, approved, rejected)
- `created_at`, `updated_at` (Timestamps)

#### Bookings
- `id` (UUID, Primary Key)
- `property_id` (UUID, Foreign Key → Properties)
- `student_id` (UUID, Foreign Key → Users)
- `check_in_date`, `check_out_date` (Dates)
- `monthly_rent`, `total_amount` (Decimal)
- `status` (Enum: pending, confirmed, cancelled)
- `created_at`, `updated_at` (Timestamps)

## 🔧 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "9876543210",
  "user_type": "student"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "user_type": "student"
  }
}
\`\`\`

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123",
  "user_type": "student"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "user_type": "student"
  }
}
\`\`\`

### Property Endpoints

#### GET /api/properties
Retrieve properties with optional filters.

**Query Parameters:**
- `city` (string): Filter by city
- `min_rent`, `max_rent` (integer): Price range
- `property_type` (string): Type of property
- `gender_preference` (string): Gender preference
- `page`, `per_page` (integer): Pagination

**Response:**
\`\`\`json
{
  "properties": [
    {
      "id": "uuid",
      "property_name": "Green Valley PG",
      "city": "Bangalore",
      "rent_per_month": 8500,
      "available_rooms": 5,
      "amenities": ["wifi", "parking", "meals"],
      "images": [{"image_url": "url", "image_order": 1}],
      "owner": {
        "name": "Owner Name",
        "phone": "9876543210"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 10,
    "total": 100
  }
}
\`\`\`

## 🚀 Deployment

### Environment Setup

Create a `.env` file with the following variables:

\`\`\`env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Flask Configuration
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=jwt-secret-string
FLASK_DEBUG=False
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
\`\`\`

### Production Deployment

#### Using Heroku

1. **Install Heroku CLI**
2. **Create Heroku app**
   \`\`\`bash
   heroku create easypg-app
   \`\`\`

3. **Set environment variables**
   \`\`\`bash
   heroku config:set SUPABASE_URL=your_url
   heroku config:set SUPABASE_ANON_KEY=your_key
   heroku config:set SECRET_KEY=your_secret
   \`\`\`

4. **Deploy**
   \`\`\`bash
   git push heroku main
   \`\`\`

#### Using Docker

\`\`\`dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
\`\`\`

## 🧪 Testing

### Test Accounts

The application includes pre-configured test accounts:

#### Student Account
- **Email:** student@easypg.com
- **Password:** student123

#### PG Owner Account
- **Email:** owner@easypg.com
- **Password:** owner123

#### Admin Account
- **Email:** admin@easypg.com
- **Password:** admin123

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Password validation and security
- [ ] Property search and filtering
- [ ] Property listing creation
- [ ] Messaging system
- [ ] Responsive design on mobile
- [ ] Dashboard functionality
- [ ] Payment integration (if implemented)

## 📈 Project Timeline

### Phase 1: Planning & Design (Weeks 1-2)
- [x] Requirements gathering
- [x] Database design
- [x] UI/UX mockups
- [x] Technology stack selection

### Phase 2: Backend Development (Weeks 3-5)
- [x] Flask application setup
- [x] Database schema implementation
- [x] Authentication system
- [x] API endpoints development

### Phase 3: Frontend Development (Weeks 6-8)
- [x] HTML templates creation
- [x] CSS styling and responsive design
- [x] JavaScript functionality
- [x] API integration

### Phase 4: Integration & Testing (Weeks 9-10)
- [x] Frontend-backend integration
- [x] Cross-browser testing
- [x] Mobile responsiveness
- [x] Security testing

### Phase 5: Deployment & Documentation (Weeks 11-12)
- [ ] Production deployment
- [ ] Documentation completion
- [ ] Performance optimization
- [ ] Final testing and bug fixes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Academic Context

This project was developed as part of the Web Development course curriculum, demonstrating:

- Full-stack web development skills
- Database design and management
- RESTful API development
- Modern frontend technologies
- Software engineering best practices
- Project management and documentation

## 🔮 Future Enhancements

- [ ] Mobile application (React Native/Flutter)
- [ ] Real-time chat functionality
- [ ] AI-powered property recommendations
- [ ] Integration with maps for location services
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Automated rent collection
- [ ] Property verification system
- [ ] Review and rating system

---

**Built for college project | EasyPG Team © 2025**
