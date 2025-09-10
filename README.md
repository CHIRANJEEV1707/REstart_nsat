# REstart Web App

REstart is a web application that helps PCM (Physics, Chemistry, Math) students discover engineering colleges, understand admission criteria and timelines, and access structured preparation guidance.

This repository contains the MVP implementation of REstart, including the backend (API + database) and frontend (Next.js + Tailwind).

---

## Features (MVP)

- Authentication (Email OTP / Google)
- College Discovery & Filters
- College Detail Pages (Overview, Fees, Scholarships, Dates, Exams)
- Exams Module (JEE Main, JEE Advanced, State CETs)
- Prep Guidance (PCM Weekly Plans)
- Saved Colleges & Reminders
- Admin CMS for managing colleges, exams, content
- Reviews & Ratings (Phase 2)

---

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind, TanStack Query
- Backend: Node.js (NestJS or Express), TypeScript, REST API
- Database: PostgreSQL (primary), Redis (cache, sessions)
- Search: Postgres FTS / Elastic (optional)
- Auth: NextAuth (Email OTP + Google), JWT (httpOnly cookies)
- Storage: S3-compatible for assets
- Deployment: Vercel (frontend), Render/AWS (backend)

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

1. Clone this repository:

   ```bash
   https://github.com/CodeMaverick-143/RE_START.git
   cd RE_START
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   * Database connection (`DATABASE_URL`)
   * Auth provider keys
   * Email service keys

4. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

5. Start development servers:

   ```bash
   npm run dev
   ```

---

## Roadmap

* Phase 0: Data model, CMS, seed 50 colleges and 3 exams
* Phase 1: Auth, Discovery, College Detail, Exams pages
* Phase 2: Prep Guidance, Saved/Reminders, emails
* Phase 3: Reviews, print-friendly pages, comparisons
--- 

