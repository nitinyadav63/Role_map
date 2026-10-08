import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Code2,
  HelpCircle,
  FolderGit2,
  ExternalLink,
  Zap,
  Check,
  Flame,
  GraduationCap
} from 'lucide-react';
import type { RoadmapNodeData, NodeStatus } from '../types/roadmap';

interface TopicDetailModalProps {
  node: RoadmapNodeData | null;
  allNodes?: RoadmapNodeData[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsKnown?: (nodeId: string) => void;
  onUpdateStatus?: (nodeId: string, newStatus: NodeStatus) => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  node,
  allNodes = [],
  isOpen,
  onClose,
  onMarkAsKnown,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'resources' | 'practice' | 'interview' | 'projects'>('notes');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  const [copiedNoteIndex, setCopiedNoteIndex] = useState<number | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !node) return null;

  const isCompleted = node.status === 'completed';

  // Find prerequisite node objects
  const prerequisiteNodes = (node.prerequisites || [])
    .map((prereqId) => allNodes.find((n) => n.id === prereqId))
    .filter(Boolean) as RoadmapNodeData[];

  const handleToggleKnown = () => {
    if (onMarkAsKnown) {
      onMarkAsKnown(node.id);
    } else if (onUpdateStatus) {
      onUpdateStatus(node.id, isCompleted ? 'missing' : 'completed');
    }
  };

