# REstart Backend Setup Guide

Complete setup guide for the REstart Django backend with MySQL, Elasticsearch, Celery, and Redis.

## Prerequisites

Ensure you have the following installed:

1. **Python 3.8+**
2. **MySQL 8.0+**
3. **Elasticsearch 8.11+**
4. **Redis 5.0+**
5. **Git**

## Installation Steps

### 1. Install MySQL

**On macOS:**
```bash
# Using Homebrew
brew install mysql
brew services start mysql

# Secure installation
mysql_secure_installation

# Create database
mysql -u root -p
CREATE DATABASE restart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restart_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON restart_db.* TO 'restart_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation

# Create database
sudo mysql
CREATE DATABASE restart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restart_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON restart_db.* TO 'restart_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Install Elasticsearch

**On macOS:**
```bash
# Using Homebrew
brew tap elastic/tap
brew install elastic/tap/elasticsearch-full

# Start Elasticsearch
brew services start elastic/tap/elasticsearch-full

# Verify installation
curl http://localhost:9200
```

**On Ubuntu/Debian:**
```bash
# Import Elasticsearch GPG key
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -

# Add repository
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list

# Install
sudo apt update
sudo apt install elasticsearch

# Start service
sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch

# Verify installation
curl http://localhost:9200
```

**Docker (Alternative):**
```bash
docker run -d --name elasticsearch \
  -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.1
```

### 3. Install Redis

**On macOS:**
```bash
brew install redis
brew services start redis

# Verify installation
redis-cli ping
# Should return: PONG
```

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify installation
redis-cli ping
# Should return: PONG
```

**Docker (Alternative):**
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 4. Set up Python Environment

```bash
# Navigate to backend directory
cd /Users/arpitsarang/Code/RE_START/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### 5. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:

```env
# MySQL Database Configuration
DB_NAME=restart_db
DB_USER=restart_user
DB_PASSWORD=your_actual_mysql_password
DB_HOST=localhost
DB_PORT=3306

# Django Configuration
SECRET_KEY=your_very_long_random_secret_key_here_use_at_least_50_characters
DEBUG=True

# Email Configuration for OTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password

# Google OAuth Configuration
GOOGLE_OAUTH2_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_OAUTH2_CLIENT_SECRET=your_google_client_secret

# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379/1

# Elasticsearch Configuration
ELASTICSEARCH_HOST=localhost:9200
ELASTICSEARCH_USER=
ELASTICSEARCH_PASSWORD=

# Celery Configuration
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
```

**Generate SECRET_KEY:**
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 6. Database Setup

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser
# Follow prompts to enter email and password
```

### 7. Elasticsearch Setup

```bash
# Create Elasticsearch index
python manage.py search_index --create

# Populate index with existing data (if any)
python manage.py search_index --populate

# Verify index creation
curl http://localhost:9200/_cat/indices?v
```

### 8. Load Sample Data (Optional)

Create a management command or use Django shell:

```bash
python manage.py shell
```

```python
from colleges.models import College, Degree
from exams.models import Exam

# Create sample exam
exam = Exam.objects.create(
    code='JEE',
    name='Joint Entrance Examination',
    overview='National level engineering entrance exam',
    eligibility='12th pass with PCM',
    pattern='Multiple choice questions',
    application_url='https://jeemain.nta.nic.in/'
)

# Create sample degree
degree = Degree.objects.create(
    name='B.Tech Computer Science',
    degree_type='ug',
    duration_years=4
)

# Create sample college
college = College.objects.create(
    name='Indian Institute of Technology, Delhi',
    description='Premier engineering institute',
    state='Delhi',
    city='New Delhi',
    type='government',
    fees_annual=200000,
    restart_score=95,
    status='published',
    website_url='https://www.iitd.ac.in/'
)

# Add exam to college
college.exams_required.add(exam)

print("Sample data created successfully!")
```

### 9. Run the Development Server

```bash
# Start Django development server
python manage.py runserver

# Server will be available at: http://localhost:8000/
# Admin interface: http://localhost:8000/admin/
# API: http://localhost:8000/api/
```

### 10. Start Celery Workers

Open **separate terminal windows** for each:

