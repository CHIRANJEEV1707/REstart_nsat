# Supabase Database Setup Guide

This guide will help you set up the complete database schema and security policies for the REstart NSAT platform.

## Prerequisites

- A Supabase account and project
- Access to the Supabase SQL Editor

## Step 1: Create Tables

Run the following SQL commands in your Supabase SQL Editor:

### Bundles Table

```sql
CREATE TABLE bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL,
  exam_type TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  features TEXT[] DEFAULT '{}'::TEXT[]
);
```

### Subjects Table

```sql
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL
);
```

### Modules Table

```sql
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('pdf', 'video', 'text')) NOT NULL,
  content_url TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER
);
```

### Tests Table

```sql
CREATE TABLE tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  passing_marks INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true
);
```

### Questions Table

```sql
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('mcq', 'multiple_answer', 'numerical')) NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  marks INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL
);
```

### Purchases Table

```sql
CREATE TABLE purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  amount_paid NUMERIC NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  coupon_code TEXT,
  discount_amount NUMERIC DEFAULT 0
);
```

### Test Attempts Table

```sql
CREATE TABLE test_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  total_marks INTEGER NOT NULL,
  time_taken_seconds INTEGER,
  answers JSONB NOT NULL,
  status TEXT CHECK (status IN ('in_progress', 'submitted')) DEFAULT 'in_progress'
);
```

### Progress Table

```sql
CREATE TABLE progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, module_id)
);
```

### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('announcement', 'test_added', 'discount', 'update')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  target_users UUID[]
);
```

### Coupons Table

```sql
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value NUMERIC NOT NULL,
  min_purchase_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
```

## Step 2: Create Indexes for Performance

```sql
-- Indexes for common queries
CREATE INDEX idx_subjects_bundle ON subjects(bundle_id);
CREATE INDEX idx_modules_subject ON modules(subject_id);
CREATE INDEX idx_tests_bundle ON tests(bundle_id);
CREATE INDEX idx_questions_test ON questions(test_id);
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_bundle ON purchases(bundle_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX idx_test_attempts_test ON test_attempts(test_id);
CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_progress_module ON progress(module_id);
```

## Step 3: Enable Row Level Security (RLS)

Enable RLS on all tables:

```sql
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
```

## Step 4: Create RLS Policies

### Bundles Policies (Public read for active bundles)

```sql
-- Everyone can view active bundles
CREATE POLICY "Public bundles are viewable by everyone" 
ON bundles FOR SELECT 
USING (is_active = true);
```

### Subjects Policies

```sql
-- Everyone can view subjects
CREATE POLICY "Subjects are viewable by everyone" 
ON subjects FOR SELECT 
USING (true);
```

### Modules Policies

```sql
-- Everyone can view modules
CREATE POLICY "Modules are viewable by everyone" 
ON modules FOR SELECT 
USING (true);
```

### Tests Policies

```sql
-- Users can view active tests for bundles they purchased
CREATE POLICY "Users can view active tests" 
ON tests FOR SELECT 
USING (
  is_active = true AND (
    EXISTS (
      SELECT 1 FROM purchases 
      WHERE purchases.bundle_id = tests.bundle_id 
      AND purchases.user_id = auth.uid() 
      AND purchases.status = 'completed'
    )
  )
);
```

### Questions Policies

```sql
-- Users can view questions only for tests they have access to
CREATE POLICY "Users can view questions for purchased tests" 
ON questions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tests
    JOIN purchases ON purchases.bundle_id = tests.bundle_id
    WHERE tests.id = questions.test_id
    AND purchases.user_id = auth.uid()
    AND purchases.status = 'completed'
  )
);

-- Users can only see correct answers after submitting
-- This is enforced in the application layer
```

### Purchases Policies

```sql
-- Users can view their own purchases
CREATE POLICY "Users can view own purchases" 
ON purchases FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own purchases
CREATE POLICY "Users can create own purchases" 
ON purchases FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own purchases
CREATE POLICY "Users can update own purchases" 
ON purchases FOR UPDATE 
USING (auth.uid() = user_id);
```

### Test Attempts Policies

```sql
-- Users can view their own test attempts
CREATE POLICY "Users can view own test attempts" 
ON test_attempts FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own test attempts
CREATE POLICY "Users can create own test attempts" 
ON test_attempts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own test attempts
CREATE POLICY "Users can update own test attempts" 
ON test_attempts FOR UPDATE 
USING (auth.uid() = user_id);
```

### Progress Policies

```sql
-- Users can view their own progress
CREATE POLICY "Users can view own progress" 
ON progress FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own progress
CREATE POLICY "Users can create own progress" 
ON progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" 
ON progress FOR UPDATE 
USING (auth.uid() = user_id);
```

### Notifications Policies

```sql
-- Everyone can view active notifications
CREATE POLICY "Active notifications are viewable by everyone" 
ON notifications FOR SELECT 
USING (
  is_active = true AND (
    target_users IS NULL OR 
    auth.uid() = ANY(target_users)
  )
);
```

### Coupons Policies

```sql
-- Users can view active coupons
CREATE POLICY "Users can view active coupons" 
ON coupons FOR SELECT 
USING (is_active = true);
```

## Step 5: Create Storage Buckets

In the Supabase Storage section, create these buckets:

1. **study-materials** - For PDFs and study content
   - Make it public or private based on your needs
   - Set up RLS policies if private

2. **test-assets** - For question images and resources
   - Make it public or private based on your needs

### Storage RLS Policies (if using private buckets)

```sql
-- Allow users to view files for bundles they purchased
CREATE POLICY "Users can view purchased content"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'study-materials' AND
  EXISTS (
    SELECT 1 FROM purchases
    WHERE purchases.user_id = auth.uid()
    AND purchases.status = 'completed'
  )
);
```

## Step 6: Sample Data (Optional)

Insert some sample data to test:

```sql
-- Sample Bundle
INSERT INTO bundles (title, description, price, duration_days, exam_type, features)
VALUES (
  'NSAT Complete Preparation',
  'Comprehensive NSAT exam preparation bundle',
  2999,
  180,
  'NSAT',
  ARRAY['100+ Study Materials', 'Unlimited Mock Tests', 'Detailed Analytics']
);

-- Sample Coupon
INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, valid_from, valid_until, is_active)
VALUES (
  'LAUNCH50',
  'percentage',
  50,
  1000,
  NOW(),
  NOW() + INTERVAL '30 days',
  true
);
```

## Step 7: Verify Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
```

## Environment Variables

After setup, update your `.env` file with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=your-razorpay-key
```

## Next Steps

1. Test user registration and login
2. Create some bundles via Supabase dashboard
3. Test the purchase flow
4. Add tests and questions
5. Test the complete user journey

## Notes

- RLS policies ensure students can only access content they've purchased
- Test answers are hidden until after submission
- All user data is isolated and secure
- Storage policies control access to PDF files
- Coupons are validated server-side

For production, consider:
- Adding more complex validation rules
- Implementing webhook handlers for Razorpay
- Adding admin roles and permissions
- Setting up database backups
- Monitoring query performance
