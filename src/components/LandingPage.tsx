import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Compass,
  Zap,
  User,
  LogOut,
  FolderKanban,
  GitFork,
  Terminal,
  Database
} from 'lucide-react';
import { RoadmapPreview } from './RoadmapPreview';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface LandingPageProps {
  onStartBuilding: () => void;
  currentUser?: SupabaseUser | null;
  onOpenAuth?: () => void;
  onOpenSavedRoadmaps?: () => void;
  onSignOut?: () => void;
  savedCount?: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartBuilding,
  currentUser,
  onOpenAuth,
  onOpenSavedRoadmaps,
  onSignOut,
  savedCount = 0,
}) => {
  return (
    <div className="min-h-screen bg-[#09090d] text-zinc-100 flex flex-col relative selection:bg-indigo-500 selection:text-white">
      {/* Subtle top ambient gradient (Linear style) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-0" />

      {/* Top Navbar */}
      <header className="w-full border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-50 bg-[#09090d]/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-indigo-400">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1">
              PathCraft<span className="text-zinc-500 font-mono text-xs">/dev</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {onOpenSavedRoadmaps && (
                  <button
                    onClick={onOpenSavedRoadmaps}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Saved Roadmaps ({savedCount})</span>
                  </button>
                )}

                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono">
                  <User className="w-3 h-3 text-zinc-500" />
                  <span className="truncate max-w-[120px] text-[11px]">{currentUser.email}</span>
                </div>

                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    title="Sign Out"
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-800 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {onOpenSavedRoadmaps && savedCount > 0 && (
                  <button
                    onClick={onOpenSavedRoadmaps}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Saved ({savedCount})</span>
                  </button>
                )}
                {onOpenAuth && (
                  <button
                    onClick={onOpenAuth}
                    className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white text-xs font-medium hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onStartBuilding}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Build Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 z-10">
        {/* Minimal Hero */}
        <section className="pt-16 sm:pt-24 pb-12 px-6 max-w-4xl mx-auto text-center">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>Interactive Engineering Curriculum Generator</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight"
          >
            Reverse-engineer your engineering career path.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Enter your target role and existing skills. Get a structured curriculum organized by phases, topics, practice sandboxes, and real-time dependency replanning.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={onStartBuilding}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Build My Roadmap</span>
              <ArrowRight className="w-4 h-4 text-zinc-900" />
            </button>

            <a
              href="#preview"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-sm border border-zinc-800 transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore Sample Track</span>
            </a>
          </motion.div>
        </section>

        {/* Interactive Sample Simulation Section */}
        <section id="preview" className="py-8 px-6 max-w-6xl mx-auto">
          <RoadmapPreview onExploreMore={onStartBuilding} />
        </section>

        {/* How It Works (Clean Developer Features) */}
        <section className="py-16 px-6 max-w-5xl mx-auto border-t border-zinc-800/80">
          <div className="mb-10 text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Designed for deliberate technical progression
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Every roadmap is synthesized as a structured curriculum with concrete deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <GitFork className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Dynamic DAG Replanning
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Mark any skill as known to automatically recalculate downstream prerequisite gates, remaining hours, and overall readiness.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Practice Drills & Challenges
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Every topic links directly to relevant LeetCode problem sets, CodeSandbox REPLs, and hands-on coding challenges.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Supabase Cloud Persistence
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Save multiple target role roadmaps, track completion over time, and resume anywhere with secure Row Level Security.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 px-6 bg-[#07070a]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-300 font-semibold">PathCraft</span>
            <span>• Developer Career Curriculum</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Google Gemini API & Supabase</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
