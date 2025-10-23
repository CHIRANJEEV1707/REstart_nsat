# How to Check Your Backend

Quick guide to verify your REstart backend is working correctly.

## 🚀 Quick Check (30 seconds)

Run the verification script:

```bash
cd /Users/arpitsarang/Code/RE_START/backend
./verify_backend.sh
```

This will check:
- ✅ All services (MySQL, Redis, Elasticsearch)
- ✅ Python environment and packages
- ✅ Database configuration
- ✅ API endpoints
- ✅ Celery workers

## 📋 Manual Verification Steps

### 1. Check Services Are Running

```bash
# Check all Homebrew services
brew services list

# Should show:
# mysql              started
# redis              started
# elasticsearch-full started
```

**Fix if not running:**
```bash
brew services start mysql
brew services start redis
brew services start elastic/tap/elasticsearch-full
```

### 2. Test Individual Services

**MySQL:**
```bash
mysql -u restart_user -prestart_password -e "SHOW DATABASES;"
# Should list 'restart_db'
```

**Redis:**
```bash
redis-cli ping
# Should return: PONG
```

**Elasticsearch:**
```bash
curl http://localhost:9200
# Should return JSON with cluster info
```

### 3. Check Python Environment

```bash
cd /Users/arpitsarang/Code/RE_START/backend
source venv/bin/activate
python --version
# Should show: Python 3.13.x

pip list | grep -E "Django|djangorestframework|celery|elasticsearch"
# Should show all packages installed
```

**Fix if packages missing:**
```bash
pip install -r requirements.txt
```

### 4. Check Database Setup

```bash
source venv/bin/activate

# Check migrations
python manage.py showmigrations

# Should show [X] for applied migrations
# If not, run:
python manage.py migrate
```

**Check tables exist:**
```bash
mysql -u restart_user -prestart_password restart_db -e "SHOW TABLES;"
# Should list tables like: users_user, colleges_college, etc.
```

### 5. Check Elasticsearch Index

```bash
curl http://localhost:9200/_cat/indices
# Should show 'colleges' index

# Check document count
curl http://localhost:9200/colleges/_count
```

**Fix if index missing:**
```bash
python manage.py search_index --create
```

### 6. Start and Test Django Server

```bash
source venv/bin/activate
python manage.py runserver
```

**In another terminal, test:**
```bash
# Test API root
curl http://localhost:8000/api/
# Should return JSON with available endpoints

# Test admin
curl http://localhost:8000/admin/
# Should return HTML

# Test colleges endpoint
curl http://localhost:8000/api/colleges/
# Should return JSON (empty list if no data)

# Test exams endpoint
curl http://localhost:8000/api/exams/
# Should return JSON
```

### 7. Check Celery (Optional)

**Terminal 2 - Start Worker:**
```bash
cd /Users/arpitsarang/Code/RE_START/backend
source venv/bin/activate
celery -A config worker -l info
```

**Terminal 3 - Start Beat:**
```bash
cd /Users/arpitsarang/Code/RE_START/backend
source venv/bin/activate
celery -A config beat -l info
```

**Check if running:**
```bash
ps aux | grep celery
# Should show worker and beat processes
```

## 🎯 Complete Test Checklist

Use this checklist to verify everything:

- [ ] **Services Running**
  - [ ] MySQL started
  - [ ] Redis started  
  - [ ] Elasticsearch started

- [ ] **Environment Setup**
  - [ ] Virtual environment exists
  - [ ] All Python packages installed
  - [ ] .env file configured

- [ ] **Database**
  - [ ] Database 'restart_db' exists
  - [ ] Migrations applied
  - [ ] Tables created

- [ ] **Elasticsearch**
  - [ ] Service running
  - [ ] Index created

- [ ] **Django Server**
  - [ ] Server starts without errors
  - [ ] API endpoints respond
  - [ ] Admin panel accessible

- [ ] **Celery (Optional)**
  - [ ] Worker running
  - [ ] Beat scheduler running

