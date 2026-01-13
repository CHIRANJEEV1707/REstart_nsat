# **REstart — The Future of College Discovery**

*A smart, data-driven platform helping students find their dream engineering college — globally*

---

## **Overview**

**REstart** is a comprehensive educational platform designed to simplify the chaotic college admission process. Whether you are targeting top **Indian Institutes (IITs/NITs)** or looking for **International Universities**, REstart provides intelligent discovery, personalized recommendations, and structured prep bundles.

Built with a performance-first mindset, the platform integrates seamless **Authentication**, **Payments**, and **Real-time Search** to deliver a premium user experience.

---

## **Key Features**

### **College Discovery**
*   **Indian Colleges**: extensive database of IITs, NITs, and private institutions.
*   **International Universities**: Global coverage for study-abroad aspirants.
*   **Smart Filtering**: Filter by Fee range, Location, Exams accepted, and more.

### **Exam Tracking**
*   Detailed pages for **JEE Main, JEE Advanced, SAT**, and other medical/engineering entrance exams.
*   Timelines, Eligibility criteria, and Important dates.

### **Prep Bundles & Payments**
*   **Premium Study Materials**: Purchase tailored prep bundles for specific exams.
*   **Razorpay Integration**: Secure, seamless checkout experience for Indian users.
*   **Order History**: Track purchases and access content instantly.

### **Personalized Onboarding**
*   **Smart Profiling**: Collects user preferences (Budget, Country, Target Degree) to tailor recommendations.
*   **Dashboard**: A personalized hub showing saved colleges, application status, and recommendations.

### **Security & Auth**
*   **Hybrid Auth**: Supports both **HttpOnly Cookies** (Production) and **Bearer Tokens** (Mobility).
*   **Security Hardening**: Rate limiting, Helmet headers, Mongo Sanitize, and CSRF protection.

---

## **Tech Stack**

### **Frontend**
*   **Framework**: Next.js 14 (App Router)
*   **Styling**: TailwindCSS + Lucide Icons
*   **State/Data**: React Hooks, Axios
*   **Validation**: Zod + React Hook Form
*   **Deployment**: Vercel

### **Backend**
*   **Runtime**: Node.js + Express
*   **Database**: MongoDB (Mongoose)
*   **Authentication**: JWT (JSON Web Tokens) with Refresh/Access token rotation.
*   **Security**: `helmet`, `cors`, `express-mongo-sanitize`, `csrf-csrf`
*   **Payments**: Razorpay Node.js SDK
*   **Deployment**: Render

---

## **Project Structure**

```
├── frontend/               # Next.js Application
│   ├── app/                # App Router Pages (explore, exams, auth, dashboard)
│   ├── components/         # Reusable UI Components
│   ├── lib/                # Utilities (axios setup, constants)
│   └── public/             # Static Assets
│
├── backend/                # Node.js Express API
│   ├── src/
│   │   ├── config/         # DB & Swagger Config
│   │   ├── controllers/    # Business Logic
│   │   ├── middleware/     # Auth, Error, Security, Logging
│   │   ├── models/         # Mongoose Schemas (User, College, Order, Bundle)
│   │   ├── routes/         # API Routes
│   │   └── utils/          # Helpers
```

---

## **Getting Started**

### **Prerequisites**
*   Node.js (v18+)
*   MongoDB URI
*   Razorpay API Keys

### **1. Backend Setup**
```bash
cd backend
npm install

# Create .env file
# PORT=5001
# MONGO_URI=...
# JWT_SECRET=...
# FRONTEND_URL=http://localhost:3000

npm run dev
```

### **2. Frontend Setup**
```bash
cd frontend
npm install

# Create .env file
# NEXT_PUBLIC_API_URL=http://localhost:5001/api

npm run dev
```

The app will be available at `http://localhost:3000`.

---

## **API Documentation**

The Backend includes auto-generated Swagger documentation.
Once running, visit:
`http://localhost:5001/api-docs`

**Core Endpoints:**
*   `POST /api/auth/register` - Create account
*   `POST /api/auth/login` - Login
*   `GET  /api/colleges` - Search colleges
*   `GET  /api/exams` - List exams
*   `POST /api/orders/create` - Initialize Payment
*   `POST /api/orders/verify` - Verify Payment

---

**Built by CodeMaverick-143**
