// What the course kit's helper scripts really print, copied word for word from
// src/data/kit/scripts.ts (check_setup.py and run.py). The lesson's pretend terminals
// use these, so what students see here is what they will see on their own computer.
// If those scripts change, update the matching lines here.
import type { TermLine } from './SetupParts';

export const PY_VERSION = 'Python 3.13.7'; // any 3.10+ works; this one is just an example
export const REQUIREMENTS = ['openai', 'python-dotenv', 'tiktoken'];

// Illustrative reply and token counts for check_setup.py's tiny test call
// ("Say hello to a new AI student in 5 words or fewer.").
const TEST_REPLY = 'Hello, future AI builder!';
const TEST_TOKENS = { in: 20, out: 6 };

export const CHECK_PROMPT = 'Make one tiny test call to OpenAI? (costs a tiny fraction of a cent) [y/N] ';
export const ALL_SET = 'All set! Next: python run.py part1/basic_api.py';

const ok = (text: string): TermLine => ({ t: 'out', text: `✓ ${text}`, tone: 'ok' });
const problem = (message: string, fix: string): TermLine[] => [
  { t: 'out', text: `✗ ${message}`, tone: 'err' },
  { t: 'out', text: `  Fix: ${fix}`, tone: 'warn' },
];

export interface KitState {
  /** (.venv) is switched on */
  venvOn: boolean;
  /** pip install -r requirements.txt ran inside the .venv */
  installed: boolean;
  /** .env exists and holds the real key */
  envFile: boolean;
}

/** Output of `python check_setup.py` (answering y to the test call), mirroring the real script. */
export function checkSetupOut(s: KitState): TermLine[] {
  const lines: TermLine[] = [{ t: 'out', text: 'Checking your setup...', tone: 'plain' }];
  let problems = 0;

  // 1. Python 3.10 or newer
  lines.push(ok(PY_VERSION));

  // 2. The three libraries
  for (const pkg of REQUIREMENTS) {
    if (s.installed) {
      lines.push(ok(`${pkg} is installed`));
    } else {
      problems += 1;
      lines.push(...problem(`${pkg} is not installed`, 'pip install -r requirements.txt'));
    }
  }
  if (!s.installed && !s.venvOn) {
    lines.push({ t: 'out', text: "  Tip: your .venv isn't turned on. Mac/Linux: source .venv/bin/activate", tone: 'plain' });
    lines.push({ t: 'out', text: '       Windows: .venv\\Scripts\\activate', tone: 'plain' });
  }

  // 3. The API key (the script reads .env with python-dotenv, so it needs the libraries)
  const keyLoaded = s.envFile && s.installed;
  if (keyLoaded) {
    lines.push(ok('Found OPENAI_API_KEY in .env'));
  } else {
    problems += 1;
    if (s.envFile) lines.push(...problem('Your .env file has no key in it', 'open .env and paste your key after OPENAI_API_KEY='));
    else lines.push(...problem('No .env file with your API key', 'copy .env.example to a new file called .env, then paste your key into it'));
  }

  if (problems) {
    lines.push({ t: 'out', text: '' });
    lines.push({ t: 'out', text: 'Fix the lines marked ✗, then run this check again.', tone: 'plain' });
    return lines;
  }

  // 4. One tiny test call, only if you say yes
  lines.push({ t: 'out', text: `${CHECK_PROMPT}y`, tone: 'warn' });
  lines.push({ ...ok(`OpenAI answered: ${TEST_REPLY}`), wait: 0.7 });
  lines.push({ t: 'out', text: `  Tokens used: ${TEST_TOKENS.in} in + ${TEST_TOKENS.out} out = ${TEST_TOKENS.in + TEST_TOKENS.out}`, tone: 'dim' });
  lines.push({ t: 'out', text: ALL_SET, tone: 'note' });
  return lines;
}

/** The happy path: everything set up. */
export const CHECK_OUT: TermLine[] = checkSetupOut({ venvOn: true, installed: true, envFile: true });

/** What run.py prints when python-dotenv can't be imported (libraries missing or .venv off). */
export const RUN_NO_LIBS: TermLine[] = [
  { t: 'out', text: "The course libraries aren't installed yet, or your .venv isn't turned on.", tone: 'err' },
  { t: 'out', text: 'Turn on the .venv (see README.md), then run:  pip install -r requirements.txt', tone: 'warn' },
];

/** What run.py prints when there's no key in .env. */
export const RUN_NO_KEY: TermLine[] = [
  { t: 'out', text: 'No API key found.', tone: 'err' },
  { t: 'out', text: 'Copy .env.example to a new file called .env and paste your key after OPENAI_API_KEY=', tone: 'warn' },
  { t: 'out', text: 'Then check it with:  python check_setup.py', tone: 'warn' },
];

/** part1/basic_api.py's output. The poem is the example the Basic API lesson shows. */
export const RUN_OUT: TermLine[] = [
  { t: 'out', text: 'Sending a basic prompt to the AI...', tone: 'plain' },
  { t: 'out', text: '', tone: 'plain', wait: 0.8 },
  { t: 'out', text: "AI's Response:", tone: 'plain' },
  { t: 'out', text: 'Oh AI, you slice through data with ease,', tone: 'ai' },
  { t: 'out', text: 'Like mozzarella on a pizza breeze,', tone: 'ai' },
  { t: 'out', text: "But you'll never taste the cheesy goodness, please!", tone: 'ai' },
];

/** pip's output, shortened: the real one has many more lines for the helper libraries. */
export const PIP_OUT: TermLine[] = [
  { t: 'out', text: 'Collecting openai (from -r requirements.txt (line 1))', tone: 'plain' },
  { t: 'out', text: 'Collecting python-dotenv (from -r requirements.txt (line 2))', tone: 'plain' },
  { t: 'out', text: 'Collecting tiktoken (from -r requirements.txt (line 3))', tone: 'plain' },
  { t: 'out', text: '  … (more lines: the helper libraries they need) …', tone: 'dim' },
  { t: 'out', text: 'Installing collected packages: … tiktoken, python-dotenv, openai', tone: 'plain' },
  { t: 'out', text: 'Successfully installed … openai-… python-dotenv-… tiktoken-…', tone: 'ok' },
];
