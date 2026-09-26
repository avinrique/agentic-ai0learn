'use client';
/**
 * AgentDataFlow — the main stage of the agent lessons.
 *
 *   ┌ 🤖 The AI ──────────┐  packet  ┌ 🐍 Your Python code ───────────────┐
 *   │ tool menu (cards)    │  ←──→    │ setup / request / order slip →      │
 *   │ AI thought bubble    │          │ function run → role:"tool" message  │
 *   └──────────────────────┘          └─────────────────────────────────────┘
 *
 * Everything is derived from the scene (a pure function of the trace + step index).
 */
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import ToolSelectionAnim, { MenuMode } from './ToolSelectionAnim';
import TerminalToolExec from './TerminalToolExec';
import {
  AgentCall,
  AgentScene,
  AgentTurn,
  IdChip,
  ToolCard,
  argsCall,
  argsJson,
  idColor,
  toolsSent,
  truncate,
  unescape,
  unquote,
} from './AgentLoopDiagram';

interface AgentDataFlowProps {
  scene: AgentScene;
  tools: ToolCard[];
  accentColor: string;
  loop: boolean;
  showTerminal: boolean;
}

const AFTER_DECIDE = ['decide', 'check', 'select', 'execute', 'return', 'loopback'];

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
function Typewriter({ text, animate }: { text: string; animate: boolean }) {
  const [n, setN] = useState(animate ? 0 : text.length);
  useEffect(() => {
    if (!animate) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = setInterval(() => {
      setN((k) => {
        if (k >= text.length) {
          clearInterval(id);
          return k;
        }
        return k + 2;
      });
    }, 22);
    return () => clearInterval(id);
  }, [text, animate]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="animate-pulse">▌</span>}
    </>
  );
}

function Row({
  active,
  children,
  summary,
  color = '#4a9eff',
}: {
  active: boolean;
  children: ReactNode;
  summary?: ReactNode;
  color?: string;
}) {
  const short = !active && summary !== undefined;
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{
        opacity: 1,
        x: 0,
        borderColor: active ? color : 'rgba(255,255,255,0.08)',
        backgroundColor: active ? `${color}1c` : 'rgba(255,255,255,0.02)',
        boxShadow: active ? `0 0 14px ${color}44` : '0 0 0px rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3 }}
      className={`rounded-md border px-2 py-1 text-[12.5px] leading-snug ${short ? 'whitespace-nowrap overflow-hidden text-ellipsis' : ''}`}
    >
      {short ? summary : children}
    </motion.div>
  );
}

