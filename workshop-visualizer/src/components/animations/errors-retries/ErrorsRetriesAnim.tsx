'use client';
/**
 * ErrorsRetriesAnim — Lesson 17 (When Things Go Wrong: Errors & Retries).
 *
 * A delivery robot carries our question to the OpenAI server and meets trouble:
 * a 429 "busy" sign, a 401 "wrong key" sign, or a cut road (no internet).
 * Labelled safety nets under the try block catch each error type, a countdown
 * timer doubles its wait each retry (1s, then 2s), and the user ends up with a
 * friendly message card instead of a red traceback.
 * Everything is derived from the current tracer step (pure function of the step).
 */
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import AgentBot, { BotMood } from '@/components/animations/characters/AgentBot';
import { readVar, useTracerScene } from '@/components/animations/part4/useTracerScene';
import { errorsRetriesCode } from '@/data/code-snippets/errors-retries';

const CYAN = '#22d3ee';
const AMBER = '#fbbf24';
const RED = '#f87171';
const GREEN = '#4ade80';
const BLUE = '#4a9eff';
const TRIES = 3;

type Outcome = 'busy' | 'badkey' | 'offline' | 'ok';
type ErrorKind = Exclude<Outcome, 'ok'>;

/** The trace trigger that shows what the server did on an attempt. */
const OUTCOME_OF: Record<string, Outcome> = { busy: 'busy', rejected: 'badkey', offline: 'offline', reply: 'ok' };

const KIND: Record<Outcome, { color: string; icon: string; code: string; cls: string; label: string }> = {
  badkey: { color: RED, icon: '🔑', code: '401', cls: 'AuthenticationError', label: 'wrong key' },
  busy: { color: AMBER, icon: '🚦', code: '429', cls: 'RateLimitError', label: 'too busy' },
  offline: { color: BLUE, icon: '📡', code: 'no net', cls: 'APIConnectionError', label: "can't connect" },
  ok: { color: GREEN, icon: '✅', code: '200', cls: '', label: 'worked' },
};
/** Same order as the except blocks in the code. */
const NET_ORDER: ErrorKind[] = ['badkey', 'busy', 'offline'];

const CODE_LINES = errorsRetriesCode.split('\n');
const lineNo = (marker: string) => CODE_LINES.findIndex((l) => l.includes(marker)) + 1;

const TRACEBACK_LAST: Record<ErrorKind, string> = {
  busy: "openai.RateLimitError: Error code: 429 - {'error': {'message': 'Rate limit reached for gpt-4o-mini ...', ..., 'code': 'rate_limit_exceeded'}}",
  badkey: "openai.AuthenticationError: Error code: 401 - {'error': {'message': 'Incorrect API key provided: sk-abc12...', ..., 'code': 'invalid_api_key'}}",
  offline: 'openai.APIConnectionError: Connection error.',
};

// ───────────────────────── small building blocks ─────────────────────────

function Robot({ mood = 'happy', size = 104, active = false, dimmed = false }: { mood?: BotMood; size?: number; active?: boolean; dimmed?: boolean }) {
  return <AgentBot color={CYAN} badge="📦" mood={mood} size={size} active={active} dimmed={dimmed} />;
}

function Card({ children, color = 'rgba(255,255,255,0.18)', className = '' }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`rounded-2xl border-2 p-5 ${className}`}
      style={{ borderColor: color, background: `${color}10` }}
    >
      {children}
    </motion.div>
  );
}

type SlotStatus = Outcome | 'now' | 'pending' | 'skipped';

function slotLook(s: SlotStatus) {
  if (s === 'now') return { icon: '⏳', label: 'now', color: CYAN };
  if (s === 'pending') return { icon: '○', label: 'later', color: 'rgba(255,255,255,0.3)' };
  if (s === 'skipped') return { icon: '—', label: 'skipped', color: 'rgba(255,255,255,0.3)' };
  return { icon: KIND[s].icon, label: KIND[s].label, color: KIND[s].color };
}

