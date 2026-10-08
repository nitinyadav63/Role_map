# 🚀 PathCraft — Reverse-Engineer Your Dream Career

> **An AI-powered, dynamic career architecture engine that reverse-engineers target roles into interactive hierarchical curricula (inspired by roadmap.sh, GitBook, and Notion) with collapsible phase folders, real-time replanning, revision notes, curated reference links, and interview prep.**

---

## 🔒 Security & Cloud Architecture
- **Zero Frontend Secrets**: The Gemini API key is never exposed in the browser.
- **Serverless API Execution**: All AI prompts are executed securely via a Vercel Serverless Function (`/api/generate-roadmap`) using backend environment variables (`process.env.GEMINI_API_KEY`).
- **Supabase Authentication & Database Persistence**: User accounts with Google OAuth & Email/Password login, automatically persisting roadmaps to a Postgres table (`roadmaps`).
- **Resilient Fallback**: Offline-first intelligent AI curriculum generation and local storage ensure smooth testing even without internet or API keys.

---

## 📌 The Problem Statement

### Why Existing Static Roadmaps Fail
- ❌ **One-Size-Fits-All:** Generic markdown checklists and static PDFs assume everyone starts from scratch, ignoring your existing verified technical baseline.
- ❌ **No Prerequisite Intelligence:** Static roadmaps don't know that understanding *Database Indexing* is essential before architecting *Distributed Caching* or *Event-Driven Microservices*.
- ❌ **Zero Actionable Proof-of-Work:** Reading tutorials is not enough. Hiring managers evaluate candidates on production-grade projects, architectural RFCs, and system design tradeoffs.
- ❌ **Lack of Dynamic Adaptation:** When you master a skill early, static roadmaps stay unchanged. They cannot automatically adapt, unlock adjacent branches, or recalibrate study timelines.

---

## ✨ Core Features

### 1. 🧠 Target-First AI Reverse-Engineering Engine
- Input any target title (e.g., *Staff AI Engineer @ Stripe*, *SDE-2 @ Microsoft*, *VP of Engineering*), current skills, and weekly commitment.
- Powered by **Google Gemini 1.5 Flash** serverless backend, the engine queries leveling rubrics, compensation benchmarks, and real hiring requirements to generate tailored multi-phase sprints.

### 2. 📂 Collapsible Phase Hierarchy & Topics Tree (Roadmap.sh / GitBook Style)
- **Phase Folders (Collapsible Accordion):**
  - Grouped into 4 sequential stages (*Fundamentals & Prerequisites*, *Core Engineering & Architecture*, *High-Scale Specialization*, *Capstone Projects & Offer Readiness*).
  - Displays progress percentage, completed skills counter (`3/4 Skills`), and timeframe badges (`Month 1 - 3`).
- **Sleek Topic Cards:**
  - Status badges (🟢 `Mastered`, 🟣 `Active Focus`, 🟡 `Skill Gap`, 🏆 `Target Goal`).
  - Priority chips (`Must-Have`, `Recommended`, `Elective`).
  - Quick inline **"Mark Known"** action toggle right on each card.

### 3. 📖 Deep-Dive Topic Drawer (`NodeActionCenter.tsx`)
Clicking any skill or topic opens a comprehensive documentation-style drawer containing:
- **📝 Quick Revision Notes:** Concise concept summary, mental models, and production architecture gotchas.
- **🔗 Reference Sites & Documentation:** Curated clickable links to official docs, GitHub repositories, and architectural guides.
- **💻 Practice & Hands-On:** Concrete coding challenges and deliberate practice steps.
- **🎯 Real Interview Questions:** Mock technical and architectural questions with collapsible answer hints.
- **📦 Proof-of-Work Projects:** End-to-end portfolio briefs with deliverables to showcase to hiring managers.

### 4. ⚡ Real-Time Dynamic Replanning Engine (`replanningEngine.ts`)
- **Topological Prerequisite Traversal:** When you mark a skill as known, the engine evaluates downstream dependencies.
- **Instant Path Unlocking:** Downstream topics whose prerequisites are fully satisfied are automatically promoted from `missing` to `active`.
- **Live Metric Recalibration:** Recomputes remaining study hours, promotion velocity, and total readiness score in real-time.

### 5. 🗄️ Supabase Auth & Cloud Database Sync
- **Authentication**: Seamless sign in with Google OAuth or Email/Password.
- **Database Schema**: Saved roadmaps table stores candidate journeys in JSONB format.

```sql
-- Supabase SQL Schema for roadmaps table
create table public.roadmaps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  target_role text not null,
  roadmap_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.roadmaps enable row level security;

create policy "Users can view and manage their own roadmaps"
  on public.roadmaps for all
  using (auth.uid() = user_id);
```

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Core Framework** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **Backend & Serverless** | [Vercel Serverless Functions](https://vercel.com/docs/functions), [Node.js](https://nodejs.org/) |
| **Database & Auth** | [Supabase (PostgreSQL & Auth)](https://supabase.com/) |
| **Styling & Aesthetics** | [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/) |
| **AI & Validation** | [Google Gemini 1.5 Flash API](https://ai.google.dev/), [Zod](https://zod.dev/) |

---

## ⚡ Local Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` or `yarn`

### 1. Clone & Install Dependencies
```bash
# Navigate to project directory
cd c:/PROJECTS/1PROJECT

# Install all packages
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini and Supabase credentials:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