  const handleCopyNote = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteIndex(idx);
    setTimeout(() => setCopiedNoteIndex(null), 2000);
  };

  // Practice platforms search URLs
  const searchSlug = encodeURIComponent(node.title.replace(/[^a-zA-Z0-9 ]/g, ' ').trim());
  const practicePlatforms = [
    {
      name: 'LeetCode Problems',
      url: `https://leetcode.com/problemset/?search=${searchSlug}`,
      desc: 'Algorithmic challenges & data structures',
      badge: 'Coding Sandboxes'
    },
    {
      name: 'GitHub Topic Exploration',
      url: `https://github.com/topics/${encodeURIComponent(node.title.toLowerCase().replace(/\s+/g, '-'))}`,
      desc: 'Open source production implementations & libraries',
      badge: 'Codebases'
    },
    {
      name: 'Official MDN / Web Docs',
      url: `https://developer.mozilla.org/en-US/search?q=${searchSlug}`,
      desc: 'Standard specifications & API references',
      badge: 'Official API'
    },
    {
      name: 'HackerRank Domain Practice',
      url: `https://www.hackerrank.com/domains`,
      desc: 'Structured track tests and certifications',
      badge: 'Tests'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-8">
        {/* Backdrop click to close */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-5xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Sticky Top Header Bar */}
          <header className="p-5 sm:p-6 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-md shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                  {node.phase || 'Curriculum Phase'}
                </span>
                <span className="text-zinc-600">/</span>
                <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                  {node.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-semibold ${
                    node.priority === 'critical'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-900/50'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {node.priority} priority
                </span>
                <span className="flex items-center gap-1 text-zinc-500 text-xs pl-1">
                  <Clock className="w-3 h-3" />
                  <span>~{node.estimatedHours}h estimated</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                {node.title}
              </h1>
            </div>

            {/* Quick Actions & Status Toggle */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleKnown}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/50'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mastered (Undo)</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Mark as Known</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-700/50"
                title="Close (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Navigation Tabs */}
          <div className="px-5 sm:px-6 border-b border-zinc-800 bg-zinc-950/70 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 py-2">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Revision Notes</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'resources'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Documentation ({node.referenceSites?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'practice'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Practice & Challenges</span>
            </button>

            <button
              onClick={() => setActiveTab('interview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'interview'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interview Questions</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Capstone Project</span>
            </button>
          </div>

          {/* Scrollable Main Content Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* TAB 1: REVISION NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-5 max-w-4xl">
                {/* Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                      Concept Summary
                    </span>
                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                      {node.description}
                    </p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                      System Design Significance
                    </span>
                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                      {node.whyItMatters}
                    </p>
                  </div>
                </div>

                {/* Quick Revision Notes */}
                <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Key Principles & Architectural Gotchas
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">Click to copy</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {(node.quickNotes && node.quickNotes.length > 0 ? node.quickNotes : [
                      'Understand memory layout, heap vs stack allocation patterns, and lifecycle bounds.',
                      'Asynchronous non-blocking concurrency patterns and event loop phase transitions.',
                      'Idempotency and distributed state reconciliation under high throughput.'
                    ]).map((note, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleCopyNote(note, idx)}
                        className="group p-3 rounded-lg bg-zinc-900 border border-zinc-800/60 hover:border-zinc-600 transition-colors flex items-start gap-2.5 cursor-pointer"
                      >
                        <span className="text-zinc-500 font-mono text-xs mt-0.5">#{idx + 1}</span>
                        <p className="text-xs sm:text-sm text-zinc-300 group-hover:text-white flex-1 leading-relaxed">
                          {note}
                        </p>
                        <span className="text-[11px] text-zinc-600 group-hover:text-zinc-400 font-mono shrink-0">
                          {copiedNoteIndex === idx ? 'Copied' : 'Copy'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliberate Practice Strategy */}
                {node.practiceStrategy && node.practiceStrategy.length > 0 && (
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 space-y-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                      Recommended Practice Steps
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {node.practiceStrategy.map((step, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/60 flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prerequisites Check */}
                {prerequisiteNodes.length > 0 && (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                      Prerequisites Chain
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {prerequisiteNodes.map((prereq) => (
                        <span
                          key={prereq.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border ${
                            prereq.status === 'completed'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          {prereq.status === 'completed' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-zinc-500" />
                          )}
                          {prereq.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: OFFICIAL DOCUMENTATION */}
            {activeTab === 'resources' && (
              <div className="space-y-5 max-w-4xl">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-white">Curated Official Documentation & References</h3>
                  <p className="text-zinc-500 text-xs">Direct links to authoritative specs and standard documentation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(node.referenceSites && node.referenceSites.length > 0
                    ? node.referenceSites
                    : [
                        { title: `${node.title} Official Documentation`, url: `https://developer.mozilla.org/en-US/search?q=${searchSlug}`, type: 'official' },
                        { title: `${node.title} GitHub Source`, url: `https://github.com/topics/${searchSlug}`, type: 'github' }
                      ]
                  ).map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                            {ref.type || 'Official'}
                          </span>
                          <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors pt-1">
                            {ref.title}
                          </h4>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono truncate">{ref.url}</span>
                    </a>
                  ))}
                </div>

                {/* Additional Quick Hub Links */}
                <div className="pt-3 border-t border-zinc-800 space-y-2.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">External Search Portals</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {practicePlatforms.map((plat, idx) => (
                      <a
                        key={idx}
                        href={plat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-white">{plat.name}</p>
                          <p className="text-[11px] text-zinc-400">{plat.desc}</p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PRACTICE CHALLENGES */}
            {activeTab === 'practice' && (
              <div className="space-y-5 max-w-4xl">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-white">Hands-on Practice & Sandboxes</h3>
                  <p className="text-zinc-500 text-xs">Algorithmic drills, live sandbox environments, and coding challenges.</p>
                </div>

                {/* Sandbox Launchers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`https://leetcode.com/problemset/?search=${searchSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block">LeetCode Problem Sets</span>
                      <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300">Filtered "{node.title}" Drills</h4>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                  </a>

                  <a
                    href={`https://codesandbox.io/search?query=${searchSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block">Cloud Sandbox</span>
                      <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-300">CodeSandbox Prototypes</h4>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                  </a>
                </div>

                {/* Specific Coding Challenges */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">Structured Challenges</span>

                  {(node.handsOnExercises && node.handsOnExercises.length > 0
                    ? node.handsOnExercises
                    : [
                        {
                          title: `Production ${node.title} Implementation`,
                          prompt: `Design and benchmark an end-to-end ${node.title} component handling asynchronous load and boundary conditions.`,
                          difficulty: 'Medium'
                        }
                      ]
                  ).map((exercise, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs sm:text-sm font-semibold text-white">{exercise.title}</h5>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            exercise.difficulty === 'Hard'
                              ? 'bg-rose-950/80 text-rose-300'
                              : exercise.difficulty === 'Medium'
                              ? 'bg-amber-950/80 text-amber-300'
                              : 'bg-emerald-950/80 text-emerald-300'
                          }`}
                        >
                          {exercise.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-mono bg-zinc-900 p-3 rounded-lg border border-zinc-800/80">
                        {exercise.prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: INTERVIEW PREP */}
            {activeTab === 'interview' && (
              <div className="space-y-5 max-w-4xl">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-white">Technical Interview Questions & Rubrics</h3>
                  <p className="text-zinc-500 text-xs">Technical questions asked in Senior / Staff engineering loops.</p>
                </div>

                <div className="space-y-3">
                  {(node.interviewQuestions && node.interviewQuestions.length > 0
                    ? node.interviewQuestions
                    : [
                        {
                          question: `How would you architect and optimize ${node.title} in a high-availability distributed system?`,
                          topic: node.category,
                          difficulty: 'Senior',
                          answerHint: 'Discuss functional requirements, bottlenecks, trade-offs between consistency and latency, and failure handling.'
                        }
                      ]
                  ).map((q, idx) => {
                    const isExpanded = expandedQuestion === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                          className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-zinc-900/50 transition-colors cursor-pointer"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px] font-mono">
                                {q.topic || node.category}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500">
                                {q.difficulty} Level
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                              {q.question}
                            </h4>
                          </div>
                          <span className="text-xs text-zinc-500 font-mono shrink-0 mt-1">
                            {isExpanded ? 'Hide' : 'Answer'}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 space-y-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                              Scoring Hints & Discussion Points
                            </span>
                            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                              {q.answerHint}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: CAPSTONE SPRINT */}
            {activeTab === 'projects' && (
              <div className="space-y-5 max-w-4xl">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-white">Proof-of-Work Project Deliverable</h3>
                  <p className="text-zinc-500 text-xs">Production artifact to demonstrate practical competence.</p>
                </div>

                {(node.recommendedProjects && node.recommendedProjects.length > 0
                  ? node.recommendedProjects
                  : [
                      {
                        title: `Production ${node.title} System Service`,
                        difficulty: 'Advanced',
                        description: `A production service integrating ${node.title} with complete observability, CI/CD, and benchmarking.`,
                        deliverables: ['Live deployment config', 'Technical design document (RFC)', 'Unit & integration test suites'],
                        skillsCovered: [node.title, 'System Design', 'Architecture']
                      }
                    ]
                ).map((proj, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white">{proj.title}</h4>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px] font-mono border border-zinc-800">
                        {proj.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">Deliverables:</span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {proj.deliverables.map((del, dIdx) => (
                          <li key={dIdx} className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900 p-2 rounded-lg border border-zinc-800/80">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>{del}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-zinc-500 font-mono self-center mr-1">Skills:</span>
                      {proj.skillsCovered.map((sk, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-xs font-mono border border-zinc-800">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
