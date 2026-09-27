'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTracerStore } from '@/stores/tracerStore';

const spring = { type: 'spring' as const, damping: 20, stiffness: 120 };

interface Persona {
  icon: string;
  name: string;
  color: string; // hex
  replyClass: string; // font/shape of the reply bubble
}

const PLAIN: Persona = { icon: '🤖', name: 'Plain AI (no role)', color: '#94a3b8', replyClass: 'font-sans' };

// Pick a "costume" from the words on the director's card.
function personaFor(system?: string): Persona {
  if (!system) return PLAIN;
  const s = system.toLowerCase();
  if (s.includes('pirate')) return { icon: '🏴‍☠️', name: 'Pirate', color: '#fbbf24', replyClass: 'font-serif italic' };
  if (s.includes('tutor') || s.includes('teacher'))
    return { icon: '🎓', name: 'Friendly tutor', color: '#4ade80', replyClass: 'font-sans' };
  if (s.includes('one sentence') || s.includes('strict') || s.includes('brief'))
    return { icon: '📏', name: 'Strict one-liner', color: '#22d3ee', replyClass: 'font-mono' };
  return { icon: '🎭', name: 'Custom role', color: '#a78bfa', replyClass: 'font-sans' };
}

function useTypewriter(text: string, active: boolean) {
  const [n, setN] = useState(active ? 0 : text.length);
  useEffect(() => {
    if (!active) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = setInterval(() => {
      setN((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 2;
      });
    }, 18);
    return () => clearInterval(id);
  }, [text, active]);
  return text.slice(0, n);
}

interface Props {
  /** The same question answered with NO system message (for the compare strip). */
  noSystemReply: string;
}

