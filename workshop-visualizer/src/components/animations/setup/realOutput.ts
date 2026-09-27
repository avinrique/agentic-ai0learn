// What the course kit's helper scripts really print, copied from src/data/kit/scripts.ts
// (check_setup.py and run.py) and checked by running the real kit offline.
// The lesson's pretend terminals use these, so what students see here is what they
// will see on their own computer. If those scripts change, update the matching lines here.
import type { OS, TermLine } from './SetupParts';

export const PY_VERSION = 'Python 3.14.7'; // any 3.10+ works; this one is just an example
export const REQUIREMENTS = ['openai', 'python-dotenv', 'tiktoken'];

/** check_setup.py's test call asks for a hello "in 5 words or fewer"; this reply is illustrative. */
export const TEST_REPLY = 'Hello, future AI builder!';

export const CHECK_PROMPT = 'Make one tiny test call to OpenAI? (costs a tiny fraction of a cent) [y/N] ';
export const ALL_SET = 'All set! Next: python run.py part1/basic_api.py';

const ok = (text: string, wait?: number): TermLine => ({ t: 'out', text: `✓ ${text}`, tone: 'ok', wait });

/** check_setup.py prints the problem and its fix, then stops: one thing at a time. */
const problem = (message: string, fix: string): TermLine[] => [
  { t: 'out', text: `✗ ${message}`, tone: 'err' },
  { t: 'out', text: `  Fix: ${fix}`, tone: 'warn' },
];

export interface KitState {
  /** the Python that runs is the toolbox's one ((.venv) switched on) */
  venvOn: boolean;
  /** openai, python-dotenv and tiktoken are installed in that Python */
  installed: boolean;
  /** .env exists and holds the real key */
  envFile: boolean;
}

/** Output of `python check_setup.py`, answering y to the test call. */
export function checkSetupOut(s: KitState, os: OS): TermLine[] {
  const lines: TermLine[] = [{ t: 'out', text: 'Checking your setup...' }, ok(PY_VERSION)];

  // The three libraries (the script stops at the first one that's missing: openai)
  if (!s.installed) {
    const switchOn = os === 'win' ? '.venv\\Scripts\\activate' : 'source .venv/bin/activate';
    const fix = s.venvOn ? 'pip install -r requirements.txt' : `switch on the toolbox (${switchOn}), then run pip install -r requirements.txt`;
    return [...lines, ...problem('openai is not installed', fix)];
  }
  for (const pkg of REQUIREMENTS) lines.push(ok(`${pkg} is installed`));

  // The API key
  if (!s.envFile) return [...lines, ...problem('No .env file with OPENAI_API_KEY', 'copy .env.example to .env and paste your key')];
  lines.push(ok('Found OPENAI_API_KEY in .env'));

  // One tiny test call, only if you say yes
  lines.push({ t: 'out', text: CHECK_PROMPT, typed: 'y' });
  lines.push(ok(`OpenAI answered: ${TEST_REPLY}`, 0.8)); // the answer takes a moment to come back
  lines.push({ t: 'out', text: ALL_SET });
  return lines;
}

/** The happy path (the same on Mac and Windows). */
export const CHECK_OUT: TermLine[] = checkSetupOut({ venvOn: true, installed: true, envFile: true }, 'mac');

/** What run.py prints when python-dotenv can't be imported (libraries missing, or the toolbox is off). */
export const RUN_NO_LIBS: TermLine[] = [
  { t: 'out', text: "The course libraries aren't installed yet, or your toolbox (.venv) isn't switched on.", tone: 'err' },
  { t: 'out', text: 'Switch it on (see README.md), then run:  pip install -r requirements.txt', tone: 'warn' },
];

/** What run.py prints when there's no key (no .env file, or an empty key). */
export const RUN_NO_KEY: TermLine[] = [
  { t: 'out', text: 'No API key found.', tone: 'err' },
  { t: 'out', text: 'Copy .env.example to a new file called .env and paste your key after OPENAI_API_KEY=', tone: 'warn' },
  { t: 'out', text: 'Then check it with:  python check_setup.py', tone: 'warn' },
];

/** part1/basic_api.py's output. The poem is the example the Basic API lesson shows. */
export const RUN_OUT: TermLine[] = [
  { t: 'out', text: 'Sending a basic prompt to the AI...' },
  { t: 'out', text: '', wait: 0.8 },
  { t: 'out', text: "AI's Response:" },
  { t: 'out', text: 'Oh AI, you slice through data with ease,', tone: 'ai' },
  { t: 'out', text: 'Like mozzarella on a pizza breeze,', tone: 'ai' },
  { t: 'out', text: "But you'll never taste the cheesy goodness, please!", tone: 'ai' },
];

/** pip's output, shortened: the real one has many more lines for the helper libraries. */
export const PIP_OUT: TermLine[] = [
  { t: 'out', text: 'Collecting openai (from -r requirements.txt (line 1))' },
  { t: 'out', text: 'Collecting python-dotenv (from -r requirements.txt (line 2))' },
  { t: 'out', text: 'Collecting tiktoken (from -r requirements.txt (line 3))' },
  { t: 'out', text: '  … (more lines: the helper libraries they need) …', tone: 'dim' },
  { t: 'out', text: 'Installing collected packages: … tiktoken, python-dotenv, openai' },
  { t: 'out', text: 'Successfully installed … openai-… python-dotenv-… tiktoken-…', tone: 'ok' },
];

/** What Windows' copy command prints. (A Mac's cp prints nothing.) */
export const COPIED_WIN: TermLine = { t: 'out', text: '        1 file(s) copied.' };
