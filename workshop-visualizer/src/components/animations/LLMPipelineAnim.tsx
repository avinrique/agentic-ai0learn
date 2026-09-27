'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useConceptStore } from '@/stores/conceptStore';
import LLMTokenPlayground from './playgrounds/LLMTokenPlayground';
import LLMMeaningPlayground from './playgrounds/LLMMeaningPlayground';

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

// Extra examples for the "tokenize" scene. IDs are illustrative; every tokenizer has its own numbering.
// A leading "·" marks a space that belongs to the token.
const tokenizeExamples = [
  { text: 'The capital of France is', pieces: ['The', '·capital', '·of', '·France', '·is'], ids: tokenIds },
  { text: 'Hello, world!', pieces: ['Hello', ',', '·world', '!'], ids: [15496, 11, 995, 0] },
  { text: 'Unbelievably fast', pieces: ['Un', 'believ', 'ably', '·fast'], ids: [3118, 6667, 1346, 3049] },
  { text: 'ChatGPT is fun', pieces: ['Chat', 'G', 'PT', '·is', '·fun'], ids: [30820, 38, 11571, 318, 1257] },
];

// Extra examples for the "attention" scene: one ambiguous word, two sentences.
const attentionExamples = [
  {
    word: 'bank',
    a: { words: ['The', 'bank', 'by', 'the', 'river'], target: 1, context: [4], meaning: 'bank = riverbank' },
    b: { words: ['The', 'bank', 'approved', 'the', 'loan'], target: 1, context: [2, 4], meaning: 'bank = a money business' },
  },
  {
    word: 'bat',
    a: { words: ['The', 'bat', 'flew', 'out', 'of', 'the', 'cave'], target: 1, context: [2, 6], meaning: 'bat = the animal' },
    b: { words: ['He', 'swung', 'the', 'bat', 'at', 'the', 'ball'], target: 3, context: [1, 6], meaning: 'bat = a baseball bat' },
  },
  {
    word: 'apple',
    a: { words: ['I', 'ate', 'a', 'crunchy', 'apple'], target: 4, context: [1, 3], meaning: 'apple = the fruit' },
    b: { words: ['Apple', 'released', 'a', 'new', 'iPhone'], target: 0, context: [1, 4], meaning: 'Apple = the company' },
  },
  {
    word: 'light',
    a: { words: ['Turn', 'on', 'the', 'light'], target: 3, context: [0, 1], meaning: 'light = a lamp' },
    b: { words: ['The', 'bag', 'is', 'very', 'light'], target: 4, context: [1, 3], meaning: 'light = not heavy' },
  },
];

