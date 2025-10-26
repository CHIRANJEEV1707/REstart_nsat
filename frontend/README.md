# REstart Frontend

REstart is a modern platform helping students discover colleges, prepare for exams, and plan their future with personalized guidance.

## Authentication System

The REstart platform uses NextAuth.js for authentication on the frontend, which connects to a Django backend for user management. The system supports:

- Google OAuth authentication
- GitHub OAuth authentication
- Email/Password authentication
- JWT-based session management
- Secure storage of user profiles in the database

### Setup Instructions

1. **Environment Variables**

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

2. **OAuth Provider Setup**

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

3. **Install Dependencies**

```bash
npm install
```

4. **Run the Development Server**

```bash
npm run dev
```

## Features

- **Authentication**: Secure authentication with multiple providers
- **Protected Routes**: Dashboard and profile pages are protected
- **User Profile**: View and edit user profile information
- **Responsive Design**: Works on all devices
- **Dark Mode**: Toggle between light and dark themes
- **Animations**: Smooth animations with Framer Motion

## Project Structure

- `/app`: Next.js App Router pages
  - `/api/auth/[...nextauth]`: NextAuth API routes
  - `/auth`: Authentication pages (signin, signup, signout, error)
  - `/dashboard`: Protected dashboard pages
- `/components`: Reusable components
  - `/dashboard`: Dashboard-specific components
  - `/shared`: Shared components (navbar, footer, etc.)
  - `/ui`: UI components (buttons, cards, etc.)
- `/lib`: Utility functions and API client
- `/providers`: Context providers (auth, theme)
- `/types`: TypeScript type definitions

## Authentication Flow

1. **Google/GitHub OAuth**:
   - User clicks the Google/GitHub button on the sign-in page
   - NextAuth redirects to the provider's authentication page
   - After successful authentication, the provider redirects back to NextAuth
   - NextAuth exchanges the authorization code for tokens
   - The tokens are sent to the backend for verification and user creation/retrieval
   - The backend returns JWT tokens and user data
   - NextAuth creates a session with the user data and tokens

2. **Email/Password**:
   - User enters their email and password on the sign-in page
   - Frontend sends credentials to the backend
   - Backend verifies credentials and returns JWT tokens and user data
   - Frontend creates a session with the user data and tokens

## Security Considerations

- All sensitive information is stored in environment variables
- JWT tokens are used for authentication
- CSRF protection is enabled
- HTTPS is used in production
- OAuth state parameter is used to prevent CSRF attacks
- Tokens are stored in HTTP-only cookies
- Backend validates all tokens before granting access
