import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trophy,
  HelpCircle,
  FolderGit2,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  FileText,
  ExternalLink,
  Code2,
  Bookmark
} from 'lucide-react';
import type { RoadmapNodeData, NodeStatus } from '../types/roadmap';

interface NodeActionCenterProps {
  node: RoadmapNodeData | null;
  allNodes?: RoadmapNodeData[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsKnown?: (nodeId: string) => void;
  onUpdateStatus?: (nodeId: string, newStatus: NodeStatus) => void;
}

export const NodeActionCenter: React.FC<NodeActionCenterProps> = ({
  node,
  allNodes = [],
  isOpen,
  onClose,
  onMarkAsKnown,
  onUpdateStatus,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'notes' | 'references' | 'practice' | 'interview' | 'projects'>('notes');

  if (!isOpen || !node) return null;

  const isCompleted = node.status === 'completed';
  const isActive = node.status === 'active';
  const isMissing = node.status === 'missing';
  const isTarget = node.status === 'target';

  // Find prerequisite node objects
  const prerequisiteNodes = (node.prerequisites || [])
    .map((prereqId) => allNodes.find((n) => n.id === prereqId))
    .filter(Boolean) as RoadmapNodeData[];

  const allPrereqsMet =
    prerequisiteNodes.length === 0 ||
    prerequisiteNodes.every((p) => p.status === 'completed');

  const handleMarkAsKnown = () => {
    if (onMarkAsKnown) {
      onMarkAsKnown(node.id);
    } else if (onUpdateStatus) {
      onUpdateStatus(node.id, isCompleted ? 'missing' : 'completed');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-12">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="w-screen max-w-2xl bg-[#0f0f1c] border-l border-white/10 shadow-2xl flex flex-col justify-between"
          >
            {/* Top Sticky Header */}
            <div className="p-6 border-b border-white/10 bg-[#121224]/95 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-medium">
                    {node.category || node.phase}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border ${
                      node.priority === 'critical'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {node.priority} priority
                  </span>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {node.title}
              </h2>

              {/* Status Indicator & Live Quick Switcher */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#17172c] rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-xs">
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isActive && <Sparkles className="w-4 h-4 text-indigo-400" />}
                  {isMissing && <AlertCircle className="w-4 h-4 text-amber-400" />}
                  {isTarget && <Trophy className="w-4 h-4 text-purple-400" />}
                  <span className="text-slate-300 font-medium">
                    Status:{' '}
                    <strong className="text-white capitalize">{node.status}</strong>
                  </span>
                </div>

                {onUpdateStatus && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(node.id, 'completed')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'text-slate-400 hover:bg-white/5 hover:text-emerald-300'
                      }`}
                    >
                      Mastered
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(node.id, 'active')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:bg-white/5 hover:text-indigo-300'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(node.id, 'missing')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        isMissing
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                          : 'text-slate-400 hover:bg-white/5 hover:text-amber-300'
                      }`}
                    >
                      Gap
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Main Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Dynamic Replanning Banner CTA */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-[#142322] to-[#121220] border border-emerald-500/30 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    {isCompleted ? 'Topic Mastered' : 'Already Know This Topic?'}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isCompleted
                      ? 'This skill is verified. Click to unmark if you want to revisit it.'
                      : 'Mark as known to automatically recalculate and unlock downstream milestones.'}
                  </p>
                </div>
                <button
                  onClick={handleMarkAsKnown}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all hover:scale-105 shrink-0 flex items-center gap-1.5 ${
                    isCompleted
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isCompleted ? 'Unmark Known' : 'Mark as Known'}</span>
                </button>
              </div>

              {/* Prerequisites Breakdown */}
              {prerequisiteNodes.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#141424] border border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      Prerequisites ({prerequisiteNodes.filter((p) => p.status === 'completed').length}/{prerequisiteNodes.length})
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        allPrereqsMet
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {allPrereqsMet ? 'Prerequisites Satisfied' : 'Pending Prerequisites'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {prerequisiteNodes.map((prereq) => (
                      <div
                        key={prereq.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#1a1a30] text-xs text-slate-300 border border-white/5"
                      >
                        <span className="font-medium">{prereq.title}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            prereq.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {prereq.status === 'completed' ? 'Satisfied' : 'Needs Completion'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Why It Matters Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#16162a] to-[#121220] border border-indigo-500/20 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Why This Skill Matters For Leveling
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {node.whyItMatters || node.description}
                </p>
              </div>

              {/* Navigation Tabs (GitBook / Notion style) */}
              <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-0.5">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-3 px-1 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 relative ${
                    activeTab === 'notes' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Revision Notes</span>
                  {activeTab === 'notes' && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"
                    />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('references')}
                  className={`pb-3 px-1 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 relative ${
                    activeTab === 'references' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Reference Sites</span>
                  {activeTab === 'references' && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"
                    />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('practice')}
                  className={`pb-3 px-1 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 relative ${
                    activeTab === 'practice' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Practice & Hands-On</span>
                  {activeTab === 'practice' && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"
                    />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('interview')}
                  className={`pb-3 px-1 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 relative ${
                    activeTab === 'interview' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Interview Prep</span>
                  {activeTab === 'interview' && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"
                    />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('projects')}
                  className={`pb-3 px-1 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 relative ${
                    activeTab === 'projects' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Proof of Work</span>
                  {activeTab === 'projects' && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"
                    />
                  )}
                </button>
              </div>

              {/* Tab 1: Quick Revision Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400">
                    Key concepts, mental models, and production architecture gotchas:
                  </div>

                  <div className="space-y-2.5">
                    {node.quickNotes && node.quickNotes.length > 0 ? (
                      node.quickNotes.map((note, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141426] border border-white/5 text-xs text-slate-200"
                        >
                          <span className="text-indigo-400 font-bold mt-0.5">•</span>
                          <span className="leading-relaxed">{note}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3.5 rounded-xl bg-[#141426] border border-white/5 text-xs text-slate-300">
                        {node.description}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Reference Sites & Documentation Links */}
              {activeTab === 'references' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400">
                    Curated official documentation, GitHub repositories, and architectural reading:
                  </div>

                  <div className="space-y-2.5">
                    {node.referenceSites && node.referenceSites.length > 0 ? (
                      node.referenceSites.map((ref, idx) => (
                        <a
                          key={idx}
                          href={ref.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3.5 rounded-xl bg-[#141426] hover:bg-[#1b1b34] border border-white/5 hover:border-indigo-500/40 text-xs text-slate-200 transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                {ref.title}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono truncate max-w-sm block">
                                {ref.url}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                            {ref.type}
                          </span>
                        </a>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 italic p-3 rounded-xl bg-[#141426]">
                        No specific reference links provided.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Practice & Hands-On Exercises */}
              {activeTab === 'practice' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400">
                    Hands-on coding challenges and deliberate practice strategy:
                  </div>

                  {/* Hands-on Challenges */}
                  {node.handsOnExercises && node.handsOnExercises.length > 0 && (
                    <div className="space-y-3">
                      {node.handsOnExercises.map((exercise, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-gradient-to-br from-[#16162a] to-[#121220] border border-indigo-500/20 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                              {exercise.title}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {exercise.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {exercise.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Practice Strategy steps */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Execution Strategy Steps:
                    </span>
                    {node.practiceStrategy && node.practiceStrategy.length > 0 ? (
                      node.practiceStrategy.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-xl bg-[#141424] border border-white/5 text-xs text-slate-200"
                        >
                          <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Standard deliberate practice recommended.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Interview Questions */}
              {activeTab === 'interview' && (
                <div className="space-y-3">
                  {node.interviewQuestions && node.interviewQuestions.length > 0 ? (
                    node.interviewQuestions.map((q, idx) => {
                      const isExpanded = expandedQuestion === idx;
                      return (
                        <div
                          key={idx}
                          className="rounded-xl bg-[#141424] border border-white/5 overflow-hidden"
                        >
                          <button
                            onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                            className="w-full p-3.5 text-left flex items-start justify-between gap-3 text-xs font-semibold text-white hover:bg-white/5 transition-colors"
                          >
                            <span className="leading-snug">{q.question}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </button>

                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="p-3.5 pt-0 border-t border-white/5 bg-[#0e0e18]"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                                  {q.difficulty} Level
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Topic: {q.topic}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed bg-[#141424] p-3 rounded-lg border border-white/5">
                                <strong className="text-indigo-300 block mb-1 font-semibold">
                                  Key Interview Talking Points:
                                </strong>
                                {q.answerHint}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 italic">No interview questions available.</p>
                  )}
                </div>
              )}

              {/* Tab 5: Recommended Projects */}
              {activeTab === 'projects' && (
                <div className="space-y-4">
                  {node.recommendedProjects && node.recommendedProjects.length > 0 ? (
                    node.recommendedProjects.map((project, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-gradient-to-br from-[#141426] to-[#0e0e18] border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <FolderGit2 className="w-4 h-4 text-purple-400" />
                            {project.title}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {project.difficulty}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {project.description}
                        </p>

                        {/* Deliverables */}
                        {project.deliverables && project.deliverables.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Deliverables For Portfolio:
                            </span>
                            {project.deliverables.map((d, dIdx) => (
                              <div key={dIdx} className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{d}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Skills Covered */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {project.skillsCovered?.map((sc) => (
                            <span
                              key={sc}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5"
                            >
                              {sc}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No recommended projects listed.</p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-[#121222] flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Close Drawer
              </button>

              <button
                onClick={handleMarkAsKnown}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
                  isCompleted
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? 'Mark as Incomplete Gap' : 'Mark as Known & Mastered'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
