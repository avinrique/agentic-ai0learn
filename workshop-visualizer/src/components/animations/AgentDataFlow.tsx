'use client';
/**
 * AgentDataFlow — the main stage of the agent lessons.
 *
 *   [ 🤖 The AI ]  ── packet ──  [ 🐍 Your code ]     ← small actor strip; the busy side glows,
 *                                                        the idle side shrinks and dims
 *   ┌──────────────────────────────────────────────┐
 *   │   ONE focal thing for this step, big:         │  e.g. the tool menu while the AI picks,
 *   │   menu / request / order slip / function run  │  the function call + result while our
 *   │   / tool message / answer / terminal          │  code runs it
 *   └──────────────────────────────────────────────┘
 *
 * Everything is derived from the scene (a pure function of the trace + step index).
 */
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import ToolSelectionAnim, { MenuMode } from './ToolSelectionAnim';
import TerminalToolExec, { safetyFor } from './TerminalToolExec';
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
  usedTools,
} from './AgentLoopDiagram';

interface AgentDataFlowProps {
  scene: AgentScene;
  tools: ToolCard[];
  accentColor: string;
  loop: boolean;
  showTerminal: boolean;
  /** only draw the actor strip (another widget is the focal point this step) */
  collapsed?: boolean;
}

const PY = '#4ade80';
const SLIP = '#fbbf24';

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

/** A big card: the focal item of a step. */
function Card({
  label,
  color,
  children,
  className = '',
}: {
  label?: ReactNode;
  color: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full rounded-2xl border px-5 py-4 ${className}`}
      style={{
        borderColor: `${color}99`,
        backgroundColor: `${color}12`,
        boxShadow: `0 0 24px ${color}22`,
      }}
    >
      {label && (
        <div className="text-[14px] font-semibold mb-2" style={{ color }}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

/** A big line of code with an optional 1–4 word tag. */
function CodeLine({ code, tag, color = '#fff' }: { code: ReactNode; tag?: string; color?: string }) {
  return (
    <div className="flex items-baseline gap-3 flex-wrap">
      <span className="font-mono text-[20px] font-semibold" style={{ color }}>
        {code}
      </span>
      {tag && <span className="text-[14px] text-white/55">{tag}</span>}
    </div>
  );
}

/** Quiet one-line chip for something that already happened. */
function DoneChip({ children, color = 'rgba(255,255,255,0.6)' }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-[2px] text-[13px] whitespace-nowrap bg-white/[0.04]"
      style={{ color }}
    >
      {children}
    </span>
  );
}

/** What a print() on this step wrote to the console. */
function ConsoleLine({ text }: { text: string }) {
  return (
    <div className="w-full max-w-[640px] flex-shrink-0 rounded-xl bg-black/50 border border-white/10 px-4 py-3 font-mono text-[16px] text-white/90 whitespace-pre-wrap break-words">
      <span className="text-white/40">🖨 </span>
      {text}
    </div>
  );
}

function Hl({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <div className={`rounded-lg px-2 py-1 -mx-2 ${on ? 'bg-yellow-300/15 ring-2 ring-yellow-300/60' : ''}`}>
      {children}
    </div>
  );
}

function Badge({ ok, text, pulse }: { ok: boolean; text: string; pulse?: boolean }) {
  const c = ok ? '#4ade80' : '#f87171';
  return (
    <motion.div
      animate={{ scale: pulse ? [1, 1.05, 1] : 1 }}
      transition={pulse ? { duration: 1.2, repeat: Infinity } : {}}
      className="inline-flex items-center gap-2 text-[17px] px-4 py-1.5 rounded-full border-2 font-mono font-semibold"
      style={{ color: c, borderColor: c, backgroundColor: `${c}1c` }}
    >
      {text}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Actor strip: The AI  ⇄  Your code
// ---------------------------------------------------------------------------
type Who = 'ai' | 'py' | 'none';

function who(sc: AgentScene): Who {
  switch (sc.phase) {
    case 'thinking':
    case 'decide':
      return 'ai';
    case 'answer':
      return 'ai';
    case 'done':
      return 'none';
    default:
      return 'py';
  }
}

function aiState(sc: AgentScene): string {
  const hasCalls = !!sc.turn?.calls.length;
  switch (sc.phase) {
    case 'thinking':
      return hasCalls ? 'picking a tool…' : 'writing the answer…';
    case 'decide':
      return hasCalls ? 'sent an order slip' : 'replied with text';
    case 'answer':
    case 'done':
      return 'answered';
    case 'send':
      return 'receiving…';
    default:
      return sc.phase === 'setup' ? 'not called yet' : 'waiting';
  }
}

function pyState(sc: AgentScene): string {
  const c = sc.call;
  switch (sc.phase) {
    case 'setup':
      return 'setting up';
    case 'send':
      return 'sending the request';
    case 'check':
      return 'checking the reply';
    case 'select':
      return 'reading the slip';
    case 'execute':
      return `running ${c?.name ?? 'the tool'}`;
    case 'return':
      return 'sending the result back';
    case 'loopback':
      return 'looping';
    case 'done':
      return 'finished';
    default:
      return 'waiting';
  }
}

function Actor({
  icon,
  name,
  state,
  active,
  color,
  wiggle,
}: {
  icon: string;
  name: string;
  state: string;
  active: boolean;
  color: string;
  wiggle?: boolean;
}) {
  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.5,
        borderColor: active ? color : 'rgba(255,255,255,0.1)',
        backgroundColor: active ? `${color}1a` : 'rgba(255,255,255,0.02)',
        boxShadow: active ? `0 0 18px ${color}44` : '0 0 0px rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-2 rounded-full border min-w-0 ${active ? 'px-4 py-1.5' : 'px-3 py-1'}`}
    >
      <motion.span
        className={active ? 'text-[22px] leading-none' : 'text-[16px] leading-none'}
        animate={wiggle ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }}
        transition={wiggle ? { duration: 1, repeat: Infinity } : {}}
      >
        {icon}
      </motion.span>
      <span
        className={`font-semibold whitespace-nowrap ${active ? 'text-[15px] text-white' : 'text-[13px] text-white/80'}`}
      >
        {name}
      </span>
      <span
        className={`truncate ${active ? 'text-[14px]' : 'text-[13px]'}`}
        style={{ color: active ? color : 'rgba(255,255,255,0.5)' }}
      >
        {state}
      </span>
    </motion.div>
  );
}

