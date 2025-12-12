# Project Issues & Improvements Tracker

This document outlines the current issues within the project (Frontend & Backend) and provides a roadmap for making the application production-ready.

---

## 1. Complete Issue List

### 🚨 High Priority (Critical)

1.  **Hardcoded JWT Secret Fallback (Security)**
    *   **Description**: The `authController.js` uses `'secret'` as a fallback if `JWT_SECRET` is missing. This allows attackers to forge tokens if the env var fails to load.
    *   **Location**: Backend (`src/controllers/authController.js`)
    *   **Type**: Backend / Security

2.  **Insecure Cookie Configuration (Security)**
    *   **Description**: Cookies are set with `secure: false` hardcoded. This means cookies can be sent over unencrypted HTTP, exposing sessions to MitM attacks.
    *   **Location**: Backend (`src/controllers/authController.js`)
    *   **Type**: Backend / Security

3.  **Password Hashing Logic in Controller (Architecture/Security)**
    *   **Description**: Password hashing is manually performed in `register` controller. If a user is created via another path (e.g. seed script, admin panel), passwords might be stored in plain text. Hashing should be a pre-save hook in the User model.
    *   **Location**: Backend (`src/controllers/authController.js`)
    *   **Type**: Backend

4.  **Hardcoded CORS Origin (Config)**
    *   **Description**: The server manually sets CORS headers for `http://localhost:3000`. This will break in production or if the frontend port changes.
    *   **Location**: Backend (`server.js`)
    *   **Type**: Backend

### ⚠️ Medium Priority (Important)

5.  **Lack of Input Validation Middleware**
    *   **Description**: Controllers rely on basic `if (!email)` checks. There is no robust schema validation (like Zod or Joi) to verify email formats, password complexity, or data types before processing.
    *   **Location**: Backend (All Controllers)
    *   **Type**: Backend

6.  **No Centralized Error Handling**
    *   **Description**: Errors are caught in individual `try/catch` blocks sending manual 500 responses. This leads to code duplication and inconsistent error responses.
    *   **Location**: Backend (All Controllers)
    *   **Type**: Backend

7.  **Inconsistent Language Stack**
    *   **Description**: Frontend is in TypeScript while Backend is in JavaScript. This prevents sharing types (DTOs) and increases cognitive load when switching contexts.
    *   **Location**: Full Stack
    *   **Type**: Architecture

8.  **Hardcoded Database Connection String**
    *   **Description**: `db.js` contains a fallback connection string to `localhost`. Production secrets should never be in the codebase, even as fallbacks.
    *   **Location**: Backend (`src/config/db.js`)
    *   **Type**: Backend / Security

### 📉 Low Priority (Cleanup)

9.  **Console Logs in Production Code**
    *   **Description**: `console.log` and `console.error` are used directly. In production, these should be replaced with a proper logger (like winston or pino) to manage log levels and formats.
    *   **Location**: Backend (`server.js`, `db.js`)
    *   **Type**: Backend

10. **Hardcoded API Base URL Fallback**
    *   **Description**: The frontend `axios` instance has a hardcoded localhost fallback. While useful for dev, it can cause confusion if `.env` is missing.
    *   **Location**: Frontend (`lib/axios.ts`)
    *   **Type**: Frontend

11. **Missing Test Suites**
    *   **Description**: There are no unit or integration tests visible. Refactoring code feels unsafe without a safety net.
    *   **Location**: Full Stack
    *   **Type**: Testing

---

## 2. Project Improvements to Make It Production-Ready

### 🏗 Architecture & Code Quality

*   **Migrate Backend to TypeScript**:
    *   **Why**: To share type definitions (User, API Responses) between frontend and backend, reducing integration bugs.
    *   **Impact**: Better developer experience and fewer runtime errors.

*   **Implement "Service Layer" Pattern**:
    *   **Why**: Controllers are currently doing business logic (hashing, database calls). Moving this to Services (`authService.js`) makes code testable and reusable.
    *   **Impact**: Clean architecture and easier unit testing.

*   **Add Request Validation (Zod/Joi)**:
    *   **Why**: To fail fast if invalid data is sent, protecting the database and logic layers.
    *   **Impact**: Improved security and data integrity.

### 🚀 Performance Optimizations

*   **Database Indexing**:
    *   **Why**: Fields like `email` are unique, but we should ensure indexes exist for commonly queried fields like `role` or `state`.
    *   **Impact**: Faster query times as the user base grows.

*   **Enable Gzip/Brotli Compression**:
    *   **Why**: Reduce the size of JSON responses sent from the backend.
    *   **Impact**: Faster API response times for large datasets.

### 🛡 Security Hardening

*   **Rate Limiting**:
    *   **Why**: Prevent brute-force attacks on login/signup endpoints.
    *   **Impact**: Prevents abuse and DoS attacks.

*   **Helmet.js Integration**:
    *   **Why**: Sets secure HTTP headers (XSS Filter, HSTS, No-Sniff) automatically.
    *   **Impact**: Protecting against common web vulnerabilities.

### ⚙️ DevOps & Monitoring

*   **Dockerize the Application**:
    *   **Why**: Ensure the app runs the same on every machine and in production.
    *   **Impact**: Simplified deployment and onboarding.

*   **CI/CD Pipeline (GitHub Actions)**:
    *   **Why**: Automatically run linting, build, and tests on push.
    *   **Impact**: Prevents broken code from merging.

*   **Structured Logging**:
    *   **Why**: `console.log` is hard to filter in production logs. Use a library like `winston`.
    *   **Impact**: Easier debugging and observability in production.
