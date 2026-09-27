'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// A mini chat simulator. Everything is prepared text: no real model is called.
// Token counts are a rough estimate (~4 characters per token + a little
// overhead per message), and the 100-token "context window" is deliberately
// tiny so it fills up after a few turns. Real models fit far more.
// ---------------------------------------------------------------------------

const LIMIT = 100;
const spring = { type: 'spring' as const, damping: 24, stiffness: 170 };

const roleColors: Record<string, string> = {
  system: '#a78bfa',
  user: '#4a9eff',
  assistant: '#4ade80',
  summary: '#a78bfa',
};

function estTokens(text: string) {
  return Math.ceil(text.length / 4) + 3;
}

interface Convo {
  chip: string;
  system: string;
  /** The fact from the first message that the last question depends on. */
  factLabel: string;
  turns: { user: string; assistant: string }[];
  /** Reply to the last question when the fact is still visible / has been lost. */
  finalKnown: string;
  finalLost: string;
  summary: string;
}

const CONVOS: Convo[] = [
  {
    chip: 'Remember my name',
    system: 'You are a friendly helper.',
    factLabel: 'Name: Priya',
    turns: [
      { user: 'Hi! My name is Priya.', assistant: 'Nice to meet you, Priya! How can I help?' },
      { user: "I'm learning to code.", assistant: 'Great! Which language are you trying?' },
      { user: 'Python, I think.', assistant: 'Good choice. Python is friendly for beginners.' },
      { user: 'What should I build first?', assistant: 'Try a small to-do list app.' },
      { user: 'Any other ideas?', assistant: 'A quiz game or a number guessing game.' },
      { user: "By the way, what's my name?", assistant: '' },
    ],
    finalKnown: 'Your name is Priya!',
    finalLost: "Sorry, I don't know your name. You haven't told me yet.",
    summary: 'Summary so far: the user is Priya. She is learning Python and wants beginner project ideas.',
  },
  {
    chip: 'Trip planning',
    system: 'You are a travel assistant.',
    factLabel: 'Budget: $1,500',
    turns: [
      { user: 'I want to visit Japan for 5 days. My budget is $1,500.', assistant: 'Great plan! Tokyo and Kyoto are a classic pair.' },
      { user: 'What should I eat?', assistant: 'Try ramen, sushi and street food at night markets.' },
      { user: 'How do I get between cities?', assistant: 'The bullet train takes about 2 to 3 hours.' },
      { user: 'What should I pack?', assistant: 'Comfy shoes, layers and a small umbrella.' },
      { user: 'Any tips for temples?', assistant: 'Go early to avoid crowds and dress modestly.' },
      { user: 'Which hotel fits my budget?', assistant: '' },
    ],
    finalKnown: 'With $1,500 for 5 days, try a simple business hotel near a station.',
    finalLost: "What is your budget? I can't see it in our chat.",
    summary: 'Summary so far: 5-day Japan trip, budget $1,500. Covered food, trains, packing and temples.',
  },
  {
    chip: 'Debug my code',
    system: 'You are a coding helper.',
    factLabel: "Error: KeyError: 'id'",
    turns: [
      { user: "My Python script crashes with KeyError: 'id'.", assistant: "That means the dictionary has no 'id' key." },
      { user: 'It worked yesterday though.', assistant: 'Maybe the data you load has changed.' },
      { user: 'The data comes from an API.', assistant: "Then some items may be missing 'id'." },
      { user: 'How do I print the data?', assistant: 'Use print(data), or pprint for tidy output.' },
      { user: 'OK, it prints a lot of stuff.', assistant: "Look for items without an 'id' field." },
      { user: 'So how do I fix my error?', assistant: '' },
    ],
    finalKnown: "Use item.get('id') so a missing 'id' no longer raises KeyError.",
    finalLost: 'Which error do you mean? Please paste it again.',
    summary: "Summary so far: Python script crashes with KeyError: 'id'. Data comes from an API; some items may lack 'id'.",
  },
];

type Strategy = 'all' | 'drop' | 'summarize';
type Status = 'sent' | 'dropped' | 'summarized';

interface Msg { role: 'user' | 'assistant'; content: string; tokens: number }

interface CallResult {
  msgs: Msg[]; // non-system messages in the app's list, up to and including this call's user message
  status: Status[];
  useSummary: boolean;
  tokens: number; // tokens actually sent
  over: boolean; // true when nothing fits and strategy is "send everything"
  factVisible: boolean;
}

