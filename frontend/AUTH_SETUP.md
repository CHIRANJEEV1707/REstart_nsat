# REstart Authentication System Setup

This document provides instructions on how to set up the authentication system for the REstart platform.

## Overview

The REstart platform uses NextAuth.js for authentication on the frontend, which connects to a Django backend for user management. The system supports:

- Google OAuth authentication
- GitHub OAuth authentication
- Email/OTP authentication (via backend)
- JWT-based session management
- Secure storage of user profiles in the database

## Frontend Setup

### 1. Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_at_least_32_chars

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 2. OAuth Provider Setup

#### Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set the application type to "Web application"
6. Add "http://localhost:3000/api/auth/callback/google" as an authorized redirect URI
7. Copy the Client ID and Client Secret to your `.env.local` file

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: REstart
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/api/auth/callback/github
4. Copy the Client ID and Client Secret to your `.env.local` file

## Backend Setup

### 1. Environment Variables

Create a `.env` file in the backend directory with the following variables (in addition to existing ones):

```
# OAuth Configuration
GOOGLE_OAUTH2_CLIENT_ID=your_google_client_id_here
GOOGLE_OAUTH2_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### 2. CORS Configuration

Ensure that your backend's CORS settings allow requests from your frontend:

```python
# In settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    # Add your production frontend URL here
]

CORS_ALLOW_CREDENTIALS = True
```

## Testing the Authentication System

1. Start the backend server:
   ```
   cd backend
   python manage.py runserver
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

3. Navigate to http://localhost:3000 in your browser
4. Click "Sign In" in the navbar
5. Try signing in with Google, GitHub, or email/OTP

## Authentication Flow

1. **Google/GitHub OAuth**:
   - User clicks the Google/GitHub button on the sign-in page
   - NextAuth redirects to the provider's authentication page
   - After successful authentication, the provider redirects back to NextAuth
   - NextAuth exchanges the authorization code for tokens
   - The tokens are sent to the backend for verification and user creation/retrieval
   - The backend returns JWT tokens and user data
   - NextAuth creates a session with the user data and tokens

2. **Email/OTP**:
   - User enters their email on the sign-in page
   - Backend sends an OTP to the user's email
   - User enters the OTP on the verification page
   - Backend verifies the OTP and returns JWT tokens and user data
   - Frontend creates a session with the user data and tokens

## Security Considerations

- All sensitive information is stored in environment variables
- JWT tokens are used for authentication
- CSRF protection is enabled
- HTTPS is used in production
- OAuth state parameter is used to prevent CSRF attacks
- Tokens are stored in HTTP-only cookies
- Backend validates all tokens before granting access

## Troubleshooting

- If you encounter CORS errors, check your backend CORS settings
- If OAuth authentication fails, check your OAuth provider settings
- If the session is not persisting, check your NextAuth configuration
- If the backend returns 401 errors, check your JWT token configuration