**Terminal 2 - Celery Worker:**
```bash
cd /Users/arpitsarang/Code/RE_START/backend
source venv/bin/activate
celery -A config worker -l info
```

**Terminal 3 - Celery Beat (Scheduler):**
```bash
cd /Users/arpitsarang/Code/RE_START/backend
source venv/bin/activate
celery -A config beat -l info
```

**Alternative - Combined (Development Only):**
```bash
celery -A config worker -B -l info
```

**Optional - Celery Flower (Monitoring):**
```bash
pip install flower
celery -A config flower
# Access at: http://localhost:5555/
```

## Verification

### 1. Check Services

```bash
# MySQL
mysql -u restart_user -p -e "SHOW DATABASES;"

# Redis
redis-cli ping

# Elasticsearch
curl http://localhost:9200/_cluster/health?pretty

# Django
curl http://localhost:8000/api/
```

### 2. Test API Endpoints

**Register with OTP:**
```bash
curl -X POST http://localhost:8000/api/auth/register-otp/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Search Colleges (Elasticsearch):**
```bash
curl "http://localhost:8000/api/colleges/?q=engineering&state=Delhi"
```

**Get Exams:**
```bash
curl http://localhost:8000/api/exams/
```

### 3. Access Admin Interface

1. Navigate to: http://localhost:8000/admin/
2. Login with superuser credentials
3. Explore:
   - Users management
   - Colleges with import/export
   - Exams management
   - Review moderation queue

## API Endpoints Reference

### Authentication
- `POST /api/auth/register-otp/` - Request OTP
- `POST /api/auth/verify-otp/` - Verify OTP and login
- `POST /api/auth/google/` - Google OAuth login
- `POST /api/auth/token/refresh/` - Refresh JWT token

### User Profile
- `GET /api/me/` - Get profile
- `PATCH /api/me/` - Update profile
- `POST /api/me/request-data-export/` - Request data export
- `DELETE /api/me/delete-account/` - Delete account

### Colleges (Elasticsearch-powered)
- `GET /api/colleges/` - Search colleges
- `GET /api/colleges/:id/` - Get college details
- `GET /api/colleges/:id/scholarships/` - Get scholarships
- `GET /api/colleges/:id/important_dates/` - Get dates
- `GET /api/colleges/:id/reviews/` - Get reviews

### Exams
- `GET /api/exams/` - List exams
- `GET /api/exams/:id/` - Get exam details
- `GET /api/exams/:id/dates/` - Get exam dates
- `GET /api/exams/:id/colleges/` - Get colleges

### Prep Plans
- `GET /api/prep/plans/` - List prep plans
- `POST /api/prep/plans/` - Create prep plan
- `GET /api/prep/plans/:id/` - Get plan details
- `GET /api/prep/plans/:id/weeks/` - Get weekly tasks

### Saved Colleges
- `GET /api/saved/` - List saved colleges
- `POST /api/saved/` - Save college
- `DELETE /api/saved/:id/` - Remove saved college

### Reminders
- `GET /api/reminders/` - List reminders
- `POST /api/reminders/` - Create reminder
- `DELETE /api/reminders/:id/` - Delete reminder

### Reviews
- `GET /api/reviews/` - List reviews
- `POST /api/reviews/` - Submit review
- `GET /api/reviews/pending/` - Pending reviews (admin)
- `POST /api/reviews/:id/moderate/` - Moderate review (admin)

## Troubleshooting

### MySQL Connection Error

**Error:** `django.db.utils.OperationalError: (2002, "Can't connect to MySQL server")`

**Solution:**
```bash
# Check MySQL is running
brew services list | grep mysql  # macOS
sudo systemctl status mysql      # Linux

# Restart MySQL
brew services restart mysql      # macOS
sudo systemctl restart mysql     # Linux

# Verify credentials in .env file
```

### Elasticsearch Connection Error

**Error:** `ConnectionError: Connection refused`

**Solution:**
```bash
# Check Elasticsearch is running
curl http://localhost:9200

# Start Elasticsearch
brew services start elastic/tap/elasticsearch-full  # macOS
sudo systemctl start elasticsearch                   # Linux

