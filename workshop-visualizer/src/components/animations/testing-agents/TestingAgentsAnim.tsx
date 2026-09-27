'use client';
/**
 * TestingAgentsAnim — Lesson 25 (Code: Testing Your Agent).
 *
 * "The Test Machine": each test card slides in, Calc Bot (the agent under test)
 * works on the question, two check lights (right tool? key text in the answer?)
 * turn green or red, the card gets a PASS / FAIL stamp and the scoreboard up top
 * fills. Everything is derived from the current tracer step (and the active variant).
 */
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import AgentBot, { BotMood } from '@/components/animations/characters/AgentBot';
import { useTracerStore } from '@/stores/tracerStore';
import { useTracerScene } from '@/components/animations/part4/useTracerScene';
import {
  TESTING_STORIES,
  TESTING_TESTS,
  checkRun,
  TestCase,
  TestRun,
} from '@/data/traces/testing-agents';

const ACCENT = '#22d3ee';
const GREEN = '#4ade80';
const RED = '#f87171';
const GOLD = '#fbbf24';
const BOT = { name: 'Calc Bot', color: '#4a9eff', badge: '➕' };

/** Where we are inside one test run (higher = later). */
const PHASE: Record<string, number> = {
  'test-start': 0,
  ask: 1,
  temp0: 2,
  'tool-run': 3,
  'no-tool': 3,
  returned: 4,
  print: 5,
  'check-tool': 6,
  'check-answer': 7,
  pass: 8,
  fail: 8,
  count: 9,
  'fail-why': 9,
};

type SlotState = 'pending' | 'running' | 'pass' | 'fail';

// ── Small building blocks ────────────────────────────────────────────────────

/** A test case drawn as a white index card. */
function TestCard({
  test,
  n,
  stamp,
  glowNone,
  compact,
}: {
  test: TestCase;
  n: number;
  stamp?: 'PASS' | 'FAIL';
  glowNone?: boolean;
  compact?: boolean;
}) {
  const stampColor = stamp === 'PASS' ? '#16a34a' : '#dc2626';
  return (
    <div className="relative w-full h-full rounded-lg bg-white text-slate-800 shadow-xl p-4 flex flex-col">
      <div className="text-[13px] font-bold tracking-wider text-slate-500">TEST {n}</div>
      <div className={`${compact ? 'text-[19px]' : 'text-[20px]'} font-bold leading-snug mt-1`}>{test.question}</div>
      <div className="mt-auto pt-2.5 border-t border-slate-200 flex flex-col gap-1 text-[15px]">
        <div>
          <span className="text-slate-500">🔧 tool:</span>{' '}
          <b
            className="font-mono px-1 rounded"
            style={glowNone ? { background: `${GOLD}66`, boxShadow: `0 0 0 2px ${GOLD}` } : undefined}
          >
            {test.expectTool ?? 'None'}
          </b>
        </div>
        <div>
          <span className="text-slate-500">📝 must contain:</span> <b className="font-mono">&quot;{test.mustContain}&quot;</b>
        </div>
      </div>
      {stamp && (
        <motion.div
          key={stamp}
          initial={{ scale: 2.4, opacity: 0, rotate: -25 }}
          animate={{ scale: 1, opacity: 1, rotate: -12 }}
          transition={{ type: 'spring', damping: 12, stiffness: 180 }}
          className="absolute -top-4 -right-4 pointer-events-none"
        >
          <span
            className="px-2.5 py-0.5 rounded-lg text-[20px] font-black tracking-widest"
            style={{ color: stampColor, border: `4px solid ${stampColor}`, background: 'rgba(255,255,255,0.9)' }}
          >
            {stamp}
          </span>
        </motion.div>
      )}
    </div>
  );
}

