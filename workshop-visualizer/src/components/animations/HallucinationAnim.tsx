'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useConceptStore } from '@/stores/conceptStore';

const spring = { type: 'spring' as const, damping: 25, stiffness: 120 };
const smooth = { duration: 0.6, ease: 'easeInOut' as const };

const fakeCitations = [
  { author: 'Smith, J. & Lee, K.', title: 'Deep Learning Approaches to NLP Tasks', journal: 'Journal of AI Research, Vol. 42', year: '2021' },
  { author: 'Chen, W. et al.', title: 'Transformer Attention Mechanisms Revisited', journal: 'Neural Computing Letters, 15(3)', year: '2022' },
  { author: 'Brown, A. & Patel, R.', title: 'Scaling Laws for Language Models', journal: 'Proceedings of ICML 2020', year: '2020' },
];

const confidenceExamples = [
  { text: 'The Earth orbits the Sun.', isTrue: true, confidence: 98 },
  { text: 'Water boils at 100°C at sea level.', isTrue: true, confidence: 97 },
  { text: 'The Great Wall of China is visible from space.', isTrue: false, confidence: 95 },
  { text: 'Humans use only 10% of their brain.', isTrue: false, confidence: 93 },
];

const reductionStrategies = [
  { icon: '📄', label: 'Use RAG', desc: 'Ground answers in real documents', color: '#4a9eff' },
  { icon: '🌡️', label: 'Lower temperature', desc: 'Reduce randomness, increase accuracy', color: '#fbbf24' },
  { icon: '🛑', label: '"Say I don\'t know"', desc: 'Add to system prompt: admit uncertainty', color: '#ef4444' },
  { icon: '🔍', label: 'Verify sources', desc: 'Ask for citations, then fact-check them', color: '#a78bfa' },
  { icon: '📝', label: 'Draft, not truth', desc: 'Use AI for drafting, humans for verification', color: '#4ade80' },
];