/** The 3 attempt slots, with the wait that followed each one. Small in the header, big as a focal scene. */
function TrySlots({ slots, waits, big = false }: { slots: SlotStatus[]; waits: Record<number, number>; big?: boolean }) {
  return (
    <div className={`flex items-center ${big ? 'gap-3' : 'gap-1.5'}`}>
      {slots.map((s, i) => {
        const n = i + 1;
        const look = slotLook(s);
        const solid = s !== 'pending' && s !== 'skipped';
        return (
          <div key={n} className={`flex items-center ${big ? 'gap-3' : 'gap-1.5'}`}>
            <motion.div
              initial={false}
              animate={{ scale: s === 'now' && big ? [1, 1.05, 1] : 1 }}
              transition={s === 'now' && big ? { repeat: Infinity, duration: 1.2 } : { duration: 0.2 }}
              className={`flex items-center justify-center ${big ? 'flex-col rounded-xl w-[132px] h-[124px] gap-1' : 'flex-row rounded-lg px-2 py-0.5 gap-1'}`}
              style={{
                border: `2px ${solid ? 'solid' : 'dashed'} ${look.color}`,
                background: solid ? `${look.color}14` : 'transparent',
                boxShadow: s === 'now' ? `0 0 16px ${CYAN}66` : 'none',
              }}
            >
              <span className={`font-mono ${big ? 'text-[15px] text-white/60' : 'text-[13px] text-white/50'}`}>{big ? `Try ${n}` : n}</span>
              <span className={big ? 'text-[34px] leading-none' : 'text-[14px]'} style={{ color: look.color }}>
                {look.icon}
              </span>
              {big && (
                <span className="text-[15px] font-semibold" style={{ color: look.color }}>
                  {look.label}
                </span>
              )}
            </motion.div>
            {n < slots.length && (
              <span
                className={`font-mono ${big ? 'text-[15px] min-w-[44px] text-center' : 'text-[13px]'}`}
                style={{ color: waits[n] ? AMBER : 'rgba(255,255,255,0.2)' }}
              >
                {waits[n] ? `⏳${waits[n]}s` : '·'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** A U-shaped safety net drawn in SVG. */
function Net({ kind, color }: { kind: string; color: string }) {
  const clip = `er-net-${kind}`;
  return (
    <svg viewBox="0 0 200 70" className="w-full h-[64px]" aria-hidden>
      <defs>
        <clipPath id={clip}>
          <path d="M6 6 Q100 112 194 6 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`} stroke={color} strokeWidth="1.3" opacity="0.55">
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`a${i}`} x1={i * 15 - 40} y1={0} x2={i * 15 + 20} y2={70} />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`b${i}`} x1={i * 15 + 20} y1={0} x2={i * 15 - 40} y2={70} />
        ))}
      </g>
      <path d="M6 6 Q100 112 194 6" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="6" cy="6" r="4" fill={color} />
      <circle cx="194" cy="6" r="4" fill={color} />
    </svg>
  );
}

// ───────────────────────── scenes ─────────────────────────

function IntroScene() {
  const troubles = [
    { icon: '🚦', label: 'Too busy', sub: '429: too many requests', color: AMBER },
    { icon: '🔑', label: 'Wrong key', sub: '401: key not accepted', color: RED },
    { icon: '💳', label: 'No credit', sub: '429: insufficient_quota', color: '#a78bfa' },
    { icon: '📡', label: 'No internet', sub: "can't reach the server", color: BLUE },
  ];
  return (
    <div className="flex items-center justify-center gap-8 w-full">
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-md bg-white text-slate-800 px-2.5 py-1 text-[14px] shadow">✉️ question</div>
        <Robot size={112} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {troubles.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 * i }}
            className="w-[232px] rounded-xl border-2 px-4 py-3 flex items-center gap-3"
            style={{ borderColor: t.color, background: `${t.color}12` }}
          >
            <span className="text-[32px]">{t.icon}</span>
            <div>
              <div className="text-[18px] font-bold" style={{ color: t.color }}>{t.label}</div>
              <div className="text-[13px] text-white/60">{t.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SetupScene({ trig }: { trig: string }) {
  if (trig === 'import-time') {
    return (
      <Card color={AMBER} className="flex flex-col items-center gap-2 px-10">
        <span className="text-[48px]">⏱️</span>
        <span className="font-mono text-[22px]" style={{ color: AMBER }}>time.sleep(seconds)</span>
        <span className="text-[17px] text-white/80">a pause button</span>
      </Card>
    );
  }
  if (trig === 'error-types') {
    return (
      <div className="flex gap-3 w-full justify-center">
        {(['busy', 'offline', 'badkey'] as ErrorKind[]).map((k, i) => (
          <motion.div
            key={k}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 * i }}
            className="w-[236px] rounded-xl border-2 p-4 flex flex-col items-center gap-2 text-center"
            style={{ borderColor: KIND[k].color, background: `${KIND[k].color}12` }}
          >
            <span className="text-[34px]">{KIND[k].icon}</span>
            <span className="font-mono text-[15px] font-bold" style={{ color: KIND[k].color }}>{KIND[k].cls}</span>
            <span className="text-[17px] text-white/85">{k === 'offline' ? 'no connection' : `${KIND[k].code}: ${KIND[k].label}`}</span>
          </motion.div>
        ))}
      </div>
    );
  }
  if (trig === 'client') {
    return (
      <Card color={CYAN} className="flex flex-col items-center gap-3 px-12">
        <span className="text-[16px] text-white/70">the library&apos;s built-in retries</span>
        <div className="flex items-baseline gap-4 font-mono">
          <span className="text-[20px] text-white/80">max_retries</span>
          <span className="text-[30px] text-white/35 line-through">2</span>
          <span className="text-[20px] text-white/40">→</span>
          <motion.span initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[44px] font-bold" style={{ color: CYAN }}>
            0
          </motion.span>
        </div>
        <span className="text-[16px] text-white/80">🖐 we retry by hand</span>
      </Card>
    );
  }
  if (trig === 'def') {
    return (
      <Card color={CYAN} className="flex flex-col items-center gap-4 px-10">
        <span className="font-mono text-[22px] text-white">
          <span style={{ color: CYAN }}>ask</span>(question, <b style={{ color: AMBER }}>tries=3</b>)
        </span>
        <div className="flex gap-3">
          {[1, 2, 3].map((n) => (
            <span key={n} className="rounded-lg border-2 border-dashed border-white/25 px-3 py-1.5 text-[15px] font-mono text-white/60">
              try {n}
            </span>
          ))}
        </div>
      </Card>
    );
  }
  // call
  return (
    <div className="flex items-center gap-5">
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="rounded-md bg-white text-slate-800 px-4 py-3 text-[18px] shadow-xl max-w-[340px]"
      >
        ✉️ Give me a fun fact about penguins.
      </motion.div>
      <motion.span className="text-[28px] text-white/50" animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
        ➜
      </motion.span>
      <div className="rounded-xl border-2 px-6 py-5 font-mono text-[22px]" style={{ borderColor: CYAN, color: CYAN, background: `${CYAN}10` }}>
        ask()
      </div>
    </div>
  );
}

function CrashScene({ kind }: { kind: ErrorKind }) {
  const lines = [
    'Traceback (most recent call last):',
    `  File "errors_retries.py", line ${lineNo('print(ask(')}, in <module>`,
    '    print(ask("Give me a fun fact about penguins."))',
    `  File "errors_retries.py", line ${lineNo('response = client.chat.completions.create(')}, in ask`,
    '    response = client.chat.completions.create(',
    '  ... (many more lines from inside the openai library) ...',
  ];
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-[16px] font-semibold text-white/80">Without try/except:</span>
        <motion.span
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[16px] font-bold px-3 py-0.5 rounded-full"
          style={{ color: RED, background: `${RED}22`, border: `1.5px solid ${RED}` }}
        >
          💥 program crashed
        </motion.span>
      </div>
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-xl p-4 font-mono text-[13px] leading-relaxed border-2"
        style={{ background: '#1d0a12', borderColor: `${RED}88`, color: '#fca5a5' }}
      >
        {lines.map((l) => (
          <div key={l} className="whitespace-pre-wrap">{l}</div>
        ))}
        <div className="mt-1 font-bold whitespace-pre-wrap break-all" style={{ color: RED }}>
          {TRACEBACK_LAST[kind]}
        </div>
      </motion.div>
    </div>
  );
}

function NetsScene({ caught, stepKey }: { caught?: ErrorKind; stepKey: number }) {
  return (
    <div className="w-full flex flex-col items-center">
      {/* The try block */}
      <div
        className="w-[88%] rounded-xl border-2 border-dashed px-5 py-3 flex items-center gap-3"
        style={{ borderColor: `${CYAN}aa`, background: `${CYAN}0c`, opacity: caught ? 0.55 : 1 }}
      >
        <span className="font-mono text-[18px] font-bold" style={{ color: CYAN }}>try:</span>
        <span className="text-[20px]">📦</span>
        <span className="font-mono text-[15px] text-white/85">client.chat.completions.create(...)</span>
      </div>

      {/* The nets, in the same order as the except blocks */}
      <div className="w-full flex justify-center gap-4 mt-24">
        {NET_ORDER.map((k, i) => {
          const hit = caught === k;
          const dim = !!caught && !hit;
          return (
            <motion.div
              key={k}
              className="relative w-[230px] flex flex-col items-center"
              animate={{ opacity: dim ? 0.3 : 1 }}
              transition={{ duration: 0.4 }}
            >
              {hit && (
                <motion.div
                  key={`ball-${stepKey}`}
                  initial={{ y: -150, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', damping: 11, stiffness: 120 }}
                  className="absolute top-2 z-10 w-[54px] h-[54px] rounded-full flex items-center justify-center text-[15px] font-bold shadow-xl"
                  style={{ background: KIND[k].color, color: '#0a0a1a' }}
                >
                  {k === 'offline' ? '📡' : KIND[k].code}
                </motion.div>
              )}
              <motion.div
                className="w-full"
                animate={hit ? { y: [0, 10, 0] } : { y: 0 }}
                transition={hit ? { delay: 0.35, duration: 0.5 } : undefined}
                style={{ filter: hit ? `drop-shadow(0 0 10px ${KIND[k].color})` : 'none' }}
              >
                <Net kind={k} color={KIND[k].color} />
              </motion.div>
              <div className="mt-2 flex flex-col items-center gap-0.5 text-center">
                <span className="text-[13px] text-white/50 font-mono">
                  {i + 1}. except
                </span>
                <span className="font-mono text-[15px] font-bold" style={{ color: KIND[k].color }}>
                  {KIND[k].cls}
                </span>
                <span className="text-[15px] text-white/80">
                  {KIND[k].icon} {KIND[k].label}
                </span>
              </div>
              {hit && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-3 text-[16px] font-bold px-3 py-1 rounded-full"
                  style={{ color: GREEN, background: `${GREEN}1a`, border: `1.5px solid ${GREEN}` }}
                >
                  ✓ caught, no crash
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/** Where the robot stands on the road (percent of the road width). */
const ROBOT_AT = { start: 3, server: 50, gap: 20 };

function RoadScene({ trig, attempt }: { trig: string; attempt: number }) {
  const outcome = OUTCOME_OF[trig];
  const offline = trig === 'offline';
  const target = offline ? ROBOT_AT.gap : ROBOT_AT.server;
  const from = trig === 'send' ? ROBOT_AT.start : target;
  const to = trig === 'send' ? (attempt > 0 ? ROBOT_AT.server : target) : target;
  const mood: BotMood = trig === 'send' ? 'working' : outcome === 'ok' ? 'proud' : 'confused';
  const sign = outcome && outcome !== 'offline' ? KIND[outcome] : null;

  return (
    <div className="relative w-full h-[420px]">
      {/* Road (cut in the middle when there is no internet) */}
      {offline ? (
        <>
          <div className="absolute bottom-[40px] left-[1%] w-[35%] h-[8px] rounded-full bg-white/15" />
          <div className="absolute bottom-[40px] left-[52%] right-[1%] h-[8px] rounded-full bg-white/15" />
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-[64px] left-[36%] w-[16%] flex flex-col items-center gap-1"
          >
            <div className="relative">
              <span className="text-[44px] leading-none">📡</span>
              <span className="absolute -right-3 -bottom-1 text-[26px] font-black leading-none" style={{ color: RED }}>✖</span>
            </div>
            <span className="text-[15px] font-bold whitespace-nowrap" style={{ color: BLUE }}>no internet</span>
          </motion.div>
        </>
      ) : (
        <div className="absolute bottom-[40px] left-[1%] right-[1%] h-[8px] rounded-full bg-white/15" />
      )}

      {/* The OpenAI server */}
      <div
        className="absolute bottom-[48px] right-[2%] w-[210px] h-[250px] rounded-2xl border-2 flex flex-col items-center justify-center gap-2"
        style={{ borderColor: 'rgba(255,255,255,0.25)', background: '#141432', opacity: offline ? 0.5 : 1 }}
      >
        <span className="text-[60px] leading-none">🖥️</span>
        <span className="text-[17px] font-semibold text-white/85">OpenAI server</span>
      </div>

      {/* The server's answer, as a sign on the door */}
      {sign && (
        <motion.div
          key={`sign-${trig}`}
          initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: -5 }}
          transition={{ type: 'spring', damping: 11, stiffness: 160 }}
          className="absolute top-[34px] right-[5%] w-[180px] rounded-xl border-[3px] px-3 py-2 flex flex-col items-center shadow-2xl z-10"
          style={{ borderColor: sign.color, background: '#0f0f2a' }}
        >
          <span className="text-[30px] font-black leading-none" style={{ color: sign.color }}>
            {sign.icon} {sign.code}
          </span>
          <span className="text-[17px] font-bold mt-1" style={{ color: sign.color }}>
            {outcome === 'busy' ? 'Too busy!' : outcome === 'badkey' ? 'Wrong key!' : 'OK'}
          </span>
        </motion.div>
      )}

      {/* The delivery robot with our question (or the reply) */}
      <motion.div
        className="absolute bottom-[48px] flex flex-col items-center gap-1"
        initial={{ left: `${from}%` }}
        animate={{ left: `${to}%` }}
        transition={{ duration: 1.3, ease: 'easeInOut' }}
      >
        <div
          className="rounded-md px-3 py-1 text-[15px] shadow whitespace-nowrap"
          style={outcome === 'ok' ? { background: GREEN, color: '#052e16' } : { background: 'white', color: '#1e293b' }}
        >
          {outcome === 'ok' ? '✉️ reply ✓' : '✉️ penguin fact?'}
        </div>
        <Robot mood={mood} size={124} active={trig === 'send'} />
      </motion.div>

      {/* What Python does about it */}
      {outcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-0 left-0 right-0 text-center font-mono text-[15px]"
          style={{ color: KIND[outcome].color }}
        >
          {outcome === 'ok' ? '✓ no error' : `Python raises ${KIND[outcome].cls}`}
        </motion.div>
      )}
    </div>
  );
}

function QuotaScene() {
  return (
    <div className="w-full flex flex-col items-center gap-5">
      <Card color={AMBER} className="w-[80%] flex flex-col items-center gap-2 py-4">
        <span className="text-[15px] text-white/60 font-mono">🚦 RateLimitError · 429</span>
        <span className="font-mono text-[20px]">
          <span className="text-white/70">error.code</span> <span className="text-white/40">=</span>{' '}
          <b style={{ color: AMBER }}>&quot;rate_limit_exceeded&quot;</b>
        </span>
      </Card>
      <div className="flex gap-4 w-[92%]">
        <div className="flex-1 rounded-xl border-2 border-dashed p-4 flex flex-col items-center gap-1.5 text-center" style={{ borderColor: '#a78bfa77' }}>
          <span className="font-mono text-[14px] text-white/65">&quot;insufficient_quota&quot;</span>
          <span className="text-[26px] opacity-60">💳</span>
          <span className="text-[16px] font-semibold" style={{ color: '#a78bfa' }}>no credit: stop</span>
          <span className="text-[14px] text-white/65">retrying won&apos;t help</span>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 rounded-xl border-2 p-4 flex flex-col items-center gap-1.5 text-center"
          style={{ borderColor: AMBER, background: `${AMBER}14`, boxShadow: `0 0 18px ${AMBER}44` }}
        >
          <span className="font-mono text-[14px] text-white/80">anything else</span>
          <span className="text-[26px]">🚦</span>
          <span className="text-[16px] font-semibold" style={{ color: AMBER }}>just busy: retry ✓</span>
          <span className="text-[13px] text-white/60">it may clear up soon</span>
        </motion.div>
      </div>
    </div>
  );
}

function NoteScene({ text, color }: { text: string; color: string }) {
  return (
    <div className="flex items-center gap-5">
      <Robot mood="happy" size={96} />
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative rounded-2xl rounded-bl-sm border-2 px-5 py-4 max-w-[480px]"
        style={{ borderColor: color, background: '#0f0f2a' }}
      >
        <div className="text-[13px] text-white/50 mb-1">🖨️ printed</div>
        <div className="font-mono text-[18px]" style={{ color }}>{text}</div>
      </motion.div>
    </div>
  );
}

const RING_R = 88;
const RING_C = 2 * Math.PI * RING_R;

/** Seconds left on the sleep timer: counts down from `seconds` to 0 while `run` is true (restarts per step). */
function useCountdown(seconds: number, run: boolean, stepKey: number): number {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    if (!run) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const l = Math.max(0, seconds - (performance.now() - start) / 1000);
      setLeft(l);
      if (l === 0) window.clearInterval(id);
    }, 100);
    return () => window.clearInterval(id);
  }, [seconds, run, stepKey]);
  return left;
}

function TimerScene({ trig, wait, attempt, printed, stepKey }: { trig: string; wait: number; attempt: number; printed: string; stepKey: number }) {
  const sleeping = trig === 'sleep';
  const left = useCountdown(wait, sleeping, stepKey);
  const done = sleeping && left === 0;
  const ladder = [1, 2]; // tries=3 means at most two waits
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        {sleeping && <Robot mood={done ? 'happy' : 'sleeping'} size={84} />}
        <div className="relative w-[210px] h-[210px]">
          <svg viewBox="0 0 210 210" className="w-full h-full -rotate-90" aria-hidden>
            <circle cx="105" cy="105" r={RING_R} stroke="rgba(255,255,255,0.1)" strokeWidth="14" fill="none" />
            <motion.circle
              key={`ring-${stepKey}`}
              cx="105"
              cy="105"
              r={RING_R}
              stroke={AMBER}
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: sleeping ? RING_C : 0 }}
              transition={sleeping ? { duration: wait, ease: 'linear' } : { duration: 0 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[50px] font-bold leading-none tabular-nums" style={{ color: done ? GREEN : AMBER }}>
              {sleeping ? `${left.toFixed(1)}s` : `${wait}s`}
            </span>
            <span className="text-[15px] mt-1" style={{ color: done ? GREEN : 'rgba(255,255,255,0.6)' }}>
              {!sleeping ? 'wait' : done ? '▶ go again' : '⏸ paused'}
            </span>
          </div>
        </div>
      </div>

      {trig === 'backoff' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-[17px] text-white/85">
          2 ** ({attempt} - 1) = 2 ** {attempt - 1} = <b style={{ color: AMBER }}>{wait}</b>
        </motion.div>
      )}
      {trig === 'wait-msg' && (
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-lg border px-4 py-2 font-mono text-[16px]"
          style={{ borderColor: `${AMBER}66`, background: '#0f0f2a', color: AMBER }}
        >
          🖨️ {printed}
        </motion.div>
      )}

      {/* The doubling ladder */}
      <div className="flex items-center gap-2 text-[15px] font-mono">
        {ladder.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full"
              style={{
                color: s === wait ? '#0a0a1a' : s < wait ? AMBER : 'rgba(255,255,255,0.35)',
                background: s === wait ? AMBER : 'transparent',
                border: `1.5px solid ${s <= wait ? AMBER : 'rgba(255,255,255,0.2)'}`,
                fontWeight: s === wait ? 700 : 400,
              }}
            >
              {s}s
            </span>
            <span className="text-white/35 text-[13px]">×2</span>
          </div>
        ))}
        <span className="px-2.5 py-0.5 rounded-full text-white/50" style={{ border: '1.5px dashed rgba(255,255,255,0.25)' }}>
          4s… <span className="font-sans text-[14px]">more tries</span>
        </span>
      </div>
    </div>
  );
}

function TriesScene({ trig, slots, waits, attempt }: { trig: string; slots: SlotStatus[]; waits: Record<number, number>; attempt: number }) {
  let line: ReactNode;
  if (trig === 'attempt') {
    line = (
      <span className="text-[22px] font-bold" style={{ color: CYAN }}>
        Try {attempt} of {TRIES}
      </span>
    );
  } else if (trig === 'tries-left') {
    line = (
      <span className="font-mono text-[20px] text-white/90">
        {attempt} &lt; {TRIES} <b style={{ color: GREEN }}>✓ yes</b> <span className="font-sans text-[17px] text-white/70">→ wait, then retry</span>
      </span>
    );
  } else if (trig === 'no-tries-left') {
    line = (
      <span className="font-mono text-[20px] text-white/90">
        {attempt} &lt; {TRIES} <b style={{ color: RED }}>✗ no</b> <span className="font-sans text-[17px] text-white/70">→ skip the wait</span>
      </span>
    );
  } else {
    line = (
      <span className="text-[19px] text-white/85">
        <span className="font-mono">range(1, 4)</span> is used up → <b style={{ color: AMBER }}>loop ends</b>
      </span>
    );
  }
  return (
    <div className="flex flex-col items-center gap-7">
      <TrySlots slots={slots} waits={waits} big />
      <motion.div key={trig} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {line}
      </motion.div>
    </div>
  );
}

function ReturnScene({ trig, text }: { trig: string; text: string }) {
  const look =
    trig === 'return-answer'
      ? { color: GREEN, icon: '🐧', note: 'return the reply text' }
      : trig === 'return-oops'
        ? { color: RED, icon: '🔑', note: 'return right away: no retries' }
        : { color: BLUE, icon: '🙏', note: `return after ${TRIES} tries` };
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <span className="text-[16px] font-mono px-3 py-1 rounded-full" style={{ color: look.color, border: `1.5px solid ${look.color}` }}>
        ↩ {look.note}
      </span>
      <motion.div
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-[76%] rounded-xl bg-white text-slate-800 p-5 shadow-xl text-[19px] leading-snug"
      >
        {look.icon} {text}
      </motion.div>
    </div>
  );
}

