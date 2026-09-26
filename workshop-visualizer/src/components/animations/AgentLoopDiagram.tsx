'use client';
/**
 * AgentLoopDiagram — the shared "agent loop" model plus the loop counter strip.
 *
 * The model is computed from the WHOLE trace (every step's trigger + variables), and every
 * piece of data carries the step index at which it becomes visible. The scene for step N is
 * then a pure function of (trace, N), so Prev / Next / Reset / jumping all render correctly.
 */
import { motion } from 'framer-motion';
import type { TraceStep } from '@/stores/tracerStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type AgentPhase =
  | 'setup'
  | 'send'
  | 'thinking'
  | 'decide'
  | 'check'
  | 'select'
  | 'execute'
  | 'return'
  | 'loopback'
  | 'answer'
  | 'done';

export type SetupFocus =
  | 'intro'
  | 'import'
  | 'client'
  | 'functions'
  | 'menu'
  | 'menu-name'
  | 'menu-desc'
  | 'menu-params'
  | 'map'
  | 'system'
  | 'question'
  | 'envelope'
  | 'loop'
  | 'console';

export interface AgentCall {
  id: string;
  name: string;
  args: [string, string][];
  result?: string;
  decideStep: number;
  selectStep: number;
  argsStep: number;
  execStep: number;
  resultStep: number;
  returnStep: number;
}

export interface AgentTurn {
  n: number; // 1-based
  sendStep: number;
  decideStep: number;
  calls: AgentCall[];
  answer?: string;
  answerStep: number;
}

interface StepInfo {
  phase: AgentPhase;
  turn: number; // index into turns, -1 before the first request
  call: number; // index into turns[turn].calls, -1 if none yet
  focus: SetupFocus;
}

export interface AgentModel {
  turns: AgentTurn[];
  info: StepInfo[];
  question: string;
  allIds: string[];
}

export type ConvMsg =
  | { role: 'system'; text: string }
  | { role: 'user'; text: string }
  | { role: 'assistant'; text?: string; calls?: AgentCall[] }
  | { role: 'tool'; id: string; name: string; text: string };

export interface ToolCard {
  name: string;
  icon: string;
  color: string;
  description?: string;
  params?: string[];
}

export interface AgentScene {
  step: number;
  trigger: string;
  phase: AgentPhase;
  focus: SetupFocus;
  model: AgentModel;
  turnIdx: number;
  callIdx: number;
  turn?: AgentTurn;
  call?: AgentCall;
  vars: Record<string, string>;
  newVars: Set<string>;
  question: string;
  systemPrompt: string;
  conversation: ConvMsg[]; // the full conversation of the whole run
  msgCount: number; // how many of them are in `messages` right now
  prevMsgCount: number;
  output: string;
  outputsSoFar: { step: number; text: string }[];
  importDone: boolean;
  loopSeen: boolean;
}

const NEVER = Number.POSITIVE_INFINITY;

// ---------------------------------------------------------------------------
// Small parsing helpers
// ---------------------------------------------------------------------------
export function unquote(v: string | undefined): string {
  if (!v) return '';
  const t = v.trim();
  if (t.length >= 2 && ((t[0] === '"' && t.endsWith('"')) || (t[0] === "'" && t.endsWith("'")))) {
    return t.slice(1, -1);
  }
  return t;
}

/** Turn the literal two characters "\n" into real new lines. */
export function unescape(v: string): string {
  return v.replace(/\\n/g, '\n').replace(/\\"/g, '"');
}

/** Index of the bracket that closes the one at `open`, honouring quotes. */
function matchBracket(s: string, open: number): number {
  const pairs: Record<string, string> = { '[': ']', '{': '}', '(': ')' };
  const stack: string[] = [];
  let quote = '';
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (pairs[c]) stack.push(pairs[c]);
    else if (c === stack[stack.length - 1]) {
      stack.pop();
      if (stack.length === 0) return i;
    }
  }
  return s.length - 1;
}

