'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useConceptStore } from '@/stores/conceptStore';

const spring = { type: 'spring' as const, damping: 25, stiffness: 120 };
const smooth = { duration: 0.6, ease: 'easeInOut' as const };

const probWords = [
  { label: 'Paris', pct: 92, color: '#4ade80' },
  { label: 'Lyon', pct: 3, color: '#fbbf24' },
  { label: 'Marseille', pct: 2, color: '#f472b6' },
  { label: 'the', pct: 1.5, color: '#a78bfa' },
  { label: 'known', pct: 1.5, color: '#4a9eff' },
];

const tempConfigs = [
  {
    temp: 0,
    label: 'Temp = 0',
    desc: 'Always picks the #1 word. 100 runs → 100 identical answers.',
    bars: [100, 0, 0, 0, 0],
    color: '#4a9eff',
    fillPct: 10,
    icon: '🤖',
    tagline: 'The Robot',
  },
  {
    temp: 0.7,
    label: 'Temp = 0.7',
    desc: 'Usually picks top words but sometimes surprises. The default.',
    bars: [72, 12, 8, 5, 3],
    color: '#fbbf24',
    fillPct: 50,
    icon: '⚖️',
    tagline: 'The Sweet Spot',
  },
  {
    temp: 1.5,
    label: 'Temp = 1.5',
    desc: 'Wild and unpredictable. Low-probability words get a real chance.',
    bars: [30, 22, 20, 15, 13],
    color: '#ef4444',
    fillPct: 90,
    icon: '🎲',
    tagline: 'The Wild Card',
  },
];

const sideBySideResponses = [
  {
    temp: '0',
    color: '#4a9eff',
    response: 'def sort_list(lst):\n    return sorted(lst)\n\n# Simple, correct, identical every run.',
    style: 'Same output every time. Perfect for code.',
    isCode: true,
  },
  {
    temp: '0.7',
    color: '#fbbf24',
    response: 'Great question! You can use Python\'s built-in sorted() function, or for in-place sorting, try lst.sort(). Here\'s an example with a custom key...',
    style: 'Helpful, varied phrasing. Good for explanations.',
    isCode: false,
  },
  {
    temp: '1.5',
    color: '#ef4444',
    response: 'Ah, sorting! The eternal dance of data finding its place. Imagine each element as a restless traveler seeking its destined position in the grand array of existence...',
    style: 'Wild tangent. Fun for stories, bad for code.',
    isCode: false,
  },
];

const useCases = [
  { range: '0 – 0.3', label: 'Precise', color: '#4a9eff', icon: '💻', tasks: ['Code generation', 'Math problems', 'Data extraction', 'Factual Q&A'] },
  { range: '0.5 – 0.8', label: 'Balanced', color: '#fbbf24', icon: '💬', tasks: ['General chat', 'Summaries', 'Explanations', 'Email drafting'] },
  { range: '1.0 – 1.5', label: 'Creative', color: '#ef4444', icon: '🎨', tasks: ['Creative writing', 'Brainstorming', 'Poetry', 'Character dialogue'] },
];