function packetOf(sc: AgentScene): { icon: string; label: string; toAI: boolean } | null {
  const hasCalls = !!sc.turn?.calls.length;
  if (sc.phase === 'send') return { icon: '📨', label: 'request', toAI: true };
  if (sc.phase === 'decide')
    return hasCalls ? { icon: '🧾', label: 'tool call', toAI: false } : { icon: '💬', label: 'text', toAI: false };
  if (sc.phase === 'return') return { icon: '📦', label: 'result', toAI: true };
  if (sc.phase === 'answer') return { icon: '💬', label: 'answer', toAI: false };
  return null;
}

function ActorStrip({ scene, accentColor }: { scene: AgentScene; accentColor: string }) {
  const w = who(scene);
  const packet = packetOf(scene);
  return (
    <div className="flex-shrink-0 flex items-center justify-center gap-2 min-w-0">
      <Actor
        icon="🤖"
        name="The AI"
        state={aiState(scene)}
        active={w === 'ai'}
        color={accentColor}
        wiggle={scene.phase === 'thinking'}
      />
      <div className="relative w-[92px] h-8 flex-shrink-0 flex items-center justify-center">
        <div className="absolute inset-x-1 top-1/2 border-t border-dashed border-white/15" />
        {packet && (
          <motion.span
            key={`${scene.step}-${packet.icon}`}
            className="relative text-[20px] leading-none"
            initial={{ x: packet.toAI ? 34 : -34, opacity: 0 }}
            animate={{
              x: packet.toAI ? [34, -34] : [-34, 34],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.3 }}
            title={packet.label}
          >
            {packet.icon}
          </motion.span>
        )}
      </div>
      <Actor icon="🐍" name="Your code" state={pyState(scene)} active={w === 'py'} color={PY} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Setup (before the first AI call)
// ---------------------------------------------------------------------------
function SetupTrail({ scene, tools }: { scene: AgentScene; tools: ToolCard[] }) {
  const f = scene.focus;
  const v = scene.vars;
  const defined = tools.filter((t) => t.name in v);
  const hasSystem = !!v.system_prompt || /^\[\s*system/.test(v.messages ?? '');
  const items: [boolean, string][] = [
    [scene.importDone && f !== 'import', 'imports'],
    ['client' in v && f !== 'client' && !scene.newVars.has('client'), 'client'],
    [defined.length > 0 && f !== 'functions', `${defined.length} function${defined.length === 1 ? '' : 's'}`],
    ['tools' in v && !f.startsWith('menu'), 'tool menu'],
    ['available_functions' in v && f !== 'map', 'name → function'],
    [hasSystem && f !== 'system', 'system prompt'],
    [scene.loopSeen && f !== 'loop', 'while True'],
    [!!scene.question && f !== 'question', 'question'],
  ];
  const shown = items.filter(([on]) => on);
  if (!shown.length) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {shown.map(([, label]) => (
        <DoneChip key={label}>✓ {label}</DoneChip>
      ))}
    </div>
  );
}

/** The name → function dictionary; `hot` lights up one entry. */
function MapCard({ tools, hot }: { tools: ToolCard[]; hot?: string }) {
  // One entry per row while an entry is lit (so the lit one is never cut off).
  const twoCols = tools.length > 3 && !hot;
  return (
    <Card color="#22d3ee" label="🗂️ available_functions" className={twoCols ? 'max-w-[640px]' : 'max-w-[520px]'}>
      <div className={`grid gap-x-6 gap-y-1.5 font-mono text-[16px] ${twoCols ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {tools.map((t) => (
          <div
            key={t.name}
            className={`truncate rounded-md px-1.5 -mx-1.5 ${t.name === hot ? 'bg-yellow-300/15 ring-2 ring-yellow-300/60' : ''}`}
            style={{ opacity: hot && t.name !== hot ? 0.55 : 1 }}
          >
            <span className="text-[#ce9178]">&quot;{t.name}&quot;</span>
            <span className="text-white/40"> → </span>
            <span style={{ color: t.color }}>{t.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SetupFocal({
  scene,
  tools,
  accentColor,
  loop,
}: {
  scene: AgentScene;
  tools: ToolCard[];
  accentColor: string;
  loop: boolean;
}) {
  const f = scene.focus;
  const v = scene.vars;
  const defined = tools.filter((t) => t.name in v);
  const shell = tools.some((t) => t.name === 'run_command');
  const many = tools.length > 3;

  switch (f) {
    case 'import':
      return (
        <Card color="#60a5fa" className="max-w-[520px]">
          <div className="space-y-2">
            <CodeLine code="import json" tag="reads the AI's arguments" />
            {shell && <CodeLine code="import subprocess" tag="runs terminal commands" />}
            {(scene.newVars.has('client') || !scene.model.clientVar) && (
              <CodeLine code="client = OpenAI()" tag="our line to the AI" />
            )}
          </div>
        </Card>
      );
    case 'client':
      return (
        <Card color="#60a5fa" className="max-w-[520px]">
          <CodeLine code="client = OpenAI()" tag="our line to the AI" />
        </Card>
      );
    case 'functions': {
      // Lines inside a function body set nothing new: keep the function being written lit.
      const anyNew = defined.some((t) => scene.newVars.has(t.name));
      return (
        <div className={`w-full grid gap-2.5 ${many ? 'grid-cols-2 max-w-[720px]' : 'grid-cols-1 max-w-[480px]'}`}>
          {defined.map((t, i) => {
            const isNew = scene.newVars.has(t.name) || (!anyNew && i === defined.length - 1);
            return (
              <motion.div
                key={t.name}
                initial={isNew ? { opacity: 0, scale: 0.9 } : false}
                animate={{
                  opacity: isNew || defined.length === 1 ? 1 : 0.6,
                  scale: 1,
                }}
                className="rounded-xl border px-4 py-2.5 font-mono text-[16px] truncate"
                style={{
                  color: t.color,
                  borderColor: isNew ? t.color : 'rgba(255,255,255,0.1)',
                  backgroundColor: isNew ? `${t.color}18` : 'rgba(255,255,255,0.02)',
                }}
              >
                🐍 def {t.name}({(t.params ?? []).join(', ')})
              </motion.div>
            );
          })}
        </div>
      );
    }
    case 'menu':
    case 'menu-name':
    case 'menu-desc':
    case 'menu-params': {
      const hf = f === 'menu' ? null : (f.slice(5) as 'name' | 'desc' | 'params');
      return (
        <div className="w-full flex flex-col items-center gap-2">
          <div className="font-mono text-[15px] text-white/70">
            📋 tools = [ {tools.length} card{tools.length > 1 ? 's' : ''} ]
          </div>
          <ToolSelectionAnim
            tools={tools}
            mode="idle"
            highlightField={hf}
            accentColor={accentColor}
            animKey={`setup-${scene.step}`}
          />
        </div>
      );
    }
    case 'map':
      return <MapCard tools={tools} />;
    case 'system':
      return (
        <Card color="#a78bfa" label="⚙️ system" className="max-w-[640px]">
          <div className="text-[17px] leading-snug text-white/90">&quot;{truncate(scene.systemPrompt, 170)}&quot;</div>
        </Card>
      );
    case 'question':
      return scene.question ? (
        <Card color="#60a5fa" label="👤 user" className="max-w-[640px]">
          <div className="text-[20px] leading-snug text-white">&quot;{scene.question}&quot;</div>
        </Card>
      ) : null;
    case 'loop': {
      // The chat loop's exit check, right after the user typed something.
      const typed = unquote(v.user_input);
      if (scene.trigger === 'chatLoop' && 'user_input' in v && !scene.newVars.has('user_input') && typed !== 'exit') {
        return (
          <div className="flex flex-col items-center gap-4">
            <Card color="#f472b6" className="max-w-[560px]">
              <CodeLine
                code={
                  <>
                    <span className="text-[#ce9178]">&quot;{truncate(typed.trim().toLowerCase(), 30)}&quot;</span>
                    <span className="text-white/60"> == </span>
                    <span className="text-[#ce9178]">&quot;exit&quot;</span>
                  </>
                }
              />
            </Card>
            <Badge ok text="NO → keep going" />
          </div>
        );
      }
      return (
        <Card color="#f472b6" className="max-w-[520px]">
          <CodeLine code="while True:" tag="repeat until a break" color="#f9a8d4" />
        </Card>
      );
    }
    case 'envelope':
      return <EnvelopeFocal scene={scene} tools={tools} loop={loop} />;
    case 'console':
      return <ConsoleLine text={scene.output.trim() || '…'} />;
    default:
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-[44px] leading-none">🤖 ⇄ 🐍</div>
          <div className="text-[18px] text-white/85">An AI + tools that your code runs</div>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// The request
// ---------------------------------------------------------------------------
const ROLE_COLOR: Record<string, string> = {
  system: '#a78bfa',
  user: '#60a5fa',
  assistant: '#fbbf24',
  tool: '#4ade80',
};

function EnvelopeFocal({ scene, tools, loop }: { scene: AgentScene; tools: ToolCard[]; loop: boolean }) {
  const withTools = toolsSent(scene.turn, loop);
  const msgs = scene.conversation.slice(0, scene.msgCount);
  return (
    <Card color={SLIP} label="📨 the request" className="max-w-[640px]">
      <div className="space-y-2.5 text-[16px]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-white/55 w-[104px]">messages</span>
          {msgs.map((m, i) => (
            <span
              key={i}
              className="px-2 py-[1px] rounded-md text-[14px]"
              style={{
                color: ROLE_COLOR[m.role],
                backgroundColor: `${ROLE_COLOR[m.role]}1c`,
              }}
            >
              {m.role}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-white/55 w-[104px]">tools</span>
          {!withTools && <span className="text-white/50 text-[15px]">none this time</span>}
          {withTools &&
            (tools.length > 4 ? (
              <span className="text-white/85">🧰 {tools.length} tool cards</span>
            ) : (
              tools.map((t) => (
                <span key={t.name} className="font-mono text-[15px]" style={{ color: t.color }}>
                  {t.name}
                </span>
              ))
            ))}
        </div>
        {scene.model.toolChoice && (scene.phase === 'setup' || withTools) && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-white/55 w-[104px]">tool_choice</span>
            <span className="font-mono text-[#ce9178]">&quot;auto&quot;</span>
          </div>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Order slips (tool calls)
// ---------------------------------------------------------------------------
function Slip({ scene, call, index, total }: { scene: AgentScene; call: AgentCall; index: number; total: number }) {
  const color = idColor(scene.model, call.id);
  return (
    <motion.div
      initial={{ opacity: 0, x: -30, rotate: -2 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{
        type: 'spring',
        damping: 16,
        stiffness: 120,
        delay: index * 0.15,
      }}
      className="w-full"
    >
      <Card color={SLIP} label={<>🧾 order slip{total > 1 ? ` ${index + 1}` : ''}</>}>
        <div className="font-mono text-[17px] space-y-1.5">
          <div>
            <span className="text-white/50">name: </span>
            <span className="text-[#ce9178]">&quot;{call.name}&quot;</span>
          </div>
          <div className="break-words">
            <span className="text-white/50">arguments: </span>
            {total > 1 && <br />}
            <span className="text-[#ce9178]">&apos;{truncate(argsJson(call.args), total > 1 ? 34 : 60)}&apos;</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/50">id:</span> <IdChip id={call.id} color={color} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/** One line for the slip once our code is working on it. */
function SlipLine({ scene, call, pulse = false }: { scene: AgentScene; call: AgentCall; pulse?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap text-[14px] text-white/60">
      <span>🧾</span>
      <IdChip id={call.id} color={idColor(scene.model, call.id)} pulse={pulse} />
      <span className="font-mono text-white/75">{truncate(argsCall(call.name, call.args), 50)}</span>
    </div>
  );
}

/** Other calls of the same turn (parallel tool calls), as quiet chips. */
function OtherCalls({ scene, turn }: { scene: AgentScene; turn: AgentTurn }) {
  if (turn.calls.length < 2) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {turn.calls.map((c, i) =>
        c === scene.call ? null : (
          <DoneChip key={c.id} color={c.returnStep <= scene.step ? '#86efac' : 'rgba(255,255,255,0.55)'}>
            🧾 {i + 1} · {truncate(argsCall(c.name, c.args), 28)}
            {c.returnStep <= scene.step ? ` = ${truncate(unescape(unquote(c.result)), 16)} ✓` : ' · next'}
          </DoneChip>
        ),
      )}
    </div>
  );
}

function SelectFocal({ scene, call, tools }: { scene: AgentScene; call: AgentCall; tools: ToolCard[] }) {
  const s = scene.step;
  const vars = scene.vars;
  // After the slip is read, a step that sets nothing new is our code picking the function:
  // with a name → function dictionary (available_functions[...]) or with an if / elif chain.
  const picking = call.argsStep < s && scene.newVars.size === 0 && !scene.output.trim();
  // The dictionary is being built / explained while this request is read: show the dictionary itself.
  const showMap =
    scene.newVars.has('available_functions') ||
    (picking &&
      Number.isFinite(scene.model.mapStep) &&
      scene.model.mapStep >= Math.min(call.slipStep, call.nameStep) &&
      !('function_to_call' in vars));
  const lookup = !showMap && (scene.newVars.has('function_to_call') || (picking && 'available_functions' in vars));
  const branchIdx = picking && !('available_functions' in vars) ? s - call.argsStep - 1 : -1;
  const chosenAt = tools.findIndex((t) => t.name === call.name);
  const branches = branchIdx >= 0 ? tools.slice(0, Math.min(branchIdx, Math.max(chosenAt, 0)) + 1) : [];
  // Each line of the slip-reading code appears on the step that runs it, lit up on that step.
  const slipShown = call.slipStep <= s;
  const nameShown = call.nameStep <= s || call.argsStep <= s;
  const argsShown = call.argsStep <= s;
  const slipNow = call.slipStep === s && call.nameStep !== s && !lookup;
  const nameNow = call.nameStep === s && !lookup;
  const argsNow = call.argsStep === s && !lookup;
  const nameVar = 'tool_name' in vars && !('function_name' in vars) ? 'tool_name' : 'function_name';
  const argsVar = 'args' in vars && !('arguments' in vars) ? 'args' : 'arguments';
  const anyRow = slipShown || nameShown || lookup;
  if (showMap) {
    return (
      <div className="w-full max-w-[640px] flex flex-col items-center gap-3">
        <SlipLine scene={scene} call={call} />
        <MapCard tools={tools} hot={call.name} />
      </div>
    );
  }
  return (
    <div className="w-full max-w-[640px] flex flex-col gap-3">
      <SlipLine scene={scene} call={call} pulse={slipNow} />
      {anyRow && (
        <Card color="#60a5fa" label="🔎 your code reads the slip">
          <div className="font-mono text-[18px] space-y-1.5 break-words">
            {slipShown && (
              <Hl on={slipNow}>
                <span className="text-[#9cdcfe]">tool_call</span> ={' '}
                <IdChip id={call.id} color={idColor(scene.model, call.id)} />
              </Hl>
            )}
            {nameShown && (
              <Hl on={nameNow}>
                <span className="text-[#9cdcfe]">{nameVar}</span> ={' '}
                <span className="text-[#ce9178]">&quot;{call.name}&quot;</span>
              </Hl>
            )}
            {argsShown && (
              <Hl on={argsNow}>
                <span className="text-[#9cdcfe]">{argsVar}</span> = {'{'}
                {call.args.map(([k, v], i) => (
                  <span key={k}>
                    {i > 0 && ', '}
                    <span className="text-[#ce9178]">&apos;{k}&apos;</span>: {truncate(v, 28)}
                  </span>
                ))}
                {'}'}
                {argsNow && (
                  <span className="ml-2 font-sans text-[14px] text-white/55 whitespace-nowrap">json.loads → dict</span>
                )}
              </Hl>
            )}
            {branches.map((t, i) => {
              const hit = t.name === call.name;
              return (
                <Hl key={t.name} on={i === branches.length - 1}>
                  <span className="text-[#c586c0]">{i === 0 ? 'if' : 'elif'}</span>{' '}
                  <span className="text-[#9cdcfe]">{nameVar}</span> =={' '}
                  <span className="text-[#ce9178]">&quot;{t.name}&quot;</span>
                  <span className={`ml-3 font-sans text-[15px] font-semibold ${hit ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                    {hit ? `✓ True → run ${t.name}` : '✗ False → skip'}
                  </span>
                </Hl>
              );
            })}
            {lookup && (
              <Hl on>
                <span className="whitespace-nowrap">
                  <span className="text-[#9cdcfe]">available_functions</span>[
                  <span className="text-[#ce9178]">&quot;{call.name}&quot;</span>]
                </span>{' '}
                <span className="whitespace-nowrap">
                  → <span className="text-[#4ade80]">{call.name}</span>
                </span>
              </Hl>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function ExecuteFocal({ scene, call, showTerminal }: { scene: AgentScene; call: AgentCall; showTerminal: boolean }) {
  const done = call.resultStep <= scene.step;
  const executing = scene.phase === 'execute';
  if (showTerminal) {
    const badge = safetyFor(call.name);
    return (
      <div className="w-full max-h-full flex flex-col gap-3 min-h-0">
        <div className="flex items-center justify-center gap-3 flex-wrap flex-shrink-0">
          <span className="font-mono text-[17px] text-white">{truncate(argsCall(call.name, call.args), 48)}</span>
          {badge.text && (
            <span
              className="text-[14px] font-semibold px-3 py-1 rounded-full"
              style={{
                color: badge.color,
                backgroundColor: `${badge.color}1a`,
              }}
            >
              {badge.text}
            </span>
          )}
        </div>
        <div className="w-full min-h-0 flex flex-col">
          <TerminalToolExec scene={scene} showBadge={false} />
        </div>
      </div>
    );
  }
  return (
    <Card color={PY} label="⚙️ your Python runs the real function" className="max-w-[680px]">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="font-mono text-[22px] text-white break-all">{argsCall(call.name, call.args)}</span>
        <motion.span
          animate={{ x: executing && !done ? [0, 6, 0] : 0 }}
          transition={{
            duration: 0.8,
            repeat: executing && !done ? Infinity : 0,
          }}
          className="text-[22px] text-white/50"
        >
          →
        </motion.span>
        {done ? (
          <motion.span
            key={`res-${call.id}`}
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-3 py-0.5 rounded-lg bg-[#4ade80]/20 text-[#4ade80] font-mono font-bold text-[22px] break-words"
          >
            {truncate(unescape(unquote(call.result)), 70)}
          </motion.span>
        ) : (
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-[18px] text-white/55"
          >
            running…
          </motion.span>
        )}
      </div>
    </Card>
  );
}

function ReturnFocal({ scene, call }: { scene: AgentScene; call: AgentCall }) {
  const color = idColor(scene.model, call.id);
  return (
    <div className="w-full max-w-[640px] flex flex-col gap-3">
      <SlipLine scene={scene} call={call} pulse />
      <Card color={PY} label={<>📦 new message: role &quot;tool&quot;</>}>
        <div className="font-mono text-[17px] space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/50">tool_call_id:</span>
            <IdChip id={call.id} color={color} pulse />
            <span className="font-sans text-[15px]" style={{ color }}>
              = same id as the slip ✓
            </span>
          </div>
          <div className="break-words">
            <span className="text-white/50">content: </span>
            <span className="text-[#ce9178]">&quot;{truncate(unescape(unquote(call.result)), 80)}&quot;</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The AI's text reply / final answer
// ---------------------------------------------------------------------------
function AnswerFocal({
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
  const check = scene.phase === 'check';
  const exited = scene.phase === 'done' && unquote(scene.vars.user_input) === 'exit';
  const card = (
    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="w-full">
      <Card color="#4ade80" label="💬 the AI's answer">
        <div className={`${showTerminal ? 'text-[17px]' : 'text-[20px]'} leading-snug text-white`}>
          <Typewriter text={turn.answer ?? ''} animate={scene.phase === 'decide' || scene.phase === 'answer'} />
        </div>
      </Card>
    </motion.div>
  );

  if (showTerminal) {
    return (
      <div className="w-full max-h-full flex flex-col gap-3 min-h-0">
        {check ? (
          <div className="flex justify-center flex-shrink-0">
            <Badge ok={false} text={`tool_calls? NO → ${loop ? 'break' : 'answer'}`} pulse />
          </div>
        ) : exited ? (
          <div className="flex justify-center flex-shrink-0">
            <DoneChip color="#f9a8d4">
              {scene.outputsSoFar.some((o) => /goodbye/i.test(o.text)) ? '👋 exit → Goodbye!' : '👋 the user typed exit'}
            </DoneChip>
          </div>
        ) : null}
        {!exited && <div className="flex-shrink-0">{card}</div>}
        <motion.div animate={{ opacity: exited ? 1 : 0.6 }} className="w-full min-h-0 flex flex-col">
          <TerminalToolExec scene={scene} maxLines={exited ? 12 : 6} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[680px] flex flex-col items-center gap-3">
      {check && <Badge ok={false} text={`tool_calls? NO → ${loop ? 'break' : 'answer'}`} pulse />}
      {card}
      {earlier.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-1.5">
          {earlier.map((c) => (
            <DoneChip key={c.id} color="#86efac">
              ✓ {truncate(argsCall(c.name, c.args), 44)} = {truncate(unescape(unquote(c.result)), 24)}
            </DoneChip>
          ))}
        </div>
      ) : (
        !usedTools(scene) && <DoneChip>no tool used</DoneChip>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// What the AI "thinks" while it has no tool to pick
// ---------------------------------------------------------------------------
function ThinkBubble({ scene, accentColor }: { scene: AgentScene; accentColor: string }) {
  const t = scene.turn;
  const text = scene.model.turns.some((x) => x.n < (t?.n ?? 0) && x.calls.length)
    ? 'The results are in. I can write the answer now.'
    : 'No tool on the menu helps here. I know this one!';
  return (
    <div
      className="max-w-[560px] rounded-2xl border px-5 py-4 text-[19px] leading-snug text-white/90"
      style={{
        borderColor: `${accentColor}88`,
        backgroundColor: `${accentColor}14`,
      }}
    >
      💭 {text}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function AgentDataFlow({
  scene,
  tools,
  accentColor,
  loop,
  showTerminal,
  collapsed = false,
}: AgentDataFlowProps) {
  const t = scene.turn;
  const phase = scene.phase;
  const hasCalls = !!t?.calls.length;
  const call = scene.call;

  const strip = <ActorStrip scene={scene} accentColor={accentColor} />;
  if (collapsed) return strip;

  const earlierNames = scene.model.turns
    .filter((x) => t && x.n < t.n && x.decideStep <= scene.step)
    .flatMap((x) => x.calls.map((c) => c.name));

  let focal: ReactNode;
  let top: ReactNode = null;

  if (phase === 'setup' || !t) {
    focal = <SetupFocal scene={scene} tools={tools} accentColor={accentColor} loop={loop} />;
    top = <SetupTrail scene={scene} tools={tools} />;
  } else if (phase === 'send') {
    focal = <EnvelopeFocal scene={scene} tools={tools} loop={loop} />;
  } else if (phase === 'thinking') {
    focal = hasCalls ? (
      <ToolSelectionAnim
        tools={tools}
        mode={'scanning' as MenuMode}
        chosen={t.calls.map((c) => c.name)}
        usedBefore={earlierNames}
        filledArgs={Object.fromEntries(t.calls.map((c) => [c.name, c.args]))}
        accentColor={accentColor}
        animKey={`${scene.step}`}
      />
    ) : (
      <ThinkBubble scene={scene} accentColor={accentColor} />
    );
  } else if (hasCalls && (phase === 'decide' || phase === 'check')) {
    focal = (
      <div
        className={`w-full ${t.calls.length > 1 ? 'max-w-[760px]' : 'max-w-[640px]'} flex flex-col items-center gap-3`}
      >
        <div className={`w-full flex gap-3 ${t.calls.length > 1 ? '' : 'flex-col'}`}>
          {t.calls.map((c, i) => (
            <Slip key={c.id} scene={scene} call={c} index={i} total={t.calls.length} />
          ))}
        </div>
        {phase === 'check' && <Badge ok text="tool_calls? YES → run" pulse />}
      </div>
    );
  } else if (hasCalls && call && phase === 'select') {
    focal = <SelectFocal scene={scene} call={call} tools={tools} />;
    top = <OtherCalls scene={scene} turn={t} />;
  } else if (hasCalls && call && phase === 'execute') {
    focal = <ExecuteFocal scene={scene} call={call} showTerminal={showTerminal} />;
    top = <OtherCalls scene={scene} turn={t} />;
  } else if (hasCalls && call && phase === 'return') {
    focal = <ReturnFocal scene={scene} call={call} />;
    top = <OtherCalls scene={scene} turn={t} />;
  } else if (hasCalls && phase === 'loopback') {
    focal = (
      <div className="flex flex-col items-center gap-4">
        <Card color="#f472b6" className="max-w-[520px]">
          <CodeLine code="while True:" tag={`→ turn ${t.n + 1}`} color="#f9a8d4" />
        </Card>
        <div className="flex flex-wrap justify-center gap-1.5">
          {t.calls.map((c) => (
            <DoneChip key={c.id} color="#86efac">
              ✓ {truncate(argsCall(c.name, c.args), 44)} = {truncate(unescape(unquote(c.result)), 24)}
            </DoneChip>
          ))}
        </div>
      </div>
    );
  } else {
    const answerTurn = [...scene.model.turns].reverse().find((x) => x.answerStep <= scene.step) ?? t;
    focal = <AnswerFocal scene={scene} turn={answerTurn} loop={loop} showTerminal={showTerminal} />;
  }

  // A print() on this step (outside setup, which has its own console focal): show the console line,
  // unless the focal already shows the terminal (terminal lessons, while running / answering).
  const terminalShown = showTerminal && ['execute', 'answer', 'done'].includes(phase);
  let printed = phase !== 'setup' && t && !terminalShown ? scene.output.trim() : '';
  // Printing the answer that is already on screen: don't repeat it, point at it.
  const shownAnswer = (phase === 'answer' || phase === 'done' || phase === 'check') && !showTerminal
    ? ([...scene.model.turns].reverse().find((x) => x.answerStep <= scene.step)?.answer ?? '').trim()
    : '';
  if (printed && shownAnswer && printed.includes(shownAnswer)) {
    printed = `${printed.replace(shownAnswer, '').trim()} ⬆ the answer`.trim();
  }

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {strip}
      {top && <div className="flex-shrink-0">{top}</div>}
      <motion.div
        key={`focal-${phase}-${scene.focus}-${scene.turnIdx}-${scene.callIdx}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 overflow-hidden"
      >
        {focal}
        {printed && <ConsoleLine text={truncate(printed, 160)} />}
      </motion.div>
    </div>
  );
}
