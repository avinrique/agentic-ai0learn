'use client';
/**
 * GuardrailsAnim — Lesson 33 (Code: Guardrails & Human Approval).
 *
 * A road with three brakes. Gate 1: Cora guards a boom barrier and checks the
 * incoming request. Max drafts an email (a big envelope), but a risky tool must
 * pass the "Human approval" card (Allow / Deny). Gate 3: Cora checks Max's answer
 * at the exit. A small strip up top shows the three brakes as ✓ chips.
 * Everything is derived from the current tracer step (trigger + variables).
 */
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { BotMood } from '@/components/animations/characters/AgentBot';
import { TEAM } from '@/components/animations/characters/AgentBot';
import { useTracerScene } from '@/components/animations/part4/useTracerScene';
import { CHECKER_PROMPT, EMAIL_MESSAGE, EMAIL_TO, MAX_PROMPT, REQUEST_OK } from '@/data/traces/guardrails';
import {
  ACCENT,
  AMBER,
  GREEN,
  RED,
  AllowedSwitch,
  ApprovalCard,
  Barrier,
  Bubble,
  CodeChip,
  Cora,
  Envelope,
  GateScene,
  JobCard,
  Layers,
  Max,
  OrderSlip,
  Person,
  Slip,
  Stamp,
  type BarrierState,
  type ItemPos,
} from './GuardrailsParts';

type BrakeState = 'idle' | 'active' | 'pass' | 'stop' | 'no' | 'skip';

const GATE1 = ['gate1', 'cora-check', 'verdict', 'return'];
const HUMAN = ['risky-check', 'human-ask', 'human-answer', 'allowed-set'];

/** One of the three brakes, as a small status chip. */
function BrakeChip({ n, label, state }: { n: string; label: string; state: BrakeState }) {
  const look = {
    idle: { c: 'rgba(255,255,255,0.4)', bg: 'transparent', b: 'rgba(255,255,255,0.18)', tail: '' },
    active: { c: ACCENT, bg: `${ACCENT}1f`, b: ACCENT, tail: ' …' },
    pass: { c: GREEN, bg: `${GREEN}14`, b: `${GREEN}88`, tail: ' ✓' },
    stop: { c: RED, bg: `${RED}1a`, b: RED, tail: ' ⛔' },
    no: { c: AMBER, bg: `${AMBER}14`, b: `${AMBER}88`, tail: ': said no ✋' },
    skip: { c: 'rgba(255,255,255,0.3)', bg: 'transparent', b: 'rgba(255,255,255,0.12)', tail: ' —' },
  }[state];
  return (
    <motion.div
      initial={false}
      animate={{ scale: state === 'active' ? 1.05 : 1 }}
      className="text-[13px] px-2.5 py-0.5 rounded-full whitespace-nowrap font-semibold"
      style={{
        color: look.c,
        background: look.bg,
        border: `1.5px ${state === 'idle' || state === 'skip' ? 'dashed' : 'solid'} ${look.b}`,
        boxShadow: state === 'active' ? `0 0 12px ${ACCENT}66` : 'none',
      }}
    >
      {n} {label}
      {look.tail}
    </motion.div>
  );
}

/** Intro: the whole road, with its three brakes. */
function RoadMap() {
  const arrow = <span className="text-white/35 text-[20px]">➜</span>;
  const node = (top: ReactNode, label: string, brake?: string) => (
    <div className="flex flex-col items-center gap-1.5 w-[104px]">
      <div className="h-[96px] flex items-end">{top}</div>
      <div className="text-[14px] font-semibold text-center leading-tight" style={{ color: brake ? AMBER : 'rgba(255,255,255,0.8)' }}>
        {brake && <span className="mr-1">{brake}</span>}
        {label}
      </div>
    </div>
  );
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-[20px] font-bold" style={{ color: AMBER }}>🛑 3 brakes for an agent that acts</div>
      <div className="flex items-center gap-2">
        {node(<div className="text-[54px]">📥</div>, 'request')}
        {arrow}
        {node(<Cora size={70} />, 'check in', '①')}
        {arrow}
        {node(<Max size={70} />, 'acts')}
        {arrow}
        {node(<Person size={70} label="" />, 'human OK', '②')}
        {arrow}
        {node(<Cora size={70} />, 'check out', '③')}
        {arrow}
        {node(<div className="text-[54px]">💬</div>, 'reply')}
      </div>
    </div>
  );
}

