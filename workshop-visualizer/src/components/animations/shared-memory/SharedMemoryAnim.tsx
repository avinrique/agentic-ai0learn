'use client';
/**
 * SharedMemoryAnim — Lesson 32 (Code: A Shared Whiteboard).
 *
 * A big classroom whiteboard in the middle; the Teacher, Rita, Milo and Wally
 * stand in a row below it. An agent steps up to read (the notes it reads glow),
 * then sticks its own labelled note on the board. A small counter shows the
 * board growing in (rough) tokens. Job cards, replies and the "catch" scenes
 * appear as one centred card over the dimmed board. Everything is derived from
 * the current tracer step, so Prev/Next/jumps always look right.
 */
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import AgentBot, { TEAM, BotMood } from '@/components/animations/characters/AgentBot';
import { useTracerStore } from '@/stores/tracerStore';
import { useShortScreen, useTracerScene } from '@/components/animations/part4/useTracerScene';
import {
  sharedMemoryStories,
  boardNotes,
  roughTokens,
  type Author,
  type Borrow,
  type SharedMemoryStory,
} from '@/data/traces/shared-memory';

const ACCENT = '#22d3ee';
const RED = '#f87171';

const WHO: Record<Author, { color: string; ink: string; tint: string }> = {
  Teacher: { color: '#fb923c', ink: '#c2410c', tint: '#fed7aa' },
  Rita: { color: TEAM.researcher.color, ink: '#1d4ed8', tint: '#bfdbfe' },
  Milo: { color: TEAM.math.color, ink: '#6d28d9', tint: '#ddd6fe' },
  Wally: { color: TEAM.writer.color, ink: '#15803d', tint: '#bbf7d0' },
};
const AGENTS: Record<Exclude<Author, 'Teacher'>, { bot: (typeof TEAM)[keyof typeof TEAM]; prompt: string; out: string }> = {
  Rita: { bot: TEAM.researcher, prompt: 'rita_prompt', out: 'ideas' },
  Milo: { bot: TEAM.math, prompt: 'milo_prompt', out: 'shopping' },
  Wally: { bot: TEAM.writer, prompt: 'wally_prompt', out: 'invite' },
};
const ROW: Author[] = ['Teacher', 'Rita', 'Milo', 'Wally'];
/** Where a new note flies in from (the author's spot in the row below the board). */
const FROM_X: Record<Author, number> = { Teacher: -300, Rita: -100, Milo: 100, Wally: 300 };

/** The words to highlight in each job card (the habit or key idea on it). */
const CARD_MARK: Record<Exclude<Author, 'Teacher'>, string> = {
  Rita: 'Keep it short',
  Milo: 'cost per person',
  Wally: 'using everything on the board',
};

type Kind = 'card' | 'read' | 'reply' | 'note';

/** "rita-read" → { who: 'Rita', kind: 'read' }; also the Teacher's two steps. */
function parseTrig(trig: string): { who: Author; kind: Kind | 'event' } | null {
  if (trig === 'event') return { who: 'Teacher', kind: 'event' };
  if (trig === 'teacher-note') return { who: 'Teacher', kind: 'note' };
  const m = trig.match(/^(rita|milo|wally)-(card|read|reply|note)$/);
  if (!m) return null;
  const who = (m[1][0].toUpperCase() + m[1].slice(1)) as Author;
  return { who, kind: m[2] as Kind };
}

function parseBoard(raw: string | undefined): { who: Author; text: string }[] {
  if (!raw || !raw.startsWith('[')) return [];
  try {
    return (JSON.parse(raw) as string[]).map((line) => {
      const i = line.indexOf(': ');
      return { who: line.slice(0, i) as Author, text: line.slice(i + 2) };
    });
  } catch {
    return [];
  }
}

interface Mark {
  phrase: string;
  bg: string;
  fg?: string;
}

