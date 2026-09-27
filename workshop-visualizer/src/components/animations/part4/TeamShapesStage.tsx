'use client';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import AgentBot, { TEAM, BotMood } from '../characters/AgentBot';

// Shared drawing pieces for the Team Shapes lesson (scenes + playground).
// A "stage" is a box where robots stand at (x %, y px) and sticky notes fly
// between them. Positions are plain numbers so every step renders the same way.

export type Who = keyof typeof TEAM | 'you';
export interface Pt {
  x: number; // % of stage width
  y: number; // px from stage top
}
export interface StageBot {
  who: Who;
  x: number;
  y: number;
  mood?: BotMood;
  active?: boolean;
  dimmed?: boolean;
  role?: string;
}
export interface StageNote {
  id: string;
  from: Pt;
  to: Pt;
  text: string;
  title?: string;
  color: string;
  tone?: 'note' | 'red' | 'green' | 'final';
  delay?: number;
  width?: number;
}
export interface StageArrow {
  from: Pt;
  to: Pt;
  color?: string;
  dashed?: boolean;
  dim?: boolean;
}

export const ACCENT = '#22d3ee';
export const YOU_COLOR = '#e2e8f0';

export function whoColor(w: Who) {
  return w === 'you' ? YOU_COLOR : TEAM[w].color;
}
export function whoName(w: Who) {
  return w === 'you' ? 'You' : TEAM[w].name;
}
export function whoBadge(w: Who) {
  return w === 'you' ? '🧑' : TEAM[w].badge;
}

export function YouBadge({ size = 72, active, dimmed }: { size?: number; active?: boolean; dimmed?: boolean }) {
  const d = Math.round(size * 0.8);
  return (
    <motion.div
      className="flex flex-col items-center select-none"
      animate={{ opacity: dimmed ? 0.35 : 1, y: active ? [0, -5, 0] : 0 }}
      transition={active ? { y: { repeat: Infinity, duration: 0.9 } } : { duration: 0.3 }}
      style={{ width: size }}
    >
      <div
        className="rounded-full flex items-center justify-center border-2"
        style={{
          width: d,
          height: d,
          marginTop: size * 0.2,
          fontSize: d * 0.5,
          borderColor: active ? ACCENT : 'rgba(255,255,255,0.25)',
          background: 'rgba(255,255,255,0.06)',
        }}
      >
        🧑
      </div>
      <div className="text-[13px] font-semibold text-white leading-tight mt-1">You</div>
      <div className="text-[12px] text-white/50 leading-tight">the user</div>
    </motion.div>
  );
}

