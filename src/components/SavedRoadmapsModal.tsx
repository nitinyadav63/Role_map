import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FolderKanban,
  Calendar,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import type { SavedRoadmapRecord } from '../services/roadmapDbService';
import type { CareerRoadmapResponse } from '../types/roadmap';

interface SavedRoadmapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmaps: SavedRoadmapRecord[];
  onSelectRoadmap: (roadmap: CareerRoadmapResponse, recordId: string) => void;
  onDeleteRoadmap: (recordId: string) => void;
}

export const SavedRoadmapsModal: React.FC<SavedRoadmapsModalProps> = ({
  isOpen,
  onClose,
  roadmaps,
  onSelectRoadmap,
  onDeleteRoadmap,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-[#121222] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg">
                  Your Saved Career Trajectories
                </h3>
                <span className="text-xs text-slate-400">
                  {roadmaps.length} {roadmaps.length === 1 ? 'roadmap' : 'roadmaps'} synced with Supabase Database
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of saved roadmaps */}
          <div className="flex-1 overflow-y-auto py-5 space-y-3 pr-1">
            {roadmaps.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-slate-500">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">No Saved Roadmaps Found</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Generate a roadmap to automatically sync and save your career trajectory here.
                </p>
              </div>
            ) : (
              roadmaps.map((record) => {
                const roadmap = record.roadmap_data;
                const dateStr = new Date(record.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                const completedCount =
                  roadmap.nodes?.filter((n) => n.status === 'completed').length || 0;
                const totalNodes = roadmap.nodes?.length || 1;
                const readiness =
                  roadmap.targetSummary?.readinessScore ||
                  Math.round((completedCount / totalNodes) * 100);

                return (
                  <motion.div
                    key={record.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 sm:p-5 rounded-2xl bg-[#18182b] hover:bg-[#1f1f38] border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-purple-400 font-semibold flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          {record.target_role}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          Saved {dateStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          {readiness}% Readiness
                        </span>
                        <span>•</span>
                        <span className="text-indigo-300">
                          {completedCount}/{totalNodes} Skills Mastered
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onDeleteRoadmap(record.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete roadmap"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          onSelectRoadmap(record.roadmap_data, record.id);
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                      >
                        <span>Resume</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Live cloud synchronization active
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
