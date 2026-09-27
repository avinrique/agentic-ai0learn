'use client';
import { motion } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';
import { useMemo, type ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Challenge pipeline: every Part 1 idea as one conveyor belt.
//   system prompt → user prompt (+ JSON shape) → JSON mode lock → OpenAI
//   → raw JSON string → json.loads → dict → printed → (last step) one card per restaurant
// The rail at the top shows past stages as small ✓ chips; the body shows ONLY
// the current stage, big. On print() steps a small terminal shows what was printed.
// Stage and data come from the current step only.
// ─────────────────────────────────────────────────────────────────────────────

const spring = { type: 'spring' as const, damping: 20, stiffness: 120 };

const STAGES = [
  { id: 'setup', label: 'Setup' },
  { id: 'system', label: 'System' },
  { id: 'prompt', label: 'Prompt' },
  { id: 'lock', label: 'JSON mode' },
  { id: 'api', label: 'OpenAI' },
  { id: 'raw', label: 'Raw text' },
  { id: 'loads', label: 'json.loads' },
  { id: 'print', label: 'Print' },
] as const;

const triggerStage: Record<string, number> = {
  import: 0,
  createClient: 0,
  addSystemMsg: 1,
  addUserMsg: 2,
  buildMessages: 3,
  apiCall: 4,
  apiProcessing: 4,
  apiCallComplete: 4,
  extractContent: 5,
  jsonParse: 6,
  printOutput: 7,
};

interface Rec {
  name: string;
  reason: string;
}

function unquote(v?: string): string {
  if (!v) return '';
  return v.replace(/^"""|"""$/g, '').replace(/^"|"$/g, '').trim();
}

export default function ChallengePipelineAnim() {
  const { currentStep, steps } = useTracerStore();
  const step = steps[currentStep];

  const s = useMemo(() => {
    const vars = step?.variables ?? [];
    const get = (n: string) => vars.find((v) => v.name === n)?.value;
    const trig = step?.animationTrigger ?? '';
    const line = step?.lineNumber ?? 0;
    // On the very last step every stage gets its tick.
    const stage = currentStep === steps.length - 1 ? STAGES.length : triggerStage[trig] ?? 0;

    const userPrompt = unquote(get('user_prompt'));
    const raw = get('raw_json') ?? '';
    let recs: Rec[] = [];
    try {
      recs = raw ? (JSON.parse(raw).recommendations as Rec[]) ?? [] : [];
    } catch {
      recs = [];
    }
    // City shows up in the first printed line: "... Bot (Bangalore)..."
    let banner = '';
    for (let i = 0; i <= currentStep; i++) {
      const o = steps[i]?.output;
      if (o && o.startsWith('Calling')) banner = o;
    }
    const city = banner.match(/\(([^)]+)\)/)?.[1] ?? '';

    // Split the system prompt into: role sentence · middle · the JSON rule.
    const system = unquote(get('system_prompt'));
    const dot = system.indexOf('. ');
    const sysRole = dot >= 0 ? system.slice(0, dot + 1) : system;
    const rest = dot >= 0 ? system.slice(dot + 2) : '';
    const ruleAt = rest.search(/\S*\s*(reply|respond)[^.]*JSON/i);
    const sysMiddle = ruleAt > 0 ? rest.slice(0, ruleAt) : ruleAt === 0 ? '' : rest;
    const sysRule = ruleAt >= 0 ? rest.slice(ruleAt) : '';

    // What print() has written so far: the current step's print (if any) and the one before it.
    const printed: { text: string; hot: boolean }[] = [];
    for (let i = 0; i <= currentStep; i++) {
      const o = steps[i]?.output;
      if (o) printed.push({ text: o.replace(/^\n/, ''), hot: i === currentStep });
    }
    const prints = step?.output ? printed.slice(-2) : [];

    return {
      trig,
      prints,
      sysRole,
      sysMiddle,
      sysRule,
      firstSys: steps[currentStep - 1]?.animationTrigger !== 'addSystemMsg',
      line,
      stage,
      city,
      hasOpenAI: !!get('OpenAI'),
      hasJson: !!get('json'),
      hasClient: !!get('client'),
      system,
      userPrompt,
      taskLine: userPrompt.split('\n')[0] ?? '',
      hasModel: !!get('model'),
      jsonMode: !!get('response_format'),
      hasResponse: !!get('response'),
      raw,
      hasParsed: !!get('parsed_json'),
      pretty: get('pretty_json') ?? '',
      recs,
    };
  }, [step, steps, currentStep]);

  const isLast = currentStep === steps.length - 1;
  // Which big view fills the body right now.
  const view =
    s.stage === 0
      ? 'setup'
      : s.stage === 1
        ? 'system'
        : s.stage === 2 && s.line < 17
          ? 'prompt'
          : s.stage <= 3
            ? 'request'
            : s.stage === 4
              ? 'api'
              : s.stage === 5
                ? 'raw'
                : s.stage === 6
                  ? 'loads'
                  : isLast
                    ? 'cards'
                    : 'print';

  return (
    <div className="h-full flex flex-col px-5 py-4 gap-4 overflow-hidden text-white">
      <Rail stage={s.stage} />

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: s.prints.length > 0 && view !== 'print' ? 0.55 : 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[640px] min-h-0 flex flex-col"
        >
          {view === 'setup' && <SetupView s={s} />}
          {view === 'system' && <SystemView s={s} />}
          {view === 'prompt' && <PromptView s={s} />}
          {view === 'request' && <RequestView s={s} />}
          {view === 'api' && <ApiView s={s} />}
          {view === 'raw' && <RawView s={s} />}
          {view === 'loads' && <LoadsView s={s} />}
          {view === 'print' && <Terminal lines={s.prints} maxLines={11} />}
          {view === 'cards' && <CardsView s={s} />}
        </motion.div>
        {s.prints.length > 0 && view !== 'print' && (
          <div className="w-full max-w-[640px] shrink-0">
            <Terminal lines={s.prints} maxLines={3} />
          </div>
        )}
      </div>
    </div>
  );
}

