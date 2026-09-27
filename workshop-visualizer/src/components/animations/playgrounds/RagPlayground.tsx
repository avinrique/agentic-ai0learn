'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

const spring = { type: 'spring' as const, stiffness: 260, damping: 24 };

// ---------------------------------------------------------------------------
// Example data: a tiny, made-up company handbook split into chunks.
// ---------------------------------------------------------------------------
interface Chunk {
  id: number;
  title: string;
  icon: string;
  text: string;
}

const CHUNKS: Chunk[] = [
  { id: 1, title: 'Annual leave', icon: '🏖️', text: 'Full-time employees get 20 days of paid annual leave per year. Request leave in the HR portal at least 2 weeks ahead.' },
  { id: 2, title: 'Sick leave', icon: '🤒', text: 'You have up to 10 paid sick days per year. Tell your manager before 10am. A doctor’s note is needed after 3 days in a row.' },
  { id: 3, title: 'Wi-Fi password reset', icon: '📶', text: 'To reset your Wi-Fi password, sign in at it.acme.example/wifi and click “Reset password”. New passwords need 12+ characters.' },
  { id: 4, title: 'Refund rules', icon: '💸', text: 'Customers get a full refund within 30 days of purchase with a receipt. After 30 days we only offer store credit.' },
  { id: 5, title: 'Office hours', icon: '🕘', text: 'The office is open Monday to Friday, 8am to 6pm. It is closed on public holidays.' },
  { id: 6, title: 'Expenses', icon: '🧾', text: 'Submit expense receipts in the finance app within 30 days. Travel meals are paid back up to $40 per day.' },
  { id: 7, title: 'Remote work', icon: '🏠', text: 'Employees may work from home up to 2 days per week with manager approval.' },
  { id: 8, title: 'Laptop support', icon: '💻', text: 'For a broken laptop, open a ticket at it.acme.example/help. Replacement laptops ship within 3 business days.' },
  { id: 9, title: 'Parking', icon: '🚗', text: 'Staff parking is in Garage B. Pick up a parking pass from reception.' },
  { id: 10, title: 'Lost badge', icon: '🪪', text: 'Lost your security badge? Report it to security right away. A new badge costs $10.' },
];

interface PreparedQuestion {
  q: string;
  answer: string;
}

const QUESTIONS: PreparedQuestion[] = [
  { q: 'How many days of annual leave do I get?', answer: 'You get 20 days of paid annual leave per year. Request it in the HR portal at least 2 weeks ahead.' },
  { q: 'How do I reset my Wi-Fi password?', answer: 'Sign in at it.acme.example/wifi and click “Reset password”. Your new password needs at least 12 characters.' },
  { q: 'Can a customer get a refund after 30 days?', answer: 'No full refund after 30 days. Within 30 days (with a receipt) it is a full refund; after that, store credit only.' },
  { q: 'What time does the office open?', answer: 'The office opens at 8am, Monday to Friday (and closes at 6pm). It is closed on public holidays.' },
  { q: 'Is there a company gym?', answer: '' },
];

const NO_RAG_ANSWER =
  'I don’t have access to your company’s policies, so I can’t answer that. Please check your employee handbook or ask HR.';
const NOT_FOUND_ANSWER =
  'I couldn’t find that in the documents. You may want to ask HR directly.';

// ---------------------------------------------------------------------------
// Simple word-overlap scoring (real RAG uses embeddings).
// ---------------------------------------------------------------------------
const STOP = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'was', 'be', 'do', 'does', 'did', 'i', 'my', 'me', 'we', 'our', 'you', 'your',
  'how', 'what', 'when', 'where', 'who', 'why', 'which', 'can', 'could', 'should', 'will', 'would', 'to', 'of', 'in',
  'on', 'at', 'for', 'and', 'or', 'it', 'there', 'get', 'many', 'much', 'after', 'with', 'from', 'this', 'that', 'any',
  'have', 'has', 'if', 'about', 'please', 'tell', 'up', 'by', 'time',
]);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/-/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w));
}