// Extra examples for the "prediction" scene (illustrative numbers, not from a real model).
const predictionExamples = [
  { prompt: 'The capital of France is', bars: probabilities },
  {
    prompt: 'The cat sat on the',
    bars: [
      { label: 'mat', pct: 41, color: '#4ade80' },
      { label: 'floor', pct: 18, color: '#fbbf24' },
      { label: 'couch', pct: 12, color: '#a78bfa' },
      { label: 'bed', pct: 9, color: '#f472b6' },
      { label: 'roof', pct: 5, color: '#4a9eff' },
    ],
  },
  {
    prompt: '2 + 2 =',
    bars: [
      { label: '4', pct: 96, color: '#4ade80' },
      { label: 'four', pct: 2, color: '#fbbf24' },
      { label: '5', pct: 0.5, color: '#a78bfa' },
      { label: '?', pct: 0.5, color: '#f472b6' },
      { label: '22', pct: 0.3, color: '#4a9eff' },
    ],
  },
  {
    prompt: 'My favourite colour is',
    bars: [
      { label: 'blue', pct: 34, color: '#4ade80' },
      { label: 'green', pct: 19, color: '#fbbf24' },
      { label: 'purple', pct: 15, color: '#a78bfa' },
      { label: 'red', pct: 13, color: '#f472b6' },
      { label: 'black', pct: 6, color: '#4a9eff' },
    ],
  },
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

// Step 17: a short chat, word by word. The window holds only the last CW_SIZE tokens.
const CW_TOKENS = ['My', 'name', 'is', 'Alex.', 'I', 'love', 'pizza', 'and', 'long', 'walks.', 'Plan', 'my', 'party!', 'What', 'is', 'my', 'name?'];
const CW_SIZE = 8;
const CW_OFF = 3; // token slots shown to the left of the window
const CW_STEP = 70; // px per token slot

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

const chipPalette = ['#4a9eff', '#a78bfa', '#4ade80', '#fbbf24', '#f472b6'];

/** Small row of example chips. Only clickable while its scene is visible. */
function ExampleChips({ labels, value, onChange, active }: {
  labels: string[];
  value: number;
  onChange: (i: number) => void;
  active: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${active ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <span className="text-xs text-white/35 mr-1">Try:</span>
      {labels.map((label, i) => (
        <motion.button
          key={label}
          onClick={() => onChange(i)}
          tabIndex={active ? 0 : -1}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-1 rounded-full border text-xs font-mono transition-colors"
          style={i === value
            ? { borderColor: chipPalette[i % chipPalette.length], color: chipPalette[i % chipPalette.length], backgroundColor: `${chipPalette[i % chipPalette.length]}20` }
            : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.04)' }}
        >
          {label}
        </motion.button>
      ))}
    </div>
  );
}

export default function LLMPipelineAnim() {
  const { currentStep, steps } = useConceptStore();
  const s = currentStep;
  const trigger = steps[s]?.animationTrigger;

  // Example pickers inside a few scenes (tokenize, attention, prediction)
  const [tokEx, setTokEx] = useState(0);
  const [attEx, setAttEx] = useState(0);
  const [predEx, setPredEx] = useState(0);

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

  // Step 17: tokens arrive one by one; the window keeps only the last CW_SIZE
  useEffect(() => {
    if (s !== 17) { setWindowOffset(0); return; }
    const timer = setInterval(() => {
      setWindowOffset((prev) => (prev + 1) % (CW_TOKENS.length + 8));
    }, 450);
    return () => clearInterval(timer);
  }, [s]);
  const cwShown = Math.min(windowOffset, CW_TOKENS.length);
  const cwStart = Math.max(0, cwShown - CW_SIZE);

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
        {/* The questions this lesson answers */}
        <div className="flex flex-wrap justify-center gap-2 mt-3 px-6">
          {['How does it understand?', 'Where does it learn?', 'Why is it so good?'].map((q, i) => (
            <motion.span
              key={q}
              className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-sm text-white/45"
              animate={{ opacity: s === 3 ? 1 : 0, y: s === 3 ? 0 : 8 }}
              transition={{ ...spring, delay: s === 3 ? 0.5 + i * 0.15 : 0 }}
            >
              {q}
            </motion.span>
          ))}
        </div>
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
        <div className="mb-4">
          <ExampleChips
            labels={tokenizeExamples.map((e) => e.text)}
            value={tokEx}
            onChange={setTokEx}
            active={s === 5}
          />
        </div>
        <motion.p
          key={`tok-text-${tokEx}`}
          className="text-2xl font-mono text-white/30 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: s === 5 ? 0.3 : 0 }}
          transition={smooth}
        >
          &quot;{tokenizeExamples[tokEx].text}&quot;
        </motion.p>
        {/* Animated knife sweep */}
        <div className="relative">
          <motion.div className="flex items-center gap-2">
            <span className="text-white/20 text-2xl mr-2">→</span>
            {tokenizeExamples[tokEx].pieces.map((tok, i) => (
              <motion.div
                key={`${tokEx}-${i}-${tok}`}
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
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
                    borderColor: tokenColors[i % tokenColors.length],
                    color: tokenColors[i % tokenColors.length],
                    backgroundColor: `${tokenColors[i % tokenColors.length]}12`,
                  }}
                >
                  {tok}
                </div>
                <motion.span
                  className="text-sm font-mono text-white/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: s === 5 ? 1 : 0 }}
                  transition={{ ...spring, delay: s === 5 ? 0.8 + i * 0.08 : 0 }}
                >
                  ID: {tokenizeExamples[tokEx].ids[i]}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <p className="text-xs text-white/30 mt-3">
          <span className="font-mono text-white/50">·</span> = a space that is part of the token. IDs are illustrative; each tokenizer has its own numbering.
        </p>
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
            With AI APIs you <span className="text-accent-blue font-bold">pay per token</span>: for the tokens you send
            <span className="text-white/20 mx-2">+</span>
            the tokens that come back <span className="text-white/30">(prices differ by model)</span>
          </p>
          <p className="text-sm text-white/25 text-center">
            Rule of thumb: 1 token ≈ ¾ of an English word &nbsp;|&nbsp; a 1-page email ≈ 500 tokens
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
            <p className="text-2xl font-mono text-accent-blue whitespace-nowrap">[0.31, 0.88, …]</p>
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
            { tok: 'The', vals: [0.12, -0.63, 0.38, -0.21], color: tokenColors[0] },
            { tok: 'capital', vals: [0.67, 0.34, -0.51, 0.22], color: tokenColors[1] },
            { tok: 'of', vals: [-0.45, 0.22, 0.61, -0.16], color: tokenColors[2] },
            { tok: 'France', vals: [0.82, -0.45, 0.73, 0.91], color: tokenColors[3] },
            { tok: 'is', vals: [0.29, -0.51, -0.14, 0.47], color: tokenColors[4] },
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
          className="text-sm text-white/35 mt-5"
          animate={{ opacity: s === 7 ? 1 : 0 }}
          transition={{ ...spring, delay: 1.8 }}
        >
          Illustrative numbers: a real embedding has hundreds or thousands of numbers per token
        </motion.p>
      </motion.div>

      {/* ===== STEP 8: "The Meaning Map" ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-8 py-4"
        animate={{ opacity: s === 8 ? 1 : 0 }}
        transition={smooth}
      >
        <div className="w-full max-w-3xl h-full flex flex-col items-center justify-center">
          {/* Large 2D scatter plot with SVG */}
          <motion.svg
            viewBox="0 0 600 360"
            className="w-full flex-1 min-h-0"
            animate={{ opacity: s === 8 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.1 }}
          >
            {/* Axes */}
            <line x1="50" y1="350" x2="580" y2="350" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            <line x1="50" y1="20" x2="50" y2="350" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

            {/* Cluster regions — pulsing halos */}
            <motion.circle initial={false}
              cx="430" cy="90" r="75"
              fill="none" stroke="#4a9eff" strokeWidth={1.5} strokeDasharray="6 4"
              animate={s === 8 ? { opacity: [0.15, 0.35, 0.15] } : { opacity: 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.text initial={false}
              x="430" y="25" textAnchor="middle" fill="#4a9eff" fontSize="12" fontWeight="bold"
              animate={{ opacity: s === 8 ? 0.6 : 0 }}
              transition={{ ...spring, delay: 0.4 }}
            >
              ROYALTY
            </motion.text>

            <motion.circle initial={false}
              cx="160" cy="210" r="70"
              fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="6 4"
              animate={s === 8 ? { opacity: [0.15, 0.35, 0.15] } : { opacity: 0 }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />
            <motion.text initial={false}
              x="160" y="155" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="bold"
              animate={{ opacity: s === 8 ? 0.6 : 0 }}
              transition={{ ...spring, delay: 0.5 }}
            >
              ANIMALS
            </motion.text>

            {/* Dashed line showing distance: king↔banana */}
            <motion.line initial={false}
              x1="410" y1="80" x2="380" y2="310"
              stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4"
              animate={{ opacity: s === 8 ? 0.4 : 0 }}
              transition={{ ...spring, delay: 1.2 }}
            />
            <motion.text initial={false}
              x="420" y="200" fill="#ef4444" fontSize="13" fontWeight="bold"
              animate={{ opacity: s === 8 ? 0.7 : 0 }}
              transition={{ ...spring, delay: 1.4 }}
            >
              distance = 4.7
            </motion.text>

            {/* Dashed line showing distance: king↔queen */}
            <motion.line initial={false}
              x1="410" y1="80" x2="460" y2="95"
              stroke="#4ade80" strokeWidth={1.5} strokeDasharray="4 4"
              animate={{ opacity: s === 8 ? 0.5 : 0 }}
              transition={{ ...spring, delay: 0.9 }}
            />
            <motion.text initial={false}
              x="474" y="118" fill="#4ade80" fontSize="13" fontWeight="bold"
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
                <motion.circle initial={false}
                  cx={pt.cx} cy={pt.cy} r="6"
                  fill={pt.color}
                  animate={{
                    opacity: s === 8 ? 1 : 0,
                    r: s === 8 ? 6 : 0,
                  }}
                  transition={{ ...spring, delay: pt.delay }}
                />
                <motion.circle initial={false}
                  cx={pt.cx} cy={pt.cy} r="12"
                  fill={pt.color} opacity={0.15}
                  animate={{ opacity: s === 8 ? 0.15 : 0 }}
                  transition={{ ...spring, delay: pt.delay }}
                />
                <motion.text initial={false}
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
                <motion.circle initial={false}
                  cx={pt.cx} cy={pt.cy} r="6"
                  fill={pt.color}
                  animate={{ opacity: s === 8 ? 1 : 0, r: s === 8 ? 6 : 0 }}
                  transition={{ ...spring, delay: pt.delay }}
                />
                <motion.circle initial={false}
                  cx={pt.cx} cy={pt.cy} r="12"
                  fill={pt.color} opacity={0.15}
                  animate={{ opacity: s === 8 ? 0.15 : 0 }}
                  transition={{ ...spring, delay: pt.delay }}
                />
                <motion.text initial={false}
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
              <motion.circle initial={false}
                cx={380} cy={310} r="6"
                fill="#ef4444"
                animate={{ opacity: s === 8 ? 1 : 0, r: s === 8 ? 6 : 0 }}
                transition={{ ...spring, delay: 0.8 }}
              />
              <motion.circle initial={false}
                cx={380} cy={310} r="12"
                fill="#ef4444" opacity={0.15}
                animate={{ opacity: s === 8 ? 0.15 : 0 }}
                transition={{ ...spring, delay: 0.8 }}
              />
              <motion.text initial={false}
                x={392} y={315}
                fill="#ef4444" fontSize="13" fontWeight="bold"
                animate={{ opacity: s === 8 ? 1 : 0 }}
                transition={{ ...spring, delay: 0.9 }}
              >
                banana
              </motion.text>
              <motion.text initial={false}
                x={392} y={332}
                fill="#ef4444" fontSize="12" opacity={0.6}
                animate={{ opacity: s === 8 ? 0.6 : 0 }}
                transition={{ ...spring, delay: 1 }}
              >
                (far from everything)
              </motion.text>
            </motion.g>
          </motion.svg>

          {/* Bottom legend */}
          <motion.div
            className="flex items-center justify-center gap-6 mt-2 shrink-0"
            animate={{ opacity: s === 8 ? 1 : 0 }}
            transition={{ ...spring, delay: 1.5 }}
          >
            <span className="text-sm text-accent-green">
              king ↔ queen = <strong>0.12</strong> (very close!)
            </span>
            <span className="text-sm text-white/20">|</span>
            <span className="text-sm text-red-400">
              king ↔ banana = <strong>4.7</strong> (very far)
            </span>
            <span className="text-sm text-white/20">|</span>
            <span className="text-sm text-white/40">
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
        <div className="flex items-center gap-4 text-2xl font-bold mb-6">
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

        {/* Word-math picture: the arrow from "man" to "woman" is the same arrow as "king" to "queen" */}
        <motion.svg
          viewBox="0 0 520 230"
          className="w-full max-w-xl"
          fill="none"
          initial={false}
          animate={{ opacity: s === 9 ? 1 : 0 }}
          transition={{ duration: 0.4, delay: s === 9 ? 0.6 : 0 }}
        >
          {/* faint "royal" direction: man → king and woman → queen */}
          <line x1="120" y1="185" x2="120" y2="60" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="3 5" />
          <line x1="330" y1="185" x2="330" y2="60" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="3 5" />

          {/* man → woman arrow */}
          <motion.line
            initial={false}
            x1="132" y1="185" x2="312" y2="185"
            stroke="#f472b6" strokeWidth={3}
            animate={{ pathLength: s === 9 ? 1 : 0 }}
            transition={{ duration: 0.6, delay: s === 9 ? 1.0 : 0 }}
          />
          <motion.polygon
            initial={false}
            points="318,185 306,178 306,192" fill="#f472b6"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ duration: 0.2, delay: s === 9 ? 1.5 : 0 }}
          />
          <motion.text
            initial={false}
            x="225" y="210" textAnchor="middle" fill="#f472b6" fontSize="15" fontWeight="bold"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ duration: 0.3, delay: s === 9 ? 1.2 : 0 }}
          >
            woman − man
          </motion.text>

          {/* the SAME arrow, starting at king */}
          <motion.line
            initial={false}
            x1="132" y1="60" x2="312" y2="60"
            stroke="#f472b6" strokeWidth={3} strokeDasharray="8 6"
            animate={{ pathLength: s === 9 ? 1 : 0 }}
            transition={{ duration: 0.6, delay: s === 9 ? 1.9 : 0 }}
          />
          <motion.polygon
            initial={false}
            points="318,60 306,53 306,67" fill="#f472b6"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ duration: 0.2, delay: s === 9 ? 2.4 : 0 }}
          />
          <motion.text
            initial={false}
            x="225" y="45" textAnchor="middle" fill="#f472b6" fontSize="15" fontWeight="bold"
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ duration: 0.3, delay: s === 9 ? 2.1 : 0 }}
          >
            + (woman − man)
          </motion.text>

          {/* word dots */}
          {[
            { word: 'king', x: 120, y: 60, color: '#4a9eff', right: false },
            { word: 'man', x: 120, y: 185, color: '#f87171', right: false },
            { word: 'woman', x: 330, y: 185, color: '#e879f9', right: true },
          ].map((w) => (
            <g key={w.word}>
              <circle cx={w.x} cy={w.y} r="8" fill={w.color} />
              <text x={w.right ? w.x + 16 : w.x - 16} y={w.y + 6} textAnchor={w.right ? 'start' : 'end'} fill={w.color} fontSize="17" fontWeight="bold">{w.word}</text>
            </g>
          ))}

          {/* queen: where the arrow lands */}
          <motion.g
            initial={false}
            animate={{ opacity: s === 9 ? 1 : 0 }}
            transition={{ duration: 0.4, delay: s === 9 ? 2.6 : 0 }}
          >
            <circle cx="330" cy="60" r="18" fill="#4ade8018" stroke="#4ade80" strokeWidth={2} />
            <circle cx="330" cy="60" r="8" fill="#4ade80" />
            <text x="358" y="66" fill="#4ade80" fontSize="18" fontWeight="bold">queen</text>
          </motion.g>
        </motion.svg>
      </motion.div>

      {/* ===== STEP 10: "Paying Attention" ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 10 ? 1 : 0 }}
        transition={smooth}
      >
        <p className="text-white/40 text-base font-medium mb-16">
          <span className="text-accent-blue font-bold">Attention:</span>{' '}
          each token looks at every other token to understand context
        </p>

        <div className="relative w-full max-w-lg">
          {/* Attention arcs */}
          <svg className="absolute -top-16 left-0 w-full h-16" viewBox="0 0 500 60" fill="none" preserveAspectRatio="xMidYMid meet">
            <motion.path initial={false}
              d="M 350 55 C 350 15, 150 15, 150 55"
              stroke="#4a9eff"
              strokeWidth={3}
              fill="none"
              animate={s === 10 ? { strokeOpacity: [0.3, 0.9, 0.3] } : { strokeOpacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path initial={false}
              d="M 350 55 C 350 30, 450 30, 450 55"
              stroke="#4a9eff"
              strokeWidth={1.5}
              fill="none"
              animate={s === 10 ? { strokeOpacity: [0.1, 0.4, 0.1] } : { strokeOpacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            <motion.path initial={false}
              d="M 50 55 C 50 25, 150 25, 150 55"
              stroke="#4a9eff"
              strokeWidth={1}
              fill="none"
              animate={s === 10 ? { strokeOpacity: [0.05, 0.15, 0.05] } : { strokeOpacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            />
            <motion.path initial={false}
              d="M 150 55 C 150 5, 350 5, 350 55"
              stroke="#a78bfa"
              strokeWidth={2.5}
              fill="none"
              animate={s === 10 ? { strokeOpacity: [0.2, 0.7, 0.2] } : { strokeOpacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
            <motion.path initial={false}
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

        {/* Context determines meaning: pick an ambiguous word */}
        <motion.div
          className="mt-5 w-full max-w-2xl"
          animate={{ opacity: s === 10 ? 1 : 0, y: s === 10 ? 0 : 15 }}
          transition={{ ...spring, delay: 0.9 }}
        >
          <div className="mb-3">
            <ExampleChips
              labels={attentionExamples.map((e) => e.word)}
              value={attEx}
              onChange={setAttEx}
              active={s === 10}
            />
          </div>
          <div className="flex gap-4">
            {[
              { sent: attentionExamples[attEx].a, color: '#4a9eff' },
              { sent: attentionExamples[attEx].b, color: '#4ade80' },
            ].map(({ sent, color }, si) => (
              <motion.div
                key={`${attEx}-${si}`}
                className="flex-1 rounded-xl border p-3"
                style={{ borderColor: `${color}33`, backgroundColor: `${color}08` }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: si * 0.15 }}
              >
                <div className="flex flex-wrap justify-center gap-1.5 font-mono text-sm">
                  {sent.words.map((w, wi) => {
                    const isTarget = wi === sent.target;
                    const isContext = sent.context.includes(wi);
                    return (
                      <motion.span
                        key={wi}
                        className="px-1.5 py-0.5 rounded border"
                        style={{
                          color: isTarget || isContext ? color : 'rgba(255,255,255,0.55)',
                          fontWeight: isTarget || isContext ? 700 : 400,
                          borderColor: isTarget ? color : 'transparent',
                        }}
                        animate={isContext && s === 10
                          ? { backgroundColor: [`${color}00`, `${color}40`, `${color}00`] }
                          : { backgroundColor: isTarget ? `${color}20` : `${color}00` }}
                        transition={isContext
                          ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 + si * 0.3 }
                          : { duration: 0.3 }}
                      >
                        {w}
                      </motion.span>
                    );
                  })}
                </div>
                <p className="text-xs text-center mt-2" style={{ color: `${color}aa` }}>
                  <b>{sent.words[sent.target]}</b> looks at{' '}
                  <b>{sent.context.map((ci) => sent.words[ci]).join(' + ')}</b>
                </p>
                <p className="text-xs text-center mt-0.5 text-white/50">{sent.meaning}</p>
              </motion.div>
            ))}
          </div>
          <motion.p
            className="text-sm text-white/35 text-center mt-2 font-bold"
            animate={{ opacity: s === 10 ? 1 : 0 }}
            transition={{ ...spring, delay: 1.2 }}
          >
            Same word, different neighbours, different meaning
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
          ...through many layers of math that extract meaning and patterns
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
              <p className="text-sm font-mono font-bold text-accent-blue">Billions</p>
            </div>
          </motion.div>

          {/* Layer labels */}
          <motion.div
            className="flex justify-between px-8 mt-1"
            animate={{ opacity: s === 11 ? 1 : 0, y: s === 11 ? 0 : 10 }}
            transition={{ ...spring, delay: 1 }}
          >
            <div className="text-center">
              <p className="text-xs font-bold text-accent-blue/70">Early layers</p>
              <p className="text-xs text-white/30">Grammar</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-[#a78bfa]/70">Middle layers</p>
              <p className="text-xs text-white/30">Meaning</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-accent-green/70">Later layers</p>
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
            Big models: <span className="text-accent-blue font-mono font-bold">billions of parameters</span>
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
        <p className="text-white/30 text-xs mb-3">
          &quot;{predictionExamples[predEx].prompt} ___&quot; → every token in the vocabulary gets a score
        </p>
        <div className="mb-5">
          <ExampleChips
            labels={predictionExamples.map((e) => e.prompt)}
            value={predEx}
            onChange={setPredEx}
            active={s === 12}
          />
        </div>

        <div className="w-full max-w-md">
          {predictionExamples[predEx].bars.map((p, i) => (
            <motion.div
              key={`${predEx}-${p.label}`}
              className="flex items-center gap-3 mb-3"
              initial={{ opacity: 0, x: 30 }}
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
                  initial={{ width: '0%' }}
                  animate={{ width: s === 12 ? `${Math.max(p.pct, 1)}%` : '0%' }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: s === 12 ? 0.3 + i * 0.08 : 0 }}
                >
                  <span className="text-xs font-bold whitespace-nowrap" style={{ color: p.color }}>
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
        <p className="text-xs text-white/30 mt-2">
          Illustrative numbers. A clear question gives one tall bar; an open one spreads the chances out.
        </p>
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
        <p className="text-white/40 text-base font-medium mb-4">
          <span className="text-accent-blue font-bold">Training:</span>{' '}
          reading the internet to learn patterns
        </p>

        <div className="relative flex items-center gap-8">
          <div className="flex flex-col gap-2">
            {trainingSources.map((src, i) => (
              <motion.div
                key={src.label}
                className="flex items-center gap-3 px-4 py-1.5 rounded-lg border border-white/10 bg-white/[0.03]"
                animate={{
                  opacity: s === 15 ? 1 : 0,
                  x: s === 15 ? 0 : -40,
                }}
                transition={{ ...spring, delay: s === 15 ? i * 0.15 : 0 }}
              >
                <span className="text-xl">{src.icon}</span>
                <span className="text-sm text-white/65">{src.label}</span>
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
              <p>adjusted over weeks or months</p>
              <p>on thousands of chips</p>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="mt-4 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.03]"
          animate={{ opacity: s === 15 ? 1 : 0, y: s === 15 ? 0 : 15 }}
          transition={{ ...spring, delay: 0.9 }}
        >
          <p className="text-sm text-white/50 text-center">
            Big models are trained on <span className="text-accent-blue font-bold font-mono">trillions of tokens</span> of text
          </p>
        </motion.div>

        {/* Scale comparisons */}
        <motion.div
          className="mt-3 w-full max-w-xl space-y-2"
          animate={{ opacity: s === 15 ? 1 : 0, y: s === 15 ? 0 : 10 }}
          transition={{ ...spring, delay: 1.1 }}
        >
          <div className="flex gap-3">
            <div className="flex-1 px-4 py-2.5 rounded-lg border border-[#fbbf24]/20 bg-[#fbbf24]/[0.03]">
              <p className="text-sm text-[#fbbf24]/70 font-bold mb-0.5">Human Scale</p>
              <p className="text-sm text-white/40">
                A book a day would still take <span className="text-[#fbbf24] font-bold">thousands of lifetimes</span>
              </p>
            </div>
            <div className="flex-1 px-4 py-2.5 rounded-lg border border-[#f472b6]/20 bg-[#f472b6]/[0.03]">
              <p className="text-sm text-[#f472b6]/70 font-bold mb-0.5">Training Cost</p>
              <p className="text-sm text-white/40">
                <span className="text-[#f472b6] font-bold">Thousands of chips</span> for weeks: lots of money and electricity
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
        <p className="text-white/35 text-sm mb-6">
          It can only see a limited number of tokens at once
        </p>

        {/* The desk: only the last CW_SIZE tokens fit; older ones slide off to the left */}
        <div className="relative mb-12 max-w-full" style={{ width: (CW_OFF + CW_SIZE) * CW_STEP }}>
          <div className="flex text-[13px] font-semibold mb-2">
            <span className="text-white/35" style={{ width: CW_OFF * CW_STEP }}>fell off the desk</span>
            <span className="text-accent-blue">context window: {CW_SIZE} tokens</span>
          </div>
          <div className="relative h-12">
            <div
              className="absolute top-0 bottom-0 rounded-xl border-2 border-accent-blue/60 bg-accent-blue/[0.06]"
              style={{ left: CW_OFF * CW_STEP - 5, width: CW_SIZE * CW_STEP + 4 }}
            />
            {CW_TOKENS.map((tok, i) => {
              const x = (i - cwStart + CW_OFF) * CW_STEP;
              const inWindow = i >= cwStart && i < cwShown;
              const isName = tok === 'Alex.';
              return (
                <motion.div
                  key={i}
                  className={`absolute top-1.5 h-9 rounded-lg border flex items-center justify-center text-[14px] font-mono ${
                    inWindow ? 'border-accent-blue/40 bg-accent-blue/15 text-blue-100' : 'border-white/10 bg-white/[0.03] text-white/50'
                  } ${isName ? 'font-bold' : ''}`}
                  style={{ width: CW_STEP - 6, color: isName ? '#fbbf24' : undefined }}
                  initial={false}
                  animate={{ x, opacity: s !== 17 || i >= cwShown || x < 0 ? 0 : inWindow ? 1 : 0.45 }}
                  transition={{ duration: 0.35 }}
                >
                  {tok}
                </motion.div>
              );
            })}
          </div>
          <motion.p
            className="absolute left-0 right-0 -bottom-7 text-center text-[14px] text-red-300"
            animate={{ opacity: s === 17 && cwShown === CW_TOKENS.length ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            &quot;Alex&quot; fell off the desk, so the model can&apos;t answer &quot;What is my name?&quot;
          </motion.p>
        </div>

        <motion.div
          className="flex gap-4 mb-6"
          animate={{ opacity: s === 17 ? 1 : 0, y: s === 17 ? 0 : 15 }}
          transition={{ ...spring, delay: 0.5 }}
        >
          {[
            { title: 'Measured in', big: 'tokens', note: 'not words or pages' },
            { title: 'Everything counts', big: 'in + out', note: 'your messages and its replies' },
            { title: 'Size', big: 'varies', note: 'by model; check the docs' },
          ].map((m) => (
            <div
              key={m.title}
              className="px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-center"
            >
              <p className="text-xs font-bold text-white/60">{m.title}</p>
              <p className="text-lg font-mono font-bold text-accent-blue">{m.big}</p>
              <p className="text-sm text-white/30">{m.note}</p>
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
            <span className="text-accent-blue">Vastly more</span> training text.{' '}
            <span className="text-[#a78bfa]">Vastly bigger</span> model.
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

      {/* ===== STEPS 22-23: "Try it yourself" playgrounds ===== */}
      <AnimatePresence>
        {trigger === 'playground' && (
          <motion.div
            key="pg1"
            className="absolute inset-0 z-10 bg-[#0a0e1a]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={smooth}
          >
            <LLMTokenPlayground />
          </motion.div>
        )}
        {trigger === 'playground2' && (
          <motion.div
            key="pg2"
            className="absolute inset-0 z-10 bg-[#0a0e1a]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={smooth}
          >
            <LLMMeaningPlayground />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== STEP 24: "Key Takeaways" ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: s === 24 ? 1 : 0 }}
        transition={smooth}
      >
        <div className="text-center max-w-2xl w-full px-6">
          <motion.h2
            className="text-4xl font-bold text-white mb-6"
            animate={{ opacity: s === 24 ? 1 : 0, y: s === 24 ? 0 : 15 }}
            transition={spring}
          >
            Key Takeaways
          </motion.h2>
          {[
            { icon: '🔮', text: 'An LLM predicts the next token, one at a time', color: '#4a9eff' },
            { icon: '✂️', text: 'Text becomes tokens, then numbers that carry meaning', color: '#a78bfa' },
            { icon: '🌡️', text: 'Temperature controls how adventurous each pick is', color: '#f472b6' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4 mb-3 px-6 py-4 rounded-xl bg-white/5 border text-left"
              style={{ borderColor: `${item.color}20` }}
              animate={{
                opacity: s === 24 ? 1 : 0,
                y: s === 24 ? 0 : 20,
              }}
              transition={{ ...spring, delay: s === 24 ? i * 0.15 : 0 }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white/85 text-lg font-medium">{item.text}</span>
            </motion.div>
          ))}
          <motion.p
            className="text-white/40 text-sm mt-5"
            animate={{ opacity: s === 24 ? 1 : 0 }}
            transition={{ ...spring, delay: 1 }}
          >
            Now you know what powers ChatGPT, Claude, Gemini, and Llama!
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