/** The run_agent machine, closed (same look as the other Part 4 lessons). */
function Machine() {
  return (
    <div className="rounded-xl border-2 p-5 flex flex-col gap-4 w-[600px] max-w-full" style={{ borderColor: ACCENT, background: '#0b1b2b' }}>
      <div className="text-[18px] font-mono font-semibold" style={{ color: ACCENT }}>
        ⚙️ run_agent(system_prompt, task)
      </div>
      <div className="flex items-center justify-center flex-wrap gap-3 text-[17px]">
        <span className="px-2.5 py-1 rounded bg-white/5 text-white/85">📋 job card</span>
        <span className="text-white/40">+</span>
        <span className="px-2.5 py-1 rounded bg-white/5 text-white/85">📝 task</span>
        <span className="text-white/50">➜</span>
        <span className="px-2.5 py-1 rounded font-semibold" style={{ background: `${ACCENT}22`, color: ACCENT }}>🤖 agent</span>
        <span className="text-white/50">➜</span>
        <span className="px-2.5 py-1 rounded bg-white/5 text-white/85">💬 reply</span>
      </div>
    </div>
  );
}

/** is_safe(text): Cora + gate, and the two ways it can go. */
function IsSafeDiagram() {
  const row = (word: 'SAFE' | 'UNSAFE', value: string, result: string) => {
    const c = word === 'SAFE' ? GREEN : RED;
    return (
      <div className="flex items-center gap-3 text-[17px]">
        <span className="w-[108px] text-center font-black tracking-wider px-2 py-0.5 rounded" style={{ color: c, border: `2px solid ${c}` }}>
          {word}
        </span>
        <span className="text-white/40">➜</span>
        <span className="font-mono font-bold w-[64px]" style={{ color: c }}>{value}</span>
        <span className="text-white/40">➜</span>
        <span className="text-white/85">{result}</span>
      </div>
    );
  };
  return (
    <div className="flex flex-col items-center gap-5">
      <CodeChip big>is_safe(text)</CodeChip>
      <div className="flex items-end gap-2">
        <Cora size={104} active />
        <Barrier state="closed" />
      </div>
      <div className="flex flex-col gap-2.5">
        {row('SAFE', 'True', '🟢 gate opens')}
        {row('UNSAFE', 'False', '🔴 stays shut')}
      </div>
    </div>
  );
}

function ToolCard() {
  return (
    <div className="flex flex-col items-center gap-4">
      <CodeChip big>send_email(to, message)</CodeChip>
      <div className="relative pr-16 pb-2">
        <div className="text-[120px] leading-none">📧</div>
        <Stamp text="PRETEND" color={AMBER} className="absolute bottom-2 right-0" />
      </div>
    </div>
  );
}

function MenuCard() {
  return (
    <div className="flex items-center gap-5">
      <Max size={80} />
      <div className="rounded-xl p-5 w-[430px]" style={{ background: '#0b1b2b', border: `2px solid ${ACCENT}` }}>
        <div className="text-[15px] font-semibold mb-3" style={{ color: ACCENT }}>🧰 Max&apos;s tool menu</div>
        <div className="rounded-lg px-4 py-3 bg-white/5">
          <div className="font-mono text-[20px] font-bold text-white">📧 send_email</div>
          <div className="flex gap-2 mt-2">
            <span className="font-mono text-[14px] px-2 py-0.5 rounded bg-white/10 text-white/85">to</span>
            <span className="font-mono text-[14px] px-2 py-0.5 rounded bg-white/10 text-white/85">message</span>
          </div>
          <div className="text-[16px] text-white/70 mt-2">Send an email to someone.</div>
        </div>
      </div>
    </div>
  );
}

function RiskyCard() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="rounded-2xl px-8 py-6 flex flex-col items-center gap-4" style={{ background: `${RED}10`, border: `2px solid ${RED}` }}>
        <div className="font-mono text-[18px] font-bold" style={{ color: RED }}>⚠️ RISKY_TOOLS</div>
        <div className="font-mono text-[24px] font-bold px-4 py-1.5 rounded-lg bg-white/5 text-white" style={{ border: `2px solid ${RED}88` }}>
          📧 send_email
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-[14px] text-white/55">hard to undo:</div>
        <div className="flex gap-2 text-[15px] text-white/75">
          <span className="px-2.5 py-0.5 rounded-full bg-white/5">📤 sending</span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/5">🗑️ deleting</span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/5">💳 paying</span>
        </div>
      </div>
    </div>
  );
}