function keywords(q: string): string[] {
  return Array.from(new Set(words(q).filter((w) => !STOP.has(w))));
}

const CHUNK_WORDS = CHUNKS.map((c) => new Set(words(`${c.title} ${c.text}`)));

interface Scored {
  chunk: Chunk;
  score: number;
  matched: string[];
}

function scoreAll(q: string): Scored[] {
  const kw = keywords(q);
  return CHUNKS.map((chunk, i) => {
    const matched = kw.filter((w) => CHUNK_WORDS[i].has(w));
    return { chunk, score: kw.length ? matched.length / kw.length : 0, matched };
  });
}

// Chunks below this score are treated as "not relevant".
const MIN_SCORE = 0.34;

function approxTokens(text: string) {
  // Illustrative: roughly 1.3 tokens per English word.
  return Math.round(text.split(/\s+/).length * 1.3);
}

const PHASES = ['Scoring', 'Ranking', 'Building prompt', 'Answering'];

export default function RagPlayground() {
  const [question, setQuestion] = useState(QUESTIONS[0].q);
  const [draft, setDraft] = useState('');
  const [topK, setTopK] = useState(2);
  const [phase, setPhase] = useState(0);
  const [runId, setRunId] = useState(0);

  // Animate phases each time a new question is asked
  useEffect(() => {
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setPhase(3), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [runId]);

  const ask = (q: string) => {
    if (!q.trim()) return;
    setQuestion(q.trim());
    setRunId((r) => r + 1);
  };

  const scored = useMemo(() => scoreAll(question), [question]);
  const ranked = useMemo(
    () => [...scored].sort((a, b) => b.score - a.score || a.chunk.id - b.chunk.id),
    [scored],
  );
  const list = phase >= 1 ? ranked : scored;
  const injected = ranked.filter((r) => r.score >= MIN_SCORE).slice(0, topK);
  const injectedIds = new Set(injected.map((r) => r.chunk.id));
  const found = injected.length > 0;
  const prepared = QUESTIONS.find((p) => p.q === question);
  const ragAnswer = !found
    ? NOT_FOUND_ANSWER
    : prepared && prepared.answer
      ? prepared.answer
      : `From the handbook (“${injected[0].chunk.title}”): ${injected[0].chunk.text}`;
  const isCustom = !prepared;
  const kw = keywords(question);
  const contextTokens = injected.reduce((sum, r) => sum + approxTokens(r.chunk.text), 0);

  return (
    <div className="absolute inset-0 flex flex-col px-5 py-3 gap-2 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40 uppercase tracking-wider font-bold">
          Try it yourself: a mini RAG search engine
        </p>
        <p className="text-xs text-white/35">Example data: a made-up company handbook (10 chunks)</p>
      </div>

      {/* Question chips + input */}
      <div className="flex flex-wrap items-center gap-1.5">
        {QUESTIONS.map((p) => {
          const active = p.q === question;
          return (
            <motion.button
              key={p.q}
              onClick={() => ask(p.q)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-2.5 py-1 rounded-full border text-xs transition-colors"
              style={{
                borderColor: active ? 'rgba(74,158,255,0.7)' : 'rgba(255,255,255,0.15)',
                backgroundColor: active ? 'rgba(74,158,255,0.18)' : 'rgba(255,255,255,0.04)',
                color: active ? '#cfe4ff' : 'rgba(255,255,255,0.65)',
              }}
            >
              {p.q}
            </motion.button>
          );
        })}
        <form
          className="flex items-center gap-1.5 ml-auto"
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="…or type your own question"
            className="w-56 px-2.5 py-1 rounded-lg bg-black/30 border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#4a9eff]/60"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#4a9eff]/20 border border-[#4a9eff]/40 text-[#8cc2ff] hover:bg-[#4a9eff]/30"
          >
            Ask
          </button>
        </form>
      </div>

      {/* Phase indicator */}
      <div className="flex items-center gap-2">
        {PHASES.map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            <motion.span
              className="px-2 py-0.5 rounded-md text-xs font-bold border"
              animate={{
                opacity: phase >= i ? 1 : 0.35,
                borderColor: phase === i ? 'rgba(251,191,36,0.7)' : 'rgba(255,255,255,0.12)',
                color: phase >= i ? '#fbbf24' : 'rgba(255,255,255,0.5)',
              }}
            >
              {i + 1}. {p}
            </motion.span>
            {i < PHASES.length - 1 && <span className="text-white/20 text-xs">→</span>}
          </div>
        ))}
        <span className="ml-auto text-xs text-white/40">
          Keywords:{' '}
          {kw.length ? (
            kw.map((k) => (
              <span key={k} className="ml-1 px-1.5 py-0.5 rounded bg-[#4a9eff]/15 text-[#8cc2ff] font-mono">
                {k}
              </span>
            ))
          ) : (
            <span className="text-white/30">none</span>
          )}
        </span>
      </div>

      {/* Main area */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* LEFT: ranked chunks */}
        <div className="w-[44%] flex flex-col min-h-0">
          <p className="text-xs text-white/45 mb-1">
            Handbook chunks, scored by <span className="text-[#fbbf24]">simple word-overlap</span>{' '}
            <span className="text-white/30">(real RAG uses embeddings)</span>
          </p>
          <div
            className="flex-1 min-h-0 flex flex-col gap-[3px] overflow-hidden"
            style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent)' }}
          >
            {list.map((r, i) => {
              const inPrompt = phase >= 2 && injectedIds.has(r.chunk.id);
              const weak = r.score > 0 && r.score < MIN_SCORE;
              return (
                <motion.div
                  key={r.chunk.id}
                  layout
                  transition={spring}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg border"
                  style={{
                    borderColor: inPrompt ? 'rgba(74,222,128,0.6)' : 'rgba(255,255,255,0.08)',
                    backgroundColor: inPrompt ? 'rgba(74,222,128,0.10)' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <span className="text-xs text-white/35 w-4 text-right font-mono">{phase >= 1 ? i + 1 : ''}</span>
                  <span className="text-sm">{r.chunk.icon}</span>
                  <span className="text-xs text-white/80 w-32 truncate">{r.chunk.title}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                    <motion.div
                      key={`${runId}-${r.chunk.id}`}
                      className="h-full rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${Math.round(r.score * 100)}%` }}
                      transition={{ duration: 0.7, delay: r.chunk.id * 0.04 }}
                      style={{
                        backgroundColor: r.score >= MIN_SCORE ? '#4ade80' : weak ? '#fbbf24' : '#64748b',
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono w-9 text-right" style={{ color: r.score >= MIN_SCORE ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                    {Math.round(r.score * 100)}%
                  </span>
                  {inPrompt && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[12px] font-bold text-[#4ade80]"
                    >
                      ✓ used
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
          {/* Top-k slider */}
          <div className="mt-2 flex items-center gap-3 px-2 py-1.5 rounded-lg border border-white/10 bg-white/[0.03]">
            <label htmlFor="rag-topk" className="text-xs text-white/70 font-bold whitespace-nowrap">
              Top-k = {topK}
            </label>
            <input
              id="rag-topk"
              type="range"
              min={1}
              max={3}
              step={1}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              onKeyDown={(e) => e.stopPropagation()}
              className="flex-1 min-w-0 accent-[#4ade80]"
            />
            <span className="text-xs text-white/50 shrink-0">
              best {topK} go in (score ≥ {Math.round(MIN_SCORE * 100)}%)
            </span>
          </div>
        </div>

        {/* RIGHT: prompt + answers */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 min-h-0">
          {/* Augmented prompt */}
          <motion.div
            className="rounded-xl border-2 p-2.5 flex flex-col gap-1.5 min-h-0 overflow-hidden"
            animate={{
              opacity: phase >= 2 ? 1 : 0.35,
              borderColor: phase >= 2 ? 'rgba(167,139,250,0.45)' : 'rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#a78bfa] uppercase tracking-wider">Augmented prompt</p>
              <p className="text-xs text-white/40">
                context ≈ {phase >= 2 ? contextTokens : 0} tokens <span className="text-white/25">(illustrative)</span>
              </p>
            </div>
            <div className="px-2 py-1 rounded border border-[#a78bfa]/25 bg-[#a78bfa]/5 text-xs text-white/60">
              <span className="text-[#a78bfa] font-bold font-mono">system:</span> Use ONLY the context below. If it isn’t there, say so.
            </div>
            <div className="flex flex-col gap-1 min-h-0 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {phase >= 2 &&
                  injected.map((r, i) => (
                    <motion.div
                      key={`${runId}-${r.chunk.id}`}
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ ...spring, delay: i * 0.15 }}
                      className="px-2 py-1 rounded border border-[#4ade80]/35 bg-[#4ade80]/8 text-xs text-white/75 leading-snug line-clamp-2 shrink-0"
                      style={{ backgroundColor: 'rgba(74,222,128,0.07)' }}
                    >
                      <span className="text-[#4ade80] font-bold font-mono">context [{r.chunk.title}]:</span> {r.chunk.text}
                    </motion.div>
                  ))}
                {phase >= 2 && injected.length === 0 && (
                  <motion.div
                    key={`${runId}-empty`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-2 py-1 rounded border border-dashed border-[#fbbf24]/40 text-xs text-[#fbbf24]/90"
                  >
                    No chunk scored high enough, so nothing is added.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="px-2 py-1 rounded border border-[#4a9eff]/25 bg-[#4a9eff]/5 text-xs text-white/75">
              <span className="text-[#4a9eff] font-bold font-mono">user:</span> {question}
            </div>
          </motion.div>

          {/* Answers */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
            <motion.div
              className="rounded-xl border-2 p-2.5"
              animate={{ opacity: phase >= 3 ? 1 : 0.25, y: phase >= 3 ? 0 : 8 }}
              style={{ borderColor: 'rgba(239,68,68,0.35)', backgroundColor: 'rgba(239,68,68,0.05)' }}
            >
              <p className="text-xs font-bold text-[#ef4444] mb-1">✕ Without RAG</p>
              <p className="text-xs text-white/65 leading-snug">{phase >= 3 ? NO_RAG_ANSWER : '…'}</p>
            </motion.div>
            <motion.div
              className="rounded-xl border-2 p-2.5"
              animate={{ opacity: phase >= 3 ? 1 : 0.25, y: phase >= 3 ? 0 : 8 }}
              transition={{ delay: 0.2 }}
              style={{
                borderColor: found ? 'rgba(74,222,128,0.45)' : 'rgba(251,191,36,0.45)',
                backgroundColor: found ? 'rgba(74,222,128,0.06)' : 'rgba(251,191,36,0.06)',
              }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: found ? '#4ade80' : '#fbbf24' }}>
                {found ? '✓ With RAG (grounded)' : '? With RAG: no match'}
              </p>
              <p className="text-xs text-white/85 leading-snug">{phase >= 3 ? ragAnswer : '…'}</p>
              {phase >= 3 && found && (
                <p className="text-[12px] text-[#4a9eff] font-mono mt-1">
                  [Source: {injected.map((r) => r.chunk.title).join(', ')}]
                </p>
              )}
            </motion.div>
          </div>
          <p className="text-[12px] text-white/35 shrink-0">
            {isCustom
              ? 'Simulated: for your own question, the “answer” just quotes the best chunk. A real model would write it in its own words.'
              : 'Prepared example answers. No real model is called here.'}
          </p>
        </div>
      </div>
    </div>
  );
}
