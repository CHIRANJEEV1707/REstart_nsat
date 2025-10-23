# REstart API Documentation

Complete API reference for the REstart backend.

**Base URL**: `http://localhost:8000/api/`  
**Production URL**: `https://api.restart.com/api/`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Obtain Tokens

#### 1. Email/OTP Authentication

**Request OTP**
```http
POST /api/auth/register-otp/
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully to your email"
}
```

**Verify OTP**
```http
POST /api/auth/verify-otp/
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "",
    "auth_provider": "email",
    "state": "",
    "class_level": null,
    "target_degree": "",
    "budget_min": null,
    "budget_max": null
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "is_new_user": true
}
```

#### 2. Google OAuth Authentication

```http
POST /api/auth/google/
Content-Type: application/json

{
  "access_token": "google_access_token_here",
  "id_token": "google_id_token_here"
}
```

**Response:** Same as OTP verification

#### 3. Refresh Token

```http
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## User Profile

### Get Profile

```http
GET /api/me/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "auth_provider": "email",
  "state": "Delhi",
  "class_level": 12,
  "target_degree": "B.Tech Computer Science",
  "budget_min": 100000,
  "budget_max": 500000,
  "created_at": "2025-01-22T10:30:00Z",
  "updated_at": "2025-01-22T10:30:00Z"
}
```

### Update Profile

```http
PATCH /api/me/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Doe",
  "state": "Delhi",
  "class_level": 12,
  "target_degree": "B.Tech Computer Science",
  "budget_min": 100000,
  "budget_max": 500000
}
```

### Request Data Export (DPDPA Compliance)

```http
POST /api/me/request-data-export/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Your data export request has been received. You will receive an email with your data within 48 hours."
}
```

### Delete Account (DPDPA Compliance)

```http
DELETE /api/me/delete-account/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Your account has been deactivated. All personal data will be deleted within 30 days."
}
```

---

## College Discovery (Elasticsearch-Powered)

### Search Colleges

**⚠️ IMPORTANT**: This endpoint uses Elasticsearch and does NOT hit the MySQL database.

```http
GET /api/colleges/?q=engineering&state=Delhi&fees_max=500000&sort_by=-restart_score
```

**Query Parameters:**
- `q` (string): Search query (searches name and description)
- `state` (string): Filter by state
- `city` (string): Filter by city
- `type` (string): Filter by type (`government`, `private`, `deemed`, `autonomous`)
- `fees_min` (integer): Minimum annual fees
- `fees_max` (integer): Maximum annual fees
- `restart_score_min` (integer): Minimum REstart score (0-100)
- `rating_min` (float): Minimum average rating (0-5)
- `exam` (string): Filter by exam code (e.g., `JEE`, `NEET`)
- `degree` (string): Filter by degree name
- `sort_by` (string): Sort field (`restart_score`, `-restart_score`, `fees_annual`, `-fees_annual`, `name`, `-name`)
- `page` (integer): Page number (default: 1)
- `page_size` (integer): Results per page (default: 20, max: 100)

**Response:**
```json
{
  "count": 150,
  "page": 1,
  "page_size": 20,
  "results": [
    {
      "id": 1,
      "name": "Indian Institute of Technology, Delhi",
      "state": "Delhi",
      "city": "New Delhi",
      "type": "government",
      "fees_annual": 200000,
      "restart_score": 95,
      "reviews_avg": 4.5,
      "ratings_count": 120,
      "website_url": "https://www.iitd.ac.in/"
    }
  ]
}
```

### Get College Details

```http
GET /api/colleges/1/
```

**Response:**
```json
{
  "id": 1,
  "name": "Indian Institute of Technology, Delhi",
  "description": "Premier engineering institute...",
  "status": "published",
  "state": "Delhi",
  "city": "New Delhi",
  "location_lat": 28.5449,
  "location_lng": 77.1926,
  "accreditation": ["NAAC A++", "NBA"],
  "type": "government",
  "fees_annual": 200000,
  "fees_hostel": 50000,
  "restart_score": 95,
  "ratings_count": 120,
  "reviews_avg": 4.5,
  "website_url": "https://www.iitd.ac.in/",
  "exams": [
    {
      "exam": {
        "id": 1,
        "code": "JEE",
        "name": "Joint Entrance Examination"
      },
      "cutoff_rank": 500,
      "cutoff_percentile": 99.5
    }
  ],
  "degrees": [
    {
      "id": 1,
      "degree": {
        "id": 1,
        "name": "B.Tech Computer Science",
        "degree_type": "ug",
        "duration_years": 4
      },
      "seats_available": 100
    }
  ],
  "scholarships": [
    {
      "id": 1,
      "name": "Merit Scholarship",
      "criteria": "Top 10% students",
      "amount": 50000
    }
  ],
  "important_dates": [
    {
      "id": 1,
      "type": "admission_start",
      "date": "2025-06-01",
      "description": "Application opens"
    }
  ]
}
```

### Get College Scholarships

```http
GET /api/colleges/1/scholarships/
```

### Get College Important Dates

```http
GET /api/colleges/1/important_dates/
```

### Get College Reviews

```http
GET /api/colleges/1/reviews/
```

**Response:**
```json
[
  {
    "id": 1,
    "user_name": "John Doe",
    "college_name": "IIT Delhi",
    "rating": 5,
    "title": "Excellent Infrastructure",
    "body": "Great facilities and faculty...",
    "tags": ["infrastructure", "faculty"],
    "status": "approved",
    "helpful_count": 25,
    "not_helpful_count": 2,
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

---

## Exams

### List Exams

```http
GET /api/exams/
```

**Response:**
```json
[
  {
    "id": 1,
    "code": "JEE",
    "name": "Joint Entrance Examination",
    "overview": "National level engineering entrance exam",
    "application_url": "https://jeemain.nta.nic.in/",
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

### Get Exam Details

```http
GET /api/exams/1/
```

**Response:**
```json
{
  "id": 1,
  "code": "JEE",
  "name": "Joint Entrance Examination",
  "overview": "National level engineering entrance exam",
  "eligibility": "12th pass with PCM",
  "pattern": "Multiple choice questions",
  "syllabus_summary": "Physics, Chemistry, Mathematics",
  "application_url": "https://jeemain.nta.nic.in/",
  "dates": {
    "registration_start": "2025-02-01",
    "registration_end": "2025-03-01",
    "exam_date": "2025-04-15"
  },
  "cutoffs": {
    "2024": {
      "general": 90,
      "obc": 75,
      "sc": 50
    }
  },
  "exam_dates": [
    {
      "id": 1,
      "type": "registration_start",
      "date": "2025-02-01",
      "description": "Registration opens"
    }
  ],
  "colleges_count": 150
}
```

### Get Exam Dates

```http
GET /api/exams/1/dates/
```

### Get Colleges Accepting Exam

```http
GET /api/exams/1/colleges/
```

---

## Preparation Plans

### List Prep Plans

```http
GET /api/prep/plans/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "exam": {
      "id": 1,
      "code": "JEE",
      "name": "Joint Entrance Examination"
    },
    "status": "active",
    "status_display": "Active",
    "target_date": "2025-04-15",
    "weeks_count": 12,
    "created_at": "2025-01-10T10:00:00Z",
    "updated_at": "2025-01-20T15:30:00Z"
  }
]
```

### Create Prep Plan

```http
POST /api/prep/plans/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "exam_id": 1,
  "target_date": "2025-04-15",
  "status": "active"
}
```

### Get Prep Plan Details

```http
GET /api/prep/plans/1/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "exam": {
    "id": 1,
    "code": "JEE",
    "name": "Joint Entrance Examination"
  },
  "status": "active",
  "target_date": "2025-04-15",
  "weeks": [
    {
      "id": 1,
      "week_number": 1,
      "title": "Foundation Week",
      "start_date": "2025-01-22",
      "end_date": "2025-01-28",
      "tasks": [
        {
          "id": 1,
          "title": "Complete Chapter 1 - Algebra",
          "description": "Study basic algebra concepts",
          "status": "completed",
          "order": 1,
          "estimated_hours": 5.0,
          "resources": ["https://example.com/algebra"],
          "completed_at": "2025-01-23T18:00:00Z"
        }
      ]
    }
  ]
}
```

### Update Prep Plan

```http
PATCH /api/prep/plans/1/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "paused"
}
```

### Get Weekly Tasks

```http
GET /api/prep/plans/1/weeks/
Authorization: Bearer <access_token>
```

### Update Task Status

```http
PATCH /api/prep/plans/1/tasks/5/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "completed"
}
```

---

## Saved Colleges (Shortlist)

### List Saved Colleges

```http
GET /api/saved/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "college": {
      "id": 1,
      "name": "IIT Delhi",
      "state": "Delhi",
      "city": "New Delhi",
      "type": "government",
      "fees_annual": 200000,
      "restart_score": 95
    },
    "notes": "Top choice for CS",
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

