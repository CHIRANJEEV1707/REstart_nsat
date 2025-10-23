# REstart Backend Architecture Documentation

## Overview

The REstart backend is built using **Django 5.0** and **Django REST Framework**, designed to scale to **100k+ MAU** with a modular architecture, Elasticsearch-powered search, and asynchronous task processing.

## Tech Stack

### Core Framework
- **Django 5.0.1** - Web framework
- **Django REST Framework 3.14.0** - API framework
- **Python 3.8+** - Programming language

### Database
- **MySQL 8.0+** - Primary relational database
- **Read Replicas** - For horizontal scaling (configuration ready)

### Search Engine
- **Elasticsearch 8.11+** - Full-text search and filtering for college discovery
- **django-elasticsearch-dsl** - Django integration

### Caching & Message Broker
- **Redis** - Caching, session storage, and message broker
- **django-redis** - Django cache backend

### Async Task Processing
- **Celery 5.3.4** - Distributed task queue
- **Celery Beat** - Periodic task scheduler
- **Redis** - Celery broker and result backend

### Authentication
- **JWT (Simple JWT)** - Token-based authentication
- **django-allauth** - Social authentication (Google OAuth)
- **Custom OTP** - Email-based OTP login

## Project Structure

```
backend/
├── config/                 # Project configuration
│   ├── settings.py        # Django settings
│   ├── celery.py          # Celery configuration
│   ├── urls.py            # Main URL routing
│   └── api_urls.py        # API URL routing
│
├── users/                 # User management & authentication
│   ├── models.py          # Custom User model
│   ├── serializers.py     # User serializers
│   ├── views.py           # Auth views (OTP, Google OAuth)
│   ├── admin.py           # User admin
│   └── urls.py            # User endpoints
│
├── colleges/              # College management
│   ├── models.py          # College, Degree, Scholarship models
│   ├── serializers.py     # College serializers
│   ├── views.py           # College ViewSet with Elasticsearch
│   ├── documents.py       # Elasticsearch document definition
│   ├── tasks.py           # Celery tasks (bulk import, stats update)
│   └── admin.py           # College admin with import/export
│
├── exams/                 # Exam management
│   ├── models.py          # Exam, ExamDate models
│   ├── serializers.py     # Exam serializers
│   ├── views.py           # Exam ViewSet
│   └── admin.py           # Exam admin with import/export
│
├── guidance/              # Preparation plans
│   ├── models.py          # PrepPlan, PrepWeek, PrepTask models
│   ├── serializers.py     # Prep plan serializers
│   ├── views.py           # PrepPlan ViewSet
│   └── admin.py           # Prep plan admin
│
├── interactions/          # User interactions
│   ├── models.py          # Shortlist, ReminderSubscription, Review models
│   ├── serializers.py     # Interaction serializers
│   ├── views.py           # Interaction ViewSets
│   ├── tasks.py           # Celery tasks (reminders, notifications)
│   └── admin.py           # Review moderation admin
│
└── administration/        # Admin customizations
    └── admin.py           # Custom admin logic
```

## Database Schema

### Core Models

#### users.User (Custom User Model)
- **Authentication**: email (USERNAME_FIELD), password, auth_provider
- **Profile**: name, state, class_level, target_degree
- **Budget**: budget_min, budget_max
- **Timestamps**: created_at, updated_at

#### colleges.College
- **Basic**: name, description, status (draft/published)
- **Location**: state, city, location_lat, location_lng
- **Type**: type, accreditation (JSONField)
- **Fees**: fees_annual, fees_hostel
- **Ratings**: restart_score, ratings_count, reviews_avg
- **Relations**: M2M to Exam (through CollegeExam), O2M to Scholarship, Degree, ImportantDate

#### exams.Exam
- **Basic**: code (unique), name, overview
- **Details**: eligibility, pattern, syllabus_summary
- **Data**: dates (JSONField), cutoffs (JSONField)
- **Application**: application_url

#### guidance.PrepPlan
- **Relations**: FK to User, FK to Exam
- **Status**: status (active/completed/paused/abandoned)
- **Target**: target_date
- **Structure**: O2M to PrepWeek → O2M to PrepTask

#### interactions.Review
- **Content**: rating (1-5), title, body, tags (JSONField)
- **Moderation**: status (pending/approved/rejected), moderation_notes
- **Relations**: FK to User, FK to College, FK to moderated_by (User)
- **Engagement**: helpful_count, not_helpful_count

## API Endpoints

### Authentication (`/api/auth/`)
- `POST /auth/register-otp/` - Request OTP for email
- `POST /auth/verify-otp/` - Verify OTP and get JWT tokens
- `POST /auth/google/` - Google OAuth authentication
- `POST /auth/token/refresh/` - Refresh JWT access token

### User Profile (`/api/me/`)
- `GET /me/` - Get current user profile
- `PATCH /me/` - Update user profile
- `POST /me/request-data-export/` - Request data export (DPDPA)
- `DELETE /me/delete-account/` - Delete account (DPDPA)