/** Number of top-level items in a list literal like "[system, {…}, tool("…")]". */
export function countTopLevel(list: string | undefined): number {
  if (!list) return 0;
  const s = list.trim();
  if (!s.startsWith('[')) return 0;
  const end = matchBracket(s, 0);
  const inner = s.slice(1, end).trim();
  if (!inner) return 0;
  let depth = 0;
  let quote = '';
  let count = 1;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if ('[{('.includes(c)) depth++;
    else if (']})'.includes(c)) depth--;
    else if (c === ',' && depth === 0) count++;
  }
  return count;
}

/** Parse a dict literal ({'a': 45} or {"query": "x"}) into [key, value] pairs. */
export function parseArgs(v: string | undefined): [string, string][] {
  if (!v) return [];
  const out: [string, string][] = [];
  const re = /['"]([\w.]+)['"]\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^,}]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(v))) {
    let val = m[2].trim();
    if (val.startsWith("'")) val = `"${val.slice(1, -1)}"`;
    out.push([m[1], val]);
  }
  return out;
}

export function argsJson(args: [string, string][]): string {
  return `{${args.map(([k, v]) => `"${k}": ${v}`).join(', ')}}`;
}

export function argsCall(name: string, args: [string, string][]): string {
  return `${name}(${args.map(([k, v]) => `${k}=${v}`).join(', ')})`;
}

interface ParsedReply {
  calls: { name: string; id?: string }[];
  content?: string;
}

function parseReply(v: string): ParsedReply {
  const res: ParsedReply = { calls: [] };
  const cm = v.match(/content[:=]\s*"((?:[^"\\]|\\.)*)"/);
  if (cm) res.content = cm[1];
  const k = v.indexOf('tool_calls');
  if (k >= 0) {
    let i = k + 'tool_calls'.length;
    while (i < v.length && /[\s:=]/.test(v[i])) i++;
    if (v[i] === '[') {
      const seg = v.slice(i + 1, matchBracket(v, i));
      if (/name[:=]\s*"/.test(seg)) {
        const names = Array.from(seg.matchAll(/name[:=]\s*"(\w+)"/g)).map((m) => m[1]);
        const ids = Array.from(seg.matchAll(/id[:=]\s*"([^"]+)"/g)).map((m) => m[1]);
        res.calls = names.map((name, j) => ({ name, id: ids[j] }));
      } else {
        // form: [multiply(50, 2), add(9, 4)] — only names at depth 0
        let depth = 0;
        let quote = '';
        let word = '';
        for (let j = 0; j < seg.length; j++) {
          const c = seg[j];
          if (quote) {
            if (c === quote) quote = '';
            continue;
          }
          if (c === '"' || c === "'") {
            quote = c;
            word = '';
          } else if (c === '(') {
            if (depth === 0 && word) res.calls.push({ name: word });
            depth++;
            word = '';
          } else if (c === ')') depth--;
          else if (/\w/.test(c)) word += c;
          else word = '';
        }
      }
    }
  }
  return res;
}

// ---------------------------------------------------------------------------
// Phase of one step, from its trigger
// ---------------------------------------------------------------------------
function triggerPhase(t: string): AgentPhase | 'hold' | null {
  if (!t) return null;
  if (t === 'chatLoop' || t === 'agentLoop-enter') return null;
  if (t.startsWith('agentLoop-send')) return 'send';
  if (t === 'apiProcessing') return 'thinking';
  if (t === 'agentLoop-decide') return 'decide';
  if (t === 'agentLoop-check') return 'check';
  if (t.startsWith('toolSelect')) return 'select';
  if (t === 'agentLoop-execute') return 'execute';
  if (t === 'agentLoop-return') return 'return';
  if (t === 'agentLoop-loopback') return 'loopback';
  if (t === 'agentLoop-hold') return 'hold';
  if (t === 'agentLoop-finalDone') return 'done';
  if (t.includes('final')) return 'answer';
  return 'setup';
}

function varsOf(step: TraceStep | undefined): Record<string, string> {
  const o: Record<string, string> = {};
  for (const v of step?.variables ?? []) o[v.name] = v.value;
  return o;
}

function newVarsOf(step: TraceStep | undefined): Set<string> {
  return new Set((step?.variables ?? []).filter((v) => v.isNew || v.isChanged).map((v) => v.name));
}

