# **REstart — Engineering College Discovery Platform**

*A smart, clean, AI-friendly web app helping PCM students find the right engineering college — without the chaos.*

> Think “Zomato for engineering colleges,” but with prep plans, reminders, and actually useful filters.

---

## **Overview**

REstart is a web application built for PCM (Physics, Chemistry, Math) students to **discover engineering colleges**, understand **eligibility**, track **exam timelines**, and access **PCM prep guidance** — all in one chill, student-friendly interface.

The MVP focuses on:

* Smooth login → discover → compare → learn flow
* Rich filters + SEO-optimized college pages
* Exam pages with real timelines
* PCM weekly prep plans
* Save, shortlist & reminders
* Clean, responsive UI

(Yes, we actually built something students will *want* to use.)

---

## **Core Features**

### **College Discovery**

* Real-time filters: degree, ratings, fees, location, exams
* Smart ranking based on profile fit & cost
* REstart Score with transparent logic
* Infinite scroll, skeleton loaders, no jank

### **College Detail Pages**

* Overview
* Eligibility & Required Exams
* Fees & Scholarships
* Important Dates
* Reviews (Phase 2)
* Automatically-generated “How to Get In” checklist

### **Exams Module**

* JEE Main, JEE Advanced, state CETs, institute-level exams
* Eligibility, pattern, syllabus snapshots
* Important dates with reminder support

### **PCM Prep Guidance**

* Weekly structured plans (6–12 weeks)
* Physics, Chemistry, Math goal breakdown
* Task-based progress tracking
* Mock test & resource links

### **Saved Colleges + Reminders**

* Save/unsave in one click
* Email reminders for deadlines
* Dashboard for quick access

### **Admin Panel (Phase 2)**

* College & exam CMS
* Date management
* Review moderation
* Bulk import

---

## **Tech Stack**

### **Frontend**

* Next.js (App Router)
* React + TypeScript
* TailwindCSS
* TanStack Query
* NextAuth (Magic Link + Google)

### **Backend**

* Node.js + Express
* MongoDB (Mongoose)
* Redis (caching & rate limiting)
* SendGrid/SES (magic links + reminders)

### **Infra**

* Vercel (frontend)
* Render/EC2 (backend)
* MongoDB Atlas
* S3-compatible storage
* GitHub Actions for CI/CD

---

## **Project Structure**

```
/frontend
  README.md
  frontend.md
  src/
    app/
    components/
    hooks/
    lib/
    styles/

/backend
  README.md
  backend.md
  src/
    models/
    controllers/
    routes/
    services/
    utils/
```

---

## **Authentication Flow**

* Email magic link (no OTP if link verified — clean and frictionless)
* Google OAuth (fallback)
* Sessions stored as secure httpOnly cookies

---

## **API Overview**

Mapped from PRD contracts:

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| POST   | `/api/auth/login`   | Send magic link    |
| POST   | `/api/auth/verify`  | Verify login       |
| GET    | `/api/colleges`     | Filter & search    |
| GET    | `/api/colleges/:id` | College detail     |
| GET    | `/api/exams`        | Fetch exams        |
| POST   | `/api/prep/plans`   | Start prep plan    |
| POST   | `/api/reminders`    | Add reminder       |
| GET    | `/api/saved`        | Get saved colleges |

---

## **Data Model**

(Straight from PRD — simplified for README)

### User

```
id, name, email, state, class_level,
target_degree, target_exams[], budget_min/max
```

### College

```
id, name, description, state, city,
accreditation, type, exams_required[],
fees, scholarships, restart_score,
reviews_avg, ratings_count
```

### Exam

```
id, code, name, overview, eligibility,
dates { registration_open, exam_date, ... }
```

### PrepPlan

```
id, user_id, exam_id, weeks[], status
```

---

## **Ranking Logic**

Based on PRD scoring formula:

```
score =
  w1 * profile_fit +
  w2 * restart_score +
  w3 * cost_fit +
  w4 * popularity +
  w5 * review_quality
```

Admin can tweak weights.
Search is full-text + filtered + ranked.

---

## **Reminder System**

Cron-driven:

* T-7, T-3, T-1 → Registration closing reminders
* T-0 → Exam day reminder
* Weekly → Prep plan updates

Reminders delivered via email + in-app events.

---

## **Quality & Performance**

Targets (from PRD):

* LCP < 2.5s
* TTFB < 800ms
* 99.5% uptime
* Mobile-first UX
* WCAG 2.2 AA compliant

---

## **Roadmap**

### **Phase 1 (MVP)**

* Auth
* College Discovery
* College Detail Pages
* Exams Module
* Prep Guidance
* Save + Reminders

### **Phase 2**

* Reviews + moderation
* Admin CMS
* PDF print-friendly pages

### **Phase 3**

* Comparisons
* User communities
* Advanced analytics

---

## **Local Development**

### Frontend

```
cd frontend
npm install
npm run dev
```

### Backend

```
cd backend
npm install
npm run dev
```

Environment variables:

* MongoDB URI
* JWT secret
* Email provider keys
* Redis URL
* Public website domain

---

## **Contributing**

Pull requests welcome.
Follow the commit style: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.

---

## **License**

MIT — go wild.