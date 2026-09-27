'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useConceptStore } from '@/stores/conceptStore';
import RagPlayground from './playgrounds/RagPlayground';

const spring = { type: 'spring' as const, stiffness: 260, damping: 22 };
const smooth = { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const };

const ragLetters = [
  { letter: 'R', word: 'Retrieve', desc: 'Find relevant documents from your data store', icon: '🔍', color: '#4a9eff' },
  { letter: 'A', word: 'Augment', desc: 'Inject retrieved context into the prompt', icon: '➕', color: '#a78bfa' },
  { letter: 'G', word: 'Generate', desc: 'LLM produces a grounded, sourced answer', icon: '✨', color: '#4ade80' },
];

const documents = [
  { name: 'Q3 Report.pdf', icon: '📄' },
  { name: 'Sales Data.csv', icon: '📊' },
  { name: 'Q1 Report.pdf', icon: '📄' },
  { name: 'HR Policy.pdf', icon: '📄' },
  { name: 'Meeting Notes', icon: '📝' },
  { name: 'Product Spec', icon: '📝' },
];

// Example questions used by the Retrieve, Augment and RAG-vs-No-RAG scenes (made-up example data)
const ragExamples = [
  {
    chip: 'Q3 sales',
    question: 'What were Q3 sales?',
    short: 'Q3 sales?',
    matches: ['Q3 Report.pdf', 'Sales Data.csv', 'Meeting Notes'],
    context: 'Q3 revenue was $4.2M, up 18% YoY, driven by enterprise...',
    noRag: 'Revenue was approximately $3M based on typical industry averages...',
    noRagVerdict: 'Hallucinated, no source',
    rag: [
      { t: '$4.2M, up 18% YoY', b: true },
      { t: ', driven by enterprise contracts.', b: false },
    ],
    source: 'Q3 Report',
  },
  {
    chip: 'Vacation days',
    question: 'How many vacation days do I get?',
    short: 'My vacation days?',
    matches: ['HR Policy.pdf'],
    context: 'Full-time staff get 20 paid vacation days per year; up to 5 unused days carry over...',
    noRag: 'Most companies give around 10 to 15 days, but it depends on your employer...',
    noRagVerdict: 'Generic guess, not your policy',
    rag: [
      { t: 'You get ', b: false },
      { t: '20 paid vacation days', b: true },
      { t: ' a year, and up to 5 unused days carry over.', b: false },
    ],
    source: 'HR Policy',
  },
  {
    chip: 'App launch date',
    question: 'When does our new app launch?',
    short: 'App launch date?',
    matches: ['Product Spec', 'Meeting Notes'],
    context: 'Launch of the mobile app moved to 14 November after beta testing...',
    noRag: 'I don\'t have information about your company\'s product plans.',
    noRagVerdict: 'Can\'t answer: never saw your data',
    rag: [
      { t: 'The app launches on ', b: false },
      { t: '14 November', b: true },
      { t: ', after beta testing.', b: false },
    ],
    source: 'Product Spec, Meeting Notes',
  },
];

