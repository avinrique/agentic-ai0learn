'use client';
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTracerStore } from '@/stores/tracerStore';

// ─────────────────────────────────────────────────────────────────────────────
// ApiRoundTripAnim: the whole story of one API call, built up step by step.
// Laptop (client + key + request envelope) → internet → OpenAI server (writes
// the reply token by token) → response object unpacked → terminal.
// Everything is derived from the current step index, so jumps work.
// ─────────────────────────────────────────────────────────────────────────────

const spring = { type: 'spring' as const, damping: 22, stiffness: 140 };

const RANK: Record<string, number> = {
  intro: 0,
  import: 1,
  createClient: 2,
  apiKey: 3,
  printStart: 4,
  startRequest: 5,
  selectModel: 6,
  buildMessages: 7,
  msgRole: 8,
  msgContent: 9,
  apiCall: 10,
  apiProcessing: 11,
  apiCallComplete: 12,
  printHeading: 13,
  extractContent: 14,
  printOutput: 15,
  summary: 16,
};

const STAGES: { label: string; from: number; to: number }[] = [
  { label: 'Set up', from: 0, to: 4 },
  { label: 'Pack the request', from: 5, to: 9 },
  { label: 'Send', from: 10, to: 10 },
  { label: 'AI writes', from: 11, to: 11 },
  { label: 'Unpack the reply', from: 12, to: 14 },
  { label: 'Print', from: 15, to: 16 },
];

const MODEL_CHOICES = ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1'];

