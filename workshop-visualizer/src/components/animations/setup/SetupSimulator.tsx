'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import AgentBot, { TEAM } from '@/components/animations/characters/AgentBot';
import { CHECK_OUT, CMD, CYAN, GOLD, GREEN, OS, OsToggle, PIP_OUT, PY_VERSION, RED, RUN_OUT, Terminal, TermLine, spring } from './SetupParts';

// A pretend terminal: the student picks the next command. Everything is scripted,
// nothing is installed and no API is called.

type CmdId = 'version' | 'venv' | 'activate' | 'pip' | 'env' | 'check' | 'run';

interface SimState {
  venv: boolean;
  active: boolean;
  installed: boolean;
  env: boolean;
  checked: boolean;
  done: CmdId[];
}

interface Outcome {
  lines: TermLine[];
  kind: 'ok' | 'err' | 'warn';
  hint: string;
  fix?: string;
  next: Partial<SimState>;
}

const START: SimState = { venv: false, active: false, installed: false, env: false, checked: false, done: [] };

// scrambled on purpose, so the order is the student's job
const CHIP_ORDER: CmdId[] = ['check', 'venv', 'run', 'pip', 'version', 'env', 'activate'];

function cmdText(id: CmdId, os: OS) {
  switch (id) {
    case 'version':
      return CMD.version(os);
    case 'venv':
      return CMD.venv(os);
    case 'activate':
      return CMD.activate(os);
    case 'pip':
      return CMD.pip();
    case 'env':
      return CMD.copyEnv(os);
    case 'check':
      return CMD.check();
    case 'run':
      return CMD.run();
  }
}

const CHIP_NOTE: Partial<Record<CmdId, string>> = { env: 'then paste your key into .env' };

const traceback = (file: string, line: number, code: string): TermLine[] => [
  { t: 'out', text: 'Traceback (most recent call last):', tone: 'plain' },
  { t: 'out', text: `  File "${file}", line ${line}, in <module>`, tone: 'dim' },
  { t: 'out', text: `    ${code}`, tone: 'dim' },
];

function toolboxFix(s: SimState, os: OS) {
  return s.venv ? `Switch the toolbox on first: ${CMD.activate(os)}` : `Make the toolbox (${CMD.venv(os)}), then switch it on.`;
}