function questionFrom(vars: Record<string, string>): string {
  const m = vars.messages?.match(/role:"user", content:"((?:[^"\\]|\\.)*)"/);
  if (m) return m[1];
  if (vars.user_query) return unquote(vars.user_query);
  if (vars.user_input && unquote(vars.user_input) !== 'exit') return unquote(vars.user_input);
  return '';
}

// ---------------------------------------------------------------------------
// Build the model for a whole trace
// ---------------------------------------------------------------------------
export function buildAgentModel(steps: TraceStep[], toolNames: string[]): AgentModel {
  const turns: AgentTurn[] = [];
  const info: StepInfo[] = [];
  let cur = -1;
  let ptr = -1;
  let prev: Record<string, string> = {};
  let lastPhase: AgentPhase = 'setup';
  let question = '';

  steps.forEach((step, i) => {
    const vars = varsOf(step);
    const fresh = newVarsOf(step);
    const t = step.animationTrigger ?? '';
    const changed = (n: string) => n in vars && (prev[n] !== vars[n] || fresh.has(n));
    if (!question) question = questionFrom(vars);

    if (t.startsWith('agentLoop-send')) {
      turns.push({ n: turns.length + 1, sendStep: i, decideStep: NEVER, calls: [], answerStep: NEVER });
      cur = turns.length - 1;
      ptr = -1;
    }
    const turn = cur >= 0 ? turns[cur] : undefined;

    for (const rn of ['message', 'assistant_message']) {
      if (turn && changed(rn)) {
        const p = parseReply(vars[rn]);
        if (p.calls.length) {
          if (turn.calls.length === 0) {
            turn.calls = p.calls.map((c) => ({
              id: c.id ?? '',
              name: c.name,
              args: [],
              decideStep: i,
              selectStep: NEVER,
              argsStep: NEVER,
              execStep: NEVER,
              resultStep: NEVER,
              returnStep: NEVER,
            }));
          }
          turn.decideStep = Math.min(turn.decideStep, i);
        } else if (p.content !== undefined) {
          if (turn.answer === undefined) turn.answer = p.content;
          turn.decideStep = Math.min(turn.decideStep, i);
          turn.answerStep = Math.min(turn.answerStep, i);
        }
      }
    }

    if (turn && turn.calls.length) {
      const calls = turn.calls;
      const nameVar = vars.function_name ?? vars.tool_name;
      if (changed('tool_call')) {
        ptr = Math.min(ptr + 1, calls.length - 1);
        const idm = vars.tool_call.match(/id[:=]\s*"([^"]+)"/);
        if (idm) calls[ptr].id = idm[1];
        calls[ptr].selectStep = Math.min(calls[ptr].selectStep, i);
      }
      if ((changed('function_name') || changed('tool_name')) && nameVar) {
        const nm = unquote(nameVar);
        if (ptr < 0) ptr = 0;
        if (calls[ptr].name !== nm) {
          const j = calls.findIndex((c, k) => k >= ptr && c.name === nm);
          if (j >= 0) ptr = j;
        }
        calls[ptr].selectStep = Math.min(calls[ptr].selectStep, i);
      }
      if (t.startsWith('toolSelect-') && ptr < 0) {
        const j = calls.findIndex((c) => c.name === t.slice('toolSelect-'.length));
        ptr = j >= 0 ? j : 0;
      }
      if (changed('arguments') || changed('args')) {
        if (ptr < 0) ptr = 0;
        calls[ptr].args = parseArgs(vars.arguments ?? vars.args);
        calls[ptr].argsStep = Math.min(calls[ptr].argsStep, i);
      }
      if (t === 'agentLoop-execute' && ptr >= 0) calls[ptr].execStep = Math.min(calls[ptr].execStep, i);
      if (changed('result') && ptr >= 0) {
        calls[ptr].result = vars.result;
        calls[ptr].resultStep = Math.min(calls[ptr].resultStep, i);
        calls[ptr].execStep = Math.min(calls[ptr].execStep, i);
      }
      if (t === 'agentLoop-return' && ptr >= 0) calls[ptr].returnStep = Math.min(calls[ptr].returnStep, i);
    }

    if (turn && (changed('final_answer') || changed('message.content'))) {
      turn.answer = unquote(vars.final_answer ?? vars['message.content']);
      turn.answerStep = Math.min(turn.answerStep, i);
      turn.decideStep = Math.min(turn.decideStep, i);
    }

    // ---- phase ----
    let phase: AgentPhase;
    const tp = triggerPhase(t);
    const answered = turns.some((tt) => tt.answerStep <= i);
    if (tp === null) phase = cur < 0 ? 'setup' : answered ? 'done' : lastPhase;
    else if (tp === 'hold') phase = cur < 0 ? 'setup' : lastPhase;
    else phase = tp;
    lastPhase = phase;

    // ---- setup focus ----
    let focus: SetupFocus = 'intro';
    const newFn = toolNames.some((n) => fresh.has(n));
    if (t === 'import') focus = 'import';
    else if (t === 'chatLoop' || t === 'agentLoop-enter') focus = 'loop';
    else if (t === 'agentLoop-pack') focus = 'envelope';
    else if (t.startsWith('defineTools-')) focus = `menu-${t.slice('defineTools-'.length)}` as SetupFocus;
    else if (fresh.has('available_functions')) focus = 'map';
    else if (fresh.has('tools')) focus = 'menu';
    else if (newFn) focus = 'functions';
    else if (fresh.has('system_prompt') || t === 'addSystemMsg') focus = 'system';
    else if (fresh.has('messages') || fresh.has('user_query') || fresh.has('user_input')) focus = 'question';
    else if (fresh.has('client')) focus = 'client';
    else if (t === 'defineTools') focus = 'menu';
    else if (step.output) focus = 'console';

    info.push({ phase, turn: cur, call: ptr, focus });
    prev = vars;
  });

  // ids that were never seen get a readable placeholder
  turns.forEach((tt) =>
    tt.calls.forEach((c, j) => {
      if (!c.id) c.id = `call_${tt.n}${String.fromCharCode(97 + j)}`;
    }),
  );
  const allIds = turns.flatMap((tt) => tt.calls.map((c) => c.id));
  return { turns, info, question, allIds };
}

