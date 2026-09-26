import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';
import { writerCriticCode } from '@/data/code-snippets/part4';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 22 – Code: Writer & Critic Loop (Wally writes, Cora reviews)
//
// All three variants run the SAME code; only the AI replies differ, so each
// variant walks a different path through the for-loop / break.
// Builder: steps name a unique piece of code (`at`) instead of a raw line
// number, and variables carry forward automatically.
// ─────────────────────────────────────────────────────────────────────────────
interface StepDef {
  at: string; // a substring that appears on exactly one line of the code
  exp: string;
  set?: Record<string, string>;
  out?: string;
  trig: string;
}

const CODE_LINES = writerCriticCode.split('\n');

function lineOf(marker: string): number {
  const hits = CODE_LINES.map((l, i) => (l.includes(marker) ? i + 1 : 0)).filter(Boolean);
  if (hits.length !== 1) throw new Error(`writer-critic: marker "${marker}" found on ${hits.length} lines`);
  return hits[0];
}

function buildTrace(defs: StepDef[]): TraceStep[] {
  let vars: Variable[] = [];
  return defs.map((d) => {
    vars = vars.map((v) => ({ name: v.name, value: v.value }));
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

const WRITER_PROMPT = 'You are Wally, a writer. Write short, catchy poems and slogans.';
const CRITIC_PROMPT =
  'You are Cora, a critic. Review the draft. If it is great, reply exactly APPROVED. Otherwise give ONE short tip to improve it.';
const TASK = 'Write a 2-line slogan for a school recycling club';
const MAX_ROUNDS = 3;

const L = {
  forLine: 'for round_number in range(1, 4):',
  critic: 'feedback = run_agent(critic_prompt, draft)',
  printRound: 'print(f"\\nRound {round_number}',
  check: 'if feedback.strip() == "APPROVED":',
  approvedPrint: 'print("Cora approved it!")',
  brk: 'break',
  rewriteTask: 'rewrite_task = f"Task:',
  rewrite: 'draft = run_agent(writer_prompt, rewrite_task)',
  printNew: `print("Wally's new draft:`,
  final: 'print("\\nFinal slogan:',
};

/**
 * drafts[i] is Wally's draft that Cora reviews in round i+1.
 * feedback[i] is Cora's reply in round i+1 ('APPROVED' or a tip).
 * If Cora never approves, drafts has one extra entry: the rewrite after round 3.
 */
interface Story {
  drafts: string[];
  feedback: string[];
}

function writerCriticSteps(s: Story): TraceStep[] {
  const rewriteTaskFor = (draft: string, fb: string) =>
    `Task: ${TASK}\nYour draft: ${draft}\nFeedback: ${fb}\nWrite a better version.`;

  const defs: StepDef[] = [
    {
      at: '# 2_writer_critic.py',
      trig: 'intro',
      exp: "What's new: a LOOP between two agents. Wally writes, Cora checks, and they repeat until Cora says APPROVED. Like handing homework to a friend to check.",
    },
    {
      at: 'from openai import OpenAI',
      trig: 'setup',
      set: { OpenAI: '<class OpenAI>' },
      exp: 'Same start as always: load the OpenAI library.',
    },
    {
      at: 'client = OpenAI()',
      trig: 'setup',
      set: { client: '<OpenAI client>' },
      exp: 'Create the client, our phone line to the AI.',
    },
    {
      at: 'def run_agent(system_prompt, task):',
      trig: 'setup',
      set: { run_agent: '<function run_agent>' },
      exp: 'The same run_agent helper as last lesson: one API call with a job card (system prompt) and a task.',
    },
    {
      at: 'writer_prompt = ',
      trig: 'wally-card',
      set: { writer_prompt: str(WRITER_PROMPT) },
      exp: "Wally's job card: write short, catchy poems and slogans. Look at Wally on the left.",
    },
    {
      at: 'critic_prompt = ',
      trig: 'cora-card',
      set: { critic_prompt: str(CRITIC_PROMPT) },
      exp: 'Cora\'s job card has a secret password: if the draft is great, reply exactly "APPROVED". Otherwise, give ONE tip.',
    },
    {
      at: 'task = "Write a 2-line slogan',
      trig: 'task',
      set: { task: str(TASK) },
      exp: 'The job for today: a 2-line slogan for the school recycling club.',
    },
    {
      at: 'draft = run_agent(writer_prompt, task)',
      trig: 'wally-work',
      exp: 'Our code calls run_agent with Wally\'s card and the task. Wally is writing his first draft.',
    },
    {
      at: 'draft = run_agent(writer_prompt, task)',
      trig: 'draft',
      set: { draft: str(s.drafts[0]) },
      exp: 'Draft 1 is on the table, saved in draft.',
    },
    {
      at: 'print("First draft:',
      trig: 'draft',
      out: `First draft:\n${s.drafts[0]}`,
      exp: 'Print the first draft so we can read it.',
    },
  ];

  let approved = false;
  for (let r = 1; r <= MAX_ROUNDS && !approved; r++) {
    const draft = s.drafts[r - 1];
    const fb = s.feedback[r - 1];
    approved = fb === 'APPROVED';

    defs.push(
      {
        at: L.forLine,
        trig: 'round',
        set: { round_number: String(r) },
        exp:
          r === 1
            ? 'The loop starts: round 1. range(1, 4) gives 1, 2, 3, so there are at most 3 rounds. See the fuse up top: a stop so they can\'t argue forever.'
            : `Back to the top of the loop: round ${r} of 3. One more notch of the fuse burns.`,
      },
      {
        at: L.critic,
        trig: 'slide',
        exp: `Our code slides Wally's draft across the table to Cora. The draft IS her task.`,
      },
      {
        at: L.critic,
        trig: 'cora-work',
        exp: 'Cora reads it with her red pen ready. Same run_agent, different job card.',
      },
      {
        at: L.critic,
        trig: 'feedback',
        set: { feedback: str(fb) },
        exp: approved
          ? 'Cora replies with just one word: APPROVED! It is saved in feedback.'
          : `Cora marks the draft with her red pen and gives one tip: "${fb}"`,
      },
      {
        at: L.printRound,
        trig: 'feedback',
        out: `\nRound ${r} - Cora says: ${fb}`,
        exp: "Print Cora's answer for this round.",
      },
      {
        at: L.check,
        trig: 'check',
        exp: approved
          ? 'Is feedback exactly "APPROVED"? Yes! (.strip() removes stray spaces first.) So we go inside the if.'
          : 'Is feedback exactly "APPROVED"? No, it\'s a tip. So we skip the if and keep going.',
      },
    );

    if (approved) {
      defs.push(
        {
          at: L.approvedPrint,
          trig: 'approved',
          out: 'Cora approved it!',
          exp: 'Big green stamp: APPROVED!',
        },
        {
          at: L.brk,
          trig: 'approved',
          exp:
            r === 1
              ? 'break jumps straight out of the loop. Rounds 2 and 3 never happen. A great first draft means no extra work!'
              : `break jumps straight out of the loop. Round ${r + 1} never happens: the fuse stops burning.`,
        },
      );
      break;
    }

    const next = s.drafts[r];
    defs.push(
      {
        at: L.rewriteTask,
        trig: 'rewrite-note',
        set: { rewrite_task: str(rewriteTaskFor(draft, fb)) },
        exp: "Our code packs a note for Wally: the task, his old draft, and Cora's tip. It slides back across the table.",
      },
      {
        at: L.rewrite,
        trig: 'wally-rewrite',
        exp: "Wally reads the note and rewrites. He can fix it because the tip is in his task.",
      },
      {
        at: L.rewrite,
        trig: 'draft',
        set: { draft: str(next) },
        exp:
          r === MAX_ROUNDS
            ? 'Wally\'s newest draft replaces the old one in draft. But this was round 3...'
            : `Draft ${r + 1} replaces the old one in draft. Time for Cora to check again.`,
      },
      {
        at: L.printNew,
        trig: 'draft',
        out: `Wally's new draft:\n${next}`,
        exp: 'Print the new draft.',
      },
    );

    if (r === MAX_ROUNDS) {
      defs.push({
        at: L.forLine,
        trig: 'fuse-out',
        exp: 'Back to the for line: range(1, 4) has no number 4 left. The fuse is burnt out, so the loop ends. No more arguing!',
      });
    }
  }

  const finalDraft = s.drafts[approved ? s.feedback.indexOf('APPROVED') : MAX_ROUNDS];
  defs.push(
    {
      at: L.final,
      trig: 'final',
      out: `\nFinal slogan:\n${finalDraft}`,
      exp: approved
        ? 'After the loop, print the winning slogan. Cora approved it, so we know it passed the check.'
        : "Print the final slogan: Wally's last draft. Cora never approved one, but the fuse kept us from looping forever.",
    },
    {
      at: L.final,
      trig: 'recap',
      exp: 'What you learned: 1) a critic agent checks a writer agent; 2) the loop repeats until "APPROVED" triggers break; 3) a max-rounds fuse makes sure it always ends.',
    },
  );

  return buildTrace(defs);
}

// Default: Cora approves in round 2.
const ROUND_TWO: Story = {
  drafts: [
    'Please recycle your bottles and paper.\nIt is good for the planet.',
    "Bottles and cans, don't toss them away!\nJoin the Recycle Club and save the day!",
  ],
  feedback: ['Make it rhyme and add some fun energy!', 'APPROVED'],
};

// A great first draft: the loop exits in round 1.
const ROUND_ONE: Story = {
  drafts: ["Reduce, reuse, recycle - it's cool!\nBe a planet hero at our school!"],
  feedback: ['APPROVED'],
};

// Never approved: the 3-round fuse stops the loop and we keep the last draft.
const NEVER: Story = {
  drafts: [
    'Recycling is good.\nPlease recycle.',
    "Recycle your stuff, it's really neat,\nor the planet will feel the heat.",
    'The Green Team recycling club says sort every day,\nand the planet will be happy in every single way.',
    'Green Team Club: sort it, save it, keep it cool!\nRecycling rules at our school!',
  ],
  feedback: [
    'Too plain. Make it rhyme!',
    'Mention the school club.',
    'Make it shorter and punchier.',
  ],
};

export const writerCriticTrace = writerCriticSteps(ROUND_TWO);

// The variants differ in what the AI replies, not in the code, so inputValue is
// a token that never appears in the code (the code panel stays unchanged).
export const writerCriticVariants: TraceVariant[] = [
  { id: 'default', label: 'Approved in round 2', inputValue: '<<writer-critic:round-2>>', steps: writerCriticTrace },
  { id: 'variant2', label: 'Approved in round 1', inputValue: '<<writer-critic:round-1>>', steps: writerCriticSteps(ROUND_ONE) },
  { id: 'variant3', label: 'Never approved (3-round fuse)', inputValue: '<<writer-critic:never>>', steps: writerCriticSteps(NEVER) },
];
