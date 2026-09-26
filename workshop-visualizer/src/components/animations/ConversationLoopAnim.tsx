'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore, TraceStep } from '@/stores/tracerStore';
import { useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Conversation Loop: "the AI has no memory, WE re-send the whole list".
//   Top row:    while-True track · AI with a blank-memory slate · token meter
//   Bottom row: chat window (what the user sees) · messages pile (what is sent)
// Everything is computed from the current step index, so jumps render right.
// ─────────────────────────────────────────────────────────────────────────────

const spring = { type: 'spring' as const, damping: 20, stiffness: 120 };

interface Message {
  role: string;
  content: string;
}

const roleStyle: Record<string, { color: string; label: string }> = {
  system: { color: '#a78bfa', label: 'system' },
  user: { color: '#4a9eff', label: 'user' },
  assistant: { color: '#4ade80', label: 'assistant' },
};

// Rough token count: ~4 characters per token plus a few tokens of overhead per message.
function estimateTokens(messages: Message[]): number {
  return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4) + 4, 0);
}

function readMessages(step?: TraceStep): Message[] {
  const v = step?.variables.find((x) => x.name === 'messages');
  if (!v) return [];
  try {
    const parsed = JSON.parse(v.value);
    return Array.isArray(parsed) ? (parsed as Message[]) : [];
  } catch {
    return [];
  }
}

// The six stops on the while-loop track, in code order.
const STATIONS = [
  { label: 'input()', hint: 'user types' },
  { label: 'quit?', hint: 'check' },
  { label: 'append', hint: 'user msg' },
  { label: 'create()', hint: 'send ALL' },
  { label: 'append', hint: 'AI msg' },
  { label: 'print', hint: 'show reply' },
];

function stationFor(line: number): number {
  if (line === 10) return 0;
  if (line === 11 || line === 12) return 1;
  if (line === 14) return 2;
  if (line >= 16 && line <= 21) return 3;
  if (line === 22) return 4;
  if (line === 23) return 5;
  return -1;
}

type Memory = 'blank' | 'reading' | 'wiped';

interface CallRecord {
  turn: number;
  count: number;
  tokens: number;
}

