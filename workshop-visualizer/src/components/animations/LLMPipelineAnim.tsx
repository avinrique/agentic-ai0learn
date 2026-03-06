'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useConceptStore } from '@/stores/conceptStore';

const spring = { type: 'spring' as const, damping: 25, stiffness: 120 };
const smooth = { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const };

const tokens = ['The', 'capital', 'of', 'France', 'is'];
const tokenColors = ['#4a9eff', '#a78bfa', '#4ade80', '#fbbf24', '#f472b6'];
const tokenIds = [464, 3361, 315, 6064, 374];

const probabilities = [
  { label: 'Paris', pct: 92, color: '#4ade80' },
  { label: 'Lyon', pct: 3, color: '#fbbf24' },
  { label: 'the', pct: 2, color: '#a78bfa' },
  { label: 'Marseille', pct: 1.5, color: '#f472b6' },
  { label: 'known', pct: 1.5, color: '#4a9eff' },
];

const networkLayers = [
  { cx: 80, nodes: 5 },
  { cx: 180, nodes: 4 },
  { cx: 280, nodes: 6 },
  { cx: 380, nodes: 4 },
  { cx: 480, nodes: 3 },
];

function nodeY(nodeIndex: number, totalNodes: number, height: number) {
  const spacing = height / (totalNodes + 1);
  return spacing * (nodeIndex + 1);
}

const autoSteps = [
  { input: ['The', 'capital', 'of', 'France', 'is'], output: 'Paris' },
  { input: ['...', 'France', 'is', 'Paris'], output: 'is' },
  { input: ['...', 'is', 'Paris', 'is'], output: 'the' },
  { input: ['...', 'Paris', 'is', 'the'], output: 'capital' },
  { input: ['...', 'is', 'the', 'capital'], output: 'city' },
];

type AutoPhase = 0 | 1 | 2 | 3;

const tempStates = [
  { label: 'Temp = 0', desc: 'Always picks "Paris" — deterministic', bars: [100, 0, 0, 0, 0], thermColor: '#4a9eff' },
  { label: 'Temp = 0.7', desc: 'Balanced — usually "Paris" but sometimes surprises', bars: [92, 3, 2, 1.5, 1.5], thermColor: '#fbbf24' },
  { label: 'Temp = 1.5', desc: 'Creative — could pick anything', bars: [40, 20, 18, 12, 10], thermColor: '#ef4444' },
];

const trainingSources = [
  { icon: '📚', label: 'Books & articles' },
  { icon: '💻', label: 'Code repositories' },
  { icon: '🌐', label: 'Websites' },
  { icon: '💬', label: 'Conversations' },
];

const llmFamily = [
  { name: 'ChatGPT', company: 'OpenAI', color: '#10a37f', letter: 'G', logo: '/logos/openai.svg' },
  { name: 'Claude', company: 'Anthropic', color: '#d97706', letter: 'C', logo: '/logos/anthropic.svg' },
  { name: 'Gemini', company: 'Google', color: '#4285f4', letter: 'G', logo: '/logos/google.svg' },
  { name: 'Llama', company: 'Meta', color: '#1877f2', letter: 'L', logo: '/logos/meta.svg' },
  { name: 'Mistral', company: 'Mistral AI', color: '#ff7000', letter: 'M', logo: '/logos/mistral.svg' },
  { name: 'Falcon', company: 'TII', color: '#8b5cf6', letter: 'F', logo: '/logos/falcon.svg' },
];

const trainingExamples = [
  { input: 'The cat sat on the', correct: 'mat', predicted: 'mat', isRight: true },
  { input: 'Paris is the capital of', correct: 'France', predicted: 'France', isRight: true },
  { input: 'Water boils at 100 degrees', correct: 'Celsius', predicted: 'Fahrenheit', isRight: false },
  { input: 'The sun rises in the', correct: 'east', predicted: 'east', isRight: true },
];

const pipelineStages = [
  { label: 'Prompt', color: '#4a9eff', icon: '💬' },
  { label: 'Tokenizer', color: '#a78bfa', icon: '✂️' },
  { label: 'Embeddings', color: '#4ade80', icon: '📐' },
  { label: 'Attention', color: '#fbbf24', icon: '🔗' },
  { label: 'Neural Net', color: '#f472b6', icon: '🧠' },
  { label: 'Probabilities', color: '#ef4444', icon: '📊' },
  { label: 'Output', color: '#4ade80', icon: '✨' },
];

