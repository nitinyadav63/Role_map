# 🚀 PathCraft — Career Roadmapper

An AI-powered, dynamic career architecture engine that reverse-engineers target roles into interactive hierarchical curricula (inspired by roadmap.sh, GitBook, and Notion).

---

## 🔒 Architecture & Security

* **Zero Frontend Secrets:** Gemini API keys are kept entirely server-side.
* **Serverless Execution:** AI prompts run via Vercel Serverless Functions (`/api/generate-roadmap`).
* **Supabase Persistence:** Secure user sessions (Google OAuth/Email) with PostgreSQL storage.

---

## ✨ Core Features

1. **Target-First AI Engine:** Reverse-engineers any target title into tailored multi-phase sprints.
2. **Collapsible Phase Hierarchy:** 4 sequential stages with progress meters and quick inline toggles.
3. **Deep-Dive Topic Drawer:** Documentation-style side panel featuring revision notes, reference links, practice tasks, interview questions, and proof-of-work project briefs.
4. **Dynamic Replanning Engine:** Recalculates dependencies, unlocks ready topics, and updates study velocity when skills are marked known.

---

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React
* **Backend:** Vercel Serverless Functions, Node.js
* **Database & Auth:** Supabase (PostgreSQL & Auth)
* **AI:** Google Gemini 1.5 Flash API, Zod

---

##👨‍💻 Candidate & Demo Profile

Demo Account Email: demouser01@gmail.com

Demo Account Password: Pass1234


## ⚡ Quick Start

```bash
cd c:/PROJECTS/1PROJECT
npm install
# Configure your .env file
npm run dev