/** Text with some phrases highlighted (first match of each, no overlaps); `delay` fades the highlights in late. */
function Marked({ text, marks, delay }: { text: string; marks: Mark[]; delay?: number }) {
  const hits = marks
    .map((m) => ({ ...m, at: text.indexOf(m.phrase) }))
    .filter((h) => h.at >= 0)
    .sort((a, b) => a.at - b.at);
  const parts: ReactNode[] = [];
  let pos = 0;
  hits.forEach((h, k) => {
    if (h.at < pos) return;
    parts.push(text.slice(pos, h.at));
    parts.push(
      delay === undefined ? (
        <span key={k} className="rounded px-0.5 font-semibold" style={{ background: h.bg, color: h.fg ?? 'inherit' }}>
          {h.phrase}
        </span>
      ) : (
        <motion.span
          key={k}
          className="rounded px-0.5 font-semibold"
          initial={{ backgroundColor: `${h.bg}00` }}
          animate={{ backgroundColor: h.bg }}
          transition={{ delay, duration: 0.5 }}
          style={{ color: h.fg ?? 'inherit' }}
        >
          {h.phrase}
        </motion.span>
      ),
    );
    pos = h.at + h.phrase.length;
  });
  parts.push(text.slice(pos));
  return <>{parts}</>;
}

/** One labelled line on the whiteboard. */
function NoteStrip({
  who,
  text,
  marks = [],
  ring,
  isNew,
  size = 17,
  padY = 8,
  lines,
  markDelay,
  tone,
}: {
  who: Author;
  text: string;
  marks?: Mark[];
  ring?: string;
  isNew?: boolean;
  size?: number;
  /** Vertical padding in px (smaller when the board is short). */
  padY?: number;
  /** Clamp the note to this many lines (only for notes that aren't the focus). */
  lines?: number;
  markDelay?: number;
  tone?: 'bad';
}) {
  const w = WHO[who];
  const clamp = lines
    ? { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }
    : undefined;
  return (
    <motion.div
      data-sm-note
      initial={isNew ? { opacity: 0, x: FROM_X[who], y: 230, scale: 0.45 } : false}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative shrink-0 rounded-lg px-3.5 leading-snug"
      style={{
        fontSize: size,
        paddingTop: padY,
        paddingBottom: padY,
        background: tone === 'bad' ? '#fee2e2' : '#ffffff',
        color: '#1e293b',
        borderLeft: `5px solid ${tone === 'bad' ? RED : w.color}`,
        boxShadow: ring ? `0 0 0 3px ${ring}, 0 0 18px ${ring}aa` : '0 1px 2px rgba(15,23,42,0.15)',
      }}
    >
      <div style={clamp}>
        <span className="font-bold" style={{ color: w.ink }}>
          {who}:
        </span>{' '}
        <Marked text={text} marks={marks} delay={markDelay} />
      </div>
      {isNew && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7 }}
          className="absolute -right-2 -top-3 text-[13px] font-bold px-1.5 rounded-full text-white"
          style={{ background: w.color }}
        >
          new
        </motion.span>
      )}
    </motion.div>
  );
}