function PrintScene({ text, outcome }: { text: string; outcome: Outcome }) {
  const look =
    outcome === 'ok'
      ? { color: GREEN, icon: '🐧' }
      : outcome === 'badkey'
        ? { color: RED, icon: '🔑' }
        : { color: BLUE, icon: '🙏' };
  return (
    <div className="w-full flex items-center justify-center gap-6">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-[62%] rounded-2xl border-2 p-5"
        style={{ borderColor: look.color, background: `${look.color}12`, boxShadow: `0 0 26px ${look.color}33` }}
      >
        <div className="text-[14px] font-semibold mb-2" style={{ color: look.color }}>
          🙂 what the user sees
        </div>
        <div className="text-[20px] leading-snug text-white">
          {look.icon} {text}
        </div>
      </motion.div>
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative w-[150px] rounded-lg border p-2 font-mono text-[13px] leading-tight opacity-50" style={{ borderColor: `${RED}88`, background: '#1d0a12', color: '#fca5a5' }}>
          <div>Traceback…</div>
          <div>File …</div>
          <div>openai.…Error</div>
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden>
            <line x1="4" y1="4" x2="96" y2="56" stroke={RED} strokeWidth="3" />
            <line x1="96" y1="4" x2="4" y2="56" stroke={RED} strokeWidth="3" />
          </svg>
        </div>
        <span className="text-[13px] text-white/70">instead of a crash</span>
      </div>
    </div>
  );
}

