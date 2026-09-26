import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';
import { bossAgentCode } from '@/data/code-snippets/part4';

// ===========================================================================
// Lesson 23: Code: The Boss Agent (avinworkshop/part4/3_boss_agent.py)
//
// One builder makes every variant, so line numbers always come from the real
// code text (L('marker')) and the office animation (BossScene) is computed
// step by step alongside the trace.
// ===========================================================================

const CODE_LINES = bossAgentCode.split('\n');

/** 1-based line number of the nth line that contains `marker`. */
function L(marker: string, nth = 1): number {
  let seen = 0;
  for (let i = 0; i < CODE_LINES.length; i++) {
    if (CODE_LINES[i].includes(marker)) {
      seen += 1;
      if (seen === nth) return i + 1;
    }
  }
  throw new Error(`boss-agent trace: marker not found: ${marker} (#${nth})`);
}

// ---------------------------------------------------------------------------
// The office scene the animation draws for each step.
// ---------------------------------------------------------------------------
export type Helper = 'rita' | 'milo';

export type BossPhase =
  | 'intro'
  | 'runAgent'
  | 'helpers'
  | 'tools'
  | 'phonebook'
  | 'bossPrompt'
  | 'inbox'
  | 'notepad'
  | 'loop'
  | 'thinking'
  | 'reply'
  | 'check'
  | 'read'
  | 'send'
  | 'helperLLM'
  | 'noteBack'
  | 'toolMsg'
  | 'final'
  | 'done'
  | 'recap';

export interface OrderSlip {
  id: string; // tool_call.id
  to: Helper;
  fn: string; // tool name
  arg: string; // the one string parameter
  result: string; // what the helper answers
  status: 'new' | 'reading' | 'sent' | 'done';
}

export interface NotepadNote {
  role: 'system' | 'user' | 'assistant' | 'tool';
  text: string;
  id?: string; // tool_call_id for role "tool"
  by?: Helper; // which helper wrote a "tool" note
}

export interface BossScene {
  phase: BossPhase;
  focus: 'none' | 'max' | Helper | 'all';
  request: string;
  turn: number;
  maxCalls: number;
  helperCalls: number;
  notepad: NotepadNote[];
  slips: OrderSlip[]; // the slips in Max's latest reply
  current: number; // index of the slip being handled (-1 = none)
  final: string; // Max's final answer ('' until he writes it)
  say?: string; // Max's speech bubble for this one step (optional)
}

// ---------------------------------------------------------------------------
// Variant config
// ---------------------------------------------------------------------------
interface HelperCall {
  to: Helper;
  arg: string;
  result: string;
}

interface BossRun {
  request: string;
  rounds: HelperCall[][]; // each round = the tool_calls in ONE reply from Max
  final: string;
}

const HELPER_INFO: Record<Helper, { fn: string; param: string; name: string; badge: string }> = {
  rita: { fn: 'ask_researcher', param: 'question', name: 'Rita', badge: '🔍' },
  milo: { fn: 'ask_math_whiz', param: 'problem', name: 'Milo', badge: '🧮' },
};

const clip = (s: string, n = 60) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

interface StepDef {
  line: number;
  set?: Record<string, string>;
  out?: string;
  say: string;
  scene?: (s: BossScene) => void; // mutate the running scene
}