/** A person/robot in the row below the board. */
function Figure({
  who,
  dim,
  up,
  active,
  mood,
  badge,
  chip,
  chipSet,
  chipGlow,
  size = 78,
}: {
  who: Author;
  size?: number;
  dim: boolean;
  up: boolean;
  active: boolean;
  mood: BotMood;
  badge?: string;
  chip: string;
  chipSet: boolean;
  chipGlow: boolean;
}) {
  const w = WHO[who];
  return (
    <motion.div
      className="relative flex flex-col items-center"
      animate={{ y: up ? -10 : 0, opacity: dim ? 0.35 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {who === 'Teacher' ? (
        <div className="flex flex-col items-center" style={{ width: size }}>
          <div
            className="mt-3 rounded-full flex items-center justify-center"
            style={{
              width: size - 10,
              height: size - 10,
              fontSize: Math.round(size / 2),
              background: `${w.color}22`,
              border: `3px solid ${w.color}`,
              boxShadow: active ? `0 0 18px ${w.color}` : 'none',
            }}
          >
            🧑‍🏫
          </div>
          <div className="text-[13px] font-semibold text-white leading-tight mt-2.5">Teacher</div>
        </div>
      ) : (
        <AgentBot {...AGENTS[who].bot} role={undefined} size={size} mood={mood} active={active} />
      )}
      {badge && (
        <motion.span
          key={badge}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-5 text-[20px]"
        >
          {badge}
        </motion.span>
      )}
      <div
        className="mt-1.5 text-[13px] px-2.5 py-0.5 rounded-full whitespace-nowrap"
        style={{
          border: `1.5px ${chipSet ? 'solid' : 'dashed'} ${chipSet ? w.color : 'rgba(255,255,255,0.18)'}`,
          color: chipSet ? w.color : 'rgba(255,255,255,0.35)',
          background: chipSet ? `${w.color}14` : 'transparent',
          boxShadow: chipGlow ? `0 0 14px ${w.color}88` : 'none',
        }}
      >
        {chip} {chipSet ? '✓' : ''}
      </div>
    </motion.div>
  );
}

/** The marker tray under the whiteboard (decoration). */
function MarkerTray() {
  return (
    <div className="absolute -bottom-[14px] left-1/2 -translate-x-1/2 w-[46%] h-[10px] rounded-b-md bg-slate-500/70 flex items-center justify-center gap-3">
      {[WHO.Rita.color, WHO.Milo.color, WHO.Wally.color, WHO.Teacher.color].map((c) => (
        <span key={c} className="w-7 h-[6px] rounded-full" style={{ background: c }} />
      ))}
    </div>
  );
}

// ───────────────────────────── overlays ─────────────────────────────

function Card({ children, color = ACCENT, className = '' }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`rounded-xl border-2 p-4 shadow-2xl ${className}`}
      style={{ borderColor: color, background: '#0d1426' }}
    >
      {children}
    </motion.div>
  );
}

function MiniBot({ who, size = 44 }: { who: Exclude<Author, 'Teacher'>; size?: number }) {
  return <AgentBot {...AGENTS[who].bot} role={undefined} size={size} />;
}

function CompareOverlay() {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-[760px]">
      {/* Assembly line: each agent sees only the note before it */}
      <Card color="rgba(255,255,255,0.25)" className="flex flex-col items-center gap-3">
        <div className="text-[16px] font-bold text-white/85">🏭 Assembly line</div>
        <div className="flex items-center gap-1.5 py-3">
          <MiniBot who="Rita" />
          <span className="text-[16px] text-white/50">📌➜</span>
          <MiniBot who="Milo" />
          <span className="text-[16px] text-white/50">📌➜</span>
          <MiniBot who="Wally" />
        </div>
        <div className="text-[15px] font-semibold" style={{ color: '#fca5a5' }}>
          Wally sees: only Milo&apos;s note
        </div>
      </Card>
      {/* Whiteboard: everyone sees everything */}
      <Card color={ACCENT} className="flex flex-col items-center gap-3">
        <div className="text-[16px] font-bold" style={{ color: ACCENT }}>
          🧑‍🏫 Shared whiteboard
        </div>
        <div className="w-[82%] rounded-md border-[3px] border-slate-400/70 bg-slate-100 p-1.5 flex flex-col gap-1">
          {(['Teacher', 'Rita', 'Milo'] as Author[]).map((w) => (
            <div key={w} className="h-[9px] rounded-sm" style={{ background: WHO[w].tint, borderLeft: `4px solid ${WHO[w].color}` }} />
          ))}
        </div>
        <div className="flex items-end gap-4 -mt-1">
          {(['Rita', 'Milo', 'Wally'] as const).map((w) => (
            <div key={w} className="flex flex-col items-center">
              <span className="text-[13px]">👀</span>
              <MiniBot who={w} size={40} />
            </div>
          ))}
        </div>
        <div className="text-[15px] font-semibold" style={{ color: '#86efac' }}>
          Wally sees: every note
        </div>
      </Card>
    </div>
  );
}