### College Discovery (`/api/colleges/`)
- `GET /colleges/` - **Elasticsearch-powered** search and filtering
  - Query params: `q`, `state`, `city`, `type`, `fees_min`, `fees_max`, `restart_score_min`, `rating_min`, `exam`, `degree`, `sort_by`
- `GET /colleges/:id/` - Get college details (Redis cached)
- `GET /colleges/:id/scholarships/` - Get scholarships
- `GET /colleges/:id/important_dates/` - Get important dates
- `GET /colleges/:id/reviews/` - Get approved reviews

### Exams (`/api/exams/`)
- `GET /exams/` - List all exams
- `GET /exams/:id/` - Get exam details
- `GET /exams/:id/dates/` - Get important exam dates
- `GET /exams/:id/colleges/` - Get colleges accepting this exam

### Prep Plans (`/api/prep/plans/`)
- `GET /prep/plans/` - List user's prep plans
- `POST /prep/plans/` - Create new prep plan
- `GET /prep/plans/:id/` - Get prep plan details
- `PATCH /prep/plans/:id/` - Update prep plan
- `GET /prep/plans/:id/weeks/` - Get weekly tasks
- `PATCH /prep/plans/:id/tasks/:task_id/` - Update task status

### Saved Colleges (`/api/saved/`)
- `GET /saved/` - List saved colleges
- `POST /saved/` - Save a college
- `DELETE /saved/:id/` - Remove from saved

### Reminders (`/api/reminders/`)
- `GET /reminders/` - List user's reminders
- `POST /reminders/` - Create reminder subscription
- `PATCH /reminders/:id/` - Update reminder
- `DELETE /reminders/:id/` - Delete reminder

### Reviews (`/api/reviews/`)
- `GET /reviews/` - List reviews (filtered by user role)
- `POST /reviews/` - Submit college review
- `GET /reviews/pending/` - Get pending reviews (admin only)
- `POST /reviews/:id/moderate/` - Approve/reject review (admin only)

## Elasticsearch Integration

### College Discovery Architecture

**Critical**: The `/api/colleges/` endpoint **does NOT hit MySQL**. All search and filtering operations are performed on Elasticsearch.

#### CollegeDocument Definition
Located in `colleges/documents.py`, defines:
- **Indexed fields**: name, description, state, city, type, fees, scores
- **Geo-point**: location (lat/lng) for proximity search
- **Multi-value**: exams_required, degrees_offered
- **Custom analyzers**: For better text search

#### Auto-sync with MySQL
- **Django signals**: Automatically sync College model changes to Elasticsearch
- **Celery task**: Daily full index rebuild (`update_elasticsearch_index`)

#### Search Features
- **Full-text search**: On name and description with fuzzy matching
- **Filters**: State, city, type, fees range, scores, exams, degrees
- **Sorting**: By restart_score, fees, name
- **Pagination**: Efficient offset-based pagination

### Setup Commands
```bash
# Create Elasticsearch index
python manage.py search_index --create

# Rebuild index
python manage.py search_index --rebuild

# Populate index
python manage.py search_index --populate
```

## Celery Async Tasks

### Task Types

#### Reminders (`interactions/tasks.py`)
- `check_and_send_reminders()` - Daily task to check upcoming dates
- `send_reminder_email(subscription_id)` - Send individual reminder

#### College Management (`colleges/tasks.py`)
- `update_elasticsearch_index()` - Rebuild Elasticsearch index
- `process_bulk_college_import(csv_file_path, admin_user_id)` - Bulk import from CSV
- `update_college_statistics(college_id)` - Update ratings and review counts

#### Review Notifications (`interactions/tasks.py`)
- `send_review_approval_notification(review_id)` - Notify user of review status

### Celery Beat Schedule
```python
{
    'check-upcoming-reminders': {
        'task': 'interactions.tasks.check_and_send_reminders',
        'schedule': crontab(hour=9, minute=0),  # Daily at 9 AM
    },
    'update-college-elasticsearch-index': {
        'task': 'colleges.tasks.update_elasticsearch_index',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}
```

### Running Celery
```bash
# Start Celery worker
celery -A config worker -l info

# Start Celery Beat scheduler
celery -A config beat -l info

# Combined (development)
celery -A config worker -B -l info
```

## Caching Strategy

### Redis Cache Usage

#### College Detail Caching
- **Key**: `college_detail_{college_id}`
- **TTL**: 1 hour
- **Invalidation**: Manual on college update

#### OTP Storage
- **Key**: `otp_{email}`
- **TTL**: 10 minutes
- **Purpose**: Temporary OTP storage for authentication

#### Session Storage
- **Backend**: `django.contrib.sessions.backends.cache`
- **Cache**: Redis default cache

## Security & Permissions

### Authentication
- **JWT tokens**: Access token (60 min), Refresh token (7 days)
- **Token rotation**: Refresh tokens are rotated on use
- **Blacklisting**: Old refresh tokens are blacklisted

