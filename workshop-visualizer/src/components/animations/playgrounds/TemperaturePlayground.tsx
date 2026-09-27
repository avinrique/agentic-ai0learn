'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { TEMP_EXAMPLES, applyTemperature, applyTopP, pct } from './temperatureData';

const spring = { type: 'spring' as const, damping: 22, stiffness: 160 };

// Small seeded random generator so each "Sample 10 times" run is repeatable.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tempColor(T: number) {
  if (T < 0.5) return '#4a9eff';
  if (T < 1.2) return '#fbbf24';
  return '#ef4444';
}

function tempMood(T: number) {
  if (T < 0.01) return 'T = 0: always the top word (greedy)';
  if (T < 0.5) return 'Very focused: the top word almost always wins';
  if (T < 0.95) return 'Focused, with a little variety';
  if (T <= 1.05) return "The model's own chances, unchanged";
  if (T < 1.5) return 'Adventurous: other words get a real chance';
  return 'Wild: unlikely words get picked often';
}

interface SampleRun {
  id: number;
  picks: number[];
  T: number;
  p: number;
}

export default function TemperaturePlayground() {
  const [exIdx, setExIdx] = useState(0);
  const [T, setT] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [run, setRun] = useState<SampleRun | null>(null);
  const [runCount, setRunCount] = useState(0);

  const ex = TEMP_EXAMPLES[exIdx];
  const afterTemp = useMemo(() => applyTemperature(ex.tokens, T), [ex, T]);
  const { probs, kept } = useMemo(() => applyTopP(afterTemp, topP), [afterTemp, topP]);
  const color = tempColor(T);

  const sample10 = () => {
    const next = runCount + 1;
    const rand = mulberry32(next * 7919 + exIdx * 104729);
    const picks: number[] = [];
    for (let k = 0; k < 10; k++) {
      const r = rand();
      let acc = 0;
      let chosen = probs.length - 1;
      for (let i = 0; i < probs.length; i++) {
        acc += probs[i];
        if (r < acc) { chosen = i; break; }
      }
      // Skip zero-probability words (float safety).
      if (probs[chosen] === 0) chosen = probs.indexOf(Math.max(...probs));
      picks.push(chosen);
    }
    setRunCount(next);
    setRun({ id: next, picks, T, p: topP });
  };

  const distinct = run ? new Set(run.picks).size : 0;
  const stopKeys = (e: React.KeyboardEvent) => e.stopPropagation();

  return (
    <motion.div
      className="absolute inset-0 flex flex-col px-6 py-4 gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header + example chips */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold text-white/80">Try it yourself</span>
        <span className="text-xs text-white/40">Pick a prompt:</span>
        {TEMP_EXAMPLES.map((e, i) => (
          <motion.button
            key={e.id}
            onClick={() => { setExIdx(i); setRun(null); }}
            className="px-3 py-1 rounded-full border text-xs font-medium transition-colors"
            style={{
              borderColor: i === exIdx ? '#4a9eff' : 'rgba(255,255,255,0.12)',
              backgroundColor: i === exIdx ? 'rgba(74,158,255,0.15)' : 'rgba(255,255,255,0.03)',
              color: i === exIdx ? '#bfdbfe' : 'rgba(255,255,255,0.6)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            &quot;{e.prompt}&quot;
          </motion.button>
        ))}
      </div>

      <div className="flex-1 flex gap-5 min-h-0">
        {/* Left: controls */}
        <div className="w-[300px] shrink-0 flex flex-col gap-3">
          <div className="rounded-xl border p-3" style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-bold text-white/80">Temperature</span>
              <motion.span
                key={T.toFixed(2)}
                className="text-lg font-mono font-bold"
                style={{ color }}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {T.toFixed(2)}
              </motion.span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={T}
              onChange={(e) => setT(parseFloat(e.target.value))}
              onKeyDown={stopKeys}
              className="w-full cursor-pointer"
              style={{ accentColor: color }}
              aria-label="Temperature"
            />
            <div className="flex justify-between text-xs text-white/35 font-mono">
              <span>0</span><span>1</span><span>2</span>
            </div>
            <p className="text-xs mt-1" style={{ color }}>{tempMood(T)}</p>
          </div>

          <div className="rounded-xl border p-3 border-accent-pink/30 bg-accent-pink/5">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-bold text-white/80">Top-p</span>
              <span className="text-lg font-mono font-bold text-accent-pink">{topP.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              onKeyDown={stopKeys}
              className="w-full cursor-pointer"
              style={{ accentColor: '#f472b6' }}
              aria-label="Top-p"
            />
            <p className="text-xs text-white/50 mt-1">
              Keep only the top words whose chances add up to {Math.round(topP * 100)}%. The rest are cut.
            </p>
          </div>

          <motion.button
            onClick={sample10}
            className="rounded-xl border-2 border-accent-gold/50 bg-accent-gold/10 text-accent-gold font-bold text-sm py-2.5"
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(251,191,36,0.25)' }}
            whileTap={{ scale: 0.96 }}
          >
            🎲 Sample 10 times
          </motion.button>
          <p className="text-xs text-white/35 leading-snug">
            Illustrative chances (hand-written, not from a real model). The math is real: softmax(scores / T), then the top-p cut.
          </p>
        </div>

        {/* Right: bars + samples */}
        <div className="flex-1 flex flex-col min-w-0">
          <p className="text-base text-white/70 mb-1">
            &quot;{ex.prompt} <span className="text-accent-blue">___</span>&quot;
          </p>
          <p className="text-xs text-white/35 mb-3">
            Chance of each next word. The thin white tick shows the chance at T = 1.
          </p>

          <div className="space-y-2">
            {ex.tokens.map((tok, i) => {
              const v = probs[i];
              const cut = !kept[i] && afterTemp[i] > 0; // at T = 0 the others are already 0%, not "cut"
              return (
                <div key={`${ex.id}-${tok.label}`} className="flex items-center gap-3">
                  <span
                    className="w-24 text-right text-sm font-mono font-bold truncate"
                    style={{ color: cut ? 'rgba(255,255,255,0.25)' : tok.color, textDecoration: cut ? 'line-through' : 'none' }}
                  >
                    {tok.label}
                  </span>
                  <div className="flex-1 bg-white/5 rounded-full h-7 overflow-hidden relative border border-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: cut ? 'rgba(255,255,255,0.05)' : `${tok.color}40` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(v * 100, v > 0 ? 1 : 0)}%` }}
                      transition={spring}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-px bg-white/50"
                      style={{ left: `${tok.base}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-sm font-mono font-bold" style={{ color: cut ? 'rgba(255,255,255,0.25)' : tok.color }}>
                    {pct(v)}
                  </span>
                  <span className="w-10">
                    <AnimatePresence>
                      {cut && (
                        <motion.span
                          className="text-xs px-1.5 py-0.5 rounded border font-bold text-red-400 border-red-400/40 bg-red-400/10"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                        >
                          CUT
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Samples */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 flex-1 min-h-0">
            {!run ? (
              <p className="text-sm text-white/35 h-full flex items-center justify-center text-center">
                Press &quot;Sample 10 times&quot; to let the model pick the next word 10 times in a row.
              </p>
            ) : (
              <div>
                <p className="text-xs text-white/40 mb-2">
                  10 picks at T = {run.T.toFixed(2)}, top-p = {run.p.toFixed(2)}:
                </p>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence mode="popLayout">
                    {run.picks.map((pi, k) => {
                      const tok = ex.tokens[pi];
                      return (
                        <motion.span
                          key={`${run.id}-${k}`}
                          className="px-3 py-1 rounded-lg border text-sm font-mono font-bold"
                          style={{ color: tok.color, borderColor: `${tok.color}60`, backgroundColor: `${tok.color}15` }}
                          initial={{ opacity: 0, y: -30, scale: 0.5 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ ...spring, delay: k * 0.12 }}
                        >
                          {tok.label}
                        </motion.span>
                      );
                    })}
                  </AnimatePresence>
                </div>
                <motion.p
                  key={`sum-${run.id}`}
                  className="text-sm mt-3 font-medium"
                  style={{ color: distinct === 1 ? '#4a9eff' : distinct <= 2 ? '#fbbf24' : '#ef4444' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                >
                  {distinct === 1
                    ? 'Same word all 10 times: predictable.'
                    : `${distinct} different words in 10 picks: ${distinct <= 2 ? 'mostly the same, a little variety.' : 'lots of variety.'}`}
                </motion.p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