function HelperOverlay() {
  return (
    <Card className="flex flex-col gap-3">
      <div className="text-[15px] font-mono font-semibold" style={{ color: ACCENT }}>
        ⚙️ run_agent(system_prompt, task)
      </div>
      <div className="flex items-center justify-center flex-wrap gap-3 py-2 text-[15px]">
        <span className="px-2.5 py-1 rounded bg-white/5 text-white/85">📋 job card</span>
        <span className="text-white/40">+</span>
        <span className="px-2.5 py-1 rounded bg-white/5 text-white/85">📝 task</span>
        <span className="text-white/50">➜</span>
        <span className="px-2.5 py-1 rounded font-semibold" style={{ background: `${ACCENT}22`, color: ACCENT }}>
          🤖 agent
        </span>
        <span className="text-white/50">➜</span>
        <span className="px-2.5 py-1 rounded bg-white/5 text-white/85">💬 reply</span>
      </div>
    </Card>
  );
}

function AddDefOverlay() {
  return (
    <Card className="flex flex-col items-center gap-3 w-full max-w-[560px]">
      <div className="font-mono text-[16px] text-white/90">
        add_note(<span style={{ color: WHO.Rita.color }}>&quot;Rita&quot;</span>, &quot;3 fun games&quot;)
      </div>
      <div className="text-[13px] text-white/45 font-mono">⬇ whiteboard.append(f&quot;{'{author}'}: {'{note}'}&quot;)</div>
      <div className="relative w-[78%] rounded-lg bg-slate-100 p-3">
        <div
          className="rounded-lg px-3 py-2 text-[18px] bg-white text-slate-800"
          style={{ borderLeft: `5px solid ${WHO.Rita.color}` }}
        >
          <span className="font-bold rounded px-1" style={{ color: WHO.Rita.ink, boxShadow: `0 0 0 2.5px ${ACCENT}` }}>
            Rita:
          </span>{' '}
          3 fun games
        </div>
      </div>
      <div className="text-[15px] font-semibold" style={{ color: ACCENT }}>
        🏷️ label = who wrote it
      </div>
    </Card>
  );
}

function ReadDefOverlay() {
  const who: Author[] = ['Teacher', 'Rita', 'Milo'];
  return (
    <Card className="flex flex-col items-center gap-3 w-full max-w-[600px]">
      <div className="flex items-center gap-2 font-mono text-[15px] flex-wrap justify-center">
        <span className="text-white/60">whiteboard = [</span>
        {who.map((w) => (
          <span key={w} className="px-2 py-0.5 rounded bg-white/10" style={{ color: WHO[w].color }}>
            &quot;{w}: …&quot;
          </span>
        ))}
        <span className="text-white/60">]</span>
      </div>
      <div className="font-mono text-[14px]" style={{ color: ACCENT }}>
        ⬇ &quot;\n&quot;.join(whiteboard)
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-md bg-white text-slate-800 px-4 py-2.5 text-[16px] leading-relaxed shadow-lg font-mono">
          {who.map((w) => (
            <div key={w}>
              <b style={{ color: WHO[w].ink }}>{w}:</b> …
            </div>
          ))}
        </div>
        <div className="text-[16px] font-semibold text-white/85">➜ 📝 into the task</div>
      </div>
    </Card>
  );
}

function EventOverlay({ s }: { s: SharedMemoryStory }) {
  const t = WHO.Teacher;
  return (
    <motion.div
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-[600px] rounded-md bg-white px-5 py-4 shadow-2xl"
      style={{ borderTop: `6px solid ${t.color}` }}
    >
      <div className="text-[13px] font-bold text-slate-500 mb-1">📄 event</div>
      <div className="text-[21px] leading-snug text-slate-800">
        <Marked
          text={s.event}
          marks={[
            { phrase: s.count, bg: t.tint, fg: t.ink },
            { phrase: s.budget, bg: t.tint, fg: t.ink },
          ]}
        />
      </div>
    </motion.div>
  );
}

function JobCardOverlay({ who, text }: { who: Exclude<Author, 'Teacher'>; text: string }) {
  const c = WHO[who].color;
  return (
    <Card color={c} className="w-full max-w-[600px]">
      <div className="text-[14px] font-semibold mb-1.5" style={{ color: c }}>
        📋 {who}&apos;s job card
      </div>
      <div className="text-[18px] leading-snug text-white/90">
        <Marked text={text} marks={[{ phrase: CARD_MARK[who], bg: `${c}33`, fg: c }]} />
      </div>
    </Card>
  );
}

