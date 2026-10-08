import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Check,
  Sparkles,
  Lock,
  Trophy,
  Clock,
  ChevronRight
} from 'lucide-react';
import type { RoadmapNodeData } from '../types/roadmap';

export const CustomRoadmapNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as unknown as RoadmapNodeData;
  const { status, title, category, estimatedHours, priority } = nodeData;

  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const isMissing = status === 'missing';
  const isTarget = status === 'target';

  // Priority Label Mapping (roadmap.sh style)
  const priorityLabel =
    priority === 'critical' ? 'Must-Have' : priority === 'high' ? 'Recommended' : 'Elective';

  // Card & Border Styling
  let cardBg = 'bg-[#141424]';
  let borderStyle = 'border-white/10 hover:border-white/20';
  let glowStyle = 'shadow-lg shadow-black/40';
  let statusBadge = (
    <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
      <Lock className="w-2.5 h-2.5 text-slate-500" />
      <span>Locked</span>
    </span>
  );

  if (isCompleted) {
    cardBg = 'bg-gradient-to-b from-[#122822] to-[#0e1c18]';
    borderStyle = 'border-emerald-500/50 hover:border-emerald-400';
    glowStyle = 'shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/20';
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40 font-semibold">
        <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
        <span>Mastered</span>
      </span>
    );
  } else if (isActive) {
    cardBg = 'bg-gradient-to-b from-[#1b1a38] to-[#121226]';
    borderStyle = 'border-indigo-400 hover:border-indigo-300 ring-2 ring-indigo-500/30';
    glowStyle = 'shadow-2xl shadow-indigo-600/30';
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono text-indigo-200 bg-indigo-500/30 px-2 py-0.5 rounded-full border border-indigo-400/50 font-bold animate-pulse">
        <Sparkles className="w-3 h-3 text-indigo-400" />
        <span>In Progress</span>
      </span>
    );
  } else if (isTarget) {
    cardBg = 'bg-gradient-to-b from-[#281538] to-[#160d24]';
    borderStyle = 'border-purple-400 hover:border-purple-300 ring-2 ring-purple-500/40';
    glowStyle = 'shadow-2xl shadow-purple-600/30';
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono text-purple-200 bg-gradient-to-r from-purple-500/30 to-pink-500/30 px-2 py-0.5 rounded-full border border-purple-400/50 font-bold">
        <Trophy className="w-3 h-3 text-amber-400" />
        <span>Target Peak</span>
      </span>
    );
  } else if (isMissing) {
    cardBg = 'bg-[#11111c]';
    borderStyle = 'border-dashed border-slate-700 hover:border-amber-500/50';
    glowStyle = 'shadow-md shadow-black/50';
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
        <span>Skill Gap</span>
      </span>
    );
  }

  return (
    <div
      className={`w-72 rounded-2xl ${cardBg} border transition-all duration-200 p-4 relative group cursor-pointer ${borderStyle} ${glowStyle} ${
        selected ? 'ring-2 ring-indigo-400 scale-[1.02] shadow-2xl shadow-indigo-500/40' : ''
      }`}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-[#0a0a0f]"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-[#0a0a0f]"
      />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold truncate max-w-[120px]">
          {category || 'Skill Topic'}
        </span>
        {statusBadge}
      </div>

      {/* Main Title */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
          {title}
        </h4>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
        {nodeData.description}
      </p>

      {/* Footer bar: Priority & Hours & Inspect CTA */}
      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-md font-semibold border ${
              priority === 'critical'
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : priority === 'high'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
            }`}
          >
            {priorityLabel}
          </span>
          <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
            <Clock className="w-3 h-3 text-slate-400" />
            {estimatedHours}h
          </span>
        </div>

        <div className="flex items-center gap-1 text-indigo-400 text-[10px] font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>Details</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {/* Source Handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-[#0a0a0f]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-[#0a0a0f]"
      />
    </div>
  );
});

CustomRoadmapNode.displayName = 'CustomRoadmapNode';