/** Max can only ASK; our code decides and runs the tool. */
function AskVsDecide() {
  const arrow = (
    <motion.span className="text-[28px] text-white/50" animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
      ➜
    </motion.span>
  );
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2 w-[180px]">
        <Max size={84} />
        <OrderSlip small />
        <div className="text-[17px] font-bold text-amber-300">can only ASK</div>
      </div>
      {arrow}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="flex flex-col items-center gap-1.5 rounded-2xl px-6 py-5 w-[200px]"
        style={{ background: `${ACCENT}14`, border: `3px solid ${ACCENT}`, boxShadow: `0 0 24px ${ACCENT}44` }}
      >
        <div className="text-[46px] leading-none">🐍</div>
        <div className="text-[18px] font-bold text-white">our code</div>
        <div className="text-[17px] font-bold" style={{ color: ACCENT }}>DECIDES</div>
      </motion.div>
      {arrow}
      <div className="flex flex-col items-center gap-2 w-[150px]">
        <div
          className="w-[84px] h-[84px] rounded-full flex items-center justify-center text-[34px]"
          style={{ background: `${RED}33`, border: `4px solid ${RED}` }}
        >
          ▶
        </div>
        <div className="text-[16px] font-semibold text-white/85">runs the tool</div>
      </div>
    </div>
  );
}

function Recap({ blocked }: { blocked: boolean }) {
  const pts = [
    '🚧 Guardrails check what goes in and what comes out. A checker can be a small agent.',
    "🙋 Risky tools (send, delete, pay) wait for a human's yes.",
    '🐍 The AI can only ask. Our code decides and enforces the rules.',
  ];
  return (
    <div className="flex flex-col items-center gap-6 max-w-[620px]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="px-4 py-1.5 rounded-full text-[16px] font-bold"
        style={{ color: AMBER, background: `${AMBER}1a`, border: `1.5px solid ${AMBER}` }}
      >
        🎓 Course complete!
      </motion.div>
      <div className="flex flex-col gap-3 text-[18px] leading-snug">
        {pts.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 * i }}>
            {p}
          </motion.div>
        ))}
      </div>
      <div className="text-[14px] text-white/50">{blocked ? 'Try the other runs: approved, and human says no.' : 'You can now build agents that act, safely.'}</div>
    </div>
  );
}

/** Pull to/message out of the Python dict text, e.g. {'to': 'Ms. Lee', 'message': 'Hi!'} */
function parseArgs(raw?: string): { to: string; message: string } {
  const m = raw?.match(/'to': '(.*?)', 'message': '(.*)'\}$/);
  return m ? { to: m[1], message: m[2] } : { to: EMAIL_TO, message: EMAIL_MESSAGE };
}