function buildBoss(run: BossRun): { steps: TraceStep[]; scenes: BossScene[] } {
  const defs: StepDef[] = [];
  const add = (d: StepDef) => defs.push(d);
  const phase = (p: BossPhase, focus: BossScene['focus'] = 'none', say?: string) => (s: BossScene) => {
    s.phase = p;
    s.focus = focus;
    if (say) s.say = say;
  };
  const notesLabel = (n: NotepadNote[]) =>
    '[' +
    n
      .map((x) => (x.role === 'tool' ? `tool(${x.id})` : x.role === 'assistant' ? 'assistant' : x.role))
      .join(', ') +
    ']';

  // Track the notepad here too, so the `messages` variable matches the picture.
  const pad: NotepadNote[] = [];
  let maxCalls = 0;
  let helperCalls = 0;
  let callNo = 0;

  // ---------- Setup ----------
  add({
    line: 1,
    scene: phase('intro', 'all'),
    say: "What's new: a boss agent whose TOOLS are other agents. Max 👑 hands out jobs, Rita 🔍 and Milo 🧮 do them. Each helper is a whole agent.",
  });
  add({
    line: L('def run_agent'),
    set: { client: 'OpenAI()' },
    scene: phase('runAgent'),
    say: 'Our old friend run_agent: ONE LLM call with a job (system prompt) and a task. Every agent in this office is built from it.',
  });
  add({
    line: L('def ask_researcher'),
    scene: phase('helpers', 'rita'),
    say: "Helper #1 is Rita 🔍. ask_researcher just calls run_agent with Rita's job. So this helper is a whole agent, not a tiny function.",
  });
  add({
    line: L('def ask_math_whiz'),
    scene: phase('helpers', 'milo'),
    say: "Helper #2 is Milo 🧮, built the same way with his own job: solving math step by step. Look at his desk.",
  });
  add({
    line: L('tools = ['),
    set: { tools: '[ask_researcher, ask_math_whiz]' },
    scene: phase('tools', 'all'),
    say: "The menu Max sees. Same format as Part 2's tools, but each tool is a helper agent. See the name plates on the desks.",
  });
  add({
    line: L('"description": "Ask Rita'),
    scene: phase('tools', 'rita', 'Rita = facts. Milo = calculations.'),
    say: 'The description tells Max WHEN to pick Rita: whenever he needs facts. Milo’s description says: for calculations.',
  });
  add({
    line: L('"question": {"type": "string"}'),
    scene: phase('tools', 'rita', 'Each slip carries ONE string.'),
    say: 'Each helper takes ONE string: the question Max writes on an order slip 📝.',
  });
  add({
    line: L('helpers = {'),
    set: { helpers: '{"ask_researcher": ..., "ask_math_whiz": ...}' },
    scene: phase('phonebook', 'all'),
    say: 'A phone book: tool name → real Python function. Our code uses it to ring the right helper when a slip arrives.',
  });
  add({
    line: L('boss_prompt = ('),
    set: { boss_prompt: '"You are Max, the boss. Break the request…"' },
    scene: phase('bossPrompt', 'max'),
    say: "Max's job description: split the request, ask helpers, write the final answer. He must NOT do the work himself.",
  });
  add({
    line: L('request = "'),
    set: { request: `"${clip(run.request, 48)}"` },
    scene: phase('inbox', 'max'),
    say: "The request lands in Max's inbox 📥. Read it at the top of his desk.",
  });
  add({
    line: L('print("You:"'),
    out: `You: ${run.request}`,
    scene: phase('inbox', 'max', '📢 Printed the request.'),
    say: 'Print the request so we can follow along. Check the Output panel.',
  });
  pad.push({ role: 'system', text: "Max's job" }, { role: 'user', text: clip(run.request, 34) });
  const padAfterStart = pad.map((n) => ({ ...n }));
  add({
    line: L('messages = ['),
    set: { messages: notesLabel(pad) },
    scene: (s) => {
      s.phase = 'notepad';
      s.focus = 'max';
      s.notepad = padAfterStart;
    },
    say: "Max's notepad (the messages list) starts with 2 notes: his job and the request. Watch it grow at the bottom.",
  });

  // ---------- The boss loop ----------
  const turns = run.rounds.length + 1;
  for (let t = 1; t <= turns; t++) {
    const calls = run.rounds[t - 1]; // undefined on the last (final-answer) turn
    add({
      line: L('while True:'),
      scene: (s) => {
        s.phase = 'loop';
        s.focus = 'max';
        s.turn = t;
        if (t > 1) {
          s.slips = [];
          s.current = -1;
        }
      },
      say:
        t === 1
          ? 'Turn 1 of the boss loop. It is the same agent loop you built in Part 3. See the turn counter.'
          : `Back to the top: turn ${t}. Max will now read his notepad again, including the new result note${run.rounds[t - 2].length > 1 ? 's' : ''}.`,
    });
    maxCalls += 1;
    const mc = maxCalls;
    const padLen = pad.length;
    add({
      line: L('response = client.chat.completions.create(', 2),
      set: { response: `<ChatCompletion #${mc} for Max>` },
      scene: (s) => {
        s.phase = 'thinking';
        s.focus = 'max';
        s.maxCalls = mc;
      },
      say: `Call to OpenAI for Max (Max's count: ${mc}). He sends his whole notepad (${padLen} notes) plus the helper menu, then decides.`,
    });

    if (calls) {
      const slips: OrderSlip[] = calls.map((c) => {
        callNo += 1;
        return {
          id: `call_0${callNo}`,
          to: c.to,
          fn: HELPER_INFO[c.to].fn,
          arg: c.arg,
          result: c.result,
          status: 'new',
        };
      });
      const slipList = slips.map((sl) => `${sl.fn}("${clip(sl.arg, 30)}")`).join(', ');
      add({
        line: L('message = response.choices[0].message'),
        set: { message: `{content: None, tool_calls: [${slipList}]}` },
        scene: (s) => {
          s.phase = 'reply';
          s.focus = 'max';
          s.slips = slips.map((x) => ({ ...x }));
          s.current = -1;
        },
        say:
          slips.length === 1
            ? `No answer yet! Max's reply is an order slip 📝 (a tool_call) for ${HELPER_INFO[slips[0].to].name}: "${clip(slips[0].arg, 70)}"`
            : `Max wrote ${slips.length} order slips in ONE reply, both for ${HELPER_INFO[slips[0].to].name}. The for loop will handle them one at a time.`,
      });
      pad.push({ role: 'assistant', text: `${slips.length} slip${slips.length > 1 ? 's' : ''}` });
      const padNow = pad.map((n) => ({ ...n }));
      add({
        line: L('messages.append(message)'),
        set: { messages: notesLabel(pad) },
        scene: (s) => {
          s.phase = 'reply';
          s.notepad = padNow;
        },
        say: `Max's reply (with its slip${slips.length > 1 ? 's' : ''}) goes on the notepad. That makes ${pad.length} notes.`,
      });
      add({
        line: L('if not message.tool_calls:'),
        scene: phase('check', 'max'),
        say: 'Are there order slips? Yes, so Max is NOT done. We skip the break and go hand out the slips.',
      });

      slips.forEach((sl, i) => {
        const info = HELPER_INFO[sl.to];
        const setStatus = (s: BossScene, st: OrderSlip['status']) => {
          s.current = i;
          s.slips = s.slips.map((x, j) => (j === i ? { ...x, status: st } : x));
        };
        add({
          line: L('for tool_call in message.tool_calls:'),
          set: { tool_call: `{id: "${sl.id}", function: {name: "${sl.fn}", …}}` },
          scene: (s) => {
            s.phase = 'read';
            s.focus = 'max';
            setStatus(s, 'reading');
          },
          say:
            slips.length === 1
              ? `The for loop picks up the slip. Its id is ${sl.id}, like a ticket number. Remember it!`
              : `The for loop picks up slip ${i + 1} of ${slips.length}. Its id is ${sl.id}, like a ticket number.`,
        });
        add({
          line: L('name = tool_call.function.name'),
          set: { name: `"${sl.fn}"` },
          scene: phase('read', 'max', `name → ${sl.fn} = ${info.name} ${info.badge}`),
          say: `Which helper? name = "${sl.fn}", so this job is for ${info.name} ${info.badge}.`,
        });
        add({
          line: L('args = json.loads'),
          set: { args: `{"${info.param}": "${clip(sl.arg, 40)}"}` },
          scene: phase('read', 'max', `args = {"${info.param}": …} ✔`),
          say: `The slip's text arrives as a JSON string. json.loads turns it into a Python dict with one key: "${info.param}".`,
        });
        add({
          line: L('print(f"Max asks'),
          out: `Max asks ${sl.fn}: {'${info.param}': '${sl.arg}'}`,
          scene: phase('read', 'max', `📢 "Max asks ${sl.fn}"`),
          say: 'Print who Max is asking and what, so we can follow the office in Output.',
        });
        add({
          line: L('result = helpers[name](**args)'),
          scene: (s) => {
            s.phase = 'send';
            s.focus = sl.to;
            setStatus(s, 'sent');
          },
          say: `helpers[name] finds ${sl.fn} in the phone book and calls it. The slip flies to ${info.name}'s desk.`,
        });
        helperCalls += 1;
        const hc = helperCalls;
        add({
          line: L(sl.to === 'rita' ? 'return run_agent("You are Rita' : 'return run_agent("You are Milo'),
          scene: (s) => {
            s.phase = 'helperLLM';
            s.focus = sl.to;
            s.helperCalls = hc;
          },
          say: `Inside the tool call, ${info.name} makes ${sl.to === 'rita' ? 'her' : 'his'} OWN LLM call with run_agent (helpers' count: ${hc}). An LLM call inside a tool call!`,
        });
        add({
          line: L('result = helpers[name](**args)'),
          set: { result: `"${clip(sl.result, 50)}"` },
          scene: (s) => {
            s.phase = 'noteBack';
            s.focus = sl.to;
          },
          say: `${info.name}'s answer comes back to Max as a result note: "${clip(sl.result, 90)}"`,
        });
        pad.push({ role: 'tool', text: clip(sl.result, 26), id: sl.id, by: sl.to });
        const padTool = pad.map((n) => ({ ...n }));
        add({
          line: L('"tool_call_id": tool_call.id'),
          set: { messages: notesLabel(pad) },
          scene: (s) => {
            s.phase = 'toolMsg';
            s.focus = 'max';
            s.notepad = padTool;
            setStatus(s, 'done');
          },
          say: `The note goes on the notepad as a "tool" message. Its tool_call_id ${sl.id} matches the slip, so Max knows which question it answers.`,
        });
      });
    } else {
      add({
        line: L('message = response.choices[0].message'),
        set: { message: `{content: "${clip(run.final, 40)}", tool_calls: None}` },
        scene: phase('reply', 'max'),
        say: 'This time Max has every piece he needs. His reply has NO slips, just the final answer text.',
      });
      pad.push({ role: 'assistant', text: 'final answer' });
      const padFinal = pad.map((n) => ({ ...n }));
      add({
        line: L('messages.append(message)'),
        set: { messages: notesLabel(pad) },
        scene: (s) => {
          s.phase = 'reply';
          s.notepad = padFinal;
        },
        say: `The answer goes on the notepad too. ${pad.length} notes in total.`,
      });
      add({
        line: L('if not message.tool_calls:'),
        scene: phase('check', 'max'),
        say: 'No order slips this time, so the if is true: Max is done!',
      });
      const finalText = run.final;
      add({
        line: L('print("Max:"'),
        out: `Max: ${run.final}`,
        scene: (s) => {
          s.phase = 'final';
          s.focus = 'max';
          s.final = finalText;
        },
        say: 'Max writes the final answer on the big card, and we print it. Check the Output panel.',
      });
      add({
        line: L('break'),
        scene: phase('done', 'all'),
        say: `break ends the loop. Calls to OpenAI: Max ${maxCalls} + helpers ${helperCalls} = ${maxCalls + helperCalls}. Each one was just an LLM call.`,
      });
      add({
        line: L('break'),
        scene: phase('recap', 'all'),
        say: 'What you learned: 1) a helper agent can be a tool; 2) the boss runs the same Part 3 agent loop; 3) tool_call_id links each result to its slip.',
      });
    }
  }

  // ---------- Build steps + scenes ----------
  const vars = new Map<string, string>();
  const scene: BossScene = {
    phase: 'intro',
    focus: 'none',
    request: run.request,
    turn: 0,
    maxCalls: 0,
    helperCalls: 0,
    notepad: [],
    slips: [],
    current: -1,
    final: '',
  };
  const steps: TraceStep[] = [];
  const scenes: BossScene[] = [];
  for (const d of defs) {
    const fresh = new Set<string>();
    const changed = new Set<string>();
    for (const [name, value] of Object.entries(d.set ?? {})) {
      if (!vars.has(name)) fresh.add(name);
      else if (vars.get(name) !== value) changed.add(name);
      vars.set(name, value);
    }
    const variables: Variable[] = Array.from(vars, ([name, value]) => ({
      name,
      value,
      ...(fresh.has(name) ? { isNew: true } : {}),
      ...(changed.has(name) ? { isChanged: true } : {}),
    }));
    scene.say = undefined;
    d.scene?.(scene);
    scenes.push({
      ...scene,
      notepad: scene.notepad.map((n) => ({ ...n })),
      slips: scene.slips.map((x) => ({ ...x })),
    });
    steps.push({
      lineNumber: d.line,
      variables,
      output: d.out ?? '',
      explanation: d.say,
      animationTrigger: `boss-${scene.phase}`,
    });
  }
  return { steps, scenes };
}

