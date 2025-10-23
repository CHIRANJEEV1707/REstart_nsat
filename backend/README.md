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

# Create Elasticsearch index
python manage.py search_index --create

# Run server
python manage.py runserver

# In separate terminals:
celery -A config worker -l info
celery -A config beat -l info
```

## 📋 Prerequisites

- **Python 3.8+**
- **MySQL 8.0+**
- **Elasticsearch 8.11+**
- **Redis 5.0+**

## 🏗️ Architecture

### Tech Stack

- **Django 5.0** - Web framework
- **Django REST Framework** - API framework
- **MySQL** - Primary database with read replica support
- **Elasticsearch** - Full-text search for college discovery
- **Redis** - Caching and message broker
- **Celery** - Async task processing
- **JWT** - Token-based authentication

### Modular App Structure

```
backend/
├── users/          # Authentication & user management
├── colleges/       # College data with Elasticsearch
├── exams/          # Exam management
├── guidance/       # Preparation plans
├── interactions/   # Shortlist, reminders, reviews
└── administration/ # Admin customizations
```

## 🔑 Key Features

### ⚡ Elasticsearch-Powered Search
- **Zero MySQL queries** for college search
- Full-text search with fuzzy matching
- Advanced filtering (fees, location, exams, degrees)
- Sub-100ms response times

### 🔄 Async Task Processing
- Email reminders via Celery
- Bulk data imports
- Review notifications
- Daily index updates

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

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and scalability
- **[SETUP_NEW.md](SETUP_NEW.md)** - Detailed setup instructions
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register-otp/` - Request OTP
- `POST /api/auth/verify-otp/` - Verify & login
- `POST /api/auth/google/` - Google OAuth

### College Discovery (Elasticsearch)
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

# Celery Worker
celery -A config worker -l info

# Celery Beat (Scheduler)
celery -A config beat -l info

# Celery Flower (Monitoring)
celery -A config flower
```

### Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Elasticsearch

```bash
# Create index
python manage.py search_index --create

# Rebuild index
python manage.py search_index --rebuild -f

# Populate index
python manage.py search_index --populate
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

### Search & Cache
- elasticsearch 8.11.1
- django-elasticsearch-dsl 8.0
- django-redis 5.4.0

### Async
- celery 5.3.4
- django-celery-beat 2.5.0

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
- [ ] Configure Elasticsearch cluster
- [ ] Setup Redis cluster
- [ ] Use Gunicorn/uWSGI
- [ ] Configure Nginx reverse proxy
- [ ] Setup SSL certificates
- [ ] Configure monitoring
- [ ] Setup automated backups

### Environment Variables

See `.env.example` for all required variables:
- Database credentials
- Elasticsearch host
- Redis URL
- Email configuration
- Google OAuth credentials
- Celery broker URL

## 📊 Scalability

### Database
- MySQL with read replicas
- Connection pooling
- Optimized indexes

### Search
- Elasticsearch cluster
- Horizontal scaling
- Sharding support

### Caching
- Redis cluster
- Cache warming
- CDN integration

### Async Processing
- Multiple Celery workers
- Task routing
- Rate limiting

## 🐛 Troubleshooting

### Common Issues

**MySQL Connection Error**
```bash
# Check MySQL is running
brew services list | grep mysql
sudo systemctl status mysql
```

**Elasticsearch Connection Error**
```bash
# Verify Elasticsearch
curl http://localhost:9200
```

**Celery Tasks Not Running**
```bash
# Check worker status
celery -A config inspect active
```

See [SETUP_NEW.md](SETUP_NEW.md) for detailed troubleshooting.

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

## 📞 Support

For issues or questions:
- Check documentation
- Review troubleshooting guide
- Contact development team

---

**Version**: 2.0  
**Last Updated**: 2025-01-22  
**Status**: Production Ready