export function Bot({ who, size = 72, mood, active, dimmed, role, hideRole }: {
  who: Who;
  size?: number;
  mood?: BotMood;
  active?: boolean;
  dimmed?: boolean;
  role?: string;
  hideRole?: boolean;
}) {
  if (who === 'you') return <YouBadge size={size} active={active} dimmed={dimmed} />;
  const t = TEAM[who];
  const caption = hideRole ? undefined : role ?? t.role;
  // AgentBot's own caption is small, so the job caption is drawn here at a readable size.
  return (
    <div className="flex flex-col items-center">
      <AgentBot
        color={t.color}
        badge={t.badge}
        name={`${t.name} ${t.badge}`}
        mood={mood ?? (active ? 'working' : 'happy')}
        size={size}
        active={active}
        dimmed={dimmed}
      />
      {caption && (
        <motion.div
          className="text-[13px] text-white/55 leading-tight text-center whitespace-nowrap"
          initial={false}
          animate={{ opacity: dimmed ? 0.35 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {caption}
        </motion.div>
      )}
    </div>
  );
}

const noteTones = {
  note: { bg: '#fef3c7', text: '#1f2937', title: '#78350f' },
  red: { bg: '#ffe4e6', text: '#9f1239', title: '#be123c' },
  green: { bg: '#dcfce7', text: '#14532d', title: '#15803d' },
  final: { bg: '#ecfeff', text: '#0f172a', title: '#0e7490' },
};

/** A sticky note that flies from one point to another and stays there, readable. */
export function FlyingNote({ note }: { note: StageNote }) {
  const tone = noteTones[note.tone ?? 'note'];
  return (
    <motion.div
      className="absolute z-20 pointer-events-none"
      style={{ width: note.width ?? 210, x: '-50%' }}
      initial={{ left: `${note.from.x}%`, top: note.from.y, opacity: 0, scale: 0.5, rotate: -6 }}
      animate={{ left: `${note.to.x}%`, top: note.to.y, opacity: 1, scale: 1, rotate: note.tone === 'red' ? 1.5 : -1.5 }}
      transition={{ duration: 1, delay: note.delay ?? 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className="rounded-md px-2.5 py-1.5 shadow-lg shadow-black/40"
        style={{ background: tone.bg, borderLeft: `5px solid ${note.color}` }}
      >
        {note.title && (
          <div className="text-[12px] font-bold leading-tight mb-1" style={{ color: tone.title }}>
            {note.title}
          </div>
        )}
        <div className="text-[13px] leading-snug font-medium" style={{ color: tone.text }}>
          {note.text}
        </div>
      </div>
    </motion.div>
  );
}

function markerId(color: string) {
  return `ts-arrow-${color.replace('#', '')}`;
}

export function Stage({
  height,
  bots,
  notes = [],
  arrows = [],
  size = 72,
  children,
  className = '',
}: {
  height: number;
  bots: StageBot[];
  notes?: StageNote[];
  arrows?: StageArrow[];
  size?: number;
  children?: ReactNode;
  className?: string;
}) {
  const colors = Array.from(new Set(arrows.map((a) => a.color ?? '#94a3b8')));
  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" aria-hidden>
        <defs>
          {colors.map((c) => (
            <marker key={c} id={markerId(c)} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill={c} />
            </marker>
          ))}
        </defs>
        {arrows.map((a, i) => {
          const c = a.color ?? '#94a3b8';
          return (
            <motion.line
              key={i}
              x1={`${a.from.x}%`}
              y1={a.from.y}
              x2={`${a.to.x}%`}
              y2={a.to.y}
              stroke={c}
              strokeWidth={2.5}
              strokeDasharray={a.dashed ? '6 6' : undefined}
              markerEnd={`url(#${markerId(c)})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: a.dim ? 0.2 : 0.8 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
            />
          );
        })}
      </svg>
      {bots.map((b) => (
        <div
          key={b.who}
          className="absolute z-10"
          style={{ left: `${b.x}%`, top: b.y, transform: 'translateX(-50%)' }}
        >
          <Bot who={b.who} size={size} mood={b.mood} active={b.active} dimmed={b.dimmed} role={b.role} />
        </div>
      ))}
      {children}
      {notes.map((n) => (
        <FlyingNote key={n.id} note={n} />
      ))}
    </div>
  );
}

export function CallCounter({ count, label = 'API calls' }: { count: number; label?: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[13px] font-semibold"
      style={{ borderColor: `${ACCENT}55`, background: `${ACCENT}14`, color: '#a5f3fc' }}
    >
      <span>📞 {label}:</span>
      <motion.span
        key={count}
        initial={{ scale: 1.6, color: '#ffffff' }}
        animate={{ scale: 1, color: '#a5f3fc' }}
        transition={{ duration: 0.4 }}
        className="inline-block text-[15px] tabular-nums"
      >
        {count}
      </motion.span>
    </div>
  );
}

export function TaskCard({ text, who = 'you' }: { text: string; who?: Who }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-[14px] text-white"
    >
      <span>{whoBadge(who)}</span>
      <span className="text-white/50">{whoName(who)}:</span>
      <span className="font-medium">“{text}”</span>
    </motion.div>
  );
}

export function SceneLabel({ children, color = ACCENT }: { children: ReactNode; color?: string }) {
  return (
    <div className="text-[12px] uppercase tracking-wider font-semibold" style={{ color }}>
      {children}
    </div>
  );
}
