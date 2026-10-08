import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingPage } from './components/LandingPage';
import { CareerForm, type CareerFormData } from './components/CareerForm';
import { RoadmapAccordionTree } from './components/RoadmapAccordionTree';
import { AuthModal } from './components/AuthModal';
import { SavedRoadmapsModal } from './components/SavedRoadmapsModal';
import { generateRoadmapWithGemini } from './services/geminiService';
import {
  saveRoadmapToSupabase,
  fetchUserRoadmaps,
  deleteRoadmapFromSupabase,
  type SavedRoadmapRecord
} from './services/roadmapDbService';
import { supabase } from './utils/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { CareerRoadmapResponse } from './types/roadmap';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Compass,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Cpu,
  User,
  LogOut,
  FolderKanban
} from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'form' | 'roadmap'>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CareerFormData | null>(null);
  const [roadmapData, setRoadmapData] = useState<CareerRoadmapResponse | null>(null);
  const [activeRecordId, setActiveRecordId] = useState<string | undefined>(undefined);
  const [apiError, setApiError] = useState<string | null>(null);

  // Supabase Auth State
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmapRecord[]>([]);

  // Load user session & saved roadmaps on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshSavedRoadmaps = useCallback(async (currentUserId?: string) => {
    const list = await fetchUserRoadmaps(currentUserId);
    setSavedRoadmaps(list);
  }, []);

  useEffect(() => {
    refreshSavedRoadmaps(user?.id);
  }, [user, refreshSavedRoadmaps]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    refreshSavedRoadmaps(undefined);
  };

  // Form submission & Roadmap Generation
  const handleFormSubmit = async (data: CareerFormData) => {
    setFormData(data);
    setApiError(null);
    setIsLoading(true);

    try {
      const generated = await generateRoadmapWithGemini(data);

      // Save to Supabase table 'roadmaps' (or local storage fallback)
      const savedRecord = await saveRoadmapToSupabase(generated, user?.id);
      if (savedRecord) {
        setActiveRecordId(savedRecord.id);
        refreshSavedRoadmaps(user?.id);
      }

      setRoadmapData(generated);
      setIsLoading(false);
      setCurrentView('roadmap');
    } catch (err: unknown) {
      console.error('Error generating roadmap:', err);
      const msg = err instanceof Error ? err.message : 'Failed to generate roadmap from Gemini API.';
      setApiError(msg);
      setIsLoading(false);
    }
  };

  // Update roadmap state & auto-sync with Supabase
  const handleUpdateRoadmap = async (updated: CareerRoadmapResponse) => {
    setRoadmapData(updated);
    if (activeRecordId || user?.id) {
      const saved = await saveRoadmapToSupabase(updated, user?.id, activeRecordId);
      if (saved && !activeRecordId) {
        setActiveRecordId(saved.id);
      }
      refreshSavedRoadmaps(user?.id);
    }
  };

  // Select a saved roadmap to view
  const handleSelectSavedRoadmap = (
    selectedRoadmap: CareerRoadmapResponse,
    recordId: string
  ) => {
    setRoadmapData(selectedRoadmap);
    setActiveRecordId(recordId);
    setCurrentView('roadmap');
  };

  // Delete a saved roadmap
  const handleDeleteSavedRoadmap = async (recordId: string) => {
    await deleteRoadmapFromSupabase(recordId, user?.id);
    refreshSavedRoadmaps(user?.id);
    if (activeRecordId === recordId) {
      setActiveRecordId(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 selection:bg-indigo-600 selection:text-white">
      <AnimatePresence mode="wait">
        {/* View 1: Landing Page */}
        {currentView === 'landing' && (
          <motion.div
            key="landing-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage
              onStartBuilding={() => setCurrentView('form')}
              currentUser={user}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenSavedRoadmaps={() => setIsSavedModalOpen(true)}
              onSignOut={handleSignOut}
              savedCount={savedRoadmaps.length}
            />
          </motion.div>
        )}

        {/* View 2: Career Input Form & Multistep Loading State */}
        {currentView === 'form' && (
          <motion.div
            key="form-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col justify-between p-6 sm:p-10"
          >
            {/* Top Navigation */}
            <header className="max-w-6xl mx-auto w-full flex items-center justify-between pb-6">
              <button
                onClick={() => setCurrentView('landing')}
                disabled={isLoading}
                className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors group px-3.5 py-2 rounded-xl hover:bg-white/5 disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-indigo-400" />
                <span>Back to Home</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-md">
                  <Compass className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-base tracking-tight hidden sm:inline">
                  PathCraft<span className="text-indigo-400">.ai</span>
                </span>
              </div>

              {/* User badge */}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono hidden md:inline truncate max-w-[140px]">
                    {user.email}
                  </span>
                  <button
                    onClick={() => setIsSavedModalOpen(true)}
                    className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                    title="My Roadmaps"
                  >
                    <FolderKanban className="w-4 h-4 text-indigo-400" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5"
                >
                  Sign In
                </button>
              )}
            </header>

              <CareerForm
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                errorMessage={apiError}
                onClearError={() => setApiError(null)}
              />

            {/* Footer */}
            <footer className="text-center text-xs text-slate-500 py-4 font-mono">
              Securely powered by Google Gemini Serverless Backend & Supabase Database
            </footer>
          </motion.div>
        )}

        {/* View 3: Collapsible Accordion & Hierarchical Tree View */}
        {currentView === 'roadmap' && roadmapData && (
          <motion.div
            key="roadmap-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen flex flex-col p-4 sm:p-8 max-w-6xl mx-auto space-y-6"
          >
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCurrentView('form')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all hover:text-white group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-indigo-400" />
                  <span>Edit Parameters</span>
                </button>
                <button
                  onClick={() => setCurrentView('landing')}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all hover:text-white"
                >
                  Home
                </button>
                <button
                  onClick={() => setIsSavedModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#141426] hover:bg-[#1e1e36] text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-all"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Saved ({savedRoadmaps.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {user ? (
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-xs text-slate-300">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate max-w-[120px] font-mono text-[11px]">{user.email}</span>
                    <button
                      onClick={handleSignOut}
                      title="Sign Out"
                      className="ml-1 text-slate-400 hover:text-white"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all"
                  >
                    Sign In to Save
                  </button>
                )}

                <button
                  onClick={() => {
                    if (formData) {
                      handleFormSubmit(formData);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 hover:opacity-95 flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            {/* Generated Profile Summary Banner */}
            <div className="bg-gradient-to-br from-[#151528] via-[#10101c] to-[#0a0a0f] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Supabase Synced • Live Cloud State</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Reverse-Engineered Path to{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                      {roadmapData.targetSummary.targetRole}
                    </span>
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1.5 bg-[#1a1a2e] px-3 py-1.5 rounded-xl border border-white/5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {roadmapData.targetSummary.hoursPerWeek} hrs/week
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#1a1a2e] px-3 py-1.5 rounded-xl border border-white/5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      {roadmapData.targetSummary.timelineMonths} Months Horizon
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#1a1a2e] px-3 py-1.5 rounded-xl border border-white/5 font-mono">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      {roadmapData.targetSummary.targetSalaryRange}
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#1a1a2e] px-3 py-1.5 rounded-xl border border-white/5 font-mono">
                      <TrendingUp className="w-3.5 h-3.5 text-pink-400" />
                      {roadmapData.targetSummary.marketDemand}
                    </span>
                  </div>
                </div>

                {/* Growth Areas */}
                <div className="bg-[#0e0e18] p-4 sm:p-5 rounded-2xl border border-white/5 max-w-md space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" /> High-Leverage Focus Domains
                  </span>
                  <div className="space-y-1.5">
                    {roadmapData.targetSummary.keyGrowthAreas.map((area, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Phase Hierarchy & Topics Tree Explorer */}
            <div className="w-full">
              <RoadmapAccordionTree
                roadmapData={roadmapData}
                onUpdateRoadmap={handleUpdateRoadmap}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => refreshSavedRoadmaps(user?.id)}
      />

      {/* Saved Roadmaps Modal */}
      <SavedRoadmapsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        roadmaps={savedRoadmaps}
        onSelectRoadmap={handleSelectSavedRoadmap}
        onDeleteRoadmap={handleDeleteSavedRoadmap}
      />
    </div>
  );
}

export default App;
