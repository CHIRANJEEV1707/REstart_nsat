# Quick Start Guide

Get your REstart backend running in 5 minutes!

## Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
./setup.sh
```

This will automatically:
- ✅ Check and install prerequisites (Redis, Elasticsearch)
- ✅ Setup virtual environment
- ✅ Install Python dependencies
- ✅ Create .env file with generated SECRET_KEY
- ✅ Setup MySQL database
- ✅ Run migrations
- ✅ Create Elasticsearch index
- ✅ Prompt for superuser creation

## Option 2: Manual Setup

### 1. Install Prerequisites

```bash
# Install Redis
brew install redis
brew services start redis

# Install Elasticsearch
brew tap elastic/tap
brew install elastic/tap/elasticsearch-full
brew services start elastic/tap/elasticsearch-full

# MySQL should already be installed
brew services start mysql
```

### 2. Setup Python Environment

```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Create .env file
cp .env.example .env

# Generate SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Edit .env and paste the SECRET_KEY
nano .env
```

### 4. Setup MySQL Database

```bash
# Connect to MySQL
mysql -u root

# Run these commands in MySQL:
CREATE DATABASE restart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restart_user'@'localhost' IDENTIFIED BY 'restart_password';
GRANT ALL PRIVILEGES ON restart_db.* TO 'restart_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Update `.env` with database credentials:
```env
DB_USER=restart_user
DB_PASSWORD=restart_password
```

### 5. Initialize Database

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 6. Setup Elasticsearch

```bash
# Create index
python manage.py search_index --create
```

## Running the Application

### Terminal 1: Django Server
```bash
source venv/bin/activate
python manage.py runserver
```

### Terminal 2: Celery Worker
```bash
source venv/bin/activate
celery -A config worker -l info
```

### Terminal 3: Celery Beat (Scheduler)
```bash
source venv/bin/activate
celery -A config beat -l info
```

## Verify Installation

### Check Services

```bash
# MySQL
mysql -u restart_user -p -e "SHOW DATABASES;"

# Redis
redis-cli ping
# Should return: PONG

# Elasticsearch
curl http://localhost:9200
# Should return JSON with cluster info

# Django
curl http://localhost:8000/api/
# Should return API root
```

### Access Points

- **API Root**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **API Docs**: See `API_DOCUMENTATION.md`

### Test API

```bash
# Request OTP
curl -X POST http://localhost:8000/api/auth/register-otp/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Search colleges (after adding data)
curl "http://localhost:8000/api/colleges/?q=engineering"
```

## Load Sample Data

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
    description='Premier engineering institute in India',
    state='Delhi',
    city='New Delhi',
    type='government',
    fees_annual=200000,
    restart_score=95,
    status='published',
    website_url='https://www.iitd.ac.in/'
)

college.exams_required.add(exam)

print("✅ Sample data created!")
```

Then rebuild Elasticsearch index:
```bash
python manage.py search_index --rebuild -f
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
python manage.py runserver 8001
```

### MySQL Connection Error
```bash
# Check MySQL is running
brew services list | grep mysql

# Restart MySQL
brew services restart mysql

# Verify credentials in .env
```

### Elasticsearch Not Running
```bash
# Check status
brew services list | grep elasticsearch

# Start Elasticsearch
brew services start elastic/tap/elasticsearch-full

# Check logs
tail -f /usr/local/var/log/elasticsearch.log
```

### Redis Connection Error
```bash
# Check Redis
redis-cli ping

# Start Redis
brew services start redis
```

### Import Errors
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

## Next Steps

1. ✅ **Read Documentation**
   - `README.md` - Overview
   - `ARCHITECTURE.md` - System design
   - `API_DOCUMENTATION.md` - API reference

2. ✅ **Explore Admin Panel**
   - Go to http://localhost:8000/admin/
   - Login with superuser credentials
   - Add colleges, exams, degrees

3. ✅ **Test API Endpoints**
   - Use Postman or curl
   - Check `API_DOCUMENTATION.md` for examples

4. ✅ **Load Production Data**
   - Use Django admin import feature
   - Or create management commands

5. ✅ **Setup Frontend Integration**
   - Configure CORS in settings
   - Update frontend API base URL

## Common Commands

```bash
# Activate virtual environment
source venv/bin/activate

# Run server
python manage.py runserver

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Django shell
python manage.py shell

# Rebuild Elasticsearch index
python manage.py search_index --rebuild -f

# Run Celery worker
celery -A config worker -l info

# Run Celery beat
celery -A config beat -l info

# Monitor Celery (install flower first)
pip install flower
celery -A config flower
```

## Support

- **Documentation**: Check `SETUP_NEW.md` for detailed setup
- **Architecture**: See `ARCHITECTURE.md` for system design
- **API Reference**: See `API_DOCUMENTATION.md`
- **Issues**: Check troubleshooting section above

---

**Happy Coding! 🚀**
