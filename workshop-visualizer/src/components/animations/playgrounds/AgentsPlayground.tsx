'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const spring = { type: 'spring' as const, stiffness: 260, damping: 24 };

type ToolName = 'weather' | 'converter' | 'search_flights' | 'calculator' | 'email_reader';

const TOOLS: { name: ToolName; icon: string; desc: string; color: string }[] = [
  { name: 'weather', icon: '🌤️', desc: 'Current weather for a city (°C)', color: '#4a9eff' },
  { name: 'converter', icon: '🔁', desc: 'Convert units (°C→°F, km→mi…)', color: '#a78bfa' },
  { name: 'search_flights', icon: '✈️', desc: 'Find flights and prices', color: '#fbbf24' },
  { name: 'calculator', icon: '🧮', desc: 'Exact arithmetic', color: '#4ade80' },
  { name: 'email_reader', icon: '📧', desc: 'Read your inbox', color: '#f472b6' },
];

type Ev =
  | { kind: 'think'; text: string }
  | { kind: 'call'; tool: ToolName; args: string }
  | { kind: 'result'; tool: ToolName; text: string }
  | { kind: 'error'; tool: ToolName; text: string }
  | { kind: 'final'; text: string };

interface Task {
  id: string;
  label: string;
  normal: Ev[];
  failing: Ev[] | null; // null = no tool, nothing can fail
  failNote?: string;
}

// All tool results are made-up example data.
const TASKS: Task[] = [
  {
    id: 'weather',
    label: 'What’s the weather in Paris in °F?',
    normal: [
      { kind: 'think', text: 'I need the current weather in Paris. I’ll use the weather tool.' },
      { kind: 'call', tool: 'weather', args: '{ "city": "Paris" }' },
      { kind: 'result', tool: 'weather', text: '{ "temp_c": 18, "conditions": "cloudy" }' },
      { kind: 'think', text: 'The tool gave °C, but the user wants °F. I’ll convert it.' },
      { kind: 'call', tool: 'converter', args: '{ "value": 18, "from": "C", "to": "F" }' },
      { kind: 'result', tool: 'converter', text: '{ "value": 64.4 }' },
      { kind: 'final', text: 'It’s about 64°F (18°C) and cloudy in Paris right now.' },
    ],
    failing: [
      { kind: 'think', text: 'I need the current weather in Paris. I’ll use the weather tool.' },
      { kind: 'call', tool: 'weather', args: '{ "city": "Paris" }' },
      { kind: 'error', tool: 'weather', text: '{ "error": "Request timed out" }' },
      { kind: 'think', text: 'A timeout is often temporary. I’ll retry once.' },
      { kind: 'call', tool: 'weather', args: '{ "city": "Paris" }' },
      { kind: 'result', tool: 'weather', text: '{ "temp_c": 18, "conditions": "cloudy" }' },
      { kind: 'think', text: 'Got it this time. Now convert 18°C to °F.' },
      { kind: 'call', tool: 'converter', args: '{ "value": 18, "from": "C", "to": "F" }' },
      { kind: 'result', tool: 'converter', text: '{ "value": 64.4 }' },
      { kind: 'final', text: 'It’s about 64°F (18°C) and cloudy in Paris right now.' },
    ],
    failNote: 'Recovery: retry (timeouts are often temporary).',
  },
  {
    id: 'flight',
    label: 'Book the cheapest flight to Rome under $300',
    normal: [
      { kind: 'think', text: 'First I need to find flights to Rome that cost at most $300.' },
      { kind: 'call', tool: 'search_flights', args: '{ "to": "Rome", "max_price": 300 }' },
      {
        kind: 'result',
        tool: 'search_flights',
        text: '[ { "flight": "RX 204", "price": 279 }, { "flight": "RX 112", "price": 189 }, { "flight": "RX 88", "price": 245 } ]',
      },
      { kind: 'think', text: 'The cheapest is RX 112 at $189. But I have no booking tool, so I can’t book it myself.' },
      {
        kind: 'final',
        text: 'The cheapest flight to Rome under $300 is RX 112 for $189. I can’t book flights (I don’t have a booking tool), but you can book it on the airline’s site.',
      },
    ],
    failing: [
      { kind: 'think', text: 'First I need to find flights to Rome that cost at most $300.' },
      { kind: 'call', tool: 'search_flights', args: '{ "to": "Rome", "max_price": 300 }' },
      { kind: 'error', tool: 'search_flights', text: '{ "error": "Service unavailable (503)" }' },
      { kind: 'think', text: 'The flight service is down. I’ll try one more time.' },
      { kind: 'call', tool: 'search_flights', args: '{ "to": "Rome", "max_price": 300 }' },
      { kind: 'error', tool: 'search_flights', text: '{ "error": "Service unavailable (503)" }' },
      { kind: 'think', text: 'It failed twice and I have no other flight tool. I must not invent prices, so I’ll tell the user.' },
      { kind: 'final', text: 'Sorry, the flight search service is down right now, so I can’t find prices. Please try again in a few minutes.' },
    ],
    failNote: 'Recovery: retry, then tell the user (never make up an answer).',
  },
  {
    id: 'email',
    label: 'Summarize my latest email',
    normal: [
      { kind: 'think', text: 'I need to read the newest email first.' },
      { kind: 'call', tool: 'email_reader', args: '{ "count": 1 }' },
      {
        kind: 'result',
        tool: 'email_reader',
        text: '{ "from": "Priya", "subject": "Team lunch moved", "body": "Hi all, Friday’s team lunch moves from 12:30 to 1:00pm, same place (Luigi’s). Reply if you can’t make it." }',
      },
      { kind: 'think', text: 'I have the email. Summarizing text is something I can do myself, no tool needed.' },
      { kind: 'final', text: 'Priya says Friday’s team lunch at Luigi’s is moved to 1:00pm. Reply to her if you can’t come.' },
    ],
    failing: [
      { kind: 'think', text: 'I need to read the newest email first.' },
      { kind: 'call', tool: 'email_reader', args: '{ "count": 1 }' },
      { kind: 'error', tool: 'email_reader', text: '{ "error": "Login expired. Please sign in again." }' },
      { kind: 'think', text: 'Retrying won’t help: the user has to sign in again. I’ll tell them.' },
      { kind: 'final', text: 'I couldn’t open your inbox because your login has expired. Please sign in again and I’ll summarize it.' },
    ],
    failNote: 'Recovery: tell the user (a retry can’t fix an expired login).',
  },
  {
    id: 'tip',
    label: 'What is 15% tip on $84?',
    normal: [
      {
        kind: 'think',
        text: 'This is simple math: 84 × 0.15 = 12.60. I can answer directly, no tool needed. (For harder math, the calculator tool is safer.)',
      },
      { kind: 'final', text: 'A 15% tip on $84 is $12.60, so the total is $96.60.' },
    ],
    failing: null,
  },
];

