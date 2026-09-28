'use client';
import { motion } from 'framer-motion';
import { KeyboardEvent, ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

// Shared pieces for the "Get Set Up" lesson: fake terminals, the station checklist,
// the Mac/Windows switch, and a few drawings (key, safe, cost meter).

export const CYAN = '#22d3ee';
export const GREEN = '#4ade80';
export const GOLD = '#fbbf24';
export const RED = '#f87171';
export const BLUE = '#4a9eff';
export const spring = { type: 'spring' as const, stiffness: 240, damping: 24 };

export type OS = 'win' | 'mac';

/** The lesson uses Space for play/pause. On a focused button, Space should press the button instead. */
export function keepSpaceForButtons(e: KeyboardEvent) {
  if (e.key === ' ' && (e.target as HTMLElement).closest('button')) e.stopPropagation();
}

/** A "Fix:" text made of plain words and commands. Only the commands get the code look, so they can't be mixed up with the words. */
export type FixPart = string | { cmd: string };

export function FixText({ parts, cmdSize = 13 }: { parts: FixPart[]; cmdSize?: number }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <span key={i}>{p}</span>
        ) : (
          <code key={i} className="font-mono px-1.5 py-0.5 rounded-md bg-black/40 border border-white/15 text-white whitespace-nowrap" style={{ fontSize: cmdSize }}>
            {p.cmd}
          </code>
        ),
      )}
    </>
  );
}

// ---------- the six stations ----------

export const STATIONS = [
  { icon: '🐍', name: 'Python', what: 'the language' },
  { icon: '📦', name: 'Code kit', what: 'all lesson programs' },
  { icon: '🧰', name: 'Toolbox', what: 'venv + pip' },
  { icon: '🔑', name: 'API key', what: 'your password' },
  { icon: '🔒', name: 'Secret safe', what: 'the .env file' },
  { icon: '🚀', name: 'First run', what: 'hello, AI!' },
];

function stationStyle(state: 'done' | 'current' | 'todo') {
  if (state === 'done') return { borderColor: `${GREEN}60`, backgroundColor: `${GREEN}18`, color: '#bbf7d0' };
  if (state === 'current') return { borderColor: `${CYAN}b0`, backgroundColor: `${CYAN}20`, color: '#e0fbff', fontWeight: 600 };
  return { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0)', color: 'rgba(255,255,255,0.35)' };
}

/** One station chip. `flipAt` (seconds) turns a current station into a finished one during the step. */
function StationChip({ icon, name, state, flipAt }: { icon: string; name: string; state: 'done' | 'current' | 'todo'; flipAt?: number }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    if (flipAt === undefined) return;
    const t = setTimeout(() => setFlipped(true), flipAt * 1000);
    return () => clearTimeout(t);
  }, [flipAt]);
  const shown = flipAt !== undefined && flipped ? 'done' : state;
  return (
    <motion.div
      animate={flipAt !== undefined && flipped ? { scale: [1, 1.22, 1] } : { scale: 1 }}
      transition={{ duration: 0.45 }}
      className="rounded-full border px-2.5 py-1 text-[13px] whitespace-nowrap transition-colors duration-300"
      style={stationStyle(shown)}
      title={name}
    >
      {shown === 'done' ? `✓ ${name}` : shown === 'current' ? `${icon} ${name}` : icon}
    </motion.div>
  );
}

/** Slim checklist row: finished stations shrink to "✓" chips, the current one is highlighted. */
export function StationStrip({ current, done, flipAt }: { current: number; done: number; flipAt?: number }) {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="text-[13px] font-semibold uppercase tracking-wider text-white/40 mr-1">Workshop</span>
      {STATIONS.map((s, i) => {
        const state = i < done ? 'done' : i === current ? 'current' : 'todo';
        return (
          <div key={s.name} className="flex items-center gap-1.5">
            {i > 0 && <div className="w-3 h-px" style={{ backgroundColor: state !== 'todo' ? `${GREEN}80` : 'rgba(255,255,255,0.12)' }} />}
            <StationChip icon={s.icon} name={s.name} state={state} flipAt={i === current && flipAt !== undefined ? flipAt : undefined} />
          </div>
        );
      })}
    </div>
  );
}

// ---------- Mac / Windows switch ----------