function ReplyOverlay({ who, text, uses }: { who: Exclude<Author, 'Teacher'>; text: string; uses: Borrow[] }) {
  const w = WHO[who];
  const shown = uses.filter((b) => b.dst);
  // Every note this reply drew on (even when no exact words were reused).
  const sources = uses.map((b) => b.from).filter((f, i, all) => all.indexOf(f) === i);
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[640px] rounded-md bg-white px-5 py-4 shadow-2xl"
      style={{ borderTop: `6px solid ${w.color}` }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[14px] font-bold" style={{ color: w.ink }}>
          💬 {who}&apos;s reply
        </span>
        <span className="text-[13px] font-mono text-slate-500">➜ {AGENTS[who].out}</span>
      </div>
      <div className="text-[19px] leading-snug text-slate-800">
        <Marked text={text} marks={shown.map((b) => ({ phrase: b.dst as string, bg: WHO[b.from].tint, fg: WHO[b.from].ink }))} />
      </div>
      {sources.length > 0 && (
        <div className="flex items-center gap-2 mt-3 text-[13px] text-slate-500">
          ideas from:
          {sources.map((f) => (
            <span key={f} className="px-2 py-0.5 rounded font-semibold" style={{ background: WHO[f].tint, color: WHO[f].ink }}>
              {f}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function TokensOverlay({ s }: { s: SharedMemoryStory }) {
  const notes = boardNotes(s);
  const rows = [
    { label: "Rita's call", who: 'Rita' as Author, n: 1 },
    { label: "Milo's call", who: 'Milo' as Author, n: 2 },
    { label: "Wally's call", who: 'Wally' as Author, n: 3 },
    { label: 'a 4th agent?', who: null, n: 4 },
  ].map((r) => ({ ...r, t: roughTokens(notes.slice(0, r.n).join('\n')) }));
  const max = rows[rows.length - 1].t;
  return (
    <Card className="w-full max-w-[620px] flex flex-col gap-3">
      <div className="text-[16px] font-bold text-white">📨 Board text sent in each call</div>
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-[110px] shrink-0 text-[14px] text-white/75">{r.label}</span>
          <div className="flex-1 h-7 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(r.t / max) * 100}%` }}
              transition={{ delay: 0.2 + i * 0.35, duration: 0.6 }}
              className="h-full rounded-md"
              style={
                r.who
                  ? { background: `${WHO[r.who].color}bb` }
                  : { border: '2px dashed rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)' }
              }
            />
          </div>
          <span className="w-[56px] shrink-0 text-right font-mono text-[15px] text-white/90">≈ {r.t}</span>
        </div>
      ))}
      <div className="text-[13px] text-white/50">tokens (rough count: about 4 characters per token)</div>
    </Card>
  );
}

function WrongOverlay({ s }: { s: SharedMemoryStory }) {
  const typo = s.event.replace(s.count, s.wrong.count);
  const Arrow = () => <div className="text-center text-[15px] leading-none" style={{ color: RED }}>⬇</div>;
  return (
    <Card color={RED} className="w-full max-w-[600px] flex flex-col gap-2">
      <div className="text-[16px] font-bold" style={{ color: RED }}>
        ⚠️ What if one note is wrong?
      </div>
      <div className="rounded-lg bg-slate-100 p-3 flex flex-col gap-1.5">
        <NoteStrip who="Teacher" text={typo} size={16} marks={[{ phrase: s.wrong.count, bg: '#fecaca', fg: '#b91c1c' }]} />
        <Arrow />
        <NoteStrip who="Milo" text={s.wrong.milo} size={16} tone="bad" />
        <Arrow />
        <NoteStrip who="Wally" text={s.wrong.wally} size={16} tone="bad" />
      </div>
    </Card>
  );
}

/** Three tiny pictures, one per takeaway (the explanation bar has the words). */
function RecapOverlay() {
  const bar = (who: Author, w: string, bad = false) => (
    <div
      key={`${who}-${w}`}
      className="h-[11px] rounded-sm"
      style={{ width: w, background: bad ? '#fecaca' : WHO[who].tint, borderLeft: `4px solid ${bad ? RED : WHO[who].color}` }}
    />
  );
  const items: { label: string; pic: ReactNode }[] = [
    {
      label: 'just a list',
      pic: (
        <div className="font-mono text-[38px] font-bold leading-none" style={{ color: ACCENT }}>
          [ ]
        </div>
      ),
    },
    {
      label: 'build on notes',
      pic: (
        <div className="w-[108px] flex flex-col gap-1">
          {(['Teacher', 'Rita', 'Milo'] as Author[]).map((w) => bar(w, '100%'))}
          <div className="text-center text-[13px] leading-none text-white/60">⬇</div>
          {bar('Wally', '100%')}
        </div>
      ),
    },
    {
      label: 'grows · errors spread',
      pic: (
        <div className="w-[108px] flex flex-col gap-1">
          {bar('Rita', '35%')}
          {bar('Milo', '65%')}
          {bar('Wally', '100%')}
          <div className="mt-1 flex items-center gap-1.5 text-[13px]" style={{ color: RED }}>
            ⚠️ {bar('Teacher', '70%', true)}
          </div>
        </div>
      ),
    },
  ];
  return (
    <Card className="w-full max-w-[620px] grid grid-cols-3 gap-4">
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="h-[84px] flex items-center justify-center">{it.pic}</div>
          <div className="text-[15px] font-semibold text-white/90 text-center">
            {i + 1}. {it.label}
          </div>
        </motion.div>
      ))}
    </Card>
  );
}

// ───────────────────────────── main ─────────────────────────────

/** How tightly the notes are packed: 0 = roomy … 3 = notes that aren't the focus shrink to one line. */
const FIT = [
  { size: 17, padY: 8, gap: 10, lines: undefined },
  { size: 15, padY: 6, gap: 6, lines: undefined },
  { size: 15, padY: 4, gap: 4, lines: 2 },
  { size: 15, padY: 4, gap: 4, lines: 1 },
] as const;

export default function SharedMemoryAnim() {
  const { steps, trig, v } = useTracerScene();
  const variantId = useTracerStore((st) => st.activeVariantId);
  const short = useShortScreen();

  // Keep every note inside the board on short screens: measure the notes list and, if the notes
  // don't fit, step down to a tighter FIT level (all before paint, so nothing jumps).
  const listEl = useRef<HTMLDivElement | null>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const [listH, setListH] = useState(0);
  const listRef = useCallback((el: HTMLDivElement | null) => {
    observer.current?.disconnect();
    listEl.current = el;
    if (!el) return;
    observer.current = new ResizeObserver(() => setListH(el.clientHeight));
    observer.current.observe(el);
  }, []);
  const rawBoard = v('whiteboard');
  const fitKey = `${variantId}|${trig}|${rawBoard ?? ''}|${listH}|${short}`;
  const [fit, setFit] = useState({ key: '', level: 0 });
  const level = fit.key === fitKey ? fit.level : 0;
  useLayoutEffect(() => {
    const el = listEl.current;
    const kids = el ? (Array.from(el.children) as HTMLElement[]) : [];
    let over = false;
    if (el && kids.length > 0) {
      const first = kids[0];
      const last = kids[kids.length - 1];
      // offsetTop/offsetHeight ignore the fly-in transform, so this is the settled layout.
      over = last.offsetTop + last.offsetHeight - first.offsetTop > el.clientHeight + 1;
    }
    if (over && level < FIT.length - 1) setFit({ key: fitKey, level: level + 1 });
    else if (fit.key !== fitKey) setFit({ key: fitKey, level });
  }, [level, fitKey, fit.key]);

  if (steps.length === 0) return null;

  const story = sharedMemoryStories[variantId] ?? sharedMemoryStories.default;
  const notes = parseBoard(rawBoard);
  const boardExists = rawBoard !== undefined;
  const t = parseTrig(trig);
  const agent = t && t.who !== 'Teacher' ? (t.who as Exclude<Author, 'Teacher'>) : null;
  const uses: Record<Exclude<Author, 'Teacher'>, Borrow[]> = {
    Rita: story.ritaUses,
    Milo: story.miloUses,
    Wally: story.wallyUses,
  };

  // Which notes are being read right now (everything on the board), and what the reader picks up.
  const reader = t?.kind === 'read' ? agent : null;
  const newNote = t?.kind === 'note' ? notes.length - 1 : -1;
  const pack = FIT[level];

  // The one centred card over the dimmed board (or none: then the board is the focus).
  let overlay: ReactNode = null;
  if (trig === 'compare') overlay = <CompareOverlay />;
  else if (trig === 'setup')
    overlay = (
      <Card className="text-[17px] font-mono text-white/90">
        📞 client = OpenAI()
      </Card>
    );
  else if (trig === 'helper') overlay = <HelperOverlay />;
  else if (trig === 'add-def') overlay = <AddDefOverlay />;
  else if (trig === 'read-def') overlay = <ReadDefOverlay />;
  else if (trig === 'event') overlay = <EventOverlay s={story} />;
  else if (agent && t?.kind === 'card') overlay = <JobCardOverlay who={agent} text={v(AGENTS[agent].prompt) ?? ''} />;
  else if (agent && t?.kind === 'reply')
    overlay = <ReplyOverlay who={agent} text={v(AGENTS[agent].out) ?? ''} uses={uses[agent]} />;
  else if (trig === 'tokens') overlay = <TokensOverlay s={story} />;
  else if (trig === 'wrong-note') overlay = <WrongOverlay s={story} />;
  else if (trig === 'recap') overlay = <RecapOverlay />;

  // Token counter (rough): the board text read_board() would return right now.
  const boardTokens = roughTokens(notes.map((n) => `${n.who}: ${n.text}`).join('\n'));
  const prevTokens = roughTokens(
    notes
      .slice(0, -1)
      .map((n) => `${n.who}: ${n.text}`)
      .join('\n'),
  );

  // Only the print step gets a header tag (the pill and the figures already name who reads or writes).
  const tag = trig === 'print' ? <span className="font-mono text-slate-600">🖨️ print(read_board())</span> : null;

  const boardGlow = trig === 'board' ? ACCENT : null;

  // The row of figures.
  const allDim = ['setup', 'helper', 'board', 'add-def', 'read-def', 'tokens', 'compare'].includes(trig);
  const figure = (who: Author) => {
    const mine = t?.who === who;
    const isAgent = who !== 'Teacher';
    let mood: BotMood = 'happy';
    let badge: string | undefined;
    let active = false;
    let up = false;
    if (mine && t) {
      if (t.kind === 'read') {
        mood = 'thinking';
        badge = '👀';
        active = true;
        up = true;
      } else if (t.kind === 'reply') {
        mood = 'proud';
        badge = '💬';
      } else if (t.kind === 'note') {
        mood = 'working';
        badge = '✏️';
        active = true;
        up = true;
      } else if (t.kind === 'event') {
        active = true;
      }
    }
    // A wrong Teacher note reaches everyone who reads the board after it.
    if (trig === 'wrong-note' && isAgent) mood = 'confused';
    if (trig === 'recap' || trig === 'print') mood = 'proud';
    const dim = allDim || (t !== null && !mine);
    const chipSet = isAgent ? !!v(AGENTS[who as Exclude<Author, 'Teacher'>].prompt) : !!v('event');
    return (
      <div key={who} className="flex-1 flex justify-center">
        <Figure
          who={who}
          size={short ? 60 : 78}
          dim={dim}
          up={up}
          active={active}
          mood={mood}
          badge={badge}
          chip={isAgent ? '📋 job card' : '📄 event'}
          chipSet={chipSet}
          chipGlow={mine && (t?.kind === 'card' || t?.kind === 'event')}
        />
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden text-white ${short ? 'gap-2 p-3' : 'gap-3 p-4'}`}>
      {/* Header: title + small token counter */}
      <div className="flex items-center gap-3 flex-shrink-0 h-[30px]">
        <div className="text-[16px] font-bold" style={{ color: ACCENT }}>
          🧑‍🏫 The Shared Whiteboard
        </div>
        {notes.length > 0 && (
          <motion.div
            key={`${notes.length}-${reader ?? ''}`}
            initial={{ scale: 1.25 }}
            animate={{ scale: 1 }}
            className="ml-auto text-[13px] px-3 py-1 rounded-full font-mono whitespace-nowrap"
            style={{
              background: '#0b1b2b',
              border: `1.5px solid ${reader ? WHO[reader].color : 'rgba(34,211,238,0.5)'}`,
              color: reader ? WHO[reader].color : ACCENT,
              boxShadow: reader ? `0 0 14px ${WHO[reader].color}66` : 'none',
            }}
          >
            {reader ? `📨 board ≈ ${boardTokens} tokens ➜ ${reader}` : `📏 board ≈ ${boardTokens} tokens`}
            {t?.kind === 'note' && notes.length > 1 && (
              <span className="ml-1.5 text-accent-green">+{boardTokens - prevTokens}</span>
            )}
          </motion.div>
        )}
      </div>

      {/* The whiteboard (with an optional centred card on top) */}
      <div className="relative flex-1 min-h-0 z-10">
        <motion.div
          className="relative h-full mx-[3%]"
          animate={{ opacity: overlay ? 0.1 : 1, filter: overlay ? 'blur(2px)' : 'blur(0px)' }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            data-sm-board
            className={`relative h-full rounded-2xl border-[6px] border-slate-400/70 bg-slate-100 px-4 pt-2.5 flex flex-col ${
              short ? 'pb-2.5' : 'pb-4'
            } ${level === FIT.length - 1 ? 'overflow-hidden' : ''}`}
            animate={{
              boxShadow: boardGlow ? `0 0 0 3px ${boardGlow}, 0 0 28px ${boardGlow}88` : '0 0 0 0 transparent',
            }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2 text-[13px] font-bold text-slate-600 flex-shrink-0">
              <span className="font-mono">📋 whiteboard</span>
              {boardExists && (
                <span className="font-normal text-slate-500">
                  · {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                </span>
              )}
              {tag && (
                <motion.span key={trig} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="ml-auto text-[14px]">
                  {tag}
                </motion.span>
              )}
            </div>

            {notes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500">
                {trig === 'board' && (
                  <>
                    <div className="font-mono text-[44px] font-bold text-slate-400">[ ]</div>
                    <div className="text-[16px]">an empty list</div>
                  </>
                )}
                {trig === 'intro' && (
                  <div className="text-[20px] font-semibold flex items-center gap-4">
                    <span>📖 read every note</span>
                    <span className="text-slate-400">➜</span>
                    <span>✏️ add yours</span>
                  </div>
                )}
              </div>
            ) : (
              // "safe center": centred while the notes fit, top-aligned if they ever don't.
              <div
                ref={listRef}
                className="flex-1 min-h-0 flex flex-col"
                style={{ gap: pack.gap, justifyContent: 'safe center' }}
              >
                {notes.map((n, i) => {
                  // While someone reads, highlight the phrases they pick up (coloured by whose note it is),
                  // fading in after the rings.
                  const marks: Mark[] = reader
                    ? uses[reader]
                        .filter((b) => b.from === n.who)
                        .map((b) => ({ phrase: b.src, bg: WHO[b.from].tint, fg: WHO[b.from].ink }))
                    : [];
                  const focus = reader !== null || i === newNote;
                  return (
                    <NoteStrip
                      key={i}
                      who={n.who}
                      text={n.text}
                      marks={marks}
                      markDelay={reader ? 0.7 : undefined}
                      ring={reader ? WHO[reader].color : undefined}
                      isNew={i === newNote}
                      size={pack.size}
                      padY={pack.padY}
                      lines={focus ? undefined : pack.lines}
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
          <MarkerTray />
        </motion.div>

        {overlay && (
          <div key={trig} className="absolute inset-0 flex items-center justify-center px-2">
            {overlay}
          </div>
        )}
      </div>

      {/* The team, standing in front of the board */}
      <div className={`flex-shrink-0 flex items-end relative z-0 ${short ? 'pt-2' : 'pt-3'}`}>{ROW.map(figure)}</div>
    </div>
  );
}
