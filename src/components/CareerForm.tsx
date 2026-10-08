import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Clock,
  Calendar,
  X,
  Plus,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  AlertCircle
} from 'lucide-react';

export interface CareerFormData {
  targetRole: string;
  currentSkills: string[];
  hoursPerWeek: number;
  timelineMonths: number;
}

interface CareerFormProps {
  onSubmit: (data: CareerFormData) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
}

const POPULAR_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'SQL',
  'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'System Design',
  'GraphQL', 'Tailwind CSS', 'Next.js', 'Redis', 'LLMs / AI'
];

const LOADING_STEPS = [
  { text: 'Analyzing role expectations and system competencies...', icon: Search },
  { text: 'Evaluating verified background against target requirements...', icon: Cpu },
  { text: 'Structuring hierarchical phase milestones and dependencies...', icon: BrainCircuit },
  { text: 'Generating practice exercises, sandbox drills & interview questions...', icon: Layers },
  { text: 'Calibrating velocity to target timeline...', icon: Target },
];

export const CareerForm: React.FC<CareerFormProps> = ({
  onSubmit,
  isLoading = false,
  errorMessage = null,
  onClearError
}) => {
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Engineer at Stripe');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js', 'PostgreSQL']);
  const [skillInput, setSkillInput] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(15);
  const [timelineMonths, setTimelineMonths] = useState(6);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);

  // Handle adding a skill tag
  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
      if (onClearError) onClearError();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
    if (onClearError) onClearError();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    if (onClearError) onClearError();

    onSubmit({
      targetRole,
      currentSkills: skills,
      hoursPerWeek,
      timelineMonths,
    });
  };

  // If loading, show the interactive step animation
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setCurrentLoadingStep(0);
      interval = setInterval(() => {
        setCurrentLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 900);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center">
        <div className="relative z-10 space-y-6">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 mx-auto flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Synthesizing Curriculum
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Generating tailored roadmap for <span className="text-indigo-400 font-mono font-medium">{targetRole}</span>
            </p>
          </div>

          {/* Stepper list */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-2.5 text-left max-w-md mx-auto font-mono text-xs">
            {LOADING_STEPS.map((stepItem, idx) => {
              const isDone = idx < currentLoadingStep;
              const isCurrent = idx === currentLoadingStep;
              const StepIcon = stepItem.icon;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 transition-all duration-300 ${
                    isDone
                      ? 'text-emerald-400'
                      : isCurrent
                      ? 'text-indigo-300 font-medium'
                      : 'text-zinc-600'
                  }`}
                >
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <StepIcon className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-400 animate-pulse' : 'text-zinc-600'}`} />
                    )}
                  </div>
                  <span className="flex-1 truncate">{stepItem.text}</span>
                </div>
              );
            })}
          </div>

          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500"
              initial={{ width: '15%' }}
              animate={{ width: `${((currentLoadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="mb-6 relative z-10">
        <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
          Career Parameters
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Define Your Target Trajectory
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Specify your target role, verified current stack, and weekly study commitment.
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start gap-2.5 relative z-10 text-xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-300">Generation Failed</p>
            <p className="text-rose-200/90 mt-0.5">{errorMessage}</p>
          </div>
          {onClearError && (
            <button
              onClick={onClearError}
              className="text-rose-400 hover:text-rose-200 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        {/* Target Role Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-zinc-400" />
            Target Role & Company
          </label>
          <input
            type="text"
            required
            value={targetRole}
            onChange={(e) => {
              setTargetRole(e.target.value);
              if (onClearError) onClearError();
            }}
            placeholder="e.g. Senior Backend Engineer at Netflix, Staff AI Engineer"
            className="w-full bg-zinc-950 text-white border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600"
          />
        </div>

        {/* Current Skills Tag Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              Verified Current Skills ({skills.length})
            </label>
            <span className="text-[11px] text-zinc-500 font-mono">Press Enter or comma</span>
          </div>

          {/* Tag Box */}
          <div className="min-h-[90px] bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 focus-within:border-indigo-500 transition-all flex flex-wrap gap-1.5 items-start">
            <AnimatePresence>
              {skills.map((skill) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-200 border border-zinc-700/80 text-xs font-mono"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-400 text-zinc-500 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>

            <div className="flex-1 min-w-[120px] flex items-center gap-1">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={skills.length === 0 ? "Type skills (e.g. React, SQL)..." : "Add more..."}
                className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-zinc-600 px-1 py-1"
              />
              {skillInput.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddSkill(skillInput)}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-colors text-xs flex items-center gap-1 shrink-0 px-2 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Add Suggestions */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            <span className="text-[11px] text-zinc-500 mr-1 self-center font-mono">Quick add:</span>
            {POPULAR_SKILLS.filter((s) => !skills.includes(s)).slice(0, 5).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleAddSkill(suggestion)}
                className="text-[11px] px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors font-mono cursor-pointer"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Available Hours */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Weekly Bandwidth
              </span>
              <span className="text-xs font-mono font-semibold text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {hoursPerWeek} hrs/wk
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-zinc-800 h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* Target Timeline */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Target Timeline
              </span>
              <span className="text-xs font-mono font-semibold text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {timelineMonths} months
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              step={1}
              value={timelineMonths}
              onChange={(e) => setTimelineMonths(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-zinc-800 h-1 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
          >
            <span>Generate Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
