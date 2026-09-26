import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';
import { assemblyLineCode } from '@/data/code-snippets/part4';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 21 – Code: Assembly Line (Rita the researcher → Wally the writer)
//
// Builder: each step names a unique piece of code (`at`) instead of a raw line
// number, so line numbers stay correct if the snippet changes. Variables carry
// forward automatically; isNew / isChanged are computed for us.
// ─────────────────────────────────────────────────────────────────────────────
interface StepDef {
  at: string; // a substring that appears on exactly one line of the code
  exp: string;
  set?: Record<string, string>;
  out?: string;
  trig: string;
}

const CODE_LINES = assemblyLineCode.split('\n');

function lineOf(marker: string): number {
  const hits = CODE_LINES.map((l, i) => (l.includes(marker) ? i + 1 : 0)).filter(Boolean);
  if (hits.length !== 1) throw new Error(`assembly-line: marker "${marker}" found on ${hits.length} lines`);
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

const RESEARCHER_PROMPT =
  'You are Rita, a researcher. List 3 short, true facts about the topic. Facts only.';
const WRITER_PROMPT =
  'You are Wally, a writer for kids. Turn these facts into a fun 4-sentence paragraph.';

interface TopicRun {
  topic: string;
  facts: string;
  article: string;
}

function assemblyLineSteps(r: TopicRun): TraceStep[] {
  return buildTrace([
    {
      at: '# part4/assembly_line.py',
      trig: 'intro',
      exp: "What's new: TWO agents in a row, like a newsroom. Rita finds facts, Wally writes them up, and our code carries the note between their desks.",
    },
    {
      at: 'from openai import OpenAI',
      trig: 'setup',
      set: { OpenAI: '<class OpenAI>' },
      exp: 'Same start as Part 1: load the OpenAI library.',
    },
    {
      at: 'client = OpenAI()',
      trig: 'setup',
      set: { client: '<OpenAI client>' },
      exp: 'Create the client: our phone line to the AI. Both agents will use this same phone line.',
    },
    {
      at: 'def run_agent(system_prompt, task):',
      trig: 'helper',
      set: { run_agent: '<function run_agent>' },
      exp: 'Meet run_agent, our agent-maker. Give it a job card (system prompt) and a task, and it hands back the reply. Look at the machine at the bottom.',
    },
    {
      at: 'response = client.chat.completions.create(',
      trig: 'helper-open',
      exp: "Let's open the machine up. Inside is the very same API call you wrote in Part 1. Nothing new!",
    },
    {
      at: '{"role": "system", "content": system_prompt},',
      trig: 'helper-system',
      exp: 'The only thing that changes is this system message: the job card. A different card turns the same AI into a different agent.',
    },
    {
      at: '{"role": "user", "content": task},',
      trig: 'helper-task',
      exp: 'The task goes in as the user message: what we want done right now.',
    },
    {
      at: 'return response.choices[0].message.content',
      trig: 'helper-return',
      exp: "And the AI's answer text comes back out. That's a whole agent: one API call with its own job card.",
    },
    {
      at: 'researcher_prompt = ',
      trig: 'rita-card',
      set: { researcher_prompt: str(RESEARCHER_PROMPT) },
      exp: "Rita's job card, pinned above her desk: find 3 short, true facts. Facts only, no stories.",
    },
    {
      at: 'writer_prompt = ',
      trig: 'wally-card',
      set: { writer_prompt: str(WRITER_PROMPT) },
      exp: "Wally's job card: turn facts into a fun paragraph for kids. Same AI, different card.",
    },
    {
      at: 'topic = ',
      trig: 'topic',
      set: { topic: str(r.topic) },
      exp: `Today's assignment for the newsroom: ${r.topic}. It lands on Rita's desk first.`,
    },
    {
      at: 'print(f"Rita is researching {topic}...")',
      trig: 'rita-start',
      out: `Rita is researching ${r.topic}...`,
      exp: 'A quick message so we can see what is happening.',
    },
    {
      at: 'facts = run_agent(researcher_prompt',
      trig: 'rita-work',
      exp: `Station 1: our code calls run_agent with Rita's card and "Topic: ${r.topic}". Watch Rita think.`,
    },
    {
      at: 'facts = run_agent(researcher_prompt',
      trig: 'facts-note',
      set: { facts: str(r.facts) },
      exp: "Rita's reply comes back and gets stuck on a yellow sticky note. We save it in the variable facts.",
    },
    {
      at: `print("\\nRita's facts:")`,
      trig: 'facts-note',
      out: "\nRita's facts:",
      exp: "Print a heading for Rita's work.",
    },
    {
      at: 'print(facts)',
      trig: 'facts-note',
      out: r.facts,
      exp: 'Print the facts. Rita is done! She never writes the paragraph. That is not her job.',
    },
    {
      at: 'print("\\nWally is writing...")',
      trig: 'wally-start',
      out: '\nWally is writing...',
      exp: 'Time for station 2.',
    },
    {
      at: 'article = run_agent(writer_prompt',
      trig: 'carry',
      exp: 'The handoff! Our code carries the sticky note along the belt to Wally. His task is "Facts:" plus Rita\'s note. Rita and Wally never talk directly.',
    },
    {
      at: 'article = run_agent(writer_prompt',
      trig: 'wally-work',
      exp: "Same run_agent, new job card. Wally reads his card and Rita's facts, then writes.",
    },
    {
      at: 'article = run_agent(writer_prompt',
      trig: 'article',
      set: { article: str(r.article) },
      exp: "Wally's paragraph comes back. We save it in article. Look at his page: every fact came from Rita's note.",
    },
    {
      at: `print("\\nWally's paragraph:")`,
      trig: 'article',
      out: "\nWally's paragraph:",
      exp: "Print a heading for Wally's work.",
    },
    {
      at: 'print(article)',
      trig: 'article',
      out: r.article,
      exp: 'Print the finished paragraph. Two agents, one after the other: an assembly line!',
    },
    {
      at: 'print(article)',
      trig: 'recap',
      exp: "What you learned: 1) an agent is run_agent + its own job card; 2) one agent's answer becomes the next one's task; 3) our code carries the note.",
    },
  ]);
}

const VOLCANOES: TopicRun = {
  topic: 'volcanoes',
  facts:
    "1. A volcano is an opening where hot melted rock, called lava, comes out.\n2. Lava can be hotter than 1,000°C.\n3. Hawaii's Mauna Loa is the biggest active volcano on Earth.",
  article:
    "Did you know some mountains can burp fire? A volcano is an opening where hot melted rock, called lava, bursts out! That lava can be hotter than 1,000°C, way hotter than any oven. The biggest active volcano of all, Mauna Loa, lives in sunny Hawaii!",
};

const OCTOPUSES: TopicRun = {
  topic: 'octopuses',
  facts:
    '1. An octopus has three hearts.\n2. Its blood is blue.\n3. It can change colour in less than a second to hide.',
  article:
    "Meet the octopus, the ocean's sneakiest trickster! It has not one, not two, but THREE hearts. Its blood is blue, like a superhero's cape. And when danger swims by, it changes colour in a blink to hide!",
};

const MOON: TopicRun = {
  topic: 'the moon',
  facts:
    '1. The Moon is about 384,000 km from Earth.\n2. People first walked on the Moon in 1969.\n3. The Moon has no wind, so footprints there can last for millions of years.',
  article:
    'Look up tonight and wave at the Moon! It floats about 384,000 km away, a very long road trip. In 1969, astronauts took the first steps on its dusty ground. With no wind to blow them away, their footprints could stay for millions of years!',
};

export const assemblyLineTrace = assemblyLineSteps(VOLCANOES);

export const assemblyLineVariants: TraceVariant[] = [
  { id: 'default', label: 'volcanoes', inputValue: 'topic = "volcanoes"', steps: assemblyLineTrace },
  { id: 'variant2', label: 'octopuses', inputValue: 'topic = "octopuses"', steps: assemblyLineSteps(OCTOPUSES) },
  { id: 'variant3', label: 'the moon', inputValue: 'topic = "the moon"', steps: assemblyLineSteps(MOON) },
];
