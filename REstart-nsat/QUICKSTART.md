# REstart NSAT - Quick Start Guide

## 🎉 Project Successfully Created!

Your exam preparation platform is ready to go. Here's how to get started:

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ Supabase account
- ✅ Razorpay account (for payments)

## 🚀 Quick Start

### 1. Configure Environment Variables

Open `.env` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_RAZORPAY_KEY_ID=your-razorpay-key-here
```

**Get Supabase Credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" and "anon public" key

**Get Razorpay Credentials:**
1. Go to [razorpay.com](https://razorpay.com)
2. Sign in to Dashboard
3. Go to Settings → API Keys
4. Copy "Key ID"

### 2. Set Up Supabase Database

Follow the complete database setup guide in `SUPABASE_SETUP.md`:

```bash
# Open the setup guide
cat SUPABASE_SETUP.md
```

**Quick summary:**
1. Open Supabase SQL Editor
2. Run all table creation scripts
3. Enable RLS on all tables
4. Create RLS policies
5. Create storage buckets

### 3. Start Development Server

```bash
npm run dev
```

The app will open at: **http://localhost:5173**

### 4. Test the Application

#### Create a Test User
1. Go to http://localhost:5173/register
2. Sign up with email and password
3. Verify email if required

#### Add Sample Data via Supabase Dashboard

**Create a Bundle:**
```sql
INSERT INTO bundles (title, description, price, duration_days, exam_type, features, is_active)
VALUES (
  'NSAT Complete Bundle',
  'Comprehensive exam preparation with study materials and tests',
  2999,
  180,
  'NSAT',
  ARRAY['Study Materials', 'Mock Tests', 'Analytics'],
  true
);
```

**Add a Subject:**
```sql
INSERT INTO subjects (bundle_id, title, description, order_index)
VALUES (
  'your-bundle-id',
  'Mathematics',
  'Complete mathematics preparation',
  1
);
```

**Add a Module:**
```sql
INSERT INTO modules (subject_id, title, description, content_type, content_url, order_index)
VALUES (
  'your-subject-id',
  'Algebra Basics',
  'Introduction to algebra',
  'pdf',
  'https://example.com/algebra.pdf',
  1
);
```

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── auth/         # Login, Register components
│   ├── layouts/      # Dashboard layout
│   └── ui/           # Generic UI components
├── pages/            # All page components
│   ├── Landing.tsx   # Public landing page
│   ├── Login.tsx     # Login page
│   ├── Register.tsx  # Registration page
│   ├── Dashboard.tsx # Student dashboard
│   ├── Bundles.tsx   # Bundle listing
│   ├── Test.tsx      # Test interface
│   └── ...
├── contexts/         # React contexts (Auth)
├── lib/              # Utilities (Supabase, utils)
├── types/            # TypeScript types
└── styles/           # Global styles
```

## 🎨 Key Features

### For Students:
- ✅ Registration & Authentication
- ✅ Bundle browsing and purchase
- ✅ Secure payment with Razorpay
- ✅ Coupon code support
- ✅ Study materials access
- ✅ Timed mock tests
- ✅ Instant results with analysis
- ✅ Progress tracking
- ✅ Performance analytics
- ✅ Purchase history

### Technical Features:
- ✅ React 18 + TypeScript
- ✅ Vite for fast development
- ✅ Supabase for backend
- ✅ Row Level Security (RLS)
- ✅ React Query for data fetching
- ✅ Tailwind CSS for styling
- ✅ Protected routes
- ✅ Responsive design

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🗃️ Database Tables

- **bundles** - Exam prep bundles
- **subjects** - Bundle subjects
- **modules** - Study modules
- **tests** - Mock tests
- **questions** - Test questions
- **purchases** - User purchases
- **test_attempts** - Test submissions
- **progress** - Module completion
- **notifications** - Announcements
- **coupons** - Discount codes

## 🔐 Security

- Row Level Security (RLS) enabled
- Users can only access purchased content
- Test answers hidden until submission
- Secure authentication with Supabase Auth
- Protected routes for authenticated users

## 📊 Testing the Flow

### 1. Register/Login
- Create account at `/register`
- Login at `/login`

### 2. Browse Bundles
- View bundles at `/bundles`
- See bundle details
- Check pricing and features

### 3. Purchase Bundle
- Click "Buy Now"
- Apply coupon code (if available)
- Complete Razorpay payment
- Access unlocked content

### 4. Study Content
- Access purchased bundles
- View study materials
- Track progress

### 5. Take Tests
- Start mock test
- Answer questions
- Auto-submit on timeout
- View detailed results

### 6. Track Progress
- View dashboard stats
- Check test history
- Monitor performance

## 🎯 Next Steps

1. **Configure Supabase**
   - Set up database tables
   - Configure RLS policies
   - Create storage buckets

2. **Add Content**
   - Create bundles via dashboard
   - Add subjects and modules
   - Upload study materials
   - Create tests and questions

3. **Test Everything**
   - User registration
   - Bundle purchase
   - Content access
   - Test submission
   - Results display

4. **Customize**
   - Update branding
   - Modify styling
   - Add custom features
   - Enhance UI/UX

## 🐛 Troubleshooting

### "Module not found" errors
```bash
npm install
```

### TypeScript errors
Check `tsconfig.json` and ensure all types are correct

### Supabase connection issues
- Verify environment variables in `.env`
- Check Supabase project is active
- Verify API keys are correct

### Payment not working
- Verify Razorpay key ID
- Test in Razorpay test mode first
- Check browser console for errors

## 📚 Documentation

- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query)

## 🤝 Support

For issues or questions:
1. Check `SUPABASE_SETUP.md` for database setup
2. Review this guide for common issues
3. Check browser console for errors
4. Verify all environment variables

## 🎊 You're All Set!

Your exam preparation platform is ready. Follow these steps:

1. ✅ Configure `.env` file
2. ✅ Set up Supabase database
3. ✅ Run `npm run dev`
4. ✅ Test the application
5. ✅ Add content and go live!

Happy coding! 🚀
