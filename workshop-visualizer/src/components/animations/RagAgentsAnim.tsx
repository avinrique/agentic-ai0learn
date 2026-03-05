'use client';
import { motion } from 'framer-motion';
import { useConceptStore } from '@/stores/conceptStore';
import { useState, useEffect } from 'react';

const spring = { type: 'spring' as const, damping: 25, stiffness: 120 };
export default function RagAgentsAnim() {
  const { currentStep } = useConceptStore();
  const s = currentStep;

  // Agent example step sequencer (step 11)
  const [agentPhase, setAgentPhase] = useState(0);
  useEffect(() => {
    if (s === 11) {
      setAgentPhase(0);
      const timer = setInterval(() => {
        setAgentPhase((prev) => (prev < 5 ? prev + 1 : 0));
      }, 1200);
      return () => clearInterval(timer);
    }
  }, [s]);

  // RAG pipeline pulse (step 7)
  const [pulsePosIdx, setPulsePosIdx] = useState(0);
  useEffect(() => {
    if (s === 7) {
      setPulsePosIdx(0);
      const timer = setInterval(() => {
        setPulsePosIdx((prev) => (prev < 5 ? prev + 1 : 0));
      }, 700);
      return () => clearInterval(timer);
    }
  }, [s]);

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* ===== ACT 1: THE PROBLEM (Steps 0-2) ===== */}

      {/* Step 0: Knowledge Cutoff Timeline */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 0 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-xl w-full">
          <p className="text-sm text-white/40 mb-6 text-center">
            The Knowledge Cutoff
          </p>

          {/* Timeline */}
          <div className="relative flex items-center h-20">
            {/* Line */}
            <div className="absolute w-full h-0.5 bg-white/10 top-1/2" />

            {/* Training data (left) — with real dates */}
            <motion.div
              className="absolute flex flex-col items-start gap-1"
              style={{ left: '3%', top: '0%' }}
              animate={{ opacity: s === 0 ? 1 : 0 }}
              transition={{ ...spring, delay: 0.2 }}
            >
              <div className="flex gap-2 mb-1">
                {['📚', '🌐', '💻'].map((icon, i) => (
                  <motion.span
                    key={i}
                    className="text-2xl"
                    animate={{ opacity: s === 0 ? 1 : 0, y: s === 0 ? 0 : 10 }}
                    transition={{ ...spring, delay: 0.3 + i * 0.1 }}
                  >
                    {icon}
                  </motion.span>
                ))}
              </div>
              <span className="text-[9px] text-accent-blue/60">Books, Wikipedia, GitHub, Reddit...</span>
            </motion.div>
            <motion.p
              className="absolute text-[10px] text-accent-blue font-bold"
              style={{ left: '3%', bottom: '-5%' }}
              animate={{ opacity: s === 0 ? 1 : 0 }}
              transition={{ ...spring, delay: 0.4 }}
            >
              Trained on data up to 2023-2024
            </motion.p>

            {/* Cutoff line */}
            <motion.div
              className="absolute flex flex-col items-center"
              style={{ left: '55%', top: '-10%' }}
              animate={{
                opacity: s === 0 ? 1 : 0,
              }}
              transition={{ ...spring, delay: 0.6 }}
            >
              <div className="h-24 w-0.5 border-l-2 border-dashed border-red-400/60" />
              <span className="text-[10px] text-red-400 font-bold mt-1">
                TRAINING CUTOFF
              </span>
            </motion.div>

            {/* Unknown data (right) */}
            <motion.div
              className="absolute flex gap-3"
              style={{ right: '5%', top: '10%' }}
              animate={{ opacity: s === 0 ? 0.3 : 0 }}
              transition={{ ...spring, delay: 0.8 }}
            >
              {['📰', '📁', '📊'].map((icon, i) => (
                <span key={i} className="text-2xl grayscale">
                  {icon}
                </span>
              ))}
            </motion.div>
            <motion.p
              className="absolute text-[10px] text-white/30"
              style={{ right: '5%', bottom: '0%' }}
              animate={{ opacity: s === 0 ? 1 : 0 }}
              transition={{ ...spring, delay: 0.9 }}
            >
              Your Data — invisible
            </motion.p>
          </div>

          {/* LLM at cutoff */}
          <motion.div
            className="flex justify-center mt-6"
            animate={{ opacity: s === 0 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.7 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-3xl">🧠</span>
              <span className="text-xs text-white/40">stuck at the cutoff</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Step 1: Private Data Problem */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 1 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-8 max-w-xl w-full">
          {/* LLM brain with thought bubble */}
          <motion.div
            className="flex flex-col items-center"
            animate={{
              opacity: s === 1 ? 1 : 0,
              x: s === 1 ? 0 : -20,
            }}
            transition={spring}
          >
            <div className="w-24 h-24 rounded-2xl border-2 border-accent-blue/30 bg-accent-blue/5 flex items-center justify-center">
              <span className="text-4xl">🧠</span>
            </div>
            <p className="text-[10px] text-white/30 mt-1">Generic knowledge</p>
          </motion.div>

          {/* Red X between */}
          <motion.span
            className="text-4xl text-red-400"
            animate={{
              opacity: s === 1 ? 1 : 0,
              scale: s === 1 ? 1 : 0,
            }}
            transition={{ ...spring, delay: 0.3 }}
          >
            ✕
          </motion.span>

          {/* Locked filing cabinet */}
          <motion.div
            className="flex flex-col items-center"
            animate={{
              opacity: s === 1 ? 1 : 0,
              x: s === 1 ? 0 : 20,
            }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <div className="w-24 h-24 rounded-2xl border-2 border-accent-gold/30 bg-accent-gold/5 flex items-center justify-center">
              <span className="text-4xl">🔒</span>
            </div>
            <p className="text-[10px] text-white/30 mt-1">Your Data</p>
          </motion.div>
        </div>

        {/* Error response */}
        <motion.div
          className="absolute bottom-[20%] left-1/2"
          style={{ transform: 'translateX(-50%)' }}
          animate={{
            opacity: s === 1 ? 1 : 0,
            y: s === 1 ? 0 : 10,
          }}
          transition={{ ...spring, delay: 0.6 }}
        >
          <div className="px-4 py-2 rounded-lg border border-red-400/30 bg-red-400/5 text-center">
            <p className="text-xs text-white/30 mb-1">User: &quot;What were Q3 sales?&quot;</p>
            <p className="text-xs text-red-400 italic">
              &quot;I don&apos;t have access to your company data...&quot;
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Step 2: Two Solutions */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 2 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex gap-6 mb-6">
          {/* RAG card */}
          <motion.div
            className="rounded-xl border-2 border-accent-blue/30 p-5 w-52 text-center bg-accent-blue/5"
            animate={{
              opacity: s === 2 ? 1 : 0,
              x: s === 2 ? 0 : -30,
            }}
            transition={{ ...spring, delay: 0.15 }}
          >
            <div className="text-3xl mb-2">📚🔍</div>
            <p className="text-lg font-bold text-accent-blue">RAG</p>
            <p className="text-xs text-white/40 mt-1">Better Input</p>
          </motion.div>

          {/* Agents card */}
          <motion.div
            className="rounded-xl border-2 border-accent-gold/30 p-5 w-52 text-center bg-accent-gold/5"
            animate={{
              opacity: s === 2 ? 1 : 0,
              x: s === 2 ? 0 : 30,
            }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <div className="text-3xl mb-2">⚙️</div>
            <p className="text-lg font-bold text-accent-gold">Agents</p>
            <p className="text-xs text-white/40 mt-1">Ability to Act</p>
          </motion.div>
        </div>

        {/* Roadmap line */}
        <motion.div
          className="flex items-center gap-3"
          animate={{
            opacity: s === 2 ? 1 : 0,
            y: s === 2 ? 0 : 10,
          }}
          transition={{ ...spring, delay: 0.5 }}
        >
          <span className="text-xs text-accent-blue">First RAG</span>
          <div className="w-16 h-0.5 border-t border-dashed border-white/20" />
          <span className="text-xs text-accent-gold">Then Agents</span>
        </motion.div>
      </motion.div>

      {/* ===== ACT 2: RAG (Steps 3-7) ===== */}

      {/* Step 3: The RAG Idea — R.A.G. letters */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 3 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-8 mb-6">
          {[
            { letter: 'R', word: 'Retrieve', icon: '🔍', color: '#4a9eff' },
            { letter: 'A', word: 'Augment', icon: '➕', color: '#a78bfa' },
            { letter: 'G', word: 'Generate', icon: '✨', color: '#4ade80' },
          ].map((item, i) => (
            <motion.div
              key={item.letter}
              className="flex flex-col items-center"
              animate={{
                opacity: s === 3 ? 1 : 0,
                y: s === 3 ? 0 : 20,
              }}
              transition={{ ...spring, delay: i * 0.2 }}
            >
              <span className="text-3xl mb-2">{item.icon}</span>
              <motion.span
                className="text-4xl font-bold"
                style={{ color: item.color }}
                animate={{
                  scale: s === 3 ? [1, 1.15, 1] : 1,
                }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.3 }}
              >
                {item.letter}
              </motion.span>
              <span className="text-xs text-white/40 mt-1">{item.word}</span>
            </motion.div>
          ))}
        </div>
        <motion.p
          className="text-sm text-white/30"
          animate={{ opacity: s === 3 ? 1 : 0 }}
          transition={{ ...spring, delay: 1.2 }}
        >
          Retrieval-Augmented Generation
        </motion.p>
      </motion.div>

      {/* Step 4: Retrieve — search docs */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 4 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          {/* User question */}
          <motion.div
            className="px-3 py-2 rounded-lg border border-accent-blue/30 bg-accent-blue/5 mb-4 text-center"
            animate={{ opacity: s === 4 ? 1 : 0 }}
            transition={spring}
          >
            <span className="text-xs text-accent-blue">&quot;What were Q3 sales?&quot;</span>
          </motion.div>

          {/* Document grid */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { name: 'Q3 Report.pdf', icon: '📄', match: true },
              { name: 'Sales Data.csv', icon: '📊', match: true },
              { name: 'Q1 Report.pdf', icon: '📄', match: false },
              { name: 'Meeting Notes', icon: '📝', match: false },
              { name: 'HR Policy.pdf', icon: '📄', match: false },
              { name: 'Q2 Budget.csv', icon: '📊', match: false },
              { name: 'Product Spec', icon: '📝', match: false },
              { name: 'API Docs.md', icon: '📄', match: false },
            ].map((doc, i) => (
              <motion.div
                key={doc.name}
                className="px-2 py-2 rounded-lg border text-center"
                style={{
                  borderColor: doc.match
                    ? 'rgba(74,222,128,0.5)'
                    : 'rgba(255,255,255,0.1)',
                  backgroundColor: doc.match
                    ? 'rgba(74,222,128,0.05)'
                    : 'rgba(255,255,255,0.03)',
                }}
                animate={{
                  opacity: s === 4 ? (doc.match ? 1 : 0.3) : 0,
                  scale: s === 4 && doc.match ? 1.05 : 1,
                  boxShadow: doc.match
                    ? '0 0 12px rgba(74,222,128,0.2)'
                    : '0 0 0px transparent',
                }}
                transition={{ ...spring, delay: 0.2 + i * 0.06 }}
              >
                <span className="text-lg">{doc.icon}</span>
                <p className="text-[9px] text-white/40 mt-0.5 truncate">{doc.name}</p>
              </motion.div>
            ))}
          </div>

          {/* Magnifying glass */}
          <motion.div
            className="text-3xl text-center"
            animate={{
              opacity: s === 4 ? 1 : 0,
              x: s === 4 ? [0, 100, 0] : 0,
            }}
            transition={{
              opacity: spring,
              x: { duration: 2, ease: 'easeInOut' },
            }}
          >
            🔍
          </motion.div>
        </div>
      </motion.div>

      {/* Step 5: Augment — inject into messages array */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 5 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-6 max-w-2xl w-full">
          {/* Retrieved docs */}
          <motion.div
            className="flex flex-col gap-2"
            animate={{
              opacity: s === 5 ? 1 : 0,
              x: s === 5 ? 0 : -20,
            }}
            transition={spring}
          >
            {['📄 Q3 Report', '📊 Sales Data'].map((doc, i) => (
              <motion.div
                key={doc}
                className="px-3 py-1.5 rounded-lg border border-accent-green/30 bg-accent-green/5 text-xs text-white/60"
                animate={{
                  x: s === 5 ? [0, 20, 0] : 0,
                }}
                transition={{
                  x: { duration: 1.2, delay: 0.5 + i * 0.2, ease: 'easeInOut' },
                }}
              >
                {doc}
              </motion.div>
            ))}
          </motion.div>

          {/* Arrow */}
          <motion.span
            className="text-white/30 text-2xl"
            animate={{ opacity: s === 5 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            →
          </motion.span>

          {/* Messages array */}
          <motion.div
            className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3"
            animate={{
              opacity: s === 5 ? 1 : 0,
              x: s === 5 ? 0 : 20,
            }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <p className="text-[10px] text-white/30 font-mono mb-2">messages = [</p>
            <div className="space-y-1.5 pl-2">
              <div className="px-2 py-1 rounded border border-accent-purple/30 bg-accent-purple/5 text-xs text-white/50">
                <span className="text-accent-purple text-[10px] font-bold">SYSTEM</span> You are a helpful assistant
              </div>
              <motion.div
                className="px-2 py-1 rounded border-2 border-accent-green/40 bg-accent-green/10 text-xs"
                animate={{
                  opacity: s === 5 ? 1 : 0,
                  scale: s === 5 ? 1 : 0.9,
                }}
                transition={{ ...spring, delay: 0.8 }}
              >
                <span className="text-accent-green text-[10px] font-bold">CONTEXT</span>
                <span className="text-white/50 ml-1">Retrieved: Q3 revenue was $4.2M...</span>
              </motion.div>
              <div className="px-2 py-1 rounded border border-accent-blue/30 bg-accent-blue/5 text-xs text-white/50">
                <span className="text-accent-blue text-[10px] font-bold">USER</span> What were Q3 sales?
              </div>
            </div>
            <p className="text-[10px] text-white/30 font-mono mt-2">]</p>
          </motion.div>

          {/* Arrow to LLM */}
          <motion.span
            className="text-white/30 text-2xl"
            animate={{ opacity: s === 5 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.5 }}
          >
            →
          </motion.span>
          <motion.div
            className="text-3xl"
            animate={{ opacity: s === 5 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.6 }}
          >
            🧠
          </motion.div>
        </div>
      </motion.div>

      {/* Step 6: Generate — grounded response */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 6 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          {/* LLM glowing green */}
          <motion.div
            className="flex justify-center mb-4"
            animate={{ opacity: s === 6 ? 1 : 0 }}
            transition={spring}
          >
            <motion.div
              className="w-20 h-20 rounded-2xl border-2 border-accent-green/40 bg-accent-green/5 flex items-center justify-center"
              animate={{
                boxShadow: s === 6
                  ? '0 0 24px rgba(74,222,128,0.3)'
                  : '0 0 0px transparent',
              }}
              transition={spring}
            >
              <span className="text-3xl">🧠</span>
            </motion.div>
          </motion.div>

          {/* Response with provenance */}
          <motion.div
            className="rounded-xl border-2 border-accent-green/30 p-4 bg-accent-green/5 text-center relative"
            animate={{
              opacity: s === 6 ? 1 : 0,
              y: s === 6 ? 0 : 15,
            }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <p className="text-sm text-accent-green leading-relaxed">
              &quot;Your Q3 revenue was{' '}
              <span className="font-bold underline decoration-dashed decoration-accent-blue/50">$4.2M</span>
              , up{' '}
              <span className="font-bold underline decoration-dashed decoration-accent-blue/50">18% YoY</span>
              , driven by enterprise contracts...&quot;
            </p>
            <motion.span
              className="inline-block mt-2 px-2 py-0.5 rounded bg-accent-green/20 text-accent-green text-[10px] font-bold"
              animate={{
                opacity: s === 6 ? 1 : 0,
                scale: s === 6 ? 1 : 0.8,
              }}
              transition={{ ...spring, delay: 0.6 }}
            >
              GROUNDED
            </motion.span>
          </motion.div>

          {/* Source docs below */}
          <motion.div
            className="flex justify-center gap-4 mt-3"
            animate={{ opacity: s === 6 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.8 }}
          >
            {['📄 Q3 Report.pdf', '📊 Sales Data.csv'].map((doc) => (
              <div
                key={doc}
                className="px-2 py-1 rounded text-[10px] text-white/40 border border-white/10 bg-white/3"
              >
                ↑ from {doc}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Step 7: RAG Pipeline with pulse */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 7 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-xl w-full">
          <div className="flex items-center justify-between gap-2">
            {[
              { label: 'Question', icon: '❓', color: '#4a9eff' },
              { label: 'Search', icon: '🔍', color: '#a78bfa' },
              { label: 'Documents', icon: '📄', color: '#4ade80' },
              { label: 'Inject', icon: '💉', color: '#fbbf24' },
              { label: 'LLM', icon: '🧠', color: '#4a9eff' },
              { label: 'Answer', icon: '✅', color: '#4ade80' },
            ].map((step, i) => (
              <motion.div
                key={step.label}
                className="flex flex-col items-center"
                animate={{
                  opacity: s === 7 ? 1 : 0,
                  y: s === 7 ? 0 : 10,
                  scale: pulsePosIdx === i ? 1.15 : 1,
                }}
                transition={{ ...spring, delay: i * 0.1 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-xl border-2 flex items-center justify-center mb-1"
                  style={{
                    borderColor: `${step.color}40`,
                    backgroundColor: `${step.color}10`,
                    boxShadow: pulsePosIdx === i ? `0 0 16px ${step.color}40` : 'none',
                  }}
                >
                  <span className="text-xl">{step.icon}</span>
                </motion.div>
                <span className="text-[9px] text-white/40">{step.label}</span>
                {i < 5 && (
                  <motion.span
                    className="absolute text-white/20 text-xs"
                    style={{ left: `${12 + i * 17}%`, top: '46%' }}
                  >
                    →
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-6 px-4 py-2 rounded-xl bg-accent-blue/10 border border-accent-blue/30 inline-block"
            style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
            animate={{
              opacity: s === 7 ? 1 : 0,
            }}
            transition={{ ...spring, delay: 0.8 }}
          >
            <p className="text-sm font-bold text-accent-blue">
              RAG = Better Input
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== ACT 3: AGENTS (Steps 8-13) ===== */}

      {/* Step 8: Beyond Text In, Text Out — with real-world examples */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 8 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-2xl w-full">
          {/* LLM brain center */}
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-20 h-20 rounded-2xl border-2 border-accent-blue/30 bg-accent-blue/5 flex items-center justify-center"
              animate={{ opacity: s === 8 ? 1 : 0 }}
              transition={spring}
            >
              <span className="text-3xl">🧠</span>
            </motion.div>
          </div>
          <motion.p
            className="text-xs text-white/40 italic text-center mb-5"
            animate={{ opacity: s === 8 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            &quot;I know HOW to do these things... but I can&apos;t actually DO them&quot;
          </motion.p>

          {/* Two-column: Knows HOW vs Can't DO */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left: What it knows */}
            <motion.div
              className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-4"
              animate={{ opacity: s === 8 ? 1 : 0, x: s === 8 ? 0 : -20 }}
              transition={{ ...spring, delay: 0.3 }}
            >
              <p className="text-xs text-accent-blue font-bold mb-3">Knows HOW to...</p>
              {[
                { icon: '✈️', text: '"To book a flight, go to airline website, select dates..."' },
                { icon: '📧', text: '"Dear John, I\'d like to schedule a meeting for..."' },
                { icon: '🗄️', text: '"SELECT revenue FROM sales WHERE quarter = \'Q3\'"' },
                { icon: '🌤️', text: '"Check weather.gov or use a weather API..."' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2 mb-2"
                  animate={{ opacity: s === 8 ? 1 : 0 }}
                  transition={{ ...spring, delay: 0.4 + i * 0.1 }}
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <span className="text-[10px] text-white/50 italic">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Right: Can't DO */}
            <motion.div
              className="rounded-xl border border-red-400/20 bg-red-400/5 p-4"
              animate={{ opacity: s === 8 ? 1 : 0, x: s === 8 ? 0 : 20 }}
              transition={{ ...spring, delay: 0.4 }}
            >
              <p className="text-xs text-red-400 font-bold mb-3">But CAN&apos;T actually...</p>
              {[
                { icon: '✕', text: 'Click "Book Now" on a website' },
                { icon: '✕', text: 'Send a real email to anyone' },
                { icon: '✕', text: 'Run SQL against your database' },
                { icon: '✕', text: 'Check today\'s actual weather' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2 mb-2"
                  animate={{ opacity: s === 8 ? 1 : 0 }}
                  transition={{ ...spring, delay: 0.5 + i * 0.1 }}
                >
                  <span className="text-red-400 text-sm shrink-0">{item.icon}</span>
                  <span className="text-[10px] text-white/50">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.p
            className="text-xs text-accent-gold text-center mt-4"
            animate={{ opacity: s === 8 ? 1 : 0 }}
            transition={{ ...spring, delay: 1 }}
          >
            Agents solve this — they let the LLM call tools that DO things
          </motion.p>
        </div>
      </motion.div>

      {/* Step 9: The Tool Call */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 9 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-6 max-w-xl w-full">
          {/* LLM outputs JSON */}
          <motion.div
            className="flex-1"
            animate={{
              opacity: s === 9 ? 1 : 0,
              x: s === 9 ? 0 : -20,
            }}
            transition={spring}
          >
            <p className="text-[10px] text-white/30 mb-1">LLM outputs:</p>
            <div className="px-3 py-2 rounded-lg border border-accent-gold/30 bg-accent-gold/5 font-mono text-xs">
              <span className="text-white/30">{'{'}</span><br />
              <span className="text-accent-gold">&nbsp;&nbsp;tool</span>
              <span className="text-white/30">: </span>
              <span className="text-accent-green">&quot;get_weather&quot;</span><br />
              <span className="text-accent-gold">&nbsp;&nbsp;args</span>
              <span className="text-white/30">: {'{'} </span>
              <span className="text-accent-blue">city</span>
              <span className="text-white/30">: </span>
              <span className="text-accent-green">&quot;Paris&quot;</span>
              <span className="text-white/30"> {'}'}</span><br />
              <span className="text-white/30">{'}'}</span>
            </div>
          </motion.div>

          {/* Arrow to gear */}
          <motion.div
            className="flex flex-col items-center gap-1"
            animate={{
              opacity: s === 9 ? 1 : 0,
            }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <span className="text-accent-gold text-sm">→</span>
          </motion.div>

          {/* Your Application gear */}
          <motion.div
            className="flex flex-col items-center"
            animate={{
              opacity: s === 9 ? 1 : 0,
              x: s === 9 ? 0 : 20,
            }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <motion.div
              className="w-16 h-16 rounded-xl border-2 border-accent-gold/30 bg-accent-gold/5 flex items-center justify-center"
              animate={{
                rotate: s === 9 ? [0, 360] : 0,
              }}
              transition={{
                rotate: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                },
              }}
            >
              <span className="text-2xl">⚙️</span>
            </motion.div>
            <p className="text-[10px] text-white/30 mt-1">Your App</p>
          </motion.div>

          {/* Arrow back */}
          <motion.div
            className="flex flex-col items-center gap-1"
            animate={{
              opacity: s === 9 ? 1 : 0,
            }}
            transition={{ ...spring, delay: 0.5 }}
          >
            <span className="text-accent-green text-sm">→</span>
          </motion.div>

          {/* Result */}
          <motion.div
            className="px-3 py-2 rounded-lg border border-accent-green/30 bg-accent-green/5 font-mono text-xs"
            animate={{
              opacity: s === 9 ? 1 : 0,
              x: s === 9 ? 0 : 20,
            }}
            transition={{ ...spring, delay: 0.6 }}
          >
            <span className="text-white/30">{'{'}</span><br />
            <span className="text-accent-green">&nbsp;&nbsp;result</span>
            <span className="text-white/30">: </span>
            <span className="text-accent-blue">&quot;22°C&quot;</span><br />
            <span className="text-white/30">{'}'}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Step 10: The Agent Loop */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 10 ? 1 : 0 }}
        transition={spring}
      >
        <div className="relative w-72 h-72">
          {/* Circular loop nodes */}
          {[
            { label: 'Think', icon: '🧠', color: '#a78bfa', angle: 270 },
            { label: 'Decide', icon: '💡', color: '#fbbf24', angle: 0 },
            { label: 'Execute', icon: '⚡', color: '#4ade80', angle: 90 },
            { label: 'Observe', icon: '👁', color: '#4a9eff', angle: 180 },
          ].map((node, i) => {
            const rad = (node.angle * Math.PI) / 180;
            const cx = 136 + Math.cos(rad) * 100;
            const cy = 136 + Math.sin(rad) * 100;
            return (
              <motion.div
                key={node.label}
                className="absolute flex flex-col items-center"
                style={{
                  left: cx - 24,
                  top: cy - 24,
                }}
                animate={{
                  opacity: s === 10 ? 1 : 0,
                  scale: s === 10 ? 1 : 0.5,
                }}
                transition={{ ...spring, delay: i * 0.15 }}
              >
                <div
                  className="w-12 h-12 rounded-xl border-2 flex items-center justify-center"
                  style={{
                    borderColor: `${node.color}40`,
                    backgroundColor: `${node.color}10`,
                  }}
                >
                  <span className="text-xl">{node.icon}</span>
                </div>
                <span
                  className="text-[10px] font-bold mt-0.5"
                  style={{ color: node.color }}
                >
                  {node.label}
                </span>
              </motion.div>
            );
          })}

          {/* Circular path */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 272 272"
          >
            <motion.circle
              cx="136"
              cy="136"
              r="100"
              fill="none"
              stroke="#fbbf2430"
              strokeWidth={2}
              strokeDasharray="12 6"
              animate={{
                strokeDashoffset: [0, -36],
              }}
              transition={{
                strokeDashoffset: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                },
              }}
            />
          </svg>

          {/* Exit arrow */}
          <motion.div
            className="absolute flex items-center gap-1"
            style={{ right: -60, top: '50%', transform: 'translateY(-50%)' }}
            animate={{
              opacity: s === 10 ? 1 : 0,
            }}
            transition={{ ...spring, delay: 0.8 }}
          >
            <span className="text-white/30 text-sm">→</span>
            <span className="text-xs text-accent-green">Final Response</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Step 11: A Real Example — vertical timeline */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 11 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-sm w-full">
          {[
            { label: 'User', text: '"What\'s the weather in Paris?"', color: '#4a9eff', icon: '💬' },
            { label: 'LLM thinks', text: '"I need weather data"', color: '#a78bfa', icon: '🧠' },
            { label: 'Tool call', text: 'get_weather("Paris")', color: '#fbbf24', icon: '⚙️' },
            { label: 'Result', text: '"22°C, rain"', color: '#4ade80', icon: '📊' },
            { label: 'LLM thinks', text: '"I can answer now"', color: '#a78bfa', icon: '🧠' },
            { label: 'Response', text: '"It\'s 22°C and rainy in Paris today."', color: '#4ade80', icon: '✅' },
          ].map((step, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 mb-2 relative"
              animate={{
                opacity: s === 11 ? (agentPhase >= i ? 1 : 0.2) : 0,
                x: s === 11 ? 0 : -10,
              }}
              transition={{ ...spring, delay: i * 0.05 }}
            >
              {/* Timeline line */}
              {i < 5 && (
                <div
                  className="absolute left-4 top-8 w-0.5 h-6"
                  style={{ backgroundColor: `${step.color}20` }}
                />
              )}
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
                style={{
                  borderColor: `${step.color}40`,
                  backgroundColor: agentPhase === i ? `${step.color}20` : `${step.color}08`,
                }}
              >
                <span className="text-sm">{step.icon}</span>
              </div>
              {/* Content */}
              <div>
                <span className="text-[10px] font-bold" style={{ color: step.color }}>
                  {step.label}
                </span>
                <p className="text-xs text-white/50">{step.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Step 12: Multi-Step Agents — branching flowchart */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 12 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          <motion.p
            className="text-sm text-accent-blue text-center mb-4"
            animate={{ opacity: s === 12 ? 1 : 0 }}
            transition={spring}
          >
            &quot;Plan a trip to Paris&quot;
          </motion.p>

          <div className="space-y-2">
            {[
              { action: 'Search flights', decision: 'Pick cheapest ($340)', icon: '✈️' },
              { action: 'Search hotels', decision: 'Filter by rating (4★+)', icon: '🏨' },
              { action: 'Check calendar', decision: 'March 15-20 is free', icon: '📅' },
              { action: 'Book flight + hotel', decision: 'Confirmation #A4F29B', icon: '✅' },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3"
                animate={{
                  opacity: s === 12 ? 1 : 0,
                  x: s === 12 ? 0 : -15,
                }}
                transition={{ ...spring, delay: i * 0.15 }}
              >
                <span className="text-lg">{step.icon}</span>
                <div className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                  <span className="text-xs text-white/60">{step.action}</span>
                </div>
                <span className="text-white/20">→</span>
                <motion.div
                  className="flex-1 px-3 py-2 rounded-lg border border-accent-gold/20 bg-accent-gold/5"
                  animate={{
                    opacity: s === 12 ? 1 : 0,
                  }}
                  transition={{ ...spring, delay: 0.3 + i * 0.15 }}
                >
                  <span className="text-xs text-accent-gold">{step.decision}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-[10px] text-white/30 text-center mt-3"
            animate={{ opacity: s === 12 ? 1 : 0 }}
            transition={{ ...spring, delay: 1 }}
          >
            LLM makes decisions at every step
          </motion.p>
        </div>
      </motion.div>

      {/* Step 13: What Tools Can Do — grid */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 13 ? 1 : 0 }}
        transition={spring}
      >
        <div className="relative max-w-md w-full">
          {/* LLM brain center */}
          <motion.div
            className="flex justify-center mb-6"
            animate={{ opacity: s === 13 ? 1 : 0 }}
            transition={spring}
          >
            <div className="w-16 h-16 rounded-2xl border-2 border-accent-blue/30 bg-accent-blue/5 flex items-center justify-center">
              <span className="text-3xl">🧠</span>
            </div>
          </motion.div>

          {/* Tool cards grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: '🔍', label: 'Search' },
              { icon: '💻', label: 'Code' },
              { icon: '📁', label: 'Files' },
              { icon: '🗄️', label: 'Database' },
              { icon: '🌐', label: 'APIs' },
              { icon: '📧', label: 'Email' },
              { icon: '🧮', label: 'Calculator' },
              { icon: '📊', label: 'Analytics' },
            ].map((tool, i) => (
              <motion.div
                key={tool.label}
                className="flex flex-col items-center px-2 py-3 rounded-xl border border-white/10 bg-white/5"
                animate={{
                  opacity: s === 13 ? 1 : 0,
                  scale: s === 13 ? 1 : 0,
                }}
                transition={{ ...spring, delay: 0.2 + i * 0.08 }}
              >
                <span className="text-xl mb-1">{tool.icon}</span>
                <span className="text-[10px] text-white/40">{tool.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ===== ACT 4: THE BIG PICTURE (Steps 14-15) ===== */}

      {/* Step 14: RAG + Agents = Maximum Power */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 14 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          {/* Two cards at top */}
          <div className="flex gap-4 justify-center mb-4">
            <motion.div
              className="rounded-xl border-2 border-accent-blue/30 p-4 bg-accent-blue/5 text-center w-40"
              animate={{
                opacity: s === 14 ? 1 : 0,
                y: s === 14 ? 0 : -20,
              }}
              transition={{ ...spring, delay: 0.1 }}
            >
              <span className="text-2xl">📚</span>
              <p className="text-sm font-bold text-accent-blue mt-1">RAG</p>
              <p className="text-[10px] text-white/30">Better Input</p>
            </motion.div>
            <motion.div
              className="rounded-xl border-2 border-accent-gold/30 p-4 bg-accent-gold/5 text-center w-40"
              animate={{
                opacity: s === 14 ? 1 : 0,
                y: s === 14 ? 0 : -20,
              }}
              transition={{ ...spring, delay: 0.2 }}
            >
              <span className="text-2xl">⚙️</span>
              <p className="text-sm font-bold text-accent-gold mt-1">Agents</p>
              <p className="text-[10px] text-white/30">Ability to Act</p>
            </motion.div>
          </div>

          {/* Connection lines */}
          <motion.div
            className="flex justify-center mb-4"
            animate={{ opacity: s === 14 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-accent-blue/30" />
              <span className="text-white/30 text-lg">+</span>
              <div className="w-8 h-0.5 bg-accent-gold/30" />
            </div>
          </motion.div>

          {/* Combined card */}
          <motion.div
            className="rounded-xl border-2 border-accent-purple/30 p-5 bg-accent-purple/5 text-center"
            animate={{
              opacity: s === 14 ? 1 : 0,
              scale: s === 14 ? 1 : 0.9,
            }}
            transition={{ ...spring, delay: 0.6 }}
          >
            <p className="text-lg font-bold text-accent-purple mb-2">
              RAG + Agents
            </p>
            <p className="text-xs text-white/50 mb-3">
              RAG becomes a tool inside the agent loop
            </p>
            <div className="flex justify-center gap-2">
              {['Think', 'Search (RAG)', 'Act', 'Observe'].map((step, i) => (
                <motion.span
                  key={step}
                  className="px-2 py-1 rounded text-[10px] border"
                  style={{
                    borderColor: step.includes('RAG') ? 'rgba(74,158,255,0.3)' : 'rgba(167,139,250,0.3)',
                    color: step.includes('RAG') ? '#4a9eff' : '#a78bfa',
                  }}
                  animate={{
                    opacity: s === 14 ? 1 : 0,
                  }}
                  transition={{ ...spring, delay: 0.8 + i * 0.1 }}
                >
                  {step}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Step 15: What You'll Build — workshop roadmap */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 15 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          <motion.h2
            className="text-2xl font-bold text-white text-center mb-6"
            animate={{
              opacity: s === 15 ? 1 : 0,
              y: s === 15 ? 0 : 20,
            }}
            transition={spring}
          >
            What You&apos;ll Build
          </motion.h2>

          <div className="flex items-center gap-3 justify-center mb-6">
            {[
              {
                label: 'Part 1',
                desc: 'API & Prompts',
                color: '#4a9eff',
              },
              {
                label: 'Part 2',
                desc: 'First Agent',
                color: '#fbbf24',
              },
              {
                label: 'Part 3',
                desc: 'Multi-Tool Agents',
                color: '#a78bfa',
              },
            ].map((part, i) => (
              <motion.div
                key={part.label}
                className="flex items-center gap-3"
                animate={{
                  opacity: s === 15 ? 1 : 0,
                  x: s === 15 ? 0 : -20,
                }}
                transition={{ ...spring, delay: i * 0.2 }}
              >
                <div
                  className="rounded-xl border-2 p-4 text-center w-36"
                  style={{
                    borderColor: `${part.color}40`,
                    backgroundColor: `${part.color}08`,
                  }}
                >
                  <p
                    className="text-xs font-bold"
                    style={{ color: part.color }}
                  >
                    {part.label}
                  </p>
                  <p className="text-sm text-white/60 mt-1">{part.desc}</p>
                </div>
                {i < 2 && (
                  <motion.span
                    className="text-white/20"
                    animate={{ opacity: s === 15 ? 1 : 0 }}
                    transition={{ ...spring, delay: 0.5 + i * 0.2 }}
                  >
                    →
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center"
            animate={{
              opacity: s === 15 ? 1 : 0,
              scale: s === 15 ? 1 : 0.9,
            }}
            transition={{ ...spring, delay: 0.8 }}
          >
            <motion.span
              className="text-lg font-bold text-accent-green"
              animate={{
                opacity: s === 15 ? [0.5, 1, 0.5] : 0,
              }}
              transition={{
                opacity: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            >
              Let&apos;s go!
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
