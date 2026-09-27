'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';

// A hand-made 2D "meaning map". Real embeddings have hundreds or thousands of
// dimensions and are learned from text; this picture is a simplified illustration.

interface Cluster { name: string; color: string; label: [number, number] }
interface Word { w: string; x: number; y: number; c: string }

const CLUSTERS: Record<string, Cluster> = {
  animals: { name: 'ANIMALS', color: '#fbbf24', label: [120, 28] },
  royalty: { name: 'ROYALTY', color: '#4a9eff', label: [330, 48] },
  people: { name: 'PEOPLE', color: '#f472b6', label: [120, 252] },
  food: { name: 'FOOD', color: '#f87171', label: [300, 238] },
  places: { name: 'PLACES', color: '#4ade80', label: [540, 385] },
  tech: { name: 'TECH', color: '#22d3ee', label: [545, 22] },
};

// Offsets are chosen so the famous "word math" works on this picture:
// woman − man = queen − king,  paris − france = rome − italy,  kitten − cat = puppy − dog.
const WORDS: Word[] = [
  { w: 'dog', x: 80, y: 70, c: 'animals' },
  { w: 'cat', x: 150, y: 60, c: 'animals' },
  { w: 'puppy', x: 110, y: 110, c: 'animals' },
  { w: 'kitten', x: 180, y: 100, c: 'animals' },
  { w: 'horse', x: 55, y: 125, c: 'animals' },

  { w: 'king', x: 300, y: 80, c: 'royalty' },
  { w: 'queen', x: 370, y: 95, c: 'royalty' },
  { w: 'prince', x: 290, y: 130, c: 'royalty' },
  { w: 'princess', x: 360, y: 145, c: 'royalty' },

  { w: 'man', x: 90, y: 285, c: 'people' },
  { w: 'woman', x: 160, y: 300, c: 'people' },
  { w: 'boy', x: 80, y: 335, c: 'people' },
  { w: 'girl', x: 150, y: 350, c: 'people' },

  { w: 'pizza', x: 275, y: 280, c: 'food' },
  { w: 'pasta', x: 330, y: 305, c: 'food' },
  { w: 'sushi', x: 265, y: 345, c: 'food' },
  { w: 'banana', x: 345, y: 360, c: 'food' },

  { w: 'france', x: 450, y: 225, c: 'places' },
  { w: 'paris', x: 520, y: 180, c: 'places' },
  { w: 'italy', x: 470, y: 290, c: 'places' },
  { w: 'rome', x: 540, y: 245, c: 'places' },
  { w: 'japan', x: 500, y: 355, c: 'places' },
  { w: 'tokyo', x: 570, y: 310, c: 'places' },

  { w: 'computer', x: 490, y: 55, c: 'tech' },
  { w: 'laptop', x: 555, y: 75, c: 'tech' },
  { w: 'phone', x: 590, y: 120, c: 'tech' },
  { w: 'code', x: 505, y: 110, c: 'tech' },
];

const byName = Object.fromEntries(WORDS.map((w) => [w.w, w]));

interface Equation { a: string; minus: string; plus: string; result: string }
const EQUATIONS: Equation[] = [
  { a: 'king', minus: 'man', plus: 'woman', result: 'queen' },
  { a: 'paris', minus: 'france', plus: 'italy', result: 'rome' },
  { a: 'prince', minus: 'boy', plus: 'girl', result: 'princess' },
  { a: 'puppy', minus: 'dog', plus: 'cat', result: 'kitten' },
  { a: 'tokyo', minus: 'japan', plus: 'france', result: 'paris' },
];

const dist = (a: Word, b: Word) => Math.hypot(a.x - b.x, a.y - b.y);
// Show distances as small, friendly numbers.
const fmt = (d: number) => (d / 100).toFixed(2);

type Mode = 'neighbours' | 'math';