function run(id: CmdId, s: SimState, os: OS): Outcome {
  const macNoPython: Outcome = {
    lines: [{ t: 'out', text: 'zsh: command not found: python', tone: 'err' }],
    kind: 'err',
    hint: 'On a Mac, plain “python” only works inside the toolbox.',
    fix: toolboxFix(s, os),
    next: {},
  };
  switch (id) {
    case 'version':
      return { lines: [{ t: 'out', text: PY_VERSION, tone: 'ok' }], kind: 'ok', hint: 'Python is installed. Good start!', next: {} };
    case 'venv':
      return { lines: [], kind: 'ok', hint: 'No message = it worked. A .venv toolbox folder appeared.', next: { venv: true } };
    case 'activate':
      if (!s.venv) {
        return {
          lines: [{ t: 'out', text: os === 'mac' ? 'source: no such file or directory: .venv/bin/activate' : 'The system cannot find the path specified.', tone: 'err' }],
          kind: 'err',
          hint: "There's no toolbox to switch on yet.",
          fix: `Make it first: ${CMD.venv(os)}`,
          next: {},
        };
      }
      return { lines: [], kind: 'ok', hint: '(.venv) appeared at the start of the line: the toolbox is on.', next: { active: true } };
    case 'pip':
      if (!s.active) {
        if (os === 'mac') {
          return {
            lines: [{ t: 'out', text: 'zsh: command not found: pip', tone: 'err' }],
            kind: 'err',
            hint: 'Outside the toolbox, a Mac has no plain “pip”.',
            fix: toolboxFix(s, os),
            next: {},
          };
        }
        return {
          lines: [{ t: 'out', text: '(stopped before it ran)', tone: 'dim' }],
          kind: 'warn',
          hint: 'Wait! No (.venv) at the start of the line, so pip would install into your whole computer, not your project toolbox.',
          fix: toolboxFix(s, os),
          next: {},
        };
      }
      return { lines: PIP_OUT, kind: 'ok', hint: 'The toolbox now has openai, python-dotenv and tiktoken.', next: { installed: true } };
    case 'env':
      return {
        lines: [
          ...(os === 'win' ? [{ t: 'out' as const, text: '        1 file(s) copied.', tone: 'plain' as const }] : []),
          { t: 'out', text: '📝 You open .env and paste: OPENAI_API_KEY=sk-proj-…', tone: 'note' },
        ],
        kind: 'ok',
        hint: 'Your key is locked in the safe (.env).',
        next: { env: true },
      };
    case 'check':
      if (os === 'mac' && !s.active) return macNoPython;
      if (!s.active || !s.installed) {
        return {
          lines: [
            { t: 'out', text: 'Checking your setup...', tone: 'dim' },
            { t: 'out', text: `✓ ${PY_VERSION}`, tone: 'ok' },
            { t: 'out', text: '✗ openai is not installed', tone: 'err' },
            { t: 'out', text: '  Fix: switch on the toolbox, then run pip install -r requirements.txt', tone: 'warn' },
          ],
          kind: 'err',
          hint: 'The checker found a missing piece: the openai tools.',
          fix: s.active ? 'Run: pip install -r requirements.txt' : `${toolboxFix(s, os)} Then pip install.`,
          next: {},
        };
      }
      if (!s.env) {
        return {
          lines: [
            { t: 'out', text: 'Checking your setup...', tone: 'dim' },
            { t: 'out', text: `✓ ${PY_VERSION}`, tone: 'ok' },
            { t: 'out', text: '✓ openai is installed', tone: 'ok' },
            { t: 'out', text: '✗ No .env file with OPENAI_API_KEY', tone: 'err' },
            { t: 'out', text: '  Fix: copy .env.example to .env and paste your key', tone: 'warn' },
          ],
          kind: 'err',
          hint: 'Everything is ready except the key.',
          fix: `Run ${CMD.copyEnv(os)}, then paste your key into .env.`,
          next: {},
        };
      }
      return { lines: CHECK_OUT, kind: 'ok', hint: 'All green! Now run a lesson.', next: { checked: true } };
    case 'run':
      if (os === 'mac' && !s.active) return macNoPython;
      if (!s.active || !s.installed) {
        return {
          lines: [...traceback('part1/basic_api.py', 2, 'from openai import OpenAI'), { t: 'out', text: "ModuleNotFoundError: No module named 'openai'", tone: 'err' }],
          kind: 'err',
          hint: "ModuleNotFoundError: Python can't find the openai tools.",
          fix: s.active ? 'Run: pip install -r requirements.txt' : `${toolboxFix(s, os)} Then pip install.`,
          next: {},
        };
      }
      if (!s.env) {
        return {
          lines: [
            ...traceback('part1/basic_api.py', 3, 'client = OpenAI()'),
            { t: 'out', text: 'openai.OpenAIError: The api_key client option must be set either by passing api_key to the client or by setting the OPENAI_API_KEY environment variable', tone: 'err' },
          ],
          kind: 'err',
          hint: "No key found, so OpenAI() can't start.",
          fix: `Run ${CMD.copyEnv(os)}, then paste your key into .env.`,
          next: {},
        };
      }
      return {
        lines: RUN_OUT,
        kind: 'ok',
        hint: s.checked ? 'Your workshop works!' : 'It works! (Running check_setup.py first is a good habit.)',
        next: {},
      };
  }
}

interface Entry {
  cmd: string;
  venv: boolean;
  lines: TermLine[];
}

