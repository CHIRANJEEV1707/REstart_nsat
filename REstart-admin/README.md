# REstart Admin Panel

A comprehensive admin panel built with **React + Vite + Supabase + TypeScript** for managing the REstart EdTech platform.

## 🚀 Features

- ✅ **Dashboard** with real-time analytics
- ✅ **Bundle Management** - Create, edit, delete course bundles
- ✅ **Subject & Module Management** - Organize content hierarchy
- ✅ **Content Management** - Upload PDFs and videos
- ✅ **Test Management** - Create mock tests with questions
- ✅ **User Management** - Manage students and access
- ✅ **Order & Payment Tracking** - Monitor transactions
- ✅ **Coupon System** - Create discount codes
- ✅ **Notifications** - Send announcements to users
- ✅ **CMS Pages** - Edit website content
- ✅ **Role-Based Access Control** - Super Admin, Content Manager, Support, Finance

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router DOM v6
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Notifications:** Sonner

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account ([supabase.com](https://supabase.com))

### Step 1: Clone and Install

```bash
cd REstart-admin
npm install
```

### Step 2: Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API** and copy:
   - Project URL
   - Anon/Public key

3. Run the database migration:
   - Open **SQL Editor** in Supabase Dashboard
   - Copy and paste the contents of `supabase-migration.sql`
   - Click **Run**

### Step 3: Configure Environment

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Create Admin User

1. Go to **Authentication > Users** in Supabase Dashboard
2. Click **Add user** → Create with email/password
3. Copy the User UUID
4. Go to **SQL Editor** and run:

```sql
INSERT INTO admin_profiles (id, full_name, email, role, permissions)
VALUES (
  'your-user-uuid-here',
  'Your Name',
  'your-email@example.com',
  'super_admin',
  '["full_access"]'::jsonb
);
```

### Step 5: Run Development Server

```bash
npm run dev
```

Visit **http://localhost:3001** and login with your admin credentials!

## 📁 Project Structure

```
src/
├── components/
│   ├── layouts/
│   │   └── AdminLayout.tsx      # Main admin layout with sidebar
│   ├── ui/                      # shadcn/ui components
│   └── ProtectedRoute.tsx       # Auth guard
├── contexts/
│   └── AuthContext.tsx          # Supabase auth context
├── lib/
│   ├── supabase.ts              # Supabase client
│   └── utils.ts                 # Utility functions
├── pages/
│   ├── Login.tsx                # Admin login
│   ├── Dashboard.tsx            # Analytics dashboard
│   ├── Bundles.tsx              # Bundle CRUD
│   ├── Subjects.tsx             # Subject management
│   ├── Content.tsx              # PDF/Video uploads
│   ├── Tests.tsx                # Test creation
│   ├── Users.tsx                # Student management
│   ├── Orders.tsx               # Payment tracking
│   ├── Coupons.tsx              # Discount codes
│   ├── Notifications.tsx        # Send alerts
│   ├── CMS.tsx                  # Edit pages
│   └── Settings.tsx             # Admin settings
├── types/
│   └── database.ts              # TypeScript types
└── App.tsx                      # Main app with routing
```

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **JWT-based authentication** via Supabase Auth
- **Role-based access control** (RBAC)
- **Audit logging** for all admin actions
- **Protected routes** with authentication guards

## 🎨 UI Components (shadcn/ui)

Pre-configured components:
- Button, Input, Textarea, Label
- Card, Avatar, Dropdown Menu
- Toast notifications (Sonner)
- More components can be added from [shadcn/ui](https://ui.shadcn.com)

## 📊 Database Schema

Key tables:
- `admin_profiles` - Admin user profiles
- `bundles` - Course bundles
- `subjects` - Bundle subjects
- `modules` - Subject modules
- `pdf_content` - PDF files
- `video_content` - Video files
- `tests` - Mock tests
- `questions` - Test questions
- `students` - Student users
- `orders` - Purchase orders
- `coupons` - Discount coupons
- `notifications` - Announcements
- `cms_pages` - CMS content
- `audit_logs` - Activity logs

See `supabase-migration.sql` for complete schema.

## 🚀 Deployment

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

Add environment variables in Vercel dashboard.

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## 🔧 Configuration

### Admin Roles

Edit roles in `src/types/database.ts`:
- `super_admin` - Full access
- `content_manager` - Upload content, create tests
- `support` - User management
- `finance` - View payments

### Permissions

Add custom permissions in `admin_profiles.permissions` JSONB column:
```json
["create_bundle", "edit_test", "view_reports"]
```

## 📝 TODO / Roadmap

- [x] Dashboard with analytics
- [x] Bundle CRUD operations
- [ ] Subject/Module management UI
- [ ] Content upload with Supabase Storage
- [ ] Test creator with question bank
- [ ] User management table
- [ ] Order tracking with filters
- [ ] Coupon generator
- [ ] Notification sender
- [ ] CMS rich text editor
- [ ] CSV bulk import for questions
- [ ] Analytics charts (Recharts)
- [ ] Email notifications
- [ ] Dark mode toggle

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

## 📄 License

MIT License - See LICENSE file

## 💬 Support

For issues or questions, open a GitHub issue or contact the team.

---

**Built with ❤️ by the REstart Team**
