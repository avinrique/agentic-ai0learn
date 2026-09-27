'use client';
import { motion } from 'framer-motion';
import { useTracerStore, TraceStep } from '@/stores/tracerStore';
import { useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Conversation Loop: "the AI has no memory, WE re-send the whole list".
//   Top:    a thin while-True strip (where in the loop we are)
//   Left:   the messages list (always visible: this IS the memory), in list
//           order: messages[0] on top, append() adds at the bottom
//   Right:  ONE panel that depends on the phase:
//             chat window (typing / printing) or the AI (reading / wiped)
// Token sizes only appear while a call is being made.
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

// The six stops of the while loop, in code order.
const STATIONS = ['input()', 'quit?', 'append', 'create()', 'append', 'print'];

function stationFor(line: number): number {
  if (line === 10) return 0;
  if (line === 11 || line === 12) return 1;
  if (line === 14) return 2;
  if (line >= 16 && line <= 21) return 3;
  if (line === 22) return 4;
  if (line === 23) return 5;
  return -1;
}

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
    const station = stationFor(line);
    const repeat =
      currentStep > 0 && steps[currentStep - 1]?.lineNumber === line && steps[currentStep - 1]?.animationTrigger === trigger;

    // Right-hand panel: the AI while a call runs / right after (memory wiped),
    // otherwise the chat window.
    const aiPhase: 'reading' | 'reply' | 'wiped' | null = isCalling
      ? 'reading'
      : station === 3
        ? 'reply'
        : station === 4
          ? 'wiped'
          : null;

    return {
      messages,
      turn,
      calls,
      chat,
      isCalling,
      newestIdx,
      station,
      repeat,
      aiPhase,
      reply: (step?.variables.find((v) => v.name === 'assistant_msg')?.value ?? '').replace(/^"|"$/g, ''),
      inLoop: line >= 9,
      tokens: estimateTokens(messages),
    };
  }, [step, steps, currentStep, trigger, line]);

  // The "list grows = more tokens" moment: compare every call so far.
  const showCompare = s.isCalling && s.repeat && s.calls.length > 1;
  const pileFocus = s.station === 2 || s.station === 4 || s.isCalling || (!s.inLoop && s.messages.length > 0);

  return (
    <div className="h-full flex flex-col px-5 py-4 gap-4 overflow-hidden text-white">
      <LoopStrip station={s.station} inLoop={s.inLoop} turn={s.turn} />

      <div className="flex-1 min-h-0 flex gap-4">
        {/* ── The messages pile (the only memory) ─────────────────── */}
        <motion.div
          animate={{
            borderColor: s.isCalling ? 'rgba(251,191,36,0.7)' : pileFocus ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.08)',
            opacity: pileFocus || s.messages.length === 0 ? 1 : 0.7,
          }}
          className="flex-1 min-w-0 flex flex-col rounded-2xl border bg-white/[0.025] px-4 py-3"
        >
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <span className="font-mono text-[15px] font-semibold text-accent-gold">messages</span>
            {s.messages.length > 0 && (
              <motion.span
                key={s.messages.length}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                className="px-2 py-0.5 rounded-full text-[13px] font-bold bg-accent-gold/15 text-accent-gold"
              >
                {s.messages.length}
              </motion.span>
            )}
            {s.isCalling && (
              <span className="ml-auto text-[13px] font-mono text-white/60">~{s.tokens} tokens</span>
            )}
          </div>

          <motion.div
            className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden"
            animate={s.isCalling ? { x: [0, 6, 0] } : { x: 0 }}
            transition={s.isCalling ? { duration: 1.2, repeat: Infinity } : undefined}
          >
            {s.messages.length === 0 && <div className="text-[14px] text-white/30 italic text-center py-6">no list yet</div>}
            {s.messages.map((m, i) => {
              const st = roleStyle[m.role] ?? roleStyle.user;
              const isNewest = i === s.newestIdx && !s.isCalling;
              return (
                <motion.div
                  key={`${i}-${m.role}-${m.content.slice(0, 16)}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    boxShadow: isNewest ? `0 0 16px ${st.color}55` : '0 0 0 rgba(0,0,0,0)',
                  }}
                  transition={spring}
                  className="rounded-xl px-3.5 py-2 border bg-[#16163d]"
                  style={{ borderColor: s.isCalling ? 'rgba(251,191,36,0.5)' : isNewest ? st.color : `${st.color}40` }}
                >
                  <div className="text-[13px] font-semibold" style={{ color: st.color }}>
                    {st.label}
                    <span className="ml-1.5 font-mono font-normal text-white/35">[{i}]</span>
                  </div>
                  <div className="text-[14px] text-white/80 truncate">{m.content}</div>
                </motion.div>
              );
            })}
          </motion.div>

          {showCompare && <CallCompare calls={s.calls} />}
        </motion.div>

        {/* ── Right: chat window OR the AI, depending on the phase ── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {s.aiPhase ? (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 min-h-0 flex flex-col"
            >
              <AiPanel phase={s.aiPhase} count={s.messages.length} reply={line === 21 ? s.reply : ''} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 min-h-0 flex flex-col rounded-2xl border border-white/10 bg-white/[0.025] overflow-hidden"
            >
              <div className="px-4 py-2.5 text-[14px] text-white/60 border-b border-white/[0.06]">Chat window</div>
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-end gap-2.5 p-4">
                {s.chat.map((c, i) =>
                  c.who === 'info' ? (
                    <div key={`info-${i}`} className="text-[13px] text-white/35 text-center">
                      {c.text}
                    </div>
                  ) : (
                    <motion.div
                      key={`${c.who}-${i}`}
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={spring}
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug ${
                        c.who === 'you'
                          ? 'self-end bg-accent-blue/20 rounded-br-sm'
                          : 'self-start bg-accent-green/15 rounded-bl-sm'
                      }`}
                    >
                      <div className="text-[13px] mb-0.5" style={{ color: c.who === 'you' ? '#4a9eff' : '#4ade80' }}>
                        {c.who === 'you' ? 'You' : 'AI'}
                      </div>
                      <span className="text-white/90">{c.text}</span>
                    </motion.div>
                  ),
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// while True: one thin strip. Current stop is gold; the rest are faint.
// ─────────────────────────────────────────────────────────────────────────────
function LoopStrip({ station, inLoop, turn }: { station: number; inLoop: boolean; turn: number }) {
  return (
    <motion.div animate={{ opacity: inLoop ? 1 : 0.35 }} className="shrink-0 flex items-center gap-2 flex-wrap">
      <span className="font-mono text-[13px] text-accent-blue mr-1">while True</span>
      {turn > 0 && (
        <motion.span
          key={turn}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          className="px-2.5 py-0.5 rounded-full text-[13px] font-semibold bg-white/10 text-white/90 mr-1"
        >
          Turn {turn}
        </motion.span>
      )}
      {STATIONS.map((st, i) => {
        const active = i === station;
        return (
          <span key={i} className="flex items-center gap-2">
            <span
              className={`font-mono text-[13px] px-2 py-0.5 rounded-md ${
                active ? 'bg-accent-gold/15 text-accent-gold font-semibold ring-1 ring-accent-gold/50' : 'text-white/35'
              }`}
            >
              {st}
            </span>
            {i < STATIONS.length - 1 && <span className="text-white/20 text-[13px]">→</span>}
          </span>
        );
      })}
      <span className="text-white/30 text-[15px]">↺</span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// The AI: reads the pile during a call, then forgets everything.
// ─────────────────────────────────────────────────────────────────────────────
function AiPanel({ phase, count, reply }: { phase: 'reading' | 'reply' | 'wiped'; count: number; reply: string }) {
  const border = phase === 'reading' ? '#fbbf24' : phase === 'wiped' ? '#f87171' : 'rgba(74,222,128,0.6)';
  return (
    <motion.div
      animate={{ borderColor: border }}
      className="flex-1 min-h-0 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 px-5 text-center relative overflow-hidden"
    >
      <motion.div
        animate={phase === 'reading' ? { rotate: [0, 8, -8, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8, repeat: phase === 'reading' ? Infinity : 0 }}
        className="w-16 h-16 rounded-2xl bg-accent-purple/20 border border-accent-purple/50 flex items-center justify-center text-[20px] font-bold text-accent-purple"
      >
        AI
      </motion.div>

      {phase === 'reading' && (
        <>
          <div className="flex items-end gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="w-5 h-7 rounded bg-accent-gold/40 border border-accent-gold/70"
              />
            ))}
          </div>
          <div className="text-[17px] text-accent-gold font-semibold">reading all {count}</div>
        </>
      )}

      {phase === 'reply' &&
        (reply ? (
          <div className="rounded-2xl bg-accent-green/15 px-4 py-3 text-left max-w-full">
            <div className="text-[13px] font-mono text-accent-green mb-1">assistant_msg</div>
            <div className="text-[15px] text-white/90 leading-snug">{reply}</div>
          </div>
        ) : (
          <div className="text-[17px] text-accent-green font-semibold">✓ reply ready</div>
        ))}

      {phase === 'wiped' && (
        <>
          <motion.div
            initial={{ scaleX: 1, opacity: 0.7 }}
            animate={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeIn' }}
            className="absolute inset-3 rounded-xl bg-accent-gold/20 origin-right"
          />
          <div className="text-4xl font-mono text-white/25 leading-none">∅</div>
          <div className="text-[17px] font-semibold text-accent-red">memory wiped</div>
        </>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Only on the "list grows = more tokens" step: one bar per call.
// ─────────────────────────────────────────────────────────────────────────────
function CallCompare({ calls }: { calls: CallRecord[] }) {
  const max = Math.max(1, ...calls.map((c) => c.tokens));
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="shrink-0 mt-3 pt-3 border-t border-white/10 flex flex-col gap-2"
    >
      {calls.map((c) => (
        <div key={c.turn} className="flex items-center gap-3 text-[13px]">
          <span className="w-12 text-white/60">call {c.turn}</span>
          <div className="flex-1 h-3 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(c.tokens / max) * 100}%` }}
              transition={spring}
              className="h-full rounded-full bg-accent-gold/70"
            />
          </div>
          <span className="w-24 text-right font-mono text-white/75">
            {c.count} msgs · ~{c.tokens}
          </span>
        </div>
      ))}
    </motion.div>
  );
}