export default function SetupSimulator({ os, setOs }: { os: OS; setOs: (o: OS) => void }) {
  const [s, setS] = useState<SimState>(START);
  const [history, setHistory] = useState<Entry[]>([]);
  const [last, setLast] = useState<Outcome | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const finished = s.done.includes('run');

  const pick = (id: CmdId) => {
    const out = run(id, s, os);
    setHistory((h) => [...h, { cmd: cmdText(id, os), venv: s.active, lines: out.lines }]);
    setLast(out);
    if (out.kind === 'ok') setS((cur) => ({ ...cur, ...out.next, done: [...cur.done, id] }));
    else setMistakes((m) => m + 1);
  };
  const reset = () => {
    setS(START);
    setHistory([]);
    setLast(null);
    setMistakes(0);
  };

  const lines: TermLine[] = [
    { t: 'out', text: "(You're in the ai-course folder. Python is installed and your key is copied.)", tone: 'dim' },
    ...history.flatMap((e): TermLine[] => [{ t: 'cmd', cmd: e.cmd, venv: e.venv }, ...e.lines]),
    ...(finished ? [] : [{ t: 'idle' as const, venv: s.active }]),
  ];

  const hintColor = !last ? 'rgba(255,255,255,0.15)' : last.kind === 'ok' ? GREEN : last.kind === 'warn' ? GOLD : RED;

  return (
    <div className="absolute inset-0 flex gap-4 p-4 text-white">
      {/* ---------- controls ---------- */}
      <div className="w-[330px] shrink-0 flex flex-col gap-3">
        <div className="text-[13px] font-bold uppercase tracking-wide" style={{ color: CYAN }}>🧪 Try it yourself · Setup simulator</div>
        <OsToggle os={os} setOs={setOs} />
        <div className="text-[13px] text-white/60">Pick the next command:</div>
        <div className="flex flex-col gap-1.5">
          {CHIP_ORDER.map((id) => {
            const isDone = s.done.includes(id);
            return (
              <button
                key={id}
                onClick={() => pick(id)}
                disabled={isDone || finished}
                className="text-left rounded-lg border px-3 py-1.5 transition-colors disabled:cursor-default hover:bg-white/[0.08]"
                style={
                  isDone
                    ? { borderColor: `${GREEN}50`, backgroundColor: `${GREEN}10` }
                    : { borderColor: 'rgba(255,255,255,0.16)', backgroundColor: 'rgba(255,255,255,0.04)', opacity: finished ? 0.5 : 1 }
                }
              >
                <div className="font-mono text-[14px] flex items-center gap-2" style={{ color: isDone ? '#bbf7d0' : '#ffffff' }}>
                  <span className="w-4 shrink-0 text-center">{isDone ? '✓' : '›'}</span>
                  {cmdText(id, os)}
                </div>
                {CHIP_NOTE[id] && <div className="text-[12px] text-white/50 pl-6">{CHIP_NOTE[id]}</div>}
              </button>
            );
          })}
        </div>
        <div className="flex-1" />
        <div className="flex items-center justify-between text-[13px] text-white/55">
          <span>
            Steps done: <span className="text-white font-semibold">{s.done.length}/7</span> · Oops: <span className="text-white font-semibold">{mistakes}</span>
          </span>
          <button onClick={reset} className="px-3 py-1 rounded-md bg-white/[0.06] hover:bg-white/10 text-white/75">
            ↺ Start over
          </button>
        </div>
      </div>

      {/* ---------- terminal + helper ---------- */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex-1 min-h-0">
          <Terminal os={os} lines={lines} instant width="100%" fontSize={15} height="100%" />
        </div>
        <motion.div
          key={history.length}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="shrink-0 rounded-xl border-2 px-4 py-2.5 flex items-center gap-4 min-h-[92px]"
          style={{ borderColor: `${hintColor}90`, backgroundColor: last ? `${hintColor}12` : 'transparent' }}
        >
          <div className="shrink-0">
            <AgentBot color={TEAM.solo.color} badge={TEAM.solo.badge} size={54} mood={!last ? 'happy' : last.kind === 'ok' ? (finished ? 'proud' : 'happy') : 'confused'} active={finished} />
          </div>
          <div className="min-w-0">
            {!last && <div className="text-[15px] text-white/75">Which command comes first? Pick one on the left.</div>}
            {last && (
              <>
                <div className="text-[15px] font-semibold" style={{ color: last.kind === 'ok' ? '#bbf7d0' : last.kind === 'warn' ? '#fde68a' : '#fecaca' }}>
                  {last.kind === 'ok' ? '✓ ' : last.kind === 'warn' ? '✋ ' : '✗ '}
                  {last.hint}
                </div>
                {last.fix && (
                  <div className="text-[14px] text-white/85 mt-0.5">
                    <span style={{ color: GREEN }}>Fix: </span>
                    <span className="font-mono text-[13px]">{last.fix}</span>
                  </div>
                )}
                {finished && (
                  <div className="text-[14px] text-white/80 mt-0.5">
                    🎉 Workshop ready in {s.done.length} steps{mistakes ? `, with ${mistakes} oops fixed along the way` : ' with no mistakes'}. Try the other computer type, or start over.
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
