'use client';
import { motion } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';
import { useMemo, type ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Challenge pipeline: every Part 1 idea as one conveyor belt.
//   system prompt → user prompt (+ JSON shape) → JSON mode lock → OpenAI
//   → raw JSON string → json.loads → dict → one card per restaurant
// Stage and data come from the current step only (trigger + variables).
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
  { id: 'cards', label: 'Cards' },
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

    return {
      trig,
      sysRole,
      sysMiddle,
      sysRule,
      line,
      stage,
      city,
      banner,
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
      hasPretty: !!get('pretty_json'),
      recs,
    };
  }, [step, steps, currentStep]);

  const sending = s.trig === 'apiCall';
  const thinking = s.trig === 'apiProcessing';

  return (
    <div className="h-full flex flex-col p-3 gap-2.5 overflow-hidden text-white">
      {/* ── Progress rail ─────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-1">
        {STAGES.map((st, i) => {
          const done = i < s.stage;
          const active = i === s.stage;
          return (
            <div key={st.id} className="flex items-center gap-1 flex-1 min-w-0">
              <motion.div
                animate={{
                  backgroundColor: active ? 'rgba(251,191,36,0.2)' : done ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                  borderColor: active ? '#fbbf24' : done ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.12)',
                  scale: active ? 1.05 : 1,
                }}
                className="flex-1 min-w-0 rounded-md border px-1 py-1 text-center text-[11px] truncate"
                style={{ color: active ? '#fbbf24' : done ? '#4ade80' : 'rgba(255,255,255,0.4)' }}
              >
                {done ? '✓ ' : ''}
                {st.label}
              </motion.div>
              {i < STAGES.length - 1 && <div className={`w-1.5 h-px shrink-0 ${done ? 'bg-accent-green/60' : 'bg-white/15'}`} />}
            </div>
          );
        })}
      </div>

      {/* ── Body: what we send │ OpenAI │ what comes back ─────── */}
      <div className="flex-1 min-h-0 flex gap-2">
        {/* LEFT: the request */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 min-h-0">
          <ColumnTitle text="What we send" sub="the request" />

          {/* Setup checklist collapses into one line once prompts start */}
          <div className="flex flex-wrap gap-1.5">
            <Chip on={s.hasOpenAI} label="OpenAI" />
            <Chip on={s.hasJson} label="json" highlight={s.line === 3} />
            <Chip on={s.hasClient} label="client" />
            {s.city && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-0.5 rounded-full text-[11px] bg-accent-pink/15 border border-accent-pink/40 text-accent-pink"
              >
                City: {s.city}
              </motion.span>
            )}
          </div>

          {/* System prompt card */}
          <Slot
            filled={!!s.system}
            active={s.stage === 1}
            color="#a78bfa"
            title="system_prompt"
            plain="the AI's job + rules"
            empty="system prompt goes here"
          >
            <div className="text-[12px] leading-snug text-white/80">
              <HL on={s.stage === 1 && currentStepIsFirst(steps, currentStep, 'addSystemMsg')}>{s.sysRole}</HL>{' '}
              <span className="text-white/55">{s.sysMiddle}</span>
              <HL on={s.stage === 1 && !currentStepIsFirst(steps, currentStep, 'addSystemMsg')} color="#fbbf24">
                {s.sysRule}
              </HL>
            </div>
          </Slot>

          {/* User prompt card with the requested shape */}
          <Slot
            filled={!!s.userPrompt}
            active={s.stage === 2}
            color="#4a9eff"
            title="user_prompt"
            plain="the task + the JSON shape we want"
            empty="user prompt goes here"
          >
            <div className="text-[12px] leading-snug">
              <HL on={s.line === 12}>{s.taskLine}</HL>
            </div>
            <div className="mt-1.5 rounded-md bg-black/30 border border-white/10 px-2 py-1 font-mono text-[11.5px] leading-relaxed">
              <span className="text-white/50">{'{ '}</span>
              <HL on={s.line === 13} color="#fbbf24">&quot;recommendations&quot;</HL>
              <span className="text-white/50">{': [ { '}</span>
              <HL on={s.line === 14} color="#22d3ee">&quot;name&quot;</HL>
              <span className="text-white/50">, </span>
              <HL on={s.line === 14} color="#22d3ee">&quot;reason&quot;</HL>
              <span className="text-white/50">{' } x3 ] }'}</span>
            </div>
          </Slot>

          {/* JSON mode lock + messages list */}
          <div className="flex gap-2 shrink-0">
            <motion.div
              animate={{
                borderColor: s.jsonMode ? '#4ade80' : 'rgba(255,255,255,0.12)',
                boxShadow: s.stage === 3 ? '0 0 16px rgba(74,222,128,0.35)' : 'none',
              }}
              className="flex-1 min-w-0 rounded-lg border px-2 py-1.5 flex items-center gap-2 bg-white/[0.03]"
            >
              <Padlock locked={s.jsonMode} />
              <div className="min-w-0">
                <div className="font-mono text-[11px] text-white/70 truncate">response_format</div>
                <div className={`text-[11px] ${s.jsonMode ? 'text-accent-green' : 'text-white/40'}`}>
                  {s.jsonMode ? 'JSON mode: locked on' : 'JSON mode: off'}
                </div>
              </div>
            </motion.div>
            <motion.div
              animate={{
                borderColor: s.line === 19 ? '#fbbf24' : 'rgba(255,255,255,0.12)',
              }}
              className="rounded-lg border px-2 py-1.5 bg-white/[0.03] flex flex-col justify-center"
            >
              <div className="font-mono text-[11px] text-white/70">messages</div>
              <div className="flex gap-1 mt-0.5">
                <span className={`px-1 rounded text-[10px] ${s.system ? 'bg-accent-purple/25 text-accent-purple' : 'bg-white/5 text-white/25'}`}>
                  system
                </span>
                <span className={`px-1 rounded text-[10px] ${s.userPrompt ? 'bg-accent-blue/25 text-accent-blue' : 'bg-white/5 text-white/25'}`}>
                  user
                </span>
              </div>
            </motion.div>
          </div>
          {s.hasModel && (
            <div className="text-[11px] text-white/45 font-mono -mt-1">
              model=<span className={s.line === 17 && s.stage === 2 ? 'text-accent-gold' : 'text-white/65'}>&quot;gpt-4o-mini&quot;</span>
            </div>
          )}
        </div>

        {/* MIDDLE: OpenAI */}
        <div className="shrink-0 w-[92px] flex flex-col items-center justify-center gap-2">
          <motion.div
            animate={{ x: sending ? [0, 30, 30] : 0, opacity: sending ? [1, 1, 0] : 0 }}
            transition={{ duration: 1.4, repeat: sending ? Infinity : 0 }}
            className="px-1.5 py-1 rounded bg-accent-gold/20 border border-accent-gold/60 text-[10px] text-accent-gold font-mono"
          >
            request →
          </motion.div>
          <motion.div
            animate={{
              borderColor: s.stage === 4 ? '#fbbf24' : 'rgba(255,255,255,0.15)',
              boxShadow: thinking ? '0 0 22px rgba(167,139,250,0.45)' : 'none',
            }}
            className="w-[84px] rounded-xl border-2 bg-navy-700 p-2 flex flex-col items-center text-center"
          >
            <motion.div
              animate={thinking ? { rotate: 360 } : { rotate: 0 }}
              transition={thinking ? { duration: 2, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
              className="w-8 h-8 rounded-full border-2 border-accent-purple/40 border-t-accent-purple flex items-center justify-center"
            />
            <div className="text-[11px] font-semibold text-white/80 mt-1">OpenAI</div>
            <div className="text-[10px] text-white/45 leading-tight">
              {sending ? 'receiving...' : thinking ? 'picking 3 places' : s.hasResponse ? 'done' : 'waiting'}
            </div>
          </motion.div>
          <motion.div
            animate={{ opacity: s.trig === 'apiCallComplete' ? [0, 1, 1] : 0, x: s.trig === 'apiCallComplete' ? [0, 30, 30] : 0 }}
            transition={{ duration: 1.4, repeat: s.trig === 'apiCallComplete' ? Infinity : 0 }}
            className="px-1.5 py-1 rounded bg-accent-green/20 border border-accent-green/60 text-[10px] text-accent-green font-mono"
          >
            reply →
          </motion.div>
        </div>

        {/* RIGHT: the response */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 min-h-0">
          <ColumnTitle text="What comes back" sub="the response" />

          {/* Raw string */}
          <Slot
            filled={!!s.raw}
            active={s.stage === 5}
            color="#fbbf24"
            title="raw_json"
            plain="type: str (just text)"
            empty={
              s.line === 26
                ? 'heading printed: --- Raw JSON Response ---'
                : s.hasResponse
                  ? 'reply arrived: next we take out the text'
                  : 'raw reply text goes here'
            }
            badge={s.line >= 28 && s.stage === 5 ? 'printed' : undefined}
          >
            <div className="font-mono text-[11px] leading-snug text-accent-gold/90 break-all line-clamp-3">
              &quot;{s.raw}&quot;
            </div>
          </Slot>

          {/* json.loads machine */}
          <motion.div
            animate={{
              borderColor: s.stage === 6 ? '#22d3ee' : s.hasParsed ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.1)',
            }}
            className="shrink-0 rounded-lg border border-dashed px-2 py-1.5 flex items-center gap-2 bg-white/[0.02]"
          >
            <span className={`font-mono text-[12px] ${s.stage >= 6 ? 'text-accent-cyan' : 'text-white/35'}`}>json.loads()</span>
            <motion.span
              animate={s.line === 32 ? { x: [0, 5, 0] } : {}}
              transition={{ duration: 0.8, repeat: s.line === 32 ? Infinity : 0 }}
              className="text-white/40"
            >
              ↓
            </motion.span>
            <span className="text-[11px] text-white/50 truncate">
              {s.line === 30
                ? 'next: make it readable'
                : s.line === 31
                ? 'try: safety net is up'
                : s.hasParsed
                  ? 'text → Python dict'
                  : 'turns text into a dict'}
            </span>
            {s.stage >= 6 && s.line >= 31 && (
              <span className="ml-auto text-[10px] px-1.5 rounded bg-accent-green/15 text-accent-green border border-accent-green/30 shrink-0">
                try ✓
              </span>
            )}
          </motion.div>

          {/* Dict + cards */}
          <Slot
            filled={s.hasParsed}
            active={s.stage >= 6 && s.stage < STAGES.length && s.line >= 32}
            color="#4ade80"
            title={s.hasPretty ? 'pretty cards' : 'parsed_json'}
            plain={s.hasPretty ? 'one card per recommendation' : 'type: dict (keys you can use)'}
            empty="the parsed data goes here"
            badge={s.stage >= 7 ? 'printed' : s.line === 33 ? 'json.dumps(indent=2)' : undefined}
            grow
          >
            {s.hasPretty ? (
              <div className="flex flex-col gap-1.5">
                {s.recs.map((r, i) => (
                  <motion.div
                    key={`${r.name}-${i}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: i * 0.12 }}
                    className="rounded-lg border border-accent-green/30 bg-accent-green/[0.07] px-2 py-1.5 flex gap-2"
                  >
                    <span className="w-5 h-5 shrink-0 rounded-full bg-accent-green/25 text-accent-green text-[11px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold text-white/90 truncate">{r.name}</div>
                      <div className="text-[11px] text-white/60 leading-snug line-clamp-2">{r.reason}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="font-mono text-[11.5px] leading-relaxed">
                <div>
                  <span className="text-accent-gold">&apos;recommendations&apos;</span>
                  <span className="text-white/40">: list of {s.recs.length}</span>
                </div>
                {s.recs.map((r, i) => (
                  <motion.div
                    key={`${r.name}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="pl-3 truncate"
                  >
                    <span className="text-white/35">[{i}] </span>
                    <span className="text-accent-cyan">&apos;name&apos;</span>
                    <span className="text-white/40">: </span>
                    <span className="text-white/75">&apos;{r.name}&apos;</span>
                  </motion.div>
                ))}
              </div>
            )}
          </Slot>
        </div>
      </div>
    </div>
  );
}

function currentStepIsFirst(steps: { animationTrigger?: string }[], idx: number, trig: string): boolean {
  return steps[idx - 1]?.animationTrigger !== trig;
}

function ColumnTitle({ text, sub }: { text: string; sub: string }) {
  return (
    <div className="flex items-baseline gap-2 shrink-0">
      <span className="text-xs font-semibold text-white/75 uppercase tracking-wider">{text}</span>
      <span className="text-[11px] text-white/35">{sub}</span>
    </div>
  );
}

function Chip({ on, label, highlight }: { on: boolean; label: string; highlight?: boolean }) {
  return (
    <motion.span
      animate={{
        opacity: on ? 1 : 0.4,
        scale: highlight ? 1.08 : 1,
        borderColor: highlight ? '#fbbf24' : on ? 'rgba(74,222,128,0.45)' : 'rgba(255,255,255,0.15)',
      }}
      className="px-2 py-0.5 rounded-full text-[11px] font-mono border bg-white/[0.04]"
      style={{ color: on ? '#4ade80' : 'rgba(255,255,255,0.5)' }}
    >
      {on ? '✓ ' : ''}
      {label}
    </motion.span>
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

function Slot({
  filled,
  active,
  color,
  title,
  plain,
  empty,
  grow,
  badge,
  children,
}: {
  filled: boolean;
  active: boolean;
  color: string;
  title: string;
  plain: string;
  empty: string;
  grow?: boolean;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      animate={{
        borderColor: active ? color : filled ? `${color}55` : 'rgba(255,255,255,0.1)',
        boxShadow: active ? `0 0 16px ${color}40` : 'none',
      }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border ${filled ? 'border-solid bg-white/[0.035]' : 'border-dashed'} px-2.5 py-1.5 ${
        grow ? 'flex-1 min-h-0 overflow-hidden' : 'shrink-0'
      }`}
    >
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-mono text-[11.5px] font-semibold" style={{ color: filled ? color : 'rgba(255,255,255,0.35)' }}>
          {title}
        </span>
        <span className="text-[11px] text-white/40 truncate">{plain}</span>
        {badge && (
          <motion.span
            key={badge}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-auto shrink-0 text-[10px] px-1.5 rounded border"
            style={{ color, borderColor: `${color}66`, backgroundColor: `${color}1a` }}
          >
            {badge}
          </motion.span>
        )}
      </div>
      {filled ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          {children}
        </motion.div>
      ) : (
        <div className="text-[11px] text-white/30 italic">{empty}</div>
      )}
    </motion.div>
  );
}

function Padlock({ locked }: { locked: boolean }) {
  const c = locked ? '#4ade80' : 'rgba(255,255,255,0.35)';
  return (
    <svg width="20" height="24" viewBox="0 0 20 24" className="shrink-0">
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
