'use client';
/**
 * Building blocks for RagCodeAnim (Lesson 23 – Code: RAG with Embeddings):
 * the number strip, the 2D meaning map, the similarity score bars, the
 * "arrows" picture of cosine similarity and the tiny worked example.
 * Everything is a pure function of its props.
 */
import { motion } from 'framer-motion';
import { RAG_DOCS, RagStory, rankedIdx, py2 } from '@/data/traces/rag-code';

export const ACCENT = '#a78bfa'; // Part 3 colour
export const BLUE = '#4a9eff'; // the question
export const GREEN = '#4ade80';
export const GOLD = '#fbbf24';
export const RED = '#f87171';

/** An embedding shown as its first 3 numbers + "…". */
export function NumberStrip({
  nums,
  color = GOLD,
  size = 17,
  delay = 0,
}: {
  nums: number[];
  color?: string;
  size?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.6 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay, duration: 0.45 }}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono whitespace-nowrap origin-left"
      style={{ fontSize: size, color, background: `${color}14`, border: `1.5px solid ${color}66` }}
    >
      <span className="text-white/40">[</span>
      {nums.map((n, i) => (
        <span key={i}>
          {n.toFixed(3)}
          <span className="text-white/40">,</span>
        </span>
      ))}
      <span className="text-white/50">…</span>
      <span className="text-white/40">]</span>
    </motion.div>
  );
}

/** A small document chip: icon + short name. */
export function DocChip({ i, glow, dim, color = GREEN }: { i: number; glow?: boolean; dim?: boolean; color?: string }) {
  const d = RAG_DOCS[i];
  // Solid backgrounds, so the map's distance lines never show through a chip.
  return (
    <div
      className="whitespace-nowrap rounded-full px-3 py-1.5 text-[14px] font-medium"
      style={{
        background: glow ? '#163a2c' : '#14143a',
        border: `1.5px solid ${glow ? color : dim ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.18)'}`,
        color: glow ? '#fff' : 'rgba(255,255,255,0.8)',
        boxShadow: glow ? `0 0 16px ${color}77` : 'none',
      }}
    >
      <span className="flex items-center gap-1.5" style={{ opacity: dim ? 0.45 : 1 }}>
        <span>{d.icon}</span>
        {d.short}
      </span>
    </div>
  );
}

// ─── The meaning map ────────────────────────────────────────────────────────
/** An illustrative 2D "meaning map": the question pin lands near the documents that mean something similar. */
export function MeaningMap({ story }: { story: RagStory }) {
  const top2 = rankedIdx(story).slice(0, 2);
  const [px, py] = story.pin;

  return (
    <div className="relative w-full h-[420px] rounded-xl border border-white/10 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.02)',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '26px 26px',
      }}
    >
      <div className="absolute left-3 bottom-2 text-[13px] text-white/40">🗺️ meaning map · illustrative</div>
      <div
        className="absolute left-3 top-3 z-10 flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[15px] font-semibold"
        style={{ background: '#0b1b33', border: `1.5px solid ${BLUE}`, color: '#cfe4ff' }}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px]" style={{ background: BLUE }}>❓</span>
        {story.question}
      </div>

      {/* Distance lines from the question to every document */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {RAG_DOCS.map((d, i) => {
          const near = story.found && top2.includes(i);
          return (
            <motion.line
              key={`${story.id}-${d.key}`}
              x1={px * 100}
              y1={py * 100}
              x2={d.pos[0] * 100}
              y2={d.pos[1] * 100}
              stroke={near ? GREEN : story.found ? 'rgba(255,255,255,0.28)' : `${RED}aa`}
              strokeWidth={near ? 3 : 1.5}
              strokeDasharray={near ? undefined : '5 6'}
              vectorEffect="non-scaling-stroke"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
            />
          );
        })}
      </svg>

      {/* Document chips */}
      {RAG_DOCS.map((d, i) => {
        const best = story.found && rankedIdx(story)[0] === i;
        return (
          <div
            key={d.key}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${d.pos[0] * 100}%`, top: `${d.pos[1] * 100}%` }}
          >
            <DocChip i={i} glow={best} dim={story.found && !top2.includes(i)} />
          </div>
        );
      })}

      {/* "Nothing close" ring for a question that matches nothing */}
      {!story.found && (
        // The outer div centres the ring on the pin; the inner one animates (its scale would override a translate).
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${px * 100}%`, top: `${py * 100}%`, width: 220, height: 220 }}>
          <motion.div
            className="relative w-full h-full rounded-full border-2 border-dashed"
            style={{ borderColor: `${GOLD}88` }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <span className="absolute left-1/2 -translate-x-1/2 bottom-4 text-[14px] font-semibold whitespace-nowrap" style={{ color: GOLD }}>
              nothing close
            </span>
          </motion.div>
        </div>
      )}

      {/* The question pin */}
      <motion.div
        key={story.id}
        className="absolute"
        style={{ left: `${px * 100}%`, top: `${py * 100}%` }}
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 11, stiffness: 140, delay: 0.15 }}
      >
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-[17px]"
          style={{ background: BLUE, boxShadow: `0 0 18px ${BLUE}` }}
        >
          ❓
        </div>
      </motion.div>
    </div>
  );
}