### Save College

```http
POST /api/saved/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "college_id": 1,
  "notes": "Top choice for CS"
}
```

### Remove Saved College

```http
DELETE /api/saved/1/
Authorization: Bearer <access_token>
```

---

## Reminders

### List Reminders

```http
GET /api/reminders/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "type": "exam_date",
    "type_display": "Exam Date",
    "object_id": 5,
    "channels": ["email", "push"],
    "days_before": 7,
    "is_active": true,
    "target_info": {
      "exam": "JEE",
      "date": "2025-04-15"
    },
    "created_at": "2025-01-15T10:00:00Z",
    "last_sent_at": null
  }
]
```

### Create Reminder

```http
POST /api/reminders/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "type": "exam_date",
  "target_id": 5,
  "channels": ["email", "push"],
  "days_before": 7
}
```

**Types:**
- `exam` - Reminder for entire exam
- `exam_date` - Reminder for specific exam date
- `college_date` - Reminder for college important date

### Delete Reminder

```http
DELETE /api/reminders/1/
Authorization: Bearer <access_token>
```

---

## Reviews

### List Reviews

```http
GET /api/reviews/
Authorization: Bearer <access_token>
```

**Note:** Returns different results based on user role:
- **Anonymous**: Only approved reviews
- **Authenticated**: User's own reviews
- **Admin**: All reviews