export function OsToggle({ os, setOs }: { os: OS; setOs: (o: OS) => void }) {
  const opts: { id: OS; label: string }[] = [
    { id: 'win', label: '🪟 Windows' },
    { id: 'mac', label: '🍎 Mac' },
  ];
  return (
    <div className="shrink-0 flex rounded-full border border-white/15 bg-white/[0.04] p-0.5" role="group" aria-label="Choose your computer">
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => setOs(o.id)}
          aria-pressed={os === o.id}
          className="px-3 py-1 rounded-full text-[13px] whitespace-nowrap transition-colors"
          style={os === o.id ? { backgroundColor: `${CYAN}30`, color: '#e0fbff', fontWeight: 600 } : { color: 'rgba(255,255,255,0.55)' }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---------- fake terminal ----------

export type Where = 'home' | 'kit';

export function promptText(os: OS, where: Where): string {
  if (os === 'mac') return `sam@MacBook ${where === 'kit' ? 'ai-course' : '~'} %`;
  // Windows' "Extract All" puts the ai-course folder inside a new ai-course-code folder.
  return where === 'kit' ? 'C:\\Users\\sam\\Downloads\\ai-course-code\\ai-course>' : 'C:\\Users\\sam>';
}

export type Tone = 'plain' | 'ok' | 'err' | 'dim' | 'warn' | 'ai' | 'note';

export type TermLine =
  | { t: 'cmd'; cmd: string; where?: Where; venv?: boolean; hlVenv?: boolean; hlFolder?: boolean }
  /** `typed` = what the student types after a question, like the "y" after [y/N]. `wait` = extra pause (seconds) before it appears. */
  | { t: 'out'; text: string; tone?: Tone; typed?: string; wait?: number }
  | { t: 'idle'; where?: Where; venv?: boolean; hlVenv?: boolean; hlFolder?: boolean };

const TONE: Record<Tone, string> = {
  plain: 'rgba(255,255,255,0.82)',
  ok: '#86efac',
  err: '#fca5a5',
  dim: 'rgba(255,255,255,0.45)',
  warn: '#fde68a',
  ai: '#e0e7ff',
  note: '#67e8f9',
};

function Prompt({ os, where = 'kit', venv, hlVenv, hlFolder, delay }: { os: OS; where?: Where; venv?: boolean; hlVenv?: boolean; hlFolder?: boolean; delay: number }) {
  const p = promptText(os, where);
  const folder = os === 'mac' ? (where === 'kit' ? 'ai-course' : '') : where === 'kit' ? 'ai-course' : '';
  const idx = folder && hlFolder ? p.lastIndexOf(folder) : -1;
  return (
    <span className="whitespace-pre">
      {venv && (
        <motion.span
          initial={hlVenv ? { backgroundColor: 'rgba(34,211,238,0)' } : false}
          animate={hlVenv ? { backgroundColor: 'rgba(34,211,238,0.28)' } : undefined}
          transition={{ delay: delay + 0.2 }}
          className="rounded-sm"
          style={{ color: hlVenv ? '#a5f3fc' : CYAN, fontWeight: hlVenv ? 700 : 400 }}
        >
          (.venv)
        </motion.span>
      )}
      {venv && ' '}
      <span style={{ color: os === 'mac' ? 'rgba(134,239,172,0.8)' : 'rgba(255,255,255,0.6)' }}>
        {idx >= 0 ? (
          <>
            {p.slice(0, idx)}
            <motion.span
              initial={{ backgroundColor: 'rgba(74,222,128,0)' }}
              animate={{ backgroundColor: 'rgba(74,222,128,0.3)' }}
              transition={{ delay: delay + 0.2 }}
              className="rounded-sm text-white font-bold"
            >
              {folder}
            </motion.span>
            {p.slice(idx + folder.length)}
          </>
        ) : (
          p
        )}
      </span>
      {os === 'mac' ? ' ' : ''}
    </span>
  );
}

function Cursor() {
  return (
    <motion.span
      className="inline-block align-middle ml-0.5"
      style={{ width: '0.6em', height: '1.1em', backgroundColor: 'rgba(255,255,255,0.8)' }}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 0.5, 1] }}
    />
  );
}

const TYPE_SPEED = 0.028; // seconds per character

/** Works out when each line should appear, so commands "type" and output follows. */
export function schedule(lines: TermLine[], start = 0.3): number[] {
  const at: number[] = [];
  let t = start;
  for (const l of lines) {
    if (l.t === 'out' && l.wait) t += l.wait;
    at.push(t);
    if (l.t === 'cmd') t += l.cmd.length * TYPE_SPEED + 0.45;
    else if (l.t === 'out') t += 0.13;
    else t += 0.1;
  }
  return at;
}

