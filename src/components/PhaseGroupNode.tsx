import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Layers, Calendar, CheckCircle2 } from 'lucide-react';

export interface PhaseGroupData {
  title: string;
  timeframe: string;
  description: string;
  phaseNumber: number;
  totalNodes: number;
  completedNodes: number;
  width: number;
  height: number;
}

export const PhaseGroupNode: React.FC<NodeProps> = memo(({ data }) => {
  const phaseData = data as unknown as PhaseGroupData;
  const {
    title,
    timeframe,
    description,
    phaseNumber,
    totalNodes,
    completedNodes,
    width,
    height,
  } = phaseData;

  const isAllDone = totalNodes > 0 && completedNodes === totalNodes;
  const progressPercent = Math.round((completedNodes / Math.max(1, totalNodes)) * 100);

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`rounded-3xl border transition-all p-5 flex flex-col justify-between pointer-events-none select-none relative ${
        isAllDone
          ? 'bg-gradient-to-b from-[#0e241c]/60 to-[#08120e]/80 border-emerald-500/30'
          : 'bg-gradient-to-b from-[#101020]/70 to-[#0a0a14]/90 border-indigo-500/20'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold font-mono">
            0{phaseNumber || 1}
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
            <span className="text-[11px] text-slate-400 leading-none">{description}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] font-mono text-slate-300">
            <Calendar className="w-3 h-3 text-purple-400" />
            <span>{timeframe}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-300">
            {isAllDone ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <Layers className="w-3 h-3 text-indigo-400" />
            )}
            <span>{completedNodes}/{totalNodes} Skills ({progressPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Ambient background watermark icon */}
      <div className="absolute right-6 bottom-4 text-white/[0.02] text-6xl font-extrabold font-mono pointer-events-none">
        PHASE {phaseNumber}
      </div>
    </div>
  );
});

PhaseGroupNode.displayName = 'PhaseGroupNode';