// ---------------------------------------------------------------------------
// The three runs ("Try different inputs")
// ---------------------------------------------------------------------------
export const BOSS_EVEREST_Q =
  'How tall is Mount Everest, and how many 30-story buildings (3 m per floor) stacked would reach it?';
const BOSS_PERCENT_Q = 'What is 25% of 480?';
const BOSS_ANIMALS_Q = 'Tell me one fun fact about owls and one about bats';

// Everest is 8,849 m. One building = 30 floors x 3 m = 90 m. 8,849 / 90 = 98.32…
// 98 buildings = 8,820 m (just short), 99 buildings = 8,910 m (reaches the top).
const everest = buildBoss({
  request: BOSS_EVEREST_Q,
  rounds: [
    [{ to: 'rita', arg: 'How tall is Mount Everest?', result: 'Mount Everest is about 8,849 m tall.' }],
    [
      {
        to: 'milo',
        arg: 'How many buildings of 30 floors x 3 m stacked reach 8,849 m?',
        result: 'One building = 30 x 3 = 90 m. 8,849 / 90 ≈ 98.3, so 98 fall just short and 99 reach the top.',
      },
    ],
  ],
  final:
    'Mount Everest is about 8,849 m tall. One 30-story building is 90 m, so you need about 98.3 of them: 99 buildings stacked reach the top!',
});