function buildCall(c: Convo, callNo: number, strategy: Strategy): CallResult {
  const msgs: Msg[] = [];
  for (let i = 0; i < callNo; i++) {
    const t = c.turns[i];
    msgs.push({ role: 'user', content: t.user, tokens: estTokens(t.user) });
    if (i < callNo - 1) msgs.push({ role: 'assistant', content: t.assistant, tokens: estTokens(t.assistant) });
  }
  const sysT = estTokens(c.system);
  const full = sysT + msgs.reduce((s, m) => s + m.tokens, 0);
  const status: Status[] = msgs.map(() => 'sent');

  if (full <= LIMIT) {
    return { msgs, status, useSummary: false, tokens: full, over: false, factVisible: true };
  }
  if (strategy === 'all') {
    return { msgs, status, useSummary: false, tokens: full, over: true, factVisible: true };
  }
  if (strategy === 'drop') {
    let total = full;
    let i = 0;
    while (total > LIMIT && i < msgs.length - 1) {
      status[i] = 'dropped';
      total -= msgs[i].tokens;
      i++;
    }
    return { msgs, status, useSummary: false, tokens: total, over: false, factVisible: status[0] === 'sent' };
  }
  // summarize: keep the newest messages that fit next to the summary; the rest go into the summary
  const sumT = estTokens(c.summary);
  let budget = LIMIT - sysT - sumT;
  let keepFrom = msgs.length;
  while (keepFrom > 0 && budget - msgs[keepFrom - 1].tokens >= 0) {
    budget -= msgs[keepFrom - 1].tokens;
    keepFrom--;
  }
  if (keepFrom === msgs.length) keepFrom = msgs.length - 1; // always send the new question
  let tokens = sysT + sumT;
  msgs.forEach((m, i) => {
    if (i < keepFrom) status[i] = 'summarized';
    else tokens += m.tokens;
  });
  return { msgs, status, useSummary: true, tokens, over: false, factVisible: true };
}

const strategies: { id: Strategy; label: string; color: string }[] = [
  { id: 'all', label: 'Send everything', color: '#ef4444' },
  { id: 'drop', label: 'Drop oldest', color: '#fbbf24' },
  { id: 'summarize', label: 'Summarize', color: '#a78bfa' },
];

