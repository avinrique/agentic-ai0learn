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

  const setupPhase = !sys;
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
  const listOpen = lineReached(9);

  const typed = useTypewriter(reply ?? '', extracting);

  const chips = [
    { l: 2, code: 'OpenAI', plain: 'library loaded', on: !!get('OpenAI') },
    { l: 3, code: 'client', plain: 'phone line to OpenAI', on: !!get('client') },
    { l: 5, code: 'print()', plain: 'status message', on: lineReached(5) },
    { l: 7, code: 'create()', plain: 'the API call', on: lineReached(7) },
    { l: 8, code: 'model', plain: get('model') ?? 'which AI', on: !!get('model') },
    { l: 9, code: 'messages', plain: 'the chat history', on: listOpen },
  ];

  const tripStatus = sending
    ? 'Sending both messages to OpenAI...'
    : thinking
    ? 'The AI reads the card first, then the question...'
    : arrived
    ? 'Reply received and saved in response'
    : '';

  return (
    <div className="h-full flex flex-col p-4 gap-3 overflow-hidden">
      <div className="text-center text-xs text-white/40 uppercase tracking-widest">
        System prompt: the director&apos;s instruction card
      </div>

      {/* Setup checklist */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {chips.map((c) => {
          const current = setupPhase && line === c.l;
          return (
            <motion.div
              key={c.code}
              animate={{ opacity: c.on ? 1 : 0.25, scale: current ? 1.08 : 1 }}
              transition={spring}
              className={`px-2 py-1 rounded-md border text-xs ${
                current
                  ? 'border-accent-blue/70 bg-accent-blue/15 shadow-glow-blue'
                  : c.on
                  ? 'border-white/15 bg-white/5'
                  : 'border-dashed border-white/10'
              }`}
            >
              <span className="font-mono text-accent-blue">{c.code}</span>
              <span className="text-white/50"> · {c.plain}</span>
            </motion.div>
          );
        })}
      </div>

      {/* The stage: card -> AI <- question */}
      <div className="flex items-stretch gap-3 min-h-[170px]">
        {/* Director's card = messages[0] */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="text-[11px] text-white/40 font-mono mb-1">
            messages[0] <span className="text-accent-purple">system</span>
          </div>
          <AnimatePresence initial={false}>
            {sys ? (
              <motion.div
                key={'card-' + sys.content}
                initial={{ opacity: 0, y: -20, rotate: -4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: handingCard ? 2 : 0,
                  x: handingCard ? 6 : 0,
                  boxShadow: handingCard ? '0 0 22px rgba(167,139,250,0.35)' : '0 0 0 rgba(0,0,0,0)',
                }}
                transition={spring}
                className="flex-1 rounded-lg border-2 border-accent-purple/50 bg-accent-purple/10 p-2.5 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent-purple">🎬 Director&apos;s card</span>
                  {ordered && (
                    <span className="text-[11px] px-1.5 rounded bg-accent-purple/25 text-accent-purple font-bold">
                      1st: read first
                    </span>
                  )}
                </div>
                <div className="text-sm text-white/90 font-mono leading-snug">&quot;{sys.content}&quot;</div>
                <div className="mt-auto text-[11px] text-white/40">🙈 hidden from the user, followed by the AI</div>
              </motion.div>
            ) : (
              <div className="flex-1 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-xs text-white/25 text-center p-2">
                {listOpen ? 'empty slot: the role goes here' : 'no instructions yet'}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Arrow card -> AI */}
        <div className="flex items-center">
          <motion.div
            animate={{ opacity: handingCard ? 1 : 0.15, x: handingCard ? [0, 4, 0] : 0 }}
            transition={{ duration: 1.2, repeat: handingCard ? Infinity : 0 }}
            className="text-accent-purple text-lg"
          >
            ➜
          </motion.div>
        </div>

        {/* The AI character */}
        <div className="w-[150px] flex flex-col items-center justify-center gap-1.5 flex-shrink-0">
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
          <div className="text-[11px] font-mono text-white/40">{get('model')?.replace(/"/g, '') ?? 'the AI'}</div>
          <motion.div
            key={'badge-' + persona.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold px-2 py-0.5 rounded-full text-center"
            style={{ color: persona.color, backgroundColor: `${persona.color}22` }}
          >
            {costumeOn ? `now playing: ${persona.name}` : persona.name}
          </motion.div>
        </div>

        {/* Arrow question -> AI */}
        <div className="flex items-center">
          <motion.div animate={{ opacity: user ? 1 : 0.15 }} className="text-accent-blue text-lg">
            ⬅
          </motion.div>
        </div>

        {/* User question = messages[1] */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="text-[11px] text-white/40 font-mono mb-1">
            messages[1] <span className="text-accent-blue">user</span>
          </div>
          {user ? (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={spring}
              className="flex-1 rounded-lg rounded-tr-none border-2 border-accent-blue/50 bg-accent-blue/10 p-2.5 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-blue">🙋 The question</span>
                {ordered && (
                  <span className="text-[11px] px-1.5 rounded bg-accent-blue/25 text-accent-blue font-bold">2nd</span>
                )}
              </div>
              <div className="text-sm text-white/90 leading-snug">&quot;{user.content}&quot;</div>
              <div className="mt-auto text-[11px] text-white/40">what the user actually typed</div>
            </motion.div>
          ) : (
            <div className="flex-1 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-xs text-white/25 text-center p-2">
              {listOpen ? 'empty slot: the question goes here' : 'the user has not spoken yet'}
            </div>
          )}
        </div>
      </div>

      {/* The trip to OpenAI */}
      {tripStarted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs"
        >
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/70">💻 Your laptop</span>
          <div className="relative flex-1 h-6 flex items-center">
            <div className="w-full border-t-2 border-dashed border-white/15" />
            <motion.div
              className="absolute px-1.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap"
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
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/70">☁️ OpenAI</span>
          <span className="w-[210px] text-white/50 text-[11px] leading-tight">{tripStatus}</span>
        </motion.div>
      )}

      {/* Reply, then the compare strip */}
      <div className="flex-1 min-h-0">
        {compare ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="h-full flex flex-col gap-1.5"
          >
            {isLast ? (
              <div className="flex justify-center gap-2 text-[11px] font-bold">
                {['1. system sets the role', '2. it goes first', '3. user never sees it'].map((t) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple"
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-white/50 text-center">
                Same question, two runs: only the system message is different
              </div>
            )}
            <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/15 bg-white/5 p-2.5 flex flex-col gap-1 min-h-0">
                <div className="text-xs font-bold text-white/60">🤖 No system prompt</div>
                <div className="text-xs text-white/70 whitespace-pre-wrap overflow-hidden leading-snug">
                  {noSystemReply}
                </div>
              </div>
              <motion.div
                animate={{ boxShadow: `0 0 18px ${persona.color}44` }}
                className="rounded-lg border-2 p-2.5 flex flex-col gap-1 min-h-0"
                style={{ borderColor: `${persona.color}88`, backgroundColor: `${persona.color}14` }}
              >
                <div className="text-xs font-bold" style={{ color: persona.color }}>
                  {persona.icon} With: &quot;{sys?.content}&quot;
                </div>
                <div className={`text-xs text-white/90 whitespace-pre-wrap overflow-hidden leading-snug ${persona.replyClass}`}>
                  {reply}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : reply ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="h-full flex flex-col gap-1.5">
            <div className="flex items-center gap-1 text-[11px] font-mono">
              {['response', 'choices[0]', 'message', 'content'].map((p, i) => (
                <span key={p} className="flex items-center gap-1">
                  {i > 0 && <span className="text-white/30">→</span>}
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      i === 3 ? 'bg-accent-green/20 text-accent-green font-bold' : 'bg-white/5 text-white/50'
                    }`}
                  >
                    {p}
                  </span>
                </span>
              ))}
              <span className="text-white/40 font-sans ml-1">(the reply text)</span>
            </div>
            <div
              className="flex-1 min-h-0 rounded-lg rounded-tl-none border-2 p-3 overflow-hidden"
              style={{ borderColor: `${persona.color}88`, backgroundColor: `${persona.color}14` }}
            >
              <div className="text-xs font-bold mb-1" style={{ color: persona.color }}>
                {persona.icon} assistant, in role: {persona.name}
              </div>
              <div className={`text-sm text-white/90 whitespace-pre-wrap leading-snug ${persona.replyClass}`}>
                {extracting ? typed : reply}
                {extracting && typed.length < reply.length && <span className="animate-pulse">▌</span>}
              </div>
              {printed && <div className="mt-2 text-[11px] text-accent-green">✓ printed to the Output panel</div>}
            </div>
          </motion.div>
        ) : arrived ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full rounded-lg border-2 border-dashed border-accent-green/40 bg-accent-green/5 flex flex-col items-center justify-center gap-1"
          >
            <div className="text-2xl">📦</div>
            <div className="text-sm font-mono text-accent-green">response</div>
            <div className="text-xs text-white/50">The reply is inside, still wrapped up. Next we open it.</div>
            {step?.output?.trim() && (
              <div className="text-xs text-white/70 font-mono mt-1">
                print() first writes: <span className="text-accent-gold">{step.output.trim()}</span>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="h-full rounded-lg border border-dashed border-white/10 flex items-center justify-center text-xs text-white/30 text-center px-4">
            {thinking || sending
              ? `The AI will answer as: ${persona.name}`
              : sys
              ? 'The reply will appear here, in the style the card asks for.'
              : 'The reply will appear here. First we give the AI its role.'}
          </div>
        )}
      </div>
    </div>
  );
}
