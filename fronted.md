## 🚀 Prompt: GenZ-Focused “REstart” Frontend — Next.js + Advanced Motion Design

### 🎯 Objective

Build a **complete, high-performance frontend** for the **“REstart” web application** using **Next.js (App Router)**.
The goal: a **fluid, modern, and interactive experience** that instantly connects with **Gen Z users** — visually engaging, ultra-fast, and full of subtle, meaningful motion.

---

### 🧠 Core Tech Stack

* **Framework:** Next.js (App Router, latest)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Animation:**

  * **Framer Motion** — Micro-interactions, transitions, layout animations
  * **GSAP + ScrollTrigger** — Scroll-based reveals, parallax, hero effects
  * **Lenis** — Global smooth-scrolling
* **Data Layer:**

  * **TanStack Query (React Query)** — API caching, mutations
  * **Zustand** — Lightweight global state (auth, user data)

---

### 🎨 Design Philosophy — “Fluid & Focused”

Aesthetics: clean, minimal, but dynamic.
Every interaction should **feel alive** — not flashy, just deeply responsive.

* **Gen Z UX:** Snappy, mobile-first, and intuitive
* **Micro-interactions:** Apply on all buttons, cards, and links
* **Fonts:** Modern sans-serif (Inter / Figtree)
* **Dual Theme (next-themes):**

| Mode  | Background | Text    | Primary Accent |
| ----- | ---------- | ------- | -------------- |
| Light | #FFFFFF    | #1A1A1A | #007BFF        |
| Dark  | #121212    | #E0E0E0 | #007BFF        |

Layout: open whitespace, fluid grids, fully responsive [cite: 103, 248].

---

### 🧩 Architecture — Next.js App Router

**File Structure:**

```
/app
 ┣ layout.tsx       → Root layout (theme, Lenis, Query provider)
 ┣ page.tsx         → Landing Page (SSG)
 ┣ discover/page.tsx → College Discover (Client)
 ┣ college/[id]/page.tsx → College Details (SSR)
 ┣ exams/[code]/page.tsx → Exam Details (SSR/SSG)
 ┣ dashboard/page.tsx → User Dashboard (Protected)
 ┣ (auth)/layout.tsx → Auth Modals (Login/Signup)
 ┗ loading.tsx      → Global Page Loader
```

---

### ⚡ Page Details

#### 🏠 `/app/page.tsx` — Landing Page

* Static (SSG)
* Hero: Animated headline with **Framer Motion text reveal**
* Scroll effects via **GSAP + ScrollTrigger** (How it Works, Features)

#### 🔍 `/app/discover/page.tsx` — College Discovery

* Client-side
* **Sticky FilterSidebar + ResultsGrid**
* Animate sidebar slide-in/out (mobile)
* Cards stagger in with **Framer Motion (staggerChildren)**

#### 🎓 `/app/college/[id]/page.tsx` — College Details

* **SSR for SEO & fast load**
* Sectional GSAP scroll reveals (Overview, Fees, Dates)
* Animated checklist (“How to Get In”) with motion checkmarks [cite: 278-284]

#### 🧾 `/app/exams/[code]/page.tsx` — Exam Details

* Dynamic SSR/SSG for SEO [cite: 104, 219]
* Similar motion behavior as college details

#### 💼 `/app/dashboard/page.tsx` — User Dashboard

* Protected route (client-rendered)
* “Saved Colleges” + “Prep Progress”
* Animate task bars & completion states with **Framer Motion** [cite: 107-113]

---

### 🧱 Key Components & Animations

**Navbar**

* Sticky with blur (`backdrop-blur-lg`)
* Hide/reveal on scroll (`useScroll`)
* Buttons/icons animate on hover/tap

**AuthModal**

* For login/signup [cite: 66-70]
* Uses **AnimatePresence** for scale/fade transitions

**CollegeCard**

* Hover: lift, scale, and shadow grow
* “Save” icon pops/jiggles when clicked

**FilterSidebar**

* Collapsible accordion sections (Framer Motion)
* Animated filter tag pills on add/remove

**LoadingSkeletons**

* Custom shimmering loaders (Framer Motion keyframes)
* For CollegeCard + CollegeDetail (boost perceived performance) [cite: 100, 245]

---

### 🧠 Data Layer Setup

**TanStack Query**

* `useQuery` for GETs (colleges, exams)
* `useInfiniteQuery` for infinite scroll [cite: 78]
* `useMutation` for POST/DELETE with **optimistic UI updates** [cite: 191-193]

**Zustand**

* `authStore`: JWT token + user profile
* `themeStore`: For handling theme sync (if beyond next-themes)

---

### ✅ Deliverables Summary

* Fully responsive, motion-rich Gen Z frontend
* Polished dual-theme design system
* Optimized data fetching and caching
* Smooth scroll + high-FPS animations
* Modular architecture aligned with MVP features [cite: 4–6, 32–41]