export function Terminal({
  os,
  lines,
  width = 860,
  fontSize = 16,
  height,
  start = 0.3,
  instant = false,
  scroll = false,
  title,
  children,
}: {
  os: OS;
  lines: TermLine[];
  width?: number | string;
  fontSize?: number;
  height?: number | string;
  start?: number;
  /** true = no typing animation (used by the playground, which adds lines one by one). */
  instant?: boolean;
  /** true = text starts at the top and the window scrolls to the newest line (like a real terminal). */
  scroll?: boolean;
  title?: string;
  children?: ReactNode;
}) {
  const at = instant ? lines.map(() => 0) : schedule(lines, start);
  const isMac = os === 'mac';
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scroll && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [scroll, lines.length]);
  return (
    <div
      className="rounded-xl overflow-hidden shadow-2xl border flex flex-col"
      style={{ width, height, borderColor: isMac ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.2)', backgroundColor: isMac ? '#10141f' : '#0c0c0c' }}
    >
      {/* title bar */}
      {isMac ? (
        <div className="relative flex items-center h-8 px-3 shrink-0" style={{ backgroundColor: '#262a36' }}>
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="absolute inset-x-0 text-center text-[13px] text-white/55 pointer-events-none">{title ?? 'Terminal — zsh'}</div>
        </div>
      ) : (
        <div className="flex items-center justify-between h-8 pl-3 shrink-0 bg-[#1f1f1f]">
          <div className="flex items-center gap-2 text-[13px] text-white/70">
            <span className="px-1 rounded-sm bg-black border border-white/30 font-mono text-[10px] leading-4 text-white/80">C:\</span>
            {title ?? 'Command Prompt'}
          </div>
          <div className="flex text-white/60 text-[13px]">
            <span className="w-10 text-center">—</span>
            <span className="w-10 text-center">☐</span>
            <span className="w-10 text-center">✕</span>
          </div>
        </div>
      )}
      {/* body */}
      <div
        ref={bodyRef}
        className={`flex-1 min-h-0 flex flex-col px-4 py-3 font-mono leading-[1.55] ${scroll ? 'overflow-y-auto justify-start' : 'overflow-hidden justify-end'}`}
        style={{ fontSize, scrollbarWidth: 'thin' }}
      >
        {lines.map((l, i) => {
          const key = `${i}-${l.t}`;
          if (l.t === 'out') {
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: at[i], duration: 0.15 }}
                className="whitespace-pre-wrap break-words"
                style={{ color: TONE[l.tone ?? 'plain'] }}
              >
                {l.text === '' ? '\u00a0' : l.text}
                {l.typed && <span className="text-white font-semibold">{l.typed}</span>}
              </motion.div>
            );
          }
          const isIdle = l.t === 'idle';
          return (
            <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: at[i], duration: 0.1 }} className="whitespace-pre-wrap break-all">
              <Prompt os={os} where={l.where} venv={l.venv} hlVenv={l.hlVenv} hlFolder={l.hlFolder} delay={at[i]} />
              {isIdle ? (
                <Cursor />
              ) : instant ? (
                // one unbreakable block: a long prompt pushes the whole command to the next line instead of splitting it
                <span className="inline-block whitespace-nowrap text-white font-semibold">{l.cmd}</span>
              ) : (
                <motion.span
                  className="inline-block align-bottom overflow-hidden whitespace-pre text-white font-semibold"
                  initial={{ width: 0 }}
                  animate={{ width: `${l.cmd.length}ch` }}
                  transition={{ delay: at[i] + 0.1, duration: l.cmd.length * TYPE_SPEED, ease: 'linear' }}
                >
                  {l.cmd}
                </motion.span>
              )}
            </motion.div>
          );
        })}
        {children}
      </div>
    </div>
  );
}

/** When the last line of a scheduled terminal appears (used to time things next to it). */
export function endTime(lines: TermLine[], start = 0.3) {
  const at = schedule(lines, start);
  return (at[at.length - 1] ?? start) + 0.3;
}

// ---------- commands that differ between Mac and Windows ----------

export const CMD = {
  version: (os: OS) => (os === 'mac' ? 'python3 --version' : 'python --version'),
  venv: (os: OS) => (os === 'mac' ? 'python3 -m venv .venv' : 'python -m venv .venv'),
  activate: (os: OS) => (os === 'mac' ? 'source .venv/bin/activate' : '.venv\\Scripts\\activate'),
  pip: () => 'pip install -r requirements.txt',
  copyEnv: (os: OS) => (os === 'mac' ? 'cp .env.example .env' : 'copy .env.example .env'),
  editEnv: (os: OS) => (os === 'mac' ? 'open -e .env' : 'notepad .env'),
  check: () => 'python check_setup.py',
  run: () => 'python run.py part1/basic_api.py',
  cd: (os: OS) => (os === 'mac' ? 'cd /Users/sam/Downloads/ai-course' : 'cd C:\\Users\\sam\\Downloads\\ai-course-code\\ai-course'),
};

