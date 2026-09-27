'use client';
import { motion } from 'framer-motion';
import { KeyboardEvent, useState } from 'react';
import AgentBot, { TEAM } from '@/components/animations/characters/AgentBot';
import { CMD, CYAN, GOLD, GREEN, OS, OsToggle, RED, Terminal, TermLine, spring } from './SetupParts';
import { CHECK_OUT, COPIED_WIN, PIP_OUT, PY_VERSION, RUN_NO_KEY, RUN_NO_LIBS, RUN_OUT, checkSetupOut } from './realOutput';

// A pretend terminal: the student picks the next command. Everything is scripted,
// nothing is installed and no API is called. The error messages are the ones the
// real kit (run.py, check_setup.py) and the real Mac / Windows terminals print.

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
  /** what the terminal prints; null = the command never ran (Solo Bot stopped it) */
  lines: TermLine[] | null;
  kind: 'ok' | 'err' | 'warn';
  hint: string;
  fix?: string;
  next: Partial<SimState>;
}

interface Entry {
  cmd: string;
  venv: boolean;
  lines: TermLine[];
}

/** One computer's progress. Mac and Windows each keep their own. */
interface Run {
  s: SimState;
  history: Entry[];
  last: Outcome | null;
  mistakes: number;
}

const START: SimState = { venv: false, active: false, installed: false, env: false, checked: false, done: [] };
const FRESH: Run = { s: START, history: [], last: null, mistakes: 0 };

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

const CHIP_NOTE: Partial<Record<CmdId, string>> = { env: 'then put your key in .env' };

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
  // The libraries count only if they're in the Python that runs: the toolbox's one.
  const kit = { venvOn: s.active, installed: s.active && s.installed, envFile: s.env };
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
          lines: null,
          kind: 'warn',
          hint: 'Wait! No (.venv) at the start of the line, so pip would fill your whole computer, not the project toolbox. I stopped it before Enter.',
          fix: toolboxFix(s, os),
          next: {},
        };
      }
      return { lines: PIP_OUT, kind: 'ok', hint: 'The toolbox now has openai, python-dotenv and tiktoken.', next: { installed: true } };
    case 'env':
      return {
        lines: os === 'win' ? [COPIED_WIN] : [],
        kind: 'ok',
        hint: 'You made .env, then pasted your key over sk-your-key-here. It’s in the safe now.',
        next: { env: true },
      };
    case 'check':
      if (os === 'mac' && !s.active) return macNoPython;
      if (!kit.installed) {
        return {
          lines: checkSetupOut(kit, os),
          kind: 'err',
          hint: 'The checker stops at the first missing piece: the openai library.',
          fix: s.active ? CMD.pip() : `${toolboxFix(s, os)} Then pip install.`,
          next: {},
        };
      }
      if (!s.env) {
        return {
          lines: checkSetupOut(kit, os),
          kind: 'err',
          hint: 'Everything is ready except the key.',
          fix: `${CMD.copyEnv(os)}, then put your key in .env.`,
          next: {},
        };
      }
      return { lines: CHECK_OUT, kind: 'ok', hint: 'All green! Now run a lesson.', next: { checked: true } };
    case 'run':
      if (os === 'mac' && !s.active) return macNoPython;
      if (!kit.installed) {
        return {
          lines: RUN_NO_LIBS,
          kind: 'err',
          hint: 'run.py can’t find the course libraries.',
          fix: s.active ? CMD.pip() : `${toolboxFix(s, os)} Then pip install.`,
          next: {},
        };
      }
      if (!s.env) {
        return {
          lines: RUN_NO_KEY,
          kind: 'err',
          hint: 'run.py looked for your key and found none.',
          fix: `${CMD.copyEnv(os)}, then put your key in .env.`,
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

/** The lesson uses Space for play/pause. On a focused button, Space should press the button instead. */
function keepSpaceForButtons(e: KeyboardEvent) {
  if (e.key === ' ' && (e.target as HTMLElement).closest('button')) e.stopPropagation();
}

export default function SetupSimulator({ os, setOs }: { os: OS; setOs: (o: OS) => void }) {
  const [runs, setRuns] = useState<Record<OS, Run>>({ mac: FRESH, win: FRESH });
  const { s, history, last, mistakes } = runs[os];
  const finished = s.done.includes('run');
  const update = (fn: (r: Run) => Run) => setRuns((all) => ({ ...all, [os]: fn(all[os]) }));

  const pick = (id: CmdId) => {
    const out = run(id, s, os);
    update((r) => ({
      s: out.kind === 'ok' ? { ...r.s, ...out.next, done: [...r.s.done, id] } : r.s,
      history: out.lines ? [...r.history, { cmd: cmdText(id, os), venv: r.s.active, lines: out.lines }] : r.history,
      last: out,
      mistakes: out.kind === 'ok' ? r.mistakes : r.mistakes + 1,
    }));
  };
  const reset = () => update(() => FRESH);

  const lines: TermLine[] = [
    { t: 'out', text: "(You're in the ai-course folder. Python is installed and your key is copied.)", tone: 'dim' },
    ...history.flatMap((e): TermLine[] => [{ t: 'cmd', cmd: e.cmd, venv: e.venv }, ...e.lines]),
    ...(finished ? [] : [{ t: 'idle' as const, venv: s.active }]),
  ];

  const hintColor = !last ? '#ffffff' : last.kind === 'ok' ? GREEN : last.kind === 'warn' ? GOLD : RED;

  return (
    <div className="absolute inset-0 flex gap-4 p-4 text-white" onKeyDown={keepSpaceForButtons}>
      {/* ---------- controls ---------- */}
      <div className="w-[330px] shrink-0 min-h-0 flex flex-col gap-2.5">
        <div className="text-[13px] font-bold uppercase tracking-wide" style={{ color: CYAN }}>
          🧪 Try it yourself
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] text-white/60">Pick the next command:</span>
          <OsToggle os={os} setOs={setOs} />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5 pr-1" style={{ scrollbarWidth: 'thin' }}>
          {CHIP_ORDER.map((id) => {
            const isDone = s.done.includes(id);
            return (
              <button
                key={id}
                onClick={() => pick(id)}
                disabled={isDone || finished}
                className="shrink-0 text-left rounded-lg border px-3 py-1.5 transition-colors disabled:cursor-default hover:bg-white/[0.08]"
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
                {CHIP_NOTE[id] && <div className="text-[13px] text-white/50 pl-6">{CHIP_NOTE[id]}</div>}
              </button>
            );
          })}
        </div>
        <div className="shrink-0 flex items-center justify-between text-[13px] text-white/55">
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
          <Terminal os={os} lines={lines} instant scroll width="100%" fontSize={15} height="100%" />
        </div>
        <motion.div
          key={`${os}-${history.length}-${mistakes}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="shrink-0 rounded-xl border-2 px-4 py-2.5 flex items-center gap-4 min-h-[92px]"
          style={{ borderColor: `${hintColor}${last ? '90' : '26'}`, backgroundColor: last ? `${hintColor}12` : 'transparent' }}
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
