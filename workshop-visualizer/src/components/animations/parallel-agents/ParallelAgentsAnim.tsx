'use client';
/**
 * ParallelAgentsAnim — Lesson 31 (Code: Agents in Parallel).
 *
 * A race track with one lane per topic, and a Rita 🔍 in every lane.
 * Race 1 (one at a time): the lanes run one after another like a relay, so the
 * stopwatch adds every job up. Race 2 (all at once): a ThreadPoolExecutor gives
 * each lane its own helper, all Ritas work side by side, and the stopwatch only
 * waits for the slowest. The facts drop into an ordered tray, then Wally ✍️
 * turns them into a poster. Times are illustrative. Everything is derived from
 * the current tracer step, so Prev/Next/jumps always look right.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import AgentBot, { TEAM, type BotMood } from '@/components/animations/characters/AgentBot';
import { useTracerStore } from '@/stores/tracerStore';
import { useTracerScene } from '@/components/animations/part4/useTracerScene';
import { parallelRuns, raceTimes, type ParallelRun } from '@/data/traces/parallel-agents';

const ACCENT = '#22d3ee';
const GOLD = '#fbbf24';
const RED = '#f87171';
const RITA = TEAM.researcher;
const WALLY = TEAM.writer;
/** Real animation seconds per illustrative second. */
const SPEED = 0.5;

// Triggers in the order they happen, so we can ask "has X happened yet?"
const ORDER = [
  'intro', 'time', 'pool-import', 'setup', 'helper', 'rita-card', 'wally-card', 'topics', 'research-fn',
  'seq-start', 'seq', 'seq-time', 'par-start', 'pool', 'par-go', 'par-done', 'tray', 'par-time',
  'join', 'wally-work', 'poster', 'when-not', 'recap',
];

const sec = (n: number) => n.toFixed(1);