type S = {
  trig: string;
  prints: { text: string; hot: boolean }[];
  sysRole: string;
  sysMiddle: string;
  sysRule: string;
  firstSys: boolean;
  line: number;
  stage: number;
  city: string;
  hasOpenAI: boolean;
  hasJson: boolean;
  hasClient: boolean;
  system: string;
  userPrompt: string;
  taskLine: string;
  hasModel: boolean;
  jsonMode: boolean;
  hasResponse: boolean;
  raw: string;
  hasParsed: boolean;
  pretty: string;
  recs: Rec[];
};

// ── Rail: past stages = small ✓ chips, current = gold, future = faint ─────────
function Rail({ stage }: { stage: number }) {
  return (
    <div className="shrink-0 flex items-center gap-1.5 flex-wrap">
      {STAGES.map((st, i) => {
        const done = i < stage;
        const active = i === stage;
        return (
          <motion.div
            key={st.id}
            layout
            animate={{ opacity: done || active ? 1 : 0.35 }}
            className={`rounded-full px-2.5 py-1 text-[13px] whitespace-nowrap ${
              active
                ? 'bg-accent-gold/15 text-accent-gold font-semibold ring-1 ring-accent-gold/60'
                : done
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'text-white/60'
            }`}
          >
            {done ? '✓ ' : ''}
            {st.label}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Big card used by every view ────────────────────────────────────────────
function Card({ label, color, glow, children }: { label: string; color: string; glow?: boolean; children: ReactNode }) {
  return (
    <motion.div
      animate={{ boxShadow: glow ? `0 0 28px ${color}33` : '0 0 0 rgba(0,0,0,0)', borderColor: glow ? `${color}aa` : `${color}44` }}
      className="rounded-2xl border bg-white/[0.035] px-6 py-5"
    >
      <div className="font-mono text-[14px] font-semibold mb-3" style={{ color }}>
        {label}
      </div>
      {children}
    </motion.div>
  );
}

function HL({ on, children, color = '#4a9eff' }: { on: boolean; children: ReactNode; color?: string }) {
  return (
    <motion.span
      animate={{ backgroundColor: on ? `${color}33` : 'rgba(0,0,0,0)' }}
      className="rounded px-0.5"
      style={{ color: on ? color : undefined, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
    >
      {children}
    </motion.span>
  );
}

// ── Stage views ────────────────────────────────────────────────────────────

function SetupView({ s }: { s: S }) {
  const tiles = [
    { on: s.hasOpenAI, label: 'OpenAI', hot: s.line === 2 },
    { on: s.hasJson, label: 'json', hot: s.line === 3 },
    { on: s.hasClient, label: 'client', hot: s.line === 5 },
  ];
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-4 justify-center">
        {tiles.map((t) => (
          <motion.div
            key={t.label}
            animate={{
              opacity: t.on ? 1 : 0.3,
              scale: t.hot ? 1.08 : 1,
              borderColor: t.hot ? '#fbbf24' : t.on ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.15)',
            }}
            className="rounded-xl border-2 px-6 py-4 font-mono text-[18px] bg-white/[0.03]"
            style={{ color: t.hot ? '#fbbf24' : t.on ? '#4ade80' : 'rgba(255,255,255,0.6)' }}
          >
            {t.on ? '✓ ' : ''}
            {t.label}
          </motion.div>
        ))}
      </div>
      {s.city && s.prints.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-1.5 rounded-full text-[16px] bg-accent-pink/15 border border-accent-pink/40 text-accent-pink"
        >
          City: {s.city}
        </motion.div>
      )}
    </div>
  );
}

function SystemView({ s }: { s: S }) {
  return (
    <Card label="system_prompt" color="#a78bfa" glow>
      <div className="text-[18px] leading-relaxed text-white/85">
        <HL on={s.firstSys} color="#a78bfa">
          {s.sysRole}
        </HL>{' '}
        <span className="text-white/45">{s.sysMiddle}</span>
        <HL on={!s.firstSys} color="#fbbf24">
          {s.sysRule}
        </HL>
      </div>
    </Card>
  );
}

function PromptView({ s }: { s: S }) {
  const dim = 'text-white/40';
  return (
    <Card label="user_prompt" color="#4a9eff" glow={s.line === 11}>
      <div className="text-[18px] leading-snug text-white/85">
        <HL on={s.line === 12}>{s.taskLine}</HL>
      </div>
      <motion.div
        animate={{ opacity: s.line >= 13 ? 1 : 0.4 }}
        className="mt-4 rounded-xl bg-black/30 px-4 py-3 font-mono text-[15px] leading-relaxed"
      >
        <div className={dim}>{'{'}</div>
        <div className="pl-5">
          <HL on={s.line === 13} color="#fbbf24">
            &quot;recommendations&quot;
          </HL>
          <span className={dim}>: [</span>
        </div>
        <div className="pl-10">
          <span className={dim}>{'{ '}</span>
          <HL on={s.line === 14} color="#22d3ee">
            &quot;name&quot;
          </HL>
          <span className={dim}>, </span>
          <HL on={s.line === 14} color="#22d3ee">
            &quot;reason&quot;
          </HL>
          <span className={dim}>{' }'}</span>
          <span className="text-white/60 font-sans text-[14px] ml-2">×3</span>
        </div>
        <div className={`pl-5 ${dim}`}>]</div>
        <div className={dim}>{'}'}</div>
      </motion.div>
    </Card>
  );
}

function RequestView({ s }: { s: S }) {
  const lockHot = s.stage === 3;
  return (
    <Card label="the request" color="#fbbf24">
      <div className="flex flex-col gap-4 text-[16px]">
        <Row label="model" hot={s.line === 17 && s.stage === 2}>
          <span className="font-mono text-white/85">&quot;gpt-4o-mini&quot;</span>
        </Row>
        <Row label="messages" hot={s.line === 19}>
          <span className="px-3 py-1 rounded-lg bg-accent-purple/20 text-accent-purple">system</span>
          <span className="px-3 py-1 rounded-lg bg-accent-blue/20 text-accent-blue">user</span>
        </Row>
        <Row label="response_format" hot={lockHot} dimmed={!s.jsonMode}>
          <Padlock locked={s.jsonMode} />
          <span className={s.jsonMode ? 'text-accent-green font-semibold' : 'text-white/45'}>
            {s.jsonMode ? 'JSON mode on' : 'not set yet'}
          </span>
        </Row>
      </div>
    </Card>
  );
}

function Row({ label, hot, dimmed, children }: { label: string; hot?: boolean; dimmed?: boolean; children: ReactNode }) {
  return (
    <motion.div
      animate={{
        opacity: dimmed ? 0.4 : hot ? 1 : 0.7,
        backgroundColor: hot ? 'rgba(251,191,36,0.1)' : 'rgba(0,0,0,0)',
      }}
      className="flex items-center gap-3 rounded-xl px-3 py-2"
    >
      <span className={`font-mono w-[150px] shrink-0 ${hot ? 'text-accent-gold' : 'text-white/55'}`}>{label}</span>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </motion.div>
  );
}

function ApiView({ s }: { s: S }) {
  const sending = s.trig === 'apiCall';
  const thinking = s.trig === 'apiProcessing';
  const back = s.hasResponse;
  return (
    <div className="flex items-center justify-center gap-5">
      <motion.div
        animate={{ opacity: sending ? 1 : 0.45, x: sending ? [0, 12, 0] : 0 }}
        transition={{ duration: 1.2, repeat: sending ? Infinity : 0 }}
        className="rounded-xl border border-accent-gold/50 bg-accent-gold/10 px-4 py-3 text-[15px] text-accent-gold text-center"
      >
        request
        <div className="text-[13px] text-white/60 mt-0.5">system + user + 🔒</div>
      </motion.div>
      <span className="text-2xl text-white/30">→</span>
      <motion.div
        animate={{
          borderColor: thinking ? '#a78bfa' : 'rgba(255,255,255,0.2)',
          boxShadow: thinking ? '0 0 32px rgba(167,139,250,0.45)' : 'none',
        }}
        className="w-[150px] rounded-2xl border-2 bg-navy-700 py-5 flex flex-col items-center"
      >
        <motion.div
          animate={thinking ? { rotate: 360 } : { rotate: 0 }}
          transition={thinking ? { duration: 2, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
          className="w-12 h-12 rounded-full border-[3px] border-accent-purple/30 border-t-accent-purple"
        />
        <div className="text-[18px] font-semibold text-white/90 mt-3">OpenAI</div>
        <div className="text-[13px] text-white/55">{thinking ? 'thinking…' : back ? 'done' : 'receiving'}</div>
      </motion.div>
      <span className="text-2xl text-white/30">→</span>
      <motion.div
        animate={{ opacity: back ? 1 : 0.2, scale: back ? 1 : 0.9 }}
        className="rounded-xl border border-accent-green/50 bg-accent-green/10 px-4 py-3 text-[15px] text-accent-green text-center font-mono"
      >
        response
      </motion.div>
    </div>
  );
}

function RawView({ s }: { s: S }) {
  if (!s.raw) {
    return (
      <Card label="raw_json" color="#fbbf24">
        <div className="text-[16px] text-white/40 italic">empty</div>
      </Card>
    );
  }
  return (
    <Card label="raw_json" color="#fbbf24" glow={s.line === 27}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[13px] px-2 py-0.5 rounded bg-white/10 text-white/70">type: str</span>
        {s.line >= 28 && <span className="text-[13px] px-2 py-0.5 rounded bg-accent-green/15 text-accent-green">✓ printed</span>}
      </div>
      <div className="font-mono text-[14px] leading-relaxed text-accent-gold/90 break-words line-clamp-6">
        &quot;{softBreaks(s.raw)}&quot;
      </div>
    </Card>
  );
}

function LoadsView({ s }: { s: S }) {
  const tryOn = s.line >= 31;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full rounded-xl bg-white/[0.03] px-4 py-2 flex items-center gap-3 opacity-60">
        <span className="font-mono text-[13px] text-accent-gold shrink-0">raw_json</span>
        <span className="font-mono text-[13px] text-white/50 truncate">&quot;{s.raw}&quot;</span>
      </div>
      <motion.div
        animate={{ borderColor: tryOn ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.1)' }}
        className="rounded-xl border-2 border-dashed px-5 py-2 flex items-center gap-3"
      >
        {tryOn && <span className="font-mono text-[14px] text-accent-green">try:</span>}
        <span className={`font-mono text-[18px] ${s.line === 32 ? 'text-accent-cyan' : 'text-white/60'}`}>
          {s.line >= 33 ? 'json.dumps(indent=2)' : 'json.loads()'}
        </span>
        <motion.span
          animate={s.line === 32 || s.line === 33 ? { y: [0, 5, 0] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-white/50 text-xl"
        >
          ↓
        </motion.span>
      </motion.div>
      <div className="w-full">
        {s.line >= 33 && s.pretty ? (
          <Card label="pretty_json" color="#22d3ee" glow>
            <pre className="font-mono text-[13px] leading-relaxed text-white/80 max-h-[200px] overflow-hidden whitespace-pre-wrap">
              {s.pretty.split('\n').slice(0, 7).join('\n')}
              {'\n  …'}
            </pre>
          </Card>
        ) : s.hasParsed ? (
          <Card label="parsed_json" color="#22d3ee" glow>
            <div className="text-[13px] mb-2">
              <span className="px-2 py-0.5 rounded bg-white/10 text-white/70">type: dict</span>
            </div>
            <div className="font-mono text-[15px] leading-relaxed">
              <div>
                <span className="text-accent-gold">&apos;recommendations&apos;</span>
                <span className="text-white/45">: list of {s.recs.length}</span>
              </div>
              {s.recs.map((r, i) => (
                <motion.div
                  key={`${r.name}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="pl-5 truncate"
                >
                  <span className="text-white/40">[{i}] </span>
                  <span className="text-white/85">{r.name}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 py-8 text-center text-[15px] text-white/35">Python dict</div>
        )}
      </div>
    </div>
  );
}

function CardsView({ s }: { s: S }) {
  return (
    <div className="flex flex-col gap-3">
      {s.city && <div className="text-[14px] text-white/55 text-center">Top 3 in {s.city}</div>}
      {s.recs.map((r, i) => (
        <motion.div
          key={`${r.name}-${i}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring, delay: i * 0.12 }}
          className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.07] px-5 py-4 flex gap-4 items-start"
        >
          <span className="w-8 h-8 shrink-0 rounded-full bg-accent-green/25 text-accent-green text-[15px] font-bold flex items-center justify-center">
            {i + 1}
          </span>
          <div className="min-w-0">
            <div className="text-[17px] font-semibold text-white/95">{r.name}</div>
            <div className="text-[14px] text-white/65 leading-snug mt-0.5">{r.reason}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// A line break is allowed after JSON punctuation, so long JSON wraps between items, not mid-word.
function softBreaks(text: string): ReactNode[] {
  const bits = text.split(/([,:[{])/);
  const out: ReactNode[] = [];
  for (let i = 0; i < bits.length; i += 2) {
    out.push(
      <span key={i}>
        {bits[i]}
        {bits[i + 1] ?? ''}
        <wbr />
      </span>,
    );
  }
  return out;
}

// What print() wrote. The current print is bright; a one-line JSON string stays on ONE line
// (running off the edge), exactly like the real terminal.
function Terminal({ lines, maxLines }: { lines: { text: string; hot: boolean }[]; maxLines: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="rounded-xl bg-black/60 px-4 py-3 font-mono text-[14px] leading-relaxed overflow-hidden"
    >
      <div className="font-sans text-[13px] text-white/40 mb-1">Terminal</div>
      {lines.map((l, i) => {
        const rows = l.text.split('\n');
        const shown = rows.slice(0, maxLines);
        return (
          <div
            key={i}
            className={`${rows.length === 1 ? 'whitespace-nowrap overflow-hidden text-ellipsis' : 'whitespace-pre-wrap'} ${
              l.hot ? 'text-white' : 'text-white/40'
            }`}
          >
            {shown.join('\n')}
            {rows.length > shown.length && '\n  …'}
          </div>
        );
      })}
    </motion.div>
  );
}

function Padlock({ locked }: { locked: boolean }) {
  const c = locked ? '#4ade80' : 'rgba(255,255,255,0.35)';
  return (
    <svg width="24" height="28" viewBox="0 0 20 24" className="shrink-0">
      <motion.path
        d="M5 11 V7 a5 5 0 0 1 10 0 V11"
        fill="none"
        stroke={c}
        strokeWidth={2.2}
        strokeLinecap="round"
        initial={false}
        animate={{ y: locked ? 0 : -3 }}
        transition={spring}
      />
      <rect x="2" y="11" width="16" height="12" rx="2.5" fill={locked ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.06)'} stroke={c} strokeWidth={1.5} />
      <circle cx="10" cy="17" r="1.8" fill={c} />
    </svg>
  );
}
