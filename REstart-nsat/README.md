# REstart NSAT - Exam Preparation Platform

A modern, full-featured exam preparation platform built with React, TypeScript, and Supabase.

## Features

- 🔐 **Authentication**: Secure login/register with Supabase Auth
- 📚 **Bundle Management**: Browse and purchase exam prep bundles
- 📖 **Content Access**: Hierarchical subjects and modules with PDF materials
- ⏱️ **Mock Tests**: Timed tests with auto-submit functionality
- 📊 **Analytics**: Detailed performance tracking and progress visualization
- 💳 **Payments**: Razorpay integration for secure payments
- 🎫 **Coupons**: Apply discount codes during checkout
- 🔔 **Notifications**: Real-time announcements and updates
- 👤 **Profile Management**: View purchase history and download invoices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **State Management**: React Query
- **Routing**: React Router v6
- **Charts**: Recharts
- **Payments**: Razorpay

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Razorpay account (for payments)

### Installation

1. Clone the repository:
   ```bash
   cd REstart-nsat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_RAZORPAY_KEY_ID`: Your Razorpay key ID

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── bundles/        # Bundle-related components
│   ├── dashboard/      # Dashboard components
│   ├── test/           # Test interface components
│   └── ui/             # Generic UI components
├── pages/              # Page components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## Supabase Setup

### Database Tables

Key tables required:
- `bundles` - Exam prep bundles
- `subjects` - Bundle subjects
- `modules` - Subject modules
- `tests` - Mock tests
- `questions` - Test questions
- `purchases` - User purchases
- `test_attempts` - Test submission records
- `progress` - Module completion tracking
- `notifications` - User notifications

### Row Level Security (RLS)

RLS policies ensure:
- Students can only access purchased bundles
- Test answers hidden until submission
- Personal data protected
- Storage access controlled by purchase status

### Storage Buckets

- `study-materials` - PDFs and content files
- `test-assets` - Question images and resources

## Building for Production

```bash
npm run build
```

The optimized build will be in the `dist` directory.

## License

MIT
