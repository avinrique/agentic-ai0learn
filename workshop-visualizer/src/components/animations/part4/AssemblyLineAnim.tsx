'use client';
/**
 * AssemblyLineAnim — Lesson 21 (Code: Assembly Line).
 *
 * A tiny newsroom: Rita (researcher) at the left desk, Wally (writer) at the
 * right desk, and a conveyor belt between them. "Our code" is the mail carrier
 * that moves Rita's sticky note to Wally. Everything is derived from the
 * current tracer step (trigger + variables), so Prev/Next/jumps always look right.
 */
import { motion } from 'framer-motion';
import AgentBot, { TEAM, BotMood } from '@/components/animations/characters/AgentBot';
import { useTracerScene } from './useTracerScene';

const ACCENT = '#22d3ee';
const HELPER_OPEN = ['helper-open', 'helper-system', 'helper-task', 'helper-return'];
// Triggers in the order they happen, so we can ask "has X happened yet?"
const ORDER = [
  'intro', 'setup', 'helper', ...HELPER_OPEN, 'rita-card', 'wally-card', 'topic', 'rita-start',
  'rita-work', 'facts-note', 'wally-start', 'carry', 'wally-work', 'article', 'recap',
];

function status(trig: string, topic: string): string {
  switch (trig) {
    case 'intro': return 'Two desks, one belt. Rita → our code → Wally.';
    case 'setup': return 'Getting the phone line to the AI ready…';
    case 'helper': return 'Our agent-maker: run_agent(job card, task)';
    case 'helper-open':
    case 'helper-system':
    case 'helper-task':
    case 'helper-return': return 'Inside run_agent: the same API call as Part 1';
    case 'rita-card': return "Pinning Rita's job card";
    case 'wally-card': return "Pinning Wally's job card";
    case 'topic': return `New assignment: ${topic}`;
    case 'rita-start': return 'Station 1 is starting';
    case 'rita-work': return 'Rita is researching…';
    case 'facts-note': return "Rita's facts are on the sticky note";
    case 'wally-start': return 'Station 2 is starting';
    case 'carry': return 'Our code carries the note to Wally';
    case 'wally-work': return 'Wally is writing…';
    case 'article': return "Wally's paragraph is done!";
    case 'recap': return 'Assembly line complete ✓';
    default: return '';
  }
}

