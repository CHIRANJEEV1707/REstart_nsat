#!/bin/bash

# REstart Backend Verification Script
# This script checks if all backend components are working correctly

set -e

echo "🔍 REstart Backend Verification"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running from correct directory
if [ ! -f "manage.py" ]; then
    print_error "Please run this script from the backend directory"
    exit 1
fi

echo "1. Checking Services"
echo "--------------------"

# Check MySQL
if brew services list | grep -q "mysql.*started"; then
    print_success "MySQL is running"
    
    # Test connection
    if mysql -u restart_user -prestart_password -e "USE restart_db;" 2>/dev/null; then
        print_success "MySQL database 'restart_db' is accessible"
    else
        print_warning "MySQL database connection failed. Run setup first."
    fi
else
    print_error "MySQL is not running. Start with: brew services start mysql"
fi

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is running"
else
    print_error "Redis is not running. Start with: brew services start redis"
fi

# Check Elasticsearch
if curl -s http://localhost:9200 > /dev/null 2>&1; then
    ES_VERSION=$(curl -s http://localhost:9200 | grep -o '"number" : "[^"]*"' | cut -d'"' -f4)
    print_success "Elasticsearch is running (version: $ES_VERSION)"
else
    print_error "Elasticsearch is not running. Start with: brew services start elastic/tap/elasticsearch-full"
fi

echo ""
echo "2. Checking Python Environment"
echo "-------------------------------"

# Check virtual environment
if [ -d "venv" ]; then
    print_success "Virtual environment exists"
    
    # Activate and check Python
    source venv/bin/activate
    PYTHON_VERSION=$(python --version 2>&1)
    print_success "Python: $PYTHON_VERSION"
    
    # Check Django
    if python -c "import django" 2>/dev/null; then
        DJANGO_VERSION=$(python -c "import django; print(django.get_version())")
        print_success "Django installed: $DJANGO_VERSION"
    else
        print_error "Django not installed. Run: pip install -r requirements.txt"
    fi
    
    # Check key packages
    for package in "rest_framework" "elasticsearch" "celery" "redis"; do
        if python -c "import $package" 2>/dev/null; then
            print_success "$package installed"
        else
            print_warning "$package not installed"
        fi
    done
else
    print_error "Virtual environment not found. Create with: python3 -m venv venv"
fi

echo ""
echo "3. Checking Configuration"
echo "-------------------------"

# Check .env file
if [ -f ".env" ]; then
    print_success ".env file exists"
    
    # Check critical variables
    if grep -q "SECRET_KEY=" .env && ! grep -q "SECRET_KEY=your_secret_key_here" .env; then
        print_success "SECRET_KEY is configured"
    else
        print_warning "SECRET_KEY needs to be set in .env"
    fi
    
    if grep -q "DB_PASSWORD=" .env && ! grep -q "DB_PASSWORD=your_mysql_password_here" .env; then
        print_success "Database credentials configured"
    else
        print_warning "Database credentials need to be set in .env"
    fi
else
    print_error ".env file not found. Copy from .env.example"
fi

echo ""
echo "4. Checking Database"
echo "--------------------"

if [ -d "venv" ]; then
    source venv/bin/activate
    
    # Check migrations
    if python manage.py showmigrations 2>/dev/null | grep -q "\[X\]"; then
        print_success "Database migrations applied"
    else
        print_warning "Database migrations not applied. Run: python manage.py migrate"
    fi
    
    # Check if tables exist
    if mysql -u restart_user -prestart_password restart_db -e "SHOW TABLES;" 2>/dev/null | grep -q "users_user"; then
        print_success "Database tables exist"
        
        # Count tables
        TABLE_COUNT=$(mysql -u restart_user -prestart_password restart_db -e "SHOW TABLES;" 2>/dev/null | wc -l)
        print_info "Total tables: $((TABLE_COUNT - 1))"
    else
        print_warning "Database tables not found. Run migrations."
    fi
fi

echo ""
echo "5. Checking Elasticsearch Index"
echo "--------------------------------"

if curl -s http://localhost:9200/_cat/indices 2>/dev/null | grep -q "colleges"; then
    print_success "Elasticsearch 'colleges' index exists"
    
    # Get document count
    DOC_COUNT=$(curl -s http://localhost:9200/colleges/_count 2>/dev/null | grep -o '"count":[0-9]*' | cut -d':' -f2)
    print_info "Documents in index: $DOC_COUNT"
else
    print_warning "Elasticsearch index not created. Run: python manage.py search_index --create"
fi

echo ""
echo "6. Testing Django Server"
echo "------------------------"

if [ -d "venv" ]; then
    source venv/bin/activate
    
    # Check if server is running
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        print_success "Django server is running on port 8000"
        
        # Test API endpoint
        if curl -s http://localhost:8000/api/ > /dev/null 2>&1; then
            print_success "API is accessible at /api/"
        else
            print_warning "API endpoint not responding"
        fi
        
        # Test admin
        if curl -s http://localhost:8000/admin/ > /dev/null 2>&1; then
            print_success "Admin panel is accessible at /admin/"
        else
            print_warning "Admin panel not responding"
        fi
    else
        print_info "Django server is not running"
        print_info "Start with: python manage.py runserver"
    fi
fi

echo ""
echo "7. Testing Celery"
echo "-----------------"

# Check if Celery worker is running
if pgrep -f "celery.*worker" > /dev/null; then
    print_success "Celery worker is running"
else
    print_info "Celery worker is not running"
    print_info "Start with: celery -A config worker -l info"
fi

# Check if Celery beat is running
if pgrep -f "celery.*beat" > /dev/null; then
    print_success "Celery beat is running"
else
    print_info "Celery beat is not running"
    print_info "Start with: celery -A config beat -l info"
fi

echo ""
echo "8. Quick API Test"
echo "-----------------"

if curl -s http://localhost:8000 > /dev/null 2>&1; then
    # Test authentication endpoint
    RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8000/api/auth/register-otp/)
    if [ "$RESPONSE" == "405" ] || [ "$RESPONSE" == "400" ]; then
        print_success "Authentication endpoint responding"
    else
        print_warning "Authentication endpoint returned: $RESPONSE"
    fi
    
    # Test colleges endpoint
    RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8000/api/colleges/)
    if [ "$RESPONSE" == "200" ]; then
        print_success "Colleges endpoint responding"
    else
        print_warning "Colleges endpoint returned: $RESPONSE"
    fi
    
    # Test exams endpoint
    RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8000/api/exams/)
    if [ "$RESPONSE" == "200" ]; then
        print_success "Exams endpoint responding"
    else
        print_warning "Exams endpoint returned: $RESPONSE"
    fi
