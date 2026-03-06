'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useConceptStore } from '@/stores/conceptStore';

const spring = { type: 'spring' as const, stiffness: 260, damping: 22 };
const smooth = { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const };

export default function AgentsAnim() {
  const s = useConceptStore((st) => st.currentStep);

  // Weather example phase sequencer (step 4)
  const [weatherPhase, setWeatherPhase] = useState(0);
  useEffect(() => {
    if (s === 4) {
      setWeatherPhase(0);
      const timer = setInterval(() => {
        setWeatherPhase((prev) => (prev < 5 ? prev + 1 : 0));
      }, 1200);
      return () => clearInterval(timer);
    }
  }, [s]);

  // Agent loop pulse (step 3)
  const [loopPulse, setLoopPulse] = useState(0);
  useEffect(() => {
    if (s === 3) {
      setLoopPulse(0);
      const timer = setInterval(() => {
        setLoopPulse((prev) => (prev < 3 ? prev + 1 : 0));
      }, 800);
      return () => clearInterval(timer);
    }
  }, [s]);

  // Multi-step example phase (step 5)
  const [multiPhase, setMultiPhase] = useState(0);
  useEffect(() => {
    if (s === 5) {
      setMultiPhase(0);
      const timer = setInterval(() => {
        setMultiPhase((prev) => (prev < 3 ? prev + 1 : 0));
      }, 1500);
      return () => clearInterval(timer);
    }
  }, [s]);

  // Tool cards cycling (step 6)
  const [toolHighlight, setToolHighlight] = useState(0);
  useEffect(() => {
    if (s === 6) {
      setToolHighlight(0);
      const timer = setInterval(() => {
        setToolHighlight((prev) => (prev + 1) % 3);
      }, 2200);
      return () => clearInterval(timer);
    }
  }, [s]);

  // Error handling branch animation (step 8)
  const [errorBranch, setErrorBranch] = useState(0);
  useEffect(() => {
    if (s === 8) {
      setErrorBranch(0);
      const timer = setInterval(() => {
        setErrorBranch((prev) => (prev + 1) % 3);
      }, 2000);
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
      {/* ===== Step 0: Beyond Text In, Text Out ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 0 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-2xl w-full">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Knowledge */}
            <motion.div
              className="rounded-xl border-2 border-[#4a9eff]/30 bg-[#4a9eff]/5 p-5"
              animate={{ opacity: s === 0 ? 1 : 0, x: s === 0 ? 0 : -30 }}
              transition={{ ...spring, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-14 h-14 rounded-2xl border-2 border-[#4a9eff]/40 bg-[#4a9eff]/10 flex items-center justify-center"
                  animate={{
                    boxShadow: s === 0
                      ? ['0 0 12px rgba(74,158,255,0.2)', '0 0 24px rgba(74,158,255,0.4)', '0 0 12px rgba(74,158,255,0.2)']
                      : '0 0 0px transparent',
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="text-2xl">🧠</span>
                </motion.div>
                <div>
                  <p className="text-sm font-bold text-[#4a9eff]">I KNOW how</p>
                  <p className="text-sm text-white/30">Knowledge exists</p>
                </div>
              </div>

              {/* Speech bubble */}
              <motion.div
                className="rounded-lg border border-[#4a9eff]/20 bg-[#4a9eff]/8 px-4 py-3 relative"
                animate={{ opacity: s === 0 ? 1 : 0, y: s === 0 ? 0 : 10 }}
                transition={{ ...spring, delay: 0.3 }}
              >
                <div className="absolute -top-2 left-6 w-3 h-3 rotate-45 bg-[#4a9eff]/8 border-l border-t border-[#4a9eff]/20" />
                {[
                  '"To book a flight, search airline websites..."',
                  '"Use a weather API to get forecasts..."',
                  '"Run SELECT * FROM sales..."',
                ].map((text, i) => (
                  <motion.p
                    key={i}
                    className="text-sm text-white/50 italic mb-1 last:mb-0"
                    animate={{ opacity: s === 0 ? 1 : 0 }}
                    transition={{ ...spring, delay: 0.4 + i * 0.1 }}
                  >
                    {text}
                  </motion.p>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Inability */}
            <motion.div
              className="rounded-xl border-2 border-[#ef4444]/30 bg-[#ef4444]/5 p-5"
              animate={{ opacity: s === 0 ? 1 : 0, x: s === 0 ? 0 : 30 }}
              transition={{ ...spring, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div className="w-14 h-14 rounded-2xl border-2 border-[#ef4444]/40 bg-[#ef4444]/10 flex items-center justify-center relative">
                  <span className="text-2xl">🧠</span>
                  <motion.span
                    className="absolute -top-1 -right-1 text-lg"
                    animate={{
                      scale: s === 0 ? [1, 1.2, 1] : 1,
                      opacity: s === 0 ? 1 : 0,
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ✕
                  </motion.span>
                </motion.div>
                <div>
                  <p className="text-sm font-bold text-[#ef4444]">But CAN&apos;T do it</p>
                  <p className="text-sm text-white/30">No ability to act</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { icon: '✈️', text: 'Actually book the flight' },
                  { icon: '🌤️', text: 'Check real weather right now' },
                  { icon: '🗄️', text: 'Run SQL on your database' },
                  { icon: '📧', text: 'Send a real email' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ef4444]/5 border border-[#ef4444]/10"
                    animate={{ opacity: s === 0 ? 1 : 0, x: s === 0 ? 0 : 15 }}
                    transition={{ ...spring, delay: 0.4 + i * 0.1 }}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-sm text-white/50 line-through decoration-[#ef4444]/40">{item.text}</span>
                    <span className="text-[#ef4444] text-xs ml-auto font-bold">✕</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Gap indicator */}
          <motion.div
            className="flex justify-center mt-5"
            animate={{ opacity: s === 0 ? 1 : 0, y: s === 0 ? 0 : 10 }}
            transition={{ ...spring, delay: 0.8 }}
          >
            <div className="px-5 py-2 rounded-full border-2 border-[#fbbf24]/30 bg-[#fbbf24]/8">
              <p className="text-xs text-[#fbbf24] font-bold">
                The Gap: Knowledge without Action
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Step 1: What is an Agent? ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 1 ? 1 : 0 }}
        transition={spring}
      >
        {/* Equation row */}
        <div className="flex items-center gap-5 mb-8">
          {[
            { icon: '🧠', label: 'LLM', color: '#a78bfa', sublabel: 'Reasoning' },
            { icon: '⚙️', label: 'Tools', color: '#4a9eff', sublabel: 'Capabilities' },
            { icon: '🔄', label: 'Loop', color: '#4ade80', sublabel: 'Iteration' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-5"
              animate={{
                opacity: s === 1 ? 1 : 0,
                y: s === 1 ? 0 : 20,
              }}
              transition={{ ...spring, delay: i * 0.15 }}
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center mb-2"
                  style={{
                    borderColor: `${item.color}40`,
                    backgroundColor: `${item.color}10`,
                  }}
                  animate={{
                    boxShadow: s === 1
                      ? `0 0 20px ${item.color}30`
                      : `0 0 0px transparent`,
                  }}
                  transition={{ ...spring, delay: 0.5 + i * 0.15 }}
                >
                  <span className="text-3xl">{item.icon}</span>
                </motion.div>
                <span className="text-sm font-bold" style={{ color: item.color }}>
                  {item.label}
                </span>
                <span className="text-sm text-white/30">{item.sublabel}</span>
              </div>
              {i < 2 && (
                <motion.span
                  className="text-2xl text-white/20 font-light"
                  animate={{ opacity: s === 1 ? 1 : 0 }}
                  transition={{ ...spring, delay: 0.3 + i * 0.15 }}
                >
                  +
                </motion.span>
              )}
            </motion.div>
          ))}

          <motion.span
            className="text-2xl text-white/20 font-light"
            animate={{ opacity: s === 1 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.6 }}
          >
            =
          </motion.span>

          {/* Agent result */}
          <motion.div
            className="flex flex-col items-center"
            animate={{
              opacity: s === 1 ? 1 : 0,
              scale: s === 1 ? 1 : 0.5,
            }}
            transition={{ ...spring, delay: 0.7 }}
          >
            <motion.div
              className="w-20 h-20 rounded-2xl border-2 border-[#fbbf24]/50 bg-[#fbbf24]/10 flex items-center justify-center mb-2"
              animate={{
                boxShadow: s === 1
                  ? ['0 0 15px rgba(251,191,36,0.2)', '0 0 30px rgba(251,191,36,0.4)', '0 0 15px rgba(251,191,36,0.2)']
                  : '0 0 0px transparent',
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-3xl">⭐</span>
            </motion.div>
            <span className="text-sm font-bold text-[#fbbf24]">Agent</span>
            <span className="text-sm text-white/30">Autonomous</span>
          </motion.div>
        </div>

        {/* Tagline */}
        <motion.div
          className="px-6 py-3 rounded-xl border border-[#a78bfa]/20 bg-[#a78bfa]/5"
          animate={{ opacity: s === 1 ? 1 : 0, y: s === 1 ? 0 : 15 }}
          transition={{ ...spring, delay: 0.9 }}
        >
          <p className="text-sm text-white/60">
            The LLM <span className="font-bold text-[#a78bfa]">THINKS</span>, your code <span className="font-bold text-[#4ade80]">ACTS</span>.
          </p>
        </motion.div>
      </motion.div>

      {/* ===== Step 2: The Tool Call ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 2 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-5 max-w-2xl w-full">
          {/* LLM outputs JSON */}
          <motion.div
            className="flex-1"
            animate={{
              opacity: s === 2 ? 1 : 0,
              x: s === 2 ? 0 : -20,
            }}
            transition={spring}
          >
            <p className="text-sm text-white/30 mb-2 font-bold uppercase tracking-wider">LLM outputs:</p>
            <div className="px-4 py-3 rounded-xl border-2 border-[#fbbf24]/30 bg-[#fbbf24]/5 font-mono text-xs">
              <span className="text-white/30">{'{'}</span><br />
              <span className="text-[#fbbf24]">&nbsp;&nbsp;&quot;tool&quot;</span>
              <span className="text-white/30">: </span>
              <span className="text-[#4ade80]">&quot;get_weather&quot;</span>
              <span className="text-white/30">,</span><br />
              <span className="text-[#fbbf24]">&nbsp;&nbsp;&quot;args&quot;</span>
              <span className="text-white/30">: {'{'}</span><br />
              <span className="text-[#4a9eff]">&nbsp;&nbsp;&nbsp;&nbsp;&quot;city&quot;</span>
              <span className="text-white/30">: </span>
              <span className="text-[#4ade80]">&quot;Paris&quot;</span><br />
              <span className="text-white/30">&nbsp;&nbsp;{'}'}</span><br />
              <span className="text-white/30">{'}'}</span>
            </div>
          </motion.div>

          {/* Arrow + spinning gear */}
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{ opacity: s === 2 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <motion.span
              className="text-[#fbbf24] text-lg"
              animate={{ x: s === 2 ? [0, 5, 0] : 0 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              &rarr;
            </motion.span>
            <motion.div
              className="w-16 h-16 rounded-xl border-2 border-[#fbbf24]/30 bg-[#fbbf24]/5 flex items-center justify-center"
              animate={{
                rotate: s === 2 ? [0, 360] : 0,
              }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
              }}
            >
              <span className="text-2xl">⚙️</span>
            </motion.div>
            <p className="text-sm text-white/30">Your Code</p>
            <motion.span
              className="text-[#4ade80] text-lg"
              animate={{ x: s === 2 ? [0, 5, 0] : 0 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              &rarr;
            </motion.span>
          </motion.div>

          {/* Result */}
          <motion.div
            className="flex-1"
            animate={{
              opacity: s === 2 ? 1 : 0,
              x: s === 2 ? 0 : 20,
            }}
            transition={{ ...spring, delay: 0.5 }}
          >
            <p className="text-sm text-white/30 mb-2 font-bold uppercase tracking-wider">Result:</p>
            <div className="px-4 py-3 rounded-xl border-2 border-[#4ade80]/30 bg-[#4ade80]/5 font-mono text-xs">
              <span className="text-white/30">{'{'}</span><br />
              <span className="text-[#4ade80]">&nbsp;&nbsp;&quot;result&quot;</span>
              <span className="text-white/30">: </span>
              <span className="text-[#4a9eff]">&quot;22&deg;C, Sunny&quot;</span><br />
              <span className="text-white/30">{'}'}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Step 3: The Agent Loop ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 3 ? 1 : 0 }}
        transition={spring}
      >
        <div className="relative w-80 h-80">
          {/* Circular loop nodes */}
          {[
            { label: 'Think', icon: '🧠', color: '#a78bfa', angle: 270 },
            { label: 'Decide', icon: '🧭', color: '#4a9eff', angle: 0 },
            { label: 'Execute', icon: '⚙️', color: '#4ade80', angle: 90 },
            { label: 'Observe', icon: '👁', color: '#fbbf24', angle: 180 },
          ].map((node, i) => {
            const rad = (node.angle * Math.PI) / 180;
            const cx = 160 + Math.cos(rad) * 110;
            const cy = 160 + Math.sin(rad) * 110;
            return (
              <motion.div
                key={node.label}
                className="absolute flex flex-col items-center"
                style={{
                  left: cx - 28,
                  top: cy - 28,
                }}
                animate={{
                  opacity: s === 3 ? 1 : 0,
                  scale: s === 3 ? (loopPulse === i ? 1.2 : 1) : 0.5,
                }}
                transition={{ ...spring, delay: i * 0.15 }}
              >
                <motion.div
                  className="w-14 h-14 rounded-xl border-2 flex items-center justify-center"
                  style={{
                    borderColor: `${node.color}50`,
                    backgroundColor: `${node.color}15`,
                    boxShadow: loopPulse === i ? `0 0 20px ${node.color}50` : 'none',
                  }}
                >
                  <span className="text-xl">{node.icon}</span>
                </motion.div>
                <span
                  className="text-[11px] font-bold mt-1"
                  style={{ color: node.color }}
                >
                  {node.label}
                </span>
              </motion.div>
            );
          })}

          {/* Circular path with animated dashes */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 320 320"
          >
            <motion.circle
              cx="160"
              cy="160"
              r="110"
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
            {/* Pulsing dot traveling around the circle */}
            <motion.circle
              r="6"
              fill="#fbbf24"
              animate={{
                cx: [160, 270, 160, 50, 160],
                cy: [50, 160, 270, 160, 50],
                opacity: s === 3 ? [0.6, 1, 0.6, 1, 0.6] : 0,
              }}
              transition={{
                cx: { duration: 3.2, repeat: Infinity, ease: 'linear' },
                cy: { duration: 3.2, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 3.2, repeat: Infinity, ease: 'linear' },
              }}
            />
            {/* Glow around traveling dot */}
            <motion.circle
              r="12"
              fill="none"
              stroke="#fbbf24"
              strokeWidth={1}
              opacity={0.3}
              animate={{
                cx: [160, 270, 160, 50, 160],
                cy: [50, 160, 270, 160, 50],
              }}
              transition={{
                cx: { duration: 3.2, repeat: Infinity, ease: 'linear' },
                cy: { duration: 3.2, repeat: Infinity, ease: 'linear' },
              }}
            />
          </svg>

          {/* Center label */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ opacity: s === 3 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.6 }}
          >
            <div className="text-center">
              <p className="text-xs text-white/20 font-bold uppercase tracking-wider">Agent</p>
              <p className="text-xs text-white/20">Loop</p>
            </div>
          </motion.div>

          {/* Exit arrow */}
          <motion.div
            className="absolute flex items-center gap-2"
            style={{ right: -80, top: '50%', transform: 'translateY(-50%)' }}
            animate={{ opacity: s === 3 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.8 }}
          >
            <span className="text-white/30 text-lg">&rarr;</span>
            <div className="px-3 py-1.5 rounded-lg border border-[#4ade80]/30 bg-[#4ade80]/5">
              <span className="text-xs text-[#4ade80] font-bold">Done!</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Step 4: Real Example: Weather ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 4 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-md w-full">
          <motion.p
            className="text-xs text-white/30 uppercase tracking-wider text-center mb-4"
            animate={{ opacity: s === 4 ? 1 : 0 }}
            transition={spring}
          >
            Step-by-step walkthrough
          </motion.p>

          {[
            { label: 'User asks', text: '"What\'s the weather in Paris?"', color: '#4a9eff', icon: '💬' },
            { label: 'Agent THINKS', text: '"I need the weather tool"', color: '#a78bfa', icon: '🧠' },
            { label: 'Tool call', text: 'get_weather("Paris")', color: '#fbbf24', icon: '⚙️' },
            { label: 'Result', text: '{ "temp": "22°C", "conditions": "Sunny" }', color: '#4ade80', icon: '📊' },
            { label: 'Agent THINKS', text: '"I have the data, time to respond"', color: '#a78bfa', icon: '🧠' },
            { label: 'Final response', text: '"It\'s 22°C and sunny in Paris!"', color: '#4ade80', icon: '✅' },
          ].map((step, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 mb-2 relative"
              animate={{
                opacity: s === 4 ? (weatherPhase >= i ? 1 : 0.15) : 0,
                x: s === 4 ? 0 : -15,
              }}
              transition={{ ...spring, delay: i * 0.05 }}
            >
              {/* Timeline line */}
              {i < 5 && (
                <motion.div
                  className="absolute left-[18px] top-9 w-0.5 h-5"
                  style={{ backgroundColor: `${step.color}30` }}
                  animate={{ opacity: weatherPhase >= i ? 1 : 0.2 }}
                />
              )}
              {/* Icon */}
              <motion.div
                className="w-9 h-9 rounded-lg border-2 flex items-center justify-center shrink-0"
                style={{
                  borderColor: `${step.color}40`,
                  backgroundColor: weatherPhase === i ? `${step.color}25` : `${step.color}08`,
                  boxShadow: weatherPhase === i ? `0 0 12px ${step.color}30` : 'none',
                }}
              >
                <span className="text-sm">{step.icon}</span>
              </motion.div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: step.color }}>
                  {step.label}
                </span>
                <p className={`text-xs text-white/50 ${step.label === 'Tool call' || step.label === 'Result' ? 'font-mono' : ''}`}>
                  {step.text}
                </p>
              </div>
              {/* Active indicator */}
              {weatherPhase === i && (
                <motion.div
                  className="w-2 h-2 rounded-full mt-3 shrink-0"
                  style={{ backgroundColor: step.color }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ===== Step 5: Real Example: Multi-Step ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 5 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          <motion.div
            className="text-center px-4 py-2 rounded-lg border border-[#4a9eff]/30 bg-[#4a9eff]/5 mb-5 inline-block mx-auto"
            style={{ display: 'block' }}
            animate={{ opacity: s === 5 ? 1 : 0 }}
            transition={spring}
          >
            <span className="text-sm text-[#4a9eff]">&quot;Plan a trip to Paris&quot;</span>
          </motion.div>

          {/* Loop iterations */}
          <div className="space-y-3">
            {[
              { num: 1, action: 'search_flights("Paris, Mar")', result: '$340 round-trip, Air France', icon: '✈️', color: '#4a9eff' },
              { num: 2, action: 'search_hotels("Paris, 4★+")', result: 'Hotel Le Marais, $120/night', icon: '🏨', color: '#a78bfa' },
              { num: 3, action: 'get_weather("Paris, March")', result: '15°C avg, light rain expected', icon: '🌤️', color: '#4ade80' },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3"
                animate={{
                  opacity: s === 5 ? (multiPhase >= i ? 1 : 0.2) : 0,
                  x: s === 5 ? 0 : -20,
                }}
                transition={{ ...spring, delay: i * 0.15 }}
              >
                {/* Loop number */}
                <motion.div
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{
                    borderColor: `${step.color}50`,
                    backgroundColor: multiPhase === i ? `${step.color}20` : `${step.color}08`,
                    color: step.color,
                    boxShadow: multiPhase === i ? `0 0 12px ${step.color}30` : 'none',
                  }}
                >
                  {step.num}
                </motion.div>
                <span className="text-lg shrink-0">{step.icon}</span>
                <div className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                  <span className="text-sm text-white/60 font-mono">{step.action}</span>
                </div>
                <motion.span
                  className="text-white/20 shrink-0"
                  animate={{ x: multiPhase >= i ? [0, 3, 0] : 0 }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  &rarr;
                </motion.span>
                <motion.div
                  className="flex-1 px-3 py-2 rounded-lg border bg-opacity-5"
                  style={{
                    borderColor: `${step.color}25`,
                    backgroundColor: `${step.color}08`,
                  }}
                  animate={{
                    opacity: s === 5 && multiPhase >= i ? 1 : 0.2,
                  }}
                  transition={smooth}
                >
                  <span className="text-sm" style={{ color: step.color }}>{step.result}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Growing response */}
          <motion.div
            className="mt-4 px-4 py-3 rounded-xl border-2 border-[#fbbf24]/25 bg-[#fbbf24]/5"
            animate={{
              opacity: s === 5 && multiPhase >= 2 ? 1 : 0,
              y: s === 5 && multiPhase >= 2 ? 0 : 10,
            }}
            transition={smooth}
          >
            <p className="text-sm text-[#fbbf24] font-bold uppercase tracking-wider mb-1">Final Response</p>
            <p className="text-xs text-white/50">
              &quot;I found a $340 round-trip on Air France, Hotel Le Marais for $120/night. March weather averages 15&deg;C with light rain -- pack a jacket!&quot;
            </p>
          </motion.div>

          <motion.p
            className="text-sm text-white/30 text-center mt-3"
            animate={{ opacity: s === 5 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.8 }}
          >
            3 loop iterations, each adding to the response
          </motion.p>
        </div>
      </motion.div>

      {/* ===== Step 6: What Tools Can Do ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 6 ? 1 : 0 }}
        transition={spring}
      >
        <motion.p
          className="text-xs text-white/30 uppercase tracking-wider text-center mb-5"
          animate={{ opacity: s === 6 ? 1 : 0 }}
          transition={spring}
        >
          Real Tool Examples
        </motion.p>

        <div className="flex gap-4 max-w-3xl w-full justify-center">
          {[
            {
              label: 'Search Tool',
              color: '#4a9eff',
              icon: '🔍',
              cmd: 'Googled "flights to Paris March"',
              output: '3 results: Air France $340, Delta $420...',
            },
            {
              label: 'Code Execution',
              color: '#4ade80',
              icon: '💻',
              cmd: 'Ran python analyze.py',
              output: 'Analysis complete: 847 rows processed',
            },
            {
              label: 'Database Query',
              color: '#a78bfa',
              icon: '🗄️',
              cmd: "SELECT revenue FROM sales\nWHERE quarter='Q3'",
              output: 'Result: $4.2M (+18% YoY)',
            },
          ].map((tool, i) => (
            <motion.div
              key={tool.label}
              className="flex-1 rounded-xl border-2 p-4 flex flex-col"
              style={{
                borderColor: toolHighlight === i ? `${tool.color}50` : `${tool.color}20`,
                backgroundColor: toolHighlight === i ? `${tool.color}10` : `${tool.color}05`,
              }}
              animate={{
                opacity: s === 6 ? 1 : 0,
                y: s === 6 ? 0 : 20,
                scale: toolHighlight === i ? 1.03 : 1,
              }}
              transition={{ ...spring, delay: i * 0.15 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{tool.icon}</span>
                <span className="text-xs font-bold" style={{ color: tool.color }}>{tool.label}</span>
                {toolHighlight === i && (
                  <motion.div
                    className="w-2 h-2 rounded-full ml-auto"
                    style={{ backgroundColor: tool.color }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Command */}
              <div className="bg-black/30 rounded-lg p-2.5 border border-white/5 mb-2 flex-1">
                <p className="text-sm text-white/25 mb-1">Command:</p>
                <pre className="text-sm font-mono whitespace-pre-wrap" style={{ color: `${tool.color}90` }}>
                  {tool.cmd}
                </pre>
              </div>

              {/* Output */}
              <motion.div
                className="bg-black/20 rounded-lg p-2.5 border"
                style={{ borderColor: `${tool.color}20` }}
                animate={{
                  opacity: s === 6 ? (toolHighlight === i ? 1 : 0.5) : 0,
                }}
                transition={smooth}
              >
                <p className="text-sm text-white/25 mb-1">Output:</p>
                <p className="text-sm text-white/50">{tool.output}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ===== Step 7: Tool Design ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 7 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-xl w-full">
          <div className="grid grid-cols-2 gap-5 mb-6">
            {/* Good example */}
            <motion.div
              className="rounded-xl border-2 border-[#4ade80]/30 bg-[#4ade80]/5 p-5"
              animate={{
                opacity: s === 7 ? 1 : 0,
                x: s === 7 ? 0 : -25,
              }}
              transition={{ ...spring, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">&#x2705;</span>
                <span className="text-sm font-bold text-[#4ade80]">Good Design</span>
              </div>
              <div className="px-3 py-2.5 rounded-lg border border-[#4ade80]/20 bg-[#4ade80]/5 mb-3">
                <p className="text-sm text-white/30 mb-1">name:</p>
                <p className="text-sm text-[#4ade80] font-mono font-bold">get_weather</p>
              </div>
              <div className="px-3 py-2.5 rounded-lg border border-[#4ade80]/20 bg-[#4ade80]/5">
                <p className="text-sm text-white/30 mb-1">description:</p>
                <p className="text-xs text-white/60">&quot;Get current weather for a city name. Returns temperature in Celsius and conditions.&quot;</p>
              </div>
            </motion.div>

            {/* Bad example */}
            <motion.div
              className="rounded-xl border-2 border-[#ef4444]/30 bg-[#ef4444]/5 p-5"
              animate={{
                opacity: s === 7 ? 1 : 0,
                x: s === 7 ? 0 : 25,
              }}
              transition={{ ...spring, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">&#x274c;</span>
                <span className="text-sm font-bold text-[#ef4444]">Bad Design</span>
              </div>
              <div className="px-3 py-2.5 rounded-lg border border-[#ef4444]/20 bg-[#ef4444]/5 mb-3">
                <p className="text-sm text-white/30 mb-1">name:</p>
                <p className="text-sm text-[#ef4444] font-mono font-bold">do_stuff</p>
              </div>
              <div className="px-3 py-2.5 rounded-lg border border-[#ef4444]/20 bg-[#ef4444]/5">
                <p className="text-sm text-white/30 mb-1">description:</p>
                <p className="text-xs text-white/60">&quot;Does things&quot;</p>
              </div>
            </motion.div>
          </div>

          {/* Key message */}
          <motion.div
            className="text-center px-5 py-3 rounded-xl border-2 border-[#fbbf24]/25 bg-[#fbbf24]/5"
            animate={{
              opacity: s === 7 ? 1 : 0,
              y: s === 7 ? 0 : 15,
            }}
            transition={{ ...spring, delay: 0.5 }}
          >
            <p className="text-xs text-[#fbbf24]">
              The LLM reads your descriptions to decide <span className="font-bold">WHEN</span> to use each tool.
            </p>
            <p className="text-sm text-white/30 mt-1">
              Bad descriptions = wrong tool choices = broken agents
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Step 8: Error Handling ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 8 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          {/* Tool call that fails */}
          <div className="flex items-center gap-4 justify-center mb-5">
            <motion.div
              className="px-4 py-2 rounded-lg border border-[#fbbf24]/30 bg-[#fbbf24]/5 font-mono text-xs"
              animate={{ opacity: s === 8 ? 1 : 0, x: s === 8 ? 0 : -20 }}
              transition={{ ...spring, delay: 0.1 }}
            >
              <span className="text-[#fbbf24]">get_weather</span>
              <span className="text-white/30">(&quot;Paris&quot;)</span>
            </motion.div>

            <motion.span
              className="text-white/30"
              animate={{ opacity: s === 8 ? 1 : 0 }}
              transition={{ ...spring, delay: 0.2 }}
            >
              &rarr;
            </motion.span>

            {/* Error response */}
            <motion.div
              className="px-4 py-2 rounded-lg border-2 border-[#ef4444]/40 bg-[#ef4444]/8 font-mono text-xs"
              animate={{
                opacity: s === 8 ? 1 : 0,
                boxShadow: s === 8
                  ? ['0 0 8px rgba(239,68,68,0.2)', '0 0 16px rgba(239,68,68,0.4)', '0 0 8px rgba(239,68,68,0.2)']
                  : '0 0 0px transparent',
              }}
              transition={{
                opacity: spring,
                boxShadow: { duration: 2, repeat: Infinity },
              }}
            >
              <span className="text-white/30">{'{'} </span>
              <span className="text-[#ef4444]">&quot;error&quot;</span>
              <span className="text-white/30">: </span>
              <span className="text-[#ef4444]">&quot;Network timeout&quot;</span>
              <span className="text-white/30"> {'}'}</span>
            </motion.div>
          </div>

          {/* LLM reads error */}
          <motion.div
            className="flex justify-center mb-5"
            animate={{ opacity: s === 8 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.4 }}
          >
            <div className="px-4 py-2 rounded-lg border border-[#a78bfa]/30 bg-[#a78bfa]/5 flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span className="text-xs text-[#a78bfa]">Agent reads the error and decides...</span>
            </div>
          </motion.div>

          {/* Three branching options */}
          <div className="flex gap-4 justify-center">
            {[
              { icon: '🔄', label: 'Retry', desc: 'Try the same tool again', color: '#4a9eff' },
              { icon: '🔀', label: 'Fallback', desc: 'Use a different tool', color: '#4ade80' },
              { icon: '💬', label: 'Tell User', desc: '"Sorry, weather service is down"', color: '#fbbf24' },
            ].map((branch, i) => (
              <motion.div
                key={branch.label}
                className="flex flex-col items-center"
                animate={{
                  opacity: s === 8 ? 1 : 0,
                  y: s === 8 ? 0 : 15,
                }}
                transition={{ ...spring, delay: 0.6 + i * 0.12 }}
              >
                <motion.div
                  className="w-1 h-6 mb-2 rounded-full"
                  style={{ backgroundColor: `${branch.color}30` }}
                />
                <motion.div
                  className="px-4 py-3 rounded-xl border-2 text-center w-36"
                  style={{
                    borderColor: errorBranch === i ? `${branch.color}50` : `${branch.color}25`,
                    backgroundColor: errorBranch === i ? `${branch.color}15` : `${branch.color}05`,
                    boxShadow: errorBranch === i ? `0 0 16px ${branch.color}25` : 'none',
                  }}
                >
                  <span className="text-xl block mb-1">{branch.icon}</span>
                  <p className="text-xs font-bold" style={{ color: branch.color }}>{branch.label}</p>
                  <p className="text-sm text-white/30 mt-1">{branch.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ===== Step 9: When Agents Are Overkill ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 9 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          {/* Root question */}
          <motion.div
            className="text-center px-5 py-3 rounded-xl border-2 border-[#a78bfa]/30 bg-[#a78bfa]/5 mb-6"
            animate={{
              opacity: s === 9 ? 1 : 0,
              y: s === 9 ? 0 : -15,
            }}
            transition={{ ...spring, delay: 0.1 }}
          >
            <p className="text-sm text-[#a78bfa] font-bold">What do you need?</p>
          </motion.div>

          {/* Three branches */}
          <div className="flex gap-4 justify-center">
            {/* Branch 1: Simple */}
            <motion.div
              className="flex flex-col items-center flex-1"
              animate={{
                opacity: s === 9 ? 1 : 0,
                y: s === 9 ? 0 : 20,
              }}
              transition={{ ...spring, delay: 0.3 }}
            >
              <div className="w-0.5 h-8 bg-[#4a9eff]/20 mb-2" />
              <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-center mb-2">
                <p className="text-sm text-white/40">Just a summary or answer</p>
              </div>
              <div className="w-0.5 h-4 bg-[#4a9eff]/20 mb-2" />
              <motion.div
                className="px-4 py-3 rounded-xl border-2 border-[#4a9eff]/30 bg-[#4a9eff]/5 text-center"
                animate={{
                  boxShadow: s === 9 ? '0 0 12px rgba(74,158,255,0.15)' : 'none',
                }}
              >
                <span className="text-2xl block mb-1">📡</span>
                <p className="text-xs text-[#4a9eff] font-bold">Simple API Call</p>
                <p className="text-sm text-white/30 mt-1">Cheaper &amp; faster</p>
              </motion.div>
            </motion.div>

            {/* Branch 2: Real-time */}
            <motion.div
              className="flex flex-col items-center flex-1"
              animate={{
                opacity: s === 9 ? 1 : 0,
                y: s === 9 ? 0 : 20,
              }}
              transition={{ ...spring, delay: 0.45 }}
            >
              <div className="w-0.5 h-8 bg-[#4ade80]/20 mb-2" />
              <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-center mb-2">
                <p className="text-sm text-white/40">Real-time data or actions</p>
              </div>
              <div className="w-0.5 h-4 bg-[#4ade80]/20 mb-2" />
              <motion.div
                className="px-4 py-3 rounded-xl border-2 border-[#4ade80]/30 bg-[#4ade80]/5 text-center"
                animate={{
                  boxShadow: s === 9 ? '0 0 12px rgba(74,222,128,0.15)' : 'none',
                }}
              >
                <span className="text-2xl block mb-1">🤖</span>
                <p className="text-xs text-[#4ade80] font-bold">Use an Agent</p>
                <p className="text-sm text-white/30 mt-1">Tools + reasoning</p>
              </motion.div>
            </motion.div>

            {/* Branch 3: Complex */}
            <motion.div
              className="flex flex-col items-center flex-1"
              animate={{
                opacity: s === 9 ? 1 : 0,
                y: s === 9 ? 0 : 20,
              }}
              transition={{ ...spring, delay: 0.6 }}
            >
              <div className="w-0.5 h-8 bg-[#a78bfa]/20 mb-2" />
              <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-center mb-2">
                <p className="text-sm text-white/40">Multiple steps with decisions</p>
              </div>
              <div className="w-0.5 h-4 bg-[#a78bfa]/20 mb-2" />
              <motion.div
                className="px-4 py-3 rounded-xl border-2 border-[#a78bfa]/30 bg-[#a78bfa]/5 text-center"
                animate={{
                  boxShadow: s === 9
                    ? ['0 0 12px rgba(167,139,250,0.15)', '0 0 20px rgba(167,139,250,0.3)', '0 0 12px rgba(167,139,250,0.15)']
                    : 'none',
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl block mb-1">🚀</span>
                <p className="text-xs text-[#a78bfa] font-bold">Definitely Agent</p>
                <p className="text-sm text-white/30 mt-1">Loop + multi-tool</p>
              </motion.div>
            </motion.div>
          </div>

          <motion.p
            className="text-sm text-white/30 text-center mt-5"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.9 }}
          >
            Don&apos;t over-engineer: pick the simplest approach that works
          </motion.p>
        </div>
      </motion.div>

      {/* ===== Step 10: RAG as a Tool ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 10 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-xl w-full">
          {/* Agent loop simplified with RAG highlighted */}
          <motion.p
            className="text-xs text-white/30 uppercase tracking-wider text-center mb-5"
            animate={{ opacity: s === 10 ? 1 : 0 }}
            transition={spring}
          >
            RAG Becomes a Tool in the Agent Loop
          </motion.p>

          <div className="flex items-center justify-center gap-2 mb-6">
            {[
              { label: 'Think', icon: '🧠', color: '#a78bfa', isRag: false },
              { label: '"I need company data"', icon: '💭', color: '#a78bfa', isRag: false },
              { label: 'RAG Search', icon: '📚', color: '#4a9eff', isRag: true },
              { label: 'Documents', icon: '📄', color: '#4ade80', isRag: false },
              { label: 'Continue', icon: '🧠', color: '#a78bfa', isRag: false },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                animate={{
                  opacity: s === 10 ? 1 : 0,
                  y: s === 10 ? 0 : 10,
                }}
                transition={{ ...spring, delay: i * 0.12 }}
              >
                <motion.div
                  className="flex flex-col items-center"
                  animate={{
                    scale: s === 10 && step.isRag ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div
                    className="w-12 h-12 rounded-xl border-2 flex items-center justify-center"
                    style={{
                      borderColor: step.isRag ? `${step.color}60` : `${step.color}30`,
                      backgroundColor: step.isRag ? `${step.color}15` : `${step.color}08`,
                      boxShadow: step.isRag ? `0 0 16px ${step.color}30` : 'none',
                    }}
                  >
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <span className="text-xs text-center mt-1 max-w-[60px]" style={{ color: `${step.color}90` }}>
                    {step.label}
                  </span>
                </motion.div>
                {i < 4 && (
                  <motion.span
                    className="text-white/20 text-xs mt-[-12px]"
                    animate={{ opacity: s === 10 ? 1 : 0 }}
                    transition={{ ...spring, delay: 0.3 + i * 0.1 }}
                  >
                    &rarr;
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Key insight */}
          <motion.div
            className="rounded-xl border-2 border-[#4a9eff]/25 bg-[#4a9eff]/5 p-4 text-center"
            animate={{
              opacity: s === 10 ? 1 : 0,
              y: s === 10 ? 0 : 15,
            }}
            transition={{ ...spring, delay: 0.7 }}
          >
            <p className="text-sm font-bold text-[#4a9eff] mb-2">RAG is just another tool</p>
            <p className="text-xs text-white/50">
              The agent <span className="text-[#a78bfa]">decides</span> when to search documents,
              just like it decides when to call any other tool.
            </p>
            <div className="flex justify-center gap-3 mt-3">
              {['search_docs()', 'get_weather()', 'run_code()'].map((tool, i) => (
                <motion.span
                  key={tool}
                  className="px-2 py-1 rounded text-sm font-mono border"
                  style={{
                    borderColor: i === 0 ? 'rgba(74,158,255,0.4)' : 'rgba(255,255,255,0.1)',
                    color: i === 0 ? '#4a9eff' : 'rgba(255,255,255,0.4)',
                    backgroundColor: i === 0 ? 'rgba(74,158,255,0.1)' : 'transparent',
                  }}
                  animate={{ opacity: s === 10 ? 1 : 0 }}
                  transition={{ ...spring, delay: 0.9 + i * 0.1 }}
                >
                  {tool}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Step 11: What You'll Build ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 11 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-xl w-full">
          <motion.h2
            className="text-2xl font-bold text-white text-center mb-5"
            animate={{
              opacity: s === 11 ? 1 : 0,
              y: s === 11 ? 0 : 20,
            }}
            transition={spring}
          >
            What You&apos;ll Build
          </motion.h2>

          {/* Roadmap cards */}
          <div className="space-y-3 mb-5">
            {[
              {
                part: 'Part 2',
                title: 'Simple Calculator Agent',
                desc: 'Your first agent with add, multiply tools',
                color: '#4a9eff',
                complexity: 1,
              },
              {
                part: 'Part 2',
                title: 'Math Tutor with 4 Tools',
                desc: 'Calculator + explainer + hint generator + quiz',
                color: '#fbbf24',
                complexity: 2,
              },
              {
                part: 'Part 3',
                title: 'Study Buddy + Knowledge',
                desc: 'Agent with RAG-powered document lookup',
                color: '#a78bfa',
                complexity: 3,
              },
              {
                part: 'Part 3',
                title: 'Terminal Assistant',
                desc: 'Real file operations, system commands',
                color: '#4ade80',
                complexity: 4,
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{
                  borderColor: `${item.color}25`,
                  backgroundColor: `${item.color}05`,
                }}
                animate={{
                  opacity: s === 11 ? 1 : 0,
                  x: s === 11 ? 0 : -20,
                }}
                transition={{ ...spring, delay: i * 0.12 }}
              >
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded border shrink-0"
                  style={{
                    color: item.color,
                    borderColor: `${item.color}40`,
                    backgroundColor: `${item.color}15`,
                  }}
                >
                  {item.part}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white/70">{item.title}</p>
                  <p className="text-sm text-white/35">{item.desc}</p>
                </div>
                {/* Complexity dots */}
                <div className="flex gap-1 shrink-0">
                  {[1, 2, 3, 4].map((dot) => (
                    <div
                      key={dot}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: dot <= item.complexity ? item.color : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Terminal preview */}
          <motion.div
            className="mx-auto max-w-sm rounded-xl border border-white/10 bg-black/40 p-3 overflow-hidden"
            animate={{
              opacity: s === 11 ? 1 : 0,
              y: s === 11 ? 0 : 15,
            }}
            transition={{ ...spring, delay: 0.6 }}
          >
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80]/60" />
              <span className="text-xs text-white/20 ml-2">Terminal Assistant Preview</span>
            </div>
            <div className="font-mono text-sm space-y-1">
              <p><span className="text-[#4ade80]">$</span> <span className="text-white/50">List all Python files in /src</span></p>
              <motion.p
                className="text-[#a78bfa]"
                animate={{ opacity: s === 11 ? [0.4, 1, 0.4] : 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Calling list_files(path=&quot;/src&quot;, pattern=&quot;*.py&quot;)...
              </motion.p>
              <p className="text-[#fbbf24]">Found 12 files: main.py, utils.py, api.py...</p>
              <p><span className="text-[#4ade80]">$</span> <span className="text-white/50">Show me the largest one</span></p>
              <p className="text-[#a78bfa]">Calling file_info(path=&quot;/src/api.py&quot;)...</p>
              <p className="text-[#fbbf24]">api.py (2.4KB, 89 lines) - REST API endpoints</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Step 12: Key Takeaways ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 12 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-md w-full">
          <motion.h2
            className="text-2xl font-bold text-white text-center mb-5"
            animate={{
              opacity: s === 12 ? 1 : 0,
              y: s === 12 ? 0 : 15,
            }}
            transition={spring}
          >
            Key Takeaways
          </motion.h2>

          <div className="space-y-2.5">
            {[
              { num: 1, text: 'Agent = LLM + Tools + Loop', color: '#a78bfa' },
              { num: 2, text: 'The LLM thinks, your code acts', color: '#4a9eff' },
              { num: 3, text: 'Clear tool names and descriptions matter', color: '#4ade80' },
              { num: 4, text: 'Handle errors gracefully -- retry, fallback, or tell user', color: '#ef4444' },
              { num: 5, text: 'Don\'t use agents when a simple API call would work', color: '#fbbf24' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-4 px-5 py-3 rounded-xl border bg-white/[0.02]"
                style={{
                  borderColor: `${item.color}25`,
                }}
                animate={{
                  opacity: s === 12 ? 1 : 0,
                  x: s === 12 ? 0 : -20,
                }}
                transition={{ ...spring, delay: i * 0.12 }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border"
                  style={{
                    color: item.color,
                    borderColor: `${item.color}40`,
                    backgroundColor: `${item.color}15`,
                  }}
                >
                  {item.num}
                </span>
                <span className="text-sm text-white/70">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
