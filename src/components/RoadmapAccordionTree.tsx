import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Search,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';
import { TopicDetailModal } from './TopicDetailModal';
import { replanRoadmapGraph } from '../utils/replanningEngine';
import type { CareerRoadmapResponse, RoadmapNodeData, NodeStatus } from '../types/roadmap';

interface RoadmapAccordionTreeProps {
  roadmapData: CareerRoadmapResponse;
  onUpdateRoadmap?: (updated: CareerRoadmapResponse) => void;
}

export const RoadmapAccordionTree: React.FC<RoadmapAccordionTreeProps> = ({
  roadmapData,
  onUpdateRoadmap,
}) => {
  // State for expanded phase containers (default all expanded)
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    (roadmapData.phases || []).forEach((p) => {
      initial[p.id] = true;
    });
    return initial;
  });

  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [replanToast, setReplanToast] = useState<string | null>(null);

  // Toggle single phase container
  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  // Toggle all phases open/closed
  const toggleAllPhases = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    (roadmapData.phases || []).forEach((p) => {
      newState[p.id] = expand;
    });
    setExpandedPhases(newState);
  };

  // Open topic deep-dive modal
  const handleOpenTopic = (node: RoadmapNodeData) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  // Dynamic Replanning Trigger
  const handleTriggerReplan = (nodeId: string, newStatus: NodeStatus) => {
    const result = replanRoadmapGraph(roadmapData, nodeId, newStatus);

    if (onUpdateRoadmap) {
      onUpdateRoadmap(result.updatedRoadmap);
    }

    const updatedTargetNode = result.updatedRoadmap.nodes.find((n) => n.id === nodeId);
    if (updatedTargetNode) {
      setSelectedNode(updatedTargetNode);
    }

    setReplanToast(result.message);
    setTimeout(() => {
      setReplanToast(null);
    }, 4000);
  };

  const handleToggleKnown = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentNode = roadmapData.nodes.find((n) => n.id === nodeId);
    const nextStatus: NodeStatus = currentNode?.status === 'completed' ? 'missing' : 'completed';
    handleTriggerReplan(nodeId, nextStatus);
  };

  // Summary Metrics
  const remainingHours = useMemo(
    () =>
      roadmapData.nodes
        .filter((n) => n.status !== 'completed')
        .reduce((acc, n) => acc + (n.estimatedHours || 0), 0),
    [roadmapData.nodes]
  );
  const completedCount = useMemo(
    () => roadmapData.nodes.filter((n) => n.status === 'completed').length,
    [roadmapData.nodes]
  );
  const activeCount = useMemo(
    () => roadmapData.nodes.filter((n) => n.status === 'active').length,
    [roadmapData.nodes]
  );
  const missingCount = useMemo(
    () => roadmapData.nodes.filter((n) => n.status === 'missing').length,
    [roadmapData.nodes]
  );
  const percentComplete = Math.round(
    (completedCount / Math.max(1, roadmapData.nodes.length)) * 100
  );

  // Group nodes by phase
  const phaseList = roadmapData.phases || [];
  const nodesMap = useMemo(() => {
    const map = new Map<string, RoadmapNodeData>();
    roadmapData.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [roadmapData.nodes]);

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Toast Notification for Real-Time Path Recalibration */}
      <AnimatePresence>
        {replanToast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-zinc-700 text-white text-xs font-mono px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5"
          >
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{replanToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Controls & Metrics Dashboard */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block">
              Curriculum Track
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {roadmapData.targetSummary.targetRole}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-mono">
              Timeline: {roadmapData.targetSummary.timelineMonths} months • Commitment: {roadmapData.targetSummary.hoursPerWeek} hrs/week
            </p>
          </div>

          {/* Overall Progress Pill */}
          <div className="flex items-center gap-3 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 shrink-0">
            <div className="text-right">
              <span className="block text-[11px] text-zinc-500 font-mono">Completion</span>
              <span className="text-xl font-bold text-white font-mono">
                {percentComplete}%
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs text-indigo-400">
              {completedCount}/{roadmapData.nodes.length}
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/80">
            <motion.div
              className="h-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2 font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{completedCount} Mastered</span>
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activeCount} Active</span>
              </span>
              <span className="flex items-center gap-1.5 text-zinc-500">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{missingCount} Up Next</span>
              </span>
            </div>
            <span className="text-zinc-500">
              ~{remainingHours} estimated study hours left
            </span>
          </div>
        </div>

        {/* Search, Filters, and Expand Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics or tools..."
              className="w-full bg-zinc-950 text-white border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600 font-mono"
            />
          </div>

          {/* Status Filter Badges */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none font-mono">
            {['all', 'completed', 'active', 'missing'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Expand/Collapse All */}
          <div className="flex items-center gap-2 shrink-0 font-mono">
            <button
              onClick={() => toggleAllPhases(true)}
              className="px-2.5 py-1 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-400 text-xs border border-zinc-800 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <button
              onClick={() => toggleAllPhases(false)}
              className="px-2.5 py-1 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-400 text-xs border border-zinc-800 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* VERTICAL PHASE STACK */}
      <div className="space-y-4">
        {phaseList.map((phase, pIndex) => {
          const isExpanded = !!expandedPhases[phase.id];

          // Collect nodes belonging to this phase
          let phaseNodes: RoadmapNodeData[] = [];
          if (phase.nodeIds && phase.nodeIds.length > 0) {
            phaseNodes = phase.nodeIds
              .map((id) => nodesMap.get(id))
              .filter(Boolean) as RoadmapNodeData[];
          }
          if (phaseNodes.length === 0) {
            phaseNodes = roadmapData.nodes.filter(
              (n) => n.phase === phase.title || n.phase?.startsWith(phase.title.split(':')[0])
            );
          }

          // Apply search & filter
          const filteredNodes = phaseNodes.filter((node) => {
            const matchesQuery =
              !searchQuery.trim() ||
              node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              node.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
              node.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'all' || node.status === filterStatus;
            return matchesQuery && matchesStatus;
          });

          // Phase-level metrics
          const phaseCompleted = phaseNodes.filter((n) => n.status === 'completed').length;
          const phaseTotal = Math.max(1, phaseNodes.length);
          const phasePercent = Math.round((phaseCompleted / phaseTotal) * 100);
          const isPhaseDone = phaseCompleted === phaseTotal && phaseTotal > 0;

          return (
            <div
              key={phase.id}
              className="rounded-2xl bg-zinc-900/70 border border-zinc-800 overflow-hidden transition-colors hover:border-zinc-700"
            >
              {/* PHASE CARD HEADER */}
              <div
                onClick={() => togglePhase(phase.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-zinc-900/40 hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Phase Number Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                      isPhaseDone
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                        : 'bg-zinc-950 text-zinc-300 border-zinc-800'
                    }`}
                  >
                    {isPhaseDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span>0{pIndex + 1}</span>
                    )}
                  </div>

                  {/* Title & Timeframe */}
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                        {phase.timeframe || `Phase 0${pIndex + 1}`}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {phaseNodes.length} topics
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                      {phase.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {phase.description}
                    </p>
                  </div>
                </div>

                {/* Right Progress & Expand Chevron */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                  <div className="text-left sm:text-right space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-400">
                        {phaseCompleted} / {phaseNodes.length}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isPhaseDone
                            ? 'bg-emerald-950/80 text-emerald-300'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {phasePercent}%
                      </span>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="w-24 bg-zinc-950 h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${phasePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center text-zinc-400 border border-zinc-800">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* PARALLEL TOPIC GRID ON EXPAND */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-zinc-800 p-4 sm:p-5 bg-zinc-950/60"
                  >
                    {filteredNodes.length === 0 ? (
                      <div className="text-center py-6 text-zinc-600 text-xs font-mono">
                        No topics match your filter.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredNodes.map((node) => {
                          const isNodeCompleted = node.status === 'completed';
                          const isNodeActive = node.status === 'active';
                          const isNodeTarget = node.status === 'target';

                          return (
                            <div
                              key={node.id}
                              onClick={() => handleOpenTopic(node)}
                              className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                                isNodeCompleted
                                  ? 'bg-zinc-900/60 border-emerald-900/40 hover:border-emerald-700/60'
                                  : isNodeActive
                                  ? 'bg-zinc-900/90 border-indigo-500/60 hover:border-indigo-400'
                                  : isNodeTarget
                                  ? 'bg-zinc-900/80 border-purple-800/50 hover:border-purple-600/60'
                                  : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              {/* Top Card Info */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 truncate max-w-[140px]">
                                    {node.category}
                                  </span>

                                  <span
                                    className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                      node.priority === 'critical'
                                        ? 'bg-rose-950/80 text-rose-300'
                                        : 'bg-zinc-800 text-zinc-400'
                                    }`}
                                  >
                                    {node.priority}
                                  </span>
                                </div>

                                <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                                  {node.title}
                                </h4>

                                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                                  {node.description}
                                </p>
                              </div>

                              {/* Card Bottom Meta & Actions */}
                              <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                                <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{node.estimatedHours}h</span>
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {/* Quick Mark as Known Toggle */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleKnown(node.id, e)}
                                    className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                                      isNodeCompleted
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                    }`}
                                    title="Toggle Completion Status"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>{isNodeCompleted ? 'Done' : 'Mark'}</span>
                                  </button>

                                  <span className="text-xs text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-mono">
                                    <span>Notes</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* FULL-SCREEN IMMERSIVE TOPIC MODAL */}
      <TopicDetailModal
        node={selectedNode}
        allNodes={roadmapData.nodes}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMarkAsKnown={(nodeId) => {
          const currentNode = roadmapData.nodes.find((n) => n.id === nodeId);
          const nextStatus: NodeStatus = currentNode?.status === 'completed' ? 'missing' : 'completed';
          handleTriggerReplan(nodeId, nextStatus);
        }}
        onUpdateStatus={(nodeId, newStatus) => {
          handleTriggerReplan(nodeId, newStatus);
        }}
      />
    </div>
  );
};