export default function ContextMemoryPlayground() {
  const [convoIdx, setConvoIdx] = useState(0);
  const [turn, setTurn] = useState(0); // number of calls made so far
  const [strategy, setStrategy] = useState<Strategy>('all');

  const c = CONVOS[convoIdx];
  const lastTurn = c.turns.length;

  const calls = useMemo(
    () => Array.from({ length: turn }, (_, i) => buildCall(c, i + 1, strategy)),
    [c, turn, strategy],
  );
  const cur = calls[turn - 1];
  const everOverflowed = calls.some((x) => x.tokens > LIMIT || x.status.some((st) => st !== 'sent'));

  const reply = !cur || cur.over
    ? null
    : turn === lastTurn
      ? (cur.factVisible ? c.finalKnown : c.finalLost)
      : c.turns[turn - 1].assistant;

  const pickConvo = (i: number) => { setConvoIdx(i); setTurn(0); setStrategy('all'); };
  const canNext = turn < lastTurn && !(cur && cur.over);

  const meterPct = cur ? Math.min(cur.tokens / LIMIT, 1.3) : 0;
  const meterColor = !cur ? '#4ade80' : cur.tokens > LIMIT ? '#ef4444' : cur.tokens > LIMIT * 0.8 ? '#fbbf24' : '#4ade80';

  return (
    <motion.div
      className="absolute inset-0 flex flex-col px-6 py-4 gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header + conversation chips */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold text-white/80">Try it yourself</span>
        <span className="text-xs text-white/40">Pick a chat:</span>
        {CONVOS.map((cv, i) => (
          <motion.button
            key={cv.chip}
            onClick={() => pickConvo(i)}
            className="px-3 py-1 rounded-full border text-xs font-medium"
            style={{
              borderColor: i === convoIdx ? '#4a9eff' : 'rgba(255,255,255,0.12)',
              backgroundColor: i === convoIdx ? 'rgba(74,158,255,0.15)' : 'rgba(255,255,255,0.03)',
              color: i === convoIdx ? '#bfdbfe' : 'rgba(255,255,255,0.6)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cv.chip}
          </motion.button>
        ))}
        <span className="ml-auto text-xs text-white/35">
          Rough token estimate · tiny {LIMIT}-token limit just for this demo
        </span>
      </div>

      <div className="flex-1 flex gap-5 min-h-0">
        {/* Left: the messages list you send */}
        <div className="flex-1 min-w-0 flex flex-col">
          <p className="text-xs text-white/45 mb-1.5 font-mono">
            {turn === 0 ? 'messages = [ ] — press "Next turn" to start' : `API call #${turn} sends the WHOLE list again:`}
          </p>
          <motion.div
            key={`flash-${convoIdx}-${turn}`}
            className="rounded-xl border p-2.5 flex-1 min-h-0 overflow-hidden"
            initial={{ borderColor: 'rgba(251,191,36,0.8)', boxShadow: '0 0 18px rgba(251,191,36,0.35)' }}
            animate={{ borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0 0 0px rgba(0,0,0,0)' }}
            transition={{ duration: 1.2 }}
            style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
          >
            <div className="space-y-1">
              <Row role="system" content={c.system} tokens={estTokens(c.system)} tag="always kept" tagColor="#a78bfa" />
              <AnimatePresence initial={false}>
                {cur?.useSummary && (
                  <motion.div
                    key="summary"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={spring}
                  >
                    <Row role="summary" content={c.summary} tokens={estTokens(c.summary)} tag="summary" tagColor="#a78bfa" wrap />
                  </motion.div>
                )}
                {cur?.msgs.map((m, i) => {
                  const st = cur.status[i];
                  const isNew = i === cur.msgs.length - 1;
                  return (
                    <motion.div
                      key={`${convoIdx}-${i}`}
                      layout
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: st === 'sent' ? 1 : 0.35, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={spring}
                    >
                      <Row
                        role={m.role}
                        content={m.content}
                        tokens={m.tokens}
                        strike={st !== 'sent'}
                        tag={st === 'dropped' ? 'dropped' : st === 'summarized' ? 'in summary' : isNew ? 'NEW' : 're-sent'}
                        tagColor={st === 'dropped' ? '#ef4444' : st === 'summarized' ? '#a78bfa' : isNew ? '#4ade80' : '#fbbf24'}
                      />
                    </motion.div>
                  );
                })}
                {reply && (
                  <motion.div
                    key={`reply-${convoIdx}-${turn}-${strategy}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.6 }}
                    className="pt-1"
                  >
                    <Row role="assistant" content={reply} tokens={estTokens(reply)} tag="reply" tagColor="#4ade80" dashed />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Right: meters, strategy, controls */}
        <div className="w-[300px] shrink-0 flex flex-col gap-2">
          {/* Context window bar */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs text-white/60 font-bold">Context window <span className="font-normal text-white/35">(dashed = limit)</span></span>
              <span className="text-sm font-mono font-bold" style={{ color: meterColor }}>
                {cur ? cur.tokens : 0} / {LIMIT}
              </span>
            </div>
            <div className="h-4 rounded-full bg-navy-900 border border-white/10 relative overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${(meterPct / 1.3) * 100}%`, backgroundColor: meterColor }}
                transition={spring}
              />
              <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-white/60" style={{ left: `${100 / 1.3}%` }} />
            </div>
            <div className="flex items-center gap-2 mt-2 min-w-0">
              <span className="text-xs text-white/60 font-bold whitespace-nowrap shrink-0">Model sees:</span>
              <motion.span
                key={`${c.factLabel}-${cur ? cur.factVisible : 'none'}`}
                className="text-xs font-mono font-bold px-1.5 py-0.5 rounded border whitespace-nowrap truncate min-w-0"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: turn === 0 ? 0.4 : 1 }}
                transition={spring}
                style={
                  !cur || cur.factVisible
                    ? { color: '#4ade80', borderColor: '#4ade8050', backgroundColor: '#4ade8015' }
                    : { color: '#ef4444', borderColor: '#ef444450', backgroundColor: '#ef444415', textDecoration: 'line-through' }
                }
              >
                {c.factLabel} {turn === 0 ? '' : !cur || cur.factVisible ? '✓' : '✗'}
              </motion.span>
            </div>
          </div>

          {/* Tokens per call */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-white/60 font-bold mb-1.5">Tokens sent per call</p>
            <div className="flex items-end gap-2 h-12 relative">
              <div className="absolute left-0 right-0 border-t border-dashed border-white/30" style={{ bottom: `${(LIMIT / 150) * 100}%` }} />
              {Array.from({ length: lastTurn }).map((_, i) => {
                const call = calls[i];
                const h = call ? Math.min(call.tokens / 150, 1) * 100 : 0;
                const col = !call ? 'rgba(0,0,0,0)' : call.tokens > LIMIT ? '#ef4444' : call.status.some((x) => x !== 'sent') ? '#a78bfa' : '#4a9eff';
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <motion.div
                      className="w-full rounded-t"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%`, backgroundColor: col }}
                      transition={spring}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-1">
              {Array.from({ length: lastTurn }).map((_, i) => (
                <span key={i} className="flex-1 text-center text-xs font-mono text-white/40">
                  {calls[i] ? calls[i].tokens : `#${i + 1}`}
                </span>
              ))}
            </div>
          </div>

          {/* Strategy */}
          <div className="rounded-xl border p-2.5" style={{ borderColor: cur?.over ? '#ef444480' : 'rgba(255,255,255,0.1)', backgroundColor: cur?.over ? '#ef444410' : 'rgba(255,255,255,0.03)' }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={cur?.over ? 'over' : everOverflowed ? 'after' : 'before'}
                className="text-xs mb-1.5"
                style={{ color: cur?.over ? '#f87171' : 'rgba(255,255,255,0.5)' }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0, x: cur?.over ? [0, -4, 4, -3, 3, 0] : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {cur?.over
                  ? 'Too big! The API would reject this call. Pick a strategy:'
                  : everOverflowed
                    ? 'Switch strategies and watch what the model can still see:'
                    : 'When the list gets too big, you need a strategy:'}
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-1.5">
              {strategies.map((st) => (
                <motion.button
                  key={st.id}
                  onClick={() => setStrategy(st.id)}
                  className="flex-1 px-1.5 py-1.5 rounded-lg border text-xs font-bold"
                  style={{
                    color: strategy === st.id ? st.color : 'rgba(255,255,255,0.5)',
                    borderColor: strategy === st.id ? `${st.color}80` : 'rgba(255,255,255,0.1)',
                    backgroundColor: strategy === st.id ? `${st.color}18` : 'rgba(0,0,0,0)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {st.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <motion.button
              onClick={() => canNext && setTurn((t) => t + 1)}
              disabled={!canNext}
              className="flex-1 rounded-xl border-2 py-2 text-sm font-bold"
              style={{
                borderColor: canNext ? '#4a9eff80' : 'rgba(255,255,255,0.1)',
                backgroundColor: canNext ? 'rgba(74,158,255,0.12)' : 'rgba(0,0,0,0)',
                color: canNext ? '#93c5fd' : 'rgba(255,255,255,0.3)',
                cursor: canNext ? 'pointer' : 'not-allowed',
              }}
              whileHover={canNext ? { scale: 1.03 } : undefined}
              whileTap={canNext ? { scale: 0.96 } : undefined}
            >
              {turn >= lastTurn ? 'Chat finished' : `Next turn ▶ (${turn}/${lastTurn})`}
            </motion.button>
            <motion.button
              onClick={() => { setTurn(0); setStrategy('all'); }}
              className="px-3 rounded-xl border border-white/10 text-xs text-white/50 hover:text-white/80"
              whileTap={{ scale: 0.95 }}
            >
              Restart
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Row({
  role,
  content,
  tokens,
  tag,
  tagColor,
  strike = false,
  dashed = false,
  wrap = false,
}: {
  role: string;
  content: string;
  tokens: number;
  tag?: string;
  tagColor?: string;
  strike?: boolean;
  dashed?: boolean;
  wrap?: boolean;
}) {
  const color = roleColors[role] || '#fff';
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 rounded-md border ${dashed ? 'border-dashed' : ''}`}
      style={{ borderColor: `${color}40`, backgroundColor: `${color}0d` }}
    >
      <span className="text-xs font-bold uppercase px-1 rounded shrink-0 w-[74px] text-center" style={{ color, backgroundColor: `${color}20` }}>
        {role}
      </span>
      <span
        className={`text-xs text-white/75 flex-1 min-w-0 ${wrap ? '' : 'truncate'}`}
        style={{ textDecoration: strike ? 'line-through' : 'none' }}
        title={content}
      >
        {content}
      </span>
      <span className="text-xs font-mono text-white/35 shrink-0">{tokens}t</span>
      {tag && (
        <span className="text-xs font-bold px-1 rounded shrink-0" style={{ color: tagColor, backgroundColor: `${tagColor}20` }}>
          {tag}
        </span>
      )}
    </div>
  );
}