export default function TemperatureAnim() {
  const { currentStep } = useConceptStore();
  const s = currentStep;

  // Cycling temperature index for step 1 (prob distribution)
  const [probHighlight, setProbHighlight] = useState(0);
  useEffect(() => {
    if (s === 1) {
      setProbHighlight(0);
      const timer = setInterval(() => setProbHighlight((p) => (p + 1) % probWords.length), 800);
      return () => clearInterval(timer);
    }
  }, [s]);

  // Cycling for side-by-side step
  const [sideIdx, setSideIdx] = useState(0);
  useEffect(() => {
    if (s === 5) {
      setSideIdx(0);
      const timer = setInterval(() => setSideIdx((p) => (p + 1) % 3), 3000);
      return () => clearInterval(timer);
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
      {/* Step 0: "What is Temperature?" — Dial visualization */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: s === 0 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Big dial */}
          <motion.div className="relative w-48 h-48">
            {/* Dial background */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4a9eff" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              {/* Arc */}
              <path
                d="M 30 150 A 80 80 0 0 1 170 150"
                fill="none"
                stroke="url(#dialGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                opacity={0.4}
              />
              {/* Labels */}
              <text x="20" y="170" fill="#4a9eff" fontSize="12" fontFamily="monospace">0</text>
              <text x="93" y="55" fill="#fbbf24" fontSize="12" fontFamily="monospace">1.0</text>
              <text x="165" y="170" fill="#ef4444" fontSize="12" fontFamily="monospace">2.0</text>
            </svg>

            {/* Animated needle */}
            <motion.div
              className="absolute"
              style={{ top: '50%', left: '50%', transformOrigin: 'bottom center' }}
              animate={{
                rotate: s === 0 ? [-90, 0, 90, 0, -90] : 0,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="w-1 h-16 bg-white/60 rounded-full -translate-x-1/2 -translate-y-full" />
              <div className="w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          </motion.div>

          <motion.p
            className="text-lg font-bold text-white/80"
            animate={{ opacity: s === 0 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            temperature = <motion.span
              className="font-mono"
              animate={{ color: ['#4a9eff', '#fbbf24', '#ef4444', '#fbbf24', '#4a9eff'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              0.0 → 2.0
            </motion.span>
          </motion.p>

          <div className="flex gap-6">
            {[
              { icon: '🤖', label: 'Predictable', color: '#4a9eff' },
              { icon: '⚖️', label: 'Balanced', color: '#fbbf24' },
              { icon: '🎲', label: 'Creative', color: '#ef4444' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="flex flex-col items-center gap-1"
                animate={{ opacity: s === 0 ? 1 : 0, y: s === 0 ? 0 : 15 }}
                transition={{ ...spring, delay: 0.5 + i * 0.15 }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs" style={{ color: item.color }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Step 1: "The Probability Distribution" */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 1 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          <motion.p
            className="text-sm text-white/40 mb-2 text-center"
            animate={{ opacity: s === 1 ? 1 : 0 }}
            transition={spring}
          >
            &quot;The capital of France is ___&quot;
          </motion.p>
          <motion.p
            className="text-xs text-white/30 mb-4 text-center"
            animate={{ opacity: s === 1 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            Model outputs probabilities for every possible next word:
          </motion.p>

          <div className="space-y-2.5">
            {probWords.map((p, i) => (
              <motion.div
                key={p.label}
                className="flex items-center gap-3"
                animate={{
                  opacity: s === 1 ? 1 : 0,
                  x: s === 1 ? 0 : -20,
                }}
                transition={{ ...spring, delay: 0.3 + i * 0.1 }}
              >
                <span className="w-20 text-right text-sm font-mono font-bold" style={{ color: p.color }}>
                  {p.label}
                </span>
                <div className="flex-1 bg-white/5 rounded-full h-8 overflow-hidden relative border border-white/5">
                  <motion.div
                    className="h-full rounded-full flex items-center px-3"
                    style={{ backgroundColor: `${p.color}25` }}
                    animate={{
                      width: s === 1 ? `${p.pct}%` : '0%',
                      boxShadow: probHighlight === i ? `0 0 15px ${p.color}40` : '0 0 0px transparent',
                    }}
                    transition={{ ...smooth, delay: 0.4 + i * 0.1 }}
                  >
                    <span className="text-xs font-bold" style={{ color: p.color }}>
                      {p.pct}%
                    </span>
                  </motion.div>
                </div>
                {probHighlight === i && (
                  <motion.span
                    className="text-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={spring}
                  >
                    👈
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-xs text-accent-blue text-center mt-4"
            animate={{ opacity: s === 1 ? 1 : 0 }}
            transition={{ ...spring, delay: 1 }}
          >
            Temperature decides HOW to pick from these probabilities
          </motion.p>
        </div>
      </motion.div>

      {/* Steps 2-4: Individual temperature visualizations */}
      {[2, 3, 4].map((stepNum) => {
        const configIdx = stepNum - 2;
        const config = tempConfigs[configIdx];
        return (
          <motion.div
            key={stepNum}
            className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
            animate={{ opacity: s === stepNum ? 1 : 0 }}
            transition={spring}
          >
            <div className="flex items-center gap-8 w-full max-w-2xl">
              {/* Left: Thermometer + label */}
              <motion.div
                className="flex flex-col items-center gap-3"
                animate={{ opacity: s === stepNum ? 1 : 0, x: s === stepNum ? 0 : -20 }}
                transition={spring}
              >
                <span className="text-4xl">{config.icon}</span>
                <p className="text-lg font-bold" style={{ color: config.color }}>{config.tagline}</p>

                {/* Thermometer */}
                <div className="w-8 h-32 rounded-full border-2 bg-white/5 relative overflow-hidden" style={{ borderColor: `${config.color}40` }}>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 rounded-full"
                    style={{ backgroundColor: config.color }}
                    animate={{ height: s === stepNum ? `${config.fillPct}%` : '0%' }}
                    transition={{ ...smooth, delay: 0.3 }}
                  />
                </div>
                <p className="text-sm font-mono font-bold" style={{ color: config.color }}>
                  {config.label}
                </p>
              </motion.div>

              {/* Right: Probability bars */}
              <div className="flex-1">
                <p className="text-xs text-white/30 mb-3">
                  &quot;The capital of France is ___&quot; — selection chances:
                </p>
                <div className="space-y-2">
                  {probWords.map((p, i) => (
                    <motion.div
                      key={p.label}
                      className="flex items-center gap-3"
                      animate={{ opacity: s === stepNum ? 1 : 0 }}
                      transition={{ ...spring, delay: 0.2 + i * 0.08 }}
                    >
                      <span className="w-20 text-right text-sm font-mono text-white/60">
                        {p.label}
                      </span>
                      <div className="flex-1 bg-white/5 rounded-full h-7 overflow-hidden relative">
                        <motion.div
                          className="h-full rounded-full flex items-center px-2"
                          style={{ backgroundColor: `${p.color}25` }}
                          animate={{
                            width: s === stepNum ? `${Math.max(config.bars[i], 1)}%` : '0%',
                          }}
                          transition={{ ...smooth, delay: 0.4 + i * 0.08 }}
                        >
                          {config.bars[i] > 0 && (
                            <span className="text-[10px] font-bold" style={{ color: p.color }}>
                              {config.bars[i]}%
                            </span>
                          )}
                        </motion.div>
                      </div>
                      {/* Winner indicator for temp=0 */}
                      {configIdx === 0 && i === 0 && (
                        <motion.span
                          className="text-xs px-2 py-0.5 rounded-full border font-bold"
                          style={{ color: config.color, borderColor: `${config.color}40`, backgroundColor: `${config.color}15` }}
                          animate={{ opacity: s === stepNum ? 1 : 0, scale: s === stepNum ? 1 : 0.5 }}
                          transition={{ ...spring, delay: 0.8 }}
                        >
                          ALWAYS ✓
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </div>

                <motion.p
                  className="text-xs mt-4 italic"
                  style={{ color: `${config.color}99` }}
                  animate={{ opacity: s === stepNum ? 1 : 0 }}
                  transition={{ ...spring, delay: 0.9 }}
                >
                  {config.desc}
                </motion.p>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Step 5: "Side-by-Side Comparison" */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 5 ? 1 : 0 }}
        transition={spring}
      >
        <motion.p
          className="text-sm text-white/40 mb-1"
          animate={{ opacity: s === 5 ? 1 : 0 }}
          transition={spring}
        >
          Prompt: &quot;How do I sort a list in Python?&quot;
        </motion.p>
        <motion.p
          className="text-xs text-white/30 mb-5"
          animate={{ opacity: s === 5 ? 1 : 0 }}
          transition={{ ...spring, delay: 0.2 }}
        >
          Same model, same prompt — three temperatures:
        </motion.p>

        <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
          {sideBySideResponses.map((item, i) => (
            <motion.div
              key={item.temp}
              className="rounded-xl border-2 p-4 flex flex-col"
              style={{
                borderColor: sideIdx === i ? `${item.color}60` : `${item.color}25`,
                backgroundColor: sideIdx === i ? `${item.color}10` : `${item.color}05`,
              }}
              animate={{
                opacity: s === 5 ? 1 : 0,
                y: s === 5 ? 0 : 20,
                scale: sideIdx === i ? 1.02 : 1,
              }}
              transition={{ ...spring, delay: i * 0.15 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-mono font-bold" style={{ color: item.color }}>
                  T={item.temp}
                </span>
                {sideIdx === i && (
                  <motion.span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              <motion.div
                className={`text-xs leading-relaxed flex-1 ${item.isCode ? 'font-mono bg-black/30 rounded p-2' : ''}`}
                style={{ color: item.isCode ? '#4ade80' : 'rgba(255,255,255,0.6)' }}
                animate={{
                  opacity: s === 5 ? (sideIdx === i ? 1 : 0.4) : 0,
                }}
                transition={smooth}
              >
                {item.isCode
                  ? item.response.split('\n').map((line, li) => <div key={li}>{line || '\u00A0'}</div>)
                  : <>&quot;{item.response}&quot;</>
                }
              </motion.div>
              <p className="text-[10px] mt-3 italic" style={{ color: `${item.color}80` }}>
                {item.style}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Step 6: "When to Use Which" */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 6 ? 1 : 0 }}
        transition={spring}
      >
        <motion.p
          className="text-sm text-white/40 mb-6"
          animate={{ opacity: s === 6 ? 1 : 0 }}
          transition={spring}
        >
          Match temperature to your task
        </motion.p>

        <div className="flex gap-5 w-full max-w-3xl justify-center">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.label}
              className="flex-1 rounded-xl border-2 p-5"
              style={{
                borderColor: `${uc.color}30`,
                backgroundColor: `${uc.color}05`,
              }}
              animate={{
                opacity: s === 6 ? 1 : 0,
                y: s === 6 ? 0 : 25,
              }}
              transition={{ ...spring, delay: i * 0.2 }}
            >
              <div className="text-center mb-3">
                <span className="text-3xl">{uc.icon}</span>
              </div>
              <p className="text-sm font-bold text-center mb-1" style={{ color: uc.color }}>
                {uc.label}
              </p>
              <p className="text-xs font-mono text-center mb-3" style={{ color: `${uc.color}80` }}>
                {uc.range}
              </p>

              {/* Temperature bar */}
              <div className="h-2 bg-white/5 rounded-full mb-4 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: uc.color }}
                  animate={{
                    width: s === 6 ? `${(i + 1) * 33}%` : '0%',
                  }}
                  transition={{ ...smooth, delay: 0.5 + i * 0.2 }}
                />
              </div>

              <div className="space-y-1.5">
                {uc.tasks.map((task, j) => (
                  <motion.div
                    key={task}
                    className="text-xs text-white/50 flex items-center gap-2"
                    animate={{ opacity: s === 6 ? 1 : 0, x: s === 6 ? 0 : -10 }}
                    transition={{ ...spring, delay: 0.6 + i * 0.2 + j * 0.08 }}
                  >
                    <span style={{ color: uc.color }}>•</span>
                    {task}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
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
            { icon: '🎛️', text: 'Temperature controls randomness in token selection (0 to 2)', color: '#4a9eff' },
            { icon: '🤖', text: 'Temp 0 = deterministic — always the same output', color: '#4a9eff' },
            { icon: '⚖️', text: 'Temp 0.7 = balanced default — creative but controlled', color: '#fbbf24' },
            { icon: '🎲', text: 'Temp 1.5 = creative chaos — surprising & unpredictable', color: '#ef4444' },
            { icon: '🎯', text: 'Match temperature to your task — code low, stories high', color: '#4ade80' },
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
        </div>
      </motion.div>
    </div>
  );
}
