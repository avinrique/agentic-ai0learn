import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';
import { guardrailsCode } from '@/data/code-snippets/guardrails';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 33 – Code: Guardrails & Human Approval (the last lesson of the course)
//
// Three brakes on an agent that can DO things:
//   Gate 1: Cora checks the request (input guardrail),
//   Gate 2: a human must say yes before the risky send_email tool runs,
//   Gate 3: Cora checks Max's answer (output guardrail).
// Builder: each step names a unique piece of code (`at`) instead of a raw line
// number; variables carry forward automatically (`unset` removes a function's
// locals once it returns).
// Variants: "approved" and "human says no" run the same code (the human types a
// different answer); "blocked at the gate" swaps the request text, so its
// inputValue is that request line (an exact substring of the code).
// ─────────────────────────────────────────────────────────────────────────────
interface StepDef {
  at: string; // a substring that appears on exactly one line of the code
  exp: string;
  set?: Record<string, string>;
  unset?: string[];
  out?: string;
  trig: string;
}

const CODE_LINES = guardrailsCode.split('\n');

function lineOf(marker: string): number {
  const hits = CODE_LINES.map((l, i) => (l.includes(marker) ? i + 1 : 0)).filter(Boolean);
  if (hits.length !== 1) throw new Error(`guardrails: marker "${marker}" found on ${hits.length} lines`);
  return hits[0];
}

function buildTrace(defs: StepDef[]): TraceStep[] {
  let vars: Variable[] = [];
  return defs.map((d) => {
    vars = vars.map((v) => ({ name: v.name, value: v.value }));
    if (d.unset) vars = vars.filter((v) => !d.unset?.includes(v.name));
    if (d.set) {
      for (const [name, value] of Object.entries(d.set)) {
        const i = vars.findIndex((v) => v.name === name);
        if (i < 0) vars.push({ name, value, isNew: true });
        else if (vars[i].value !== value) vars[i] = { name, value, isChanged: true };
      }
    }
    return {
      lineNumber: lineOf(d.at),
      variables: vars,
      output: d.out ?? '',
      explanation: d.exp,
      animationTrigger: d.trig,
    };
  });
}

/** Python-style string value for the Variables panel (the animation JSON.parses it back). */
const str = (s: string) => JSON.stringify(s);

export const CHECKER_PROMPT = 'You are Cora. You check messages for a school helper app. Reply SAFE or UNSAFE only.';
export const MAX_PROMPT = "You are Max, a school helper. The student's teacher is Ms. Lee.";
export const REQUEST_OK = 'Email my teacher that I finished my science project.';
export const REQUEST_BAD = 'Write a mean message to embarrass my classmate.';
export const EMAIL_TO = 'Ms. Lee';
export const EMAIL_MESSAGE = 'Hi Ms. Lee! I finished my science project.';
const ARGS = `{'to': '${EMAIL_TO}', 'message': '${EMAIL_MESSAGE}'}`; // Python prints a dict like this
const REFUSAL = "Sorry, I can't help with that. Let's keep things kind and safe.";

const L = {
  gate1: 'if not is_safe(request):',
  verdict: 'verdict = run_agent(checker_prompt, text)',
  ret: 'return verdict.strip()',
  stop: 'raise SystemExit',
  ask: 'answer = input(',
  toolMsg: '"role": "tool"',
  gate3: 'if not is_safe(reply):',
  printReply: 'print("Max:", reply)',
};

type Story = 'approved' | 'denied' | 'blocked';

const LAYERS_EXP =
  "No guardrail is perfect: Cora can miss things too. So we stack layers: a checker, a human's OK, and only a few, pretend tools. Each catches what others miss.";
const RECAP_EXP =
  "What you learned: 1) guardrails check what goes in and what comes out, and can be small agents; 2) risky tools wait for a human's yes; 3) our code enforces it, not the AI.";

