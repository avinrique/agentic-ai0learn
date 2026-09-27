'use client';
/**
 * AssemblyLineAnim — Lesson 21 (Code: Assembly Line).
 *
 * A tiny newsroom: Rita (researcher) at the left desk, Wally (writer) at the
 * right desk, and a conveyor belt between them. "Our code" is the mail carrier
 * that moves Rita's sticky note to Wally. Everything is derived from the
 * current tracer step (trigger + variables), so Prev/Next/jumps always look right.
 * On short screens (e.g. 1280×720) the newsroom packs itself smaller so the focal
 * panel under it still fits; while the run_agent machine is open it steps aside.
 */
import { motion } from 'framer-motion';
import AgentBot, { TEAM, BotMood } from '@/components/animations/characters/AgentBot';
import { useShortScreen, useTracerScene } from './useTracerScene';

const ACCENT = '#22d3ee';
const HELPER_OPEN = ['helper-open', 'helper-system', 'helper-task', 'helper-return'];
// Triggers in the order they happen, so we can ask "has X happened yet?"
const ORDER = [
  'intro', 'setup', 'helper', ...HELPER_OPEN, 'rita-card', 'wally-card', 'topic', 'rita-start',
  'rita-work', 'facts-note', 'wally-start', 'carry', 'wally-work', 'article', 'recap',
];

/** A job card collapsed to a one-line chip under its robot. */
function CardChip({ set, color, glow }: { set: boolean; color: string; glow: boolean }) {
  return (
    <div
      className="mt-2 text-[13px] px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{
        border: `1.5px ${set ? 'solid' : 'dashed'} ${set ? color : 'rgba(255,255,255,0.18)'}`,
        color: set ? color : 'rgba(255,255,255,0.35)',
        background: set ? `${color}14` : 'transparent',
        boxShadow: glow ? `0 0 14px ${color}88` : 'none',
      }}
    >
      📋 job card {set ? '✓' : ''}
    </div>
  );
}

function Desk({ color }: { color: string }) {
  return (
    <div className="w-full h-3 rounded-sm mt-1" style={{ background: `linear-gradient(${color}55, ${color}22)` }} />
  );
}

/** The run_agent "machine" — closed (a box) or opened (the Part 1 API call inside). */
function Machine({ trig, open, compact }: { trig: string; open: boolean; compact: boolean }) {
  const hi = (t: string) => (trig === t ? 'bg-cyan-400/20 ring-1 ring-cyan-300 text-white' : 'text-white/45');
  return (
    <div
      className={`rounded-xl border-2 flex flex-col ${compact ? 'p-3 gap-2' : 'p-4 gap-3'}`}
      style={{ borderColor: ACCENT, background: '#0b1b2b' }}
    >
      <div className="flex items-center gap-2 text-[15px] font-mono font-semibold" style={{ color: ACCENT }}>
        ⚙️ run_agent(system_prompt, task)
        {open && <span className="ml-auto text-[13px] font-sans text-accent-gold">same call as Part 1</span>}
      </div>
      {!open ? (
        <div className="flex items-center justify-center flex-wrap gap-3 py-3 text-[15px]">
          <span className="px-2.5 py-1 rounded bg-white/5 text-white/85">📋 job card</span>
          <span className="text-white/40">+</span>
          <span className="px-2.5 py-1 rounded bg-white/5 text-white/85">📝 task</span>
          <motion.span animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-white/50">➜</motion.span>
          <span className="px-2.5 py-1 rounded font-semibold" style={{ background: `${ACCENT}22`, color: ACCENT }}>🤖 agent</span>
          <span className="text-white/50">➜</span>
          <span className="px-2.5 py-1 rounded bg-white/5 text-white/85">💬 reply</span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-[15px] leading-relaxed rounded-lg bg-black/30 p-3">
          <div className={`rounded px-1.5 ${hi('helper-open')}`}>client.chat.completions.create(</div>
          <div className="pl-4 text-white/35">model=&quot;gpt-4o-mini&quot;, messages=[</div>
          <div className={`ml-6 rounded px-1.5 ${hi('helper-system')}`}>📋 system: system_prompt</div>
          <div className={`ml-6 rounded px-1.5 ${hi('helper-task')}`}>📝 user: task</div>
          <div className="pl-4 text-white/35">])</div>
          <div className={`rounded px-1.5 ${hi('helper-return')}`}>➜ 💬 reply text</div>
        </motion.div>
      )}
    </div>
  );
}

