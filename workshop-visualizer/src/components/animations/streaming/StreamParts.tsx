'use client';
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useLayoutEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Small building blocks for StreamingAnim (Lesson 11). The icons and colours
// match ApiRoundTripAnim (Basic API) so this lesson reads as its sequel:
// blue laptop, green OpenAI server, green reply lane, purple response object.
// ─────────────────────────────────────────────────────────────────────────────

export const spring = { type: 'spring' as const, damping: 22, stiffness: 140 };
export const BLUE = '#4a9eff';
export const GREEN = '#4ade80';
export const PURPLE = '#a78bfa';
export const GOLD = '#fbbf24';
export const RED = '#f87171';

/** Counts real milliseconds since the step started (up to maxMs) while active; returns maxMs when not active. */
export function useClock(active: boolean, resetKey: string, maxMs: number) {
  const [state, setState] = useState({ key: '', t: 0 });
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    setState({ key: resetKey, t: 0 });
    const id = setInterval(() => {
      const t = Math.min(performance.now() - start, maxMs);
      setState({ key: resetKey, t });
      if (t >= maxMs) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [active, resetKey, maxMs]);
  if (!active) return maxMs;
  return state.key === resetKey ? state.t : 0;
}

/**
 * Content-box size of an element, kept up to date. Returns a callback ref (kept in state)
 * so the observer re-attaches when the element remounts (e.g. after the compare step).
 */
export function useSize<T extends HTMLElement>() {
  const [el, ref] = useState<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    if (!el) return;
    const read = () => {
      const cs = getComputedStyle(el);
      const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      setSize((old) => (old.w === w && old.h === h ? old : { w, h }));
    };
    const ro = new ResizeObserver(read);
    ro.observe(el);
    read();
    return () => ro.disconnect();
  }, [el]);
  return [ref, size] as const;
}

/** Height of an element, kept up to date. */
export function useHeight<T extends HTMLElement>() {
  const [ref, size] = useSize<T>();
  return [ref, size.h] as const;
}

/**
 * Holds one focal card in a slot: centred vertically, laid out at least `minWidth` wide,
 * and scaled down (never up) when the slot is shorter or narrower than the card, so it
 * never spills over its neighbours on small screens.
 */
