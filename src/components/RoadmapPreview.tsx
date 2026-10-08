import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowRight,
  Code2,
  Clock,
  Target
} from 'lucide-react';

export interface Milestone {
  id: string;
  stage: string;
  title: string;
  level: string;
  timeframe: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'target';
  skills: string[];
  keyActions: string[];
  roleDescription: string;
}

const TRACKS = {
  ai_eng: {
    name: 'AI Engineering & Distributed Systems',
    milestones: [
      {
        id: 'stage-1',
        stage: '01',
        title: 'Full-Stack Foundations',
        level: 'Mid-Level',
        timeframe: 'Month 1 - 2',
        status: 'completed',
        roleDescription: 'Production experience with React, TypeScript, asynchronous APIs, and relational data modeling.',
        skills: ['TypeScript', 'React 19', 'PostgreSQL', 'Docker', 'REST & gRPC'],
        keyActions: ['Built microservice backend APIs', 'Configured automated CI/CD deployment pipelines'],
      },
      {
        id: 'stage-2',
        stage: '02',
        title: 'Applied LLM & Vector Systems',
        level: 'Senior',
        timeframe: 'Month 3 - 5',
        status: 'in-progress',
        roleDescription: 'Bridging core systems with hybrid vector search, chunking heuristics, and deterministic agent graphs.',
        skills: ['pgvector / Qdrant', 'LangGraph', 'RAG Optimizations', 'FastAPI', 'Evaluation Benchmarks'],
        keyActions: ['Deploy hybrid reciprocal rank fusion search', 'Implement streaming LLM responses with token caching'],
      },
      {
        id: 'stage-3',
        stage: '03',
        title: 'High-Scale Concurrency & Infra',
        level: 'Staff',
        timeframe: 'Month 6 - 9',
        status: 'upcoming',
        roleDescription: 'Designing resilient distributed clusters, telemetry context propagation, and memory compaction.',
        skills: ['Distributed Consensus', 'Kafka Streams', 'Redis Cluster', 'OpenTelemetry', 'eBPF'],
        keyActions: ['Design fault-tolerant event processing cluster', 'Lead system design reviews across domains'],
      },
      {
        id: 'stage-4',
        stage: '04',
        title: 'Staff AI Platform Architect',
        level: 'Staff / Lead',
        timeframe: 'Month 10 - 12',
        status: 'target',
        roleDescription: 'Flagship production proof of work, executive RFC documentation, and platform architecture defense.',
        skills: ['Staff RFCs', 'Multi-Region Failover', 'Cost Governance', 'Autonomous Agent Fleets'],
        keyActions: ['Publish architectural case study and benchmark RFC', 'Complete Staff-level system design defense'],
      },
    ] as Milestone[],
  },
  cloud_arch: {
    name: 'Distributed Cloud & Backend Architecture',
    milestones: [
      {
        id: 'c-1',
        stage: '01',
        title: 'Backend Engineering Core',
        level: 'Mid-Level',
        timeframe: 'Month 1 - 3',
        status: 'completed',
        roleDescription: 'Idiomatic service design, SQL query profiling with EXPLAIN ANALYZE, and caching patterns.',
        skills: ['Go / Node.js', 'PostgreSQL Indexing', 'Redis', 'Docker'],
        keyActions: ['Designed resilient domain services', 'Tuned query latency under concurrent loads'],
      },
      {
        id: 'c-2',
        stage: '02',
        title: 'Distributed Systems Lead',
        level: 'Senior',
        timeframe: 'Month 4 - 8',
        status: 'in-progress',
        roleDescription: 'Multi-region deployment, Raft consensus protocols, and asynchronous messaging pipelines.',
        skills: ['Kafka', 'Kubernetes', 'Terraform', 'Distributed Locks'],
        keyActions: ['Architect multi-region failover cluster', 'Implement atomic sliding-window rate limiters in Lua'],
      },
      {
        id: 'c-3',
        stage: '03',
        title: 'Staff Systems Architect',
        level: 'Staff',
        timeframe: 'Month 9 - 12',
        status: 'target',
        roleDescription: 'Total engineering architecture ownership, high availability platform design for 100k+ req/sec.',
        skills: ['High-Scale Architecture', 'Zero-Trust Security', 'Observability', 'RFC Leadership'],
        keyActions: ['Author platform RFC and reliability playbook', 'Execute production disaster recovery drills'],
      },
    ] as Milestone[],
  }
};

