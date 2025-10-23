# RE_START Backend Setup Guide

This guide will help you set up the Django backend for the RE_START application with PostgreSQL database and all required API endpoints.

## Prerequisites

1. **Python 3.8+** installed on your system
2. **PostgreSQL** database server
3. **Redis** server (for caching and sessions)
4. **Git** for version control

## Installation Steps

### 1. Install PostgreSQL

**On macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb restart_db
```

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE restart_db;
CREATE USER restart_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE restart_db TO restart_user;
\q
```

### 2. Install Redis

**On macOS:**
```bash
brew install redis
brew services start redis
```

**On Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 3. Set up Python Environment

```bash
# Navigate to backend directory
cd /Users/arpitsarang/Code/RE_START/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:

```env
# Database Configuration
DB_NAME=restart_db
DB_USER=restart_user
DB_PASSWORD=your_actual_password
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
SECRET_KEY=your_very_secret_key_here_make_it_long_and_random
DEBUG=True

# Email Configuration for OTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

# Google OAuth Configuration
GOOGLE_OAUTH2_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH2_CLIENT_SECRET=your_google_client_secret

# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379/1
```

### 5. Database Setup

```bash
# Create and apply migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser
```

### 6. Run the Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/login/otp/` - Initiate OTP login
- `POST /api/auth/verify/otp/` - Verify OTP and get JWT tokens
- `POST /api/auth/google/` - Google OAuth authentication
- `GET /api/auth/me/` - Get current user details
- `POST /api/auth/token/refresh/` - Refresh JWT token

### College Discovery & Filters
- `GET /api/colleges/` - List colleges with filtering and search
- `GET /api/colleges/{id}/` - Get detailed college information
- `GET /api/colleges/{id}/fees/` - Get fees information
- `GET /api/colleges/{id}/scholarships/` - Get scholarships
- `GET /api/colleges/{id}/exams/` - Get required exams
- `GET /api/colleges/{id}/reviews/` - Get college reviews

### Exams Module
- `GET /api/exams/` - List all exams
- `GET /api/exams/{id}/` - Get detailed exam information
- `GET /api/exams/{id}/dates/` - Get important exam dates

### User-Specific Features
- `POST /api/saved-colleges/` - Save a college
- `GET /api/saved-colleges/` - Get saved colleges
- `DELETE /api/saved-colleges/{collegeId}/` - Remove saved college
- `POST /api/reminders/` - Create reminder
- `GET /api/reminders/` - Get user reminders
- `POST /api/prep-plans/` - Create preparation plan
- `GET /api/prep-plans/{id}/weeks/` - Get weekly tasks

### Reviews & Ratings
- `POST /api/colleges/{id}/reviews/` - Submit college review
- `GET /api/reviews/` - Get user's reviews

## Database Schema

The application uses the following PostgreSQL tables:
- `users` - User accounts and profiles
- `colleges` - College information
- `exams` - Exam details
- `exam_dates` - Important exam dates
- `college_exams` - College-exam relationships
- `college_degrees` - Degrees offered by colleges
- `scholarships` - Scholarship information
- `prep_plans` - User preparation plans
- `prep_weeks` - Weekly preparation tasks
- `saved_colleges` - User's saved colleges
- `reminders` - User reminders
- `reviews` - College reviews and ratings

## Features Implemented

✅ **Authentication System**
- Email OTP login
- Google OAuth integration
- JWT token-based authentication

✅ **College Discovery**
- Advanced filtering (state, city, type, fees, etc.)
- Full-text search
- Pagination and sorting

✅ **Exam Management**
- Exam information and dates
- College-exam relationships

✅ **User Features**
- Save/unsave colleges
- Create reminders
- Preparation plans with weekly tasks

✅ **Reviews System**
- Submit and manage reviews
- Admin approval workflow

✅ **Admin Interface**
- Complete admin panel for all models
- Bulk actions for review management

## Development Notes

1. **Authentication**: Uses custom JWT authentication that integrates with the Users model
2. **Permissions**: Most endpoints require authentication except college/exam discovery
3. **Caching**: Redis is used for OTP storage and session management
4. **Search**: Implements PostgreSQL full-text search on college names and descriptions
5. **Admin**: Comprehensive admin interface for content management

## Troubleshooting

### Common Issues

1. **PostgreSQL Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Redis Connection Error**
   - Ensure Redis server is running
   - Check Redis URL in `.env`

3. **Migration Errors**
   - Delete migration files and recreate: `find . -path "*/migrations/*.py" -not -name "__init__.py" -delete`
   - Run `python manage.py makemigrations` again

4. **Import Errors**
   - Ensure virtual environment is activated
   - Install missing dependencies: `pip install -r requirements.txt`

### Testing the API

Use tools like Postman, curl, or the Django REST Framework browsable API at `http://localhost:8000/api/` to test endpoints.

Example OTP login flow:
```bash
# 1. Request OTP
curl -X POST http://localhost:8000/api/auth/login/otp/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# 2. Verify OTP (check your email for the OTP)
curl -X POST http://localhost:8000/api/auth/verify/otp/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456"}'
```
