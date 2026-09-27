import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';
import { testingAgentsCode } from '@/data/code-snippets/testing-agents';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 25 – Code: Testing Your Agent (a tiny test suite for the calculator agent)
//
// All three variants show the SAME code. Only what the model (or the add tool)
// does differs, so each variant is a pretend "what if the agent misbehaved?" run
// and the step text says so. Steps name a unique piece of code (`at`) instead of
// a raw line number, and variables carry forward automatically.
// ─────────────────────────────────────────────────────────────────────────────
interface StepDef {
  at: string; // a substring that appears on exactly one line of the code
  exp: string;
  set?: Record<string, string>;
  drop?: string[]; // variables that go away (e.g. a function's locals after it returns)
  out?: string;
  trig: string;
}

const CODE_LINES = testingAgentsCode.split('\n');

function lineOf(marker: string): number {
  const hits = CODE_LINES.map((l, i) => (l.includes(marker) ? i + 1 : 0)).filter(Boolean);
  if (hits.length !== 1) throw new Error(`testing-agents: marker "${marker}" found on ${hits.length} lines`);
  return hits[0];
}

function buildTrace(defs: StepDef[]): TraceStep[] {
  let vars: Variable[] = [];
  return defs.map((d) => {
    vars = vars.map((v) => ({ name: v.name, value: v.value }));
    if (d.drop) vars = vars.filter((v) => !d.drop!.includes(v.name));
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

/** Python-style string value for the Variables panel. */
const str = (s: string) => JSON.stringify(s);
const py = (b: boolean) => (b ? 'True' : 'False');

// ── The test cases (same as the `tests` list in the code) ────────────────────
export interface TestCase {
  question: string;
  expectTool: 'add' | null;
  mustContain: string;
  /** Short label for chips, e.g. '45 + 13'. */
  short: string;
  /** The numbers the AI passes to add (math tests only). */
  args?: [number, number];
}

export const TESTING_TESTS: TestCase[] = [
  { question: 'What is 45 + 13?', expectTool: 'add', mustContain: '58', short: '45 + 13', args: [45, 13] },
  { question: 'What is 250 + 175?', expectTool: 'add', mustContain: '425', short: '250 + 175', args: [250, 175] },
  { question: 'What is the capital of France?', expectTool: null, mustContain: 'Paris', short: 'France' },
];

// ── What the agent does on each test, per variant ────────────────────────────
export interface TestRun {
  toolUsed: 'add' | null;
  /** What add returned (only when the tool was used). */
  toolResult?: number;
  answer: string;
}

export interface TestingStory {
  kind: 'pass' | 'notool' | 'wrong';
  runs: TestRun[];
}

const FRANCE: TestRun = { toolUsed: null, answer: 'The capital of France is Paris.' };

export const TESTING_STORIES: Record<string, TestingStory> = {
  // Everything works: 3/3.
  default: {
    kind: 'pass',
    runs: [
      { toolUsed: 'add', toolResult: 58, answer: '45 + 13 = 58.' },
      { toolUsed: 'add', toolResult: 425, answer: '250 + 175 = 425.' },
      FRANCE,
    ],
  },
  // Pretend the model does 45 + 13 "in its head" instead of calling add: 2/3.
  variant2: {
    kind: 'notool',
    runs: [
      { toolUsed: null, answer: '45 + 13 = 58.' },
      { toolUsed: 'add', toolResult: 425, answer: '250 + 175 = 425.' },
      FRANCE,
    ],
  },
  // Pretend bug: add is miswired to subtract (a - b), and the AI trusts it: 1/3.
  variant3: {
    kind: 'wrong',
    runs: [
      { toolUsed: 'add', toolResult: 32, answer: '45 + 13 = 32.' },
      { toolUsed: 'add', toolResult: 75, answer: '250 + 175 = 75.' },
      FRANCE,
    ],
  },
};

/** Did this run pass each check? (Exactly what the Python code computes.) */
export function checkRun(t: TestCase, r: TestRun) {
  const toolOk = r.toolUsed === t.expectTool;
  const answerOk = r.answer.includes(t.mustContain);
  return { toolOk, answerOk, pass: toolOk && answerOk };
}

const pyTest = (t: TestCase) =>
  `{'question': '${t.question}', 'expect_tool': ${t.expectTool ? `'${t.expectTool}'` : 'None'}, 'must_contain': '${t.mustContain}'}`;
const pyTool = (tool: 'add' | null) => (tool ? str(tool) : 'None');

const L = {
  top: '# part3/testing_agents.py',
  client: 'client = OpenAI()',
  tools: 'tools = [{',
  askDef: 'def ask_agent(question):',
  create: 'tools=tools, temperature=0',
  noTool: 'return None, message.content',
  runAdd: 'result = add(arguments["a"], arguments["b"])',
  retTool: 'return tool_call.function.name',
  tests: 'tests = [',
  france: 'capital of France',
  passed0: 'passed = 0',
  forLine: 'for test in tests:',
  call: 'tool_used, answer = ask_agent(test["question"])',
  printQA: 'print(f"\\nQ:',
  toolOk: 'tool_ok = tool_used == test["expect_tool"]',
  answerOk: 'answer_ok = test["must_contain"] in answer',
  printPass: 'print("✅ PASS")',
  count: 'passed += 1',
  failTool: 'print(f"❌ FAIL: expected tool',
  failAnswer: 'print(f"❌ FAIL: the answer should contain',
  score: 'print(f"\\nScore:',
};

function testingSteps(story: TestingStory): TraceStep[] {
  const { kind, runs } = story;
  const variantNote =
    kind === 'notool' ? ' (This run pretends the agent skips its tool once.)'
    : kind === 'wrong' ? ' (This run pretends the add tool has a bug.)'
    : '';

  const defs: StepDef[] = [
    {
      at: L.top,
      trig: 'intro',
      exp: `What's new: testing. "It worked once" isn't proof, so we give our agent a quiz of 3 test questions, check every answer and get a score.${variantNote}`,
    },
    {
      at: L.client,
      trig: 'setup',
      set: { json: '<module json>', OpenAI: '<class OpenAI>', client: '<OpenAI client>' },
      exp: 'Same start as always: json to read tool arguments, and the client, our phone line to the AI.',
    },
    {
      at: L.tools,
      trig: 'agent',
      set: { add: '<function add>', tools: '[add tool]' },
      exp: "The agent we'll test is the calculator from Part 2. Its one tool is add, and tools is the menu card that describes add to the AI.",
    },
    {
      at: L.askDef,
      trig: 'wrapper',
      set: { ask_agent: '<function ask_agent>' },
      exp: 'We wrap the whole agent in one function. A question goes in, and two things come out: which tool it used, and its answer.',
    },
    {
      at: L.tests,
      trig: 'tests',
      set: { tests: '[3 test cases]' },
      exp: "A test case is a question plus what a good answer must have: the tool it should use, and text the answer must contain. Like a teacher's answer key.",
    },
    {
      at: L.france,
      trig: 'tests-none',
      exp: 'Test 3 expects NO tool (None). A good agent answers a geography question itself, without grabbing the calculator. Checking when NOT to use a tool matters too.',
    },
    {
      at: L.passed0,
      trig: 'score-init',
      set: { passed: '0' },
      exp: 'passed is our scoreboard. It starts at 0 and goes up by 1 for every test that passes.',
    },
  ];

  let passed = 0;
  TESTING_TESTS.forEach((t, i) => {
    const r = runs[i];
    const { toolOk, answerOk, pass } = checkRun(t, r);
    const first = i === 0;
    const qa = `\nQ: ${t.question}\nA: ${r.answer}`;
    const bug = kind === 'wrong' && r.toolUsed === 'add';

    defs.push({
      at: L.forLine,
      trig: 'test-start',
      set: { test: pyTest(t) },
      exp:
        i === 0 ? `The loop takes test 1 off the pile: "${t.question}" It should use add, and the answer must contain 58.`
        : i === 1 ? `Test 2: "${t.question}" Again it should use add, and the answer must contain 425.`
        : `Test 3: "${t.question}" No tool expected this time, and the answer must contain Paris.`,
    });

    if (first) {
      // Test 1 in slow motion: inside ask_agent, line by line.
      defs.push(
        {
          at: L.call,
          trig: 'ask',
          exp: 'Our code hands the question to the agent through ask_agent, just like a real user asking it.',
        },
        {
          at: L.create,
          trig: 'temp0',
          exp: 'Inside ask_agent, see temperature=0: the AI picks its most likely words, so the same question gives (almost) the same answer every run. Tests need repeatable results.',
        },
      );
      if (r.toolUsed === null) {
        defs.push({
          at: L.noTool,
          trig: 'no-tool',
          set: { tool_used: 'None', answer: str(r.answer) },
          exp: 'In this run we pretend the AI skipped the tool and did the math in its head. No tool_calls, so ask_agent returns None as the tool.',
        });
      } else {
        defs.push(
          {
            at: L.runAdd,
            trig: 'tool-run',
            set: { result: String(r.toolResult) },
            exp: bug
              ? `Pretend bug: imagine add says a - b instead of a + b (the code shown is unchanged). So add(45, 13) returns ${r.toolResult}, not 58.`
              : `The AI asked for add with a=45 and b=13. Our code runs the real function: result = ${r.toolResult}.`,
          },
          {
            at: L.retTool,
            trig: 'returned',
            drop: ['result'],
            set: { tool_used: pyTool(r.toolUsed), answer: str(r.answer) },
            exp: bug
              ? `The AI trusts its tool and writes "${r.answer}" ask_agent returns the tool it used ("add") and that wrong answer.`
              : 'The result goes back to the AI, which writes its final answer. ask_agent returns two things: the tool it used ("add") and the answer.',
          },
        );
      }
      defs.push({
        at: L.printQA,
        trig: 'print',
        out: qa,
        exp: "Print the question and the agent's answer so we can read them.",
      });
    } else {
      // Tests 2 and 3: the same path, shown in one step.
      const noToolPath = r.toolUsed === null;
      defs.push({
        at: noToolPath ? L.noTool : L.call,
        trig: 'returned',
        set: { tool_used: pyTool(r.toolUsed), answer: str(r.answer) },
        exp: noToolPath
          ? `The AI answers "${r.answer}" with no tool call, so ask_agent takes this early return: None for the tool, plus the answer.`
          : bug
            ? `The pretend bug strikes again: add(250, 175) returns ${r.toolResult}, so the agent answers "${r.answer}"`
            : kind === 'notool'
              ? `This time the agent does use its tool: add(250, 175) gives ${r.toolResult}, and it answers "${r.answer}"`
              : `Same path as test 1: the agent calls add(250, 175), gets ${r.toolResult}, and answers "${r.answer}"`,
      });
    }

    // Check 1: behaviour (the right tool, or none).
    const expectName = t.expectTool ?? 'None';
    const usedName = r.toolUsed ?? 'None';
    defs.push({
      at: L.toolOk,
      trig: 'check-tool',
      set: { tool_ok: py(toolOk) },
      out: first ? undefined : qa,
      exp: first
        ? toolOk
          ? `Check 1, behaviour: did it use the right tool? Expected add, and it used add. tool_ok is True ✓${bug ? ' So far so good...' : ''}`
          : 'Check 1, behaviour: did it use the right tool? Expected add, but it used None. tool_ok is False ✗ It skipped its calculator.'
        : i === 1
          ? `The Q and A are printed. Check 1: expected add, and it used ${usedName} ${toolOk ? '✓' : '✗'}`
          : `Check 1: expected ${expectName}, and it used ${usedName} ✓ It rightly left the calculator alone.`,
    });

    // Check 2: output (contains the key text).
    const containsNote = '(We check "contains", not exact words, since the AI\'s wording changes.)';
    defs.push({
      at: L.answerOk,
      trig: 'check-answer',
      set: { answer_ok: py(answerOk) },
      exp: first
        ? kind === 'pass'
          ? 'Check 2, output: does the answer contain "58"? Yes ✓ We check "contains", not exact words, because the AI\'s wording changes: "58." and "It\'s 58!" both pass.'
          : answerOk
            ? `Check 2, output: does the answer contain "58"? Yes ✓ ${containsNote} The answer itself is right!`
            : `Check 2, output: does the answer contain "58"? It says ${r.toolResult}, so no ✗ ${containsNote}`
        : answerOk
          ? `Check 2: "${t.mustContain}" is in the answer ✓`
          : `Check 2: "${t.mustContain}" is not in "${r.answer}" ✗`,
    });

    if (pass) {
      passed += 1;
      if (first) {
        defs.push(
          { at: L.printPass, trig: 'pass', out: '✅ PASS', exp: 'Both checks ticked, so test 1 passes. ✅' },
          { at: L.count, trig: 'count', set: { passed: String(passed) }, exp: `passed goes up to ${passed}. One point on the scoreboard!` },
        );
      } else {
        defs.push({
          at: L.count,
          trig: 'pass',
          out: '✅ PASS',
          set: { passed: String(passed) },
          exp: `Both checks pass: ✅ PASS, and passed goes up to ${passed}.`,
        });
      }
    } else if (!toolOk) {
      defs.push(
        {
          at: L.failTool,
          trig: 'fail',
          out: `❌ FAIL: expected tool ${expectName}, but it used ${usedName}`,
          exp: `tool_ok is False, so we print a FAIL with the reason: expected tool ${expectName}, but it used ${usedName}. No point this time.`,
        },
        {
          at: L.failTool,
          trig: 'fail-why',
          exp: 'Why fail a right answer? Without the tool, the AI is guessing. It got lucky on 45 + 13, but on bigger sums it can slip. Right answer AND right tool = pass.',
        },
      );
    } else {
      defs.push({
        at: L.failAnswer,
        trig: 'fail',
        out: `❌ FAIL: the answer should contain '${t.mustContain}'`,
        exp: first
          ? `answer_ok is False, so we print a FAIL with the reason: the answer should contain '58'. No point this time.`
          : `❌ FAIL again: the answer should contain '${t.mustContain}'. One bug broke two tests!`,
      });
      if (first) {
        defs.push({
          at: L.failAnswer,
          trig: 'fail-why',
          exp: 'Notice: the tool check passed, so on its own it would have missed this bug. Checking behaviour AND output catches more problems.',
        });
      }
    }
  });

  const total = TESTING_TESTS.length;
  defs.push(
    {
      at: L.score,
      trig: 'score',
      out: `\nScore: ${passed}/${total} passed`,
      exp:
        kind === 'pass' ? `The final score: ${passed}/${total} passed. A number you can track, instead of "I tried it once and it seemed fine."`
        : kind === 'notool' ? `The final score: ${passed}/${total} passed. The report shows exactly which test failed, and why.`
        : `The final score: ${passed}/${total} passed. One bug broke two tests, and both FAIL reasons point at the math, so you'd check the add tool first.`,
    },
    {
      at: L.score,
      trig: 'regress',
      exp:
        kind === 'pass'
          ? 'Re-run ALL tests after every change to the prompt or tools. If 3/3 drops to 2/3, your change broke something: a "regression", a step backwards.'
          : kind === 'notool'
            ? 'To fix it, you might add a system prompt like "Always use add for sums." Then re-run ALL tests: a fix can break something else (a "regression", a step backwards).'
            : 'Fix the bug in add, then re-run ALL tests until it is back to 3/3. Re-run after every change too, so a step backwards (a "regression") never sneaks in.',
    },
    {
      at: L.tests,
      trig: 'bigger',
      exp: 'Real projects use the same idea with many more test cases. Some even ask a second AI to act as a judge for answers that "contains" can\'t check.',
    },
    {
      at: L.score,
      trig: 'recap',
      exp: 'What you learned: 1) a test = a question + what a good answer must have; 2) check the tool used AND the answer; 3) re-run all tests after every change and track the score.',
    },
  );

  return buildTrace(defs);
}

export const testingAgentsTrace = testingSteps(TESTING_STORIES.default);

// The variants differ in what the model / tool does, not in the code, so inputValue
// is a token that never appears in the code (the code panel stays unchanged).
export const testingAgentsVariants: TraceVariant[] = [
  { id: 'default', label: 'All pass (3/3)', inputValue: '<<testing-agents:all-pass>>', steps: testingAgentsTrace },
  { id: 'variant2', label: 'Tool not used', inputValue: '<<testing-agents:no-tool>>', steps: testingSteps(TESTING_STORIES.variant2) },
  { id: 'variant3', label: 'Wrong answer (buggy tool)', inputValue: '<<testing-agents:wrong>>', steps: testingSteps(TESTING_STORIES.variant3) },
];
