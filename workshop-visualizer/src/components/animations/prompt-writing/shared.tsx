'use client';
import { motion } from 'framer-motion';
import { ReactNode, useLayoutEffect, useRef, useState } from 'react';

export const spring = { type: 'spring' as const, stiffness: 240, damping: 24 };

// ---------- the ingredients of a prompt (one colour each, used everywhere in this lesson) ----------

export type IngId = 'task' | 'role' | 'context' | 'format' | 'example' | 'limits' | 'step' | 'fence';

export const ING: Record<IngId, { label: string; icon: string; color: string; question: string }> = {
  task: { label: 'Task', icon: '🎯', color: '#4a9eff', question: 'What should it do?' },
  role: { label: 'Role', icon: '🎭', color: '#a78bfa', question: 'Who should it be? (persona)' },
  context: { label: 'Context', icon: '🧭', color: '#4ade80', question: 'Who is it for, and why?' },
  format: { label: 'Format', icon: '📐', color: '#fbbf24', question: 'What shape and length?' },
  example: { label: 'Example', icon: '💡', color: '#f472b6', question: 'What does good look like?' },
  limits: { label: 'Limits', icon: '🚧', color: '#fb923c', question: 'What to include or avoid?' },
  step: { label: 'Step by step', icon: '🪜', color: '#22d3ee', question: 'Show the working?' },
  fence: { label: 'Fence """', icon: '🧱', color: '#cbd5e1', question: 'Where does pasted text start and end?' },
};

/** The six core ingredients, in the order Mia adds them. */
export const RECIPE: IngId[] = ['task', 'role', 'context', 'format', 'example', 'limits'];

// ---------- clarity meter ----------

// 'Crystal clear' only at 100, when nothing useful is missing (so it never fights a "next ingredient" tip).
export function clarityLook(value: number) {
  if (value < 30) return { word: 'Vague', color: '#f87171' };
  if (value < 60) return { word: 'Getting there', color: '#fb923c' };
  if (value < 85) return { word: 'Clear', color: '#fbbf24' };
  if (value < 100) return { word: 'Very clear', color: '#a3e635' };
  return { word: 'Crystal clear', color: '#4ade80' };
}

export function ClarityMeter({ value, width = 300, pretend = false }: { value: number; width?: number; pretend?: boolean }) {
  const look = clarityLook(value);
  return (
    <div style={{ width }}>
      <div className="flex items-baseline justify-between text-[13px] mb-1">
        <span className="font-semibold text-white/70">
          🔍 Clarity meter {pretend && <span className="font-normal text-white/50">(pretend)</span>}
        </span>
        <motion.span key={look.word} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-bold" style={{ color: look.color }}>
          {look.word}
        </motion.span>
      </div>
      <div className="relative h-3.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={false}
          animate={{ width: `${Math.max(4, value)}%`, backgroundColor: look.color }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
          <div key={t} className="absolute top-0 bottom-0 w-px bg-navy-900/60" style={{ left: `${t * 10}%` }} />
        ))}
      </div>
    </div>
  );
}

// ---------- rich text: **bold**, {{id|coloured bit}}, ~~wobbly (questionable) word~~, [placeholder] ----------