// ---------- drawings ----------

/** A gold key with a paper tag, the lesson's picture of an API key. */
export function KeyArt({ size = 220, tag = 'sk-proj-…', glow = false }: { size?: number; tag?: string; glow?: boolean }) {
  // The paper tag grows with its text, so the key's name never spills out.
  const tagW = Math.round(30 + tag.length * 10.4);
  const W = 172 + tagW;
  return (
    <svg viewBox={`0 0 ${W} 110`} width={size} height={(size * 110) / W} aria-hidden className="overflow-visible">
      {glow && <circle cx="40" cy="55" r="44" fill={GOLD} opacity="0.14" />}
      {/* bow */}
      <circle cx="40" cy="55" r="26" fill={GOLD} stroke="#b45309" strokeWidth="3" />
      <circle cx="40" cy="55" r="10" fill="#0f0f2a" stroke="#b45309" strokeWidth="2" />
      {/* blade */}
      <rect x="64" y="48" width="96" height="14" rx="3" fill={GOLD} stroke="#b45309" strokeWidth="2.5" />
      <path d="M122 62 v14 h10 v-8 h8 v10 h10 v-16" fill={GOLD} stroke="#b45309" strokeWidth="2.5" strokeLinejoin="round" />
      {/* string + tag */}
      <path d="M40 29 Q80 2 172 20" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
      <g transform={`rotate(-3 ${172 + tagW / 2} 22)`}>
        <rect x="170" y="6" width={tagW} height="30" rx="4" fill="#fffdf7" stroke="#d6d3d1" />
        <circle cx="179" cy="21" r="3" fill="#0f0f2a" />
        <text x="188" y="27" fontSize="17" fontFamily="JetBrains Mono, monospace" fill="#1f2937">{tag}</text>
      </g>
    </svg>
  );
}

/** A locked safe labelled .env. Children are drawn inside the open door area. */
export function SafeBox({ width = 250, label = '.env', children, locked = true }: { width?: number; label?: string; children?: ReactNode; locked?: boolean }) {
  return (
    <div className="relative rounded-2xl border-4 p-3 pt-8" style={{ width, borderColor: '#64748b', background: 'linear-gradient(180deg,#334155,#1e293b)' }}>
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[14px] font-mono font-bold" style={{ backgroundColor: GREEN, color: '#052e16' }}>
        🔒 {label}
      </div>
      <div className="rounded-lg border-2 border-black/40 bg-black/30 min-h-[70px] flex items-center justify-center p-2">{children}</div>
      <div className="flex justify-between items-center mt-2 px-1">
        <div className="w-8 h-8 rounded-full border-4 border-slate-400 bg-slate-600 flex items-center justify-center text-[10px] text-white/70">{locked ? '●' : '○'}</div>
        <div className="text-[13px] text-white/55">stays on your computer</div>
      </div>
    </div>
  );
}

/** Small file tree row. */
export function FileRow({ icon, name, label, hl, delay = 0, color = CYAN }: { icon: string; name: string; label?: string; hl?: boolean; delay?: number; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...spring, delay }}
      className="flex items-center gap-3 rounded-md px-2 py-1"
      style={hl ? { backgroundColor: `${color}18`, outline: `1px solid ${color}60` } : undefined}
    >
      <span className="w-6 text-center text-[17px]">{icon}</span>
      <span className="font-mono text-[16px] text-white w-[180px]">{name}</span>
      {label && <span className="text-[14px] text-white/55">{label}</span>}
    </motion.div>
  );
}

// ---------- fit to the panel ----------

// useLayoutEffect warns during server rendering, so use it only in the browser.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Centers its content and shrinks it (never grows it) so it always fits the space it's given,
 * e.g. on a small laptop screen with the sidebar open. At full size nothing changes.
 */
export function FitBox({ children, className = '' }: { children: ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useIsoLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const fit = () => {
      if (!i.offsetWidth || !i.offsetHeight) return;
      const s = Math.min(1, o.clientWidth / i.offsetWidth, o.clientHeight / i.offsetHeight);
      setScale(Math.floor(s * 1000) / 1000);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={outer} className={`relative w-full h-full min-w-0 min-h-0 flex items-center justify-center ${className}`}>
      <div ref={inner} data-fit-scale={scale} className="shrink-0 flex flex-col items-center" style={{ transform: scale < 1 ? `scale(${scale})` : undefined }}>
        {children}
      </div>
    </div>
  );
}