export default function SystemPromptStageAnim({ noSystemReply }: Props) {
  const { currentStep, steps } = useTracerStore();
  const step = steps[currentStep];
  const trig = step?.animationTrigger;
  const line = step?.lineNumber ?? 0;
  const vars = step?.variables ?? [];
  const get = (n: string) => vars.find((v) => v.name === n)?.value;

  const firstIdx = (t: string) => steps.findIndex((s) => s.animationTrigger === t);
  const reached = (t: string) => {
    const i = firstIdx(t);
    return i >= 0 && currentStep >= i;
  };
  const lineReached = (l: number) => steps.slice(0, currentStep + 1).some((s) => s.lineNumber === l);

  // Messages come from the step's variables, so every example draws its own data.
  let msgs: { role: string; content: string }[] = [];
  try {
    msgs = JSON.parse(get('messages_display') ?? '[]');
  } catch {
    msgs = [];
  }
  const sys = msgs.find((m) => m.role === 'system');
  const user = msgs.find((m) => m.role === 'user');

  const listOpen = lineReached(9);
  // Setup chips until the messages list opens; from then on the stage shows its two slots.
  const setupPhase = !sys && !listOpen;
  const handingCard = !!sys && currentStep > firstIdx('addSystemMsg');
  const costumeOn = handingCard;
  const persona = costumeOn ? personaFor(sys?.content) : PLAIN;
  const ordered = reached('buildMessages');
  const sending = trig === 'apiCall';
  const thinking = trig === 'apiProcessing';
  const arrived = reached('apiCallComplete');
  const reply = get('content');
  const extracting = trig === 'extractContent';
  const printed = reached('printOutput');
  const compare = reached('compare');
  const isLast = compare && currentStep === steps.length - 1;
  const tripStarted = reached('apiCall');
  // A print() before the reply is unpacked (the heading): show it in a small terminal.
  const printsSoFar = steps
    .slice(0, currentStep + 1)
    .map((s, i) => ({ text: s.output ?? '', hot: i === currentStep }))
    .filter((o) => o.text);
  const headingPrint = arrived && !get('content') && !!step?.output;

  const typed = useTypewriter(reply ?? '', extracting);

  const chips = [
    { l: 2, code: 'OpenAI', plain: 'library loaded', on: !!get('OpenAI') },
    { l: 3, code: 'client', plain: 'phone line to OpenAI', on: !!get('client') },
    { l: 5, code: 'print()', plain: 'status message', on: lineReached(5) },
    { l: 7, code: 'create()', plain: 'the API call', on: lineReached(7) },
    { l: 8, code: 'model', plain: get('model') ?? 'which AI', on: !!get('model') },
    { l: 9, code: 'messages', plain: 'the chat history', on: listOpen },
  ];

  // The stage (card → AI ← question) is the focus until the reply shows up.
  const replyFocus = !!reply || arrived;

  return (
    <div className={`h-full flex flex-col px-5 py-4 gap-4 overflow-hidden ${compare || !reply ? 'justify-center' : ''}`}>
      {/* Setup checklist: only while setting up */}
      {setupPhase && (
        <div className="flex flex-wrap justify-center gap-2 shrink-0">
          {chips.map((c) => {
            const current = line === c.l;
            return (
              <motion.div
                key={c.code}
                animate={{ opacity: c.on ? 1 : 0.25, scale: current ? 1.08 : 1 }}
                transition={spring}
                className={`px-2.5 py-1 rounded-lg text-[14px] ${
                  current ? 'bg-accent-blue/15 ring-1 ring-accent-blue/70' : c.on ? 'bg-white/5' : 'border border-dashed border-white/10'
                }`}
              >
                <span className="font-mono text-accent-blue">{c.code}</span>
                {current && <span className="text-white/60"> · {c.plain}</span>}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Compare (last steps) replaces the stage */}
      {compare ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="min-h-0 flex flex-col gap-3"
        >
          {isLast && (
            <div className="flex justify-center gap-2 text-[13px] font-semibold flex-wrap shrink-0">
              {['1. system sets the role', '2. it goes first', '3. user never sees it'].map((t) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-2.5 py-1 rounded-full bg-accent-purple/20 text-accent-purple"
                >
                  {t}
                </motion.span>
              ))}
            </div>
          )}
          <div className="min-h-0 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/[0.04] px-4 py-3 flex flex-col gap-2 min-h-0">
              <div className="text-[14px] font-semibold text-white/55">🤖 no system prompt</div>
              <div className="text-[15px] text-white/70 whitespace-pre-wrap overflow-hidden leading-snug">{noSystemReply}</div>
            </div>
            <motion.div
              animate={{ boxShadow: `0 0 18px ${persona.color}44` }}
              className="rounded-2xl border-2 px-4 py-3 flex flex-col gap-2 min-h-0"
              style={{ borderColor: `${persona.color}88`, backgroundColor: `${persona.color}14` }}
            >
              <div className="text-[14px] font-semibold" style={{ color: persona.color }}>
                {persona.icon} with the card
              </div>
              <div className={`text-[15px] text-white/90 whitespace-pre-wrap overflow-hidden leading-snug ${persona.replyClass}`}>
                {reply}
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* The stage: card -> AI <- question */}
          <motion.div
            animate={{ opacity: replyFocus ? 0.5 : 1 }}
            className={`flex gap-3 ${setupPhase ? 'items-center justify-center' : 'items-stretch min-h-[190px] shrink-0'}`}
          >
            {!setupPhase && (
              <>
                {/* Director's card = messages[0] */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="text-[13px] text-white/40 font-mono mb-1.5">
                    messages[0] <span className="text-accent-purple">system</span>
                  </div>
                  {!sys && <div className="flex-1 rounded-2xl border-2 border-dashed border-white/10" />}
                  <AnimatePresence initial={false}>
                    {sys && (
                    <motion.div
                      key={'card-' + sys.content}
                      initial={{ opacity: 0, y: -20, rotate: -4 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        rotate: handingCard ? 2 : 0,
                        x: handingCard ? 6 : 0,
                        boxShadow: handingCard && !user ? '0 0 22px rgba(167,139,250,0.35)' : '0 0 0 rgba(0,0,0,0)',
                      }}
                      transition={spring}
                      className="flex-1 rounded-2xl border-2 border-accent-purple/50 bg-accent-purple/10 px-4 py-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-accent-purple">🎬 Director&apos;s card</span>
                        {ordered && <span className="text-[13px] px-2 rounded bg-accent-purple/25 text-accent-purple font-bold">1st</span>}
                      </div>
                      <div className="text-[16px] text-white/90 font-mono leading-snug">&quot;{sys.content}&quot;</div>
                    </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center">
                  <motion.div
                    animate={{ opacity: handingCard ? 1 : 0.15, x: handingCard ? [0, 4, 0] : 0 }}
                    transition={{ duration: 1.2, repeat: handingCard ? Infinity : 0 }}
                    className="text-accent-purple text-xl"
                  >
                    ➜
                  </motion.div>
                </div>
              </>
            )}

            {/* The AI character */}
            <div className="w-[150px] flex flex-col items-center justify-center gap-2 flex-shrink-0">
              <motion.div
                key={persona.name}
                initial={{ rotateY: 90, scale: 0.8 }}
                animate={{
                  rotateY: 0,
                  scale: thinking ? [1, 1.06, 1] : 1,
                  boxShadow: `0 0 ${thinking ? 30 : 16}px ${persona.color}55`,
                }}
                transition={thinking ? { duration: 1, repeat: Infinity } : spring}
                className="w-20 h-20 rounded-full border-2 flex items-center justify-center text-4xl"
                style={{ borderColor: persona.color, backgroundColor: `${persona.color}1a` }}
              >
                {persona.icon}
              </motion.div>
              <motion.div
                key={'badge-' + persona.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[13px] font-bold px-2.5 py-0.5 rounded-full text-center"
                style={{ color: persona.color, backgroundColor: `${persona.color}22` }}
              >
                {persona.name}
              </motion.div>
            </div>

            {!setupPhase && (
              <>
                <div className="flex items-center">
                  <motion.div animate={{ opacity: user ? 1 : 0.15 }} className="text-accent-blue text-xl">
                    ⬅
                  </motion.div>
                </div>

                {/* User question = messages[1] */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="text-[13px] text-white/40 font-mono mb-1.5">
                    messages[1] <span className="text-accent-blue">user</span>
                  </div>
                  {user ? (
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={spring}
                      className="flex-1 rounded-2xl rounded-tr-none border-2 border-accent-blue/50 bg-accent-blue/10 px-4 py-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-accent-blue">🙋 The question</span>
                        {ordered && <span className="text-[13px] px-2 rounded bg-accent-blue/25 text-accent-blue font-bold">2nd</span>}
                      </div>
                      <div className="text-[16px] text-white/90 leading-snug">&quot;{user.content}&quot;</div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 rounded-2xl border-2 border-dashed border-white/10" />
                  )}
                </div>
              </>
            )}
          </motion.div>

          {/* The trip to OpenAI */}
          {tripStarted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: replyFocus ? 0.6 : 1, y: 0 }}
              className="flex items-center gap-3 text-[13px] shrink-0"
            >
              <span className="text-white/60">💻 laptop</span>
              <div className="relative flex-1 h-7 flex items-center">
                <div className="w-full border-t-2 border-dashed border-white/15" />
                <motion.div
                  className="absolute px-2 py-0.5 rounded-md text-[13px] font-bold whitespace-nowrap"
                  style={{
                    backgroundColor: arrived ? 'rgba(74,222,128,0.2)' : 'rgba(167,139,250,0.2)',
                    color: arrived ? '#4ade80' : '#a78bfa',
                  }}
                  initial={false}
                  animate={{ left: sending ? ['0%', '70%'] : thinking ? '70%' : '0%' }}
                  transition={sending ? { duration: 1.4, repeat: Infinity } : spring}
                >
                  {arrived ? '📩 response' : '✉️ 2 messages'}
                </motion.div>
              </div>
              <span className="text-white/60">☁️ OpenAI</span>
            </motion.div>
          )}

          {/* The reply */}
          {(reply || arrived) && (
            <div className={reply ? 'flex-1 min-h-0' : 'shrink-0 py-6'}>
              {reply ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                  className="h-full flex flex-col gap-2"
                >
                  <div className="flex items-center gap-1 text-[13px] font-mono">
                    {['response', 'choices[0]', 'message', 'content'].map((p, i) => (
                      <span key={p} className="flex items-center gap-1">
                        {i > 0 && <span className="text-white/30">→</span>}
                        <span
                          className={`px-1.5 py-0.5 rounded ${i === 3 ? 'bg-accent-green/20 text-accent-green font-bold' : 'text-white/45'}`}
                        >
                          {p}
                        </span>
                      </span>
                    ))}
                    {printed && <span className="ml-auto font-sans text-accent-green">✓ printed</span>}
                  </div>
                  <div
                    className="min-h-0 rounded-2xl rounded-tl-none border-2 px-4 py-3 overflow-hidden"
                    style={{ borderColor: `${persona.color}88`, backgroundColor: `${persona.color}14` }}
                  >
                    <div className="text-[14px] font-semibold mb-1.5" style={{ color: persona.color }}>
                      {persona.icon} {persona.name}
                    </div>
                    <div className={`text-[16px] text-white/90 whitespace-pre-wrap leading-snug ${persona.replyClass}`}>
                      {extracting ? typed : reply}
                      {extracting && typed.length < reply.length && <span className="animate-pulse">▌</span>}
                    </div>
                  </div>
                </motion.div>
              ) : arrived && !headingPrint ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="rounded-2xl border-2 border-accent-green/50 bg-accent-green/5 px-10 py-6 flex flex-col items-center gap-2">
                    <div className="text-3xl">📦</div>
                    <div className="text-[18px] font-mono text-accent-green">response</div>
                  </div>
                </motion.div>
              ) : null}
              {!reply && headingPrint ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                  className="mx-auto w-full max-w-[520px] rounded-xl bg-black/60 px-4 py-2.5 font-mono text-[15px] leading-relaxed"
                >
                  <div className="font-sans text-[13px] text-white/40 mb-1">Terminal</div>
                  {printsSoFar.map((o, i) => (
                    <div key={i} className={`whitespace-pre-wrap ${o.hot ? 'text-white' : 'text-white/40'}`}>
                      {o.text}
                    </div>
                  ))}
                </motion.div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
