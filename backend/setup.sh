#!/bin/bash

# REstart Backend Setup Script
# This script will guide you through the complete backend setup

set -e  # Exit on error

echo "🚀 REstart Backend Setup"
echo "========================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running from correct directory
if [ ! -f "manage.py" ]; then
    print_error "Please run this script from the backend directory"
    exit 1
fi

echo "Step 1: Checking prerequisites..."
echo "-----------------------------------"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python installed: $PYTHON_VERSION"
else
    print_error "Python 3 is not installed"
    exit 1
fi

# Check MySQL
if command -v mysql &> /dev/null; then
    print_success "MySQL installed"
else
    print_error "MySQL is not installed. Install with: brew install mysql"
    exit 1
fi

# Check Redis
if command -v redis-server &> /dev/null; then
    print_success "Redis installed"
else
    print_info "Redis not found. Installing..."
    brew install redis
    print_success "Redis installed"
fi

# Check Elasticsearch
if curl -s http://localhost:9200 > /dev/null 2>&1; then
    print_success "Elasticsearch is running"
else
    print_info "Elasticsearch not running. Checking if installed..."
    if command -v elasticsearch &> /dev/null; then
        print_info "Starting Elasticsearch..."
        brew services start elastic/tap/elasticsearch-full
        sleep 5
    else
        print_info "Installing Elasticsearch..."
        brew tap elastic/tap
        brew install elastic/tap/elasticsearch-full
        brew services start elastic/tap/elasticsearch-full
        sleep 10
    fi
fi

echo ""
echo "Step 2: Setting up virtual environment..."
echo "------------------------------------------"

# Activate virtual environment
if [ -d "venv" ]; then
    print_success "Virtual environment exists"
else
    print_info "Creating virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

source venv/bin/activate
print_success "Virtual environment activated"

echo ""
echo "Step 3: Installing Python dependencies..."
echo "------------------------------------------"

pip install --upgrade pip > /dev/null 2>&1
print_success "pip upgraded"

print_info "Installing dependencies (this may take a few minutes)..."
pip install -r requirements.txt > /dev/null 2>&1
print_success "Dependencies installed"

echo ""
echo "Step 4: Configuring environment..."
echo "-----------------------------------"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    cp .env.example .env
    
    # Generate SECRET_KEY
    SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
    
    # Update .env with generated SECRET_KEY
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/SECRET_KEY=your_secret_key_here/SECRET_KEY=$SECRET_KEY/" .env
    else
        sed -i "s/SECRET_KEY=your_secret_key_here/SECRET_KEY=$SECRET_KEY/" .env
    fi
    
    print_success ".env file created with generated SECRET_KEY"
    print_info "Please edit .env file to add your database credentials and other settings"
else
    print_success ".env file already exists"
fi

echo ""
echo "Step 5: Setting up MySQL database..."
echo "-------------------------------------"

# Start MySQL if not running
brew services start mysql > /dev/null 2>&1 || true

print_info "Please enter MySQL root password (press Enter if no password):"
read -s MYSQL_ROOT_PASSWORD

# Create database
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS restart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || print_info "Database might already exist"
    mysql -u root -e "CREATE USER IF NOT EXISTS 'restart_user'@'localhost' IDENTIFIED BY 'restart_password';" 2>/dev/null || true
    mysql -u root -e "GRANT ALL PRIVILEGES ON restart_db.* TO 'restart_user'@'localhost';" 2>/dev/null
    mysql -u root -e "FLUSH PRIVILEGES;" 2>/dev/null
else
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS restart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || print_info "Database might already exist"
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "CREATE USER IF NOT EXISTS 'restart_user'@'localhost' IDENTIFIED BY 'restart_password';" 2>/dev/null || true
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "GRANT ALL PRIVILEGES ON restart_db.* TO 'restart_user'@'localhost';" 2>/dev/null
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "FLUSH PRIVILEGES;" 2>/dev/null
fi

print_success "MySQL database 'restart_db' created"
print_success "MySQL user 'restart_user' created"

# Update .env with database credentials
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/DB_PASSWORD=your_mysql_password_here/DB_PASSWORD=restart_password/" .env
    sed -i '' "s/DB_USER=root/DB_USER=restart_user/" .env
else
    sed -i "s/DB_PASSWORD=your_mysql_password_here/DB_PASSWORD=restart_password/" .env
    sed -i "s/DB_USER=root/DB_USER=restart_user/" .env
fi

echo ""
echo "Step 6: Starting Redis..."
echo "-------------------------"

brew services start redis > /dev/null 2>&1 || true
sleep 2

if redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is running"
else
    print_error "Failed to start Redis"
fi

echo ""
echo "Step 7: Running database migrations..."
echo "---------------------------------------"

python manage.py makemigrations
python manage.py migrate

print_success "Database migrations completed"

echo ""
echo "Step 8: Creating Elasticsearch index..."
echo "----------------------------------------"

# Wait for Elasticsearch to be ready
print_info "Waiting for Elasticsearch to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:9200 > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

if curl -s http://localhost:9200 > /dev/null 2>&1; then
    python manage.py search_index --create 2>/dev/null || print_info "Index might already exist"
    print_success "Elasticsearch index created"
else
    print_error "Elasticsearch is not responding. Please start it manually and run: python manage.py search_index --create"
fi

echo ""
echo "Step 9: Creating superuser..."
echo "------------------------------"

print_info "Please create an admin account:"
python manage.py createsuperuser

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "🎉 Your REstart backend is ready!"
echo ""
echo "Next steps:"
echo "1. Start the Django server:"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
echo ""
echo "2. In separate terminals, start Celery:"
echo "   Terminal 2: celery -A config worker -l info"
echo "   Terminal 3: celery -A config beat -l info"
echo ""
echo "3. Access your application:"
echo "   - API: http://localhost:8000/api/"
echo "   - Admin: http://localhost:8000/admin/"
echo ""
echo "4. Check the documentation:"
echo "   - README.md - Quick start"
echo "   - SETUP_NEW.md - Detailed setup"
echo "   - API_DOCUMENTATION.md - API reference"
echo "   - ARCHITECTURE.md - System design"
echo ""
print_success "Happy coding! 🚀"