/** The scoreboard: one slot per test, plus the passed count. */
function Scoreboard({ states, passed, bump, big }: { states: SlotState[]; passed: number; bump?: boolean; big?: boolean }) {
  return (
    <div className={`flex items-center ${big ? 'gap-3' : 'gap-2'}`}>
      {states.map((s, i) => {
        const color = s === 'pass' ? GREEN : s === 'fail' ? RED : s === 'running' ? ACCENT : 'rgba(255,255,255,0.25)';
        return (
          <motion.div
            key={i}
            animate={{ scale: s === 'running' ? 1.06 : 1 }}
            className={`flex items-center gap-1.5 rounded-lg font-semibold ${big ? 'px-5 py-3.5 text-[20px]' : 'px-2.5 py-1 text-[14px]'}`}
            style={{
              border: `1.5px ${s === 'pending' ? 'dashed' : 'solid'} ${color}`,
              color: s === 'pending' ? 'rgba(255,255,255,0.4)' : color,
              background: s === 'pass' || s === 'fail' ? `${color}18` : 'transparent',
              boxShadow: s === 'running' ? `0 0 12px ${ACCENT}66` : 'none',
            }}
          >
            <span className="font-mono">#{i + 1}</span>
            <span>{s === 'pass' ? '✓' : s === 'fail' ? '✗' : s === 'running' ? '…' : ''}</span>
          </motion.div>
        );
      })}
      <div className="relative ml-1">
        <motion.span
          key={passed}
          initial={bump ? { scale: 1.6, color: GREEN } : false}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.6 }}
          className={`inline-block font-mono font-bold ${big ? 'text-[44px]' : 'text-[20px]'}`}
        >
          {passed}
        </motion.span>
        <span className={`font-mono text-white/50 ${big ? 'text-[30px]' : 'text-[16px]'}`}> / {states.length}</span>
        {bump && (
          <motion.span
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute left-0 top-full text-[16px] font-black whitespace-nowrap"
            style={{ color: GREEN }}
          >
            +1
          </motion.span>
        )}
      </div>
    </div>
  );
}

/** One check light: pending, or ticked / crossed. */
function CheckRow({
  icon,
  title,
  detail,
  ok,
  shown,
  focal,
  dim,
  note,
  noteColor,
}: {
  icon: string;
  title: ReactNode;
  detail: ReactNode;
  ok: boolean;
  shown: boolean;
  focal: boolean;
  dim: boolean;
  note?: string;
  noteColor?: string;
}) {
  const color = !shown ? 'rgba(255,255,255,0.22)' : ok ? GREEN : RED;
  return (
    <motion.div
      animate={{ scale: focal ? 1.05 : 1, opacity: dim ? 0.4 : 1 }}
      transition={{ duration: 0.3 }}
      className="relative w-full rounded-xl px-4 py-3.5"
      style={{
        border: `2px ${shown ? 'solid' : 'dashed'} ${color}`,
        background: shown ? `${color}12` : 'transparent',
        boxShadow: focal ? `0 0 18px ${color}55` : 'none',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[20px]">{icon}</span>
        <span className="text-[18px] font-semibold text-white/90">{title}</span>
        <span className="ml-auto">
          {shown ? (
            <motion.span
              key={ok ? 'ok' : 'no'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[20px] font-black"
              style={{ background: color, color: '#0a0a1a' }}
            >
              {ok ? '✓' : '✗'}
            </motion.span>
          ) : (
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-[17px] text-white/30 border border-white/20">?</span>
          )}
        </span>
      </div>
      {shown && <div className="mt-1.5 text-[15px] text-white/70">{detail}</div>}
      {note && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 w-fit text-[14px] font-semibold px-2.5 py-0.5 rounded-full"
          style={{ color: noteColor, border: `1.5px solid ${noteColor}`, background: `${noteColor}18` }}
        >
          {note}
        </motion.div>
      )}
    </motion.div>
  );
}

/** The agent's final answer as a speech bubble, with the must-contain text marked during/after check 2. */
function AnswerBubble({ answer, mark, found, bright }: { answer: string; mark?: string; found: boolean; bright: boolean }) {
  let body: ReactNode = answer;
  if (mark && found) {
    const i = answer.indexOf(mark);
    body = (
      <>
        {answer.slice(0, i)}
        <b className="px-1 rounded" style={{ background: `${GREEN}44`, color: '#14532d' }}>{mark}</b>
        {answer.slice(i + mark.length)}
      </>
    );
  } else if (mark && !found) {
    body = <span style={{ textDecoration: `underline wavy ${RED}`, textUnderlineOffset: 5 }}>{answer}</span>;
  }
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: bright ? 1 : 0.55 }}
      className="w-full rounded-2xl rounded-tl-sm px-4 py-3 bg-white text-slate-800 text-[19px] font-semibold leading-snug shadow-lg"
    >
      <div className="text-[13px] font-bold text-slate-500 mb-0.5">💬 answer</div>
      {body}
    </motion.div>
  );
}

function Arrow({ on }: { on: boolean }) {
  return (
    <motion.div
      className="text-[26px] font-bold flex-shrink-0"
      animate={{ color: on ? ACCENT : 'rgba(255,255,255,0.18)', x: on ? [0, 5, 0] : 0 }}
      transition={on ? { x: { repeat: Infinity, duration: 0.8 } } : { duration: 0.3 }}
    >
      ➜
    </motion.div>
  );
}