function Box({
  title,
  color,
  active,
  children,
  className = '',
}: {
  title: ReactNode;
  color: string;
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        borderColor: active ? color : `${color}40`,
        boxShadow: active ? `0 0 16px ${color}44` : '0 0 0px rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border px-2 py-1.5 ${className}`}
      style={{ backgroundColor: `${color}0f` }}
    >
      <div className="text-[12px] font-semibold mb-0.5 flex items-center gap-1.5 flex-wrap" style={{ color }}>
        {title}
      </div>
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Python column views
// ---------------------------------------------------------------------------
function SetupView({ scene, tools }: { scene: AgentScene; tools: ToolCard[] }) {
  const f = scene.focus;
  const v = scene.vars;
  const defined = tools.filter((t) => t.name in v);
  const hasSystem = !!v.system_prompt || /^\[\s*system/.test(v.messages ?? '');
  const toolsSeen = 'tools' in v;
  const shell = tools.some((t) => t.name === 'run_command');
  // Every row stays on screen; only the row for the current line opens up, the others shrink to one line.
  return (
    <div className="flex flex-col gap-1">
      {scene.importDone && (
        <Row
          active={f === 'import'}
          summary={
            <>
              📦 <span className="font-mono text-white/90">import json{shell ? ', subprocess' : ''}</span>
            </>
          }
        >
          📦 <span className="font-mono text-white/90">import json{shell ? ', subprocess' : ''}</span>
          <span className="text-white/60">
            {' '}
            → json turns the AI&apos;s JSON text into a dict{shell ? '; subprocess runs terminal commands' : ''}
          </span>
        </Row>
      )}
      {'client' in v && (
        <Row
          active={f === 'client'}
          summary={
            <>
              🔌 <span className="font-mono text-white/90">client = OpenAI()</span>
            </>
          }
        >
          🔌 <span className="font-mono text-white/90">client = OpenAI()</span>
          <span className="text-white/60"> → our line to the AI</span>
        </Row>
      )}
      {defined.length > 0 && (
        <Row
          active={f === 'functions'}
          color="#4ade80"
          summary={
            <>
              🐍{' '}
              {defined.map((t) => (
                <span key={t.name} className="font-mono mr-1.5" style={{ color: t.color }}>
                  def {t.name}()
                </span>
              ))}
            </>
          }
        >
          <div className="text-white/70 mb-0.5">🐍 real Python functions (only your code can run these):</div>
          <div className="flex flex-wrap gap-1">
            {defined.map((t) => (
              <motion.span
                key={t.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-mono text-[12px] px-1.5 rounded border"
                style={{ color: t.color, borderColor: scene.newVars.has(t.name) ? t.color : 'rgba(255,255,255,0.12)' }}
              >
                def {t.name}({(t.params ?? []).join(', ')})
              </motion.span>
            ))}
          </div>
        </Row>
      )}
      {toolsSeen && (
        <Row
          active={f.startsWith('menu')}
          color="#fbbf24"
          summary={
            <>
              📋 <span className="font-mono text-white/90">tools = [{tools.length}]</span>
              <span className="text-white/50"> the menu (left)</span>
            </>
          }
        >
          📋{' '}
          <span className="font-mono text-white/90">
            tools = [{tools.length} card{tools.length > 1 ? 's' : ''}]
          </span>
          <span className="text-white/60"> → the menu on the left. The AI reads it; it never runs it.</span>
        </Row>
      )}
      {'available_functions' in v && (
        <Row
          active={f === 'map'}
          color="#22d3ee"
          summary={
            <>
              🗂️ <span className="font-mono text-white/90">available_functions</span>
              <span className="text-white/50"> name → function</span>
            </>
          }
        >
          <div className="text-white/70 mb-0.5">🗂️ available_functions (name text → real function):</div>
          <div className="flex flex-wrap gap-1 font-mono text-[12px]">
            {tools.map((t) => (
              <span key={t.name} className="px-1 rounded bg-white/5">
                <span className="text-[#ce9178]">&quot;{t.name}&quot;</span>
                <span className="text-white/40"> → </span>
                <span style={{ color: t.color }}>{t.name}</span>
              </span>
            ))}
          </div>
        </Row>
      )}
      {hasSystem && (
        <Row
          active={f === 'system'}
          color="#a78bfa"
          summary={
            <>
              ⚙️ <span className="text-[#a78bfa] font-semibold">system:</span>{' '}
              <span className="text-white/70">&quot;{scene.systemPrompt}&quot;</span>
            </>
          }
        >
          ⚙️ <span className="text-[#a78bfa] font-semibold">system:</span>{' '}
          <span className="text-white/85">&quot;{truncate(scene.systemPrompt, 90)}&quot;</span>
        </Row>
      )}
      {scene.loopSeen && (
        <Row
          active={f === 'loop'}
          color="#f472b6"
          summary={
            <>
              🔁 <span className="font-mono text-white/90">while True:</span>
            </>
          }
        >
          🔁 <span className="font-mono text-white/90">while True:</span>
          <span className="text-white/60"> repeat until a break</span>
        </Row>
      )}
      {scene.question && (
        <Row active={f === 'question'} color="#60a5fa">
          👤 <span className="text-[#60a5fa] font-semibold">user:</span>{' '}
          <span className="text-white text-[13px]">&quot;{scene.question}&quot;</span>
        </Row>
      )}
      {f === 'envelope' && (
        <Row active color="#fbbf24">
          📨 request = <span className="font-mono">messages</span> ({scene.msgCount}) +{' '}
          <span className="font-mono">tools</span> ({tools.length}) +{' '}
          <span className="font-mono text-[#ce9178]">tool_choice=&quot;auto&quot;</span>
          <span className="text-white/60"> (the AI may use a tool, or just answer)</span>
        </Row>
      )}
      {!scene.importDone && defined.length === 0 && !scene.question && (
        <Row active>
          🧰 An <b>agent</b> = an AI that can ask <b>your code</b> to run functions (tools). Let&apos;s build one.
        </Row>
      )}
    </div>
  );
}

function EnvelopeView({ scene, tools, loop }: { scene: AgentScene; tools: ToolCard[]; loop: boolean }) {
  const sending = scene.phase === 'send';
  const withTools = toolsSent(scene.turn, loop);
  const msgs = scene.conversation.slice(0, scene.msgCount);
  return (
    <motion.div
      key={`env-${scene.turnIdx}`}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: sending ? 1 : 0.75, x: sending ? [30, 0, -8] : 0 }}
      transition={{ duration: 0.8 }}
    >
      <Box title={<>📨 the request (client.chat.completions.create)</>} color="#fbbf24" active={sending}>
        <div className="font-mono text-[12.5px] space-y-0.5">
          <div>
            <span className="text-white/50">model=</span>
            <span className="text-[#ce9178]">&quot;gpt-4o-mini&quot;</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-white/50">messages=</span>
            {msgs.map((m, i) => (
              <span key={i} className="px-1 rounded bg-white/5 text-[12px] text-white/80">
                {m.role}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-white/50">tools=</span>
            {!withTools && (
              <span className="text-white/40 font-sans text-[12px]">
                not sent this time (we only want a text answer)
              </span>
            )}
            {withTools &&
              tools.map((t) => (
                <span key={t.name} className="text-[12px]" style={{ color: t.color }}>
                  {t.name}
                </span>
              ))}
          </div>
        </div>
      </Box>
      <div className="text-[12.5px] mt-1.5 text-white/60">
        {sending ? (
          '→ flying to the AI…'
        ) : (
          <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
            ⏳ waiting for the AI&apos;s reply…
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

function CheckBadge({ scene, hasCalls, loop }: { scene: AgentScene; hasCalls: boolean; loop: boolean }) {
  const active = scene.phase === 'check';
  return (
    <motion.div
      animate={{ scale: active ? [1, 1.04, 1] : 1 }}
      transition={active ? { duration: 1.2, repeat: Infinity } : {}}
      className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full border font-mono"
      style={{
        color: hasCalls ? '#4ade80' : '#f87171',
        borderColor: active ? (hasCalls ? '#4ade80' : '#f87171') : 'rgba(255,255,255,0.12)',
        backgroundColor: active ? (hasCalls ? '#4ade8022' : '#f8717122') : 'transparent',
      }}
    >
      tool_calls? {hasCalls ? 'YES → run' : `NO → ${loop ? 'break' : 'answer'}`}
    </motion.div>
  );
}

function CallColumn({
  scene,
  call,
  index,
  total,
  showRun,
}: {
  scene: AgentScene;
  call: AgentCall;
  index: number;
  total: number;
  showRun: boolean;
}) {
  const s = scene.step;
  const isActive = scene.call === call;
  const color = idColor(scene.model, call.id);
  const selecting = isActive && scene.phase === 'select';
  const executing = isActive && scene.phase === 'execute';
  const returning = isActive && scene.phase === 'return';
  const decideNow = scene.phase === 'decide' || scene.phase === 'check';
  const compact = total > 1 || showRun === false;
  // once the function runs, the slip shrinks to one line so the run + tool message fit below it
  const past = call.execStep <= s;
  const slipCompact = past || total > 1;
  const dimmed = scene.call && !isActive && ['select', 'execute', 'return'].includes(scene.phase);

  // With several calls side by side, the ones not being worked on shrink to a one-card summary.
  if (total > 1 && !isActive && !decideNow) {
    const done = call.returnStep <= s;
    return (
      <motion.div
        animate={{ opacity: 0.8 }}
        className="rounded-md border px-2 py-1 font-mono text-[12px] flex flex-wrap items-center gap-x-1.5"
        style={{ borderColor: '#fbbf2440', backgroundColor: '#fbbf240f' }}
      >
        <span className="text-[#fbbf24] font-sans font-semibold">🧾 {index + 1}</span>
        <IdChip id={call.id} color={color} />
        <span className="text-white/85">{argsCall(call.name, call.args)}</span>
        {done ? (
          <span className="text-[#4ade80]">
            → {truncate(unescape(unquote(call.result)), 24)} <span className="font-sans">📦 ✓</span>
          </span>
        ) : (
          <span className="text-white/45 font-sans">next in the for loop…</span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div animate={{ opacity: dimmed ? 0.55 : 1 }} className="flex-1 min-w-0 flex flex-col gap-1.5">
      {/* the order slip */}
      <motion.div
        initial={{ opacity: 0, x: -30, rotate: -2 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ type: 'spring', damping: 16, stiffness: 120, delay: index * 0.15 }}
      >
        <Box
          color="#fbbf24"
          active={decideNow || selecting}
          title={
            <>
              🧾 order slip{total > 1 ? ` ${index + 1}` : ''}{' '}
              <span className="text-white/40 font-normal">(tool_call)</span>
            </>
          }
        >
          {slipCompact ? (
            <div className="font-mono text-[12.5px] flex flex-wrap items-center gap-x-1.5">
              <IdChip id={call.id} color={color} pulse={returning} />
              <span className="text-[#ce9178]">&quot;{call.name}&quot;</span>
              <span className="text-[#ce9178] break-all">&apos;{truncate(argsJson(call.args), 44)}&apos;</span>
            </div>
          ) : (
            <div className="font-mono text-[12.5px] space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-white/50">id:</span> <IdChip id={call.id} color={color} pulse={returning} />
              </div>
              <div
                className={`rounded px-0.5 ${selecting && call.selectStep === s ? 'bg-yellow-300/15 ring-1 ring-yellow-300/60' : ''}`}
              >
                <span className="text-white/50">name:</span>{' '}
                <span className="text-[#ce9178]">&quot;{call.name}&quot;</span>
              </div>
              <div
                className={`rounded px-0.5 break-all ${selecting && call.argsStep === s ? 'bg-yellow-300/15 ring-1 ring-yellow-300/60' : ''}`}
              >
                <span className="text-white/50">arguments:</span>{' '}
                <span className="text-[#ce9178]">&apos;{truncate(argsJson(call.args), compact ? 44 : 70)}&apos;</span>
              </div>
            </div>
          )}
        </Box>
      </motion.div>

      {/* your code reads the slip */}
      {call.selectStep <= s && !past && (
        <Row active={selecting} color="#60a5fa">
          <div className="font-mono text-[12px] break-all">
            <span className="text-[#9cdcfe]">function_name</span> ={' '}
            <span className="text-[#ce9178]">&quot;{call.name}&quot;</span>
            {call.argsStep <= s && (
              <>
                <br />
                <span className="text-[#9cdcfe]">arguments</span> = {'{'}
                {call.args.map(([k, v], i) => (
                  <span key={k}>
                    {i > 0 && ', '}
                    <span className="text-[#ce9178]">&apos;{k}&apos;</span>: {truncate(v, 24)}
                  </span>
                ))}
                {'}'} <span className="text-white/40 font-sans">← json.loads(text) → dict</span>
              </>
            )}
          </div>
        </Row>
      )}

      {/* the real function runs */}
      {showRun && call.execStep <= s && (
        <Box color="#4ade80" active={executing} title={<>⚙️ your Python runs the REAL function</>}>
          <div className="flex items-center gap-2 flex-wrap font-mono text-[13px]">
            <span className="text-white">{argsCall(call.name, call.args)}</span>
            <motion.span
              animate={{ x: executing ? [0, 4, 0] : 0 }}
              transition={{ duration: 0.8, repeat: executing ? Infinity : 0 }}
              className="text-white/50"
            >
              →
            </motion.span>
            {call.resultStep <= s ? (
              <motion.span
                key={`res-${call.id}`}
                initial={{ scale: 1.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-1.5 rounded bg-[#4ade80]/20 text-[#4ade80] font-bold break-all"
              >
                {truncate(unescape(unquote(call.result)), 60)}
              </motion.span>
            ) : (
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-white/50"
              >
                running…
              </motion.span>
            )}
          </div>
        </Box>
      )}

      {/* the result goes back (one line when the terminal needs the room) */}
      {call.returnStep <= s && !showRun && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, borderColor: returning ? '#4ade80' : '#4ade8040' }}
          className="rounded-md border px-2 py-1 font-mono text-[12px] flex flex-wrap items-center gap-x-1.5"
          style={{ backgroundColor: '#4ade800f' }}
        >
          <span className="font-sans font-semibold text-[#4ade80]">📦 role &quot;tool&quot;</span>
          <IdChip id={call.id} color={color} pulse={returning} />
          {returning && (
            <span className="font-sans" style={{ color }}>
              = slip id ✓
            </span>
          )}
          <span className="text-[#ce9178] truncate max-w-full">
            &quot;{truncate(unescape(unquote(call.result)), 34)}&quot;
          </span>
        </motion.div>
      )}
      {call.returnStep <= s && showRun && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Box color="#4ade80" active={returning} title={<>📦 new message: role &quot;tool&quot;</>}>
            <div className="font-mono text-[12.5px] space-y-0.5">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-white/50">tool_call_id:</span>{' '}
                <IdChip id={call.id} color={color} pulse={returning} />
                {returning && (
                  <span className="text-[12px] font-sans" style={{ color }}>
                    = same id as the slip ✓
                  </span>
                )}
              </div>
              <div className="break-all">
                <span className="text-white/50">content:</span>{' '}
                <span className="text-[#ce9178]">&quot;{truncate(unescape(unquote(call.result)), 50)}&quot;</span>
              </div>
            </div>
          </Box>
        </motion.div>
      )}
    </motion.div>
  );
}

function TurnView({
  scene,
  turn,
  loop,
  showTerminal,
}: {
  scene: AgentScene;
  turn: AgentTurn;
  loop: boolean;
  showTerminal: boolean;
}) {
  const inTools = ['select', 'execute', 'return', 'loopback'].includes(scene.phase);
  return (
    <div className="h-full flex flex-col gap-1.5 min-h-0">
      <div className="flex items-center gap-2 flex-wrap text-[12px] text-white/60">
        <span>
          🤖 reply: <span className="font-mono text-white/80">content=None</span>
        </span>
        <CheckBadge scene={scene} hasCalls loop={loop} />
      </div>
      <div
        className={`flex min-h-0 ${turn.calls.length > 1 && !['decide', 'check'].includes(scene.phase) ? 'flex-col gap-1' : 'gap-2'} ${showTerminal ? 'flex-shrink-0' : 'flex-1'}`}
      >
        {turn.calls.map((c, i) => (
          <CallColumn key={c.id} scene={scene} call={c} index={i} total={turn.calls.length} showRun={!showTerminal} />
        ))}
      </div>
      {showTerminal && inTools && (
        <div className="flex-1 min-h-[70px]">
          <TerminalToolExec scene={scene} />
        </div>
      )}
    </div>
  );
}

function AnswerView({
  scene,
  turn,
  loop,
  showTerminal,
}: {
  scene: AgentScene;
  turn: AgentTurn;
  loop: boolean;
  showTerminal: boolean;
}) {
  const earlier = scene.model.turns.filter((t) => t.n < turn.n).flatMap((t) => t.calls);
  const final = scene.phase === 'answer' || scene.phase === 'done';
  return (
    <div className="h-full flex flex-col gap-1.5 min-h-0">
      <div className="flex items-center gap-2 flex-wrap text-[12px] text-white/60">
        <span>
          🤖 reply: <span className="font-mono text-white/80">tool_calls=None</span>
        </span>
        {(loop || turn.n === 1) && <CheckBadge scene={scene} hasCalls={false} loop={loop} />}
      </div>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-xl border px-3 py-2"
        style={{
          borderColor: final ? '#4ade80' : '#4ade8066',
          backgroundColor: '#4ade8012',
          boxShadow: final ? '0 0 20px #4ade8033' : 'none',
        }}
      >
        <div className="text-[12px] font-semibold text-[#4ade80] mb-0.5">
          💬 message.content {final ? '(the final answer)' : ''}
        </div>
        <div className={`${showTerminal ? 'text-[14px]' : 'text-[15px]'} leading-snug text-white`}>
          <Typewriter text={turn.answer ?? ''} animate={scene.phase === 'decide' || scene.phase === 'answer'} />
        </div>
      </motion.div>
      {showTerminal ? null : earlier.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1 text-[12px] text-white/60">
          <span>Built from the real results:</span>
          {earlier.map((c) => (
            <span key={c.id} className="font-mono px-1.5 rounded bg-white/5 text-white/85">
              {truncate(argsCall(c.name, c.args), 30)} = {truncate(unescape(unquote(c.result)), 24)}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-[12.5px] text-white/60">
          ✨ No tool was needed: the AI answered directly, and no Python function ran.
        </div>
      )}
      {showTerminal && (
        <div className="flex-1 min-h-[70px]">
          <TerminalToolExec scene={scene} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Channel between the columns: the packet that is travelling right now
// ---------------------------------------------------------------------------
function Channel({ scene }: { scene: AgentScene }) {
  const hasCalls = !!scene.turn?.calls.length;
  let packet: { icon: string; label: string; toAI: boolean } | null = null;
  if (scene.phase === 'send') packet = { icon: '📨', label: 'request', toAI: true };
  else if (scene.phase === 'decide')
    packet = hasCalls ? { icon: '🧾', label: 'tool call', toAI: false } : { icon: '💬', label: 'text', toAI: false };
  else if (scene.phase === 'return') packet = { icon: '📦', label: 'result', toAI: true };
  else if (scene.phase === 'answer') packet = { icon: '💬', label: 'answer', toAI: false };

  return (
    <div className="w-11 flex-shrink-0 flex flex-col items-center justify-center gap-2 relative">
      <div className="text-white/20 text-lg leading-none">⟵</div>
      {packet ? (
        <motion.div
          key={`${scene.step}-${packet.icon}`}
          className="flex flex-col items-center"
          initial={{ x: packet.toAI ? 14 : -14, opacity: 0 }}
          animate={{
            x: packet.toAI ? [14, -14] : [-14, 14],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.3 }}
        >
          <span className="text-2xl leading-none">{packet.icon}</span>
          <span className="text-[11px] text-white/70 whitespace-nowrap">{packet.label}</span>
        </motion.div>
      ) : (
        <div className="h-9" />
      )}
      <div className="text-white/20 text-lg leading-none">⟶</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The AI column's thought bubble
// ---------------------------------------------------------------------------
function thought(scene: AgentScene, tools: ToolCard[], loop: boolean): string {
  const t = scene.turn;
  const names = t?.calls.map((c) => c.name).join(' + ') ?? '';
  const c = scene.call;
  switch (scene.phase) {
    case 'setup':
      return 'tools' in scene.vars ? 'This menu is sent along with every request.' : 'The menu is still being written…';
    case 'send':
      return `📨 Incoming: ${scene.msgCount} message${scene.msgCount === 1 ? '' : 's'}${
        toolsSent(t, loop) ? ` + ${tools.length} tool${tools.length === 1 ? '' : 's'}` : ' (no menu this time)'
      }`;
    case 'thinking':
      if (!t?.calls.length) {
        return scene.model.turns.some((x) => x.n < (t?.n ?? 0) && x.calls.length)
          ? 'The results are in. I can write the answer now.'
          : 'No tool on the menu helps here. I know this one!';
      }
      return (t.n === 1 ? `"${truncate(scene.model.question, 40)}" → ` : 'Next step → ') + `${names} fits!`;
    case 'decide':
    case 'check':
      return t?.calls.length ? "I can't run code, so I send an order slip." : 'No tool needed: I reply with text.';
    case 'select':
    case 'execute':
      return `⏳ Waiting for your code to run ${c?.name ?? 'the tool'}…`;
    case 'return':
      return `📦 Got the result: ${truncate(unescape(unquote(c?.result)), 30)}`;
    case 'loopback':
      return 'Ready for the next turn.';
    default:
      return scene.model.turns.some((x) => x.calls.length)
        ? '✍️ I wrote the answer from the real results.'
        : '✍️ I answered directly.';
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function AgentDataFlow({ scene, tools, accentColor, loop, showTerminal }: AgentDataFlowProps) {
  const t = scene.turn;
  const phase = scene.phase;
  const hasCalls = !!t?.calls.length;
  const earlierNames = scene.model.turns
    .filter((x) => t && x.n < t.n && x.decideStep <= scene.step)
    .flatMap((x) => x.calls.map((c) => c.name));

  let mode: MenuMode = 'idle';
  if (!('tools' in scene.vars)) mode = 'draft';
  else if (phase === 'thinking') mode = hasCalls ? 'scanning' : 'unused';
  else if (AFTER_DECIDE.includes(phase)) mode = hasCalls ? 'chosen' : 'unused';
  else if (phase === 'answer' || phase === 'done') mode = 'unused';

  const filledArgs: Record<string, [string, string][]> = {};
  if (t && AFTER_DECIDE.includes(phase)) {
    const active = scene.call;
    for (const c of t.calls) if (!filledArgs[c.name] || c === active) filledArgs[c.name] = c.args;
  }
  const hf =
    scene.phase === 'setup' && scene.focus.startsWith('menu-')
      ? (scene.focus.slice(5) as 'name' | 'desc' | 'params')
      : null;
  const aiActive = phase === 'thinking' || phase === 'decide' || phase === 'send';
  const pyActive = !aiActive;

  // which view the Python column shows
  let view: ReactNode;
  if (phase === 'setup' || !t) view = <SetupView scene={scene} tools={tools} />;
  else if (phase === 'send' || phase === 'thinking') view = <EnvelopeView scene={scene} tools={tools} loop={loop} />;
  else if (hasCalls && AFTER_DECIDE.includes(phase))
    view = <TurnView scene={scene} turn={t} loop={loop} showTerminal={showTerminal} />;
  else {
    const answerTurn = [...scene.model.turns].reverse().find((x) => x.answerStep <= scene.step) ?? t;
    view = <AnswerView scene={scene} turn={answerTurn} loop={loop} showTerminal={showTerminal} />;
  }

  return (
    <div className="h-full flex min-h-0">
      {/* ---------------- The AI ---------------- */}
      <motion.div
        animate={{
          borderColor: aiActive ? `${accentColor}aa` : 'rgba(255,255,255,0.1)',
        }}
        className="basis-[36%] min-w-[180px] max-w-[320px] flex-shrink-0 flex flex-col rounded-xl border bg-white/[0.02] p-2 min-h-0"
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <motion.span
            className="text-lg leading-none"
            animate={phase === 'thinking' ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }}
            transition={phase === 'thinking' ? { duration: 1, repeat: Infinity } : {}}
          >
            🤖
          </motion.span>
          <div className="min-w-0 text-[13px] font-semibold text-white/90 leading-tight truncate">
            The AI <span className="text-[11px] font-normal text-white/40">· OpenAI server</span>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ToolSelectionAnim
            tools={tools}
            mode={mode}
            chosen={t?.calls.map((c) => c.name) ?? []}
            usedBefore={
              phase === 'answer' || phase === 'done'
                ? scene.model.turns.flatMap((x) => (x.decideStep <= scene.step ? x.calls.map((c) => c.name) : []))
                : earlierNames
            }
            filledArgs={filledArgs}
            highlightField={hf}
            accentColor={accentColor}
            animKey={`${scene.step}`}
          />
        </div>
        <motion.div
          key={`th-${scene.step}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 rounded-lg px-2 py-1 text-[12.5px] leading-snug text-white/85 border"
          style={{
            borderColor: `${accentColor}55`,
            backgroundColor: `${accentColor}14`,
          }}
        >
          💭 {thought(scene, tools, loop)}
        </motion.div>
      </motion.div>

      {/* ---------------- packet ---------------- */}
      <Channel scene={scene} />

      {/* ---------------- Your Python code ---------------- */}
      <motion.div
        animate={{
          borderColor: pyActive ? '#4ade8088' : 'rgba(255,255,255,0.1)',
        }}
        className="flex-1 min-w-0 flex flex-col rounded-xl border bg-white/[0.02] p-2 min-h-0"
      >
        <div className="flex items-center gap-1.5 mb-1.5 flex-shrink-0">
          <span className="text-lg leading-none">🐍</span>
          <div className="min-w-0 text-[13px] font-semibold text-white/90 leading-tight truncate">
            Your Python code{' '}
            <span className="text-[11px] font-normal text-white/40">· your laptop, runs the real functions</span>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">{view}</div>
        {scene.output && !(showTerminal && phase !== 'setup') && (
          <motion.div
            key={`out-${scene.step}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 flex-shrink-0 rounded-md bg-black/40 border border-white/10 px-2 py-1 font-mono text-[12px] text-white/80 truncate"
          >
            <span className="text-white/40">🖨 print → </span>
            {scene.output}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