// ---------------------------------------------------------------------------
// Scene for one step
// ---------------------------------------------------------------------------
export function sceneAt(model: AgentModel, steps: TraceStep[], s: number): AgentScene {
  const step = steps[s];
  const vars = varsOf(step);
  const inf = model.info[s] ?? { phase: 'setup', turn: -1, call: -1, focus: 'intro' };
  const turn = inf.turn >= 0 ? model.turns[inf.turn] : undefined;
  const call = turn && inf.call >= 0 ? turn.calls[inf.call] : undefined;

  const hasSystem = steps.some((st) => /^\[\s*system/.test(varsOf(st).messages ?? ''));
  const sysVar = vars.system_prompt ?? steps.map((st) => varsOf(st).system_prompt).find(Boolean);
  const mfSystem = hasSystem && !sysVar ? 'You are a friendly math tutor. Use tools to solve problems.' : '';
  const systemPrompt = unquote(sysVar ?? '') || mfSystem;

  const conversation: ConvMsg[] = [];
  if (hasSystem) conversation.push({ role: 'system', text: systemPrompt || 'system prompt' });
  conversation.push({ role: 'user', text: model.question });
  for (const tt of model.turns) {
    if (tt.calls.length) {
      conversation.push({ role: 'assistant', calls: tt.calls });
      for (const c of tt.calls) conversation.push({ role: 'tool', id: c.id, name: c.name, text: c.result ?? '' });
    } else if (tt.answer !== undefined) {
      conversation.push({ role: 'assistant', text: tt.answer });
    }
  }

  const outputsSoFar: { step: number; text: string }[] = [];
  let importDone = false;
  let loopSeen = false;
  for (let i = 0; i <= s && i < steps.length; i++) {
    const tr = steps[i].animationTrigger;
    if (steps[i].output) outputsSoFar.push({ step: i, text: steps[i].output });
    if (tr === 'import') importDone = true;
    if (tr === 'chatLoop' || tr === 'agentLoop-enter') loopSeen = true;
  }

  return {
    step: s,
    trigger: step?.animationTrigger ?? '',
    phase: inf.phase,
    focus: inf.focus,
    model,
    turnIdx: inf.turn,
    callIdx: inf.call,
    turn,
    call,
    vars,
    newVars: newVarsOf(step),
    question: questionFrom(vars),
    systemPrompt,
    conversation,
    msgCount: countTopLevel(vars.messages),
    prevMsgCount: s > 0 ? countTopLevel(varsOf(steps[s - 1]).messages) : 0,
    output: step?.output ?? '',
    outputsSoFar,
    importDone,
    loopSeen,
  };
}

// ---------------------------------------------------------------------------
// Shared visual helpers
// ---------------------------------------------------------------------------
const ID_COLORS = ['#f472b6', '#22d3ee', '#fbbf24', '#4ade80', '#a78bfa', '#fb923c'];

export function idColor(model: AgentModel, id: string): string {
  const i = model.allIds.indexOf(id);
  return ID_COLORS[(i < 0 ? 0 : i) % ID_COLORS.length];
}

export function IdChip({ id, color, pulse = false }: { id: string; color: string; pulse?: boolean }) {
  return (
    <motion.span
      className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded font-mono text-[12px] font-semibold whitespace-nowrap"
      style={{ color, backgroundColor: `${color}1f`, border: `1px solid ${color}66` }}
      animate={pulse ? { boxShadow: [`0 0 0px ${color}00`, `0 0 12px ${color}aa`, `0 0 0px ${color}00`] } : { boxShadow: 'none' }}
      transition={pulse ? { duration: 1.4, repeat: Infinity } : { duration: 0.2 }}
    >
      🔗 {id}
    </motion.span>
  );
}

export function truncate(s: string, n: number): string {
  const one = s.replace(/\s+/g, ' ').trim();
  return one.length > n ? one.slice(0, n - 1) + '…' : one;
}

// ---------------------------------------------------------------------------
// Status sentence (plain words) for the current step
// ---------------------------------------------------------------------------
export function statusText(sc: AgentScene, loop: boolean): { icon: string; text: string } {
  const t = sc.turn;
  const c = sc.call;
  const callsTxt = t?.calls.map((x) => x.name).join(' + ') ?? '';
  switch (sc.phase) {
    case 'setup': {
      const m: Record<SetupFocus, [string, string]> = {
        intro: ['🧰', 'Getting ready: first we set up the tools and the chat history'],
        import: ['📦', 'Importing what we need (json reads the AI\'s arguments)'],
        client: ['🔌', 'Creating the client: our line to the AI'],
        functions: ['🐍', 'Writing real Python functions: only OUR code can run them'],
        menu: ['📋', 'Writing the tool menu (tools): what the AI is allowed to ask for'],
        'menu-name': ['🏷️', 'Each menu card has a name: the AI will send this exact name back'],
        'menu-desc': ['📝', 'The description tells the AI WHEN a tool is useful'],
        'menu-params': ['🔢', 'The parameters are the inputs the AI must fill in'],
        map: ['🗂️', 'A dictionary maps each tool name (text) to the real function'],
        system: ['⚙️', 'The system prompt gives the AI its role'],
        question: ['👤', `The question goes into messages: "${truncate(sc.question || sc.model.question, 60)}"`],
        envelope: ['📨', 'Packing the request: messages + tools + tool_choice'],
        loop: ['🔁', 'Entering a while True loop: it repeats until a break'],
        console: ['🖨️', 'Printing to the console'],
      };
      const [icon, text] = m[sc.focus];
      return { icon, text };
    }
    case 'send':
      return {
        icon: '📨',
        text: `${loop ? `Loop turn ${t?.n}` : `AI call #${t?.n}`}: your code sends messages (${sc.msgCount}) + the tool menu to the AI`,
      };
    case 'thinking':
      return t?.calls.length
        ? { icon: '🤔', text: `The AI reads the menu and picks: ${callsTxt}` }
        : { icon: '🤔', text: 'The AI has what it needs: no tool this time, it writes the answer' };
    case 'decide':
      return t?.calls.length
        ? { icon: '🧾', text: `The AI's reply is an order slip: "please run ${callsTxt}" (no text yet)` }
        : { icon: '💬', text: 'The AI\'s reply is plain text: tool_calls is None' };
    case 'check':
      return t?.calls.length
        ? { icon: '❓', text: 'Any tool_calls? YES → run the tools (no break)' }
        : { icon: '❓', text: `Any tool_calls? NO → ${loop ? 'this is the final answer → break' : 'skip to the answer'}` };
    case 'select':
      return c
        ? {
            icon: '🔎',
            text: `Your code reads the slip: name "${c.name}"${c.argsStep <= sc.step ? `, arguments ${argsJson(c.args)}` : ''}`,
          }
        : { icon: '🔎', text: 'Your code reads the order slip' };
    case 'execute':
      return c
        ? {
            icon: '⚙️',
            text:
              c.resultStep <= sc.step
                ? `Your Python runs ${argsCall(c.name, c.args)} → ${truncate(unescape(unquote(c.result)), 40)}`
                : `Your Python runs ${argsCall(c.name, c.args)}…`,
          }
        : { icon: '⚙️', text: 'Your Python code runs the function' };
    case 'return':
      return { icon: '📦', text: `The result goes back as role "tool" with the SAME id: ${c?.id ?? ''}` };
    case 'loopback':
      return { icon: '🔁', text: `Back to the top of while True → turn ${(t?.n ?? 0) + 1}` };
    case 'answer':
      return { icon: '💬', text: loop ? 'No tool_calls → final answer → break out of the loop' : 'The AI\'s final answer (written from the real result)' };
    case 'done':
      if (unquote(sc.vars.user_input) === 'exit') return { icon: '👋', text: 'The user typed exit → the chat loop ends: Goodbye!' };
      return { icon: '✅', text: 'Done! The AI chose, your Python did the work, the AI explained' };
  }
}

// ---------------------------------------------------------------------------
// Loop counter strip (the default export)
// ---------------------------------------------------------------------------
export default function AgentLoopDiagram({
  scene,
  agentName,
  accentColor,
  loop,
}: {
  scene: AgentScene;
  agentName: string;
  accentColor: string;
  loop: boolean;
}) {
  const visible = scene.model.turns.filter((t) => t.sendStep <= scene.step);
  const finished = visible.some((t) => t.answerStep <= scene.step) && (scene.phase === 'answer' || scene.phase === 'done');
  const status = statusText(scene, loop);

  return (
    <div className="flex-shrink-0 space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="text-[12px] text-white/40 uppercase tracking-wider font-semibold mr-1">{agentName}</div>
        <div className="flex-1" />
        <span className="text-[12px] text-white/40">{loop ? 'Agent loop:' : 'Calls to the AI:'}</span>
        {visible.length === 0 && (
          <span className="text-[12px] text-white/30 px-2 py-0.5 rounded-full border border-dashed border-white/15">not started</span>
        )}
        {visible.map((t) => {
          const isCur = t.n - 1 === scene.turnIdx && !finished;
          const decided = t.decideStep <= scene.step;
          const label = !decided
            ? '…'
            : t.calls.length
              ? `🔧 ${t.calls.map((c) => c.name).join(' + ')}`
              : '💬 answer';
          return (
            <motion.span
              key={t.n}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: isCur ? [1, 1.06, 1] : 1 }}
              transition={isCur ? { scale: { duration: 1.4, repeat: Infinity } } : { duration: 0.3 }}
              className="text-[12px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap"
              style={{
                color: isCur ? '#fff' : 'rgba(255,255,255,0.6)',
                borderColor: isCur ? accentColor : 'rgba(255,255,255,0.15)',
                backgroundColor: isCur ? `${accentColor}33` : 'rgba(255,255,255,0.04)',
              }}
            >
              {loop ? 'turn' : 'call'} {t.n} · {label}
            </motion.span>
          );
        })}
        {finished && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[12px] font-mono px-2 py-0.5 rounded-full border border-red-400/50 bg-red-400/10 text-red-300 whitespace-nowrap"
          >
            {loop ? 'no tool_calls → break ⏹' : 'done ✓'}
          </motion.span>
        )}
      </div>
      <motion.div
        key={`${scene.step}`}
        initial={{ opacity: 0.4, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] text-white/90"
        style={{ backgroundColor: `${accentColor}14`, border: `1px solid ${accentColor}40` }}
      >
        <span className="text-base leading-none">{status.icon}</span>
        <span className="leading-snug">{status.text}</span>
      </motion.div>
    </div>
  );
}