### API Permissions

#### Public Endpoints (AllowAny)
- College search and discovery
- Exam listings
- Approved reviews

#### Authenticated Endpoints (IsAuthenticated)
- User profile
- Prep plans
- Saved colleges
- Reminders
- Review submission

#### Admin Endpoints (IsAdminUser)
- College/Exam CRUD
- Review moderation
- Bulk imports

### Object-Level Permissions
- **PrepPlan**: Users can only view/edit their own plans
- **Shortlist**: Users can only view/edit their own shortlist
- **ReminderSubscription**: Users can only view/edit their own reminders

## DPDPA Compliance

### Data Export
- **Endpoint**: `POST /api/me/request-data-export/`
- **Process**: Queues Celery task to generate user data export
- **Delivery**: Email with download link within 48 hours

### Account Deletion
- **Endpoint**: `DELETE /api/me/delete-account/`
- **Process**: Deactivates account immediately
- **Data Retention**: Personal data deleted within 30 days
- **Anonymization**: Reviews and interactions are anonymized, not deleted

## Admin Interface

### Features

#### College Management
- **Import/Export**: CSV bulk import/export with `django-import-export`
- **Version Control**: Track changes with `django-reversion`
- **Bulk Actions**: Publish/draft multiple colleges
- **Inline Editing**: Scholarships, degrees, exams, dates

#### Review Moderation
- **Moderation Queue**: Filter by status (pending/approved/rejected)
- **Bulk Actions**: Approve/reject multiple reviews
- **Notifications**: Automatic email notifications on status change
- **Statistics Update**: Auto-update college ratings on approval

#### Content Governance
- **Status Management**: Draft/Published workflow
- **Version History**: Track all changes to colleges and exams
- **Audit Trail**: Track who moderated reviews and when

## Scalability Considerations

### Database
- **MySQL Read Replicas**: Configure in `settings.py` for read-heavy operations
- **Connection Pooling**: Use `mysqlclient` with connection pooling
- **Indexing**: Database indexes on frequently queried fields

### Elasticsearch
- **Sharding**: Configure shards based on data volume
- **Replicas**: Set replicas for high availability
- **Cluster**: Scale horizontally by adding nodes

### Caching
- **Redis Cluster**: Scale Redis horizontally
- **Cache Warming**: Pre-populate cache for popular colleges
- **CDN**: Serve static assets via CDN

### Celery
- **Multiple Workers**: Scale workers horizontally
- **Task Routing**: Route tasks to specialized workers
- **Rate Limiting**: Prevent task queue overload

## Development Setup

See `SETUP.md` for detailed setup instructions.

### Quick Start
```bash
# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create Elasticsearch index
python manage.py search_index --create

# Run development server
python manage.py runserver

# In separate terminals:
# Start Celery worker
celery -A config worker -l info

# Start Celery Beat
celery -A config beat -l info
```

## Testing

### API Testing
Use Django REST Framework's browsable API at `http://localhost:8000/api/`

### Elasticsearch Testing
```python
# Test search
from colleges.documents import CollegeDocument
search = CollegeDocument.search()
response = search.execute()
```

### Celery Testing
```python
# Test task
from colleges.tasks import update_college_statistics
result = update_college_statistics.delay(college_id=1)
```

## Monitoring & Logging

### Logging
- **Level**: INFO in production, DEBUG in development
- **Format**: Structured logging with timestamps
- **Handlers**: Console and file handlers

### Celery Monitoring
- **Flower**: Web-based Celery monitoring tool
```bash
celery -A config flower
```

### Elasticsearch Monitoring
- **Kibana**: Visualize Elasticsearch data and performance
- **Health Check**: Monitor cluster health

## Deployment

### Production Checklist
- [ ] Set `DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Use strong `SECRET_KEY`
- [ ] Setup MySQL read replicas
- [ ] Configure Elasticsearch cluster
- [ ] Setup Redis cluster/sentinel
- [ ] Configure Celery workers (multiple instances)
- [ ] Setup SSL/TLS certificates
- [ ] Configure CORS for frontend domain
- [ ] Setup monitoring and logging
- [ ] Configure backup strategy
- [ ] Setup CDN for static files

### Environment Variables
See `.env.example` for all required environment variables.

## API Documentation

### Auto-generated Documentation
- **Swagger/OpenAPI**: Available at `/api/docs/` (when configured)
- **ReDoc**: Available at `/api/redoc/` (when configured)

### Postman Collection
Import the Postman collection from `docs/postman_collection.json` (to be created)

## Support & Maintenance

### Common Issues
See `SETUP.md` for troubleshooting guide.

### Database Migrations
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migrations
python manage.py showmigrations
```

### Elasticsearch Reindexing
```bash
# Full rebuild
python manage.py search_index --rebuild -f

# Specific model
python manage.py search_index --rebuild -f --models colleges.College
```

---

**Version**: 1.0  
**Last Updated**: 2025-01-22  
**Maintainer**: REstart Development Team