export const RoadmapPreview: React.FC<{
  onSelectTrack?: (trackKey: string) => void;
  onExploreMore?: () => void;
}> = ({ onExploreMore }) => {
  const [activeTrackKey, setActiveTrackKey] = useState<keyof typeof TRACKS>('ai_eng');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('stage-2');

  const currentTrack = TRACKS[activeTrackKey];
  const selectedMilestone = currentTrack.milestones.find((m) => m.id === selectedMilestoneId) || currentTrack.milestones[1];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
      {/* Header bar inside preview card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
            Example Curriculum Simulation
          </span>
          <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <span>{currentTrack.name}</span>
          </h3>
        </div>

        {/* Track Switchers */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => {
              setActiveTrackKey('ai_eng');
              setSelectedMilestoneId('stage-2');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTrackKey === 'ai_eng'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            AI Systems
          </button>
          <button
            onClick={() => {
              setActiveTrackKey('cloud_arch');
              setSelectedMilestoneId('c-2');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTrackKey === 'cloud_arch'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Cloud Backend
          </button>
        </div>
      </div>

      {/* Interactive Milestone Nodes Timeline */}
      <div className="py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currentTrack.milestones.map((item) => {
            const isSelected = item.id === selectedMilestone.id;
            const isCompleted = item.status === 'completed';
            const isInProgress = item.status === 'in-progress';
            const isTarget = item.status === 'target';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedMilestoneId(item.id)}
                className={`cursor-pointer rounded-xl p-4 transition-all border ${
                  isSelected
                    ? 'bg-zinc-800/90 border-indigo-500/80 ring-1 ring-indigo-500/40 shadow-sm'
                    : isCompleted
                    ? 'bg-zinc-900/50 border-emerald-900/40 hover:border-emerald-700/50'
                    : isInProgress
                    ? 'bg-zinc-900/60 border-zinc-700 hover:border-zinc-500'
                    : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
                }`}
              >
                {/* Status Dot / Icon */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs ${
                      isCompleted
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                        : isInProgress
                        ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/50'
                        : isTarget
                        ? 'bg-purple-950/60 text-purple-400 border border-purple-800/50'
                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isInProgress ? (
                      <Sparkles className="w-3.5 h-3.5" />
                    ) : isTarget ? (
                      <Target className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-emerald-950/80 text-emerald-300'
                        : isInProgress
                        ? 'bg-indigo-950/80 text-indigo-300'
                        : isTarget
                        ? 'bg-purple-950/80 text-purple-300'
                        : 'text-zinc-500'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Stage & Title */}
                <div className="text-[10px] font-mono text-zinc-500 font-medium">
                  PHASE {item.stage} • {item.level}
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5 mb-2 truncate">
                  {item.title}
                </h4>

                <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>{item.timeframe}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Selected Milestone Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMilestone.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="bg-zinc-950/80 p-5 rounded-xl border border-zinc-800 space-y-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 text-xs font-mono rounded">
                  Phase {selectedMilestone.stage} Details
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {selectedMilestone.level}
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">
                  {selectedMilestone.title}
                </h4>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
                  {selectedMilestone.roleDescription}
                </p>
              </div>

              {/* Skills to master */}
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5 mb-1.5">
                  <Code2 className="w-3 h-3 text-zinc-400" />
                  Core Skills & Tools
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMilestone.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-zinc-900 text-zinc-300 text-xs rounded border border-zinc-800 font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Info: Action Items */}
            <div className="lg:col-span-5 bg-zinc-900/70 p-4 rounded-xl border border-zinc-800/80 space-y-3">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Deliverables & Hands-on Proof of Work
              </span>

              <div className="space-y-2">
                {selectedMilestone.keyActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                    <span className="text-indigo-400 font-mono text-[10px] mt-0.5">#{i + 1}</span>
                    <span className="leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom CTA trigger */}
      <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-zinc-500 font-mono">
          Ready to generate a roadmap tailored to your specific background?
        </span>
        {onExploreMore && (
          <button
            onClick={onExploreMore}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Start Custom Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
