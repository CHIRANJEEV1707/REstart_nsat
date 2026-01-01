# 🚀 REstart Admin Panel - Quick Start Guide

## What You've Got

A complete, production-ready admin panel with:

✅ **React 18 + Vite + TypeScript**
✅ **Supabase Backend** (PostgreSQL + Auth + Storage)
✅ **Tailwind CSS + shadcn/ui** components
✅ **Dashboard** with real-time analytics
✅ **Bundle Management** (Full CRUD)
✅ **Role-Based Access Control**
✅ **Modern UI** with responsive design

---

## 🏃 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd REstart-admin
npm install
```

### Step 2: Setup Supabase

1. **Create Account:**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project" (Free tier available)

2. **Create Project:**
   - Project name: `restart-admin`
   - Database password: (save this!)
   - Region: Choose closest to you

3. **Get API Keys:**
   - Go to **Settings** → **API**
   - Copy:
     - Project URL: `https://xxxxx.supabase.co`
     - Anon public key: `eyJhb...`

### Step 3: Configure Environment

Create `.env` file in `REstart-admin` folder:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Run Database Migration

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy entire contents of `supabase-migration.sql`
5. Paste and click **RUN**
6. ✅ You should see "Success. No rows returned"

### Step 5: Create Admin User

**Option A: Manual (Recommended)**

1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Email: `admin@restart.com`
4. Password: `Admin@123` (change later!)
5. Click **Create user**
6. **Copy the User ID** (looks like: `a1b2c3d4-...`)

7. Go to **SQL Editor** → **New Query**
8. Paste this (replace `USER_ID` with copied ID):

```sql
INSERT INTO admin_profiles (id, full_name, email, role, permissions)
VALUES (
  'USER_ID_HERE',
  'Super Admin',
  'admin@restart.com',
  'super_admin',
  '["full_access"]'::jsonb
);
```

9. Click **RUN**

**Option B: SQL Only**

```sql
-- This creates both auth user and profile
-- Change email/password as needed
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@restart.com',
    crypt('Admin@123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW()
  ) RETURNING id, email
)
INSERT INTO admin_profiles (id, full_name, email, role, permissions)
SELECT id, 'Super Admin', email, 'super_admin', '["full_access"]'::jsonb
FROM new_user;
```

### Step 6: Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3001**

Login with:
- Email: `admin@restart.com`
- Password: `Admin@123`

---

## 🎉 You're Done!

You should now see:
- Dashboard with stats cards
- Sidebar with all modules
- Bundle management page (fully functional)
- Placeholder pages for other modules

---

## 📱 What Works Now

### ✅ Fully Functional
- **Authentication** - Login/Logout with Supabase
- **Dashboard** - Live stats from database
- **Bundles** - Create, Edit, Delete, Search
  - Auto-calculate final price
  - Upload thumbnails
  - Status management
  - Exam type filtering

### 🚧 Placeholder Pages (Ready for Development)
- Subjects & Modules
- Content (PDFs/Videos)
- Tests & Questions
- Users
- Orders
- Coupons
- Notifications
- CMS Pages
- Settings

---

## 🔨 Next Steps

### Add More Features

1. **Content Upload:**
```bash
# Create Supabase Storage bucket
# Go to Storage → Create bucket → "content-files"
```

2. **File Upload Component:**
```typescript
const uploadFile = async (file: File) => {
  const { data, error } = await supabase.storage
    .from('content-files')
    .upload(`pdfs/${file.name}`, file);
  
  return data?.path;
};
```

3. **Build More Pages:**
   - Copy structure from `Bundles.tsx`
   - Replace table name and fields
   - Add to routing in `App.tsx`

### Customize Styling

```typescript
// tailwind.config.js - Change colors
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(221, 83%, 53%)", // Change this!
      },
    },
  },
}
```

---

## 🐛 Troubleshooting

### "Invalid credentials" on login
- Check admin_profiles table has your user
- Verify email matches auth.users email
- Try password reset in Supabase Auth

### "Not authorized" error
- Ensure RLS policies are created
- Check user has role in admin_profiles
- Verify JWT token in browser DevTools

### Database connection error
- Check .env file has correct values
- Verify Supabase project is not paused
- Check API keys are from same project

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Learn More

- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

## 🚀 Deploy to Production

### Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Add environment variables in Vercel dashboard.

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## 💡 Pro Tips

1. **Use React Query DevTools:**
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Add to App.tsx
<ReactQueryDevtools initialIsOpen={false} />
```

2. **Enable Supabase Realtime:**
```typescript
const channel = supabase
  .channel('bundles')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'bundles' }, 
    (payload) => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] })
    }
  )
  .subscribe()
```

3. **Add Dark Mode:**
```typescript
// Already configured! Just add toggle button
<Button onClick={() => document.documentElement.classList.toggle('dark')}>
  Toggle Dark Mode
</Button>
```

---

**Need Help?** Open an issue on GitHub or check the README.md for more details!

**Happy Building! 🎉**