export function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\{\{(\w+)\|(.+?)\}\}|~~(.+?)~~|\[([^\]]+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={k++}><Rich text={m[1]} /></strong>);
    else if (m[2]) {
      const c = ING[m[2] as IngId]?.color ?? '#94a3b8';
      parts.push(
        <span key={k++} className="rounded px-0.5" style={{ backgroundColor: `${c}40`, boxShadow: `inset 0 -2px 0 ${c}` }}>
          <Rich text={m[3]} />
        </span>,
      );
    } else if (m[4]) {
      parts.push(
        <span key={k++} className="font-semibold text-red-600 underline decoration-wavy decoration-red-500 underline-offset-2">
          {m[4]}
        </span>,
      );
    } else if (m[5]) {
      parts.push(
        <span key={k++} className="rounded px-1 font-mono text-[0.9em] bg-red-100 text-red-700 border border-dashed border-red-300">
          [{m[5]}]
        </span>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

// ---------- one coloured part of a prompt ----------

export function Seg({ id, children, glow = false, dim = false, className = '' }: { id: IngId; children: ReactNode; glow?: boolean; dim?: boolean; className?: string }) {
  const c = ING[id].color;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -14 }}
      animate={{
        opacity: dim ? 0.6 : 1,
        x: 0,
        boxShadow: glow ? [`0 0 0px ${c}00`, `0 0 14px ${c}aa`, `0 0 0px ${c}00`] : `0 0 0px ${c}00`,
      }}
      transition={{ ...spring, boxShadow: glow ? { duration: 1.8, repeat: Infinity } : { duration: 0.3 } }}
      className={`rounded-md pl-2.5 pr-2 py-1 border-l-4 ${className}`}
      style={{ borderColor: c, backgroundColor: `${c}${glow ? '38' : '22'}` }}
    >
      {children}
    </motion.div>
  );
}

export function IngTag({ id, small = false }: { id: IngId; small?: boolean }) {
  const ing = ING[id];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${small ? 'px-2 py-0 text-[13px]' : 'px-2.5 py-0.5 text-[14px]'}`}
      style={{ color: '#0f172a', backgroundColor: ing.color }}
    >
      {ing.icon} {ing.label}
    </span>
  );
}

// ---------- people and props ----------

export function Mia({ size = 44, label = true, dark = false }: { size?: number; label?: boolean; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-full flex items-center justify-center border-2 border-[#f9a8d4] bg-[#f9a8d4]/15"
        style={{ width: size, height: size, fontSize: size * 0.55 }}
      >
        👧
      </div>
      {label && <div className={`text-[14px] font-semibold mt-0.5 ${dark ? 'text-[#1f2937]' : 'text-white'}`}>Mia</div>}
    </div>
  );
}

/**
 * One step's scene, centred in the panel. The scenes are designed for the ~1150x650 panel of a 1440x900 screen;
 * on a smaller panel (school laptops, projectors) the whole scene shrinks to fit instead of being cut off.
 */
export function Scene({ id, children, className = '', fit = true }: { id: string; children: ReactNode; className?: string; fit?: boolean }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!fit || !o || !i) return;
    const measure = () => {
      const cs = getComputedStyle(o);
      const aw = o.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const ah = o.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (!i.offsetWidth || !i.offsetHeight || aw <= 0 || ah <= 0) return;
      setScale(Math.min(1, aw / i.offsetWidth, ah / i.offsetHeight));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [fit]);
  return (
    <motion.div
      key={id}
      ref={outer}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`absolute inset-0 flex flex-col items-center justify-center px-6 py-4 ${className}`}
    >
      {fit ? (
        <div ref={inner} data-fit={scale.toFixed(3)} className="shrink-0 flex flex-col items-center" style={scale < 1 ? { transform: `scale(${scale})` } : undefined}>
          {children}
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}

/**
 * Fills its (absolutely positioned) parent. Below minW x minH it lays the children out at a bigger virtual size
 * and scales them down, so a flexible layout never has to squeeze under its minimum.
 */
export function FitFill({ minW, minH, children }: { minW: number; minH: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const s = box && box.w > 0 && box.h > 0 ? Math.min(1, box.w / minW, box.h / minH) : 1;
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        data-fit={s.toFixed(3)}
        style={{
          width: box && s < 1 ? box.w / s : '100%',
          height: box && s < 1 ? box.h / s : '100%',
          transform: s < 1 ? `scale(${s})` : undefined,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Bubble({ children, color = '#ffffff', delay = 0.2 }: { children: ReactNode; color?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...spring, delay }}
      className="relative rounded-2xl px-3 py-1.5 text-[14px] font-medium text-[#0f172a] shadow whitespace-nowrap"
      style={{ backgroundColor: color }}
    >
      {children}
    </motion.div>
  );
}
