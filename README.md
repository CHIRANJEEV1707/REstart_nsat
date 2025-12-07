# REstart Web App

<div align="center">

![REstart Logo](https://via.placeholder.com/200x200?text=REstart)

**Empowering students to discover their perfect college, prepare for exams, and plan their future with confidence.**

</div>

REstart is a comprehensive web application that helps PCM (Physics, Chemistry, Math) students discover engineering colleges, understand admission criteria and timelines, and access structured preparation guidance. The platform provides personalized college recommendations, exam preparation resources, and career planning tools.

This repository contains the full-stack implementation of REstart, including the Django backend (API + PostgreSQL database) and Next.js frontend (React + Tailwind CSS).

---

## Features

### Authentication System
- Multiple authentication methods:
  - Email OTP verification
  - Google OAuth integration
  - GitHub OAuth integration
  - Email/Password authentication
- JWT-based session management
- Protected routes and middleware
- User profile management

### College Discovery
- Advanced filtering and search
- Interactive college cards
- Responsive grid layout
- Loading skeletons and animations

### College Details
- Comprehensive college profiles
- Fee structure and scholarships
- Exam requirements and deadlines
- Interactive UI with animations

### Exams Module
- Exam information (JEE Main, JEE Advanced, State CETs)
- Important dates and deadlines
- Syllabus and pattern details
- Preparation resources

### User Dashboard
- Personalized overview
- Saved colleges management
- Exam preparation tracking
- Profile settings

### Additional Features
- Dark/Light theme toggle
- Responsive design for all devices
- Animated UI components
- Toast notifications

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Authentication**: NextAuth.js
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form
- **API Client**: Axios

### Backend
- **Framework**: Django 4.2 with Django REST Framework
- **Language**: Python
- **Authentication**: JWT with Simple JWT
- **Email**: SMTP integration for OTP

### Database
- **Primary Database**: PostgreSQL
- **Caching**: Redis (for OTP and session data)

### DevOps
- **Version Control**: Git
- **Deployment**: Vercel (frontend), Render (backend)

---

## Database Schema (Relational)

```mermaid
erDiagram

    USERS {
        uuid id PK
        string name
        string email
        string auth_provider
        string state
        int class_level
        string target_degree
        int budget_min
        int budget_max
        timestamp created_at
        timestamp updated_at
    }

    COLLEGES {
        uuid id PK
        string name
        string description
        string state
        string city
        float location_lat
        float location_lng
        string type
        int fees_annual
        int fees_hostel
        int restart_score
        int ratings_count
        float reviews_avg
        string website_url
        timestamp created_at
        timestamp updated_at
    }

    EXAMS {
        uuid id PK
        string code
        string name
        text overview
        text eligibility
        text pattern
        text syllabus_summary
        string application_url
        timestamp created_at
        timestamp updated_at
    }

    EXAM_DATES {
        uuid id PK
        uuid exam_id FK
        string type
        date date
    }

    COLLEGE_EXAMS {
        uuid college_id FK
        uuid exam_id FK
    }

    COLLEGE_DEGREES {
        uuid id PK
        uuid college_id FK
        string degree
    }

    SCHOLARSHIPS {
        uuid id PK
        uuid college_id FK
        string name
        text criteria
    }

    PREP_PLANS {
        uuid id PK
        uuid user_id FK
        uuid exam_id FK
        string status
        timestamp created_at
        timestamp updated_at
    }

    PREP_WEEKS {
        uuid id PK
        uuid prep_plan_id FK
        int week_number
        json tasks
    }

    SAVED_COLLEGES {
        uuid user_id FK
        uuid college_id FK
        timestamp created_at
    }

    REMINDERS {
        uuid id PK
        uuid user_id FK
        string type
        uuid target_id
        string channels
        timestamp created_at
    }

    REVIEWS {
        uuid id PK
        uuid user_id FK
        uuid college_id FK
        int rating
        string title
        text body
        json tags
        string status
        timestamp created_at
    }

    USERS ||--o{ PREP_PLANS : has
    USERS ||--o{ SAVED_COLLEGES : saves
    USERS ||--o{ REMINDERS : subscribes
    USERS ||--o{ REVIEWS : writes
    COLLEGES ||--o{ COLLEGE_EXAMS : requires
    COLLEGES ||--o{ COLLEGE_DEGREES : offers
    COLLEGES ||--o{ SCHOLARSHIPS : provides
    COLLEGES ||--o{ REVIEWS : receives
    COLLEGES ||--o{ SAVED_COLLEGES : shortlisted_by
    EXAMS ||--o{ EXAM_DATES : has
    EXAMS ||--o{ COLLEGE_EXAMS : required_for
    EXAMS ||--o{ PREP_PLANS : targeted_by
    PREP_PLANS ||--o{ PREP_WEEKS : contains
````

---

## Setup Instructions

### Prerequisites

- Python 3.8+ and pip
- Node.js 18+ and npm
- PostgreSQL 12+
- Redis (optional, for OTP caching)

### Backend Setup

1. Clone this repository:

   ```bash
   git clone https://github.com/CodeMaverick-143/RE_START.git
   cd RE_START
   ```

2. Set up Python virtual environment:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and OAuth keys
   ```

4. Run database migrations:

   ```bash
   python manage.py migrate
   ```

5. Create a superuser:

   ```bash
   python manage.py createsuperuser
   ```

6. Start the development server:

   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   ```bash
   cp env.example .env.local
   # Edit .env.local with your OAuth credentials and API URL
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin interface: http://localhost:8000/admin

---

## Project Structure

### Backend Structure

```
backend/
├── core/                 # Core application with auth and base models
│   ├── auth_views.py     # Authentication endpoints
│   ├── login_views.py    # Login endpoints
│   ├── models.py         # Database models
│   ├── serializers.py    # API serializers
│   └── urls.py           # API URL routing
├── colleges/             # Colleges module
├── exams/                # Exams module
├── guidance/             # Prep guidance module
├── interactions/         # User interactions (saved, reminders)
├── config/               # Project configuration
└── manage.py            # Django management script
```

### Frontend Structure

```
frontend/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication pages
│   │   ├── signin/       # Sign-in page
│   │   ├── signup/       # Sign-up page
│   │   └── error/        # Auth error page
│   ├── api/              # API routes
│   │   └── auth/         # NextAuth configuration
│   ├── dashboard/        # Protected dashboard pages
│   │   └── profile/      # User profile page
│   ├── college/          # College pages
│   └── exams/            # Exams pages
├── components/           # Reusable components
│   ├── dashboard/        # Dashboard components
│   ├── shared/           # Shared components
│   └── ui/               # UI components
├── lib/                  # Utility functions
└── providers/            # Context providers
```

## Roadmap

### Phase 1: Core Platform (Current)
- ✅ Authentication system
- ✅ Database schema
- ✅ API endpoints
- ✅ Frontend UI components
- ✅ Dashboard interface

### Phase 2: Content & Features
- College data integration
- Exam information
- Search and filtering
- User preferences

### Phase 3: Advanced Features
- Prep guidance system
- Reminders and notifications
- Reviews and ratings
- Analytics dashboard

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- [CodeMaverick-143](https://github.com/CodeMaverick-143)

---