/** Counts a number up from `from` to `to` (re-runs whenever `runKey` changes). Ends exactly on `to`. */
function useCountUp(from: number, to: number, ms: number, runKey: string) {
  const [val, setVal] = useState(to);
  useEffect(() => {
    if (ms <= 0 || from === to) {
      setVal(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      setVal(from + (to - from) * p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setVal(from);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, ms, runKey]);
  return val;
}

function Stopwatch({ from, to, runKey, glow }: { from: number; to: number; runKey: string; glow: boolean }) {
  const val = useCountUp(from, to, (to - from) * SPEED * 1000, runKey);
  return (
    <motion.div
      animate={{ scale: glow ? 1.12 : 1, boxShadow: glow ? `0 0 18px ${GOLD}88` : '0 0 0px transparent' }}
      className="flex items-center gap-2 rounded-xl px-3 py-1 font-mono"
      style={{ background: '#1c1a0e', border: `1.5px solid ${GOLD}`, color: GOLD }}
    >
      <span className="text-[18px]">⏱️</span>
      <span className="text-[22px] font-bold tabular-nums w-[74px] text-right">{sec(val)} s</span>
    </motion.div>
  );
}

// ─── The race track ──────────────────────────────────────────────────────────
const BOT_W = 56;
const TOPIC_W = 96;
const RESULT_W = 86;

type LaneStatus = 'idle' | 'waiting' | 'running' | 'done';

interface Lane {
  topic: string;
  status: LaneStatus;
  /** Bar start and end on the time axis (illustrative seconds). */
  start: number;
  end: number;
  /** Where the bar's right edge starts growing from on this step (= end when it doesn't grow). */
  growFrom: number;
  /** Delay before "✓ done" shows (so it appears when the bar finishes). */
  doneDelay: number;
  slowest?: boolean;
  helper?: number;
  topicGlow?: boolean;
}

/** Four columns shared by the lanes, the time axis and the "now" line, so they line up. */
function Cols({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <div style={{ width: BOT_W }} className="flex-shrink-0" />
      <div style={{ width: TOPIC_W }} className="flex-shrink-0" />
      <div className="flex-1 relative">{children}</div>
      <div style={{ width: RESULT_W }} className="flex-shrink-0" />
    </div>
  );
}

function Stripes({ moving, color }: { moving: boolean; color: string }) {
  return (
    <motion.div
      className="absolute inset-y-0 left-0 w-[200%]"
      style={{
        backgroundImage: `repeating-linear-gradient(-45deg, ${color} 0 7px, ${color}99 7px 14px)`,
      }}
      animate={moving ? { x: ['-50%', '0%'] } : { x: '0%' }}
      transition={moving ? { repeat: Infinity, duration: 3, ease: 'linear' } : { duration: 0 }}
    />
  );
}

function LaneRow({ lane, axisMax, stepKey, height, botSize }: { lane: Lane; axisMax: number; stepKey: string; height: number; botSize: number }) {
  const pct = (s: number) => `${(s / axisMax) * 100}%`;
  const growing = lane.growFrom < lane.end;
  const mood: BotMood =
    lane.status === 'running' ? 'thinking' : lane.status === 'done' ? 'proud' : lane.status === 'waiting' ? 'sleeping' : 'happy';
  const hasBar = lane.status === 'running' || lane.status === 'done';

  return (
    <div className="flex items-center gap-3" style={{ height }}>
      <div style={{ width: BOT_W }} className="flex-shrink-0 flex justify-center">
        <AgentBot
          color={RITA.color}
          badge={RITA.badge}
          size={botSize}
          mood={mood}
          active={lane.status === 'running'}
          dimmed={lane.status === 'waiting'}
        />
      </div>
      <motion.div
        style={{ width: TOPIC_W }}
        className="flex-shrink-0 text-[16px] font-semibold truncate"
        animate={{ color: lane.topicGlow ? ACCENT : lane.status === 'waiting' ? 'rgba(255,255,255,0.45)' : '#ffffff', scale: lane.topicGlow ? 1.08 : 1 }}
      >
        {lane.topic}
      </motion.div>
      <div className="flex-1 relative h-[34px] rounded-full bg-white/[0.04] border border-white/10 overflow-hidden">
        {hasBar && (
          <motion.div
            key={growing ? `grow-${stepKey}` : `still-${lane.start}-${lane.end}`}
            className="absolute inset-y-0 rounded-full overflow-hidden"
            style={{ left: pct(lane.start) }}
            initial={growing ? { width: pct(lane.growFrom - lane.start) } : false}
            animate={{ width: pct(lane.end - lane.start) }}
            transition={{ duration: growing ? (lane.end - lane.growFrom) * SPEED : 0, ease: 'linear' }}
          >
            <Stripes moving={lane.status === 'running'} color={lane.slowest ? GOLD : RITA.color} />
          </motion.div>
        )}
        {lane.helper !== undefined && (
          <motion.div
            key={`helper-${stepKey}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: lane.helper * 0.12 }}
            className="absolute left-1 inset-y-0 my-auto h-fit text-[13px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${ACCENT}22`, color: ACCENT, boxShadow: `0 0 10px ${ACCENT}66` }}
          >
            🧵 helper {lane.helper + 1}
          </motion.div>
        )}
      </div>
      <div style={{ width: RESULT_W }} className="flex-shrink-0 text-[14px] font-mono leading-tight">
        {lane.status === 'waiting' && <span className="text-[13px] font-sans text-white/40">🕒 in line</span>}
        {lane.status === 'running' && (
          <motion.span className="text-white/70" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}>
            ⏳ …
          </motion.span>
        )}
        {lane.status === 'done' && (
          <motion.div
            key={`done-${stepKey}-${lane.doneDelay}`}
            initial={lane.doneDelay > 0 ? { opacity: 0, scale: 0.6 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: lane.doneDelay }}
            style={{ color: lane.slowest ? GOLD : '#86efac' }}
          >
            ✓ {sec(lane.end - lane.start)} s
            {lane.slowest && <div className="text-[13px] font-sans font-semibold">slowest</div>}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Track({
  lanes,
  axisMax,
  stepKey,
  now,
  dim,
}: {
  lanes: Lane[];
  axisMax: number;
  stepKey: string;
  now?: { from: number; to: number };
  dim?: boolean;
}) {
  const few = lanes.length <= 3;
  const height = few ? 92 : 62;
  const botSize = few ? 66 : 46;
  const tickStep = axisMax > 8 ? 2 : 1;
  const ticks: number[] = [];
  for (let t = 0; t <= axisMax; t += tickStep) ticks.push(t);
  const pct = (s: number) => `${(s / axisMax) * 100}%`;

  return (
    <motion.div animate={{ opacity: dim ? 0.4 : 1 }} className="relative flex flex-col gap-1.5">
      {lanes.map((lane) => (
        <LaneRow key={lane.topic} lane={lane} axisMax={axisMax} stepKey={stepKey} height={height} botSize={botSize} />
      ))}
      {/* Time axis */}
      <Cols>
        <div className="relative h-5">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 text-[13px] font-mono text-white/40"
              style={{ left: pct(t) }}
            >
              {t}s
            </span>
          ))}
        </div>
      </Cols>
      {/* The stopwatch's "now" line sweeping across the lanes */}
      {now && (
        <div className="absolute inset-x-0 top-0 bottom-6 pointer-events-none">
          <Cols className="h-full">
            <motion.div
              key={`now-${stepKey}`}
              className="absolute top-0 bottom-0 w-[2px]"
              style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
              initial={{ left: pct(now.from) }}
              animate={{ left: pct(now.to) }}
              transition={{ duration: (now.to - now.from) * SPEED, ease: 'linear' }}
            />
          </Cols>
        </div>
      )}
    </motion.div>
  );
}

// ─── Small focal panels ─────────────────────────────────────────────────────
function BigCard({ who, text, color, bot }: { who: string; text?: string; color: string; bot: typeof RITA | typeof WALLY }) {
  return (
    <motion.div
      key={who}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-[700px] flex items-center gap-5"
    >
      <AgentBot {...bot} role={undefined} size={96} mood="happy" active />
      <div className="flex-1 rounded-xl p-4 border-2" style={{ borderColor: color, background: `${color}12` }}>
        <div className="text-[14px] font-semibold mb-1.5" style={{ color }}>📋 {who}&apos;s job card</div>
        <div className="text-[17px] leading-snug text-white/90">{text}</div>
      </div>
    </motion.div>
  );
}

function Scoreboard({ run, stepKey }: { run: ParallelRun; stepKey: string }) {
  const { offsets, seqTotal, parTotal } = raceTimes(run);
  const max = Math.ceil(seqTotal + 0.4);
  const pct = (s: number) => `${(s / max) * 100}%`;
  const n = run.jobs.length;
  const row = (icon: string, label: string, total: number, tag: string, color: string, bar: ReactNode) => (
    <div className="flex items-center gap-4">
      <div className="w-[160px] flex-shrink-0 text-[17px] font-semibold">
        {icon} {label}
      </div>
      <div className="flex-1 relative h-[66px]">{bar}</div>
      <div className="w-[104px] flex-shrink-0 text-right">
        <div className="text-[28px] font-bold font-mono" style={{ color }}>{sec(total)} s</div>
        <div className="text-[14px] text-white/50">{tag}</div>
      </div>
    </div>
  );
  return (
    <div className="w-full flex flex-col gap-8 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
      {row(
        '🐢',
        'One at a time',
        seqTotal,
        'the sum',
        '#e2e8f0',
        run.jobs.map((j, i) => (
          <motion.div
            key={`s-${stepKey}-${i}`}
            className="absolute inset-y-0 rounded-md flex items-center justify-center overflow-hidden text-[13px] font-semibold text-[#0a1a33]"
            style={{ left: pct(offsets[i]), background: RITA.color, border: '2px solid #0f0f2a' }}
            initial={{ width: 0 }}
            animate={{ width: pct(j.seconds) }}
            transition={{ delay: offsets[i] * 0.12, duration: j.seconds * 0.12, ease: 'linear' }}
          >
            <span className="truncate px-1">{j.topic}</span>
          </motion.div>
        )),
      )}
      {row(
        '🐇',
        'All at once',
        parTotal,
        'the slowest',
        GOLD,
        run.jobs.map((j, i) => (
          <motion.div
            key={`p-${stepKey}-${i}`}
            className="absolute left-0 rounded-sm"
            style={{
              top: `${(i / n) * 100}%`,
              height: `calc(${100 / n}% - 3px)`,
              background: j.seconds === parTotal ? GOLD : RITA.color,
            }}
            initial={{ width: 0 }}
            animate={{ width: pct(j.seconds) }}
            transition={{ duration: j.seconds * 0.12, ease: 'linear' }}
          />
        )),
      )}
    </div>
  );
}

// ─── The animation ──────────────────────────────────────────────────────────
export default function ParallelAgentsAnim() {
  const { steps, index, trig, v } = useTracerScene();
  const activeVariantId = useTracerStore((s) => s.activeVariantId);
  if (steps.length === 0) return null;

  const run = parallelRuns[activeVariantId] ?? parallelRuns.default;
  const { jobs } = run;
  const n = jobs.length;
  const { offsets, seqTotal, parTotal, goTime } = raceTimes(run);
  const axisMax = Math.ceil(seqTotal + 0.4);

  const seqMatch = /^seq-(\d+)$/.exec(trig);
  const seqLane = seqMatch ? Number(seqMatch[1]) : -1;
  const phase = seqMatch ? 'seq' : trig;
  const at = ORDER.indexOf(phase);
  const after = (t: string) => at >= ORDER.indexOf(t);
  const stepKey = `${activeVariantId}-${index}`;

  // ── Lanes for the race steps ──
  let lanes: Lane[] | null = null;
  let raceLabel: string | null = null;
  let watch: { from: number; to: number } | null = null;
  let nowLine: { from: number; to: number } | undefined;

  const lane = (i: number, patch: Partial<Lane>): Lane => ({
    topic: jobs[i].topic,
    status: 'idle',
    start: 0,
    end: 0,
    growFrom: 0,
    doneDelay: 0,
    ...patch,
  });

  if (phase === 'topics') {
    lanes = jobs.map((_, i) => lane(i, { topicGlow: true }));
  } else if (phase === 'seq-start' || phase === 'seq' || phase === 'seq-time') {
    raceLabel = '🐢 Race 1 · one at a time';
    const current = phase === 'seq-start' ? -1 : phase === 'seq-time' ? n : seqLane;
    lanes = jobs.map((j, i) => {
      const start = offsets[i];
      const end = start + j.seconds;
      if (i < current) return lane(i, { status: 'done', start, end, growFrom: end });
      if (i === current) return lane(i, { status: 'running', start, end, growFrom: start, doneDelay: 0 });
      return lane(i, { status: phase === 'seq-start' ? 'idle' : 'waiting' });
    });
    if (phase === 'seq') {
      const from = offsets[seqLane];
      const to = from + jobs[seqLane].seconds;
      watch = { from, to };
      nowLine = { from, to };
    } else watch = phase === 'seq-start' ? { from: 0, to: 0 } : { from: seqTotal, to: seqTotal };
  } else if (['par-start', 'pool', 'par-go', 'par-done'].includes(phase)) {
    raceLabel = '🐇 Race 2 · all at once';
    lanes = jobs.map((j, i) => {
      if (phase === 'par-go') return lane(i, { status: 'running', start: 0, end: goTime, growFrom: 0 });
      if (phase === 'par-done')
        return lane(i, {
          status: 'done',
          start: 0,
          end: j.seconds,
          growFrom: goTime,
          doneDelay: (j.seconds - goTime) * SPEED,
          slowest: j.seconds === parTotal,
        });
      return lane(i, { helper: phase === 'pool' ? i : undefined });
    });
    if (phase === 'par-go') {
      watch = { from: 0, to: goTime };
      nowLine = { from: 0, to: goTime };
    } else if (phase === 'par-done') {
      watch = { from: goTime, to: parTotal };
      nowLine = { from: goTime, to: parTotal };
    } else watch = { from: 0, to: 0 };
  }

  const facts = jobs.map((j) => j.fact);
  const finishOrder = [...jobs].sort((a, b) => a.seconds - b.seconds);
  const showRace1Chip = after('par-start') && phase !== 'par-time' && phase !== 'recap';
  const showRace2Chip = after('join') && phase !== 'recap';
  const showIllustrative = after('seq-start') && phase !== 'recap' && phase !== 'when-not';

  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-hidden text-white">
      {/* Header */}
      <div className="flex items-center gap-2.5 flex-shrink-0 min-h-[30px]">
        <div className="text-[16px] font-bold" style={{ color: ACCENT }}>🏁 The Research Race</div>
        {showRace1Chip && (
          <span className="text-[13px] px-2.5 py-0.5 rounded-full bg-white/5 text-white/70">
            🐢 one at a time: <b className="text-white font-mono">{sec(seqTotal)} s</b>
          </span>
        )}
        {showRace2Chip && (
          <span className="text-[13px] px-2.5 py-0.5 rounded-full" style={{ background: `${GOLD}14`, color: GOLD }}>
            🐇 all at once: <b className="font-mono">{sec(parTotal)} s</b>
          </span>
        )}
        {showIllustrative && <span className="ml-auto text-[13px] text-white/40">illustrative times</span>}
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center items-center gap-4">
        {/* ── Setup steps: one focal panel each ── */}
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center gap-7">
            <div className="flex items-end justify-center gap-4">
              {jobs.map((j, i) => (
                <AgentBot key={j.topic} {...RITA} role={undefined} size={n > 3 ? 64 : 84} mood="happy" active={i === 1} />
              ))}
            </div>
            <div className="flex gap-4">
              {[
                ['🐢', 'Race 1', 'one at a time'],
                ['🐇', 'Race 2', 'all at once'],
              ].map(([icon, name, how]) => (
                <div key={name} className="rounded-xl px-5 py-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }}>
                  <div className="text-[26px]">{icon}</div>
                  <div className="text-[17px] font-semibold">{how}</div>
                  <div className="text-[15px] font-mono mt-1" style={{ color: GOLD }}>⏱️ ? s</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'time' && (
          <motion.div key="time" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
            <div
              className="w-[190px] h-[190px] rounded-full flex flex-col items-center justify-center font-mono"
              style={{ border: `5px solid ${GOLD}`, background: '#1c1a0e', boxShadow: `0 0 30px ${GOLD}44` }}
            >
              <div className="text-[34px]">⏱️</div>
              <div className="text-[34px] font-bold" style={{ color: GOLD }}>0.0 s</div>
            </div>
            <div className="text-[16px] font-mono px-3 py-1 rounded-lg bg-white/5 text-white/85">time.time()</div>
          </motion.div>
        )}

        {phase === 'pool-import' && (
          <motion.div
            key="pool-import"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[600px] rounded-2xl border-2 p-5 flex flex-col gap-3"
            style={{ borderColor: ACCENT, background: '#0b1b2b' }}
          >
            <div className="text-[18px] font-mono font-semibold" style={{ color: ACCENT }}>🧵 ThreadPoolExecutor</div>
            {jobs.map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * i }}
                className="flex items-center gap-4 text-[16px]"
              >
                <span className="px-3 py-1 rounded-md bg-white text-slate-800 font-semibold">📄 job {i + 1}</span>
                <motion.span className="text-white/50" animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1 }}>➜</motion.span>
                <span className="px-3 py-1 rounded-full font-semibold" style={{ background: `${ACCENT}22`, color: ACCENT }}>🧵 helper {i + 1}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-white/5 px-6 py-4 text-[18px] text-white/90">
            📞 client ➜ OpenAI
          </motion.div>
        )}

        {phase === 'helper' && (
          <motion.div
            key="helper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[680px] rounded-xl border-2 p-4 flex flex-col gap-3"
            style={{ borderColor: ACCENT, background: '#0b1b2b' }}
          >
            <div className="text-[16px] font-mono font-semibold" style={{ color: ACCENT }}>⚙️ run_agent(system_prompt, task)</div>
            <div className="flex items-center justify-center flex-wrap gap-3 py-2 text-[16px]">
              <span className="px-2.5 py-1 rounded bg-white/5 text-white/85">📋 job card</span>
              <span className="text-white/40">+</span>
              <span className="px-2.5 py-1 rounded bg-white/5 text-white/85">📝 task</span>
              <span className="text-white/50">➜</span>
              <span className="px-2.5 py-1 rounded font-semibold" style={{ background: `${ACCENT}22`, color: ACCENT }}>🤖 agent</span>
              <span className="text-white/50">➜</span>
              <span className="px-2.5 py-1 rounded bg-white/5 text-white/85">💬 reply</span>
            </div>
          </motion.div>
        )}

        {phase === 'rita-card' && <BigCard who="Rita" text={v('researcher_prompt')} color={RITA.color} bot={RITA} />}
        {phase === 'wally-card' && <BigCard who="Wally" text={v('writer_prompt')} color={WALLY.color} bot={WALLY} />}

        {phase === 'research-fn' && (
          <motion.div key="research-fn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5">
            <div className="rounded-lg px-4 py-2.5 font-mono text-[17px] bg-white text-slate-800 shadow-lg">
              research(&quot;{jobs[0].topic}&quot;)
            </div>
            <span className="text-white/50 text-[20px]">➜</span>
            <div className="flex flex-col items-center gap-1.5">
              <AgentBot {...RITA} role={undefined} size={88} mood="thinking" active />
              <span className="text-[13px] font-mono text-white/60">&quot;Topic: {jobs[0].topic}&quot;</span>
            </div>
            <span className="text-white/50 text-[20px]">➜</span>
            <div className="rounded-lg px-4 py-2.5 text-[17px] font-semibold" style={{ background: '#fde68a', color: '#3b2f05' }}>
              💬 1 fact
            </div>
          </motion.div>
        )}

        {/* ── The race track ── */}
        {lanes && (
          <div className="w-full flex flex-col gap-3">
            {raceLabel && watch && (
              <div className="flex items-center gap-3">
                <div className="text-[17px] font-bold">{raceLabel}</div>
                <span className="flex items-center gap-1.5 text-[13px] text-white/50">
                  <span
                    className="inline-block w-5 h-3 rounded-sm"
                    style={{ backgroundImage: `repeating-linear-gradient(-45deg, ${RITA.color} 0 4px, ${RITA.color}88 4px 8px)` }}
                  />
                  waiting for OpenAI
                </span>
                <div className="ml-auto">
                  <Stopwatch
                    from={watch.from}
                    to={watch.to}
                    runKey={stepKey}
                    glow={phase === 'seq-start' || phase === 'par-start'}
                  />
                </div>
              </div>
            )}
            <Track lanes={lanes} axisMax={axisMax} stepKey={stepKey} now={nowLine} dim={phase === 'seq-time'} />
            {phase === 'seq-time' && (
              <motion.div
                key={`sum-${stepKey}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="self-center rounded-xl px-6 py-3 font-mono text-[22px] font-semibold"
                style={{ background: `${GOLD}12`, boxShadow: `inset 0 0 0 1.5px ${GOLD}66` }}
              >
                {jobs.map((j, i) => (
                  <span key={j.topic}>
                    {i > 0 && <span className="text-white/40"> + </span>}
                    <span style={{ color: RITA.color }}>{sec(j.seconds)}</span>
                  </span>
                ))}
                <span className="text-white/40"> = </span>
                <span style={{ color: GOLD }}>{sec(seqTotal)} s</span>
              </motion.div>
            )}
          </div>
        )}

        {/* ── The ordered tray ── */}
        {phase === 'tray' && (
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap text-[13px] text-white/50">
              <span>finished:</span>
              {finishOrder.map((j, k) => (
                <span key={j.topic} className="px-2 py-0.5 rounded-full bg-white/5 text-white/70">
                  {k + 1}. {j.topic}
                </span>
              ))}
            </div>
            <div className="rounded-2xl border-2 p-3 flex flex-col gap-2" style={{ borderColor: ACCENT, background: '#0b1b2b' }}>
              <div className="text-[15px] font-mono font-semibold px-1" style={{ color: ACCENT }}>📥 facts</div>
              {jobs.map((j, i) => (
                <motion.div
                  key={`${stepKey}-${i}`}
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + finishOrder.indexOf(j) * 0.35, duration: 0.4 }}
                  className="flex items-start gap-3 rounded-lg bg-white/5 px-3 py-2"
                >
                  <span className="font-mono text-[14px] text-white/50 w-7 flex-shrink-0 pt-px">[{i}]</span>
                  <span className="text-[15px] font-semibold w-[76px] flex-shrink-0" style={{ color: RITA.color }}>{j.topic}</span>
                  <span className={`text-white/90 leading-snug flex-1 ${n > 3 ? 'text-[14px]' : 'text-[15px]'}`}>{j.fact}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Race 1 vs race 2 ── */}
        {phase === 'par-time' && <Scoreboard run={run} stepKey={stepKey} />}

        {/* ── Wally makes the poster ── */}
        {phase === 'join' && (
          <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex items-center justify-center gap-6">
            <motion.div
              initial={{ scale: 0.6, rotate: -4 }}
              animate={{ scale: 1, rotate: -1.5 }}
              className="w-[68%] rounded-md p-4 shadow-xl"
              style={{ background: '#fde68a', color: '#3b2f05' }}
            >
              <div className="font-bold text-[15px] mb-1.5">📌 fact_list</div>
              <div className={`flex flex-col gap-1.5 leading-snug ${n > 3 ? 'text-[14px]' : 'text-[15px]'}`}>
                {facts.map((f) => (
                  <div key={f}>{f}</div>
                ))}
              </div>
            </motion.div>
            <AgentBot {...WALLY} role={undefined} size={84} mood="happy" />
          </motion.div>
        )}

        {phase === 'wally-work' && (
          <motion.div key="wally-work" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex items-center justify-center gap-8">
            <div className="w-[36%] rounded-md p-3 shadow-lg rotate-[-1.5deg]" style={{ background: '#fde68a', color: '#3b2f05' }}>
              <div className="font-bold text-[14px]">📌 Facts ×{n}</div>
              <div className="text-[13px] leading-snug line-clamp-4 opacity-70">{facts.join(' ')}</div>
            </div>
            <motion.span className="text-white/50 text-[22px]" animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1 }}>➜</motion.span>
            <div className="flex flex-col items-center gap-2">
              <AgentBot {...WALLY} role={undefined} size={124} mood="thinking" active />
              <motion.div
                className="text-[15px] font-semibold"
                style={{ color: WALLY.color }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.1 }}
              >
                ✍️ writing…
              </motion.div>
            </div>
          </motion.div>
        )}

        {phase === 'poster' && (
          <motion.div key="poster" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex items-center gap-5">
            <AgentBot {...WALLY} role={undefined} size={72} mood="proud" />
            <div className="flex-1 rounded-2xl p-5 bg-white text-slate-800 shadow-2xl" style={{ borderTop: `8px solid ${WALLY.color}` }}>
              <div className="text-[14px] font-bold text-green-700 mb-2">✍️ Wally&apos;s poster</div>
              <div className="text-[18px] leading-snug">{v('poster') ?? run.poster}</div>
            </div>
          </motion.div>
        )}

        {/* ── When NOT to go parallel ── */}
        {phase === 'when-not' && (
          <motion.div key="when-not" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[660px] flex flex-col gap-4">
            <div className="text-[18px] font-bold text-center">🙅 When NOT to go parallel</div>
            <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: `${GOLD}0f`, boxShadow: `inset 0 0 0 1.5px ${GOLD}66` }}>
              <span className="text-[30px]">🔗</span>
              <div className="flex-1">
                <div className="text-[18px] font-semibold">Needs another job&apos;s answer</div>
                <div className="mt-1 flex items-center gap-2">
                  <AgentBot {...RITA} role={undefined} name={undefined} size={40} mood="happy" />
                  <span className="text-white/50 text-[18px]">➜</span>
                  <AgentBot {...WALLY} role={undefined} name={undefined} size={40} mood="happy" />
                </div>
              </div>
              <span className="text-[15px] font-semibold px-3 py-1 rounded-full" style={{ background: `${GOLD}22`, color: GOLD }}>one at a time</span>
            </div>
            <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: `${RED}0f`, boxShadow: `inset 0 0 0 1.5px ${RED}66` }}>
              <span className="text-[30px]">🚦</span>
              <div className="flex-1">
                <div className="text-[18px] font-semibold">Too many calls at once</div>
                <div className="mt-1 text-[15px] font-mono" style={{ color: RED }}>429 RateLimitError</div>
              </div>
              <span className="text-[15px] font-semibold px-3 py-1 rounded-full" style={{ background: `${RED}22`, color: RED }}>fewer at a time</span>
            </div>
          </motion.div>
        )}

        {phase === 'recap' && (
          <motion.div key="recap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[680px] rounded-xl p-5 flex flex-col gap-3 text-[17px] leading-snug" style={{ background: `${ACCENT}0d` }}>
            <div>1️⃣ An agent spends most of its time <b>waiting for OpenAI</b>.</div>
            <div>
              2️⃣ Jobs that don&apos;t need each other can run at once:{' '}
              <span className="font-mono" style={{ color: ACCENT }}>pool.map</span> keeps the answers in order.
            </div>
            <div>
              3️⃣ Total time ≈ the <b style={{ color: GOLD }}>slowest</b> job, not the sum ({sec(parTotal)} s vs {sec(seqTotal)} s).
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