function Tile({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 w-[150px] h-[130px] rounded-2xl"
      style={{ border: `2px solid ${color}`, background: `${color}12` }}
    >
      <span className="text-[40px] leading-none">{icon}</span>
      <span className="text-[16px] font-semibold text-center" style={{ color }}>{label}</span>
    </div>
  );
}

// ── The machine (one test running) ──────────────────────────────────────────

function Machine({
  t,
  n,
  run,
  phase,
  trig,
  kind,
}: {
  t: TestCase;
  n: number;
  run: TestRun;
  phase: number;
  trig: string;
  kind: 'pass' | 'notool' | 'wrong';
}) {
  const { toolOk, answerOk, pass } = checkRun(t, run);
  const bug = kind === 'wrong' && run.toolUsed === 'add';
  const hasAnswer = phase >= 4 || trig === 'no-tool';
  const stamp = phase >= 8 ? (pass ? 'PASS' : 'FAIL') : undefined;

  const agentFocal = phase >= 1 && phase <= 5;
  const botMood: BotMood =
    phase === 1 || phase === 2 ? 'thinking'
    : trig === 'tool-run' ? 'working'
    : phase >= 8 ? (pass ? 'proud' : 'confused')
    : 'happy';

  const cardFocal = phase === 0 || phase === 8;
  const why = trig === 'fail-why';
  // The small tool chip matters up to check 1 (and whenever it explains a failure).
  const toolChipBright = phase <= 6 || bug || (why && kind === 'notool');

  const toolChip = (big: boolean) => {
    if (run.toolUsed === 'add' && t.args) {
      const [a, b] = t.args;
      return (
        <motion.div
          key={big ? 'tool-big' : 'tool-small'}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: big || toolChipBright ? 1 : 0.45 }}
          className={`w-full rounded-xl text-center font-mono ${big ? 'px-3 py-4' : 'px-2 py-1.5'}`}
          style={{ border: `2px solid ${bug ? RED : GOLD}`, background: bug ? `${RED}14` : `${GOLD}12` }}
        >
          <div className={big ? 'text-[21px] text-white/90' : 'text-[15px] text-white/80'}>
            🔧 add({a}, {b}) = <b style={{ color: bug ? RED : GOLD }}>{run.toolResult}</b>
          </div>
          {bug && (
            <div className={`${big ? 'mt-1.5 text-[15px]' : 'text-[13px]'} font-sans font-semibold`} style={{ color: RED }}>
              🐞 pretend bug: a − b
            </div>
          )}
        </motion.div>
      );
    }
    const inHead = kind === 'notool' && t.expectTool === 'add';
    return (
      <motion.div
        key={inHead ? 'head' : 'none'}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: toolChipBright ? 1 : 0.45 }}
        className="w-fit mx-auto rounded-full px-3 py-1 text-[15px] font-semibold"
        style={
          inHead
            ? { color: GOLD, border: `1.5px solid ${GOLD}`, background: `${GOLD}14` }
            : { color: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(255,255,255,0.25)' }
        }
      >
        {inHead ? '💭 no tool: in its head' : '✋ no tool needed'}
      </motion.div>
    );
  };

  // Notes on the check lights for the "why it failed" step.
  const toolNote = why && kind === 'notool' ? '🎲 right by luck' : undefined;
  const answerNote = why && kind === 'wrong' ? '🛡️ caught the bug' : undefined;

  return (
    <div className="h-full flex items-center gap-2">
      {/* 1. The test card */}
      <motion.div
        key={`card-${n}`}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: cardFocal ? 1 : 0.5, scale: cardFocal ? 1.03 : 1 }}
        transition={{ duration: 0.5 }}
        className="w-[28%] flex-shrink-0"
      >
        <TestCard test={t} n={n} stamp={stamp} compact />
      </motion.div>

      <Arrow on={phase === 1} />

      {/* 2. The agent at work */}
      <div className="flex-1 min-w-0 flex flex-col items-center gap-3">
        <AgentBot
          {...BOT}
          size={118}
          mood={botMood}
          active={phase >= 1 && phase <= 3}
          dimmed={!agentFocal && phase !== 7}
        />
        <div className="w-full min-h-[170px] flex flex-col items-center gap-3">
          {phase === 0 && <div className="text-[15px] text-white/35">waiting…</div>}
          {phase === 1 && (
            <motion.div
              className="text-[18px] font-semibold"
              style={{ color: ACCENT }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.1 }}
            >
              🤔 thinking…
            </motion.div>
          )}
          {phase === 2 && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full rounded-xl px-3 py-3 text-center"
              style={{ border: `2px solid ${ACCENT}`, background: `${ACCENT}14`, boxShadow: `0 0 18px ${ACCENT}44` }}
            >
              <div className="text-[20px] font-bold font-mono whitespace-nowrap" style={{ color: ACCENT }}>🌡️ temperature=0</div>
              <div className="text-[15px] text-white/75 mt-1">same question → same answer</div>
            </motion.div>
          )}
          {trig === 'tool-run' && toolChip(true)}
          {hasAnswer && (
            <>
              {toolChip(false)}
              <AnswerBubble
                answer={run.answer}
                mark={phase >= 7 ? t.mustContain : undefined}
                found={answerOk}
                bright={agentFocal || phase === 7 || trig === 'no-tool'}
              />
            </>
          )}
        </div>
      </div>

      <Arrow on={phase === 6} />

      {/* 3. The two checks */}
      <div className="w-[31%] flex-shrink-0 flex flex-col gap-4">
        <CheckRow
          icon="🔧"
          title="Right tool?"
          detail={
            <>
              expected <b className="font-mono text-white">{t.expectTool ?? 'None'}</b> · used{' '}
              <b className="font-mono" style={{ color: toolOk ? GREEN : RED }}>{run.toolUsed ?? 'None'}</b>
            </>
          }
          ok={toolOk}
          shown={phase >= 6}
          focal={phase === 6 || (why && kind === 'notool')}
          dim={phase < 6 || (why && kind === 'wrong') || (phase === 7 && toolOk) || trig === 'count'}
          note={toolNote}
          noteColor={GOLD}
        />
        <CheckRow
          icon="📝"
          title={
            <>
              Has <span className="font-mono">&quot;{t.mustContain}&quot;</span>?
            </>
          }
          detail={answerOk ? 'found in the answer' : 'not in the answer'}
          ok={answerOk}
          shown={phase >= 7}
          focal={phase === 7 || (why && kind === 'wrong')}
          dim={phase < 7 || (why && kind === 'notool') || trig === 'count'}
          note={answerNote}
          noteColor={GREEN}
        />
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function TestingAgentsAnim() {
  const { steps, trig, v } = useTracerScene();
  const activeVariantId = useTracerStore((s) => s.activeVariantId);
  if (steps.length === 0) return null;

  const story = TESTING_STORIES[activeVariantId] ?? TESTING_STORIES.default;
  const testRaw = v('test') ?? '';
  const testIdx = TESTING_TESTS.findIndex((t) => testRaw.includes(t.question));
  const phase = PHASE[trig];
  const inRun = phase !== undefined && testIdx >= 0;
  const afterLoop = ['score', 'regress', 'bigger', 'recap'].includes(trig);
  const passed = Number(v('passed') ?? 0);

  const results = TESTING_TESTS.map((t, i) => checkRun(t, story.runs[i]));
  const slotStates: SlotState[] = TESTING_TESTS.map((_, i) => {
    const done = afterLoop || (inRun && (i < testIdx || (i === testIdx && phase >= 8)));
    if (done) return results[i].pass ? 'pass' : 'fail';
    if (inRun && i === testIdx) return 'running';
    return 'pending';
  });

  const showHeaderScore = inRun;

  let stage: ReactNode = null;

  if (trig === 'intro') {
    stage = (
      <div className="h-full flex items-center justify-center gap-3">
        <Tile icon="📋" label="Test cases" color="#e2e8f0" />
        <Arrow on={false} />
        <Tile icon="🤖" label="Agent answers" color={BOT.color} />
        <Arrow on={false} />
        <Tile icon="✅" label="Checks" color={GREEN} />
        <Arrow on={false} />
        <Tile icon="🏆" label="Score" color={GOLD} />
      </div>
    );
  } else if (trig === 'setup') {
    stage = (
      <div className="h-full flex items-center justify-center gap-4">
        <div className="px-6 py-5 rounded-2xl text-[26px] font-semibold font-mono" style={{ border: `2px solid ${ACCENT}`, color: ACCENT, background: `${ACCENT}12` }}>
          📞 client
        </div>
        <span className="text-[22px] text-white/40">⟷</span>
        <div className="text-[20px] text-white/70">🧠 OpenAI</div>
      </div>
    );
  } else if (trig === 'agent') {
    stage = (
      <div className="h-full flex items-center justify-center gap-8">
        <AgentBot {...BOT} size={150} mood="happy" active />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-xl p-5 w-[320px]"
          style={{ border: `2px solid ${GOLD}`, background: `${GOLD}10` }}
        >
          <div className="text-[14px] font-semibold text-white/60 mb-2">📋 tools menu</div>
          <div className="text-[24px] font-mono font-bold" style={{ color: GOLD }}>🔧 add(a, b)</div>
          <div className="text-[17px] text-white/75 mt-1">Add two numbers together</div>
        </motion.div>
      </div>
    );
  } else if (trig === 'wrapper') {
    stage = (
      <div className="h-full flex items-center justify-center gap-3">
        <div className="px-4 py-2.5 rounded-lg bg-white text-slate-800 text-[18px] font-semibold">❓ question</div>
        <Arrow on />
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-1.5 px-7 py-5 rounded-2xl"
          style={{ border: `2.5px solid ${ACCENT}`, background: `${ACCENT}10`, boxShadow: `0 0 20px ${ACCENT}33` }}
        >
          <AgentBot {...BOT} name={undefined} size={100} mood="happy" />
          <div className="text-[21px] font-mono font-bold" style={{ color: ACCENT }}>ask_agent()</div>
        </motion.div>
        <Arrow on />
        <div className="flex flex-col gap-2.5">
          <div className="px-3.5 py-2 rounded-lg text-[17px] font-mono" style={{ border: `1.5px solid ${GOLD}`, color: GOLD }}>🔧 tool_used</div>
          <div className="px-3.5 py-2 rounded-lg text-[17px] font-mono bg-white text-slate-800">💬 answer</div>
        </div>
      </div>
    );
  } else if (trig === 'tests' || trig === 'tests-none' || trig === 'bigger') {
    const noneStep = trig === 'tests-none';
    if (trig === 'bigger') {
      stage = (
        <div className="h-full flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-2 opacity-60">
              <CardStack count={3} />
              <span className="text-[15px] text-white/70">today: 3 tests</span>
            </div>
            <Arrow on />
            <div className="flex flex-col items-center gap-2">
              <CardStack count={9} />
              <span className="text-[17px] font-semibold text-white">real projects: dozens</span>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-60">
            <AgentBot color="#a3a3a3" badge="⚖️" size={46} mood="thinking" />
            <span className="text-[14px] text-white/70">sometimes: a 2nd AI as judge</span>
          </div>
        </div>
      );
    } else {
      stage = (
        <div className="h-full flex items-center justify-center gap-4 px-2">
          {TESTING_TESTS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: noneStep && i < 2 ? 0.35 : 1, scale: noneStep && i === 2 ? 1.06 : 1 }}
              transition={{ delay: noneStep ? 0 : i * 0.15 }}
              className="w-[31%] h-[190px]"
            >
              <TestCard test={t} n={i + 1} glowNone={noneStep && i === 2} />
            </motion.div>
          ))}
        </div>
      );
    }
  } else if (trig === 'score-init') {
    stage = (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="text-[22px] font-semibold text-white/75">🏆 Scoreboard</div>
        <Scoreboard states={slotStates} passed={passed} big />
      </div>
    );
  } else if (inRun) {
    stage = (
      <Machine t={TESTING_TESTS[testIdx]} n={testIdx + 1} run={story.runs[testIdx]} phase={phase} trig={trig} kind={story.kind} />
    );
  } else if (trig === 'score') {
    stage = <ReportCard story={story} passed={passed} />;
  } else if (trig === 'regress') {
    stage = <RegressionRuns kind={story.kind} passed={passed} />;
  } else if (trig === 'recap') {
    const recap: { icon: string; label: ReactNode; color: string }[] = [
      { icon: '📋', label: 'question + must-have', color: '#e2e8f0' },
      {
        icon: '🔧 📝',
        label: (
          <>
            <span style={{ color: GOLD }}>tool</span> AND <span style={{ color: GREEN }}>answer</span>
          </>
        ),
        color: ACCENT,
      },
      { icon: '🔁', label: 're-run, track score', color: GOLD },
    ];
    stage = (
      <div className="h-full flex items-center justify-center gap-5">
        {recap.map((r, i) => (
          <motion.div
            key={i}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            className="flex flex-col items-center justify-center gap-3 w-[210px] h-[170px] rounded-2xl"
            style={{ border: `2px solid ${r.color}`, background: `${r.color}10` }}
          >
            <span className="text-[15px] font-bold text-white/50">{i + 1}</span>
            <span className="text-[40px] leading-none">{r.icon}</span>
            <span className="text-[18px] font-semibold text-white text-center">{r.label}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-hidden text-white">
      <div className="flex items-center gap-3 flex-shrink-0 min-h-[40px]">
        <div className="text-[16px] font-bold" style={{ color: ACCENT }}>🧪 The Test Machine</div>
        {showHeaderScore && (
          <motion.div
            className="ml-auto rounded-xl px-2 py-1"
            animate={{
              scale: trig === 'count' || (trig === 'pass' && testIdx > 0) ? 1.12 : 1,
              boxShadow: trig === 'count' || (trig === 'pass' && testIdx > 0) ? `0 0 18px ${GREEN}55` : '0 0 0px transparent',
            }}
            style={{ transformOrigin: 'right center' }}
          >
            <Scoreboard states={slotStates} passed={passed} bump={trig === 'count' || (trig === 'pass' && testIdx > 0)} />
          </motion.div>
        )}
      </div>
      <div className="flex-1 min-h-0">{stage}</div>
    </div>
  );
}

// ── After the loop ───────────────────────────────────────────────────────────

function CardStack({ count }: { count: number }) {
  const w = 90;
  return (
    <div className="relative" style={{ width: w + count * 6, height: 70 + count * 4 }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-md bg-white shadow"
          style={{ width: w, height: 64, left: i * 6, top: i * 4, opacity: 0.55 + (0.45 * (i + 1)) / count }}
        >
          <div className="m-2 h-2 w-12 rounded bg-slate-300" />
          <div className="mx-2 h-2 w-16 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function ReportCard({ story, passed }: { story: (typeof TESTING_STORIES)[string]; passed: number }) {
  return (
    <div className="h-full flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-[92%] rounded-xl bg-white text-slate-800 p-6 shadow-2xl"
      >
        <div className="flex items-center mb-3">
          <span className="text-[19px] font-bold">📋 Report card</span>
          <span
            className="ml-auto text-[28px] font-black font-mono"
            style={{ color: passed === TESTING_TESTS.length ? '#16a34a' : '#dc2626' }}
          >
            {passed}/{TESTING_TESTS.length} passed
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {TESTING_TESTS.map((t, i) => {
            const r = story.runs[i];
            const c = checkRun(t, r);
            const reason = c.pass
              ? 'right tool, right answer'
              : !c.toolOk
                ? `expected tool ${t.expectTool ?? 'None'}, used ${r.toolUsed ?? 'None'}`
                : `answer should contain '${t.mustContain}'`;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-3.5 py-2.5"
                style={{ background: c.pass ? '#dcfce7' : '#fee2e2' }}
              >
                <span className="text-[18px]">{c.pass ? '✅' : '❌'}</span>
                <span className="text-[17px] font-semibold">{t.question}</span>
                <span className="ml-auto text-[15px]" style={{ color: c.pass ? '#166534' : '#991b1b' }}>{reason}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function RegressionRuns({ kind, passed }: { kind: 'pass' | 'notool' | 'wrong'; passed: number }) {
  const total = TESTING_TESTS.length;
  const runs: { label: string; score: string; good: boolean | null }[] =
    kind === 'pass'
      ? [
          { label: 'today', score: `${passed}/${total}`, good: true },
          { label: '✏️ prompt changed', score: `2/${total}`, good: false },
          { label: '🔧 fixed', score: `${total}/${total}`, good: true },
        ]
      : [
          { label: 'today', score: `${passed}/${total}`, good: false },
          { label: '🔧 fixed', score: `${total}/${total}`, good: true },
          { label: '✏️ next change', score: 're-run!', good: null },
        ];
  return (
    <div className="h-full flex flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-3">
        {runs.map((r, i) => {
          const color = r.good === null ? ACCENT : r.good ? GREEN : RED;
          return (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <Arrow on={false} />}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.25 }}
                className="flex flex-col items-center gap-1.5 w-[170px] py-4 rounded-2xl"
                style={{ border: `2px solid ${color}`, background: `${color}12` }}
              >
                <span className="text-[30px] font-black font-mono" style={{ color }}>{r.score}</span>
                <span className="text-[15px] text-white/80">{r.label}</span>
                <span className="text-[18px]">{r.good === null ? '🔁' : r.good ? '✅' : '⚠️'}</span>
              </motion.div>
            </div>
          );
        })}
      </div>
      <div className="text-[13px] text-white/40">example runs</div>
    </div>
  );
}