export function FitBox({ children, minWidth = 470 }: { children: ReactNode; minWidth?: number }) {
  const [outer, setOuter] = useState<HTMLDivElement | null>(null);
  const [inner, setInner] = useState<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0, cw: 0, ch: 0 });
  useLayoutEffect(() => {
    if (!outer || !inner) return;
    const read = () => {
      const next = { w: outer.clientWidth, h: outer.clientHeight, cw: inner.scrollWidth, ch: inner.offsetHeight };
      setBox((old) => (old.w === next.w && old.h === next.h && old.cw === next.cw && old.ch === next.ch ? old : next));
    };
    const ro = new ResizeObserver(read);
    ro.observe(outer);
    ro.observe(inner);
    for (const c of Array.from(inner.children)) ro.observe(c);
    read();
    return () => ro.disconnect();
  }, [outer, inner, children]);
  const width = Math.max(box.w, minWidth);
  const s = box.w > 0 && box.ch > 0 ? Math.min(1, box.w / Math.max(width, box.cw), box.h / box.ch) : 1;
  return (
    <div ref={setOuter} className="relative h-full w-full min-w-0">
      <div
        ref={setInner}
        className="absolute left-0 top-1/2 flex flex-col items-start"
        style={{ width, transform: `translateY(-50%) scale(${s})`, transformOrigin: 'left center' }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * True when the inner element (pinned to the bottom of the outer one) spills out over its
 * top edge, so the caller can fade that edge instead of cutting a line in half.
 */
export function useSpillsOver<O extends HTMLElement, I extends HTMLElement>() {
  // Callback refs (kept in state) so the observer re-attaches when the elements remount.
  const [o, outer] = useState<O | null>(null);
  const [i, inner] = useState<I | null>(null);
  const [over, setOver] = useState(false);
  useEffect(() => {
    if (!o || !i) return;
    const check = () => setOver(i.getBoundingClientRect().top < o.getBoundingClientRect().top - 1);
    const ro = new ResizeObserver(check);
    ro.observe(o);
    ro.observe(i);
    check();
    return () => ro.disconnect();
  }, [o, i]);
  return [outer, inner, over] as const;
}

/** A piece as code would write it: quoted, with new lines shown as ↵ so spaces and line breaks are visible. */
export function quoted(p: string) {
  return `"${p.replace(/\n/g, '↵')}"`;
}

// ── Icons (same drawings as the Basic API lesson) ───────────────────────────
export function Envelope({ color, size = 36 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 40 28" fill="none">
      <rect x="1" y="1" width="38" height="26" rx="3" fill={`${color}33`} stroke={color} strokeWidth="2" />
      <path d="M2 3 L20 16 L38 3" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

export function KeyIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="12" viewBox="0 0 24 14" fill="none">
      <circle cx="6" cy="7" r="5" stroke={color} strokeWidth="2" />
      <path d="M11 7 H23 M19 7 V12 M15 7 V11" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function LaptopIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 26 18" fill="none">
      <rect x="4" y="1" width="18" height="12" rx="1.5" stroke={BLUE} strokeWidth="1.8" />
      <path d="M1 16 H25" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ServerIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="16" height="6" rx="1.5" stroke={color} strokeWidth="1.8" />
      <rect x="2" y="11" width="16" height="6" rx="1.5" stroke={color} strokeWidth="1.8" />
      <circle cx="5.5" cy="5" r="1" fill={color} />
      <circle cx="5.5" cy="14" r="1" fill={color} />
    </svg>
  );
}

// ── A chunk tile (one small piece of text travelling down the pipe) ─────────
export function Tile({ piece, big = false }: { piece: string | null; big?: boolean }) {
  // No text ("" or None) is drawn grey, so it never looks like a piece with text.
  const none = !piece;
  return (
    <span
      className={`inline-block rounded-lg border-2 font-mono whitespace-pre leading-none ${
        big ? 'px-3 py-2 text-[18px]' : 'px-2.5 py-1.5 text-[15px]'
      }`}
      style={{
        borderColor: none ? 'rgba(255,255,255,0.3)' : GREEN,
        background: none ? 'rgba(255,255,255,0.06)' : 'rgba(74,222,128,0.16)',
        color: none ? 'rgba(255,255,255,0.55)' : '#d1fae5',
        fontStyle: none ? 'italic' : 'normal',
      }}
    >
      {piece === null ? 'None' : quoted(piece)}
    </span>
  );
}

// ── One layer of a nested object (like the response object in Basic API) ────
export function Layer({
  name,
  lit,
  color,
  delay = 0,
  children,
}: {
  name: string;
  lit: boolean;
  color: string;
  delay?: number;
  children?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        borderColor: lit ? color : 'rgba(255,255,255,0.14)',
        backgroundColor: lit ? `${color}14` : 'rgba(255,255,255,0.02)',
      }}
      transition={{ ...spring, delay }}
      className="rounded-lg border px-3 py-1.5 min-w-0"
    >
      <span className="font-mono text-[15px] font-bold" style={{ color }}>
        {name}
      </span>
      {children && <div className="mt-1.5 pl-3 border-l border-white/10 space-y-1.5">{children}</div>}
    </motion.div>
  );
}

/** A dotted path like chunk.choices[0].delta.content, with one segment picked out. */
export function Path({ segs, hot, dim = false }: { segs: string[]; hot?: string; dim?: boolean }) {
  return (
    <div className={`font-mono text-[15px] whitespace-nowrap ${dim ? 'opacity-70' : ''}`}>
      {segs.map((s, i) => (
        <span
          key={i}
          className={s === hot ? 'rounded px-0.5 font-bold' : ''}
          style={{
            color: s === hot ? GOLD : i === segs.length - 1 ? GREEN : PURPLE,
            background: s === hot ? `${GOLD}22` : 'transparent',
            textDecoration: dim && s === hot ? 'line-through' : 'none',
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

/** Stage tracker across the top (same look as Basic API). */
export function StageTracker({ stages, now, allDone }: { stages: string[]; now: number; allDone: boolean }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap shrink-0">
      {stages.map((label, i) => {
        const isNow = i === now && !allDone;
        const isDone = i < now || allDone;
        return (
          <motion.div
            key={label}
            animate={{
              backgroundColor: isNow ? 'rgba(74,158,255,0.22)' : isDone ? 'rgba(74,222,128,0.10)' : 'rgba(255,255,255,0)',
              color: isNow ? '#ffffff' : isDone ? GREEN : 'rgba(255,255,255,0.35)',
            }}
            className="px-2.5 py-1 rounded-full text-[13px] font-medium whitespace-nowrap"
          >
            {isDone ? '✓ ' : `${i + 1}. `}
            {label}
          </motion.div>
        );
      })}
    </div>
  );
}