const percent = buildBoss({
  request: BOSS_PERCENT_Q,
  rounds: [[{ to: 'milo', arg: 'What is 25% of 480?', result: '25% means one quarter. 480 / 4 = 120.' }]],
  final: '25% of 480 is 120.',
});

const animals = buildBoss({
  request: BOSS_ANIMALS_Q,
  rounds: [
    [
      { to: 'rita', arg: 'Tell me one fun fact about owls.', result: 'Owls can turn their heads about 270 degrees!' },
      { to: 'rita', arg: 'Tell me one fun fact about bats.', result: 'Bats are the only mammals that can truly fly.' },
    ],
  ],
  final: 'Owls can turn their heads about 270 degrees, and bats are the only mammals that can truly fly!',
});

export const bossAgentTrace: TraceStep[] = everest.steps;

export const bossAgentVariants: TraceVariant[] = [
  { id: 'default', label: 'Everest vs. buildings', inputValue: BOSS_EVEREST_Q, steps: everest.steps },
  { id: 'percent', label: BOSS_PERCENT_Q, inputValue: BOSS_PERCENT_Q, steps: percent.steps },
  { id: 'animals', label: 'Owls and bats facts', inputValue: BOSS_ANIMALS_Q, steps: animals.steps },
];

/** Office scene per step, keyed by variant id (same length as that variant's steps). */
export const bossAgentScenes: Record<string, BossScene[]> = {
  default: everest.scenes,
  percent: percent.scenes,
  animals: animals.scenes,
};