### Submit Review

```http
POST /api/reviews/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "college_id": 1,
  "rating": 5,
  "title": "Excellent Infrastructure",
  "body": "The college has state-of-the-art facilities...",
  "tags": ["infrastructure", "faculty", "placements"]
}
```

**Response:**
```json
{
  "id": 1,
  "user_name": "John Doe",
  "college_name": "IIT Delhi",
  "rating": 5,
  "title": "Excellent Infrastructure",
  "body": "The college has state-of-the-art facilities...",
  "tags": ["infrastructure", "faculty", "placements"],
  "status": "pending",
  "status_display": "Pending Approval",
  "helpful_count": 0,
  "not_helpful_count": 0,
  "created_at": "2025-01-22T10:00:00Z"
}
```

### Get Pending Reviews (Admin Only)

```http
GET /api/reviews/pending/
Authorization: Bearer <admin_access_token>
```

### Moderate Review (Admin Only)

```http
POST /api/reviews/1/moderate/
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "status": "approved",
  "moderation_notes": "Review meets guidelines"
}
```

**Status Options:**
- `approved` - Approve review
- `rejected` - Reject review

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid or expired OTP"
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "error": "College not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "An unexpected error occurred. Please try again later."
}
```

---

## Rate Limiting

**Not yet implemented**, but recommended for production:
- **Anonymous users**: 100 requests/hour
- **Authenticated users**: 1000 requests/hour
- **Admin users**: Unlimited

---

## Pagination

Most list endpoints support pagination:

**Request:**
```http
GET /api/colleges/?page=2&page_size=20
```

**Response:**
```json
{
  "count": 150,
  "page": 2,
  "page_size": 20,
  "results": [...]
}
```

---

## Filtering & Sorting

### Filtering
Use query parameters to filter results:
```http
GET /api/colleges/?state=Delhi&type=government
```

### Sorting
Use `sort_by` parameter (prefix with `-` for descending):
```http
GET /api/colleges/?sort_by=-restart_score
```

---

## Testing with cURL

### Example: Complete Authentication Flow

```bash
# 1. Request OTP
curl -X POST http://localhost:8000/api/auth/register-otp/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 2. Verify OTP (check email for OTP)
curl -X POST http://localhost:8000/api/auth/verify-otp/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'

# Save the access token from response

# 3. Get profile
curl -X GET http://localhost:8000/api/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Search colleges
curl -X GET "http://localhost:8000/api/colleges/?q=engineering&state=Delhi" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Postman Collection

Import the Postman collection for easier testing:
1. Download `postman_collection.json` (to be created)
2. Import into Postman
3. Set environment variables:
   - `base_url`: `http://localhost:8000`
   - `access_token`: Your JWT access token

---

## WebSocket Support

**Not yet implemented**, but planned for:
- Real-time notifications
- Live chat support
- Real-time prep plan updates

---

## API Versioning

Current version: **v1** (implicit)

Future versions will use URL versioning:
- `/api/v1/colleges/`
- `/api/v2/colleges/`

---

**API Version**: 1.0  
**Last Updated**: 2025-01-22  
**Base URL**: `http://localhost:8000/api/`