export default function ConversationLoopAnim() {
  const { currentStep, steps } = useTracerStore();
  const step = steps[currentStep];
  const trigger = step?.animationTrigger ?? '';
  const line = step?.lineNumber ?? 0;

  const s = useMemo(() => {
    const messages = readMessages(step);
    const turnMatch = trigger.match(/(\d)$/);
    const turn = turnMatch ? Number(turnMatch[1]) : 0;
    const isCalling = trigger.startsWith('apiCall');

    // Calls made so far (one per turn), with how many messages each one sent.
    const calls: CallRecord[] = [];
    for (let i = 0; i <= currentStep; i++) {
      const t = steps[i]?.animationTrigger ?? '';
      const m = t.match(/^apiCall(\d)$/);
      if (m && !calls.some((c) => c.turn === Number(m[1]))) {
        const msgs = readMessages(steps[i]);
        calls.push({ turn: Number(m[1]), count: msgs.length, tokens: estimateTokens(msgs) });
      }
    }
    // Largest list in the whole trace: sets the scale of the token meter.
    const maxTokens = Math.max(1, ...steps.map((st) => estimateTokens(readMessages(st))));

    const memory: Memory = isCalling ? 'reading' : calls.length > 0 ? 'wiped' : 'blank';

    // Chat window = what the terminal shows ("You: ..." / "AI: ...").
    const chat: { who: 'you' | 'ai' | 'info'; text: string }[] = [];
    for (let i = 0; i <= currentStep; i++) {
      const out = steps[i]?.output?.trim();
      if (!out) continue;
      if (out.startsWith('You: ')) chat.push({ who: 'you', text: out.slice(5) });
      else if (out.startsWith('AI: ')) chat.push({ who: 'ai', text: out.slice(4) });
      else chat.push({ who: 'info', text: out });
    }

    const msgVar = step?.variables.find((v) => v.name === 'messages');
    const newestIdx = msgVar?.isChanged || msgVar?.isNew ? messages.length - 1 : -1;
    const has = (name: string) => !!step?.variables.some((v) => v.name === name);
    const setup = [
      { label: 'OpenAI library imported', done: has('OpenAI') },
      { label: 'client created (phone line)', done: has('client') },
      { label: 'messages list created', done: has('messages') },
      { label: 'chat loop started', done: line >= 9 || turn > 0 },
    ];

    return {
      messages,
      turn,
      calls,
      maxTokens,
      memory,
      chat,
      isCalling,
      newestIdx,
      setup,
      station: stationFor(line),
      // Same line as the previous step = the lesson is pausing to make a point.
      repeat: currentStep > 0 && steps[currentStep - 1]?.lineNumber === line && steps[currentStep - 1]?.animationTrigger === trigger,
      reply: step?.variables.find((v) => v.name === 'assistant_msg')?.value ?? '',
      inLoop: line >= 9,
      tokens: estimateTokens(messages),
      totalSent: calls.reduce((a, c) => a + c.tokens, 0),
      lastCall: calls[calls.length - 1],
    };
  }, [step, steps, currentStep, trigger, line]);

  const pileSpot = s.repeat && (s.station === 4 || s.station === 5);

  return (
    <div className="h-full flex flex-col p-3 gap-3 overflow-hidden text-white">
      {/* ── Top row ─────────────────────────────────────────────── */}
      <div className="flex gap-3 shrink-0" style={{ height: 176 }}>
        <LoopTrack
          station={s.station}
          inLoop={s.inLoop}
          turn={s.turn}
          hint={line === 12 ? 'no break' : line === 21 ? 'got reply' : undefined}
        />
        <AiMemory memory={s.memory} count={s.isCalling ? s.messages.length : 0} calls={s.calls.length} />
        <TokenMeter
          tokens={s.tokens}
          max={s.maxTokens}
          calls={s.calls}
          totalSent={s.totalSent}
          active={s.isCalling}
          spotlight={s.isCalling && s.repeat}
        />
      </div>

      {/* ── Bottom row ──────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex gap-3">
        {/* Chat window */}
        <div className="flex-1 min-w-0 flex flex-col rounded-xl border border-white/10 bg-navy-800/60 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 bg-white/[0.03]">
            <span className="w-2 h-2 rounded-full bg-accent-red/70" />
            <span className="w-2 h-2 rounded-full bg-accent-gold/70" />
            <span className="w-2 h-2 rounded-full bg-accent-green/70" />
            <span className="text-xs text-white/60 ml-1">Chat window</span>
            <span className="text-[11px] text-white/35 ml-auto">what the user sees</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-end gap-2 p-3">
            {!s.chat.some((c) => c.who !== 'info') && (
              <div className="flex-1 flex flex-col justify-center gap-1.5">
                <div className="text-[11px] uppercase tracking-wider text-white/35">Getting ready</div>
                {s.setup.map((it) => (
                  <motion.div
                    key={it.label}
                    animate={{ opacity: it.done ? 1 : 0.45 }}
                    className="flex items-center gap-2 text-[12px]"
                  >
                    <motion.span
                      key={String(it.done)}
                      initial={{ scale: it.done ? 1.6 : 1 }}
                      animate={{ scale: 1 }}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        it.done ? 'bg-accent-green/25 border-accent-green text-accent-green' : 'border-white/30 text-transparent'
                      }`}
                    >
                      ✓
                    </motion.span>
                    <span className={it.done ? 'text-white/80' : 'text-white/45'}>{it.label}</span>
                  </motion.div>
                ))}
              </div>
            )}
            {s.chat.map((c, i) =>
              c.who === 'info' ? (
                <motion.div
                  key={`info-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[11px] text-white/40 text-center font-mono"
                >
                  {c.text}
                </motion.div>
              ) : (
                <motion.div
                  key={`${c.who}-${i}`}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={spring}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                    c.who === 'you'
                      ? 'self-end bg-accent-blue/20 border border-accent-blue/40 rounded-br-sm'
                      : 'self-start bg-accent-green/15 border border-accent-green/35 rounded-bl-sm'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: c.who === 'you' ? '#4a9eff' : '#4ade80' }}>
                    {c.who === 'you' ? 'You' : 'AI'}
                  </div>
                  <span className="text-white/85">{c.text}</span>
                </motion.div>
              ),
            )}
            {s.station === 0 && (
              <motion.div
                key={`typing-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="self-end text-[11px] text-accent-blue/80"
              >
                ↑ input() read what you typed
              </motion.div>
            )}
          </div>
        </div>

        {/* Messages pile */}
        <motion.div
          animate={{
            borderColor: pileSpot ? '#fbbf24' : 'rgba(255,255,255,0.1)',
            boxShadow: pileSpot ? '0 0 18px rgba(251,191,36,0.3)' : 'none',
          }}
          className="flex-1 min-w-0 flex flex-col rounded-xl border bg-navy-800/60 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 bg-white/[0.03]">
            <span className="font-mono text-xs text-accent-gold">messages</span>
            <span className="text-[11px] text-white/45">(the chat history)</span>
            <motion.span
              key={s.messages.length}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-bold bg-accent-gold/15 text-accent-gold border border-accent-gold/30"
            >
              {s.messages.length} {s.messages.length === 1 ? 'paper' : 'papers'}
            </motion.span>
          </div>

          <div className="flex-1 min-h-0 flex flex-col p-3 gap-2">
            {/* The pile: newest paper lands on top */}
            <motion.div
              className="flex-1 min-h-0 flex flex-col-reverse relative"
              animate={s.isCalling ? { x: [0, 6, 0] } : { x: 0 }}
              transition={s.isCalling ? { duration: 1.2, repeat: Infinity } : undefined}
            >
              {s.messages.length === 0 && (
                <div className="text-xs text-white/30 italic text-center py-4">The list does not exist yet.</div>
              )}
              {s.messages.map((m, i) => {
                const st = roleStyle[m.role] ?? roleStyle.user;
                const tilt = ((i * 37) % 5) - 2; // small, stable tilt per paper
                const isNewest = i === s.newestIdx;
                return (
                  <motion.div
                    key={`${i}-${m.role}-${m.content.slice(0, 16)}`}
                    initial={{ opacity: 0, y: -40, rotate: tilt * 2 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      rotate: tilt * 0.6,
                      boxShadow: s.isCalling
                        ? '0 0 14px rgba(251,191,36,0.35)'
                        : isNewest
                          ? `0 0 14px ${st.color}55`
                          : '0 2px 6px rgba(0,0,0,0.4)',
                    }}
                    transition={spring}
                    className="rounded-md px-2.5 py-1.5 border mb-[-6px] bg-[#16163d]"
                    style={{ borderColor: s.isCalling ? 'rgba(251,191,36,0.55)' : `${st.color}55`, zIndex: i }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/35">[{i}]</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: st.color }}>
                        {st.label}
                      </span>
                      {isNewest && !s.isCalling && (
                        <span className="text-[10px] text-accent-gold ml-auto">just appended</span>
                      )}
                    </div>
                    <div className="text-[12px] text-white/75 truncate">{m.content}</div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* What happens to the pile */}
            <div className="shrink-0 min-h-[36px] flex items-center">
              {s.isCalling ? (
                <motion.div
                  key="sending"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-[12px] text-accent-gold"
                >
                  <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
                    ↑
                  </motion.span>
                  {line === 18
                    ? `messages=messages: the WHOLE pile (${s.messages.length} papers) goes to the AI.`
                    : `create() is called. It will take the pile with it.`}
                </motion.div>
              ) : pileSpot ? (
                <motion.div
                  key="spot"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-[12px] text-accent-gold"
                >
                  {s.station === 5
                    ? 'This list IS the memory. The AI itself remembers nothing.'
                    : "This pile is the AI's only memory of the chat."}
                </motion.div>
              ) : s.station === 3 ? (
                <motion.div
                  key={`reply-${line}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-accent-green/10 border border-accent-green/30 text-[12px] text-accent-green truncate"
                >
                  {line === 21 && s.reply ? `assistant_msg = ${s.reply}` : 'Reply arrived, saved in response. Not in the pile yet!'}
                </motion.div>
              ) : (
                <div className="w-full flex flex-wrap gap-1.5 text-[11px] text-white/50">
                  {s.calls.length === 0 ? (
                    <span>Every call will re-send the entire pile.</span>
                  ) : (
                    s.calls.map((c) => (
                      <span key={c.turn} className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        Call {c.turn} sent {c.count} papers
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// while True: a circular track with six stops. The glowing dot is "you are here".
// ─────────────────────────────────────────────────────────────────────────────
function LoopTrack({ station, inLoop, turn, hint }: { station: number; inLoop: boolean; turn: number; hint?: string }) {
  const size = 176;
  const r = 60;
  const c = size / 2;
  const pos = (i: number) => {
    const a = (i / STATIONS.length) * Math.PI * 2 - Math.PI / 2;
    return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
  };
  const dot = station >= 0 ? pos(station) : { x: c, y: c - r - 0 };

  return (
    <div className="shrink-0 rounded-xl border border-white/10 bg-navy-800/60 relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={8} />
        {inLoop && (
          <motion.circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="rgba(74,158,255,0.45)"
            strokeWidth={2}
            strokeDasharray="6 8"
            animate={{ strokeDashoffset: [0, -28] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {STATIONS.map((st, i) => {
          const p = pos(i);
          const active = i === station;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={active ? 7 : 5}
              fill={active ? '#fbbf24' : '#14143a'}
              stroke={active ? '#fbbf24' : 'rgba(255,255,255,0.35)'}
              strokeWidth={1.5}
            />
          );
        })}
        {station >= 0 && (
          <motion.circle
            r={11}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={2}
            initial={false}
            animate={{ cx: dot.x, cy: dot.y, opacity: [0.9, 0.3, 0.9] }}
            transition={{ cx: spring, cy: spring, opacity: { duration: 1.4, repeat: Infinity } }}
          />
        )}
      </svg>
      {/* Station labels (HTML so they stay crisp and readable) */}
      {STATIONS.map((st, i) => {
        const a = (i / STATIONS.length) * Math.PI * 2 - Math.PI / 2;
        const lx = c + (r + 2) * Math.cos(a);
        const ly = c + (r + 2) * Math.sin(a);
        const active = i === station;
        const alignRight = Math.cos(a) < -0.2;
        const alignLeft = Math.cos(a) > 0.2;
        return (
          <div
            key={i}
            className="absolute font-mono text-[11px] leading-none whitespace-nowrap"
            style={{
              left: lx,
              top: ly,
              transform: `translate(${alignRight ? 'calc(-100% - 10px)' : alignLeft ? '10px' : '-50%'}, ${
                Math.sin(a) < -0.8 ? '-170%' : Math.sin(a) > 0.8 ? '70%' : '-50%'
              })`,
              color: active ? '#fbbf24' : 'rgba(255,255,255,0.5)',
              fontWeight: active ? 700 : 400,
            }}
          >
            {st.label}
          </div>
        );
      })}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-mono text-[11px] text-accent-blue">while True</span>
        <motion.span key={turn} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-sm font-bold text-white/85">
          {turn > 0 ? `Turn ${turn}` : inLoop ? 'Loop' : 'Setup'}
        </motion.span>
        {station >= 0 && <span className="text-[10px] text-white/45">{hint ?? STATIONS[station].hint}</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// The AI with a "memory slate". It is only filled while a call is running,
// and wiped straight after.
// ─────────────────────────────────────────────────────────────────────────────
function AiMemory({ memory, count, calls }: { memory: Memory; count: number; calls: number }) {
  const borderColor = memory === 'reading' ? '#fbbf24' : memory === 'wiped' ? '#f87171' : 'rgba(255,255,255,0.15)';
  return (
    <div className="flex-1 min-w-0 rounded-xl border border-white/10 bg-navy-800/60 p-2.5 flex flex-col">
      <div className="flex items-center gap-2 mb-1.5">
        <motion.div
          animate={memory === 'reading' ? { rotate: [0, 8, -8, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8, repeat: memory === 'reading' ? Infinity : 0 }}
          className="w-7 h-7 rounded-lg bg-accent-purple/20 border border-accent-purple/50 flex items-center justify-center text-[11px] font-bold text-accent-purple"
        >
          AI
        </motion.div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-white/85 leading-tight">OpenAI model</div>
          <div className="text-[11px] text-white/45 leading-tight">memory between calls: none</div>
        </div>
      </div>

      <motion.div
        className="flex-1 min-h-0 rounded-lg border-2 border-dashed p-2 flex flex-col items-center justify-center text-center relative overflow-hidden"
        animate={{ borderColor }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence initial={false}>
          {memory === 'reading' && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="flex items-end gap-0.5">
                {Array.from({ length: count }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="w-3.5 h-5 rounded-sm bg-accent-gold/40 border border-accent-gold/70"
                  />
                ))}
              </div>
              <div className="text-[12px] text-accent-gold font-semibold">Reading all {count} messages...</div>
              <div className="text-[11px] text-white/50">This is the ONLY thing it knows right now.</div>
            </motion.div>
          )}
        </AnimatePresence>
        {memory !== 'reading' && (
          <motion.div key={`${memory}-${calls}`} className="flex flex-col items-center gap-1">
            {memory === 'wiped' && (
              <motion.div
                initial={{ scaleX: 1, opacity: 0.8 }}
                animate={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeIn' }}
                className="absolute inset-2 rounded bg-accent-gold/25 origin-right"
              />
            )}
            <div className="text-2xl font-mono text-white/20 leading-none">∅</div>
            <div className={`text-[12px] font-semibold ${memory === 'wiped' ? 'text-accent-red' : 'text-white/60'}`}>
              {memory === 'wiped' ? 'Memory wiped!' : 'Blank memory'}
            </div>
            <div className="text-[11px] text-white/45 leading-snug">
              {memory === 'wiped' ? 'It already forgot this chat. Only our list remembers.' : 'It knows nothing about you yet.'}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Token meter: size of the list right now, and a bar per call so far.
// ─────────────────────────────────────────────────────────────────────────────
function TokenMeter({
  tokens,
  max,
  calls,
  totalSent,
  active,
  spotlight,
}: {
  tokens: number;
  max: number;
  calls: CallRecord[];
  totalSent: number;
  active: boolean;
  spotlight?: boolean;
}) {
  const pct = Math.min(100, (tokens / max) * 100);
  const maxCall = Math.max(1, ...calls.map((c) => c.tokens), max);
  return (
    <motion.div
      animate={{
        borderColor: spotlight ? '#fbbf24' : 'rgba(255,255,255,0.1)',
        boxShadow: spotlight ? '0 0 18px rgba(251,191,36,0.35)' : 'none',
      }}
      className="shrink-0 w-[150px] rounded-xl border bg-navy-800/60 p-2.5 flex flex-col gap-2"
    >
      <div>
        <div className="text-xs font-semibold text-white/80">Token meter</div>
        <div className="text-[11px] text-white/45 leading-tight">tokens = pieces of text</div>
      </div>
      <div>
        <div className="flex justify-between text-[11px] text-white/55 mb-1">
          <span>list size</span>
          <motion.span key={tokens} initial={{ scale: 1.3, color: '#fbbf24' }} animate={{ scale: 1, color: 'rgba(255,255,255,0.8)' }} className="font-mono">
            ~{tokens}
          </motion.span>
        </div>
        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#4ade80,#fbbf24,#f87171)', backgroundSize: '150px 100%' }}
            animate={{ width: `${pct}%` }}
            transition={spring}
          />
        </div>
      </div>
      <div className="flex-1 min-h-0 flex items-end gap-2 border-b border-white/10 pb-0.5">
        {calls.length === 0 && <span className="text-[11px] text-white/35 self-center">No calls yet</span>}
        {calls.map((c) => (
          <div key={c.turn} className="flex flex-col items-center justify-end h-full flex-1">
            <span className="text-[10px] font-mono text-white/60">{c.tokens}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(c.tokens / maxCall) * 70}%` }}
              transition={spring}
              className={`w-full rounded-t ${active && c === calls[calls.length - 1] ? 'bg-accent-gold' : 'bg-accent-gold/45'}`}
            />
            <span className="text-[10px] text-white/45 mt-0.5">call {c.turn}</span>
          </div>
        ))}
      </div>
      <div className="text-[11px] text-white/55">
        sent in total: <span className="font-mono text-accent-gold">~{totalSent}</span>
      </div>
      {spotlight && <div className="text-[11px] text-accent-gold leading-snug">Bigger list, more tokens, every turn.</div>}
    </motion.div>
  );
}