else
    print_info "Django server not running - skipping API tests"
fi

echo ""
echo "9. Summary"
echo "----------"

# Count successes and errors
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Service checks
if brew services list | grep -q "mysql.*started"; then ((PASSED_CHECKS++)); fi
((TOTAL_CHECKS++))

if redis-cli ping > /dev/null 2>&1; then ((PASSED_CHECKS++)); fi
((TOTAL_CHECKS++))

if curl -s http://localhost:9200 > /dev/null 2>&1; then ((PASSED_CHECKS++)); fi
((TOTAL_CHECKS++))

# Environment checks
if [ -d "venv" ]; then ((PASSED_CHECKS++)); fi
((TOTAL_CHECKS++))

if [ -f ".env" ]; then ((PASSED_CHECKS++)); fi
((TOTAL_CHECKS++))

echo ""
print_info "Checks passed: $PASSED_CHECKS/$TOTAL_CHECKS"

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    echo ""
    print_success "🎉 All checks passed! Your backend is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Start Django: python manage.py runserver"
    echo "2. Start Celery: celery -A config worker -l info"
    echo "3. Visit: http://localhost:8000/admin/"
else
    echo ""
    print_warning "Some checks failed. Review the output above."
    echo ""
    echo "Common fixes:"
    echo "1. Run setup: ./setup.sh"
    echo "2. Start services: brew services start mysql redis"
    echo "3. Install dependencies: pip install -r requirements.txt"
    echo "4. Run migrations: python manage.py migrate"
fi

echo ""