export default function AssemblyLineAnim() {
  const { steps, trig, v, printed } = useTracerScene();
  const short = useShortScreen();
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
  // The sticky note is the focal point from the moment it exists until Wally has used it.
  const noteBig = ['facts-note', 'wally-start', 'carry', 'wally-work'].includes(trig);

  const ritaActive = trig === 'rita-work' || trig === 'rita-start' || trig === 'topic';
  const wallyActive = trig === 'wally-work' || trig === 'wally-start' || trig === 'carry';
  const ritaMood: BotMood = trig === 'rita-work' ? 'thinking' : facts ? 'proud' : ritaActive ? 'working' : 'happy';
  const wallyMood: BotMood = trig === 'wally-work' ? 'thinking' : article ? 'proud' : wallyActive ? 'working' : 'happy';
  const busy = ['rita-card', 'wally-card', 'rita-start', 'rita-work', 'facts-note', 'wally-start', 'carry', 'wally-work', 'article'];
  const ritaDim = busy.includes(trig) && !ritaActive && trig !== 'facts-note' && trig !== 'rita-card';
  const wallyDim = busy.includes(trig) && !wallyActive && trig !== 'article' && trig !== 'wally-card';

  const call =
    trig === 'rita-work'
      ? { who: 'Rita', code: `run_agent(researcher_prompt, "Topic: ${topic}")`, color: TEAM.researcher.color, ins: '📝 the topic', out: '💬 facts' }
      : trig === 'carry' || trig === 'wally-work'
      ? { who: 'Wally', code: 'run_agent(writer_prompt, "Facts:\\n" + facts)', color: TEAM.writer.color, ins: "📌 Rita's facts", out: '💬 a paragraph' }
      : null;

  // The one focal panel under the newsroom (or nothing, when the newsroom itself is the focus).
  let bottom: 'legend' | 'phone' | 'machine' | 'open' | 'card' | 'call' | 'article' | 'recap' | null = null;
  if (trig === 'intro') bottom = 'legend';
  else if (trig === 'setup') bottom = 'phone';
  else if (trig === 'helper') bottom = 'machine';
  else if (HELPER_OPEN.includes(trig)) bottom = 'open';
  else if (trig === 'rita-card' || trig === 'wally-card') bottom = 'card';
  else if (trig === 'recap') bottom = 'recap';
  else if (trig === 'article' && article) bottom = 'article';
  else if (call) bottom = 'call';

  // Short screens: a smaller newsroom (just tall enough for the big sticky note on the note steps),
  // and none at all while the run_agent machine is open (the machine is the whole story then).
  const hideStage = short && bottom === 'open';
  const stageH = !short ? 330 : noteBig ? 290 : 210;
  const botSize = short ? 64 : 84;
  // The big sticky note: wider on short (narrow) screens so the three facts fit in a few lines.
  const noteW = short ? 46 : 36;
  // A step that prints: one quiet console line under the scene (unless it prints the paragraph that the
  // article panel already shows in full, e.g. the heading "Wally's paragraph:" still gets its line).
  const printOneLine = printed.replace(/\s*\n+\s*/g, ' ').trim();
  const printLine =
    printOneLine && bottom !== 'recap' && !(bottom === 'article' && article && article.includes(printOneLine.slice(0, 40)))
      ? printOneLine
      : '';

  const card =
    trig === 'rita-card'
      ? { who: 'Rita', text: ritaCard, color: TEAM.researcher.color }
      : { who: 'Wally', text: wallyCard, color: TEAM.writer.color };

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-hidden text-white">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-[16px] font-bold" style={{ color: ACCENT }}>📰 The Newsroom</div>
        {topic && (
          <span className="text-[13px] px-2.5 py-0.5 rounded-full bg-white/5 text-white/70">
            topic: <b className="text-white">{topic}</b>
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center gap-4">
        {/* Stage: desks, belt, sticky note */}
        {!hideStage && (
          <div className="relative flex-shrink-0" style={{ height: stageH }}>
            {/* Rita */}
            <div className="absolute left-0 top-0 w-[34%] flex flex-col items-center">
              <AgentBot {...TEAM.researcher} role={undefined} size={botSize} mood={ritaMood} active={ritaActive} dimmed={ritaDim} />
              <Desk color={TEAM.researcher.color} />
              <CardChip set={!!ritaCard} color={TEAM.researcher.color} glow={trig === 'rita-card'} />
            </div>
            {/* Wally */}
            <div className="absolute right-0 top-0 w-[34%] flex flex-col items-center">
              <AgentBot {...TEAM.writer} role={undefined} size={botSize} mood={wallyMood} active={wallyActive} dimmed={wallyDim} />
              <Desk color={TEAM.writer.color} />
              <CardChip set={!!wallyCard} color={TEAM.writer.color} glow={trig === 'wally-card'} />
            </div>

            {/* Mail carrier = our code */}
            <div className="absolute left-[34%] right-[34%] top-8 flex justify-center">
              <motion.div
                className="rounded-xl px-3 py-1.5 text-[14px] font-semibold"
                animate={{
                  scale: carrying ? 1.12 : 1,
                  boxShadow: carrying ? `0 0 18px ${ACCENT}88` : '0 0 0px transparent',
                }}
                style={{ background: '#0b1b2b', border: `1.5px solid ${ACCENT}`, color: ACCENT }}
              >
                🐍 our code
              </motion.div>
            </div>

            {/* Conveyor belt */}
            <div
              className="absolute left-[26%] right-[26%] h-4 rounded-full overflow-hidden border border-white/15 bg-white/5"
              style={{ bottom: short && !noteBig ? 52 : 70 }}
            >
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
                animate={{ y: 0, opacity: 1, scale: trig === 'topic' ? 1.08 : 1 }}
                className="absolute left-[3%] w-[28%] bottom-[8px] rounded-md px-3 py-2 text-[15px] bg-white text-slate-800 shadow-lg"
              >
                📄 <b>Task:</b> &quot;Topic: {topic}&quot;
              </motion.div>
            )}

            {/* Rita's sticky note: rides the belt to Wally at the handoff, then shrinks to a chip */}
            {facts && (
              <motion.div
                key="note"
                initial={{ scale: 0.4, opacity: 0, left: '1%' }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  left: noteAtWally ? (noteBig ? `${100 - noteW}%` : '72%') : '1%',
                  rotate: noteBig ? (noteAtWally ? 1.5 : -1.5) : 0,
                }}
                transition={{ left: { duration: carrying ? 1.6 : 0.4, ease: 'easeInOut' }, default: { duration: 0.4 } }}
                className={`absolute bottom-0 rounded-md shadow-xl ${noteBig ? 'p-3 text-[13.5px] leading-snug' : 'px-3 py-1.5 text-[13px]'}`}
                style={{
                  width: noteBig ? `${noteW}%` : undefined,
                  background: '#fde68a',
                  color: '#3b2f05',
                  boxShadow: carrying ? `0 0 18px ${ACCENT}` : undefined,
                }}
              >
                <div className="font-bold">
                  📌 {noteBig ? (noteAtWally ? "Wally's task" : "Rita's facts") : '✓ facts'}
                </div>
                {noteBig && (
                  // Clamped by whole lines (ending in "…" if a long reply ever needs more), never cut mid-line.
                  <div
                    className="whitespace-pre-line overflow-hidden mt-1"
                    style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: short ? 6 : 7 }}
                  >
                    {facts}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* The one focal panel for this step */}
        {bottom && (
          <motion.div key={bottom + trig} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0">
            {bottom === 'legend' && (
              <div className="rounded-xl bg-white/5 p-4 flex items-center justify-center flex-wrap gap-3 text-[16px]">
                <span style={{ color: TEAM.researcher.color }} className="font-semibold">🔍 Rita finds facts</span>
                <span className="text-white/40">➜</span>
                <span style={{ color: ACCENT }} className="font-semibold">🐍 our code carries them</span>
                <span className="text-white/40">➜</span>
                <span style={{ color: TEAM.writer.color }} className="font-semibold">✍️ Wally writes</span>
              </div>
            )}
            {bottom === 'phone' && (
              <div className="rounded-xl bg-white/5 p-4 text-center text-[16px] text-white/85">
                {v('client') ? (
                  <>
                    📞 <span className="font-mono">client = OpenAI()</span>: our phone line to the AI
                  </>
                ) : (
                  <>
                    📦 <span className="font-mono">from openai import OpenAI</span>
                  </>
                )}
              </div>
            )}
            {(bottom === 'machine' || bottom === 'open') && <Machine trig={trig} open={bottom === 'open'} compact={short} />}
            {bottom === 'card' && (
              <div className="rounded-xl p-4 border-2" style={{ borderColor: card.color, background: `${card.color}12` }}>
                <div className="text-[14px] font-semibold mb-1.5" style={{ color: card.color }}>
                  📋 {card.who}&apos;s job card
                </div>
                <div className="text-[16px] leading-snug text-white/90">{card.text}</div>
              </div>
            )}
            {bottom === 'call' && call && (
              <div className="rounded-xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: call.color, background: '#0b1b2b' }}>
                <div className="text-[16px] font-semibold text-white/90">
                  📋 {call.who}&apos;s job card + {call.ins} ➜ <span style={{ color: call.color }}>{call.out}</span>
                </div>
                <div className="font-mono text-[14px] text-white/55 truncate">⚙️ {call.code}</div>
              </div>
            )}
            {bottom === 'article' && article && (
              <div className="rounded-xl p-4 bg-white text-slate-800 shadow-xl" style={{ borderLeft: `6px solid ${TEAM.writer.color}` }}>
                <div className="text-[14px] font-bold text-green-700 mb-1.5">✍️ Wally&apos;s paragraph</div>
                <div className="text-[16px] leading-snug">{article}</div>
              </div>
            )}
            {bottom === 'recap' && (
              <div className="rounded-xl p-4 flex flex-col gap-2 text-[16px]" style={{ background: `${ACCENT}0d` }}>
                <div>1️⃣ An agent = <span className="font-mono" style={{ color: ACCENT }}>run_agent</span> + its own job card.</div>
                <div>2️⃣ One agent&apos;s answer becomes the next agent&apos;s task.</div>
                <div>3️⃣ Our code carries the note. The agents never talk directly.</div>
              </div>
            )}
          </motion.div>
        )}

        {printLine && (
          <motion.div
            key={`print-${trig}-${printLine}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 rounded-xl bg-black/50 border border-white/10 px-4 py-2 font-mono text-[14px] text-white/80 truncate"
          >
            <span className="text-white/40">🖨 </span>
            {printLine}
            </motion.div>
        )}
      </div>
    </div>
  );
}