function RecapScene() {
  const rows: { color: string; big: ReactNode; label: string }[] = [
    {
      color: CYAN,
      big: <span className="font-mono">🛟 try / except</span>,
      label: 'catch, don’t crash',
    },
    {
      color: GREEN,
      big: (
        <span>
          retry 🚦 📡 <span className="text-white/30 mx-1">·</span> <span style={{ color: RED }}>stop 🔑 💳</span>
        </span>
      ),
      label: 'retry what can heal',
    },
    {
      color: AMBER,
      big: <span className="font-mono">⏳ 1s → 2s → 🙏</span>,
      label: 'back off, then give up',
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      {rows.map((r, i) => (
        <motion.div
          key={r.label}
          initial={{ x: -12, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 + 0.2 * i }}
          className="flex items-center gap-4 rounded-2xl border-2 px-5 py-3.5"
          style={{ borderColor: `${r.color}66`, background: `${r.color}0d` }}
        >
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[16px] font-bold"
            style={{ background: r.color, color: '#0a0a1a' }}
          >
            {i + 1}
          </span>
          <span className="text-[20px] font-bold min-w-[290px]" style={{ color: r.color }}>
            {r.big}
          </span>
          <span className="text-[16px] text-white/70">{r.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ───────────────────────── main ─────────────────────────

/** Steps in the same group share one scene, so it animates between them instead of remounting. */
function sceneGroup(trig: string): string {
  if (['nets', 'caught'].includes(trig)) return 'nets';
  if (['send', 'busy', 'rejected', 'offline', 'reply'].includes(trig)) return 'road';
  if (['backoff', 'wait-msg', 'sleep'].includes(trig)) return 'timer';
  if (['attempt', 'tries-left', 'no-tries-left', 'loop-done'].includes(trig)) return 'tries';
  return trig;
}

export default function ErrorsRetriesAnim() {
  const { steps, index, step, trig, v } = useTracerScene();
  if (steps.length === 0 || !step) return null;

  const attempt = Number(v('attempt') ?? 0);
  const wait = Number(v('wait') ?? 0);

  // History up to this step: what happened on each attempt, and the waits after them.
  const outcomes: Record<number, Outcome> = {};
  const waits: Record<number, number> = {};
  let started = false;
  let returned = false;
  let lastOutcome: Outcome | undefined;
  for (let i = 0; i <= index; i++) {
    const s = steps[i];
    const t = s.animationTrigger ?? '';
    const a = Number(readVar(s, 'attempt') ?? 0);
    if (t === 'attempt') started = true;
    if (OUTCOME_OF[t]) {
      outcomes[a] = OUTCOME_OF[t];
      lastOutcome = OUTCOME_OF[t];
    }
    if (t === 'sleep') waits[a] = Number(readVar(s, 'wait') ?? 0);
    if (['return-answer', 'return-oops', 'give-up'].includes(t)) returned = true;
  }
  // The first trouble in this whole story (used for the "without try" traceback).
  const storyKind =
    (steps.map((s) => OUTCOME_OF[s.animationTrigger ?? '']).find((o) => o && o !== 'ok') as ErrorKind | undefined) ?? 'busy';

  const slots: SlotStatus[] = Array.from({ length: TRIES }, (_, i) => {
    const n = i + 1;
    if (outcomes[n]) return outcomes[n];
    if (returned) return 'skipped';
    return n === attempt ? 'now' : 'pending';
  });

  const current = outcomes[attempt] as Outcome | undefined;
  const caughtKind = current && current !== 'ok' ? current : undefined;

  let scene: ReactNode;
  let showHeaderSlots = started;
  switch (trig) {
    case 'intro':
      scene = <IntroScene />;
      break;
    case 'import-time':
    case 'error-types':
    case 'client':
    case 'def':
    case 'call':
      scene = <SetupScene trig={trig} />;
      break;
    case 'attempt':
    case 'tries-left':
    case 'no-tries-left':
    case 'loop-done':
      scene = <TriesScene trig={trig} slots={slots} waits={waits} attempt={attempt} />;
      showHeaderSlots = false;
      break;
    case 'crash':
      scene = <CrashScene kind={storyKind} />;
      showHeaderSlots = false; // a "what if" picture, not a real attempt
      break;
    case 'nets':
      scene = <NetsScene stepKey={index} />;
      break;
    case 'caught':
      scene = <NetsScene caught={caughtKind} stepKey={index} />;
      break;
    case 'send':
    case 'busy':
    case 'rejected':
    case 'offline':
    case 'reply':
      scene = <RoadScene key={`road-${attempt}`} trig={trig} attempt={attempt} nextTrig={steps[index + 1]?.animationTrigger ?? ''} />;
      break;
    case 'quota-check':
      scene = <QuotaScene />;
      break;
    case 'note':
      scene = <NoteScene text={step.output} color={caughtKind ? KIND[caughtKind].color : AMBER} />;
      break;
    case 'backoff':
    case 'wait-msg':
    case 'sleep':
      scene = <TimerScene trig={trig} wait={wait} attempt={attempt} printed={step.output} stepKey={index} />;
      break;
    case 'return-answer':
    case 'return-oops':
    case 'give-up': {
      // The text being returned is what the next step prints.
      const text = steps[index + 1]?.output ?? '';
      scene = <ReturnScene trig={trig} text={text} />;
      break;
    }
    case 'print-answer':
      scene = <PrintScene text={step.output} outcome={lastOutcome ?? 'ok'} />;
      break;
    case 'recap':
      scene = <RecapScene />;
      showHeaderSlots = false;
      break;
    default:
      scene = null;
  }

  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-hidden text-white">
      {/* Header: title + the attempt tracker (small) */}
      <div className="flex items-center gap-3 flex-shrink-0 min-h-[34px]">
        <div className="text-[16px] font-bold" style={{ color: CYAN }}>🛟 Errors &amp; Retries</div>
        {showHeaderSlots && (
          <div className="ml-auto">
            <TrySlots slots={slots} waits={waits} />
          </div>
        )}
      </div>

      {/* Stage: one focal thing at a time */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-2">
        <div key={sceneGroup(trig)} className="w-full flex items-center justify-center">
          {scene}
        </div>
      </div>
    </div>
  );
}