// ─── Score bars ─────────────────────────────────────────────────────────────
export type BarMode = 'scores' | 'rank' | 'top2';

/** One bar per document. 'scores' = code order; 'rank' = best first; 'top2' = best first with the top 2 kept. */
export function ScoreBars({ story, mode }: { story: RagStory; mode: BarMode }) {
  const ranked = rankedIdx(story);
  const order = mode === 'scores' ? RAG_DOCS.map((_, i) => i) : ranked;
  const best = ranked[0];
  const keep = ranked.slice(0, 2);

  const colorOf = (i: number) => {
    if (mode === 'top2') return keep.includes(i) ? (story.found ? GREEN : GOLD) : 'rgba(255,255,255,0.25)';
    if (i === best) return story.found ? GREEN : GOLD;
    return BLUE;
  };

  return (
    <div className="w-full max-w-[720px] flex flex-col gap-2.5">
      <div className="flex items-center gap-2 text-[13px] text-white/45 pl-1">
        <span>📊 similarity to the question · illustrative</span>
        <span className="ml-auto font-mono">0 ……… 1</span>
      </div>
      {order.map((i, pos) => {
        const d = RAG_DOCS[i];
        const score = story.scores[i];
        const dimmed = mode === 'top2' && !keep.includes(i);
        return (
          <div key={d.key} className="contents">
            <motion.div
              layout
              transition={{ layout: { duration: 0.7, ease: 'easeInOut' } }}
              className="flex items-center gap-3"
              animate={{ opacity: dimmed ? 0.3 : 1 }}
            >
              <div className="w-7 text-right font-mono text-[15px] text-white/45">{mode === 'scores' ? '' : `#${pos + 1}`}</div>
              <div className="w-[150px] flex items-center gap-2 text-[15px] text-white/90 whitespace-nowrap">
                <span>{d.icon}</span>
                {d.short}
              </div>
              <div className="flex-1 h-8 rounded-md bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-md"
                  initial={{ width: 0 }}
                  animate={{ width: `${score * 100}%`, backgroundColor: colorOf(i) }}
                  transition={{ duration: 0.6, delay: mode === 'scores' ? 0.1 + i * 0.12 : 0 }}
                />
              </div>
              <div className="w-14 font-mono text-[17px] font-semibold" style={{ color: colorOf(i) }}>
                {py2(score)}
              </div>
            </motion.div>
            {mode === 'top2' && pos === 1 && (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 pl-10 text-[13px] font-semibold"
                style={{ color: story.found ? GREEN : GOLD }}
              >
                <span>✂️ ranked[:2]: keep these 2</span>
                <span className="flex-1 border-t-2 border-dashed" style={{ borderColor: `${story.found ? GREEN : GOLD}88` }} />
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Cosine similarity as arrows ────────────────────────────────────────────
function ArrowPair({ id, a, b, labelA, labelB, score, color, verdict }: {
  id: string;
  a: number; // angle in degrees
  b: number;
  labelA: string;
  labelB: string;
  score: string;
  color: string;
  verdict: string;
}) {
  const ox = 30;
  const oy = 200;
  const len = 170;
  const tip = (deg: number) => [ox + len * Math.cos((deg * Math.PI) / 180), oy - len * Math.sin((deg * Math.PI) / 180)];
  const [ax, ay] = tip(a);
  const [bx, by] = tip(b);
  const arc = (r: number) => {
    const [x1, y1] = [ox + r * Math.cos((a * Math.PI) / 180), oy - r * Math.sin((a * Math.PI) / 180)];
    const [x2, y2] = [ox + r * Math.cos((b * Math.PI) / 180), oy - r * Math.sin((b * Math.PI) / 180)];
    return `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`;
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={300} height={225} viewBox="0 0 300 225" aria-hidden className="overflow-visible">
        <defs>
          {[BLUE, GOLD].map((c, i) => (
            <marker key={c} id={`${id}-head-${i}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
            </marker>
          ))}
        </defs>
        <path d={arc(55)} fill="none" stroke={color} strokeWidth={2} strokeDasharray="4 4" />
        {[
          [ax, ay, BLUE],
          [bx, by, GOLD],
        ].map(([x, y, c], i) => (
          <motion.line
            key={i}
            x1={ox}
            y1={oy}
            x2={x as number}
            y2={y as number}
            stroke={c as string}
            strokeWidth={4}
            strokeLinecap="round"
            markerEnd={`url(#${id}-head-${i})`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.25 }}
          />
        ))}
        <circle cx={ox} cy={oy} r={4} fill="white" />
        <text x={ax + 6} y={ay - 6} fill={BLUE} fontSize={14} fontWeight={600}>{labelA}</text>
        <text x={bx + 8} y={by + 5} fill={GOLD} fontSize={14} fontWeight={600}>{labelB}</text>
      </svg>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[26px] font-bold" style={{ color }}>{score}</span>
        <span className="text-[15px] font-semibold" style={{ color }}>{verdict}</span>
      </div>
    </div>
  );
}

/** Two pairs of arrows: nearly the same direction (≈0.9) vs very different directions (≈0.1). */
export function SimilarityArrows() {
  // cos(25°) ≈ 0.91, cos(84°) ≈ 0.10
  return (
    <div className="flex items-end justify-center gap-10">
      <ArrowPair id="alike" a={55} b={30} labelA="take out books" labelB="borrow books" score="≈ 0.9" color={GREEN} verdict="same direction" />
      <ArrowPair id="apart" a={89} b={5} labelA="borrow books" labelB="lunch times" score="≈ 0.1" color={RED} verdict="far apart" />
    </div>
  );
}

// ─── The tiny worked example: similarity([1, 2, 2], [2, 1, 2]) ───────────────
const A = [1, 2, 2];
const B = [2, 1, 2];

export function WorkedExample({ part }: { part: 'dot' | 'length' }) {
  const products = A.map((x, i) => x * B[i]);
  const dot = products.reduce((s, x) => s + x, 0); // 8
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-[13px] text-white/45">tiny example: 3 numbers instead of 1,536</div>
      <div className="flex gap-8 font-mono text-[20px]">
        <span><span style={{ color: BLUE }}>a</span> = [{A.join(', ')}]</span>
        <span><span style={{ color: GOLD }}>b</span> = [{B.join(', ')}]</span>
      </div>

      {part === 'dot' ? (
        <div className="flex flex-col items-center gap-4">
          {/* zip pairs up matching numbers */}
          <div className="flex items-center gap-3">
            {A.map((x, i) => (
              <div key={i} className="flex items-center gap-3">
                {i > 0 && <span className="text-[24px] text-white/50">+</span>}
                <motion.div
                  initial={{ y: -14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.25 }}
                  className="flex flex-col items-center rounded-xl px-4 py-2 border-2 font-mono"
                  style={{ borderColor: `${ACCENT}88`, background: `${ACCENT}12` }}
                >
                  <span className="text-[20px]" style={{ color: BLUE }}>{x}</span>
                  <span className="text-[15px] text-white/50">×</span>
                  <span className="text-[20px]" style={{ color: GOLD }}>{B[i]}</span>
                  <span className="mt-1 border-t border-white/20 pt-1 text-[20px] font-bold text-white">{products[i]}</span>
                </motion.div>
              </div>
            ))}
            <span className="text-[24px] text-white/50">=</span>
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="font-mono text-[34px] font-bold"
              style={{ color: GREEN }}
            >
              {dot}
            </motion.span>
          </div>
          <div className="text-[14px] text-white/55">zip pairs them up · multiply · add = dot product</div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full px-3 py-1 text-[13px] bg-white/5 text-white/60 font-mono">✓ dot = {dot}</div>
          <div className="flex gap-6 font-mono text-[17px]">
            <span><span style={{ color: BLUE }}>length_a</span> = √(1+4+4) = 3</span>
            <span><span style={{ color: GOLD }}>length_b</span> = √(4+1+4) = 3</span>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl px-6 py-3 border-2 font-mono text-[28px] font-bold"
            style={{ borderColor: GREEN, background: `${GREEN}14`, color: GREEN }}
          >
            {dot} ÷ (3 × 3) = {(dot / 9).toFixed(2)}
          </motion.div>
          <div className="text-[15px] font-semibold" style={{ color: GREEN }}>very alike</div>
        </div>
      )}
    </div>
  );
}