export default function HallucinationAnim() {
  const { currentStep } = useConceptStore();
  const s = currentStep;

  // Typing effect for hallucination reveal
  const [revealState, setRevealState] = useState<'typing' | 'confident' | 'wrong'>('typing');
  useEffect(() => {
    if (s === 0) {
      setRevealState('typing');
      const t1 = setTimeout(() => setRevealState('confident'), 1200);
      const t2 = setTimeout(() => setRevealState('wrong'), 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [s]);

  // Pattern matching animation for step 1
  const [patternIdx, setPatternIdx] = useState(0);
  useEffect(() => {
    if (s === 1) {
      setPatternIdx(0);
      const timer = setInterval(() => setPatternIdx((p) => (p < 3 ? p + 1 : 0)), 1200);
      return () => clearInterval(timer);
    }
  }, [s]);

  // Citation reveal for step 3
  const [citationRevealed, setCitationRevealed] = useState(-1);
  useEffect(() => {
    if (s === 3) {
      setCitationRevealed(-1);
      const timers = fakeCitations.map((_, i) =>
        setTimeout(() => setCitationRevealed(i), 800 + i * 1000)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [s]);

  // Confidence bar animation for step 5
  const [confIdx, setConfIdx] = useState(0);
  useEffect(() => {
    if (s === 5) {
      setConfIdx(0);
      const timer = setInterval(() => setConfIdx((p) => (p + 1) % confidenceExamples.length), 2000);
      return () => clearInterval(timer);
    }
  }, [s]);

  // Strategy reveal for step 6
  const [strategyRevealed, setStrategyRevealed] = useState(-1);
  useEffect(() => {
    if (s === 6) {
      setStrategyRevealed(-1);
      const timers = reductionStrategies.map((_, i) =>
        setTimeout(() => setStrategyRevealed(i), 300 + i * 500)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [s]);

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Step 0: "What is Hallucination?" — dramatic reveal */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: s === 0 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex flex-col items-center gap-6 max-w-lg">
          {/* AI response bubble */}
          <motion.div
            className="rounded-xl border-2 p-5 w-full relative"
            animate={{
              borderColor: revealState === 'wrong' ? '#ef444480' : '#4ade8040',
              backgroundColor: revealState === 'wrong' ? '#ef444408' : '#4ade8008',
            }}
            transition={smooth}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green">
                ASSISTANT
              </span>
              {revealState === 'confident' && (
                <motion.span
                  className="text-xs text-accent-green/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ✓ Sounds confident
                </motion.span>
              )}
            </div>

            <motion.p className="text-sm text-white/70 leading-relaxed">
              &quot;The Eiffel Tower was completed in <motion.span
                className="font-bold px-1 rounded"
                animate={{
                  color: revealState === 'wrong' ? '#ef4444' : '#4ade80',
                  backgroundColor: revealState === 'wrong' ? '#ef444420' : 'transparent',
                }}
                transition={smooth}
              >
                1892
              </motion.span> and stands at exactly 324 meters tall. It was designed by architect Gustave Eiffel for the World&apos;s Fair.&quot;
            </motion.p>

            {/* Wrong stamp */}
            <AnimatePresence>
              {revealState === 'wrong' && (
                <motion.div
                  className="absolute -top-3 -right-3 px-3 py-1 rounded-lg bg-red-500/20 border-2 border-red-500/50"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: -12 }}
                  transition={spring}
                >
                  <span className="text-red-400 font-bold text-sm">WRONG!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Correction */}
          <AnimatePresence>
            {revealState === 'wrong' && (
              <motion.div
                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-accent-blue/10 border border-accent-blue/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.3 }}
              >
                <span className="text-accent-blue text-sm">Actually completed in <strong>1889</strong></span>
                <span className="text-xs text-white/30">— off by 3 years</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p
            className="text-xs text-white/30 text-center"
            animate={{ opacity: s === 0 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.5 }}
          >
            The model sounds completely sure. But it&apos;s wrong.
          </motion.p>
        </div>
      </motion.div>

      {/* Step 1: "Why Does It Happen?" — pattern matching visualization */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 1 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-8 w-full max-w-2xl">
          {/* Left: Pattern matching */}
          <motion.div
            className="flex-1"
            animate={{ opacity: s === 1 ? 1 : 0, x: s === 1 ? 0 : -20 }}
            transition={spring}
          >
            <p className="text-xs text-white/30 mb-3">How the LLM &quot;thinks&quot;:</p>
            <div className="space-y-3">
              {[
                { pattern: '"The Eiffel Tower was built in 18__"', result: '→ predicts: "92"', note: 'Pattern match: 18XX = old European thing', isWrong: true },
                { pattern: '"Water boils at ___°C"', result: '→ predicts: "100"', note: 'Strong pattern: seen 1000s of times', isWrong: false },
                { pattern: '"The speed of light is ___"', result: '→ predicts: "3×10⁸ m/s"', note: 'Very strong pattern', isWrong: false },
                { pattern: '"The first iPhone was released in ___"', result: '→ predicts: "2008"', note: 'Close but wrong (2007)', isWrong: true },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="rounded-lg border p-2.5"
                  style={{
                    borderColor: patternIdx === i ? (item.isWrong ? '#ef444440' : '#4ade8040') : 'rgba(255,255,255,0.1)',
                    backgroundColor: patternIdx === i ? (item.isWrong ? '#ef444408' : '#4ade8008') : 'transparent',
                  }}
                  animate={{
                    opacity: s === 1 ? 1 : 0,
                    x: s === 1 ? 0 : -10,
                  }}
                  transition={{ ...spring, delay: 0.2 + i * 0.1 }}
                >
                  <p className="text-xs font-mono text-white/60">{item.pattern}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono" style={{ color: item.isWrong ? '#ef4444' : '#4ade80' }}>
                      {item.result}
                    </span>
                    {patternIdx === i && (
                      <motion.span
                        className="text-[10px]"
                        style={{ color: item.isWrong ? '#ef444480' : '#4ade8080' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {item.isWrong ? '✗ ' : '✓ '}{item.note}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Key insight */}
          <motion.div
            className="w-48 flex flex-col items-center gap-4"
            animate={{ opacity: s === 1 ? 1 : 0, x: s === 1 ? 0 : 20 }}
            transition={{ ...spring, delay: 0.5 }}
          >
            <div className="text-5xl">🧠</div>
            <div className="text-center space-y-2">
              <motion.p
                className="text-xs text-white/50 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                animate={{ opacity: s === 1 ? 1 : 0 }}
                transition={{ ...spring, delay: 0.7 }}
              >
                &quot;I don&apos;t <em>know</em> facts. I predict what text <em>looks like</em>.&quot;
              </motion.p>
              <motion.div
                className="flex items-center justify-center gap-2"
                animate={{ opacity: s === 1 ? 1 : 0 }}
                transition={{ ...spring, delay: 1 }}
              >
                <span className="text-xs text-accent-gold">Plausible ≠ True</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Step 2: "Confident but Wrong" — before/after comparison */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 2 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          <motion.p
            className="text-sm text-white/40 mb-4 text-center"
            animate={{ opacity: s === 2 ? 1 : 0 }}
            transition={spring}
          >
            Spot the errors — they&apos;re subtle:
          </motion.p>

          {[
            { claim: 'The Golden Gate Bridge was completed in 1936.', truth: 'Actually: 1937', diff: '1 year off' },
            { claim: 'Mount Everest is 29,032 feet tall.', truth: 'Actually: 29,031.7 ft (recently updated)', diff: 'Close but outdated' },
            { claim: 'Einstein won the Nobel Prize for relativity.', truth: 'Actually: for the photoelectric effect', diff: 'Common misconception' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="mb-4 rounded-xl overflow-hidden"
              animate={{ opacity: s === 2 ? 1 : 0, y: s === 2 ? 0 : 15 }}
              transition={{ ...spring, delay: 0.3 + i * 0.25 }}
            >
              {/* AI claim */}
              <div className="px-4 py-3 border border-white/10 bg-white/5 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green">AI</span>
                  <span className="text-sm text-white/70">{item.claim}</span>
                </div>
              </div>
              {/* Correction */}
              <motion.div
                className="px-4 py-2 border border-t-0 border-red-400/20 bg-red-400/5 rounded-b-xl flex items-center justify-between"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: s === 2 ? 'auto' : 0, opacity: s === 2 ? 1 : 0 }}
                transition={{ ...smooth, delay: 0.8 + i * 0.25 }}
              >
                <span className="text-xs text-red-400">{item.truth}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-400/15 text-red-400/70">{item.diff}</span>
              </motion.div>
            </motion.div>
          ))}

          <motion.p
            className="text-xs text-accent-gold text-center mt-2"
            animate={{ opacity: s === 2 ? 1 : 0 }}
            transition={{ ...spring, delay: 1.5 }}
          >
            Close enough to believe. Wrong enough to cause problems.
          </motion.p>
        </div>
      </motion.div>

      {/* Step 3: "Fabricated Citations" — the most dramatic */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 3 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          <motion.p
            className="text-sm text-white/40 mb-2 text-center"
            animate={{ opacity: s === 3 ? 1 : 0 }}
            transition={spring}
          >
            &quot;Give me academic sources for your claim&quot;
          </motion.p>
          <motion.p
            className="text-xs text-white/30 mb-4 text-center"
            animate={{ opacity: s === 3 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            The AI happily provides:
          </motion.p>

          <div className="space-y-3">
            {fakeCitations.map((cite, i) => (
              <motion.div
                key={i}
                className="rounded-xl border-2 p-4 relative overflow-hidden"
                style={{
                  borderColor: citationRevealed >= i ? '#ef444440' : 'rgba(255,255,255,0.1)',
                  backgroundColor: citationRevealed >= i ? '#ef444406' : 'rgba(255,255,255,0.03)',
                }}
                animate={{
                  opacity: s === 3 ? 1 : 0,
                  x: s === 3 ? 0 : -15,
                }}
                transition={{ ...spring, delay: 0.3 + i * 0.15 }}
              >
                <p className="text-xs text-white/70 font-bold">{cite.author}</p>
                <p className="text-xs text-accent-blue/80 italic mt-0.5">&quot;{cite.title}&quot;</p>
                <p className="text-[10px] text-white/40 mt-0.5">{cite.journal}, {cite.year}</p>

                {/* FAKE stamp */}
                <AnimatePresence>
                  {citationRevealed >= i && (
                    <motion.div
                      className="absolute top-2 right-2 px-2 py-1 rounded bg-red-500/20 border border-red-500/40"
                      initial={{ scale: 0, rotate: 10 }}
                      animate={{ scale: 1, rotate: -5 }}
                      transition={spring}
                    >
                      <span className="text-red-400 font-bold text-[10px]">DOESN&apos;T EXIST</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-4 px-4 py-2 rounded-lg bg-red-400/10 border border-red-400/20 text-center"
            animate={{ opacity: s === 3 ? 1 : 0 }}
            transition={{ ...spring, delay: 3.5 }}
          >
            <span className="text-xs text-red-400">
              Perfect APA formatting. Zero real papers. Lawyers have been fined for this.
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Step 4: "Plausible Nonsense" — two real-world examples */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 4 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-2xl w-full">
          <motion.p
            className="text-base font-semibold text-white/70 mb-5 text-center"
            animate={{ opacity: s === 4 ? 1 : 0 }}
            transition={spring}
          >
            It sounds right. It reads right. But it&apos;s <span className="text-red-400">completely wrong.</span>
          </motion.p>

          <div className="grid grid-cols-2 gap-4">
            {/* Example 1: Medical */}
            <motion.div
              className="rounded-xl border border-white/10 bg-navy-800/60 p-4"
              animate={{ opacity: s === 4 ? 1 : 0, y: s === 4 ? 0 : 20 }}
              transition={{ ...spring, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏥</span>
                <span className="text-xs font-bold text-white/50 uppercase">Medical Query</span>
              </div>
              <p className="text-xs text-accent-blue mb-3">&quot;What causes migraines?&quot;</p>
              <div className="rounded-lg bg-accent-green/5 border border-accent-green/20 p-3 mb-3">
                <p className="text-xs text-white/60 italic leading-relaxed">
                  &quot;Migraines are triggered by the{' '}
                  <motion.span
                    className="px-0.5 rounded"
                    animate={{ backgroundColor: s === 4 ? ['transparent', '#ef444430', 'transparent'] : 'transparent' }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    cortical spreading depolarization
                  </motion.span>
                  {' '}of the trigeminal nerve pathway, releasing{' '}
                  <motion.span
                    className="px-0.5 rounded"
                    animate={{ backgroundColor: s === 4 ? ['transparent', '#ef444430', 'transparent'] : 'transparent' }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  >
                    CGRP neuropeptides at 4.7ng/mL
                  </motion.span>
                  ...&quot;
                </p>
              </div>
              <motion.div
                className="text-xs space-y-1"
                animate={{ opacity: s === 4 ? 1 : 0 }}
                transition={{ ...spring, delay: 1.5 }}
              >
                <p className="text-green-400/60">✓ Real medical terms</p>
                <p className="text-green-400/60">✓ Plausible numbers</p>
                <p className="text-red-400 font-semibold">✗ The 4.7ng/mL figure is fabricated</p>
              </motion.div>
            </motion.div>

            {/* Example 2: Programming */}
            <motion.div
              className="rounded-xl border border-white/10 bg-navy-800/60 p-4"
              animate={{ opacity: s === 4 ? 1 : 0, y: s === 4 ? 0 : 20 }}
              transition={{ ...spring, delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💻</span>
                <span className="text-xs font-bold text-white/50 uppercase">Programming Query</span>
              </div>
              <p className="text-xs text-accent-blue mb-3">&quot;How do I use the DataForge.js library?&quot;</p>
              <div className="rounded-lg bg-accent-green/5 border border-accent-green/20 p-3 mb-3">
                <p className="text-xs text-white/60 italic leading-relaxed font-mono">
                  &quot;First install it:{' '}
                  <motion.span
                    className="px-0.5 rounded"
                    animate={{ backgroundColor: s === 4 ? ['transparent', '#ef444430', 'transparent'] : 'transparent' }}
                    transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                  >
                    npm install dataforge-js
                  </motion.span>
                  <br />Then import: <span className="text-accent-green/80">const df = require(&apos;dataforge-js&apos;)</span>
                  <br />Use <span className="text-accent-green/80">df.readCSV()</span> to load data...&quot;
                </p>
              </div>
              <motion.div
                className="text-xs space-y-1"
                animate={{ opacity: s === 4 ? 1 : 0 }}
                transition={{ ...spring, delay: 2 }}
              >
                <p className="text-green-400/60">✓ Correct npm syntax</p>
                <p className="text-green-400/60">✓ Realistic API design</p>
                <p className="text-red-400 font-semibold">✗ This library doesn&apos;t exist</p>
              </motion.div>
            </motion.div>
          </div>

          <motion.p
            className="text-xs text-white/30 text-center mt-4"
            animate={{ opacity: s === 4 ? 1 : 0 }}
            transition={{ ...spring, delay: 2.5 }}
          >
            Both answers use correct grammar, real jargon, and proper formatting — but the facts are invented.
          </motion.p>
        </div>
      </motion.div>

      {/* Step 5: "The Confidence Problem" — side-by-side bars */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 5 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          <motion.p
            className="text-sm text-white/40 mb-2 text-center"
            animate={{ opacity: s === 5 ? 1 : 0 }}
            transition={spring}
          >
            Can you tell which is right and which is wrong?
          </motion.p>
          <motion.p
            className="text-xs text-white/30 mb-5 text-center"
            animate={{ opacity: s === 5 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            Look at the AI&apos;s confidence level:
          </motion.p>

          <div className="space-y-3">
            {confidenceExamples.map((ex, i) => (
              <motion.div
                key={i}
                className="rounded-xl border p-4"
                style={{
                  borderColor: confIdx === i
                    ? (ex.isTrue ? '#4ade8040' : '#ef444440')
                    : 'rgba(255,255,255,0.1)',
                  backgroundColor: confIdx === i
                    ? (ex.isTrue ? '#4ade8008' : '#ef444408')
                    : 'rgba(255,255,255,0.03)',
                }}
                animate={{
                  opacity: s === 5 ? 1 : 0,
                  y: s === 5 ? 0 : 10,
                }}
                transition={{ ...spring, delay: 0.3 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">&quot;{ex.text}&quot;</span>
                  {confIdx === i && (
                    <motion.span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        color: ex.isTrue ? '#4ade80' : '#ef4444',
                        backgroundColor: ex.isTrue ? '#4ade8020' : '#ef444420',
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={spring}
                    >
                      {ex.isTrue ? '✓ TRUE' : '✗ FALSE'}
                    </motion.span>
                  )}
                </div>
                {/* Confidence bar — looks identical for true and false */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30 w-16">Confidence:</span>
                  <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-accent-green/40"
                      animate={{ width: s === 5 ? `${ex.confidence}%` : '0%' }}
                      transition={{ ...smooth, delay: 0.5 + i * 0.1 }}
                    />
                  </div>
                  <span className="text-[10px] text-accent-green font-mono">{ex.confidence}%</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-4 text-center px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/20"
            animate={{ opacity: s === 5 ? 1 : 0 }}
            transition={{ ...spring, delay: 1.5 }}
          >
            <span className="text-xs text-accent-gold">
              All bars look the same — confidence tells you NOTHING about truth
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Step 6: "How to Reduce Hallucination" */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 6 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          <motion.p
            className="text-sm text-white/40 mb-5 text-center"
            animate={{ opacity: s === 6 ? 1 : 0 }}
            transition={spring}
          >
            5 strategies to fight hallucination
          </motion.p>

          <div className="space-y-3">
            {reductionStrategies.map((strat, i) => (
              <motion.div
                key={strat.label}
                className="rounded-xl border p-4 flex items-center gap-4"
                style={{
                  borderColor: strategyRevealed >= i ? `${strat.color}40` : 'rgba(255,255,255,0.05)',
                  backgroundColor: strategyRevealed >= i ? `${strat.color}08` : 'transparent',
                }}
                animate={{
                  opacity: s === 6 ? (strategyRevealed >= i ? 1 : 0.3) : 0,
                  x: s === 6 ? 0 : -15,
                }}
                transition={{ ...spring, delay: 0.1 + i * 0.08 }}
              >
                <motion.span
                  className="text-2xl"
                  animate={{
                    scale: strategyRevealed === i ? [1, 1.3, 1] : 1,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {strat.icon}
                </motion.span>
                <div>
                  <p className="text-sm font-bold" style={{ color: strat.color }}>{strat.label}</p>
                  <p className="text-xs text-white/50">{strat.desc}</p>
                </div>
                {strategyRevealed >= i && (
                  <motion.span
                    className="ml-auto text-xs font-bold px-2 py-0.5 rounded"
                    style={{ color: strat.color, backgroundColor: `${strat.color}15` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={spring}
                  >
                    #{i + 1}
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Step 7: "Key Takeaways" */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: s === 7 ? 1 : 0 }}
        transition={spring}
      >
        <div className="text-center max-w-xl w-full px-6">
          <motion.h2
            className="text-3xl font-bold text-white mb-6"
            animate={{ opacity: s === 7 ? 1 : 0, y: s === 7 ? 0 : 20 }}
            transition={spring}
          >
            Key Takeaways
          </motion.h2>
          {[
            { icon: '🎭', text: 'Hallucination = confident wrong answers that sound right', color: '#ef4444' },
            { icon: '🧠', text: 'LLMs predict patterns, not truth — plausible ≠ correct', color: '#fbbf24' },
            { icon: '📚', text: 'Fake citations are extremely common — always verify', color: '#a78bfa' },
            { icon: '📊', text: 'Right and wrong answers sound equally confident', color: '#4a9eff' },
            { icon: '🛡️', text: 'Use RAG, lower temp, and human verification to reduce risk', color: '#4ade80' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4 mb-3 px-5 py-3 rounded-xl bg-white/5 border text-left"
              style={{ borderColor: `${item.color}30` }}
              animate={{ opacity: s === 7 ? 1 : 0, y: s === 7 ? 0 : 20 }}
              transition={{ ...spring, delay: i * 0.12 }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white/80 text-sm">{item.text}</span>
            </motion.div>
          ))}
          <motion.p
            className="text-sm text-accent-gold mt-4"
            animate={{ opacity: s === 7 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.8 }}
          >
            Trust but verify — the #1 rule of working with AI!
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