// Rough tokenizer: words (with their leading space) and single punctuation marks.
function tokenize(text: string): string[] {
  return text.match(/\s*[\p{L}\p{N}']+|\s*[^\s\p{L}\p{N}]/gu) ?? [];
}

// Counts from 0 up to `total` while `active`; returns `total` when not active.
function useTicker(total: number, active: boolean, ms: number, resetKey: string) {
  const [state, setState] = useState({ key: '', n: 0 });
  useEffect(() => {
    if (!active) return;
    let i = 0;
    setState({ key: resetKey, n: 0 });
    const id = setInterval(() => {
      i += 1;
      setState({ key: resetKey, n: i });
      if (i >= total) clearInterval(id);
    }, ms);
    return () => clearInterval(id);
  }, [resetKey, active, total, ms]);
  if (!active) return total;
  return state.key === resetKey ? Math.min(state.n, total) : 0;
}

function unquote(s?: string) {
  return (s ?? '').replace(/^"|"$/g, '');
}

// ── Small visual pieces ─────────────────────────────────────────────────────
function Envelope({ color, size = 36 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 40 28" fill="none">
      <rect x="1" y="1" width="38" height="26" rx="3" fill={`${color}33`} stroke={color} strokeWidth="2" />
      <path d="M2 3 L20 16 L38 3" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

function KeyIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="12" viewBox="0 0 24 14" fill="none">
      <circle cx="6" cy="7" r="5" stroke={color} strokeWidth="2" />
      <path d="M11 7 H23 M19 7 V12 M15 7 V11" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function LaptopIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 26 18" fill="none">
      <rect x="4" y="1" width="18" height="12" rx="1.5" stroke="#4a9eff" strokeWidth="1.8" />
      <path d="M1 16 H25" stroke="#4a9eff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ServerIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="16" height="6" rx="1.5" stroke={color} strokeWidth="1.8" />
      <rect x="2" y="11" width="16" height="6" rx="1.5" stroke={color} strokeWidth="1.8" />
      <circle cx="5.5" cy="5" r="1" fill={color} />
      <circle cx="5.5" cy="14" r="1" fill={color} />
    </svg>
  );
}

function Glow({ on, color, children, className = '' }: { on: boolean; color: string; children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: on ? `0 0 0 1px ${color}, 0 0 16px ${color}55` : '0 0 0 0px rgba(0,0,0,0)',
      }}
      transition={spring}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// One layer of the nested response object.
function Layer({
  name,
  plain,
  open,
  lit,
  delay,
  color,
  children,
}: {
  name: string;
  plain: string;
  open: boolean;
  lit: boolean;
  delay: number;
  color: string;
  children?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        borderColor: lit ? color : 'rgba(255,255,255,0.12)',
        backgroundColor: lit ? `${color}14` : 'rgba(255,255,255,0.02)',
      }}
      transition={{ ...spring, delay }}
      className="rounded-md border px-2 py-1 min-w-0"
    >
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="font-mono text-xs font-bold shrink-0" style={{ color }}>
          {name}
        </span>
        <span className="text-[11px] text-white/45 truncate">{plain}</span>
      </div>
      {open && children && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ ...spring, delay: delay + 0.25 }}
          className="mt-1 pl-2 border-l border-white/10 space-y-1 overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ApiRoundTripAnim() {
  const { currentStep, steps, activeVariantId } = useTracerStore();
  const step = steps[currentStep];
  const cur = step?.animationTrigger ?? 'intro';
  const variables = useMemo(() => step?.variables ?? [], [step]);
  const resetKey = `${activeVariantId}-${currentStep}`;

  // Furthest point of the story reached so far (so things build up and stay).
  const reached = useMemo(() => {
    let r = 0;
    for (let i = 0; i <= currentStep && i < steps.length; i++) {
      const t = steps[i].animationTrigger;
      if (t && RANK[t] !== undefined) r = Math.max(r, RANK[t]);
    }
    return r;
  }, [steps, currentStep]);
  const at = (name: string) => cur === name;
  const done = reached >= RANK.summary;

  const getVar = (name: string) => variables.find((v) => v.name === name)?.value;
  // Values that are only set later (model, messages, reply) are looked up in the last step.
  const finalVars = steps[steps.length - 1]?.variables ?? [];
  const finalVar = (name: string) => finalVars.find((v) => v.name === name)?.value;

  const model = unquote(getVar('model') ?? finalVar('model') ?? '"gpt-4o-mini"');
  const prompt = (() => {
    try {
      const arr = JSON.parse(getVar('messages') ?? finalVar('messages') ?? '[]');
      return (arr[0]?.content as string) ?? '';
    } catch {
      return '';
    }
  })();
  const reply = getVar('content') ?? finalVar('content') ?? '';
  const tokens = useMemo(() => tokenize(reply), [reply]);
  const promptTokens = useMemo(() => tokenize(prompt).length, [prompt]);

  // Typewriters
  const promptShown = useTicker(prompt.length, at('msgContent'), 28, resetKey);
  const tokensShown = useTicker(tokens.length, at('apiProcessing'), 90, resetKey);
  const lastOut = step?.output ?? '';
  const outShown = useTicker(lastOut.length, at('printOutput'), 22, resetKey);

  const outputs = useMemo(() => {
    const list: { text: string; idx: number }[] = [];
    for (let i = 0; i <= currentStep && i < steps.length; i++) {
      if (steps[i].output) list.push({ text: steps[i].output, idx: i });
    }
    return list;
  }, [steps, currentStep]);

  const stageIdx = STAGES.findIndex((s) => reached >= s.from && reached <= s.to);
  const sent = reached >= RANK.apiCall;
  const received = reached >= RANK.apiCallComplete;
  const opened = reached >= RANK.extractContent;
  const waiting = at('apiCall') || at('apiProcessing');

  return (
    <div className="h-full flex flex-col gap-2 p-3 overflow-hidden text-white">
      {/* Stage tracker */}
      <div className="flex items-center gap-1 flex-wrap shrink-0">
        {STAGES.map((s, i) => {
          const isNow = i === stageIdx && !done;
          const isDone = i < stageIdx || done;
          return (
            <div key={s.label} className="flex items-center gap-1">
              <motion.div
                animate={{
                  backgroundColor: isNow ? 'rgba(74,158,255,0.25)' : isDone ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                  color: isNow ? '#ffffff' : isDone ? '#4ade80' : 'rgba(255,255,255,0.35)',
                }}
                className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
              >
                {isDone ? '✓ ' : `${i + 1}. `}
                {s.label}
              </motion.div>
              {i < STAGES.length - 1 && <span className="text-white/20 text-xs">›</span>}
            </div>
          );
        })}
      </div>

      {/* Row 1: laptop — internet — server */}
      <div className="flex-[1.35] min-h-0 flex gap-2">
        {/* LAPTOP */}
        <motion.div
          animate={{ borderColor: reached <= 9 && reached >= 1 ? 'rgba(74,158,255,0.6)' : 'rgba(74,158,255,0.25)' }}
          className="flex-[1.25] min-w-0 rounded-xl border-2 bg-accent-blue/5 p-2 flex flex-col gap-1.5 overflow-hidden"
        >
          <div className="flex items-center gap-2 shrink-0">
            <LaptopIcon />
            <span className="text-sm font-bold text-accent-blue">Your laptop</span>
            <span className="text-[11px] font-mono text-white/35 truncate">1_basic_prompt.py</span>
          </div>

          {reached < 1 && (
            <div className="text-xs text-white/40 leading-snug">
              Your Python program lives here. It will send a question across the internet and wait for the answer.
            </div>
          )}

          {/* Setup chips */}
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {reached >= 1 && (
              <Glow on={at('import')} color="#a78bfa" className="rounded-md px-2 py-0.5 bg-accent-purple/10 border border-accent-purple/30">
                <span className="font-mono text-xs text-accent-purple">openai</span>
                <span className="text-[11px] text-white/45"> library (ready-made code)</span>
              </Glow>
            )}
            {reached >= 2 && (
              <Glow on={at('createClient')} color="#4a9eff" className="rounded-md px-2 py-0.5 bg-accent-blue/10 border border-accent-blue/30">
                <span className="font-mono text-xs text-accent-blue">client</span>
                <span className="text-[11px] text-white/45"> (phone line to OpenAI)</span>
              </Glow>
            )}
            {reached >= 3 && (
              <Glow
                on={at('apiKey')}
                color="#fbbf24"
                className="rounded-md px-2 py-0.5 bg-accent-gold/10 border border-accent-gold/30 flex items-center gap-1.5"
              >
                <KeyIcon color="#fbbf24" />
                <span className="font-mono text-xs text-accent-gold">OPENAI_API_KEY</span>
                <span className="font-mono text-xs text-white/60 tracking-widest">sk-••••••</span>
                <span className="text-[11px] text-white/45">(secret, hidden)</span>
              </Glow>
            )}
          </div>

          {/* Request envelope being packed */}
          {reached >= 5 && !sent && (
            <Glow
              on={at('startRequest')}
              color="#4a9eff"
              className="flex-1 min-h-0 rounded-lg border border-dashed border-accent-blue/40 bg-navy-900/60 p-2 flex flex-col gap-1.5 overflow-hidden"
            >
              <div className="flex items-center gap-2 shrink-0">
                <Envelope color="#4a9eff" size={26} />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white/85">The request (a JSON envelope)</div>
                  <div className="text-[11px] font-mono text-white/40 truncate">client.chat.completions.create(...)</div>
                </div>
              </div>

              {reached >= 6 && (
                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  <span className="font-mono text-xs text-white/50">model:</span>
                  {(at('selectModel') ? MODEL_CHOICES : [model]).map((m) => {
                    const chosen = m === model;
                    return (
                      <motion.span
                        key={m}
                        layout
                        animate={{
                          opacity: chosen ? 1 : 0.35,
                          scale: chosen ? 1.05 : 0.95,
                          boxShadow: chosen && at('selectModel') ? '0 0 12px rgba(74,158,255,0.5)' : 'none',
                        }}
                        className={`px-2 py-0.5 rounded font-mono text-xs border ${
                          chosen ? 'bg-accent-blue/20 border-accent-blue/60 text-accent-blue font-bold' : 'border-white/15 text-white/50'
                        }`}
                      >
                        {m}
                      </motion.span>
                    );
                  })}
                  <span className="text-[11px] text-white/40">(which AI answers)</span>
                </div>
              )}

              {reached >= 7 && (
                <Glow
                  on={at('buildMessages')}
                  color="#a78bfa"
                  className="rounded-md border border-accent-purple/25 bg-accent-purple/5 p-1.5 flex flex-col gap-1 min-h-0"
                >
                  <div className="text-xs">
                    <span className="font-mono text-accent-purple">messages: [ ]</span>
                    <span className="text-[11px] text-white/45"> (the chat history, 1 message)</span>
                  </div>
                  {reached >= 8 && (
                    <motion.div
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={spring}
                      className="self-end max-w-[95%] rounded-xl rounded-br-sm bg-accent-blue/15 border border-accent-blue/35 px-2 py-1"
                    >
                      <motion.div
                        animate={{ boxShadow: at('msgRole') ? '0 0 10px rgba(74,158,255,0.6)' : 'none' }}
                        className="inline-block rounded px-1.5 text-[11px] font-bold font-mono bg-accent-blue text-navy-900 mb-0.5"
                      >
                        role: user <span className="font-sans font-normal">(you)</span>
                      </motion.div>
                      <div className="text-xs text-white/90 leading-snug min-h-[1em]">
                        {reached >= 9 ? (
                          <>
                            <span className="font-mono text-[11px] text-white/40">content: </span>
                            {prompt.slice(0, promptShown)}
                            {at('msgContent') && promptShown < prompt.length && (
                              <span className="inline-block w-1.5 h-3 bg-white/70 ml-0.5 animate-pulse" />
                            )}
                          </>
                        ) : (
                          <span className="text-white/30 italic">content: …</span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </Glow>
              )}
            </Glow>
          )}

          {sent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-dashed border-white/15 px-2 py-1.5 text-xs text-white/50 flex items-center gap-2"
            >
              <Envelope color="rgba(255,255,255,0.35)" size={20} />
              <span>
                Request sent: <span className="font-mono text-accent-blue">{model}</span> + 1 message
              </span>
            </motion.div>
          )}

          {waiting && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="text-xs text-accent-gold"
            >
              Line 7 is waiting for the answer…
            </motion.div>
          )}
        </motion.div>

        {/* INTERNET LANE */}
        <div className="flex-[0.55] min-w-[92px] flex flex-col justify-center gap-6 relative">
          <div className="text-[11px] text-center text-white/35 uppercase tracking-widest">the internet</div>

          {/* request track */}
          <div className="relative h-10">
            <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-accent-blue/25" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-accent-blue/50 text-sm">▶</div>
            {at('apiCall') && (
              <motion.div
                key={`req-${resetKey}`}
                initial={{ left: '0%', opacity: 0 }}
                animate={{ left: '55%', opacity: 1 }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
                className="absolute top-0"
              >
                <Envelope color="#4a9eff" size={36} />
              </motion.div>
            )}
            <div className="absolute inset-x-0 -bottom-4 text-center text-[11px] text-white/40">
              {sent ? '✓ request sent' : 'request →'}
            </div>
          </div>

          {/* response track */}
          <div className="relative h-10">
            <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-accent-green/25" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-accent-green/50 text-sm">◀</div>
            {at('apiCallComplete') && (
              <motion.div
                key={`res-${resetKey}`}
                initial={{ left: '55%', opacity: 0 }}
                animate={{ left: '0%', opacity: 1 }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
                className="absolute top-0"
              >
                <div className="rounded-md bg-accent-green/25 border-2 border-accent-green px-1.5 py-0.5 font-mono text-[11px] font-bold text-accent-green">
                  {'{ }'}
                </div>
              </motion.div>
            )}
            <div className="absolute inset-x-0 -bottom-4 text-center text-[11px] text-white/40">
              {received ? '✓ response received' : '← response'}
            </div>
          </div>
        </div>

        {/* OPENAI SERVER */}
        <motion.div
          animate={{
            borderColor: at('apiProcessing') ? '#fbbf24' : sent ? 'rgba(74,222,128,0.6)' : 'rgba(74,222,128,0.2)',
            boxShadow: at('apiProcessing') ? '0 0 26px rgba(251,191,36,0.2)' : 'none',
          }}
          className="flex-1 min-w-0 rounded-xl border-2 bg-accent-green/5 p-2 flex flex-col gap-1.5 overflow-hidden"
        >
          <div className="flex items-center gap-2 shrink-0">
            <ServerIcon color="#4ade80" />
            <span className="text-sm font-bold text-accent-green">OpenAI server</span>
          </div>

          {!sent && (
            <div className="text-xs text-white/40 leading-snug">
              Far away in a data center. It waits for requests and runs the AI model.
            </div>
          )}

          {sent && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={spring}
              className="flex items-center gap-2 text-xs text-white/70 shrink-0"
            >
              <Envelope color="#4a9eff" size={20} />
              <span>
                Got it! Running <span className="font-mono text-accent-blue">{model}</span>
              </span>
            </motion.div>
          )}

          {reached >= RANK.apiProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-h-0 rounded-lg bg-navy-900/70 border border-accent-gold/30 p-2 flex flex-col gap-1 overflow-hidden"
            >
              <div className="flex items-center justify-between shrink-0">
                <span className="text-xs font-semibold text-accent-gold">
                  {at('apiProcessing') && tokensShown < tokens.length ? 'Writing the reply…' : 'Reply written'}
                </span>
                <span className="text-[11px] font-mono text-white/50">
                  tokens: <span className="text-accent-gold font-bold">{tokensShown}</span>
                </span>
              </div>
              <div className="text-xs leading-relaxed text-white/85 overflow-hidden whitespace-pre-wrap">
                {tokens.slice(0, tokensShown).map((t, i) => (
                  <span
                    key={i}
                    className={i === tokensShown - 1 && at('apiProcessing') ? 'bg-accent-gold/40 rounded-sm' : i % 2 ? 'bg-white/[0.06]' : ''}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-auto text-[11px] text-white/40 shrink-0">
                One token ≈ a word or piece of a word. Read: {promptTokens} · written: {tokens.length}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Row 2: response object — terminal */}
      <div className="flex-1 min-h-0 flex gap-2">
        {/* Response object */}
        <div className="flex-[1.3] min-w-0 rounded-xl border border-white/10 bg-navy-900/40 p-2 flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <span className="text-xs font-bold text-white/80">What came back</span>
            {opened && (
              <span className="font-mono text-[11px]">
                {['response', '.choices[0]', '.message', '.content'].map((seg, i) => (
                  <motion.span
                    key={seg}
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: 1, color: i === 3 ? '#4ade80' : '#a78bfa' }}
                    transition={{ delay: at('extractContent') ? 0.2 + i * 0.35 : 0 }}
                  >
                    {seg}
                  </motion.span>
                ))}
              </span>
            )}
          </div>

          {!received ? (
            <div className="flex-1 rounded-lg border border-dashed border-white/10 flex items-center justify-center text-xs text-white/30 text-center px-3">
              {sent ? 'Waiting for the response…' : 'The answer will land here as a response object.'}
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-hidden">
              <Layer
                name="response"
                plain={opened ? '(the whole package)' : '<ChatCompletion object> — the text is buried inside'}
                open={opened}
                lit={at('apiCallComplete') || at('extractContent')}
                delay={0}
                color="#a78bfa"
              >
                <div className="font-mono text-[11px] text-white/35 truncate">
                  id: &quot;chatcmpl-…&quot; · model: &quot;{model}&quot; · usage: {promptTokens + 8}+{tokens.length} tokens
                </div>
                <Layer
                  name="choices[0]"
                  plain="(the first answer)"
                  open
                  lit={at('extractContent')}
                  delay={at('extractContent') ? 0.35 : 0}
                  color="#a78bfa"
                >
                  <Layer
                    name="message"
                    plain={'(the AI\'s chat message, role: "assistant")'}
                    open
                    lit={at('extractContent')}
                    delay={at('extractContent') ? 0.7 : 0}
                    color="#a78bfa"
                  >
                    <Layer
                      name="content"
                      plain="(just the text)"
                      open
                      lit={reached >= RANK.extractContent}
                      delay={at('extractContent') ? 1.05 : 0}
                      color="#4ade80"
                    >
                      <div className="text-xs text-accent-green leading-snug whitespace-pre-wrap line-clamp-3">{reply}</div>
                    </Layer>
                  </Layer>
                </Layer>
              </Layer>
            </div>
          )}
        </div>

        {/* Terminal */}
        <div className="flex-1 min-w-0 rounded-xl border border-white/10 bg-black/60 flex flex-col overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-1 border-b border-white/10 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-red/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent-gold/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent-green/70" />
            <span className="text-[11px] text-white/40 ml-1">Terminal (what print shows)</span>
          </div>
          <div className="flex-1 min-h-0 p-2 font-mono text-xs leading-snug overflow-hidden flex flex-col justify-end">
            <div className="text-white/40">$ python 1_basic_prompt.py</div>
            {outputs.map((o) => {
              const isLast = o.idx === currentStep;
              const text = isLast && at('printOutput') ? o.text.slice(0, outShown) : o.text;
              const isReply = o.text === reply;
              return (
                <motion.div
                  key={`${o.idx}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`whitespace-pre-wrap ${isReply ? 'text-accent-green' : 'text-white/85'} ${
                    isLast ? 'bg-white/[0.06] rounded-sm' : ''
                  }`}
                >
                  {text}
                </motion.div>
              );
            })}
            {!done && (
              <span className="inline-block w-2 h-3.5 bg-white/60 mt-0.5 animate-pulse" />
            )}
            {done && <div className="text-white/40">$ ▌</div>}
          </div>
        </div>
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 text-center text-xs text-accent-green"
        >
          Round trip complete: laptop → OpenAI → laptop, in one function call.
        </motion.div>
      )}
    </div>
  );
}