export default function LLMPipelineAnim() {
  const { currentStep } = useConceptStore();
  const s = currentStep;

  const netH = 240;

  // Typing animation state
  const [typedText, setTypedText] = useState('');
  const [responseText, setResponseText] = useState('');

  // Autoregressive animation state
  const [autoIdx, setAutoIdx] = useState(0);
  const [autoPhase, setAutoPhase] = useState<AutoPhase>(0);
  const [completedTokens, setCompletedTokens] = useState<string[]>([]);

  // Temperature cycling state
  const [tempIdx, setTempIdx] = useState(0);

  // Context window scroll position
  const [windowOffset, setWindowOffset] = useState(0);

  // Pipeline pulse position
  const [pipelinePulse, setPipelinePulse] = useState(0);

  // Step 0: Typing effect
  useEffect(() => {
    if (s !== 0) { setTypedText(''); setResponseText(''); return; }
    const question = 'Explain quantum physics like I\'m 5';
    const response = 'Imagine tiny balls that can be in two places at once...';
    let qi = 0;
    let ri = 0;
    const typeQ = setInterval(() => {
      if (qi <= question.length) {
        setTypedText(question.slice(0, qi));
        qi++;
      } else {
        clearInterval(typeQ);
        const typeR = setInterval(() => {
          if (ri <= response.length) {
            setResponseText(response.slice(0, ri));
            ri++;
          } else {
            clearInterval(typeR);
          }
        }, 30);
      }
    }, 50);
    return () => clearInterval(typeQ);
  }, [s]);

  // Step 13: Autoregressive animation
  useEffect(() => {
    if (s !== 13) {
      setAutoIdx(0);
      setAutoPhase(0);
      setCompletedTokens([]);
      return;
    }
    const durations = [600, 800, 700, 900];
    const timer = setTimeout(() => {
      if (autoPhase < 3) {
        setAutoPhase((p) => (p + 1) as AutoPhase);
      } else {
        setCompletedTokens((prev) => [...prev, autoSteps[autoIdx].output]);
        if (autoIdx < autoSteps.length - 1) {
          setAutoIdx((i) => i + 1);
          setAutoPhase(0);
        } else {
          setTimeout(() => {
            setAutoIdx(0);
            setAutoPhase(0);
            setCompletedTokens([]);
          }, 1500);
        }
      }
    }, durations[autoPhase]);
    return () => clearTimeout(timer);
  }, [s, autoIdx, autoPhase]);

  // Step 14: Temperature cycling
  useEffect(() => {
    if (s !== 14) { setTempIdx(0); return; }
    const timer = setInterval(() => {
      setTempIdx((prev) => (prev + 1) % tempStates.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [s]);

  // Step 17: Context window sliding
  useEffect(() => {
    if (s !== 17) { setWindowOffset(0); return; }
    const timer = setInterval(() => {
      setWindowOffset((prev) => (prev + 1) % 20);
    }, 400);
    return () => clearInterval(timer);
  }, [s]);

  // Step 19: Pipeline pulse
  useEffect(() => {
    if (s !== 19) { setPipelinePulse(0); return; }
    const timer = setInterval(() => {
      setPipelinePulse((prev) => (prev + 1) % (pipelineStages.length + 2));
    }, 600);
    return () => clearInterval(timer);
  }, [s]);

  return (
    <div className="h-full w-full relative overflow-hidden bg-[#0a0e1a]">

      {/* ===== STEP 0: "The AI You Already Know" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8"
        animate={{ opacity: s === 0 ? 1 : 0 }}
        transition={smooth}
      >
        {/* Chat interface mockup */}
        <div className="w-full max-w-lg">
          {/* User message */}
          <motion.div
            className="flex justify-end mb-4"
            animate={{ opacity: s === 0 ? 1 : 0, y: s === 0 ? 0 : 20 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <div className="bg-accent-blue/20 border border-accent-blue/30 rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
              <p className="text-sm font-mono text-white/80">
                {typedText}
                <motion.span
                  className="text-accent-blue"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                >
                  |
                </motion.span>
              </p>
            </div>
          </motion.div>
          {/* AI response */}
          {responseText && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
                <p className="text-sm text-white/70">{responseText}</p>
              </div>
            </motion.div>
          )}
        </div>
        <motion.p
          className="text-white/30 text-sm font-medium mt-6"
          animate={{ opacity: s === 0 ? 1 : 0 }}
          transition={{ ...spring, delay: 1 }}
        >
          You&apos;ve used this before. But what&apos;s happening under the hood?
        </motion.p>
      </motion.div>

      {/* ===== STEP 1: "Meet the Family" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 1 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-4">These are all different products, built on the same idea</p>
        <div className="grid grid-cols-3 gap-3 max-w-md mb-5">
          {llmFamily.map((llm, i) => (
            <motion.div
              key={llm.name}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border bg-white/[0.03]"
              style={{ borderColor: `${llm.color}40` }}
              animate={{
                opacity: s === 1 ? 1 : 0,
                y: s === 1 ? 0 : 20,
                scale: s === 1 ? 1 : 0.8,
              }}
              transition={{ ...spring, delay: s === 1 ? i * 0.08 : 0 }}
            >
              <img
                src={llm.logo}
                alt={llm.name}
                className="w-8 h-8 rounded-md"
              />
              <div>
                <p className="text-sm font-bold text-white/80">{llm.name}</p>
                <p className="text-xs text-white/30">{llm.company}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Prompt bubble and model response previews */}
        <motion.div
          className="w-full max-w-md"
          animate={{ opacity: s === 1 ? 1 : 0, y: s === 1 ? 0 : 15 }}
          transition={{ ...spring, delay: 0.7 }}
        >
          <div className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.03] mb-3 text-center">
            <p className="text-sm text-white/30 uppercase tracking-wider mb-1">Same prompt</p>
            <p className="text-base font-mono font-medium text-white/70">&quot;Explain quantum physics simply&quot;</p>
          </div>
          <div className="flex gap-2">
            {[
              { name: 'ChatGPT', color: '#10a37f', response: 'Think of particles as tiny dice that...' },
              { name: 'Claude', color: '#d97706', response: 'Imagine the universe at its smallest scale...' },
              { name: 'Gemini', color: '#4285f4', response: 'Quantum physics is like a game where...' },
            ].map((model, i) => (
              <motion.div
                key={model.name}
                className="flex-1 px-3 py-2 rounded-lg border bg-white/[0.02]"
                style={{ borderColor: `${model.color}30` }}
                animate={{
                  opacity: s === 1 ? 1 : 0,
                  y: s === 1 ? 0 : 10,
                  boxShadow: s === 1 ? [
                    `0 0 0px ${model.color}00`,
                    `0 0 12px ${model.color}30`,
                    `0 0 0px ${model.color}00`,
                  ] : `0 0 0px ${model.color}00`,
                }}
                transition={{
                  ...spring,
                  delay: s === 1 ? 0.9 + i * 0.12 : 0,
                  boxShadow: { duration: 2, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' },
                }}
              >
                <p className="text-xs font-bold mb-1" style={{ color: model.color }}>{model.name}</p>
                <p className="text-xs text-white/40 leading-tight">{model.response}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ===== STEP 2: "They're All LLMs" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 2 ? 1 : 0 }}
        transition={smooth}
      >
        {/* Shrunk cards in a ring */}
        <div className="relative w-40 h-40 mb-6">
          {llmFamily.map((llm, i) => {
            const angle = (i / llmFamily.length) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * 60;
            const y = Math.sin(angle) * 60;
            return (
              <motion.div
                key={llm.name}
                className="absolute w-8 h-8 rounded-md overflow-hidden"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: s === 2 ? x - 16 : 0,
                  y: s === 2 ? y - 16 : 0,
                  opacity: s === 2 ? 0.7 : 0,
                }}
                transition={{ ...spring, delay: s === 2 ? 0.2 : 0 }}
              >
                <img src={llm.logo} alt={llm.name} className="w-full h-full" />
              </motion.div>
            );
          })}
          {/* Center LLM label */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ opacity: s === 2 ? 1 : 0, scale: s === 2 ? 1 : 0.5 }}
            transition={{ ...spring, delay: 0.4 }}
          >
            <span className="text-4xl font-bold text-white">LLM</span>
          </motion.div>
        </div>
        {/* Three words */}
        <div className="flex gap-4">
          {[
            { word: 'Large', desc: 'billions of parameters', color: '#4a9eff' },
            { word: 'Language', desc: 'trained on text', color: '#a78bfa' },
            { word: 'Model', desc: 'makes predictions', color: '#4ade80' },
          ].map((w, i) => (
            <motion.div
              key={w.word}
              className="text-center"
              animate={{ opacity: s === 2 ? 1 : 0, y: s === 2 ? 0 : 15 }}
              transition={{ ...spring, delay: s === 2 ? 0.6 + i * 0.15 : 0 }}
            >
              <p className="text-2xl font-bold" style={{ color: w.color }}>{w.word}</p>
              <p className="text-sm text-white/30 mt-1">{w.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ===== STEP 3: "The Big Question" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        animate={{ opacity: s === 3 ? 1 : 0 }}
        transition={smooth}
      >
        <motion.div
          className="text-7xl mb-6"
          animate={s === 3 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-accent-blue">?</span>
        </motion.div>
        <motion.p
          className="text-xl font-semibold text-white/60 mb-2"
          animate={{ opacity: s === 3 ? 1 : 0 }}
          transition={{ ...spring, delay: 0.3 }}
        >
          How does it actually work?
        </motion.p>
        {/* Orbiting question fragments */}
        {['How does it understand?', 'Where does it learn?', 'Why is it so good?'].map((q, i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <motion.span
              key={q}
              className="absolute text-sm text-white/20"
              style={{ left: '50%', top: '50%' }}
              animate={s === 3 ? {
                x: [Math.cos(angle) * 120, Math.cos(angle + Math.PI * 2) * 120],
                y: [Math.sin(angle) * 80 - 20, Math.sin(angle + Math.PI * 2) * 80 - 20],
              } : { opacity: 0 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              {q}
            </motion.span>
          );
        })}
        <motion.div
          className="mt-4 flex items-center gap-2 text-accent-blue/60"
          animate={{ opacity: s === 3 ? 1 : 0, y: s === 3 ? 0 : 10 }}
          transition={{ ...spring, delay: 0.6 }}
        >
          <span className="text-sm">Let&apos;s find out</span>
          <span className="text-lg">→</span>
        </motion.div>
      </motion.div>

      {/* ===== STEP 4: "It Starts With Your Words" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        animate={{ opacity: s === 4 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-6">You type:</p>
        <motion.div
          className="relative px-6 py-4 rounded-xl border border-white/15 bg-white/[0.03] max-w-lg w-full"
          animate={{ scale: s === 4 ? 1 : 0.9 }}
          transition={spring}
        >
          <p className="text-sm text-white/25 mb-2 uppercase tracking-wider">Your prompt</p>
          <p className="text-2xl font-mono text-white">
            &quot;The capital of France is ___&quot;
          </p>
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent-blue"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
        <motion.p
          className="text-white/30 text-sm font-medium mt-6"
          animate={{ opacity: s === 4 ? 1 : 0 }}
          transition={{ ...spring, delay: 0.5 }}
        >
          The model&apos;s job: predict what comes next
        </motion.p>
      </motion.div>

      {/* ===== STEP 5: "Breaking Words Into Pieces" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 5 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-3">
          Text is split into <span className="text-accent-blue font-bold">tokens</span>
        </p>
        <motion.p
          className="text-2xl font-mono text-white/30 mb-6"
          animate={{ opacity: s === 5 ? 0.3 : 0 }}
          transition={smooth}
        >
          &quot;The capital of France is&quot;
        </motion.p>
        {/* Animated knife sweep */}
        <div className="relative">
          <motion.div className="flex items-center gap-2">
            <span className="text-white/20 text-2xl mr-2">→</span>
            {tokens.map((tok, i) => (
              <motion.div
                key={tok}
                className="flex flex-col items-center gap-1"
                animate={{
                  opacity: s === 5 ? 1 : 0,
                  y: s === 5 ? 0 : 20,
                  scale: s === 5 ? 1 : 0.5,
                }}
                transition={{ ...spring, delay: s === 5 ? 0.3 + i * 0.1 : 0 }}
              >
                <div
                  className="px-5 py-3 rounded-lg border-2 font-mono text-lg font-bold"
                  style={{
                    borderColor: tokenColors[i],
                    color: tokenColors[i],
                    backgroundColor: `${tokenColors[i]}12`,
                  }}
                >
                  {tok}
                </div>
                <motion.span
                  className="text-sm font-mono text-white/30"
                  animate={{ opacity: s === 5 ? 1 : 0 }}
                  transition={{ ...spring, delay: s === 5 ? 0.8 + i * 0.08 : 0 }}
                >
                  ID: {tokenIds[i]}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        {/* Subword example */}
        <motion.div
          className="mt-6 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03]"
          animate={{ opacity: s === 5 ? 1 : 0, y: s === 5 ? 0 : 10 }}
          transition={{ ...spring, delay: 1 }}
        >
          <p className="text-xs text-white/40">
            <span className="text-white/60 font-mono">&quot;unbelievable&quot;</span>
            <span className="text-white/20 mx-2">→</span>
            {['un', 'believ', 'able'].map((part) => (
              <span key={part} className="px-2 py-0.5 mx-0.5 rounded border border-accent-blue/30 bg-accent-blue/10 text-accent-blue text-sm font-mono font-bold">
                {part}
              </span>
            ))}
          </p>
        </motion.div>
      </motion.div>

      {/* ===== STEP 6: "Why Tokens Matter" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8"
        animate={{ opacity: s === 6 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-6">
          Tokens = the <span className="text-accent-blue font-bold">currency</span> of LLMs
        </p>

        <div className="flex gap-6 mb-6 w-full max-w-lg">
          {/* Short prompt */}
          <motion.div
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            animate={{ opacity: s === 6 ? 1 : 0, x: s === 6 ? 0 : -20 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <p className="text-sm text-white/30 uppercase mb-2">Short prompt</p>
            <p className="text-xs font-mono text-white/50 mb-2">&quot;Hi there&quot;</p>
            <div className="flex items-center gap-2">
              <div className="h-3 bg-accent-blue/30 rounded-full" style={{ width: '20%' }} />
              <span className="text-xs font-mono text-accent-blue">2 tokens</span>
            </div>
          </motion.div>
          {/* Long prompt */}
          <motion.div
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            animate={{ opacity: s === 6 ? 1 : 0, x: s === 6 ? 0 : 20 }}
            transition={{ ...spring, delay: 0.35 }}
          >
            <p className="text-sm text-white/30 uppercase mb-2">Long prompt</p>
            <p className="text-xs font-mono text-white/50 mb-2">&quot;Write a detailed essay about...&quot;</p>
            <div className="flex items-center gap-2">
              <div className="h-3 bg-fuchsia-500/30 rounded-full" style={{ width: '80%' }} />
              <span className="text-xs font-mono text-fuchsia-400">500 tokens</span>
            </div>
          </motion.div>
        </div>

        {/* Cost bar */}
        <motion.div
          className="w-full max-w-lg px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03]"
          animate={{ opacity: s === 6 ? 1 : 0, y: s === 6 ? 0 : 15 }}
          transition={{ ...spring, delay: 0.6 }}
        >
          <p className="text-xs text-white/50 text-center mb-2">
            Real pricing (GPT-4): <span className="text-accent-blue font-mono">$30 / 1M input tokens</span>
            <span className="text-white/20 mx-2">|</span>
            Claude: <span className="text-accent-gold font-mono">$15 / 1M input tokens</span>
          </p>
          <p className="text-sm text-white/25 text-center">
            A 1-page email ≈ 500 tokens ≈ $0.015 &nbsp;|&nbsp; Harry Potter (full book) ≈ 250K tokens ≈ $7.50
          </p>
        </motion.div>
      </motion.div>

      {/* ===== STEP 7: "Giving Words Meaning: Embeddings" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8"
        animate={{ opacity: s === 7 ? 1 : 0 }}
        transition={smooth}
      >
        {/* GPS analogy — large and clear */}
        <div className="flex gap-6 mb-8 w-full max-w-2xl">
          <motion.div
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center"
            animate={{ opacity: s === 7 ? 1 : 0, x: s === 7 ? 0 : -30 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">GPS locates a place</p>
            <p className="text-2xl font-mono text-white/70">(40.7, -74.0)</p>
            <motion.p
              className="text-sm text-accent-blue mt-2 font-bold"
              animate={{ opacity: s === 7 ? 1 : 0 }}
              transition={{ ...spring, delay: 0.5 }}
            >
              = New York
            </motion.p>
          </motion.div>

          <motion.div
            className="flex items-center"
            animate={{ opacity: s === 7 ? 1 : 0, scale: s === 7 ? 1 : 0.5 }}
            transition={{ ...spring, delay: 0.4 }}
          >
            <span className="text-2xl text-white/20">↔</span>
          </motion.div>

          <motion.div
            className="flex-1 rounded-xl border-2 border-accent-blue/30 bg-accent-blue/[0.05] p-5 text-center"
            animate={{ opacity: s === 7 ? 1 : 0, x: s === 7 ? 0 : 30 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Embedding locates meaning</p>
            <p className="text-2xl font-mono text-accent-blue">[0.82, -0.45, ...]</p>
            <motion.p
              className="text-sm text-accent-blue mt-2 font-bold"
              animate={{ opacity: s === 7 ? 1 : 0 }}
              transition={{ ...spring, delay: 0.6 }}
            >
              = &quot;King&quot; (royalty, male, power)
            </motion.p>
          </motion.div>
        </div>

        {/* Token → embedding: ALL FIVE tokens with DIFFERENT numbers */}
        <motion.p
          className="text-white/40 text-base font-medium mb-4"
          animate={{ opacity: s === 7 ? 1 : 0 }}
          transition={{ ...spring, delay: 0.6 }}
        >
          Every token gets its own <span className="text-accent-blue font-bold">unique</span> embedding vector:
        </motion.p>

        <motion.div
          className="flex items-start gap-5 w-full max-w-2xl justify-center"
          animate={{ opacity: s === 7 ? 1 : 0, y: s === 7 ? 0 : 20 }}
          transition={{ ...spring, delay: 0.7 }}
        >
          {[
            { tok: 'The', vals: [0.12, -0.03, 0.08, -0.01], color: tokenColors[0] },
            { tok: 'capital', vals: [0.67, 0.34, -0.51, 0.22], color: tokenColors[1] },
            { tok: 'of', vals: [0.05, -0.02, 0.11, -0.06], color: tokenColors[2] },
            { tok: 'France', vals: [0.82, -0.45, 0.73, 0.91], color: tokenColors[3] },
            { tok: 'is', vals: [0.09, 0.01, -0.04, 0.07], color: tokenColors[4] },
          ].map((item, i) => (
            <motion.div
              key={item.tok}
              className="flex flex-col items-center gap-2"
              animate={{ opacity: s === 7 ? 1 : 0, y: s === 7 ? 0 : 15 }}
              transition={{ ...spring, delay: 0.8 + i * 0.12 }}
            >
              <span
                className="px-3 py-1.5 rounded-lg text-sm font-mono font-bold border"
                style={{
                  color: item.color,
                  backgroundColor: `${item.color}12`,
                  borderColor: `${item.color}30`,
                }}
              >
                {item.tok}
              </span>

              {/* Animated arrow */}
              <motion.span
                className="text-lg"
                style={{ color: `${item.color}60` }}
                animate={{ y: s === 7 ? [0, 3, 0] : 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              >
                ↓
              </motion.span>

              {/* Embedding vector — unique per token */}
              <div
                className="flex flex-col gap-0.5 px-3 py-2 rounded-lg border"
                style={{
                  borderColor: `${item.color}25`,
                  backgroundColor: `${item.color}06`,
                }}
              >
                {item.vals.map((val, j) => (
                  <motion.span
                    key={j}
                    className="text-xs font-mono text-center font-bold"
                    style={{ color: val >= 0 ? '#4ade80' : '#f472b6' }}
                    animate={{ opacity: s === 7 ? 1 : 0 }}
                    transition={{ ...spring, delay: 1 + i * 0.12 + j * 0.05 }}
                  >
                    {val >= 0 ? '+' : ''}{val.toFixed(2)}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="text-sm text-white/25 mt-5"
          animate={{ opacity: s === 7 ? 1 : 0 }}
          transition={{ ...spring, delay: 1.8 }}
        >
          Notice: &quot;France&quot; has large numbers (lots of meaning) — &quot;of&quot; has tiny numbers (little meaning)
        </motion.p>
      </motion.div>

      {/* ===== STEP 8: "The Meaning Map" ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-8"
        animate={{ opacity: s === 8 ? 1 : 0 }}
        transition={smooth}
      >
        <div className="w-full max-w-3xl">
          {/* Large 2D scatter plot with SVG */}
          <motion.svg
            viewBox="0 0 600 380"
            className="w-full"
            animate={{ opacity: s === 8 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.1 }}
          >
            {/* Axes */}
            <line x1="50" y1="350" x2="580" y2="350" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            <line x1="50" y1="20" x2="50" y2="350" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

            {/* Cluster regions — pulsing halos */}
            <motion.circle
              cx="430" cy="90" r="75"
              fill="none" stroke="#4a9eff" strokeWidth={1.5} strokeDasharray="6 4"
              animate={s === 8 ? { opacity: [0.15, 0.35, 0.15] } : { opacity: 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.text
              x="430" y="25" textAnchor="middle" fill="#4a9eff" fontSize="12" fontWeight="bold"
              animate={{ opacity: s === 8 ? 0.6 : 0 }}
              transition={{ ...spring, delay: 0.4 }}
            >
              ROYALTY
            </motion.text>

            <motion.circle
              cx="160" cy="210" r="70"
              fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="6 4"
              animate={s === 8 ? { opacity: [0.15, 0.35, 0.15] } : { opacity: 0 }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />
            <motion.text
              x="160" y="155" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="bold"
              animate={{ opacity: s === 8 ? 0.6 : 0 }}
              transition={{ ...spring, delay: 0.5 }}
            >
              ANIMALS
            </motion.text>

            {/* Dashed line showing distance: king↔banana */}
            <motion.line
              x1="410" y1="80" x2="380" y2="310"
              stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4"
              animate={{ opacity: s === 8 ? 0.4 : 0 }}
              transition={{ ...spring, delay: 1.2 }}
            />
            <motion.text
              x="420" y="200" fill="#ef4444" fontSize="11" fontWeight="bold"
              animate={{ opacity: s === 8 ? 0.7 : 0 }}
              transition={{ ...spring, delay: 1.4 }}
            >
              distance = 4.7
            </motion.text>

            {/* Dashed line showing distance: king↔queen */}
            <motion.line
              x1="410" y1="80" x2="460" y2="95"
              stroke="#4ade80" strokeWidth={1.5} strokeDasharray="4 4"
              animate={{ opacity: s === 8 ? 0.5 : 0 }}
              transition={{ ...spring, delay: 0.9 }}
            />
            <motion.text
              x="445" y="68" fill="#4ade80" fontSize="10" fontWeight="bold"
              animate={{ opacity: s === 8 ? 0.8 : 0 }}
              transition={{ ...spring, delay: 1.1 }}
            >
              d = 0.12
            </motion.text>

            {/* Data points — Royalty cluster */}
            {[
              { word: 'king', cx: 410, cy: 80, color: '#4a9eff', delay: 0.3 },
              { word: 'queen', cx: 460, cy: 95, color: '#4a9eff', delay: 0.4 },
              { word: 'prince', cx: 395, cy: 115, color: '#4a9eff', delay: 0.45 },
              { word: 'throne', cx: 450, cy: 60, color: '#4a9eff', delay: 0.5 },
            ].map((pt) => (
              <motion.g key={pt.word}>
                <motion.circle
                  cx={pt.cx} cy={pt.cy} r="6"
                  fill={pt.color}
                  animate={{
                    opacity: s === 8 ? 1 : 0,
                    r: s === 8 ? 6 : 0,
                  }}
                  transition={{ ...spring, delay: pt.delay }}
                />
                <motion.circle
                  cx={pt.cx} cy={pt.cy} r="12"
                  fill={pt.color} opacity={0.15}
                  animate={{ opacity: s === 8 ? 0.15 : 0 }}
                  transition={{ ...spring, delay: pt.delay }}
                />
                <motion.text
                  x={pt.cx + 12} y={pt.cy + 4}
                  fill={pt.color} fontSize="13" fontWeight="bold"
                  animate={{ opacity: s === 8 ? 1 : 0 }}
                  transition={{ ...spring, delay: pt.delay + 0.1 }}
                >
                  {pt.word}
                </motion.text>
              </motion.g>
            ))}

            {/* Data points — Animals cluster */}
            {[
              { word: 'dog', cx: 145, cy: 200, color: '#fbbf24', delay: 0.5 },
              { word: 'cat', cx: 175, cy: 225, color: '#fbbf24', delay: 0.55 },
              { word: 'puppy', cx: 130, cy: 235, color: '#fbbf24', delay: 0.6 },
              { word: 'kitten', cx: 190, cy: 195, color: '#fbbf24', delay: 0.65 },
            ].map((pt) => (
              <motion.g key={pt.word}>
                <motion.circle
                  cx={pt.cx} cy={pt.cy} r="6"
                  fill={pt.color}
                  animate={{ opacity: s === 8 ? 1 : 0, r: s === 8 ? 6 : 0 }}
                  transition={{ ...spring, delay: pt.delay }}
                />
                <motion.circle
                  cx={pt.cx} cy={pt.cy} r="12"
                  fill={pt.color} opacity={0.15}
                  animate={{ opacity: s === 8 ? 0.15 : 0 }}
                  transition={{ ...spring, delay: pt.delay }}
                />
                <motion.text
                  x={pt.cx + 12} y={pt.cy + 4}
                  fill={pt.color} fontSize="13" fontWeight="bold"
                  animate={{ opacity: s === 8 ? 1 : 0 }}
                  transition={{ ...spring, delay: pt.delay + 0.1 }}
                >
                  {pt.word}
                </motion.text>
              </motion.g>
            ))}

            {/* Outlier — banana */}
            <motion.g>
              <motion.circle
                cx={380} cy={310} r="6"
                fill="#ef4444"
                animate={{ opacity: s === 8 ? 1 : 0, r: s === 8 ? 6 : 0 }}
                transition={{ ...spring, delay: 0.8 }}
              />
              <motion.circle
                cx={380} cy={310} r="12"
                fill="#ef4444" opacity={0.15}
                animate={{ opacity: s === 8 ? 0.15 : 0 }}
                transition={{ ...spring, delay: 0.8 }}
              />
              <motion.text
                x={392} y={315}
                fill="#ef4444" fontSize="13" fontWeight="bold"
                animate={{ opacity: s === 8 ? 1 : 0 }}
                transition={{ ...spring, delay: 0.9 }}
              >
                banana
              </motion.text>
              <motion.text
                x={392} y={332}
                fill="#ef4444" fontSize="10" opacity={0.5}
                animate={{ opacity: s === 8 ? 0.5 : 0 }}
                transition={{ ...spring, delay: 1 }}
              >
                (far from everything)
              </motion.text>
            </motion.g>
          </motion.svg>

          {/* Bottom legend */}
          <motion.div
            className="flex items-center justify-center gap-8 mt-2"
            animate={{ opacity: s === 8 ? 1 : 0 }}
            transition={{ ...spring, delay: 1.5 }}
          >
            <span className="text-xs text-accent-green">
              king ↔ queen = <strong>0.12</strong> (very close!)
            </span>
            <span className="text-xs text-white/20">|</span>
            <span className="text-xs text-red-400">
              king ↔ banana = <strong>4.7</strong> (very far)
            </span>
            <span className="text-xs text-white/20">|</span>
            <span className="text-xs text-white/40">
              Close in space = close in meaning
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== STEP 9: "The Famous Word Math" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8"
        animate={{ opacity: s === 9 ? 1 : 0 }}
        transition={smooth}
      >
        {/* Equation building — large and dramatic */}
        <div className="flex items-center gap-4 text-2xl font-bold mb-10">
          <motion.span
            className="px-5 py-3 rounded-xl bg-accent-blue/10 border-2 border-accent-blue/40 text-accent-blue text-4xl"
            animate={{ opacity: s === 9 ? 1 : 0, y: s === 9 ? 0 : 30 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            King
          </motion.span>
          <motion.span
            className="text-white/40 text-4xl"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.5 }}
          >
            −
          </motion.span>
          <motion.span
            className="px-5 py-3 rounded-xl bg-red-400/10 border-2 border-red-400/30 text-red-400 text-4xl"
            animate={{ opacity: s === 9 ? 1 : 0, y: s === 9 ? 0 : 30 }}
            transition={{ ...spring, delay: 0.7 }}
          >
            Man
          </motion.span>
          <motion.span
            className="text-white/40 text-4xl"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ ...spring, delay: 1 }}
          >
            +
          </motion.span>
          <motion.span
            className="px-5 py-3 rounded-xl bg-fuchsia-500/10 border-2 border-fuchsia-500/30 text-fuchsia-400 text-4xl"
            animate={{ opacity: s === 9 ? 1 : 0, y: s === 9 ? 0 : 30 }}
            transition={{ ...spring, delay: 1.2 }}
          >
            Woman
          </motion.span>
          <motion.span
            className="text-white/40 text-4xl"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ ...spring, delay: 1.5 }}
          >
            =
          </motion.span>
          <motion.span
            className="px-5 py-3 rounded-xl bg-accent-green/15 border-2 border-accent-green/50 text-accent-green text-4xl"
            style={{ textShadow: '0 0 30px rgba(74,222,128,0.5)' }}
            animate={{
              opacity: s === 9 ? 1 : 0,
              y: s === 9 ? 0 : 30,
              scale: s === 9 ? [1, 1.08, 1] : 0.8,
            }}
            transition={{
              ...spring,
              delay: 1.8,
              scale: { duration: 0.6, delay: 1.8 },
            }}
          >
            Queen!
          </motion.span>
        </div>

        {/* Large vector diagram */}
        <motion.svg
          viewBox="0 0 500 220"
          className="w-full max-w-xl"
          fill="none"
          animate={{ opacity: s === 9 ? 1 : 0 }}
          transition={{ ...spring, delay: 2 }}
        >
          {/* Origin dot */}
          <circle cx="60" cy="190" r="4" fill="rgba(255,255,255,0.3)" />
          <text x="45" y="210" fill="rgba(255,255,255,0.3)" fontSize="11">origin</text>

          {/* King vector — blue arrow */}
          <motion.line
            x1="60" y1="190" x2="220" y2="55"
            stroke="#4a9eff" strokeWidth={2.5}
            animate={{ pathLength: s === 9 ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 2.1 }}
          />
          <motion.polygon
            points="220,55 210,62 215,67"
            fill="#4a9eff"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ ...spring, delay: 2.3 }}
          />
          <motion.text
            x="130" y="105" fill="#4a9eff" fontSize="14" fontWeight="bold"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ ...spring, delay: 2.3 }}
          >
            King
          </motion.text>

          {/* Man vector — red arrow (short, same direction-ish) */}
          <motion.line
            x1="60" y1="190" x2="150" y2="130"
            stroke="#ef4444" strokeWidth={2} strokeDasharray="6 4"
            animate={{ pathLength: s === 9 ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 2.4 }}
          />
          <motion.text
            x="80" y="150" fill="#ef4444" fontSize="13" fontWeight="bold"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ ...spring, delay: 2.5 }}
          >
            Man
          </motion.text>

          {/* Gender difference arrow — pink dashed from King to Queen */}
          <motion.line
            x1="220" y1="55" x2="400" y2="50"
            stroke="#f472b6" strokeWidth={2} strokeDasharray="6 4"
            animate={{ pathLength: s === 9 ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 2.6 }}
          />
          <motion.polygon
            points="400,50 390,44 390,56"
            fill="#f472b6"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ ...spring, delay: 2.8 }}
          />
          <motion.text
            x="290" y="38" fill="#f472b6" fontSize="12" fontWeight="bold"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ ...spring, delay: 2.8 }}
          >
            + Woman − Man
          </motion.text>

          {/* Queen vector — green arrow (result) */}
          <motion.line
            x1="60" y1="190" x2="400" y2="50"
            stroke="#4ade80" strokeWidth={3}
            animate={{ pathLength: s === 9 ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 2.9 }}
          />
          <motion.polygon
            points="400,50 390,58 393,62"
            fill="#4ade80"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ ...spring, delay: 3.2 }}
          />

          {/* Queen label with glow */}
          <motion.g
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ ...spring, delay: 3.2 }}
          >
            <circle cx="400" cy="50" r="22" fill="#4ade8010" stroke="#4ade80" strokeWidth={2} />
            <text x="400" y="55" textAnchor="middle" fill="#4ade80" fontSize="14" fontWeight="bold">
              Queen
            </text>
          </motion.g>

          {/* Woman vector — fuchsia arrow */}
          <motion.line
            x1="60" y1="190" x2="180" y2="120"
            stroke="#d946ef" strokeWidth={2} strokeDasharray="6 4"
            animate={{ pathLength: s === 9 ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 2.5 }}
          />
          <motion.text
            x="100" y="170" fill="#d946ef" fontSize="13" fontWeight="bold"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ ...spring, delay: 2.6 }}
          >
            Woman
          </motion.text>
        </motion.svg>

        <motion.p
          className="text-white/30 text-sm font-medium mt-6"
          animate={{ opacity: s === 9 ? 1 : 0 }}
          transition={{ ...spring, delay: 3.5 }}
        >
          The model learned this from data alone — <span className="text-accent-green font-bold">no one programmed it</span>
        </motion.p>
      </motion.div>

      {/* ===== STEP 10: "Paying Attention" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 10 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-2">
          <span className="text-accent-blue font-bold">Attention:</span>{' '}
          each token looks at every other token to understand context
        </p>
        <p className="text-white/20 text-xs mb-8">
          &quot;France&quot; and &quot;capital&quot; attend strongly to each other
        </p>

        <div className="relative w-full max-w-lg">
          {/* Attention arcs */}
          <svg className="absolute -top-16 left-0 w-full h-16" viewBox="0 0 500 60" fill="none" preserveAspectRatio="xMidYMid meet">
            <motion.path
              d="M 350 55 C 350 15, 150 15, 150 55"
              stroke="#4a9eff"
              strokeWidth={3}
              fill="none"
              animate={s === 10 ? { strokeOpacity: [0.3, 0.9, 0.3] } : { strokeOpacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path
              d="M 350 55 C 350 30, 450 30, 450 55"
              stroke="#4a9eff"
              strokeWidth={1.5}
              fill="none"
              animate={s === 10 ? { strokeOpacity: [0.1, 0.4, 0.1] } : { strokeOpacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            <motion.path
              d="M 50 55 C 50 25, 150 25, 150 55"
              stroke="#4a9eff"
              strokeWidth={1}
              fill="none"
              animate={s === 10 ? { strokeOpacity: [0.05, 0.15, 0.05] } : { strokeOpacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            />
            <motion.path
              d="M 150 55 C 150 5, 350 5, 350 55"
              stroke="#a78bfa"
              strokeWidth={2.5}
              fill="none"
              animate={s === 10 ? { strokeOpacity: [0.2, 0.7, 0.2] } : { strokeOpacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
            <motion.path
              d="M 250 55 C 250 20, 350 20, 350 55"
              stroke="#4ade80"
              strokeWidth={1.5}
              fill="none"
              animate={s === 10 ? { strokeOpacity: [0.1, 0.35, 0.1] } : { strokeOpacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
            />
          </svg>

          <div className="flex items-center justify-between">
            {tokens.map((tok, i) => (
              <motion.div
                key={tok}
                className="px-4 py-3 rounded-lg border-2 font-mono text-sm font-bold text-center"
                style={{
                  borderColor: tokenColors[i],
                  color: tokenColors[i],
                  backgroundColor: `${tokenColors[i]}12`,
                }}
                animate={{
                  opacity: s === 10 ? 1 : 0,
                  y: s === 10 ? 0 : 15,
                  scale: s === 10 ? 1 : 0.8,
                }}
                transition={{ ...spring, delay: s === 10 ? i * 0.08 : 0 }}
              >
                {tok}
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-8 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] max-w-md"
          animate={{ opacity: s === 10 ? 1 : 0, y: s === 10 ? 0 : 15 }}
          transition={{ ...spring, delay: 0.6 }}
        >
          <p className="text-xs text-white/50 text-center">
            Thick lines = strong attention. <span className="text-accent-blue font-bold">&quot;France&quot;</span> and{' '}
            <span className="text-[#a78bfa] font-bold">&quot;capital&quot;</span> are strongly connected.
          </p>
        </motion.div>

        {/* Context determines meaning example */}
        <motion.div
          className="mt-5 w-full max-w-lg"
          animate={{ opacity: s === 10 ? 1 : 0, y: s === 10 ? 0 : 15 }}
          transition={{ ...spring, delay: 0.9 }}
        >
          <div className="flex gap-4">
            {/* Sentence 1 */}
            <div className="flex-1 rounded-xl border border-accent-blue/20 bg-accent-blue/[0.03] p-3 relative">
              <svg className="absolute -top-4 left-0 w-full h-5" viewBox="0 0 240 20" fill="none" preserveAspectRatio="xMidYMid meet">
                <motion.path
                  d="M 55 18 C 55 4, 200 4, 200 18"
                  stroke="#4a9eff"
                  strokeWidth={2.5}
                  fill="none"
                  animate={s === 10 ? { strokeOpacity: [0.3, 0.9, 0.3] } : { strokeOpacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
              </svg>
              <p className="text-xs font-mono text-white/60 text-center mt-1">
                The <span className="text-accent-blue font-bold">bank</span> by the <span className="text-accent-blue font-bold">river</span>
              </p>
              <p className="text-xs text-accent-blue/50 text-center mt-1">bank = riverbank</p>
            </div>

            {/* Sentence 2 */}
            <div className="flex-1 rounded-xl border border-accent-green/20 bg-accent-green/[0.03] p-3 relative">
              <svg className="absolute -top-4 left-0 w-full h-5" viewBox="0 0 240 20" fill="none" preserveAspectRatio="xMidYMid meet">
                <motion.path
                  d="M 40 18 C 40 6, 130 6, 130 18"
                  stroke="#4ade80"
                  strokeWidth={2.5}
                  fill="none"
                  animate={s === 10 ? { strokeOpacity: [0.3, 0.9, 0.3] } : { strokeOpacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.3 }}
                />
                <motion.path
                  d="M 40 18 C 40 2, 200 2, 200 18"
                  stroke="#4ade80"
                  strokeWidth={2}
                  fill="none"
                  animate={s === 10 ? { strokeOpacity: [0.2, 0.7, 0.2] } : { strokeOpacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                />
              </svg>
              <p className="text-xs font-mono text-white/60 text-center mt-1">
                The <span className="text-accent-green font-bold">bank</span> <span className="text-accent-green font-bold">approved</span> the <span className="text-accent-green font-bold">loan</span>
              </p>
              <p className="text-xs text-accent-green/50 text-center mt-1">bank = financial institution</p>
            </div>
          </div>
          <motion.p
            className="text-sm text-white/35 text-center mt-2 font-bold"
            animate={{ opacity: s === 10 ? 1 : 0 }}
            transition={{ ...spring, delay: 1.2 }}
          >
            Context determines meaning
          </motion.p>
        </motion.div>
      </motion.div>

      {/* ===== STEP 11: "The Neural Network" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4"
        animate={{ opacity: s === 11 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-2">
          Tokens flow through <span className="text-accent-blue font-bold">billions of neural network parameters</span>
        </p>
        <p className="text-white/20 text-xs mb-4">
          ...96 layers of math that extract meaning and patterns
        </p>

        <div className="relative w-full max-w-2xl">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
            {tokens.map((tok, i) => (
              <motion.div
                key={tok}
                className="flex items-center gap-1"
                animate={{ opacity: s === 11 ? 1 : 0, x: s === 11 ? 0 : -20 }}
                transition={{ ...spring, delay: s === 11 ? i * 0.08 : 0 }}
              >
                <span
                  className="px-2 py-1 rounded text-xs font-mono font-bold"
                  style={{ color: tokenColors[i], backgroundColor: `${tokenColors[i]}15` }}
                >
                  {tok}
                </span>
                <span className="text-white/30 text-xs">→</span>
              </motion.div>
            ))}
          </div>

          <svg width="100%" viewBox={`0 0 560 ${netH}`} className="mx-auto">
            {networkLayers.slice(0, -1).map((layer, li) => {
              const next = networkLayers[li + 1];
              const lines: JSX.Element[] = [];
              for (let ni = 0; ni < layer.nodes; ni++) {
                for (let nj = 0; nj < next.nodes; nj++) {
                  const y1 = nodeY(ni, layer.nodes, netH);
                  const y2 = nodeY(nj, next.nodes, netH);
                  lines.push(
                    <line
                      key={`l-${li}-${ni}-${nj}`}
                      x1={layer.cx} y1={y1} x2={next.cx} y2={y2}
                      stroke="#4a9eff"
                      strokeWidth={0.8}
                      strokeOpacity={0.08}
                      style={{
                        ['--layer' as string]: li,
                        animation: s === 11
                          ? `connectionWave 2.4s ${li * 0.6}s ease-in-out infinite`
                          : 'none',
                        ...(s !== 11 ? { strokeOpacity: 0 } : {}),
                      }}
                    />
                  );
                }
              }
              return lines;
            })}

            {networkLayers.map((layer, li) =>
              Array.from({ length: layer.nodes }).map((_, ni) => {
                const y = nodeY(ni, layer.nodes, netH);
                return (
                  <circle
                    key={`n-${li}-${ni}`}
                    cx={layer.cx} cy={y} r={8}
                    fill="#4a9eff"
                    stroke="#4a9eff"
                    strokeWidth={1.5}
                    fillOpacity={0.12}
                    strokeOpacity={0.25}
                    style={{
                      ['--layer' as string]: li,
                      animation: s === 11
                        ? `nodeWave 2.4s ${li * 0.6 + ni * 0.05}s ease-in-out infinite`
                        : 'none',
                      ...(s !== 11 ? { fillOpacity: 0, strokeOpacity: 0 } : {}),
                    }}
                  />
                );
              })
            )}

            {['Input\nLayer', 'Hidden 1', 'Hidden 2', 'Hidden 3', 'Output\nLayer'].map((label, i) => (
              <text
                key={label}
                x={networkLayers[i].cx}
                y={netH - 5}
                fill="white"
                fillOpacity={s === 11 ? 0.2 : 0}
                textAnchor="middle"
                fontSize={9}
              >
                {label.split('\n').map((line, j) => (
                  <tspan key={j} x={networkLayers[i].cx} dy={j === 0 ? 0 : 11}>
                    {line}
                  </tspan>
                ))}
              </text>
            ))}

            <g opacity={s === 11 ? 0.3 : 0}>
              <line x1={100} y1={netH + 15} x2={460} y2={netH + 15} stroke="white" strokeWidth={1} strokeDasharray="4 4" />
              <polygon points="462,11 472,15 462,19" fill="white" transform={`translate(0, ${netH})`} />
              <text x={280} y={netH + 28} fill="white" fillOpacity={0.4} textAnchor="middle" fontSize={10}>
                Data flows left → right through layers
              </text>
            </g>
          </svg>

          {/* Animated parameter counter */}
          <motion.div
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10"
            animate={{ opacity: s === 11 ? 1 : 0, x: s === 11 ? 0 : 20 }}
            transition={{ ...spring, delay: 0.8 }}
          >
            <div className="px-3 py-2 rounded-lg border border-accent-blue/20 bg-accent-blue/5 text-center">
              <p className="text-sm text-white/30">Parameters</p>
              <p className="text-sm font-mono font-bold text-accent-blue">175B+</p>
            </div>
          </motion.div>

          {/* Layer labels */}
          <motion.div
            className="flex justify-between px-8 mt-1"
            animate={{ opacity: s === 11 ? 1 : 0, y: s === 11 ? 0 : 10 }}
            transition={{ ...spring, delay: 1 }}
          >
            <div className="text-center">
              <p className="text-xs font-bold text-accent-blue/70">Layers 1-10</p>
              <p className="text-xs text-white/30">Grammar</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-[#a78bfa]/70">Layers 20-50</p>
              <p className="text-xs text-white/30">Meaning</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-accent-green/70">Layers 60-96</p>
              <p className="text-xs text-white/30">Reasoning</p>
            </div>
          </motion.div>
        </div>

        {/* Parameter comparison */}
        <motion.div
          className="mt-3 px-4 py-2 rounded-lg border border-accent-blue/20 bg-accent-blue/[0.03]"
          animate={{ opacity: s === 11 ? 1 : 0, y: s === 11 ? 0 : 10 }}
          transition={{ ...spring, delay: 1.2 }}
        >
          <p className="text-xs text-white/50 text-center">
            GPT-4: <span className="text-accent-blue font-mono font-bold">175B+ parameters</span>
            <span className="text-white/20 mx-2">|</span>
            Each parameter = one tiny number, adjusted during training
          </p>
        </motion.div>
      </motion.div>

      {/* ===== STEP 12: "The Prediction" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8"
        animate={{ opacity: s === 12 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-2">
          The network scores <span className="text-accent-green font-bold">every possible next token</span>
        </p>
        <p className="text-white/20 text-xs mb-6">
          &quot;The capital of France is ___&quot; → 100,000+ words scored
        </p>

        <div className="w-full max-w-md">
          {probabilities.map((p, i) => (
            <motion.div
              key={p.label}
              className="flex items-center gap-3 mb-3"
              animate={{
                opacity: s === 12 ? 1 : 0,
                x: s === 12 ? 0 : 30,
              }}
              transition={{ ...spring, delay: s === 12 ? i * 0.1 : 0 }}
            >
              <span className="w-20 text-right text-sm font-mono text-white/70 font-bold">
                {p.label}
              </span>
              <div className="flex-1 bg-white/5 rounded-full h-8 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full flex items-center px-3 relative"
                  style={{ backgroundColor: `${p.color}30` }}
                  animate={{ width: s === 12 ? `${p.pct}%` : '0%' }}
                  transition={{ ...spring, delay: s === 12 ? 0.3 + i * 0.08 : 0 }}
                >
                  <span className="text-xs font-bold" style={{ color: p.color }}>
                    {p.pct}%
                  </span>
                </motion.div>
              </div>
              {i === 0 && (
                <motion.span
                  className="text-xs px-2 py-1 rounded-full bg-accent-green/15 border border-accent-green/30 text-accent-green font-bold"
                  animate={{ opacity: s === 12 ? 1 : 0, scale: s === 12 ? 1 : 0.5 }}
                  transition={{ ...spring, delay: 0.8 }}
                >
                  winner
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ===== STEP 13: "One Token at a Time" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 13 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-1">
          <span className="text-accent-green font-bold">Autoregressive generation:</span>{' '}
          output becomes the next input
        </p>
        <p className="text-white/20 text-xs mb-4">
          That streaming effect you see in ChatGPT? This is why.
        </p>

        <p className="text-white/30 text-xs mb-3 font-mono">
          Iteration {autoIdx + 1} / {autoSteps.length}
        </p>

        <div className="relative w-full max-w-2xl h-28 flex items-center justify-center">
          {/* INPUT BOX */}
          <div className="absolute left-0 w-[38%] h-20 rounded-xl border border-blue-500/30 bg-blue-500/5 flex flex-col items-center justify-center px-3">
            <p className="text-sm text-blue-400/50 mb-1 font-bold uppercase tracking-wider">Input</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={`input-${autoIdx}`}
                className="flex flex-wrap items-center justify-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {autoSteps[autoIdx].input.map((tok, j) => (
                  <span key={j} className="text-xs font-mono text-white/50">{tok}</span>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            className="absolute left-[38%] w-[6%] flex items-center justify-center"
            animate={{ opacity: autoPhase >= 1 ? 0.6 : 0.2 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-white/40 text-lg">→</span>
          </motion.div>

          <motion.div
            className="absolute left-[44%] w-[12%] h-16 rounded-xl border flex items-center justify-center"
            animate={{
              borderColor: autoPhase === 1 ? 'rgba(167,139,250,0.8)' : 'rgba(167,139,250,0.3)',
              backgroundColor: autoPhase === 1 ? 'rgba(167,139,250,0.15)' : 'rgba(167,139,250,0.05)',
              scale: autoPhase === 1 ? 1.05 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-bold text-[#a78bfa]">LLM</span>
          </motion.div>

          <motion.div
            className="absolute left-[56%] w-[6%] flex items-center justify-center"
            animate={{ opacity: autoPhase >= 2 ? 0.6 : 0.2 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-white/40 text-lg">→</span>
          </motion.div>

          <div className="absolute right-0 w-[38%] h-20 rounded-xl border border-green-500/30 bg-green-500/5 flex flex-col items-center justify-center px-3">
            <p className="text-sm text-green-400/50 mb-1 font-bold uppercase tracking-wider">Output</p>
            <AnimatePresence mode="wait">
              {autoPhase >= 2 && autoPhase < 3 && (
                <motion.span
                  key={`out-${autoIdx}`}
                  className="px-3 py-1 rounded-lg bg-accent-green/20 text-accent-green font-mono font-bold text-lg"
                  style={{ textShadow: '0 0 12px rgba(74,222,128,0.5)' }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {autoSteps[autoIdx].output}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {autoPhase === 3 && (
              <motion.span
                key={`fly-${autoIdx}`}
                className="absolute px-3 py-1 rounded-lg bg-accent-green/25 text-accent-green font-mono font-bold text-sm border border-accent-green/40 z-20"
                style={{ textShadow: '0 0 10px rgba(74,222,128,0.6)' }}
                initial={{ right: '19%', top: '50%', y: '-50%' }}
                animate={{ right: '81%', top: '80%', scale: 0.85 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              >
                {autoSteps[autoIdx].output}
              </motion.span>
            )}
          </AnimatePresence>

          <svg className="absolute -bottom-2 left-[10%] w-[80%] h-8" viewBox="0 0 400 30" fill="none">
            <path
              d="M 360 2 C 360 25, 40 25, 40 2"
              stroke="#4ade80"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              opacity={0.3}
              style={{ animation: s === 13 ? 'dashFlow 1.2s linear infinite' : 'none' }}
            />
            <polygon points="38,2 42,2 40,7" fill="#4ade80" opacity={0.4} />
          </svg>
        </div>

        <div className="mt-6 px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] min-w-[300px]">
          <p className="text-sm text-white/25 mb-1 uppercase tracking-wider">Generated so far:</p>
          <p className="font-mono text-sm">
            <span className="text-white/35">The capital of France is </span>
            {completedTokens.map((tok, i) => (
              <span key={i}>
                <span className="text-accent-green font-bold" style={{ textShadow: '0 0 6px rgba(74,222,128,0.3)' }}>
                  {tok}
                </span>
                {i < completedTokens.length - 1 ? ' ' : ''}
              </span>
            ))}
            {autoPhase >= 2 && (
              <motion.span
                className="text-accent-green font-bold"
                style={{ textShadow: '0 0 6px rgba(74,222,128,0.3)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {completedTokens.length > 0 ? ' ' : ''}{autoSteps[autoIdx].output}
              </motion.span>
            )}
            <motion.span
              className="text-white/20"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              ▌
            </motion.span>
          </p>
        </div>
      </motion.div>

      {/* ===== STEP 14: "Temperature: The Creativity Dial" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8"
        animate={{ opacity: s === 14 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-2">
          <span className="text-accent-blue font-bold">Temperature</span> — the creativity dial
        </p>

        {/* Thermometer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tempIdx}
            className="mb-4 flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Visual thermometer */}
            <div className="w-4 h-16 rounded-full border border-white/20 bg-white/5 relative overflow-hidden">
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-full"
                style={{ backgroundColor: tempStates[tempIdx].thermColor }}
                animate={{ height: `${(tempIdx + 1) * 33}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="px-4 py-2 rounded-full border border-accent-blue/30 bg-accent-blue/10">
              <span className="text-sm font-mono font-bold text-accent-blue">
                {tempStates[tempIdx].label}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="w-full max-w-md mb-4">
          {probabilities.map((p, i) => (
            <div key={p.label} className="flex items-center gap-3 mb-2">
              <span className="w-20 text-right text-sm font-mono text-white/70 font-bold">
                {p.label}
              </span>
              <div className="flex-1 bg-white/5 rounded-full h-7 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full flex items-center px-3 relative"
                  style={{ backgroundColor: `${p.color}30` }}
                  animate={{ width: s === 14 ? `${tempStates[tempIdx].bars[i]}%` : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  {tempStates[tempIdx].bars[i] > 0 && (
                    <span className="text-sm font-bold" style={{ color: p.color }}>
                      {tempStates[tempIdx].bars[i]}%
                    </span>
                  )}
                </motion.div>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={tempIdx}
            className="text-xs text-white/40 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tempStates[tempIdx].desc}
          </motion.p>
        </AnimatePresence>

        <div className="flex gap-2">
          {tempStates.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i === tempIdx ? '#4a9eff' : 'rgba(255,255,255,0.15)' }}
            />
          ))}
        </div>
      </motion.div>

      {/* ===== STEP 15: "Training: Reading the Internet" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 15 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-2">
          <span className="text-accent-blue font-bold">Training:</span>{' '}
          reading the internet to learn patterns
        </p>
        <p className="text-white/20 text-xs mb-8">
          Learning to predict the next token, over and over, on massive data
        </p>

        <div className="relative flex items-center gap-8">
          <div className="flex flex-col gap-3">
            {trainingSources.map((src, i) => (
              <motion.div
                key={src.label}
                className="flex items-center gap-3 px-4 py-2 rounded-lg border border-white/10 bg-white/[0.03]"
                animate={{
                  opacity: s === 15 ? 1 : 0,
                  x: s === 15 ? 0 : -40,
                }}
                transition={{ ...spring, delay: s === 15 ? i * 0.15 : 0 }}
              >
                <span className="text-xl">{src.icon}</span>
                <span className="text-xs text-white/60">{src.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="flex flex-col items-center gap-1"
            animate={{ opacity: s === 15 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.5 }}
          >
            {trainingSources.map((_, i) => (
              <span key={i} className="text-white/30 text-2xl">→</span>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-3 px-8 py-6 rounded-xl border-2 border-accent-blue/30 bg-accent-blue/[0.05]"
            animate={{
              opacity: s === 15 ? 1 : 0,
              scale: s === 15 ? 1 : 0.9,
            }}
            transition={{ ...spring, delay: 0.4 }}
          >
            <span className="text-4xl font-bold text-accent-blue">LLM</span>
            <motion.div
              className="text-sm text-white/30 text-center"
              animate={{ opacity: s === 15 ? 1 : 0 }}
              transition={{ ...spring, delay: 0.8 }}
            >
              <p>Billions of parameters</p>
              <p>adjusted over weeks</p>
              <p>on thousands of GPUs</p>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="mt-6 px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03]"
          animate={{ opacity: s === 15 ? 1 : 0, y: s === 15 ? 0 : 15 }}
          transition={{ ...spring, delay: 0.9 }}
        >
          <p className="text-sm text-white/50 text-center">
            Trained on <span className="text-accent-blue font-bold font-mono">~15 trillion tokens</span> of text
          </p>
        </motion.div>

        {/* Scale comparisons */}
        <motion.div
          className="mt-4 w-full max-w-lg space-y-2"
          animate={{ opacity: s === 15 ? 1 : 0, y: s === 15 ? 0 : 10 }}
          transition={{ ...spring, delay: 1.1 }}
        >
          <div className="flex gap-3">
            <div className="flex-1 px-4 py-2.5 rounded-lg border border-[#fbbf24]/20 bg-[#fbbf24]/[0.03]">
              <p className="text-sm text-[#fbbf24]/70 font-bold mb-0.5">Human Scale</p>
              <p className="text-sm text-white/40">
                If you read 1 book/day, it would take <span className="text-[#fbbf24] font-bold font-mono">41,000 years</span> to match GPT-4&apos;s training data
              </p>
            </div>
            <div className="flex-1 px-4 py-2.5 rounded-lg border border-[#f472b6]/20 bg-[#f472b6]/[0.03]">
              <p className="text-sm text-[#f472b6]/70 font-bold mb-0.5">Training Cost</p>
              <p className="text-sm text-white/40">
                <span className="text-[#f472b6] font-bold font-mono">~$100M+</span> and <span className="text-[#f472b6] font-bold font-mono">25,000 GPUs</span> running for months
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ===== STEP 16: "What Training Looks Like" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 16 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-6">
          Training = predicting the next word, <span className="text-accent-blue font-bold">trillions of times</span>
        </p>

        <div className="w-full max-w-lg space-y-3">
          {trainingExamples.map((ex, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-white/[0.03]"
              style={{
                borderColor: ex.isRight ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)',
              }}
              animate={{
                opacity: s === 16 ? 1 : 0,
                x: s === 16 ? 0 : -20,
              }}
              transition={{ ...spring, delay: s === 16 ? i * 0.15 : 0 }}
            >
              <span className="text-xs font-mono text-white/50 flex-1">
                {ex.input} <span className="text-white/20">→</span>{' '}
                <span
                  className="font-bold"
                  style={{ color: ex.isRight ? '#4ade80' : '#ef4444' }}
                >
                  {ex.predicted}
                </span>
              </span>
              <span className="text-lg">{ex.isRight ? '✓' : '✗'}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-4 px-4 py-2 rounded-lg border border-red-500/20 bg-red-500/5"
          animate={{
            opacity: s === 16 ? 1 : 0,
            scale: s === 16 ? 1.02 : 1,
          }}
          transition={{ ...spring, delay: 0.8 }}
        >
          <p className="text-xs text-red-400/70">
            Wrong prediction → <span className="font-bold">adjust parameters!</span>
          </p>
        </motion.div>

        <motion.p
          className="text-white/30 text-sm font-medium mt-4"
          animate={{ opacity: s === 16 ? 1 : 0 }}
          transition={{ ...spring, delay: 1 }}
        >
          Grammar, facts, reasoning — all learned from next-word prediction
        </motion.p>
      </motion.div>

      {/* ===== STEP 17: "The Context Window" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 17 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-2">
          The model has a fixed-size <span className="text-accent-blue font-bold">context window</span>
        </p>
        <p className="text-white/20 text-xs mb-8">
          It can only see a limited number of tokens at once
        </p>

        <div className="relative w-full max-w-2xl h-20 mb-6">
          <div className="absolute inset-0 flex items-center overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => {
              const inWindow = i >= windowOffset + 5 && i < windowOffset + 15;
              return (
                <motion.div
                  key={i}
                  className="flex-shrink-0 w-[3.33%] h-10 mx-[1px] rounded flex items-center justify-center text-xs font-mono"
                  animate={{
                    backgroundColor: inWindow ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.03)',
                    borderColor: inWindow ? 'rgba(74,158,255,0.4)' : 'rgba(255,255,255,0.08)',
                    opacity: s === 17 ? (inWindow ? 1 : 0.3) : 0,
                  }}
                  style={{ border: '1px solid' }}
                  transition={{ duration: 0.3 }}
                >
                  <span className={inWindow ? 'text-accent-blue/70' : 'text-white/15'}>
                    tok
                  </span>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="absolute top-0 h-full border-2 border-accent-blue/50 rounded-lg pointer-events-none"
            animate={{
              left: s === 17 ? `${(windowOffset + 5) * 3.33 + windowOffset * 0.1}%` : '16.65%',
              width: '33.3%',
              opacity: s === 17 ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-accent-blue/20 border border-accent-blue/30">
              <span className="text-xs font-bold text-accent-blue">CONTEXT WINDOW</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="flex gap-4 mb-6"
          animate={{ opacity: s === 17 ? 1 : 0, y: s === 17 ? 0 : 15 }}
          transition={{ ...spring, delay: 0.5 }}
        >
          {[
            { model: 'GPT-4', tokens: '128K', pages: '~300 pages' },
            { model: 'Claude', tokens: '200K', pages: '~500 pages' },
          ].map((m) => (
            <div
              key={m.model}
              className="px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-center"
            >
              <p className="text-xs font-bold text-white/60">{m.model}</p>
              <p className="text-lg font-mono font-bold text-accent-blue">{m.tokens}</p>
              <p className="text-sm text-white/30">{m.pages}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ===== STEP 18: "No Memory Between Conversations" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 18 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-6">
          LLMs have <span className="text-red-400 font-bold">NO memory</span> between conversations
        </p>

        <div className="flex gap-6 w-full max-w-lg">
          {/* Chat 1 */}
          <motion.div
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            animate={{ opacity: s === 18 ? 1 : 0, x: s === 18 ? 0 : -20 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <p className="text-sm text-white/30 uppercase mb-3">Chat 1</p>
            <div className="space-y-2">
              <div className="bg-accent-blue/10 rounded-lg px-3 py-2">
                <p className="text-xs text-white/60">&quot;My name is Alex&quot;</p>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-xs text-white/50">&quot;Nice to meet you, Alex!&quot;</p>
              </div>
            </div>
          </motion.div>

          {/* Chat 2 */}
          <motion.div
            className="flex-1 rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4"
            animate={{ opacity: s === 18 ? 1 : 0, x: s === 18 ? 0 : 20 }}
            transition={{ ...spring, delay: 0.4 }}
          >
            <p className="text-sm text-white/30 uppercase mb-3">Chat 2 (new session)</p>
            <div className="space-y-2">
              <div className="bg-accent-blue/10 rounded-lg px-3 py-2">
                <p className="text-xs text-white/60">&quot;What&apos;s my name?&quot;</p>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-xs text-white/50">&quot;I don&apos;t know your name.&quot;</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FORGOTTEN stamp */}
        <motion.div
          className="mt-6 px-6 py-2 rounded-lg border-2 border-red-500/40 bg-red-500/10"
          animate={{
            opacity: s === 18 ? 1 : 0,
            scale: s === 18 ? 1.05 : 0.8,
            rotate: s === 18 ? -2 : 0,
          }}
          transition={{ ...spring, delay: 0.7 }}
        >
          <p className="text-sm font-bold text-red-400 uppercase tracking-wider">
            FORGOTTEN
          </p>
        </motion.div>

        <motion.p
          className="text-white/30 text-sm font-medium mt-4"
          animate={{ opacity: s === 18 ? 1 : 0 }}
          transition={{ ...spring, delay: 1 }}
        >
          Each conversation starts completely fresh — no persistent memory
        </motion.p>
      </motion.div>

      {/* ===== STEP 19: "The Full Pipeline" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4"
        animate={{ opacity: s === 19 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-6">
          The complete journey from <span className="text-accent-blue font-bold">question</span> to <span className="text-accent-green font-bold">answer</span>
        </p>

        {/* Horizontal pipeline */}
        <div className="flex items-center gap-1 mb-6">
          {pipelineStages.map((stage, i) => (
            <div key={stage.label} className="flex items-center">
              <motion.div
                className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl border"
                style={{
                  borderColor: `${stage.color}${pipelinePulse === i ? '80' : '30'}`,
                  backgroundColor: `${stage.color}${pipelinePulse === i ? '20' : '08'}`,
                }}
                animate={{
                  opacity: s === 19 ? 1 : 0,
                  y: s === 19 ? 0 : 15,
                  scale: pipelinePulse === i ? 1.08 : 1,
                }}
                transition={{ ...spring, delay: s === 19 ? i * 0.1 : 0 }}
              >
                <span className="text-lg">{stage.icon}</span>
                <span className="text-xs font-bold" style={{ color: stage.color }}>
                  {stage.label}
                </span>
              </motion.div>
              {i < pipelineStages.length - 1 && (
                <motion.span
                  className="text-white/20 text-xs mx-0.5"
                  animate={{
                    opacity: s === 19 ? (pipelinePulse === i ? 0.8 : 0.3) : 0,
                    color: pipelinePulse === i ? stage.color : 'rgba(255,255,255,0.2)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  →
                </motion.span>
              )}
            </div>
          ))}
        </div>

        {/* Loop arrow */}
        <motion.div
          className="flex items-center gap-2 text-accent-green/40"
          animate={{ opacity: s === 19 ? 1 : 0 }}
          transition={{ ...spring, delay: 0.8 }}
        >
          <span className="text-xs">↻ Loop back for next token</span>
        </motion.div>
      </motion.div>

      {/* ===== STEP 20: "Just Autocomplete? Kind of." ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8"
        animate={{ opacity: s === 20 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-6">
          Think of it as <span className="text-accent-blue font-bold">&quot;autocomplete on steroids&quot;</span>
        </p>
        <div className="grid grid-cols-2 gap-6 w-full max-w-2xl mb-5">
          {/* LEFT: Phone keyboard */}
          <motion.div
            className="rounded-xl border border-white/10 p-5 bg-white/[0.03]"
            animate={{ opacity: s === 20 ? 1 : 0, x: s === 20 ? 0 : -30 }}
            transition={{ ...spring, delay: 0.15 }}
          >
            <h3 className="text-sm font-bold text-white/60 mb-3">Phone Keyboard</h3>
            <div className="bg-white/[0.03] rounded-lg p-3 mb-3 border border-white/5">
              <p className="text-sm text-white/70 font-mono">I&apos;m going to the...</p>
            </div>
            <div className="flex gap-2 mb-2">
              {['store', 'gym', 'park'].map((w) => (
                <span key={w} className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-white/50 border border-white/5">{w}</span>
              ))}
            </div>
            <p className="text-sm text-white/25 mt-2">3 boring suggestions. That&apos;s it.</p>
          </motion.div>

          {/* RIGHT: LLM */}
          <motion.div
            className="rounded-xl border-2 border-accent-blue/30 p-5 bg-accent-blue/[0.03]"
            animate={{ opacity: s === 20 ? 1 : 0, x: s === 20 ? 0 : 30 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <h3 className="text-sm font-bold text-accent-blue mb-3">Large Language Model</h3>
            <div className="bg-white/[0.03] rounded-lg p-3 mb-3 border border-accent-blue/10">
              <p className="text-sm text-white/70 font-mono">Explain quantum physics like I&apos;m 5</p>
            </div>
            <div className="text-sm text-white/50 bg-accent-blue/[0.03] rounded-lg p-3 border border-accent-blue/10 leading-relaxed">
              Imagine everything is made of tiny tiny balls. These balls are so small you can&apos;t see them. Sometimes they act like magic...
            </div>
            <p className="text-sm text-accent-blue/50 mt-2">Full coherent paragraphs, on any topic</p>
          </motion.div>
        </div>

        {/* BOTTOM: Scale comparison */}
        <motion.div
          className="px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] max-w-2xl w-full"
          animate={{ opacity: s === 20 ? 1 : 0, y: s === 20 ? 0 : 15 }}
          transition={{ ...spring, delay: 0.6 }}
        >
          <p className="text-sm text-white/60 text-center font-bold">
            Same principle.{' '}
            <span className="text-accent-blue font-mono">10,000x</span> more data.{' '}
            <span className="text-[#a78bfa] font-mono">1,000,000x</span> more parameters.
          </p>
        </motion.div>
      </motion.div>

      {/* ===== STEP 21: "What LLMs Can and Can't Do" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 21 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-6">Know the capabilities AND the limits</p>

        <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
          {/* CAN */}
          <motion.div
            className="rounded-xl border border-green-500/20 bg-green-500/[0.03] p-4"
            animate={{ opacity: s === 21 ? 1 : 0, x: s === 21 ? 0 : -20 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <p className="text-sm font-bold text-accent-green mb-3">CAN</p>
            {['Write & summarize text', 'Reason about problems', 'Write & debug code', 'Understand context'].map((item, i) => (
              <motion.div
                key={item}
                className="flex items-center gap-2 mb-2"
                animate={{ opacity: s === 21 ? 1 : 0, x: s === 21 ? 0 : -10 }}
                transition={{ ...spring, delay: s === 21 ? 0.3 + i * 0.1 : 0 }}
              >
                <span className="text-accent-green text-xs">✓</span>
                <span className="text-xs text-white/60">{item}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CAN'T */}
          <motion.div
            className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4"
            animate={{ opacity: s === 21 ? 1 : 0, x: s === 21 ? 0 : 20 }}
            transition={{ ...spring, delay: 0.35 }}
          >
            <p className="text-sm font-bold text-red-400 mb-3">CAN&apos;T</p>
            {['Browse the internet live', 'Remember past conversations', 'Guarantee factual accuracy', 'Learn from your conversations'].map((item, i) => (
              <motion.div
                key={item}
                className="flex items-center gap-2 mb-2"
                animate={{ opacity: s === 21 ? 1 : 0, x: s === 21 ? 0 : 10 }}
                transition={{ ...spring, delay: s === 21 ? 0.45 + i * 0.1 : 0 }}
              >
                <span className="text-red-400 text-xs">✗</span>
                <span className="text-xs text-white/60">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ===== STEP 22: "Key Takeaways" ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: s === 22 ? 1 : 0 }}
        transition={smooth}
      >
        <div className="text-center max-w-xl w-full px-6">
          <motion.h2
            className="text-5xl font-bold text-white mb-8"
            animate={{ opacity: s === 22 ? 1 : 0, y: s === 22 ? 0 : 15 }}
            transition={spring}
          >
            Key Takeaways
          </motion.h2>
          {[
            { icon: '🔮', text: 'LLMs predict the next token, one at a time', color: '#4a9eff' },
            { icon: '✂️', text: 'Tokens are the unit of input, output, and cost', color: '#a78bfa' },
            { icon: '📐', text: 'Embeddings capture meaning as numbers in space', color: '#4ade80' },
            { icon: '🔗', text: 'Attention connects related words across the context', color: '#fbbf24' },
            { icon: '🌡️', text: 'Temperature controls creativity vs. predictability', color: '#f472b6' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4 mb-4 px-6 py-4 rounded-xl bg-white/5 border text-left"
              style={{ borderColor: `${item.color}20` }}
              animate={{
                opacity: s === 22 ? 1 : 0,
                y: s === 22 ? 0 : 20,
              }}
              transition={{ ...spring, delay: s === 22 ? i * 0.15 : 0 }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white/80 text-base font-medium">{item.text}</span>
            </motion.div>
          ))}
          <motion.p
            className="text-white/30 text-xs mt-6"
            animate={{ opacity: s === 22 ? 1 : 0 }}
            transition={{ ...spring, delay: 1 }}
          >
            Now you know what powers ChatGPT, Claude, Gemini, and Llama!
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