## 🧪 Test API Endpoints

### Test Authentication

```bash
# Request OTP
curl -X POST http://localhost:8000/api/auth/register-otp/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Should return: {"message": "OTP sent successfully..."}
```

### Test College Search

```bash
# Search colleges
curl "http://localhost:8000/api/colleges/?q=engineering"

# Should return JSON with results (empty if no data)
```

### Test Exams

```bash
# List exams
curl http://localhost:8000/api/exams/

# Should return JSON array
```

## 🔍 Check Logs

### Django Logs
```bash
# Run server with verbose output
python manage.py runserver --verbosity 2
```

### Celery Logs
```bash
# Worker with debug level
celery -A config worker -l debug

# Beat with debug level
celery -A config beat -l debug
```

### Service Logs
```bash
# MySQL logs
tail -f /opt/homebrew/var/mysql/$(hostname).err

# Redis logs
tail -f /opt/homebrew/var/log/redis.log

# Elasticsearch logs
tail -f /opt/homebrew/var/log/elasticsearch.log
```

## 🐛 Common Issues & Fixes

### Issue: "Port 8000 already in use"

```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9

# Or use different port
python manage.py runserver 8001
```

### Issue: "MySQL connection refused"

```bash
# Check MySQL is running
brew services list | grep mysql

# Restart MySQL
brew services restart mysql

# Check credentials in .env file
cat .env | grep DB_
```

### Issue: "Elasticsearch connection error"

```bash
# Check if running
curl http://localhost:9200

# Start Elasticsearch
brew services start elastic/tap/elasticsearch-full

# Wait 30 seconds for startup
sleep 30

# Check again
curl http://localhost:9200
```

### Issue: "Redis connection error"

```bash
# Check Redis
redis-cli ping

# Start Redis
brew services start redis

# Test again
redis-cli ping
```

### Issue: "Module not found"

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "No migrations to apply"

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

## ✅ Success Indicators

Your backend is working correctly if:

1. ✅ All services show "started" in `brew services list`
2. ✅ `./verify_backend.sh` shows "All checks passed"
3. ✅ Django server starts without errors
4. ✅ API endpoints return JSON responses
5. ✅ Admin panel loads at http://localhost:8000/admin/
6. ✅ No error messages in terminal

## 📊 Expected Output

### Successful Server Start

```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
January 23, 2025 - 04:15:00
Django version 5.0.1, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### Successful API Response

```json
{
  "colleges": "http://localhost:8000/api/colleges/",
  "exams": "http://localhost:8000/api/exams/",
  "prep": "http://localhost:8000/api/prep/plans/",
  "saved": "http://localhost:8000/api/saved/",
  "reminders": "http://localhost:8000/api/reminders/",
  "reviews": "http://localhost:8000/api/reviews/"
}
```

## 🎉 Next Steps After Verification

Once everything is working:

1. **Create Superuser:**
   ```bash
   python manage.py createsuperuser
   ```

2. **Access Admin Panel:**
   - Go to: http://localhost:8000/admin/
   - Login with superuser credentials

3. **Add Sample Data:**
   - Use admin panel to add colleges, exams, degrees
   - Or run sample data script from QUICKSTART.md

4. **Test API:**
   - Use Postman or curl
   - Check API_DOCUMENTATION.md for examples

5. **Start Development:**
   - Read ARCHITECTURE.md for system design
   - Check models in each app's models.py
   - Review API endpoints in views.py

## 📞 Need Help?

- **Verification Script**: `./verify_backend.sh`
- **Quick Start**: `QUICKSTART.md`
- **Detailed Setup**: `SETUP_NEW.md`
- **Architecture**: `ARCHITECTURE.md`
- **API Docs**: `API_DOCUMENTATION.md`

---

**Quick Command Reference:**

```bash
# Verify everything
./verify_backend.sh

# Start Django
python manage.py runserver

# Start Celery
celery -A config worker -l info

# Check services
brew services list

# Test API
curl http://localhost:8000/api/
```