function ExampleChips({ active, idx, onPick }: { active: boolean; idx: number; onPick: (i: number) => void }) {
  return (
    <div
      className="flex items-center justify-center gap-1.5 flex-wrap"
      style={{ pointerEvents: active ? 'auto' : 'none' }}
    >
      <span className="text-xs text-white/35 mr-1">Try another question:</span>
      {ragExamples.map((ex, i) => (
        <motion.button
          key={ex.chip}
          onClick={() => onPick(i)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-2.5 py-0.5 rounded-full border text-xs"
          style={{
            borderColor: idx === i ? 'rgba(74,158,255,0.7)' : 'rgba(255,255,255,0.15)',
            backgroundColor: idx === i ? 'rgba(74,158,255,0.18)' : 'rgba(255,255,255,0.04)',
            color: idx === i ? '#cfe4ff' : 'rgba(255,255,255,0.6)',
          }}
        >
          {ex.chip}
        </motion.button>
      ))}
    </div>
  );
}

const pipelineStages = [
  { label: 'Documents', icon: '📄', color: '#a78bfa' },
  { label: 'Chunk', icon: '✂️', color: '#4a9eff' },
  { label: 'Embed', icon: '📐', color: '#fbbf24' },
  { label: 'Store', icon: '🗄️', color: '#a78bfa' },
  { label: 'Query', icon: '❓', color: '#4a9eff' },
  { label: 'Retrieve', icon: '🔍', color: '#4ade80' },
  { label: 'Augment', icon: '💉', color: '#a78bfa' },
  { label: 'Generate', icon: '🧠', color: '#fbbf24' },
  { label: 'Answer', icon: '✅', color: '#4ade80' },
];

// Step 5: a toy 2D meaning map for vector search (illustrative positions).
const VEC_Q = { x: 300, y: 115 };
const VEC_DOTS = [
  { x: 215, y: 80, label: 'Q3 Report', near: true },
  { x: 395, y: 135, label: 'Sales Data', near: true },
  { x: 250, y: 175, label: 'Revenue', near: true },
  { x: 75, y: 45, label: 'HR Policy', near: false },
  { x: 520, y: 45, label: 'Product', near: false },
  { x: 530, y: 200, label: 'Design', near: false },
  { x: 80, y: 200, label: 'Meeting', near: false },
];

const takeaways = [
  { text: 'RAG = find documents, add them to the prompt, then answer', color: '#4a9eff' },
  { text: 'Documents are cut into chunks and searched by meaning', color: '#a78bfa' },
  { text: 'Real data in the prompt means less guessing', color: '#4ade80' },
];

export default function RagAnim() {
  const { currentStep, steps } = useConceptStore();
  const s = currentStep;
  const trigger = steps[currentStep]?.animationTrigger;
  const isTakeaways = trigger === 'takeaways';

  // Which example question the Retrieve / Augment / RAG-vs-No-RAG scenes show
  const [exIdx, setExIdx] = useState(0);
  const ex = ragExamples[exIdx];

  // Pipeline pulse animation (step 10)
  const [pulsePosIdx, setPulsePosIdx] = useState(0);
  useEffect(() => {
    if (s === 10) {
      setPulsePosIdx(0);
      const timer = setInterval(() => {
        setPulsePosIdx((prev) => (prev + 1) % pipelineStages.length);
      }, 600);
      return () => clearInterval(timer);
    }
  }, [s]);

  // Magnifying glass scan animation (step 3)
  const [scanIdx, setScanIdx] = useState(0);
  useEffect(() => {
    if (s === 3) {
      setScanIdx(0);
      const timer = setInterval(() => {
        setScanIdx((prev) => (prev + 1) % documents.length);
      }, 700);
      return () => clearInterval(timer);
    }
  }, [s]);

  // Token budget overflow animation (step 7)
  const [showOverflow, setShowOverflow] = useState(false);
  useEffect(() => {
    if (s === 7) {
      setShowOverflow(false);
      const timer = setTimeout(() => setShowOverflow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [s]);

  // RAG vs No RAG highlight cycling (step 9)
  const [ragHighlight, setRagHighlight] = useState(0);
  useEffect(() => {
    if (s === 9) {
      setRagHighlight(0);
      const timer = setInterval(() => setRagHighlight((p) => (p + 1) % 2), 2500);
      return () => clearInterval(timer);
    }
  }, [s]);

  // Vector search nearest dots (step 5)
  const [vecPhase, setVecPhase] = useState(0);
  useEffect(() => {
    if (s === 5) {
      setVecPhase(0);
      const timer = setInterval(() => setVecPhase((p) => (p + 1) % 3), 1200);
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
      {/* ===== Step 0: The Knowledge Cutoff ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 0 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-2xl w-full">
          <motion.p
            className="text-sm text-white/40 uppercase tracking-wider text-center mb-12"
            animate={{ opacity: s === 0 ? 1 : 0 }}
            transition={spring}
          >
            The Knowledge Cutoff
          </motion.p>

          {/* Timeline: what the model learned | the cutoff | what it never saw */}
          <div className="relative grid grid-cols-2">
            <motion.div
              className="flex flex-col items-start gap-2 pr-6"
              animate={{ opacity: s === 0 ? 1 : 0, x: s === 0 ? 0 : -15 }}
              transition={{ ...spring, delay: 0.2 }}
            >
              <div className="flex gap-2 text-3xl">
                <span>📚</span><span>🌐</span><span>💻</span>
              </div>
              <motion.div
                className="h-2 rounded-full bg-[#4ade80]/60 self-stretch origin-left"
                animate={{ scaleX: s === 0 ? 1 : 0 }}
                transition={{ ...smooth, delay: 0.3 }}
              />
              <span className="text-[15px] text-[#4ade80] font-bold">Learned in training</span>
            </motion.div>
            <motion.div
              className="flex flex-col items-end gap-2 pl-6"
              animate={{ opacity: s === 0 ? 1 : 0, x: s === 0 ? 0 : 15 }}
              transition={{ ...spring, delay: 0.7 }}
            >
              <div className="flex gap-2 text-3xl grayscale opacity-40">
                <span>📰</span><span>📁</span><span>📊</span>
              </div>
              <motion.div
                className="h-2 rounded-full bg-[#ef4444]/25 self-stretch origin-left"
                animate={{ scaleX: s === 0 ? 1 : 0 }}
                transition={{ ...smooth, delay: 0.8 }}
              />
              <span className="text-[15px] text-[#f87171]/80 font-bold">Newer: never seen</span>
            </motion.div>
            {/* Cutoff marker */}
            <motion.div
              className="absolute left-1/2 -top-8 bottom-0 -translate-x-1/2 flex flex-col items-center"
              animate={{ opacity: s === 0 ? 1 : 0 }}
              transition={{ ...spring, delay: 0.6 }}
            >
              <span className="text-[13px] text-[#ef4444] font-bold whitespace-nowrap mb-1">TRAINING CUTOFF</span>
              <div className="flex-1 w-0 border-l-2 border-dashed border-[#ef4444]/70" />
            </motion.div>
          </div>

          {/* Question bubble with X */}
          <motion.div
            className="flex justify-center mt-8"
            animate={{ opacity: s === 0 ? 1 : 0, y: s === 0 ? 0 : 15 }}
            transition={{ ...spring, delay: 1 }}
          >
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-[#ef4444]/30 bg-[#ef4444]/5">
              <span className="text-[15px] text-white/75">&quot;What was in yesterday&apos;s news?&quot;</span>
              <motion.span
                className="text-xl text-[#ef4444] font-bold"
                animate={{ scale: s === 0 ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✕
              </motion.span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Step 1: The Private Data Problem ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 1 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex flex-col items-center max-w-xl w-full">
          <div className="flex items-center gap-10 mb-6">
            {/* LLM brain */}
            <motion.div
              className="flex flex-col items-center"
              animate={{ opacity: s === 1 ? 1 : 0, x: s === 1 ? 0 : -20 }}
              transition={spring}
            >
              <div className="w-24 h-24 rounded-2xl border-2 border-[#4a9eff]/30 bg-[#4a9eff]/5 flex items-center justify-center">
                <span className="text-4xl">🧠</span>
              </div>
              <p className="text-sm text-white/30 mt-2">LLM</p>
              <p className="text-xs text-white/20">Generic knowledge only</p>
            </motion.div>

            {/* Red X between */}
            <motion.span
              className="text-5xl text-[#ef4444] font-bold"
              animate={{
                opacity: s === 1 ? 1 : 0,
                scale: s === 1 ? 1 : 0,
              }}
              transition={{ ...spring, delay: 0.4 }}
            >
              ✕
            </motion.span>

            {/* Locked cabinet */}
            <motion.div
              className="flex flex-col items-center"
              animate={{ opacity: s === 1 ? 1 : 0, x: s === 1 ? 0 : 20 }}
              transition={{ ...spring, delay: 0.2 }}
            >
              <div className="w-24 h-24 rounded-2xl border-2 border-[#fbbf24]/30 bg-[#fbbf24]/5 flex items-center justify-center">
                <span className="text-4xl">🔒</span>
              </div>
              <p className="text-sm text-white/30 mt-2">Your Company Data</p>
              <p className="text-xs text-white/20">Private, internal docs</p>
            </motion.div>
          </div>

          {/* Caption */}
          <motion.div
            className="px-5 py-3 rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/5 text-center"
            animate={{ opacity: s === 1 ? 1 : 0, y: s === 1 ? 0 : 10 }}
            transition={{ ...spring, delay: 0.6 }}
          >
            <p className="text-xs text-white/50">
              The LLM has <span className="text-[#ef4444] font-bold">never seen</span> your private documents.
            </p>
            <p className="text-sm text-white/30 mt-1 italic">
              &quot;What were Q3 sales?&quot; → &quot;I don&apos;t have access to your company data...&quot;
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Step 2: The RAG Idea ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 2 ? 1 : 0 }}
        transition={spring}
      >
        <motion.p
          className="text-xs text-white/30 uppercase tracking-wider text-center mb-8"
          animate={{ opacity: s === 2 ? 1 : 0 }}
          transition={spring}
        >
          Retrieval-Augmented Generation
        </motion.p>

        <div className="flex items-start gap-8 mb-6">
          {ragLetters.map((item, i) => (
            <motion.div
              key={item.letter}
              className="flex flex-col items-center w-44"
              animate={{
                opacity: s === 2 ? 1 : 0,
                y: s === 2 ? 0 : 25,
              }}
              transition={{ ...spring, delay: 0.3 + i * 0.3 }}
            >
              <span className="text-3xl mb-2">{item.icon}</span>
              <motion.span
                className="text-5xl font-bold mb-1"
                style={{ color: item.color }}
                animate={{
                  scale: s === 2 ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.3 }}
              >
                {item.letter}
              </motion.span>
              <span className="text-sm font-bold mb-2" style={{ color: item.color }}>
                {item.word}
              </span>

              {/* Description card */}
              <motion.div
                className="w-full rounded-lg border p-3 text-center"
                style={{
                  borderColor: `${item.color}30`,
                  backgroundColor: `${item.color}08`,
                }}
                animate={{
                  opacity: s === 2 ? 1 : 0,
                  y: s === 2 ? 0 : 10,
                }}
                transition={{ ...spring, delay: 1.0 + i * 0.3 }}
              >
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ===== Step 3: Step 1 — Retrieve ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 3 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          <motion.p
            className="text-xs text-white/30 uppercase tracking-wider text-center mb-2"
            animate={{ opacity: s === 3 ? 1 : 0 }}
            transition={spring}
          >
            Step 1: Retrieve
          </motion.p>
          <motion.p
            className="text-sm text-white/20 text-center mb-5"
            animate={{ opacity: s === 3 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.1 }}
          >
            Search your document store for relevant matches
          </motion.p>

          {/* Question being searched for */}
          <div className="flex justify-center mb-4">
            <motion.div
              key={ex.question}
              className="px-3 py-1.5 rounded-lg border border-[#4a9eff]/30 bg-[#4a9eff]/5"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: s === 3 ? 1 : 0, y: 0 }}
              transition={spring}
            >
              <span className="text-sm text-[#4a9eff]">&quot;{ex.question}&quot;</span>
            </motion.div>
          </div>

          {/* Document grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {documents.map((d, i) => {
              const doc = { ...d, match: ex.matches.includes(d.name) };
              return (
              <motion.div
                key={doc.name}
                className="px-3 py-3 rounded-xl border text-center"
                style={{
                  borderColor: doc.match
                    ? 'rgba(74,222,128,0.5)'
                    : 'rgba(255,255,255,0.1)',
                  backgroundColor: doc.match
                    ? 'rgba(74,222,128,0.08)'
                    : 'rgba(255,255,255,0.03)',
                }}
                animate={{
                  opacity: s === 3 ? (doc.match ? 1 : 0.3) : 0,
                  scale: s === 3 && doc.match ? 1.05 : 1,
                  boxShadow:
                    s === 3 && doc.match && scanIdx >= i
                      ? '0 0 15px rgba(74,222,128,0.3)'
                      : '0 0 0px transparent',
                }}
                transition={{ ...spring, delay: 0.2 + i * 0.08 }}
              >
                <span className="text-2xl">{doc.icon}</span>
                <p className="text-sm text-white/40 mt-1 truncate">{doc.name}</p>
                {doc.match && (
                  <motion.span
                    className="inline-block mt-1 text-xs text-[#4ade80] font-bold"
                    animate={{ opacity: s === 3 ? [0, 1] : 0 }}
                    transition={{ ...smooth, delay: 0.8 + i * 0.1 }}
                  >
                    MATCH
                  </motion.span>
                )}
              </motion.div>
              );
            })}
          </div>

          {/* Magnifying glass scanning */}
          <motion.div
            className="flex justify-center"
            animate={{
              opacity: s === 3 ? 1 : 0,
              x: s === 3 ? [-60, 60, -60] : 0,
            }}
            transition={{
              opacity: spring,
              x: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <span className="text-4xl">🔍</span>
          </motion.div>

          <motion.div className="mt-4" animate={{ opacity: s === 3 ? 1 : 0 }} transition={spring}>
            <ExampleChips active={s === 3} idx={exIdx} onPick={setExIdx} />
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Step 4: Chunking ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 4 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-8 max-w-2xl w-full">
          {/* Tall document on left */}
          <motion.div
            className="flex flex-col items-center"
            animate={{ opacity: s === 4 ? 1 : 0, x: s === 4 ? 0 : -20 }}
            transition={spring}
          >
            <div className="w-32 rounded-xl border-2 border-[#4a9eff]/30 bg-[#4a9eff]/5 p-3">
              <div className="text-center mb-2">
                <span className="text-3xl">📄</span>
              </div>
              <div className="space-y-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((line) => (
                  <div
                    key={line}
                    className="h-1.5 rounded-full bg-white/10"
                    style={{ width: `${[92, 78, 96, 70, 88, 64, 94, 80][line - 1]}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-[#4a9eff]/60 text-center mt-2">Full Document</p>
              <p className="text-xs text-white/45 text-center">~2,500 tokens</p>
            </div>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{ opacity: s === 4 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <span className="text-3xl">✂️</span>
            <span className="text-white/20 text-2xl">→</span>
            <span className="text-sm text-white/30">Split</span>
          </motion.div>

          {/* Chunks on right */}
          <motion.div
            className="flex flex-col gap-2"
            animate={{ opacity: s === 4 ? 1 : 0, x: s === 4 ? 0 : 20 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            {[
              { label: 'Chunk 1', color: '#4a9eff' },
              { label: 'Chunk 2', color: '#a78bfa' },
              { label: 'Chunk 3', color: '#4ade80' },
              { label: 'Chunk 4', color: '#fbbf24' },
              { label: 'Chunk 5', color: '#ef4444' },
            ].map((chunk, i) => (
              <motion.div
                key={chunk.label}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                style={{
                  borderColor: `${chunk.color}30`,
                  backgroundColor: `${chunk.color}08`,
                }}
                animate={{
                  opacity: s === 4 ? 1 : 0,
                  x: s === 4 ? 0 : 15,
                }}
                transition={{ ...spring, delay: 0.4 + i * 0.12 }}
              >
                <div className="w-16">
                  <div className="space-y-0.5">
                    <div className="h-1 rounded-full bg-white/15 w-full" />
                    <div className="h-1 rounded-full bg-white/10 w-3/4" />
                  </div>
                </div>
                <span className="text-xs font-mono" style={{ color: chunk.color }}>
                  {chunk.label}
                </span>
                <span className="text-xs text-white/45">~500 tokens</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Arrow to store */}
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{ opacity: s === 4 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.8 }}
          >
            <span className="text-white/20 text-2xl">→</span>
            <span className="text-3xl">🗄️</span>
            <span className="text-sm text-white/30">Store</span>
          </motion.div>
        </div>

        {/* Caption */}
        <motion.p
          className="absolute bottom-[15%] text-xs text-white/30 text-center"
          animate={{ opacity: s === 4 ? 1 : 0 }}
          transition={{ ...spring, delay: 1 }}
        >
          Split documents into manageable chunks so retrieval is precise
        </motion.p>
      </motion.div>

      {/* ===== Step 5: Vector Search ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 5 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-2xl w-full flex flex-col items-center">
          <motion.p
            className="text-sm text-white/40 uppercase tracking-wider text-center mb-3"
            animate={{ opacity: s === 5 ? 1 : 0 }}
            transition={spring}
          >
            Vector Search
          </motion.p>

          {/* Question */}
          <motion.div
            className="px-4 py-2 rounded-lg border border-[#4a9eff]/40 bg-[#4a9eff]/10 mb-3"
            animate={{ opacity: s === 5 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <span className="text-[15px] text-[#8cc4ff]">&quot;What were Q3 sales?&quot;</span>
          </motion.div>

          {/* A meaning map: the question and every chunk get a spot; the closest chunks win */}
          <motion.svg
            viewBox="0 0 600 250"
            className="w-full rounded-xl border border-white/10 bg-white/[0.02]"
            initial={false}
            animate={{ opacity: s === 5 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            {VEC_DOTS.filter((d) => d.near).map((d, i) => (
              <motion.line
                key={`l-${d.label}`}
                x1={VEC_Q.x} y1={VEC_Q.y} x2={d.x} y2={d.y}
                stroke="#4ade80" strokeWidth={2} strokeDasharray="5 4"
                initial={false}
                animate={{ pathLength: s === 5 && vecPhase >= 1 ? 1 : 0, opacity: s === 5 && vecPhase >= 1 ? 0.8 : 0 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              />
            ))}
            {VEC_DOTS.map((d) => {
              const lit = d.near && s === 5 && vecPhase >= 2;
              return (
                <g key={d.label}>
                  <circle cx={d.x} cy={d.y} r={lit ? 9 : 7} fill={d.near ? '#4ade80' : 'rgba(255,255,255,0.3)'} />
                  <text
                    x={d.x} y={d.y + 26} textAnchor="middle" fontSize="15" fontWeight={d.near ? 700 : 400}
                    fill={d.near ? '#4ade80' : 'rgba(255,255,255,0.45)'}
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
            <circle cx={VEC_Q.x} cy={VEC_Q.y} r="11" fill="#4a9eff" />
            <text x={VEC_Q.x + 16} y={VEC_Q.y - 12} textAnchor="start" fontSize="15" fontWeight="700" fill="#8cc4ff">your question</text>
          </motion.svg>

          <motion.p
            className="text-[15px] text-[#4ade80] text-center mt-3"
            animate={{ opacity: s === 5 && vecPhase >= 2 ? 1 : 0 }}
            transition={smooth}
          >
            The 3 closest chunks are picked
          </motion.p>
        </div>
      </motion.div>

      {/* ===== Step 6: Step 2 — Augment ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 6 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-5 max-w-3xl w-full">
          {/* LEFT: without context (dim/red) */}
          <motion.div
            className="flex-1 rounded-xl border-2 p-4"
            style={{
              borderColor: 'rgba(239,68,68,0.3)',
              backgroundColor: 'rgba(239,68,68,0.03)',
            }}
            animate={{
              opacity: s === 6 ? 0.5 : 0,
              x: s === 6 ? 0 : -20,
            }}
            transition={spring}
          >
            <p className="text-sm text-[#ef4444] font-bold mb-3 uppercase">Without Context</p>
            <div className="space-y-1.5 font-mono text-sm">
              <div className="px-2 py-1 rounded border border-[#a78bfa]/20 bg-[#a78bfa]/5 text-white/40">
                <span className="text-[#a78bfa]">system:</span> &quot;You are helpful&quot;
              </div>
              <div className="px-2 py-1 rounded border border-[#4a9eff]/20 bg-[#4a9eff]/5 text-white/40">
                <span className="text-[#4a9eff]">user:</span> &quot;{ex.short}&quot;
              </div>
            </div>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="flex flex-col items-center gap-1"
            animate={{ opacity: s === 6 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <span className="text-white/30 text-xl">→</span>
            <span className="text-xs text-[#4ade80]">inject</span>
            <span className="text-xs text-[#4ade80]">context</span>
          </motion.div>

          {/* RIGHT: with context (green, pulsing) */}
          <motion.div
            className="flex-1 rounded-xl border-2 p-4"
            style={{
              borderColor: 'rgba(74,222,128,0.4)',
              backgroundColor: 'rgba(74,222,128,0.05)',
            }}
            animate={{
              opacity: s === 6 ? 1 : 0,
              x: s === 6 ? 0 : 20,
              boxShadow: s === 6
                ? [
                    '0 0 10px rgba(74,222,128,0.1)',
                    '0 0 20px rgba(74,222,128,0.25)',
                    '0 0 10px rgba(74,222,128,0.1)',
                  ]
                : '0 0 0px transparent',
            }}
            transition={{
              opacity: spring,
              x: spring,
              boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <p className="text-sm text-[#4ade80] font-bold mb-3 uppercase">With Context (Augmented)</p>
            <div className="space-y-1.5 font-mono text-sm">
              <div className="px-2 py-1 rounded border border-[#a78bfa]/20 bg-[#a78bfa]/5 text-white/40">
                <span className="text-[#a78bfa]">system:</span> &quot;You are helpful&quot;
              </div>
              <motion.div
                className="px-2 py-1.5 rounded border-2 border-[#4ade80]/40 bg-[#4ade80]/10 text-white/60"
                animate={{
                  opacity: s === 6 ? 1 : 0,
                  scale: s === 6 ? [0.95, 1] : 0.95,
                }}
                transition={{ ...spring, delay: 0.6 }}
                key={ex.chip}
              >
                <span className="text-[#4ade80] font-bold">context:</span> &quot;{ex.context}&quot;
              </motion.div>
              <div className="px-2 py-1 rounded border border-[#4a9eff]/20 bg-[#4a9eff]/5 text-white/40">
                <span className="text-[#4a9eff]">user:</span> &quot;{ex.short}&quot;
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-[12%] left-0 right-0"
          animate={{ opacity: s === 6 ? 1 : 0 }}
          transition={{ ...spring, delay: 0.4 }}
        >
          <ExampleChips active={s === 6} idx={exIdx} onPick={setExIdx} />
        </motion.div>
      </motion.div>

      {/* ===== Step 7: Token Budget Problem ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 7 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-xl w-full">
          <motion.p
            className="text-xs text-white/30 uppercase tracking-wider text-center mb-2"
            animate={{ opacity: s === 7 ? 1 : 0 }}
            transition={spring}
          >
            Token Budget Problem
          </motion.p>
          <motion.p
            className="text-sm text-white/20 text-center mb-6"
            animate={{ opacity: s === 7 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.1 }}
          >
            8K context window — everything must fit
          </motion.p>

          {/* Healthy budget bar */}
          <motion.div
            className="mb-6"
            animate={{ opacity: s === 7 && !showOverflow ? 1 : 0.3 }}
            transition={smooth}
          >
            <p className="text-sm text-white/30 mb-2">Balanced Budget</p>
            <div className="w-full h-10 rounded-lg overflow-hidden flex border border-white/10">
              <motion.div
                className="h-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(167,139,250,0.3)', borderRight: '1px solid rgba(255,255,255,0.1)' }}
                animate={{ width: s === 7 ? '8%' : '0%' }}
                transition={{ ...smooth, delay: 0.2 }}
              >
                <span className="text-xs text-[#a78bfa] font-bold">System</span>
              </motion.div>
              <motion.div
                className="h-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(74,158,255,0.3)', borderRight: '1px solid rgba(255,255,255,0.1)' }}
                animate={{ width: s === 7 ? '5%' : '0%' }}
                transition={{ ...smooth, delay: 0.3 }}
              >
                <span className="text-xs text-[#4a9eff] font-bold">Q</span>
              </motion.div>
              <motion.div
                className="h-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(74,222,128,0.3)', borderRight: '1px solid rgba(255,255,255,0.1)' }}
                animate={{ width: s === 7 ? '37%' : '0%' }}
                transition={{ ...smooth, delay: 0.4 }}
              >
                <span className="text-xs text-[#4ade80] font-bold">Retrieved Docs (3K)</span>
              </motion.div>
              <motion.div
                className="h-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(251,191,36,0.2)' }}
                animate={{ width: s === 7 ? '50%' : '0%' }}
                transition={{ ...smooth, delay: 0.5 }}
              >
                <span className="text-xs text-[#fbbf24] font-bold">Response Space (4K)</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Overflow budget bar */}
          <AnimatePresence>
            {showOverflow && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
              >
                <p className="text-sm text-[#ef4444] mb-2 font-bold">Too Many Docs Injected!</p>
                <div className="w-full h-10 rounded-lg overflow-hidden flex border-2 border-[#ef4444]/40">
                  <motion.div
                    className="h-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(167,139,250,0.3)', borderRight: '1px solid rgba(255,255,255,0.1)' }}
                    animate={{ width: '8%' }}
                    transition={smooth}
                  >
                    <span className="text-xs text-[#a78bfa] font-bold">Sys</span>
                  </motion.div>
                  <motion.div
                    className="h-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(74,158,255,0.3)', borderRight: '1px solid rgba(255,255,255,0.1)' }}
                    animate={{ width: '5%' }}
                    transition={smooth}
                  >
                    <span className="text-xs text-[#4a9eff] font-bold">Q</span>
                  </motion.div>
                  <motion.div
                    className="h-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(74,222,128,0.3)', borderRight: '1px solid rgba(255,255,255,0.1)' }}
                    animate={{ width: '82%' }}
                    transition={{ ...smooth, delay: 0.2 }}
                  >
                    <span className="text-xs text-[#4ade80] font-bold">Retrieved Docs (7K!)</span>
                  </motion.div>
                  <motion.div
                    className="h-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(239,68,68,0.3)' }}
                    animate={{ width: '5%' }}
                    transition={{ ...smooth, delay: 0.3 }}
                  >
                    <span className="text-[7px] text-[#ef4444] font-bold">!</span>
                  </motion.div>
                </div>

                <motion.div
                  className="flex justify-center mt-3"
                  animate={{
                    opacity: [0, 1],
                    scale: [0.8, 1],
                  }}
                  transition={{ ...spring, delay: 0.5 }}
                >
                  <div className="px-4 py-1.5 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/30">
                    <span className="text-xs text-[#ef4444] font-bold">
                      No room left for the response!
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ===== Step 8: Step 3 — Generate ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 8 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          {/* LLM receiving augmented prompt */}
          <motion.div
            className="flex justify-center mb-4"
            animate={{ opacity: s === 8 ? 1 : 0 }}
            transition={spring}
          >
            <motion.div
              className="w-20 h-20 rounded-2xl border-2 border-[#4ade80]/40 bg-[#4ade80]/5 flex items-center justify-center"
              animate={{
                boxShadow: s === 8
                  ? '0 0 24px rgba(74,222,128,0.3)'
                  : '0 0 0px transparent',
              }}
              transition={spring}
            >
              <span className="text-3xl">🧠</span>
            </motion.div>
          </motion.div>

          <motion.p
            className="text-sm text-white/30 text-center mb-4"
            animate={{ opacity: s === 8 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            LLM generates a grounded answer from the augmented prompt
          </motion.p>

          {/* Response with citation */}
          <motion.div
            className="rounded-xl border-2 border-[#4ade80]/30 p-5 bg-[#4ade80]/5 text-center"
            animate={{
              opacity: s === 8 ? 1 : 0,
              y: s === 8 ? 0 : 15,
            }}
            transition={{ ...spring, delay: 0.4 }}
          >
            <p className="text-sm text-white/80 leading-relaxed">
              &quot;Your Q3 revenue was{' '}
              <span className="font-bold text-[#4ade80]">$4.2M</span>
              , up{' '}
              <span className="font-bold text-[#4ade80]">18% YoY</span>
              , primarily driven by enterprise contracts.&quot;
            </p>
            <motion.div
              className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-[#4a9eff]/10 border border-[#4a9eff]/30"
              animate={{
                opacity: s === 8 ? 1 : 0,
                scale: s === 8 ? 1 : 0.8,
              }}
              transition={{ ...spring, delay: 0.7 }}
            >
              <span className="text-sm text-[#4a9eff] font-mono">[Source: Q3 Report]</span>
            </motion.div>
          </motion.div>

          {/* Green checkmark */}
          <motion.div
            className="flex justify-center mt-4"
            animate={{
              opacity: s === 8 ? 1 : 0,
              scale: s === 8 ? 1 : 0,
            }}
            transition={{ ...spring, delay: 0.9 }}
          >
            <div className="w-10 h-10 rounded-full bg-[#4ade80]/15 border-2 border-[#4ade80]/40 flex items-center justify-center">
              <span className="text-lg text-[#4ade80]">✓</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Step 9: RAG vs No RAG ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none px-6"
        animate={{ opacity: s === 9 ? 1 : 0 }}
        transition={spring}
      >
        <motion.div
          key={ex.question}
          className="px-3 py-1.5 rounded-lg border border-[#4a9eff]/30 bg-[#4a9eff]/5"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: s === 9 ? 1 : 0, y: 0 }}
          transition={spring}
        >
          <span className="text-sm text-[#4a9eff]">Question: &quot;{ex.question}&quot;</span>
        </motion.div>
        <div className="flex gap-6 max-w-2xl w-full">
          {/* Without RAG */}
          <motion.div
            className="flex-1 rounded-xl border-2 p-5"
            style={{
              borderColor: ragHighlight === 0 ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.25)',
              backgroundColor: ragHighlight === 0 ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.03)',
            }}
            animate={{
              opacity: s === 9 ? 1 : 0,
              x: s === 9 ? 0 : -20,
              scale: ragHighlight === 0 ? 1.02 : 1,
            }}
            transition={spring}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl text-[#ef4444]">✕</span>
              <span className="text-sm font-bold text-[#ef4444]">Without RAG</span>
            </div>
            <div className="bg-black/20 rounded-lg p-3 border border-white/5 mb-3">
              <p className="text-xs text-white/50 italic leading-relaxed">
                &quot;{ex.noRag}&quot;
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.span
                className="text-lg text-[#ef4444]"
                animate={{ scale: ragHighlight === 0 ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ✕
              </motion.span>
              <span className="text-sm text-[#ef4444]">{ex.noRagVerdict}</span>
            </div>
          </motion.div>

          {/* With RAG */}
          <motion.div
            className="flex-1 rounded-xl border-2 p-5"
            style={{
              borderColor: ragHighlight === 1 ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.25)',
              backgroundColor: ragHighlight === 1 ? 'rgba(74,222,128,0.08)' : 'rgba(74,222,128,0.03)',
            }}
            animate={{
              opacity: s === 9 ? 1 : 0,
              x: s === 9 ? 0 : 20,
              scale: ragHighlight === 1 ? 1.02 : 1,
            }}
            transition={{ ...spring, delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl text-[#4ade80]">✓</span>
              <span className="text-sm font-bold text-[#4ade80]">With RAG</span>
            </div>
            <div className="bg-black/20 rounded-lg p-3 border border-[#4ade80]/10 mb-3">
              <p className="text-xs text-white/70 leading-relaxed">
                &quot;
                {ex.rag.map((part, i) =>
                  part.b ? (
                    <span key={i} className="font-bold text-[#4ade80]">
                      {part.t}
                    </span>
                  ) : (
                    <span key={i}>{part.t}</span>
                  ),
                )}
                &quot;
              </p>
              <p className="text-xs text-[#4a9eff] mt-1 font-mono">[Source: {ex.source}]</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.span
                className="text-lg text-[#4ade80]"
                animate={{ scale: ragHighlight === 1 ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ✓
              </motion.span>
              <span className="text-sm text-[#4ade80]">Grounded, sourced, accurate</span>
            </div>
          </motion.div>
        </div>
        <motion.div animate={{ opacity: s === 9 ? 1 : 0 }} transition={{ ...spring, delay: 0.4 }}>
          <ExampleChips active={s === 9} idx={exIdx} onPick={setExIdx} />
        </motion.div>
      </motion.div>

      {/* ===== Step 10: The Full RAG Pipeline ===== */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 10 ? 1 : 0 }}
        transition={spring}
      >
        <motion.p
          className="text-xs text-white/30 uppercase tracking-wider text-center mb-8"
          animate={{ opacity: s === 10 ? 1 : 0 }}
          transition={spring}
        >
          The Full RAG Pipeline
        </motion.p>

        <div className="max-w-3xl w-full">
          <div className="flex items-center justify-between gap-1">
            {pipelineStages.map((stage, i) => (
              <motion.div
                key={stage.label}
                className="flex flex-col items-center relative"
                animate={{
                  opacity: s === 10 ? 1 : 0,
                  y: s === 10 ? 0 : 10,
                  scale: pulsePosIdx === i ? 1.15 : 1,
                }}
                transition={{ ...spring, delay: i * 0.08 }}
              >
                <motion.div
                  className="w-11 h-11 rounded-xl border-2 flex items-center justify-center mb-1"
                  style={{
                    borderColor: `${stage.color}40`,
                    backgroundColor: `${stage.color}10`,
                    boxShadow: pulsePosIdx === i ? `0 0 16px ${stage.color}50` : 'none',
                  }}
                >
                  <span className="text-lg">{stage.icon}</span>
                </motion.div>
                <span className="text-xs text-white/40">{stage.label}</span>

                {/* Arrow between stages */}
                {i < pipelineStages.length - 1 && (
                  <motion.span
                    className="absolute text-white/20 text-sm"
                    style={{ right: '-12px', top: '30%' }}
                    animate={{
                      color: pulsePosIdx === i ? `${stage.color}` : 'rgba(255,255,255,0.15)',
                    }}
                    transition={smooth}
                  >
                    →
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Pulse indicator */}
          <motion.div
            className="flex justify-center mt-6"
            animate={{ opacity: s === 10 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.8 }}
          >
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/40">
                Data flows left → right through the pipeline
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Step 11: When RAG Isn't Enough ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 11 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-2xl w-full">
          <motion.p
            className="text-xs text-white/30 uppercase tracking-wider text-center mb-6"
            animate={{ opacity: s === 11 ? 1 : 0 }}
            transition={spring}
          >
            When RAG Isn&apos;t Enough
          </motion.p>

          <div className="grid grid-cols-2 gap-5">
            {/* RAG can do */}
            <motion.div
              className="rounded-xl border border-[#4ade80]/20 bg-[#4ade80]/5 p-4"
              animate={{ opacity: s === 11 ? 1 : 0, x: s === 11 ? 0 : -20 }}
              transition={spring}
            >
              <p className="text-xs text-[#4ade80] font-bold mb-3">RAG Can Answer</p>
              {[
                'What were Q3 sales?',
                'Summarize the contract',
                'Find the relevant policy',
              ].map((task, i) => (
                <motion.div
                  key={task}
                  className="flex items-center gap-2 mb-2"
                  animate={{ opacity: s === 11 ? 1 : 0 }}
                  transition={{ ...spring, delay: 0.2 + i * 0.1 }}
                >
                  <span className="text-[#4ade80] text-sm">✓</span>
                  <span className="text-sm text-white/50">{task}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* RAG can't do */}
            <motion.div
              className="rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/5 p-4"
              animate={{ opacity: s === 11 ? 1 : 0, x: s === 11 ? 0 : 20 }}
              transition={{ ...spring, delay: 0.2 }}
            >
              <p className="text-xs text-[#ef4444] font-bold mb-3">RAG Cannot Act</p>
              {[
                { icon: '✈️', text: 'Book a flight' },
                { icon: '📧', text: 'Send an email' },
                { icon: '💻', text: 'Run code' },
              ].map((task, i) => (
                <motion.div
                  key={task.text}
                  className="flex items-center gap-2 mb-2"
                  animate={{ opacity: s === 11 ? 1 : 0 }}
                  transition={{ ...spring, delay: 0.3 + i * 0.1 }}
                >
                  <span className="text-sm">{task.icon}</span>
                  <span className="text-sm text-white/50">{task.text}</span>
                  <span className="text-[#ef4444] text-sm ml-auto">✕</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Arrow to agents */}
          <motion.div
            className="flex justify-center mt-5"
            animate={{
              opacity: s === 11 ? 1 : 0,
              y: s === 11 ? 0 : 10,
            }}
            transition={{ ...spring, delay: 0.7 }}
          >
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/30">
              <span className="text-xs text-white/50">For actions, you need...</span>
              <motion.span
                className="text-xl"
                animate={{ rotate: s === 11 ? [0, 360] : 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                ⚙️
              </motion.span>
              <span className="text-sm font-bold text-[#fbbf24]">Agents</span>
              <span className="text-white/30">→</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Try It Yourself (playground) ===== */}
      <AnimatePresence>
        {trigger === 'playground' && (
          <motion.div
            key="rag-playground"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RagPlayground />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Key Takeaways ===== */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: isTakeaways ? 1 : 0 }}
        transition={spring}
      >
        <div className="text-center max-w-2xl w-full px-6">
          <motion.h2
            className="text-4xl font-bold text-white mb-6"
            animate={{ opacity: isTakeaways ? 1 : 0, y: isTakeaways ? 0 : 20 }}
            transition={spring}
          >
            Key Takeaways
          </motion.h2>
          {takeaways.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4 mb-3 px-6 py-4 rounded-xl bg-white/5 border text-left"
              style={{ borderColor: `${item.color}30` }}
              animate={{ opacity: isTakeaways ? 1 : 0, y: isTakeaways ? 0 : 20 }}
              transition={{ ...spring, delay: i * 0.12 }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border"
                style={{
                  color: item.color,
                  borderColor: `${item.color}40`,
                  backgroundColor: `${item.color}15`,
                }}
              >
                {i + 1}
              </span>
              <span className="text-white/85 text-lg font-medium">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
