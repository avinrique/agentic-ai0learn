import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';
import { parallelAgentsCode } from '@/data/code-snippets/parallel-agents';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 31 – Code: Agents in Parallel (Rita × N, then Wally)
//
// Two races over the same topics: one at a time, then all at once with a
// ThreadPoolExecutor. Times are ILLUSTRATIVE (real ones depend on OpenAI).
// Builder: each step names a unique piece of code (`at`) instead of a raw line
// number; variables carry forward automatically.
// ─────────────────────────────────────────────────────────────────────────────
interface StepDef {
  at: string; // a substring that appears on exactly one line of the code
  exp: string;
  set?: Record<string, string>;
  out?: string;
  trig: string;
}

const CODE_LINES = parallelAgentsCode.split('\n');

function lineOf(marker: string): number {
  const hits = CODE_LINES.map((l, i) => (l.includes(marker) ? i + 1 : 0)).filter(Boolean);
  if (hits.length !== 1) throw new Error(`parallel-agents: marker "${marker}" found on ${hits.length} lines`);
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
        // Re-assigning a variable counts as a change, even if the new value looks the same.
        else vars[i] = { name, value, isChanged: true };
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
/** How Python prints a list of strings. */
const pyStr = (s: string) => (s.includes("'") && !s.includes('"') ? `"${s}"` : `'${s.replace(/'/g, "\\'")}'`);
const pyList = (items: string[]) => `[${items.map(pyStr).join(', ')}]`;
const sec = (n: number) => n.toFixed(1);

export const RESEARCHER_PROMPT =
  'You are Rita, a researcher. Give ONE amazing, true fact about the topic, in one sentence.';
export const WRITER_PROMPT = 'You are Wally, a writer for kids. Turn these facts into a fun 4-sentence poster.';

/** One job for Rita. `seconds` is an illustrative time for that one call. */
export interface ParallelJob {
  topic: string;
  seconds: number;
  fact: string;
}

export interface ParallelRun {
  jobs: ParallelJob[];
  poster: string;
}

/** Derived timings, shared by the trace and the animation. */
export function raceTimes(run: ParallelRun) {
  const offsets: number[] = [];
  let sum = 0;
  for (const j of run.jobs) {
    offsets.push(sum);
    sum = Math.round((sum + j.seconds) * 10) / 10;
  }
  const slowest = run.jobs.reduce((a, b) => (b.seconds > a.seconds ? b : a));
  const fastest = run.jobs.reduce((a, b) => (b.seconds < a.seconds ? b : a));
  // "par-go" freezes the picture while every Rita is still working.
  const goTime = Math.round(fastest.seconds * 0.8 * 10) / 10;
  return { offsets, seqTotal: sum, parTotal: slowest.seconds, slowest, fastest, goTime };
}

// An illustrative clock reading for time.time() (seconds since 1 Jan 1970).
const CLOCK = 1790467200.0;
const NUMBER_WORDS: Record<number, string> = { 3: 'Three', 5: 'Five' };

function parallelSteps(run: ParallelRun): TraceStep[] {
  const { jobs } = run;
  const n = jobs.length;
  const topics = jobs.map((j) => j.topic);
  const facts = jobs.map((j) => j.fact);
  const { offsets, seqTotal, parTotal, slowest, fastest } = raceTimes(run);
  const factList = facts.join('\n');
  const topicsLine = topics.length === 2 ? topics.join(' and ') : `${topics.slice(0, -1).join(', ')} and ${topics[n - 1]}`;
  const sumLine = `${jobs.map((j) => sec(j.seconds)).join(' + ')} = ${sec(seqTotal)}`;

  const defs: StepDef[] = [
    {
      at: '# part4/parallel_agents.py',
      trig: 'intro',
      exp: "What's new: agents working at the SAME time. Rita researches a few topics twice, one at a time and then all at once, and we time both races.",
    },
    {
      at: 'import time',
      trig: 'time',
      set: { time: '<module time>' },
      exp: 'import time gives us a stopwatch. time.time() reads the clock in seconds, so "later minus earlier" tells us how long something took.',
    },
    {
      at: 'from concurrent.futures import ThreadPoolExecutor',
      trig: 'pool-import',
      set: { ThreadPoolExecutor: '<class ThreadPoolExecutor>' },
      exp: 'ThreadPoolExecutor comes with Python: a team of helpers. Hand it a list of jobs, each helper takes one, and the jobs run at the same time.',
    },
    {
      at: 'client = OpenAI()',
      trig: 'setup',
      set: { OpenAI: '<class OpenAI>', client: '<OpenAI client>' },
      exp: 'Same start as always: load the OpenAI library and create the client, our phone line to the AI.',
    },
    {
      at: 'def run_agent(system_prompt, task):',
      trig: 'helper',
      set: { run_agent: '<function run_agent>' },
      exp: 'The same run_agent helper as the last three lessons: one API call with a job card (system prompt) and a task.',
    },
    {
      at: 'researcher_prompt = ',
      trig: 'rita-card',
      set: { researcher_prompt: str(RESEARCHER_PROMPT) },
      exp: "Rita's job card: ONE amazing, true fact about the topic, in one sentence. Each research job is small.",
    },
    {
      at: 'writer_prompt = ',
      trig: 'wally-card',
      set: { writer_prompt: str(WRITER_PROMPT) },
      exp: "Wally's job card: turn the facts into a fun 4-sentence poster. He works at the very end.",
    },
    {
      at: 'topics = [',
      trig: 'topics',
      set: { topics: pyList(topics) },
      exp: `${NUMBER_WORDS[n] ?? n} topics = ${(NUMBER_WORDS[n] ?? String(n)).toLowerCase()} jobs for Rita: ${topicsLine}. Each one gets its own lane on the race track.`,
    },
    {
      at: 'def research(topic):',
      trig: 'research-fn',
      set: { research: '<function research>' },
      exp: `research is ONE job: one topic in, one fact out. Inside, it is just run_agent with Rita's card and "Topic: ${topics[0]}".`,
    },
    {
      at: 'start = time.time()  # press the stopwatch',
      trig: 'seq-start',
      set: { start: sec(CLOCK) },
      exp: 'Race 1: one at a time. start = time.time() writes down the clock, like pressing start on a stopwatch.',
    },
  ];

  // Race 1: one lane per step, one after another.
  jobs.forEach((j, i) => {
    const last = i === n - 1;
    let exp: string;
    if (i === 0) {
      exp = `This line runs research once per topic, in order, and collects the answers in a list. Lane 1 first: Rita researches "${j.topic}".`;
    } else if (i === 1) {
      exp = `The ${j.topic} job can only start once ${jobs[0].topic} is done. Most of Rita's time is just waiting for OpenAI to answer, and the stopwatch keeps adding up.`;
    } else if (!last) {
      exp = `Next: "${j.topic}". Still one at a time: ${sec(offsets[i] + j.seconds)} seconds so far.`;
    } else {
      exp = `Last: "${j.topic}". All ${n} facts are saved in facts, in topic order. The times add up: ${sumLine} seconds.`;
    }
    defs.push({
      at: 'facts = [research(topic) for topic in topics]',
      trig: `seq-${i}`,
      set: last ? { facts: pyList(facts) } : undefined,
      exp,
    });
  });

  defs.push(
    {
      at: 'print(f"One at a time:',
      trig: 'seq-time',
      out: `One at a time: ${sec(seqTotal)} seconds`,
      exp: `Print the time: ${sec(seqTotal)} seconds (illustrative; yours will differ). One at a time, the total is the SUM of all the jobs.`,
    },
    {
      at: 'start = time.time()  # reset the stopwatch',
      trig: 'par-start',
      set: { start: sec(CLOCK + seqTotal) },
      exp: 'Race 2: all at once. Reset the stopwatch. We research the same topics again just to compare, which doubles the cost of this part.',
    },
    {
      at: 'with ThreadPoolExecutor() as pool:',
      trig: 'pool',
      set: { pool: '<ThreadPoolExecutor>' },
      exp: 'Open the team of helpers, called pool. When the with block ends, Python waits for every job to finish and sends the helpers home.',
    },
    {
      at: 'facts = list(pool.map(research, topics))',
      trig: 'par-go',
      exp: `pool.map gives each helper one job, like research("${topics[0]}"). All ${n} Ritas start at the same moment and wait for OpenAI side by side.`,
    },
    {
      at: 'facts = list(pool.map(research, topics))',
      trig: 'par-done',
      exp: `Each Rita finishes at her own pace. The ${fastest.topic} job ends first, but the stopwatch only stops when the slowest job, ${slowest.topic}, is done.`,
    },
    {
      at: 'facts = list(pool.map(research, topics))',
      trig: 'tray',
      set: { facts: pyList(facts) },
      exp: `pool.map hands the answers back in the SAME order as topics, even though the ${fastest.topic} job finished first. list() collects them into facts.`,
    },
    {
      at: 'print(f"All at once:',
      trig: 'par-time',
      out: `All at once: ${sec(parTotal)} seconds`,
      exp:
        n > 3
          ? `${sec(parTotal)} seconds instead of ${sec(seqTotal)}! More topics made race 1 longer, but race 2 still takes about as long as its slowest job.`
          : `Print the time: ${sec(parTotal)} seconds instead of ${sec(seqTotal)}. All at once, the total is about the SLOWEST job, not the sum.`,
    },
    {
      at: 'fact_list = "\\n".join(facts)',
      trig: 'join',
      set: { fact_list: str(factList) },
      exp: 'Glue the facts into one note, one per line. Wally needs ALL of them, so his step can only start after the whole team is done.',
    },
    {
      at: 'poster = run_agent(writer_prompt',
      trig: 'wally-work',
      exp: "Same run_agent, Wally's job card, and the facts note as his task. Just one job here, so no team is needed.",
    },
    {
      at: 'poster = run_agent(writer_prompt',
      trig: 'poster',
      set: { poster: str(run.poster) },
      exp: "Wally's poster comes back, built from every fact the team found. We save it in poster.",
    },
    {
      at: `print("\\nWally's poster:`,
      trig: 'poster',
      out: `\nWally's poster:\n${run.poster}`,
      exp: 'Print the poster. The research ran in parallel; the writing waited for it.',
    },
    {
      at: `print("\\nWally's poster:`,
      trig: 'when-not',
      exp: "When NOT to go parallel: when a job needs another job's answer (like Wally needs Rita's facts), or when too many calls at once would hit OpenAI's rate limit.",
    },
    {
      at: `print("\\nWally's poster:`,
      trig: 'recap',
      exp: 'What you learned: 1) agents mostly wait for OpenAI; 2) independent jobs can run at once with ThreadPoolExecutor, answers in order; 3) the total ≈ the slowest job, not the sum.',
    },
  );

  return buildTrace(defs);
}

const PLANETS: ParallelRun = {
  jobs: [
    {
      topic: 'Mars',
      seconds: 2.1,
      fact: 'Mars has the tallest volcano in the solar system, Olympus Mons, about two and a half times as tall as Mount Everest.',
    },
    {
      topic: 'Jupiter',
      seconds: 2.3,
      fact: "Jupiter's Great Red Spot is a storm wider than the whole Earth that has been swirling for more than 150 years.",
    },
    {
      topic: 'Saturn',
      seconds: 1.7,
      fact: 'Saturn is so light for its size that it would float in a giant bathtub of water.',
    },
  ],
  poster:
    "Blast off on a tour of the planets! On Mars, the volcano Olympus Mons towers about two and a half times higher than Mount Everest. Jupiter's Great Red Spot is a storm wider than the whole Earth, and it has been swirling for more than 150 years. And Saturn is so light for its size that it could float in a giant bathtub!",
};

const ANIMALS: ParallelRun = {
  jobs: [
    { topic: 'octopus', seconds: 1.9, fact: 'An octopus has three hearts and blue blood.' },
    { topic: 'owl', seconds: 2.2, fact: 'An owl can turn its head about 270 degrees to look behind itself.' },
    { topic: 'cheetah', seconds: 1.8, fact: 'The cheetah is the fastest land animal and can sprint at around 100 km/h.' },
  ],
  poster:
    "Meet three animal superstars! The octopus has three hearts pumping blue blood through its wiggly arms. The owl can swivel its head about 270 degrees to see what's behind it. And the cheetah, the fastest runner on land, can zoom along at around 100 km/h!",
};

const FIVE_PLANETS: ParallelRun = {
  jobs: [
    ...PLANETS.jobs,
    { topic: 'Venus', seconds: 2.0, fact: 'Venus spins so slowly that one turn takes longer than its whole trip around the Sun.' },
    { topic: 'Neptune', seconds: 2.2, fact: 'Neptune has the fastest winds in the solar system, reaching about 2,000 km per hour.' },
  ],
  poster:
    'Blast off on a tour of five amazing planets! Mars has a volcano about two and a half times taller than Mount Everest, and Jupiter has a storm wider than the whole Earth. Saturn could float in a giant bathtub, and Venus spins so slowly that one turn takes longer than a trip around the Sun. Out on Neptune, the winds roar at about 2,000 km per hour!',
};

/** The animation reads the active variant's run from here (topics, illustrative times, facts, poster). */
export const parallelRuns: Record<string, ParallelRun> = {
  default: PLANETS,
  variant2: ANIMALS,
  variant3: FIVE_PLANETS,
};

const listLine = (run: ParallelRun) => `topics = [${run.jobs.map((j) => `"${j.topic}"`).join(', ')}]`;

export const parallelAgentsTrace = parallelSteps(PLANETS);

// The topics line changes in the code panel, so inputValue is that exact line.
export const parallelAgentsVariants: TraceVariant[] = [
  { id: 'default', label: 'planets', inputValue: listLine(PLANETS), steps: parallelAgentsTrace },
  { id: 'variant2', label: 'animals', inputValue: listLine(ANIMALS), steps: parallelSteps(ANIMALS) },
  { id: 'variant3', label: '5 planets', inputValue: listLine(FIVE_PLANETS), steps: parallelSteps(FIVE_PLANETS) },
];