function JobCard({ text, color, glow, who }: { text?: string; color: string; glow: boolean; who: string }) {
  return (
    <motion.div
      key={text ? 'set' : 'empty'}
      initial={text ? { scale: 0.85, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className="rounded-lg px-2 py-1.5 text-[11px] leading-snug h-[64px] overflow-hidden"
      style={{
        border: `1.5px ${text ? 'solid' : 'dashed'} ${text ? color : 'rgba(255,255,255,0.15)'}`,
        background: text ? `${color}14` : 'transparent',
        boxShadow: glow ? `0 0 16px ${color}66` : 'none',
      }}
    >
      <div className="font-semibold mb-0.5" style={{ color: text ? color : 'rgba(255,255,255,0.3)' }}>
        📋 {who}&apos;s job card {text && <span className="font-mono font-normal opacity-70">(system prompt)</span>}
      </div>
      <div className={text ? 'text-white/80' : 'text-white/25 italic'}>{text ?? 'not written yet'}</div>
    </motion.div>
  );
}

function Desk({ color }: { color: string }) {
  return (
    <div className="w-full h-3 rounded-sm mt-1" style={{ background: `linear-gradient(${color}55, ${color}22)` }} />
  );
}

/** The run_agent "machine" — closed (a box) or opened (the Part 1 API call inside). */
function Machine({ trig, open }: { trig: string; open: boolean }) {
  const hi = (t: string) => (trig === t ? 'bg-cyan-400/20 ring-1 ring-cyan-300 text-white' : 'text-white/60');
  return (
    <div className="h-full rounded-xl border-2 p-3 flex flex-col" style={{ borderColor: ACCENT, background: '#0b1b2b' }}>
      <div className="flex items-center gap-2 text-[13px] font-mono font-semibold" style={{ color: ACCENT }}>
        ⚙️ run_agent(system_prompt, task)
        {open && <span className="ml-auto text-[11px] font-sans text-accent-gold">🔓 opened up</span>}
      </div>
      {!open ? (
        <div className="flex-1 flex items-center justify-center gap-3 text-[13px]">
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/80">📋 job card</span>
          <span className="text-white/40">+</span>
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/80">📝 task</span>
          <motion.span animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-white/50">➜</motion.span>
          <span className="px-2 py-1 rounded font-semibold" style={{ background: `${ACCENT}22`, color: ACCENT }}>🤖 agent</span>
          <span className="text-white/50">➜</span>
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/80">💬 reply</span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex gap-3 mt-2 min-h-0">
          <div className="flex-1 font-mono text-[12px] leading-relaxed rounded-lg bg-black/30 p-2">
            <div className={`rounded px-1 ${hi('helper-open')}`}>client.chat.completions.create(</div>
            <div className="pl-3 text-white/50">model=&quot;gpt-4o-mini&quot;, messages=[</div>
            <div className={`ml-5 rounded px-1 ${hi('helper-system')}`}>📋 system: system_prompt</div>
            <div className={`ml-5 rounded px-1 ${hi('helper-task')}`}>📝 user: task</div>
            <div className="pl-3 text-white/50">])</div>
            <div className={`rounded px-1 ${hi('helper-return')}`}>➜ 💬 reply text</div>
          </div>
          <div className="w-[36%] flex flex-col justify-center gap-2 text-[13px] text-white/80">
            <div className="rounded-lg bg-accent-gold/10 border border-accent-gold/30 px-2 py-1.5">
              Same call as <b className="text-accent-gold">Part 1</b>!
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5">
              Only the <b style={{ color: ACCENT }}>job card</b> changes from agent to agent.
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function AssemblyLineAnim() {
  const { steps, trig, v } = useTracerScene();
  if (steps.length === 0) return null;

  const at = ORDER.indexOf(trig);
  const after = (t: string) => at >= ORDER.indexOf(t);

  const topic = v('topic');
  const facts = v('facts');
  const article = v('article');
  const ritaCard = v('researcher_prompt');
  const wallyCard = v('writer_prompt');

  const noteAtWally = after('carry');
  const carrying = trig === 'carry';

  const ritaActive = trig === 'rita-work' || trig === 'rita-start' || trig === 'topic';
  const wallyActive = trig === 'wally-work' || trig === 'wally-start' || trig === 'carry';
  const ritaMood: BotMood = trig === 'rita-work' ? 'thinking' : facts ? 'proud' : ritaActive ? 'working' : 'happy';
  const wallyMood: BotMood = trig === 'wally-work' ? 'thinking' : article ? 'proud' : wallyActive ? 'working' : 'happy';
  const busy = ['rita-start', 'rita-work', 'facts-note', 'wally-start', 'carry', 'wally-work', 'article'];
  const ritaDim = busy.includes(trig) && !ritaActive && trig !== 'facts-note';
  const wallyDim = busy.includes(trig) && !wallyActive && trig !== 'article';

  const call =
    trig === 'rita-work'
      ? { who: 'Rita', text: `run_agent(researcher_prompt, "Topic: ${topic}")`, color: TEAM.researcher.color }
      : trig === 'carry' || trig === 'wally-work'
      ? { who: 'Wally', text: 'run_agent(writer_prompt, "Facts:\\n" + facts)', color: TEAM.writer.color }
      : null;

  // What the bottom panel shows.
  let bottom: 'legend' | 'machine' | 'open' | 'call' | 'article' | 'recap' = 'machine';
  if (trig === 'intro') bottom = 'legend';
  else if (HELPER_OPEN.includes(trig)) bottom = 'open';
  else if (trig === 'recap') bottom = 'recap';
  else if (article) bottom = 'article';
  else if (call) bottom = 'call';

  return (
    <div className="h-full flex flex-col gap-2 p-3 overflow-hidden text-white">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-[15px] font-bold" style={{ color: ACCENT }}>📰 The Newsroom</div>
        {topic && (
          <span className="text-[12px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
            topic: <b className="text-white">{topic}</b>
          </span>
        )}
        <motion.div
          key={trig}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="ml-auto text-[12px] px-2.5 py-1 rounded-full"
          style={{ background: `${ACCENT}1a`, color: ACCENT, border: `1px solid ${ACCENT}44` }}
        >
          {status(trig, topic ?? '')}
        </motion.div>
      </div>

      {/* Job cards */}
      <div className="grid grid-cols-2 gap-3 flex-shrink-0">
        <JobCard who="Rita" text={ritaCard} color={TEAM.researcher.color} glow={trig === 'rita-card' || trig === 'rita-work'} />
        <JobCard who="Wally" text={wallyCard} color={TEAM.writer.color} glow={trig === 'wally-card' || trig === 'wally-work'} />
      </div>

      {/* Stage: desks, belt, sticky note */}
      <div className="relative flex-shrink-0 h-[262px]">
        {/* Rita */}
        <div className="absolute left-0 top-0 w-[34%] flex flex-col items-center">
          <AgentBot {...TEAM.researcher} size={70} mood={ritaMood} active={ritaActive} dimmed={ritaDim} />
          <Desk color={TEAM.researcher.color} />
        </div>
        {/* Wally */}
        <div className="absolute right-0 top-0 w-[34%] flex flex-col items-center">
          <AgentBot {...TEAM.writer} size={70} mood={wallyMood} active={wallyActive} dimmed={wallyDim} />
          <Desk color={TEAM.writer.color} />
        </div>

        {/* Mail carrier = our code */}
        <div className="absolute left-[34%] right-[34%] top-2 flex flex-col items-center text-center">
          <motion.div
            className="rounded-xl px-2 py-1.5 text-[12px] font-semibold"
            animate={{
              scale: carrying ? 1.08 : 1,
              boxShadow: carrying ? `0 0 18px ${ACCENT}88` : '0 0 0px transparent',
            }}
            style={{ background: '#0b1b2b', border: `1.5px solid ${ACCENT}`, color: ACCENT }}
          >
            🐍 our code
            <div className="text-[11px] font-normal text-white/60">the mail carrier</div>
          </motion.div>
          {call && (
            <motion.div
              key={call.who}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 text-[11px] font-mono rounded-md px-1.5 py-1 bg-black/40"
              style={{ color: call.color, border: `1px solid ${call.color}55` }}
            >
              {call.who === 'Rita' ? '⬅ ' : ''}calls {call.who}{call.who === 'Wally' ? ' ➡' : ''}
            </motion.div>
          )}
        </div>

        {/* Conveyor belt */}
        <div className="absolute left-[26%] right-[26%] bottom-[52px] h-4 rounded-full overflow-hidden border border-white/15 bg-white/5">
          <motion.div
            className="h-full w-[200%]"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, rgba(34,211,238,0.35) 0 8px, transparent 8px 22px)',
            }}
            animate={carrying ? { x: ['-50%', '0%'] } : { x: '-25%' }}
            transition={carrying ? { repeat: Infinity, duration: 1.2, ease: 'linear' } : { duration: 0.3 }}
          />
        </div>

        {/* Topic slip on Rita's desk (before her facts exist) */}
        {topic && !facts && (
          <motion.div
            key={`topic-${topic}`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute left-[4%] w-[26%] bottom-[4px] rounded-md px-2 py-1.5 text-[12px] bg-white text-slate-800 shadow-lg"
          >
            📄 <b>Task:</b> &quot;Topic: {topic}&quot;
            {trig === 'rita-work' && (
              <motion.div className="text-[11px] text-slate-500" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                Rita is thinking…
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Rita's sticky note: rides the belt to Wally at the handoff */}
        {facts && (
          <motion.div
            key="note"
            initial={{ scale: 0.4, opacity: 0, left: '1%' }}
            animate={{
              scale: 1,
              opacity: 1,
              left: noteAtWally ? '67%' : '1%',
              rotate: noteAtWally ? 2 : -2,
            }}
            transition={{ left: { duration: carrying ? 1.6 : 0.4, ease: 'easeInOut' }, default: { duration: 0.4 } }}
            className="absolute bottom-0 w-[33%] rounded-md p-2 text-[11.5px] leading-snug shadow-xl"
            style={{ background: '#fde68a', color: '#3b2f05', boxShadow: carrying ? `0 0 18px ${ACCENT}` : undefined }}
          >
            <div className="font-bold text-[11px] mb-0.5">
              📌 {noteAtWally ? "Wally's task:" : "Rita's facts"} <span className="font-mono font-normal">facts</span>
            </div>
            <div className="whitespace-pre-line max-h-[118px] overflow-hidden">{facts}</div>
          </motion.div>
        )}
      </div>

      {/* Bottom panel */}
      <div className="flex-1 min-h-[120px]">
        {bottom === 'legend' && (
          <div className="h-full rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-center gap-3 text-[14px]">
            <span style={{ color: TEAM.researcher.color }} className="font-semibold">🔍 Rita finds facts</span>
            <span className="text-white/40">➜</span>
            <span style={{ color: ACCENT }} className="font-semibold">🐍 our code carries the note</span>
            <span className="text-white/40">➜</span>
            <span style={{ color: TEAM.writer.color }} className="font-semibold">✍️ Wally writes</span>
          </div>
        )}
        {(bottom === 'machine' || bottom === 'open') && <Machine trig={trig} open={bottom === 'open'} />}
        {bottom === 'call' && call && (
          <div className="h-full rounded-xl border-2 p-3 flex flex-col justify-center gap-2" style={{ borderColor: call.color, background: '#0b1b2b' }}>
            <div className="text-[12px] text-white/60">Our code calls the same machine for {call.who}:</div>
            <div className="font-mono text-[13px]" style={{ color: call.color }}>⚙️ {call.text}</div>
            <div className="text-[12px] text-white/60">
              {call.who === 'Rita'
                ? "📋 Rita's job card + 📝 the topic ➜ 💬 facts"
                : "📋 Wally's job card + 📌 Rita's facts ➜ 💬 a paragraph"}
            </div>
          </div>
        )}
        {bottom === 'article' && article && (
          <motion.div
            key="article"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full rounded-xl p-3 bg-white text-slate-800 shadow-xl overflow-hidden"
            style={{ borderLeft: `6px solid ${TEAM.writer.color}` }}
          >
            <div className="text-[12px] font-bold text-green-700 mb-1">✍️ Wally&apos;s paragraph <span className="font-mono font-normal text-slate-500">article</span></div>
            <div className="text-[13.5px] leading-snug">{article}</div>
          </motion.div>
        )}
        {bottom === 'recap' && (
          <div className="h-full rounded-xl border p-3 flex flex-col justify-center gap-1.5 text-[13.5px]" style={{ borderColor: `${ACCENT}66`, background: `${ACCENT}0d` }}>
            <div className="font-bold" style={{ color: ACCENT }}>What you learned</div>
            <div>1️⃣ An agent = <span className="font-mono">run_agent</span> + its own job card.</div>
            <div>2️⃣ One agent&apos;s answer becomes the next agent&apos;s task.</div>
            <div>3️⃣ Our code carries the note. The agents never talk directly.</div>
          </div>
        )}
      </div>
    </div>
  );
}
