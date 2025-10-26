# REstart Backend

Enterprise-grade Django REST API for the REstart college discovery platform, designed to scale to **100k+ MAU**.

## 🚀 Quick Start

```bash
# Clone and navigate
cd backend

# Setup environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your settings

# Setup database
python manage.py migrate
python manage.py createsuperuser

# Seed the database with test data
python seed_db.py

# Run server
python manage.py runserver
```

## 📋 Prerequisites

- **Python 3.8+**
- **MySQL 8.0+**
- **Redis 5.0+** (optional, for caching)

## 🏗️ Architecture

### Tech Stack

- **Django 5.0** - Web framework
- **Django REST Framework** - API framework
- **MySQL** - Primary database
- **Redis** - Caching and message broker (optional)
- **JWT** - Token-based authentication

### Modular App Structure

```
backend/
├── users/          # Authentication & user management
├── colleges/       # College data
├── exams/          # Exam management
├── guidance/       # Preparation plans
├── interactions/   # Shortlist, reminders, reviews
└── administration/ # Admin customizations
```

## 🔑 Key Features

### 🔍 Advanced College Search
- Full-text search with filtering
- Advanced filtering (fees, location, exams, degrees)
- Fast response times

### 🔐 Security & Compliance
- JWT authentication with token rotation
- OTP-based email login
- Google OAuth integration
- DPDPA compliance (data export/deletion)
- Object-level permissions

### 👨‍💼 Advanced Admin
- Bulk import/export with `django-import-export`
- Version control with `django-reversion`
- Review moderation queue
- Draft/publish workflow

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register-otp/` - Request OTP
- `POST /api/auth/verify-otp/` - Verify & login
- `POST /api/auth/google/` - Google OAuth

### College Discovery
- `GET /api/colleges/` - Search with filters
- `GET /api/colleges/:id/` - Details (cached)
- `GET /api/colleges/:id/reviews/` - Reviews

### User Features
- `GET /api/me/` - Profile
- `GET /api/prep/plans/` - Prep plans
- `GET /api/saved/` - Saved colleges
- `GET /api/reminders/` - Reminders

### Admin
- `GET /api/reviews/pending/` - Moderation queue
- `POST /api/reviews/:id/moderate/` - Approve/reject

## 🛠️ Development

### Running Services

```bash
# Django
python manage.py runserver
```

### Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Database Seeding

```bash
# Seed the database with test data
python seed_db.py
```

## 🧪 Testing

### Manual Testing

```bash
# Test OTP flow
curl -X POST http://localhost:8000/api/auth/register-otp/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Search colleges
curl "http://localhost:8000/api/colleges/?q=engineering&state=Delhi"
```

### Admin Interface

Access at: `http://localhost:8000/admin/`

## 📦 Dependencies

### Core
- Django 5.0.1
- djangorestframework 3.14.0
- mysqlclient 2.2.1

### Auth
- djangorestframework-simplejwt 5.3.1
- django-allauth 0.57.0

### Admin Tools
- django-import-export 3.3.5
- django-reversion 5.0.10

## 🚀 Deployment

### Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Use strong `SECRET_KEY`
- [ ] Setup MySQL read replicas
- [ ] Configure Redis (optional)
- [ ] Use Gunicorn/uWSGI
- [ ] Configure Nginx reverse proxy
- [ ] Setup SSL certificates
- [ ] Configure monitoring
- [ ] Setup automated backups

### Environment Variables

See `.env.example` for all required variables:
- Database credentials
- Redis URL (optional)
- Email configuration
- Google OAuth credentials

## 📊 Scalability

### Database
- MySQL with read replicas
- Connection pooling
- Optimized indexes

### Caching
- Redis cluster (optional)
- Cache warming
- CDN integration

## 🐛 Troubleshooting

### Common Issues

**MySQL Connection Error**
```bash
# Check MySQL is running
brew services list | grep mysql
sudo systemctl status mysql
```

## 📝 API Examples

### Authentication Flow

```python
import requests

# 1. Request OTP
response = requests.post('http://localhost:8000/api/auth/register-otp/', 
    json={'email': 'user@example.com'})

# 2. Verify OTP
response = requests.post('http://localhost:8000/api/auth/verify-otp/',
    json={'email': 'user@example.com', 'otp': '123456'})

tokens = response.json()['tokens']
access_token = tokens['access']

# 3. Use token
headers = {'Authorization': f'Bearer {access_token}'}
response = requests.get('http://localhost:8000/api/me/', headers=headers)
```

### College Search

```python
# Search with filters
params = {
    'q': 'engineering',
    'state': 'Delhi',
    'fees_max': 500000,
    'restart_score_min': 80,
    'sort_by': '-restart_score'
}
response = requests.get('http://localhost:8000/api/colleges/', params=params)
colleges = response.json()['results']
```

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

## 📄 License

Proprietary - REstart Platform

## 👥 Team

REstart Development Team

---

**Version**: 2.1  
**Last Updated**: 2025-10-26  
**Status**: Production Ready