export default function LLMMeaningPlayground() {
  const [mode, setMode] = useState<Mode>('neighbours');
  const [selected, setSelected] = useState<string>('king');
  const [eqIdx, setEqIdx] = useState(0);
  const [runId, setRunId] = useState(0);

  const sel = byName[selected];
  const neighbours = useMemo(
    () => WORDS.filter((w) => w.w !== selected)
      .map((w) => ({ w, d: dist(sel, w) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 3),
    [sel, selected],
  );
  const farthest = useMemo(
    () => WORDS.filter((w) => w.w !== selected)
      .map((w) => ({ w, d: dist(sel, w) }))
      .sort((p, q) => q.d - p.d)[0],
    [sel, selected],
  );

  const eq = EQUATIONS[eqIdx];
  const A = byName[eq.a];
  const M = byName[eq.minus];
  const P = byName[eq.plus];
  const R = byName[eq.result];
  // Where the math actually lands. Nudged a little: in real models the answer is
  // the *nearest* word to the result, not an exact hit.
  const land = { x: A.x - M.x + P.x + 6, y: A.y - M.y + P.y - 5 };

  const highlighted = new Set<string>(
    mode === 'neighbours' ? [selected, ...neighbours.map((n) => n.w.w)] : [eq.a, eq.minus, eq.plus, eq.result],
  );

  const onWord = (w: string) => {
    if (mode !== 'neighbours') setMode('neighbours');
    setSelected(w);
  };

  return (
    <div className="h-full w-full flex gap-4 px-5 py-4 overflow-hidden">
      {/* Map */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="text-lg font-bold text-white">
            Try it: the <span className="text-accent-green">meaning map</span>
          </h3>
          <span className="text-xs text-white/40">A 2D sketch. Real embeddings have thousands of dimensions.</span>
        </div>
        <div className="flex-1 min-h-0 rounded-xl border border-white/10 bg-white/[0.02]">
          <svg viewBox="0 0 640 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <marker id="mm-arrow-pink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#f472b6" />
              </marker>
              <marker id="mm-arrow-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#4ade80" />
              </marker>
            </defs>

            {/* Cluster labels */}
            {Object.entries(CLUSTERS).map(([k, c]) => (
              <text key={k} x={c.label[0]} y={c.label[1]} textAnchor="middle" fill={c.color} fontSize="12" fontWeight="bold" opacity={0.55} letterSpacing="1.5">
                {c.name}
              </text>
            ))}

            {/* Neighbour lines */}
            <AnimatePresence>
              {mode === 'neighbours' && neighbours.map((n, i) => (
                <motion.g key={`${selected}-${n.w.w}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.line
                    x1={sel.x} y1={sel.y} x2={n.w.x} y2={n.w.y}
                    stroke="#4ade80" strokeWidth={2} strokeDasharray="5 4"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.12 }}
                  />
                </motion.g>
              ))}
              {mode === 'neighbours' && farthest && (
                <motion.g key={`far-${selected}`} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} transition={{ delay: 0.6 }}>
                  <line x1={sel.x} y1={sel.y} x2={farthest.w.x} y2={farthest.w.y} stroke="#f87171" strokeWidth={1} strokeDasharray="3 6" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* Word math arrows */}
            {mode === 'math' && (
              <g key={`math-${eqIdx}-${runId}`}>
                {/* the "difference" arrow: minus-word → plus-word */}
                <motion.line
                  x1={M.x} y1={M.y} x2={P.x} y2={P.y}
                  stroke="#f472b6" strokeWidth={2.5} markerEnd="url(#mm-arrow-pink)"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                />
                {/* same arrow, moved to start at A */}
                <motion.line
                  x1={A.x} y1={A.y} x2={land.x} y2={land.y}
                  stroke="#f472b6" strokeWidth={2.5} strokeDasharray="6 4" markerEnd="url(#mm-arrow-pink)"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.3 }}
                />
                {/* No text label here: the short arrow sits between two word labels and a label would cover them.
                    The side panel explains the arrow in words. */}
                {/* landing point */}
                <motion.circle
                  cx={land.x} cy={land.y} r={5} fill="#ffffff"
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2.1, type: 'spring', stiffness: 300, damping: 15 }}
                />
                <motion.circle
                  cx={R.x} cy={R.y} r={20} fill="none" stroke="#4ade80" strokeWidth={2.5}
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                  transition={{ delay: 2.4, duration: 0.6 }}
                />
              </g>
            )}

            {/* Words */}
            {WORDS.map((w) => {
              const c = CLUSTERS[w.c].color;
              const isSel = mode === 'neighbours' && w.w === selected;
              const lit = highlighted.has(w.w);
              return (
                <g key={w.w} onClick={() => onWord(w.w)} style={{ cursor: 'pointer' }}>
                  <circle cx={w.x} cy={w.y} r={16} fill="transparent" />
                  <motion.circle
                    cx={w.x} cy={w.y}
                    fill={c}
                    initial={false}
                    animate={{ r: isSel ? 9 : lit ? 7 : 5, opacity: lit ? 1 : 0.55 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  />
                  {isSel && (
                    <motion.circle
                      cx={w.x} cy={w.y} r={14} fill="none" stroke={c} strokeWidth={1.5}
                      initial={{ r: 12, opacity: 0.8 }}
                      animate={{ r: [12, 20, 12], opacity: [0.8, 0.1, 0.8] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                  )}
                  <motion.text
                    x={w.x + 11} y={w.y + 4}
                    fill={c} fontSize="13" fontWeight="bold"
                    stroke="#0a0e1a" strokeWidth={4} paintOrder="stroke" strokeLinejoin="round"
                    initial={false}
                    animate={{ opacity: lit ? 1 : 0.55 }}
                  >
                    {w.w}
                  </motion.text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Side panel */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3 pt-7 min-h-0">
        <div className="flex shrink-0 rounded-lg border border-white/15 overflow-hidden text-sm">
          {(['neighbours', 'math'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setRunId((r) => r + 1); }}
              className={`flex-1 py-1.5 font-bold transition-colors ${mode === m ? 'bg-accent-blue/20 text-accent-blue' : 'text-white/50 hover:bg-white/5'}`}
            >
              {m === 'neighbours' ? 'Neighbours' : 'Word math'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'neighbours' ? (
            <motion.div key="nb" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col gap-2">
              <p className="text-sm text-white/60">Click any word on the map.</p>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Selected</p>
                <p className="text-xl font-bold" style={{ color: CLUSTERS[sel.c].color }}>{selected}</p>
                <p className="text-xs text-white/40 uppercase tracking-wider mt-3 mb-1">Closest words</p>
                {neighbours.map((n, i) => (
                  <motion.div
                    key={`${selected}-${n.w.w}`}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex justify-between text-sm py-0.5"
                  >
                    <span className="font-bold" style={{ color: CLUSTERS[n.w.c].color }}>{n.w.w}</span>
                    <span className="font-mono text-accent-green">{fmt(n.d)}</span>
                  </motion.div>
                ))}
                {farthest && (
                  <div className="flex justify-between text-sm pt-1 mt-1 border-t border-white/10">
                    <span className="text-white/50">farthest: <span className="font-bold text-red-400">{farthest.w.w}</span></span>
                    <span className="font-mono text-red-400">{fmt(farthest.d)}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-white/45 leading-relaxed">
                Small distance = similar meaning. The model never got a list of categories; the groups come out of training on text.
              </p>
            </motion.div>
          ) : (
            <motion.div key="wm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col gap-2">
              <p className="text-sm text-white/60">Pick an equation:</p>
              {EQUATIONS.map((e, i) => (
                <motion.button
                  key={i}
                  onClick={() => { setEqIdx(i); setRunId((r) => r + 1); }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className={`px-3 py-1.5 rounded-lg border text-[13px] font-mono text-left whitespace-nowrap ${
                    i === eqIdx ? 'border-accent-green/60 bg-accent-green/10 text-accent-green' : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {e.a} − {e.minus} + {e.plus} ≈ {e.result}
                </motion.button>
              ))}
              <motion.p
                key={`${eqIdx}-${runId}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }}
                className="text-xs text-white/50 leading-relaxed"
              >
                The pink arrow is the step from <b className="text-white/80">{eq.minus}</b> to <b className="text-white/80">{eq.plus}</b>.
                Take the same step from <b className="text-white/80">{eq.a}</b> and you land next to <b className="text-accent-green">{eq.result}</b>.
                Real models land <i>near</i> the answer, not exactly on it.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