const LOOP = [
  { key: 'think', label: 'Think', icon: '🧠', color: '#a78bfa' },
  { key: 'choose', label: 'Choose tool', icon: '🧭', color: '#4a9eff' },
  { key: 'run', label: 'Run', icon: '⚙️', color: '#fbbf24' },
  { key: 'observe', label: 'Observe', icon: '👁', color: '#4ade80' },
  { key: 'answer', label: 'Answer', icon: '✅', color: '#4ade80' },
];

function loopIndex(ev: Ev | undefined): number {
  if (!ev) return -1;
  switch (ev.kind) {
    case 'think':
      return 0;
    case 'call':
      return 1;
    case 'result':
    case 'error':
      return 3;
    case 'final':
      return 4;
  }
}

const STEP_MS = 1300;

export default function AgentsPlayground() {
  const [taskIdx, setTaskIdx] = useState(0);
  const [fail, setFail] = useState(false);
  const [shown, setShown] = useState(0); // how many events are visible
  const [running, setRunning] = useState(false); // tool is "running" (between call and result)
  const [runId, setRunId] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const task = TASKS[taskIdx];
  const events = fail && task.failing ? task.failing : task.normal;

  // Play the run event by event
  useEffect(() => {
    setShown(0);
    setRunning(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = 300;
    events.forEach((ev, i) => {
      timers.push(setTimeout(() => setShown(i + 1), t));
      if (ev.kind === 'call') {
        timers.push(setTimeout(() => setRunning(true), t + STEP_MS * 0.45));
        timers.push(setTimeout(() => setRunning(false), t + STEP_MS));
      }
      t += STEP_MS;
    });
    return () => timers.forEach(clearTimeout);
  }, [runId, taskIdx, fail, events]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [shown]);

  const current = events[shown - 1];
  const phaseIdx = running ? 2 : loopIndex(current);
  const toolCalls = events.slice(0, shown).filter((e) => e.kind === 'call').length;
  const activeTool = current && (current.kind === 'call' || current.kind === 'result' || current.kind === 'error') ? current.tool : null;
  const usedTools = new Set(events.slice(0, shown).flatMap((e) => (e.kind === 'call' ? [e.tool] : [])));
  const done = shown >= events.length;
  const totalCalls = events.filter((e) => e.kind === 'call').length;

  return (
    <div className="absolute inset-0 flex flex-col px-5 py-3 gap-2 text-white">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Try it yourself: agent run simulator</p>
        <p className="text-xs text-white/35">Simulated run with example data. No real model or tools are called.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-1.5">
        {TASKS.map((t, i) => {
          const active = i === taskIdx;
          return (
            <motion.button
              key={t.id}
              onClick={() => {
                setTaskIdx(i);
                setRunId((r) => r + 1);
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-2.5 py-1 rounded-full border text-xs"
              style={{
                borderColor: active ? 'rgba(74,158,255,0.7)' : 'rgba(255,255,255,0.15)',
                backgroundColor: active ? 'rgba(74,158,255,0.18)' : 'rgba(255,255,255,0.04)',
                color: active ? '#cfe4ff' : 'rgba(255,255,255,0.65)',
              }}
            >
              {t.label}
            </motion.button>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setFail((f) => !f)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-bold"
            style={{
              borderColor: fail ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.15)',
              backgroundColor: fail ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
              color: fail ? '#fca5a5' : 'rgba(255,255,255,0.6)',
            }}
            aria-pressed={fail}
          >
            <span className="relative w-7 h-4 rounded-full" style={{ backgroundColor: fail ? '#ef4444' : 'rgba(255,255,255,0.2)' }}>
              <motion.span
                className="absolute top-0.5 w-3 h-3 rounded-full bg-white"
                animate={{ left: fail ? 14 : 2 }}
                transition={spring}
              />
            </span>
            Tool fails
          </button>
          <button
            onClick={() => setRunId((r) => r + 1)}
            className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#4ade80]/15 border border-[#4ade80]/40 text-[#86efac] hover:bg-[#4ade80]/25"
          >
            ↻ Replay
          </button>
        </div>
      </div>

      {/* Loop phases */}
      <div className="flex items-center gap-1.5">
        {LOOP.map((p, i) => {
          const active = phaseIdx === i;
          return (
            <div key={p.key} className="flex items-center gap-1.5">
              <motion.div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2"
                animate={{
                  scale: active ? 1.08 : 1,
                  borderColor: active ? p.color : 'rgba(255,255,255,0.1)',
                  backgroundColor: active ? `${p.color}25` : 'rgba(255,255,255,0.03)',
                  boxShadow: active ? `0 0 14px ${p.color}55` : '0 0 0px transparent',
                }}
                transition={spring}
              >
                <span className="text-sm">{p.icon}</span>
                <span className="text-xs font-bold" style={{ color: active ? p.color : 'rgba(255,255,255,0.5)' }}>
                  {p.label}
                </span>
              </motion.div>
              {i < 3 && <span className="text-white/25 text-xs">→</span>}
              {i === 3 && <span className="text-white/25 text-xs">↺ or →</span>}
            </div>
          );
        })}
        <span className="ml-auto text-xs text-white/50">
          Tool calls: <span className="font-bold text-[#fbbf24]">{toolCalls}</span>
          <span className="text-white/30"> / {totalCalls}</span>
        </span>
      </div>

      {/* Main */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* Tool belt */}
        <div className="w-56 shrink-0 flex flex-col gap-1.5">
          <p className="text-xs text-white/45 font-bold uppercase tracking-wider">Tool belt</p>
          {TOOLS.map((tool) => {
            const isActive = activeTool === tool.name;
            const isErr = isActive && current?.kind === 'error';
            const used = usedTools.has(tool.name);
            return (
              <motion.div
                key={tool.name}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg border-2"
                animate={{
                  x: isActive ? 6 : 0,
                  borderColor: isErr ? '#ef4444' : isActive ? tool.color : used ? `${tool.color}55` : 'rgba(255,255,255,0.08)',
                  backgroundColor: isErr ? 'rgba(239,68,68,0.12)' : isActive ? `${tool.color}22` : 'rgba(255,255,255,0.03)',
                  boxShadow: isActive ? `0 0 14px ${isErr ? '#ef4444' : tool.color}55` : '0 0 0px transparent',
                }}
                transition={spring}
              >
                <motion.span
                  className="text-base"
                  animate={{ rotate: isActive && running ? [0, -15, 15, 0] : 0 }}
                  transition={{ duration: 0.5, repeat: isActive && running ? Infinity : 0 }}
                >
                  {tool.icon}
                </motion.span>
                <div className="min-w-0">
                  <p className="text-xs font-mono font-bold" style={{ color: tool.color }}>
                    {tool.name}
                  </p>
                  <p className="text-[11px] text-white/45 truncate">{tool.desc}</p>
                </div>
              </motion.div>
            );
          })}
          <p className="text-[11px] text-white/35 mt-1 leading-snug">
            The agent can only do what its tools allow. There is no booking tool here.
          </p>
        </div>

        {/* Transcript */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-[#4a9eff]">💬 User:</span>
            <span className="text-sm text-white/85">&quot;{task.label}&quot;</span>
          </div>
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-1.5">
            <AnimatePresence initial={false}>
              {events.slice(0, shown).map((ev, i) => (
                <motion.div
                  key={`${runId}-${taskIdx}-${fail}-${i}`}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={spring}
                >
                  <EventRow ev={ev} running={running && i === shown - 1} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="h-6 shrink-0 flex items-center">
            {done && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-white/50">
                {task.failing === null
                  ? fail
                    ? 'No tool was used, so nothing could fail. Not every task needs a tool!'
                    : 'No tool needed: the model answered from its own knowledge.'
                  : fail
                    ? task.failNote
                    : `Done in ${totalCalls} tool call${totalCalls === 1 ? '' : 's'}.`}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventRow({ ev, running }: { ev: Ev; running: boolean }) {
  if (ev.kind === 'think') {
    return (
      <div className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg border border-[#a78bfa]/30 bg-[#a78bfa]/5">
        <span className="text-sm">🧠</span>
        <p className="text-xs text-white/75 italic leading-snug">{ev.text}</p>
      </div>
    );
  }
  if (ev.kind === 'call') {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#4a9eff]/35 bg-[#4a9eff]/5">
        <span className="text-xs font-bold text-[#4a9eff] shrink-0">TOOL CALL</span>
        <code className="text-xs text-white/85 font-mono truncate">
          {ev.tool}({ev.args})
        </code>
        {running && (
          <motion.span
            className="ml-auto text-xs text-[#fbbf24] shrink-0"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ⚙️ running…
          </motion.span>
        )}
      </div>
    );
  }
  if (ev.kind === 'result') {
    return (
      <div className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg border border-[#4ade80]/35 bg-[#4ade80]/5">
        <span className="text-xs font-bold text-[#4ade80] shrink-0">RESULT</span>
        <code className="text-xs text-white/75 font-mono break-words min-w-0">{ev.text}</code>
      </div>
    );
  }
  if (ev.kind === 'error') {
    return (
      <motion.div
        className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg border-2 border-[#ef4444]/50 bg-[#ef4444]/10"
        animate={{ x: [0, -5, 5, -3, 3, 0] }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-xs font-bold text-[#ef4444] shrink-0">ERROR</span>
        <code className="text-xs text-[#fca5a5] font-mono break-words min-w-0">{ev.text}</code>
      </motion.div>
    );
  }
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg border-2 border-[#fbbf24]/45 bg-[#fbbf24]/10">
      <span className="text-sm">✅</span>
      <div>
        <p className="text-xs font-bold text-[#fbbf24] uppercase tracking-wider">Final answer</p>
        <p className="text-sm text-white/90 leading-snug">{ev.text}</p>
      </div>
    </div>
  );
}