export default function GuardrailsAnim() {
  const { steps, index, trig, v } = useTracerScene();
  if (steps.length === 0) return null;

  const has = (t: string) => steps.some((s) => s.animationTrigger === t);
  const seen = (t: string) => steps.slice(0, index + 1).some((s) => s.animationTrigger === t);
  const story: 'approved' | 'denied' | 'blocked' = has('stop') ? 'blocked' : has('if-denied') ? 'denied' : 'approved';
  const blocked = story === 'blocked';

  const request = v('request') ?? REQUEST_OK;
  const reply = v('reply');
  const result = v('result');
  const answer = v('answer');
  const email = parseArgs(v('args'));

  // The three brakes, as status chips.
  const b1: BrakeState = !seen('gate1') ? 'idle' : GATE1.includes(trig) ? 'active' : blocked ? 'stop' : 'pass';
  const b2: BrakeState = blocked
    ? seen('gate1-closed') ? 'skip' : 'idle'
    : !seen('risky-check') ? 'idle' : HUMAN.includes(trig) ? 'active' : story === 'denied' ? 'no' : 'pass';
  const b3: BrakeState = blocked
    ? seen('gate1-closed') ? 'skip' : 'idle'
    : !seen('gate3') ? 'idle' : trig === 'gate3' ? 'active' : 'pass';
  const showStrip = !['intro', 'layers', 'recap'].includes(trig);
  // Steps in the same scene share a key, so things (like the request slip) glide between steps.
  const sceneKey =
    GATE1.includes(trig) || trig.startsWith('gate1') ? 'gate1'
    : trig.startsWith('gate3') ? 'gate3'
    : trig.startsWith('human-') ? 'human'
    : trig === 'max-think' || trig === 'max-final' ? `think-${trig}`
    : trig;

  let focal: ReactNode = null;
  switch (trig) {
    case 'intro':
      focal = <RoadMap />;
      break;
    case 'setup':
      focal = (
        <div className="flex items-center gap-3 text-[18px]">
          {['🧩 json', '📦 OpenAI', '📞 client'].map((t) => (
            <span key={t} className="px-4 py-2 rounded-xl bg-white/5 border border-white/15 font-mono">{t}</span>
          ))}
        </div>
      );
      break;
    case 'helper':
      focal = <Machine />;
      break;
    case 'cora-card':
      focal = (
        <div className="flex items-center gap-6">
          <Cora size={120} active />
          <JobCard who="Cora" text={v('checker_prompt') ?? CHECKER_PROMPT} color={TEAM.critic.color} highlight="SAFE or UNSAFE only" />
        </div>
      );
      break;
    case 'is-safe-def':
      focal = <IsSafeDiagram />;
      break;
    case 'tool-def':
      focal = <ToolCard />;
      break;
    case 'menu':
      focal = <MenuCard />;
      break;
    case 'risky':
      focal = <RiskyCard />;
      break;
    case 'max-card':
      focal = (
        <div className="flex items-center gap-6">
          <Max size={120} active />
          <JobCard who="Max" text={v('max_prompt') ?? MAX_PROMPT} color={TEAM.boss.color} />
        </div>
      );
      break;
    case 'request':
      focal = (
        <div className="flex items-end gap-4 max-w-[600px]">
          <Person size={90} active />
          <div className="mb-8">
            <Bubble from="left" size={20}>{request}</Bubble>
          </div>
        </div>
      );
      break;

    // ── Gate 1: Cora checks the request ──
    case 'gate1':
    case 'cora-check':
    case 'verdict':
    case 'return':
    case 'gate1-open':
    case 'gate1-closed': {
      const verdict = blocked ? 'UNSAFE' : 'SAFE';
      const judged = ['verdict', 'return', 'gate1-open', 'gate1-closed'].includes(trig);
      const itemPos: ItemPos =
        trig === 'gate1-open' ? 'passed' : trig === 'gate1-closed' ? 'blocked' : trig === 'gate1' ? 'wait' : 'near';
      const barrier: BarrierState =
        trig === 'gate1-open' ? 'open' : trig === 'gate1-closed' ? 'blocked' : trig === 'gate1' ? 'closed' : 'checking';
      const coraMood: BotMood = trig === 'cora-check' ? 'thinking' : judged ? (blocked ? 'working' : 'proud') : 'happy';
      focal = (
        <GateScene
          label="Gate 1 · check in"
          item={<Slip title="📥 request" text={request} tone={blocked && judged ? 'red' : 'paper'} />}
          itemPos={itemPos}
          coraMood={coraMood}
          coraActive={trig === 'cora-check' || trig === 'gate1'}
          sign={judged ? verdict : undefined}
          note={
            trig === 'gate1' ? <CodeChip>is_safe(request)</CodeChip>
            : trig === 'cora-check' ? <CodeChip>🧠 run_agent(checker_prompt, text)</CodeChip>
            : undefined
          }
          top={
            trig === 'return' ? (
              <CodeChip big color={blocked ? RED : GREEN}>
                &quot;{verdict}&quot;.startswith(&quot;SAFE&quot;) ➜ {blocked ? 'False' : 'True'}
              </CodeChip>
            ) : trig === 'gate1-open' ? (
              <CodeChip big color={GREEN}>not True ➜ False: skip the refusal</CodeChip>
            ) : trig === 'gate1-closed' ? (
              <CodeChip big color={RED}>not False ➜ True: refuse</CodeChip>
            ) : undefined
          }
          barrier={barrier}
          dest={<Max size={80} dimmed={trig !== 'gate1-open'} mood={trig === 'gate1-open' ? 'happy' : 'sleeping'} />}
        />
      );
      break;
    }
    case 'refuse':
      focal = (
        <div className="flex flex-col items-center gap-5 max-w-[620px]">
          <Bubble size={20} border={GREEN}>
            🛡️ {"Sorry, I can't help with that. Let's keep things kind and safe."}
          </Bubble>
          <Person size={80} />
        </div>
      );
      break;
    case 'stop':
      focal = (
        <div className="flex flex-col items-center gap-6">
          <CodeChip big color={RED}>🛑 raise SystemExit</CodeChip>
          <div className="flex items-end gap-8">
            <Barrier state="blocked" scale={0.8} />
            <div className="flex flex-col items-center gap-2">
              <Max size={110} mood="sleeping" />
              <div className="text-[17px] font-semibold text-white/75">💤 never called</div>
            </div>
          </div>
        </div>
      );
      break;

    // ── Max works on the request ──
    case 'max-notepad':
      focal = (
        <div className="flex items-center gap-6">
          <Max size={110} active />
          <div className="rounded-xl p-4 w-[420px] flex flex-col gap-2.5" style={{ background: '#0b1b2b', border: `2px solid ${ACCENT}` }}>
            <div className="text-[15px] font-semibold" style={{ color: ACCENT }}>📒 messages</div>
            <div className="text-[16px] rounded-md px-3 py-1.5" style={{ background: 'rgba(148,163,184,0.18)', color: '#e2e8f0' }}>
              📋 system: Max&apos;s job card
            </div>
            <div className="text-[16px] rounded-md px-3 py-1.5 leading-snug" style={{ background: 'rgba(34,211,238,0.15)', color: '#cffafe' }}>
              💬 user: &ldquo;{request}&rdquo;
            </div>
          </div>
        </div>
      );
      break;
    case 'max-think':
    case 'max-final':
      focal = (
        <div className="flex items-center gap-6">
          <Max size={130} mood="thinking" active />
          <div className="flex flex-col gap-3">
            <Bubble from="left" size={19}>📞 asking OpenAI…</Bubble>
            {trig === 'max-think' ? (
              <span className="self-start text-[15px] px-3 py-1 rounded-full bg-white/5 text-white/75">🧰 tools: send_email</span>
            ) : (
              <span className="self-start text-[15px] px-3 py-1 rounded-full bg-white/5 text-white/75">📄 tool: &ldquo;{result}&rdquo;</span>
            )}
          </div>
        </div>
      );
      break;
    case 'slip':
      focal = (
        <div className="flex items-center gap-6">
          <Max size={120} mood="proud" />
          <motion.div initial={{ x: -30, rotate: -8, opacity: 0 }} animate={{ x: 0, rotate: -3, opacity: 1 }}>
            <OrderSlip />
          </motion.div>
        </div>
      );
      break;
    case 'reply-none':
      focal = (
        <div className="flex items-center gap-6">
          <Max size={110} />
          <div className="flex flex-col items-start gap-3">
            <div className="rounded-2xl rounded-bl-sm px-5 py-3 border-2 border-dashed border-white/30 font-mono text-[22px] text-white/60">
              reply = None
            </div>
            <OrderSlip small />
          </div>
        </div>
      );
      break;
    case 'ask-only':
      focal = <AskVsDecide />;
      break;
    case 'read-slip':
      focal = (
        <div className="flex items-center gap-5">
          <Max size={80} mood="proud" />
          <Envelope to={email.to} message={email.message} title="✉️ Max's draft" width={450} />
        </div>
      );
      break;

    // ── Gate 2: the human decides ──
    case 'allowed-default':
      focal = (
        <div className="flex flex-col items-center gap-5">
          <AllowedSwitch on />
          <div className="text-[16px] text-white/60">🧮 a harmless tool could just run</div>
        </div>
      );
      break;
    case 'risky-check':
      focal = (
        <div className="flex flex-col items-center gap-6">
          <CodeChip big color={RED}>&quot;send_email&quot; in RISKY_TOOLS ➜ True</CodeChip>
          <Envelope to={email.to} message={email.message} width={400} stamp={{ text: '⚠️ RISKY', color: RED }} />
        </div>
      );
      break;
    case 'human-ask':
    case 'human-answer':
      focal = <ApprovalCard to={email.to} message={email.message} choice={trig === 'human-answer' ? (answer === 'y' ? 'y' : 'n') : null} />;
      break;
    case 'allowed-set':
      focal = (
        <div className="flex flex-col items-center gap-6">
          <CodeChip big>
            &quot;{answer}&quot; == &quot;y&quot; ➜ {answer === 'y' ? 'True' : 'False'}
          </CodeChip>
          <AllowedSwitch on={answer === 'y'} />
        </div>
      );
      break;
    case 'run-tool':
      focal = (
        <div className="flex flex-col items-center gap-6">
          <CodeChip big color={GREEN}>▶ send_email(**args)</CodeChip>
          <Envelope to={email.to} message={email.message} width={400} />
        </div>
      );
      break;
    case 'sent':
      focal = (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative w-[580px] max-w-full rounded-xl px-5 py-4"
          style={{ background: '#05070f', border: '2px solid rgba(255,255,255,0.18)' }}
        >
          <div className="text-[13px] font-semibold text-white/50 mb-2">🖨️ printed</div>
          <div className="font-mono text-[18px] leading-relaxed" style={{ color: GREEN }}>
            📧 (pretend) Email to {email.to}: {email.message}
          </div>
          <Stamp text="PRETEND" color={AMBER} className="absolute -top-5 -right-5" />
        </motion.div>
      );
      break;
    case 'if-denied':
      focal = (
        <div className="flex flex-col items-center gap-6">
          <CodeChip big color={RED}>🔒 send_email skipped</CodeChip>
          <Envelope to={email.to} message={email.message} width={400} dim stamp={{ text: 'NOT SENT', color: RED }} />
        </div>
      );
      break;
    case 'result-no':
      focal = (
        <div className="w-[420px]">
          <Slip title="result" text={`"${result}"`} tone="amber" size={22} />
        </div>
      );
      break;
    case 'tool-msg':
      focal = (
        <div className="flex items-center gap-8">
          <motion.div
            className="w-[300px]"
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Slip title="📄 role: tool" text={result ?? ''} tone={story === 'denied' ? 'amber' : 'green'} size={20} />
          </motion.div>
          <span className="text-[28px] text-white/50">➜</span>
          <Max size={110} active />
        </div>
      );
      break;
    case 'reply':
      focal = (
        <div className="flex items-center gap-5 max-w-[680px]">
          <Max size={110} mood="proud" />
          <div className="flex flex-col items-start gap-2">
            <Bubble from="left" size={19}>{reply}</Bubble>
            <span className="text-[14px] text-white/55">🙈 not shown yet</span>
          </div>
        </div>
      );
      break;

    // ── Gate 3: Cora checks the answer ──
    case 'gate3':
    case 'gate3-safe': {
      const safe = trig === 'gate3-safe';
      focal = (
        <GateScene
          label="Gate 3 · check out"
          item={<Slip title="👑 Max's answer" text={reply ?? ''} tone="yellow" size={16} />}
          itemPos={safe ? 'passed' : 'near'}
          coraMood={safe ? 'proud' : 'thinking'}
          coraActive={!safe}
          sign={safe ? 'SAFE' : undefined}
          note={safe ? undefined : <CodeChip>is_safe(reply)</CodeChip>}
          top={safe ? <CodeChip big color={GREEN}>not True ➜ False: skip the fallback</CodeChip> : undefined}
          barrier={safe ? 'open' : 'checking'}
          dest={<Person size={76} dimmed={!safe} />}
        />
      );
      break;
    }
    case 'print-reply':
      focal = (
        <div className="flex items-end gap-4 max-w-[660px]">
          <Person size={90} active />
          <div className="mb-8">
            <Bubble size={20} border={TEAM.boss.color}>
              <span className="font-bold" style={{ color: '#b45309' }}>👑 Max:</span> {reply}
            </Bubble>
          </div>
        </div>
      );
      break;
    case 'layers':
      focal = <Layers />;
      break;
    case 'recap':
      focal = <Recap blocked={blocked} />;
      break;
  }

  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-hidden text-white">
      <div className="flex items-center gap-3 flex-shrink-0 min-h-[28px]">
        <div className="text-[16px] font-bold" style={{ color: ACCENT }}>🛡️ Guardrails</div>
        {showStrip && (
          <div className="ml-auto flex items-center gap-1.5">
            <BrakeChip n="①" label="Check in" state={b1} />
            <BrakeChip n="②" label="Human OK" state={b2} />
            <BrakeChip n="③" label="Check out" state={b3} />
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <motion.div
          key={sceneKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full flex items-center justify-center"
        >
          {focal}
        </motion.div>
      </div>
    </div>
  );
}
