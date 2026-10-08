import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Compass,
  CheckCircle2,
  Flame,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { RoadmapPreview } from './RoadmapPreview';

interface RoadmapConfiguratorProps {
  onBackToLanding: () => void;
}

export const RoadmapConfigurator: React.FC<RoadmapConfiguratorProps> = ({ onBackToLanding }) => {
  const [step, setStep] = useState<number>(1);
  const [currentRole, setCurrentRole] = useState('Full-Stack Software Engineer');
  const [targetRole, setTargetRole] = useState('Staff AI Systems Architect');
  const [yearsExp, setYearsExp] = useState('3-5 Years');
  const [targetComp, setTargetComp] = useState('$220k - $280k');
  const [weeklyHours, setWeeklyHours] = useState('8-12 hrs/week');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1600);
  };

  const handleReset = () => {
    setIsGenerated(false);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-indigo-600/10 via-purple-600/10 to-transparent blur-[140px] pointer-events-none -z-0" />

      {/* Top Navbar */}
      <header className="w-full border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors group px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-indigo-400" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-md">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">
              PathCraft<span className="text-indigo-400"> Builder</span>
            </span>
          </div>

          <div className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {isGenerated ? 'Roadmap Active' : `Configurator • Step ${step} of 3`}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 z-10 flex flex-col justify-center">
        {isGenerating ? (
          /* Loading State Animation */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-20 space-y-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Reverse-Engineering Milestones...</h3>
              <p className="text-slate-400 text-sm max-w-md">
                Analyzing 14,000+ candidate transitions from <span className="text-indigo-300">{currentRole}</span> to <span className="text-purple-300">{targetRole}</span>.
              </p>
            </div>
          </motion.div>
        ) : isGenerated ? (
          /* Generated Custom Roadmap View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-[#121222] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Customized Roadmap Generated
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Trajectory: {currentRole} → {targetRole}
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  Estimated Timeline: <span className="text-indigo-300 font-semibold font-mono">12 - 16 Months</span> • Target Comp: <span className="text-emerald-400 font-semibold font-mono">{targetComp}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-2 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reconfigure Parameters
                </button>
              </div>
            </div>

            <RoadmapPreview />
          </motion.div>
        ) : (
          /* Step-by-Step Configurator Form */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121220]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative"
          >
            {/* Step Progress Bar */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                  1
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-200">Current Level</span>
              </div>
              <div className="h-[2px] flex-1 mx-4 bg-white/10 relative">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }} />
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                  2
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-200">Target Role</span>
              </div>
              <div className="h-[2px] flex-1 mx-4 bg-white/10 relative">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: step === 3 ? '100%' : '0%' }} />
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                  3
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-200">Velocity</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Where are you currently situated?</h3>
                    <p className="text-slate-400 text-sm mt-1">Specify your current baseline to determine your step 1 starting skills.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Current Role / Title
                      </label>
                      <input
                        type="text"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        className="w-full bg-[#18182b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="e.g. Junior Backend Engineer, Frontend Dev"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Years of Professional Experience
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['0-2 Years', '3-5 Years', '5-8 Years', '8+ Years'].map((exp) => (
                          <button
                            key={exp}
                            type="button"
                            onClick={() => setYearsExp(exp)}
                            className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all text-center ${
                              yearsExp === exp
                                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'bg-[#18182b] border-white/5 text-slate-300 hover:border-white/20'
                            }`}
                          >
                            {exp}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                    >
                      <span>Continue to Target</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">What is your dream destination?</h3>
                    <p className="text-slate-400 text-sm mt-1">Our engine will reverse-engineer every milestone needed to secure this title.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Dream Target Role
                      </label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full bg-[#18182b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="e.g. Staff AI Engineer, VP of Technology"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Desired Target Compensation Range
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {['$160k - $210k', '$220k - $280k', '$300k+ / Equity'].map((comp) => (
                          <button
                            key={comp}
                            type="button"
                            onClick={() => setTargetComp(comp)}
                            className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all text-center ${
                              targetComp === comp
                                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'bg-[#18182b] border-white/5 text-slate-300 hover:border-white/20'
                            }`}
                          >
                            {comp}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-all"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                    >
                      <span>Continue to Velocity</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Execution Pace & Commitment</h3>
                    <p className="text-slate-400 text-sm mt-1">Select your weekly bandwidth so we can accurately calibrate sprint durations.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { hours: '4-6 hrs/week', title: 'Steady Pace', desc: 'Sustainable progress alongside a busy full-time schedule.' },
                      { hours: '8-12 hrs/week', title: 'Accelerated Leap', desc: 'Recommended balance for 12-month promotion cycles.' },
                      { hours: '15+ hrs/week', title: 'Sprint Mode', desc: 'Aggressive skill sprint for immediate career pivots.' }
                    ].map((item) => (
                      <div
                        key={item.hours}
                        onClick={() => setWeeklyHours(item.hours)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                          weeklyHours === item.hours
                            ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl'
                            : 'bg-[#18182b] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-sm">{item.title}</span>
                          <Flame className={`w-4 h-4 ${weeklyHours === item.hours ? 'text-amber-400' : 'text-slate-500'}`} />
                        </div>
                        <div className="text-xs font-mono text-indigo-400 mb-1.5">{item.hours}</div>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-all"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-sm transition-all hover:opacity-95 shadow-xl shadow-indigo-600/30 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Synthesize Full Roadmap</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
};