function guardrailsSteps(story: Story): TraceStep[] {
  const blocked = story === 'blocked';
  const yes = story === 'approved';
  const request = blocked ? REQUEST_BAD : REQUEST_OK;

  const defs: StepDef[] = [
    {
      at: '# part4/guardrails.py',
      trig: 'intro',
      exp: "Last lesson! Max gets a tool that DOES something: send an email. Agents that act need brakes, called guardrails. Look at the road: a check in, a human's OK, a check out.",
    },
    {
      at: 'client = OpenAI()',
      trig: 'setup',
      set: { json: '<module json>', OpenAI: '<class OpenAI>', client: '<OpenAI client>' },
      exp: 'Same start as the Part 2 agent: json (to read tool arguments), the OpenAI library, and the client, our phone line to the AI.',
    },
    {
      at: 'def run_agent(system_prompt, task):',
      trig: 'helper',
      set: { run_agent: '<function run_agent>' },
      exp: 'The same run_agent helper as every Part 4 lesson: one API call with a job card (system prompt) and a task.',
    },
    {
      at: 'checker_prompt = ',
      trig: 'cora-card',
      set: { checker_prompt: str(CHECKER_PROMPT) },
      exp: 'Cora the critic gets a new job: safety checker. "Reply SAFE or UNSAFE only" makes her answer one word, so our code can read it easily.',
    },
    {
      at: 'def is_safe(text):',
      trig: 'is-safe-def',
      set: { is_safe: '<function is_safe>' },
      exp: 'is_safe(text) is our guardrail: it asks Cora about any text and gives back True or False. A guardrail can itself be a small agent!',
    },
    {
      at: 'def send_email(to, message):',
      trig: 'tool-def',
      set: { send_email: '<function send_email>' },
      exp: 'A pretend tool: send_email only prints a "(pretend)" line. It never really sends anything, so it is safe to practise with.',
    },
    {
      at: 'tools = [{',
      trig: 'menu',
      set: { tools: '[send_email]' },
      exp: "The menu Max will see: one tool, send_email, with two inputs: who it's to, and the message.",
    },
    {
      at: 'RISKY_TOOLS = {',
      trig: 'risky',
      set: { RISKY_TOOLS: "{'send_email'}" },
      exp: 'RISKY_TOOLS lists actions a human must approve first. Sending, deleting and paying are risky because they are hard to undo.',
    },
    {
      at: 'max_prompt = ',
      trig: 'max-card',
      set: { max_prompt: str(MAX_PROMPT) },
      exp: "Max's job card: a school helper who knows the teacher is Ms. Lee. Max is the agent who will DO the work.",
    },
    {
      at: 'request = "',
      trig: 'request',
      set: { request: str(request) },
      exp: blocked
        ? "This time the request is unkind: a mean message to embarrass a classmate. Let's see what the guardrails do."
        : "The student's request: email the teacher about the finished science project.",
    },
    {
      at: 'print("You:", request)',
      trig: 'request',
      out: `You: ${request}`,
      exp: 'Print the request so we can see it.',
    },
    {
      at: L.gate1,
      trig: 'gate1',
      exp: 'Gate 1, the input guardrail: before Max sees anything, our code calls is_safe(request). Cora guards the gate.',
    },
    {
      at: L.verdict,
      trig: 'cora-check',
      set: { text: str(request) },
      exp: "Inside is_safe: one run_agent call with Cora's job card. The request is her task, so she reads it.",
    },
    {
      at: L.verdict,
      trig: 'verdict',
      set: { verdict: str(blocked ? 'UNSAFE' : 'SAFE') },
      exp: blocked
        ? 'Cora replies with one word: UNSAFE. It is saved in verdict.'
        : 'Cora replies with one word: SAFE. It is saved in verdict.',
    },
    {
      at: L.ret,
      trig: 'return',
      exp: blocked
        ? 'Careful: "UNSAFE" starts with U, not "SAFE", so is_safe returns False. A one-word answer is easy for code to check.'
        : '"SAFE" starts with "SAFE", so is_safe returns True. (.strip() removes stray spaces first.)',
    },
  ];

  if (blocked) {
    defs.push(
      {
        at: L.gate1,
        trig: 'gate1-closed',
        unset: ['text', 'verdict'],
        exp: 'is_safe gave False, so not False is True: we go inside the if. The gate stays shut.',
      },
      {
        at: "print(\"Sorry, I can't help",
        trig: 'refuse',
        out: REFUSAL,
        exp: 'We print a polite refusal. No lecture, no drama: just a kind no.',
      },
      {
        at: L.stop,
        trig: 'stop',
        exp: 'raise SystemExit stops the whole program right here. Max is never called, so the mean request never reaches the agent who can act.',
      },
      { at: L.stop, trig: 'layers', exp: LAYERS_EXP },
      { at: L.stop, trig: 'recap', exp: RECAP_EXP },
    );
    return buildTrace(defs);
  }

  const reply = yes
    ? 'Done! I emailed Ms. Lee that you finished your science project.'
    : "Okay, I didn't send anything. Tell me if you want to change the message.";
  const result = yes ? 'Email sent.' : 'The human said no.';
  const answer = yes ? 'y' : 'n';

  defs.push(
    {
      at: L.gate1,
      trig: 'gate1-open',
      unset: ['text', 'verdict'],
      exp: 'is_safe gave True, so not True is False: we skip the refusal. The gate opens and the request goes on to Max.',
    },
    {
      at: 'messages = [{',
      trig: 'max-notepad',
      set: { messages: '[system, user]' },
      exp: "Max's notepad: his job card plus the request. Only now does the request reach him.",
    },
    {
      at: 'response = client.chat.completions.create(model=',
      trig: 'max-think',
      exp: "Our code calls OpenAI with Max's notepad AND his tool menu (tools=tools). Max is thinking…",
    },
    {
      at: 'message = response.choices[0].message',
      trig: 'slip',
      set: { message: '<assistant message: 1 tool call>' },
      exp: "Max's reply is not text. It's an order slip (a tool call): he wants to use send_email.",
    },
    {
      at: 'reply = message.content',
      trig: 'reply-none',
      set: { messages: '[system, user, assistant]', reply: 'None' },
      exp: "reply holds Max's text answer. It's None for now, because he asked for a tool instead of answering.",
    },
    {
      at: 'if message.tool_calls:',
      trig: 'ask-only',
      exp: "The key idea: Max can only ASK for a tool. He can't press the button himself. Our code decides whether it really runs.",
    },
    {
      at: 'args = json.loads',
      trig: 'read-slip',
      set: { tool_call: '<tool call: send_email>', name: str('send_email'), args: ARGS },
      exp: 'Our code reads the slip with json.loads. Max has drafted an email: to Ms. Lee, with this message.',
    },
    {
      at: 'allowed = True',
      trig: 'allowed-default',
      set: { allowed: 'True' },
      exp: 'allowed starts as True. A harmless tool, like a calculator, could just run.',
    },
    {
      at: 'if name in RISKY_TOOLS:',
      trig: 'risky-check',
      exp: "Gate 2: is send_email on the risky list? Yes! A sent email can't be unsent, so a human must decide.",
    },
    {
      at: L.ask,
      trig: 'human-ask',
      exp: 'Human-in-the-loop: the program pauses and shows a person exactly what Max wants to do. Nothing is sent until they answer.',
    },
    {
      at: L.ask,
      trig: 'human-answer',
      set: { answer: str(answer) },
      out: `Allow send_email with ${ARGS}? (y/n) ${answer}`,
      exp: yes
        ? 'You read the email, it looks right, so you type y for yes.'
        : 'You change your mind (maybe you want to tell Ms. Lee yourself), so you type n for no.',
    },
    {
      at: 'allowed = answer',
      trig: 'allowed-set',
      set: { allowed: yes ? 'True' : 'False' },
      exp: yes
        ? 'allowed is True only if the answer is y. (.strip().lower() forgives spaces and capitals, so " Y " works too.)'
        : 'The answer is n, not y, so allowed becomes False.',
    },
  );

  if (yes) {
    defs.push(
      {
        at: 'result = send_email(**args)',
        trig: 'run-tool',
        exp: "allowed is True, so our code finally runs the tool. **args fills in to= and message= from Max's slip.",
      },
      {
        at: 'print(f"📧 (pretend)',
        trig: 'sent',
        out: `📧 (pretend) Email to ${EMAIL_TO}: ${EMAIL_MESSAGE}`,
        exp: 'The pretend tool just prints. In a real app, a real email would leave here, which is exactly why we asked first.',
      },
      {
        at: L.toolMsg,
        trig: 'tool-msg',
        set: { result: str(result), messages: '[system, user, assistant, tool]' },
        exp: 'send_email returned "Email sent." Our code passes that back to Max as a tool message, so he knows what happened.',
      },
    );
  } else {
    defs.push(
      {
        at: 'if allowed:',
        trig: 'if-denied',
        exp: 'allowed is False, so we skip send_email. The email is never sent: a human has the final say on risky actions.',
      },
      {
        at: 'result = "The human said no."',
        trig: 'result-no',
        set: { result: str(result) },
        exp: 'Instead, result becomes "The human said no." Max will be told the truth.',
      },
      {
        at: L.toolMsg,
        trig: 'tool-msg',
        set: { messages: '[system, user, assistant, tool]' },
        exp: 'Our code passes that back to Max as a tool message, so he knows nothing was sent.',
      },
    );
  }

  defs.push(
    {
      at: 'final = client',
      trig: 'max-final',
      exp: 'One more call: Max reads the tool result and writes his reply for the student.',
    },
    {
      at: 'reply = final',
      trig: 'reply',
      set: { reply: str(reply) },
      exp: yes
        ? 'Max\'s reply is ready, saved in reply. But nobody sees it yet…'
        : 'Max replies honestly: nothing was sent. It is saved in reply, but nobody sees it yet…',
    },
    {
      at: L.gate3,
      trig: 'gate3',
      exp: "Gate 3, the output guardrail: Cora checks Max's answer before anyone sees it. AIs can make mistakes, so we check what comes out too.",
    },
    {
      at: L.gate3,
      trig: 'gate3-safe',
      exp: 'Cora says SAFE, so not is_safe(reply) is False and we skip the fallback line. The exit gate opens.',
    },
    {
      at: L.printReply,
      trig: 'print-reply',
      out: `Max: ${reply}`,
      exp: yes
        ? 'Every gate said yes, so the answer is printed. Three brakes, one happy student.'
        : 'The answer is printed. The human said no, and Max respected it.',
    },
    { at: L.printReply, trig: 'layers', exp: LAYERS_EXP },
    { at: L.printReply, trig: 'recap', exp: RECAP_EXP },
  );

  return buildTrace(defs);
}

export const guardrailsTrace = guardrailsSteps('approved');

// "approved" and "human says no" only differ in what the human types, so the code
// panel stays the same (inputValue = the unchanged request). "blocked at the gate"
// swaps the request line in the code.
export const guardrailsVariants: TraceVariant[] = [
  { id: 'default', label: 'Approved', inputValue: REQUEST_OK, steps: guardrailsTrace },
  { id: 'variant2', label: 'Human says no', inputValue: REQUEST_OK, steps: guardrailsSteps('denied') },
  { id: 'variant3', label: 'Blocked at the gate', inputValue: REQUEST_BAD, steps: guardrailsSteps('blocked') },
];
