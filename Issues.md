# Codebase Issues Report

## Critical Security Issues

### 1. Hardcoded OTP (Backend)
- **File:** `backend/users/views.py`
- **Issue:** The `OTPRequestView` sets a hardcoded OTP `'123456'` in the cache for every request.
- **Risk:** Any user can log in to any account if they know the email, by using `'123456'` as the OTP.
- **Fix:** Remove the test OTP code block in production.

### 2. Insecure Google Token Verification (Backend)
- **File:** `backend/users/views.py`
- **Issue:** The `GoogleAuthView` attempts "lenient verification" if standard verification fails. It explicitly disables client ID validation (`verify_oauth2_token(..., None)`) and then manually checks the audience. If the audience doesn't match, it logs a warning but **continues anyway** ("Continue anyway for testing purposes").
- **Risk:** This allows attackers to use tokens from other Google apps to impersonate users on this platform.
- **Fix:** Enforce strict audience validation and fail if it doesn't match.

### 3. Debug Mode Enabled (Backend)
- **File:** `backend/config/settings.py`
- **Issue:** `DEBUG = True` is set.
- **Risk:** Exposes sensitive debug information (stack traces, environment variables) in error pages.
- **Fix:** Set `DEBUG = False` in production (use environment variable).

### 4. CORS Misconfiguration (Backend)
- **File:** `backend/config/settings.py`
- **Issue:** `CORS_ALLOW_ALL_ORIGINS = True`.
- **Risk:** Allows any website to make requests to your API.
- **Fix:** Use `CORS_ALLOWED_ORIGINS` to whitelist specific domains.

### 5. Insecure Random Number Generator (Backend)
- **File:** `backend/users/views.py`
- **Issue:** `generate_otp` uses `random.randint`.
- **Risk:** `random` is not cryptographically secure.
- **Fix:** Use `secrets.randbelow` or `secrets.choice`.

## Logical Errors & Mismatches

### 6. Authentication Flow Mismatch (Frontend/Backend)
- **File:** `frontend/app/api/auth/[...nextauth]/route.ts` vs `backend/users/urls.py`
- **Issue:**
    -   Frontend `CredentialsProvider` sends a POST request to `/auth/login/` with email and password.
    -   Backend **does not have** `/auth/login/`. It has `/auth/register-otp/` and `/auth/verify-otp/` for OTP-based login.
- **Impact:** Password login will fail with a 404 error.
- **Fix:** Update frontend to use OTP flow (request OTP -> verify OTP) or implement password login on backend.

### 7. Google Auth URL Mismatch (Frontend/Backend)
- **File:** `frontend/app/api/auth/[...nextauth]/route.ts` vs `backend/users/urls.py`
- **Issue:**
    -   Frontend calls `/auth/oauth/callback`.
    -   Backend has `/auth/google/callback`.
- **Impact:** Google auth callback will fail with 404.
- **Fix:** Align the URLs.

### 8. Elasticsearch Disabled but Used (Backend)
- **File:** `backend/colleges/views.py` vs `backend/config/settings.py`
- **Issue:** `CollegeSearchView` uses `CollegeDocument.search()`, but `ELASTICSEARCH_DSL = None` in settings.
- **Impact:** The search endpoint (`/api/colleges/search/`) will likely crash or error out.
- **Fix:** Enable Elasticsearch in settings or update the view to handle the disabled state (or use DB fallback).

### 9. Token Refresh Logic Missing (Frontend)
- **File:** `frontend/lib/api-client.ts`
- **Issue:** The response interceptor catches 401 errors but redirects to login immediately. It mentions "If we have a refresh mechanism...", but doesn't implement it.
- **Impact:** Users are logged out when the access token expires (1 hour), even if the refresh token is valid (7 days).
- **Fix:** Implement token refresh using the refresh token stored in the session.

## Improvements & Best Practices

### 10. Data Deletion Promise (Backend)
- **File:** `backend/users/views.py`
- **Issue:** `delete_account` claims "All personal data will be deleted within 30 days" but only sets `is_active = False`.
- **Fix:** Implement the actual deletion logic (e.g., Celery task).

### 11. Hardcoded API URL (Frontend)
- **File:** `frontend/lib/api-client.ts`
- **Issue:** `API_URL` defaults to `http://localhost:8000/api`.
- **Fix:** Ensure this is configurable via environment variables for different environments.

### 12. Type Safety (Frontend)
- **File:** `frontend/lib/api-client.ts`
- **Issue:** Some implicit `any` usage or loose typing in interceptors.
- **Fix:** Strengthen TypeScript types.