# Check logs
tail -f /usr/local/var/log/elasticsearch.log  # macOS
sudo journalctl -u elasticsearch -f           # Linux
```

### Redis Connection Error

**Error:** `redis.exceptions.ConnectionError`

**Solution:**
```bash
# Check Redis is running
redis-cli ping

# Start Redis
brew services start redis        # macOS
sudo systemctl start redis       # Linux
```

### Celery Tasks Not Running

**Solution:**
```bash
# Ensure Celery worker is running
celery -A config inspect active

# Check Celery logs for errors
celery -A config worker -l debug

# Verify Redis broker connection
redis-cli ping
```

### Migration Errors

**Error:** `django.db.migrations.exceptions.InconsistentMigrationHistory`

**Solution:**
```bash
# Reset migrations (CAUTION: Development only)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete

# Recreate migrations
python manage.py makemigrations
python manage.py migrate
```

### Elasticsearch Index Issues

**Solution:**
```bash
# Delete and recreate index
python manage.py search_index --delete -f
python manage.py search_index --create
python manage.py search_index --populate

# Check index health
curl http://localhost:9200/colleges/_search?pretty
```

### Import Errors

**Error:** `ModuleNotFoundError: No module named 'X'`

**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# If specific package is missing
pip install package_name
```

## Development Workflow

### Making Model Changes

```bash
# 1. Edit models.py
# 2. Create migrations
python manage.py makemigrations

# 3. Review migration file
cat app_name/migrations/0001_initial.py

# 4. Apply migrations
python manage.py migrate

# 5. Update Elasticsearch index if College model changed
python manage.py search_index --rebuild -f --models colleges.College
```

### Adding New API Endpoints

1. Create serializer in `serializers.py`
2. Create view in `views.py`
3. Add URL pattern in `urls.py` or router
4. Test endpoint with curl or Postman

### Creating Celery Tasks

1. Create task in `tasks.py`:
```python
from celery import shared_task

@shared_task
def my_task(arg):
    # Task logic
    return result
```

2. Call task asynchronously:
```python
from app.tasks import my_task
my_task.delay(arg)
```

3. Test task:
```bash
python manage.py shell
>>> from app.tasks import my_task
>>> result = my_task.delay(arg)
>>> result.get()
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Set `DEBUG=False` in `.env`
- [ ] Configure `ALLOWED_HOSTS` in `settings.py`
- [ ] Use strong `SECRET_KEY`
- [ ] Setup MySQL with read replicas
- [ ] Configure Elasticsearch cluster (3+ nodes)
- [ ] Setup Redis Sentinel or Cluster
- [ ] Use production WSGI server (Gunicorn)
- [ ] Configure Nginx as reverse proxy
- [ ] Setup SSL/TLS certificates
- [ ] Configure CORS for production frontend
- [ ] Setup monitoring (Sentry, New Relic)
- [ ] Configure log aggregation
- [ ] Setup automated backups
- [ ] Configure CDN for static files
- [ ] Setup CI/CD pipeline

### Production Server Setup (Example with Gunicorn)

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4

# With supervisor for process management
sudo apt install supervisor

# Create supervisor config
sudo nano /etc/supervisor/conf.d/restart.conf
```

**Supervisor Config:**
```ini
[program:restart_django]
command=/path/to/venv/bin/gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
directory=/path/to/backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/restart/django.log

[program:restart_celery]
command=/path/to/venv/bin/celery -A config worker -l info
directory=/path/to/backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/restart/celery.log

[program:restart_celery_beat]
command=/path/to/venv/bin/celery -A config beat -l info
directory=/path/to/backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/restart/celery_beat.log
```

## Additional Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **DRF Documentation**: https://www.django-rest-framework.org/
- **Elasticsearch DSL**: https://elasticsearch-dsl.readthedocs.io/
- **Celery Documentation**: https://docs.celeryproject.org/
- **MySQL Documentation**: https://dev.mysql.com/doc/

## Support

For issues or questions:
1. Check `ARCHITECTURE.md` for system design
2. Review troubleshooting section above
3. Check application logs
4. Contact development team

---

**Setup Version**: 2.0  
**Last Updated**: 2025-01-22  
**Compatible with**: Django 5.0, Python 3.8+
