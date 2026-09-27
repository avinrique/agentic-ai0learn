'use client';
/**
 * WriterCriticAnim — Lesson 22 (Code: Writer & Critic Loop).
 *
 * Wally (writer) and Cora (critic) face each other across a table. Drafts slide
 * over, Cora marks them with a red pen and a tip bubble, a round counter and a
 * 3-notch "safety fuse" show the max-3-rounds limit, and a green APPROVED stamp
 * lands when she approves. Everything is derived from the current tracer step.
 */
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import AgentBot, { TEAM, BotMood } from '@/components/animations/characters/AgentBot';
import { readVar, useTracerScene } from './useTracerScene';

const ACCENT = '#22d3ee';
const MAX_ROUNDS = 3;
const RED = '#f87171';
const GREEN = '#4ade80';

type PaperSpot = 'wally' | 'middle' | 'cora';

/** The max-3-rounds safety fuse, doubling as the round counter: one notch burns per round started. */
function Fuse({ round, burntOut, stopped }: { round: number; burntOut: boolean; stopped: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[14px] font-mono font-bold" style={{ color: round > 0 ? ACCENT : 'rgba(255,255,255,0.4)' }}>
        Round {round > 0 ? round : '–'} / {MAX_ROUNDS}
      </span>
      <div className="flex items-center gap-1">
        {Array.from({ length: MAX_ROUNDS }, (_, i) => {
          const burnt = i < round;
          const current = i === round - 1 && !burntOut && !stopped;
          return (
            <motion.div
              key={i}
              className="relative h-2.5 w-8 rounded-full"
              animate={{ backgroundColor: burnt ? '#4b5563' : '#f59e0b' }}
            >
              {current && (
                <motion.span
                  className="absolute -right-1.5 -top-2 text-[13px]"
                  animate={{ scale: [1, 1.35, 1], opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                >
                  ✨
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
      <span className="text-[15px]">{burntOut ? '💥' : '💣'}</span>
    </div>
  );
}

/** A job card collapsed to a one-line chip under its robot. */
function CardChip({ set, color, glow }: { set: boolean; color: string; glow: boolean }) {
  return (
    <div
      className="text-[13px] px-2.5 py-0.5 rounded-full whitespace-nowrap"
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

/** The job card shown big, on the step that writes it. */
function BigCard({ who, text, color, highlight }: { who: string; text?: string; color: string; highlight?: string }) {
  let body: ReactNode = text;
  if (text && highlight && text.includes(highlight)) {
    const [a, b] = text.split(highlight);
    body = (
      <>
        {a}
        <b className="px-1 rounded" style={{ background: `${GREEN}33`, color: GREEN }}>{highlight}</b>
        {b}
      </>
    );
  }
  return (
    <motion.div
      key={who}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full rounded-xl p-4 border-2"
      style={{ borderColor: color, background: `${color}12` }}
    >
      <div className="text-[14px] font-semibold mb-1.5" style={{ color }}>📋 {who}&apos;s job card</div>
      <div className="text-[16px] leading-snug text-white/90">{body}</div>
    </motion.div>
  );
}

export default function WriterCriticAnim() {
  const { steps, index, trig, v, printed } = useTracerScene();
  if (steps.length === 0) return null;

  const draft = v('draft');
  const feedback = v('feedback');
  const round = Number(v('round_number') ?? 0);
  const task = v('task');
  const approved = feedback === 'APPROVED';
  const hasFeedbackThisRound = ['feedback', 'check', 'approved', 'rewrite-note'].includes(trig);
  const endedApproved = approved && ['approved', 'final', 'recap'].includes(trig);
  const fuseOut = trig === 'fuse-out' || (!approved && ['final', 'recap'].includes(trig) && round === MAX_ROUNDS);

  // Round history so far: one entry per round, from the steps up to now.
  const history: { round: number; text: string }[] = [];
  for (let i = 0; i <= index; i++) {
    const s = steps[i];
    if (s.animationTrigger !== 'feedback') continue;
    const r = Number(readVar(s, 'round_number'));
    const fb = readVar(s, 'feedback') ?? '';
    if (!history.some((h) => h.round === r)) history.push({ round: r, text: fb });
  }

  // Where the paper sits on the table.
  let spot: PaperSpot = 'wally';
  if (['slide', 'cora-work', 'feedback', 'check'].includes(trig)) spot = 'cora';
  if (endedApproved || ['final', 'recap'].includes(trig)) spot = 'middle';
  const paperX = { wally: '-9%', middle: '0%', cora: '9%' }[spot];

  const wallyActive = ['wally-work', 'wally-rewrite', 'wally-card'].includes(trig);
  const coraActive = ['cora-work', 'feedback', 'cora-card'].includes(trig);
  const wallyMood: BotMood =
    trig === 'wally-work' || trig === 'wally-rewrite' ? 'thinking'
    : endedApproved ? 'proud'
    : trig === 'rewrite-note' ? 'confused'
    : fuseOut ? 'tired'
    : 'happy';
  const coraMood: BotMood =
    trig === 'cora-work' ? 'thinking'
    : hasFeedbackThisRound && approved ? 'proud'
    : hasFeedbackThisRound ? 'working'
    : fuseOut ? 'tired'
    : 'happy';
  const loopy = ['slide', 'cora-work', 'feedback', 'check', 'approved', 'rewrite-note', 'wally-rewrite', 'draft', 'wally-work', 'task'];
  const wallyDim = (loopy.includes(trig) && !wallyActive && !['draft', 'rewrite-note', 'approved', 'task'].includes(trig)) || trig === 'cora-card';
  const coraDim = (loopy.includes(trig) && !coraActive && !['check', 'approved', 'slide'].includes(trig)) || trig === 'wally-card';

  const writing = trig === 'wally-work' || trig === 'wally-rewrite';
  const showMarks = hasFeedbackThisRound && !approved && trig !== 'rewrite-note' && !endedApproved;
  const showTipNote = trig === 'rewrite-note' || trig === 'wally-rewrite';
  const showBubble = hasFeedbackThisRound && !!feedback && trig !== 'rewrite-note' && !endedApproved;

  // What the middle of the table shows (one thing at a time).
  const middle: 'flow' | 'setup' | 'card' | 'paper' | 'recap' | null =
    trig === 'intro' ? 'flow'
    : trig === 'setup' ? 'setup'
    : trig === 'wally-card' || trig === 'cora-card' ? 'card'
    : trig === 'recap' ? 'recap'
    : draft || writing || (task && trig === 'task') ? 'paper'
    : null;
  const showHistory = history.length > 0 && !['recap', 'intro'].includes(trig);
  // A step that prints: one quiet console line (what it printed, on one line) under the table.
  const printLine = printed ? printed.replace(/\s*\n+\s*/g, ' ') : '';
  // The setup steps: the one new line of code, big, in the middle of the table.
  const setupLine = v('run_agent')
    ? { code: 'run_agent(system_prompt, task)', note: '📋 job card + 📝 task ➜ 💬 reply' }
    : v('client')
      ? { code: 'client = OpenAI()', note: '📞 our phone line to the AI' }
      : { code: 'from openai import OpenAI', note: '📦 the OpenAI library' };

  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-hidden text-white">
      {/* Header: title + round counter / safety fuse */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-[16px] font-bold" style={{ color: ACCENT }}>🔁 The Review Table</div>
        <div className="ml-auto">
          <Fuse round={round} burntOut={fuseOut} stopped={endedApproved} />
        </div>
      </div>

      {/* Stage */}
      <div className="flex-1 min-h-0 flex items-center gap-3">
        {/* Wally */}
        <div className="w-[20%] flex flex-col items-center gap-2">
          <AgentBot {...TEAM.writer} role={undefined} size={104} mood={wallyMood} active={wallyActive} dimmed={wallyDim} />
          <CardChip set={!!v('writer_prompt')} color={TEAM.writer.color} glow={trig === 'wally-card'} />
        </div>

        {/* Table */}
        <div className="flex-1 h-full relative flex flex-col justify-center">
          {middle === 'flow' && (
            <div className="flex flex-col items-center gap-2.5 text-[17px] font-semibold">
              <span style={{ color: TEAM.writer.color }}>✍️ Wally writes</span>
              <span className="text-white/40">⬇</span>
              <span style={{ color: TEAM.critic.color }}>🧐 Cora checks</span>
              <span className="text-white/40">⬇</span>
              <span className="text-white/85">🔁 tip? Wally fixes it</span>
              <span className="text-white/40">⬇</span>
              <span style={{ color: GREEN }}>✅ APPROVED</span>
            </div>
          )}

          {middle === 'setup' && (
            <motion.div
              key={setupLine.code}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto rounded-xl border-2 px-5 py-4 flex flex-col items-center gap-2"
              style={{ borderColor: `${ACCENT}88`, background: '#0b1b2b' }}
            >
              <span className="font-mono text-[18px] font-semibold" style={{ color: ACCENT }}>
                {setupLine.code}
              </span>
              <span className="text-[15px] text-white/70">{setupLine.note}</span>
            </motion.div>
          )}

          {middle === 'card' &&
            (trig === 'wally-card' ? (
              <BigCard who="Wally" text={v('writer_prompt')} color={TEAM.writer.color} />
            ) : (
              <BigCard who="Cora" text={v('critic_prompt')} color={TEAM.critic.color} highlight="APPROVED" />
            ))}

          {middle === 'recap' && (
            <div className="flex flex-col gap-2.5 text-[16px] leading-snug">
              <div>1️⃣ A critic agent (Cora) checks a writer agent (Wally).</div>
              <div>2️⃣ The loop repeats until &quot;APPROVED&quot; triggers <span className="font-mono" style={{ color: ACCENT }}>break</span>.</div>
              <div>3️⃣ A max-rounds fuse means it always ends.</div>
            </div>
          )}

          {middle === 'paper' && (
            <div className="relative">
              {/* Cora's speech bubble */}
              {showBubble && (
                <motion.div
                  key={`bubble-${round}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-3 ml-auto w-fit max-w-[92%] rounded-2xl rounded-tr-sm px-3.5 py-2 text-[16px] font-semibold shadow-lg"
                  style={{
                    background: approved ? `${GREEN}22` : '#2a1020',
                    border: `2px solid ${approved ? GREEN : TEAM.critic.color}`,
                    color: approved ? GREEN : '#fbcfe8',
                  }}
                >
                  {approved ? '✅ APPROVED' : `🖍️ ${feedback}`}
                </motion.div>
              )}

              {/* Task slip */}
              {task && ['task', 'wally-work'].includes(trig) && (
                <motion.div
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-3 w-fit rounded-md px-3 py-1.5 text-[15px] bg-white text-slate-800 shadow"
                >
                  📄 <b>task:</b> {task}
                </motion.div>
              )}

              {/* Our code moves the paper */}
              {['slide', 'rewrite-note'].includes(trig) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-3 mx-auto w-fit text-[14px] font-semibold px-3 py-1 rounded-full"
                  style={{ background: '#0b1b2b', border: `1.5px solid ${ACCENT}`, color: ACCENT }}
                >
                  {trig === 'slide' ? '🐍 our code slides it ➡' : '⬅ 🐍 our code slides it back'}
                </motion.div>
              )}

              {/* The draft paper */}
              {(draft || writing) && (
                <motion.div
                  initial={false}
                  animate={{ x: paperX, rotate: spot === 'cora' ? 1.5 : spot === 'wally' ? -1.5 : 0, scale: spot === 'middle' ? 1.04 : 1 }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                  className="relative mx-auto w-[88%] min-h-[120px] rounded-md p-4 bg-white text-slate-800 shadow-xl"
                >
                  <div className="text-[13px] font-bold text-slate-500 mb-1.5">📝 draft</div>
                  {draft ? (
                    <div className={`text-[18px] leading-snug whitespace-pre-line ${writing ? 'opacity-30' : ''}`}>
                      {showMarks ? (
                        <span style={{ textDecoration: `underline wavy ${RED}`, textUnderlineOffset: 5 }}>{draft}</span>
                      ) : (
                        draft
                      )}
                    </div>
                  ) : null}
                  {writing && (
                    <motion.div
                      className="text-[15px] text-green-700 font-semibold mt-1"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.1 }}
                    >
                      ✍️ writing…
                    </motion.div>
                  )}
                  {showMarks && (
                    <motion.div
                      initial={{ rotate: -30, x: 20, opacity: 0 }}
                      animate={{ rotate: 0, x: 0, opacity: 1 }}
                      className="absolute -right-3 -top-3 text-[24px]"
                    >
                      🖍️
                    </motion.div>
                  )}
                  {endedApproved && (
                    <motion.div
                      initial={{ scale: 2.5, opacity: 0, rotate: -25 }}
                      animate={{ scale: 1, opacity: 1, rotate: -12 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 180 }}
                      className="absolute -top-5 -right-5 pointer-events-none"
                    >
                      <span
                        className="px-2.5 py-0.5 rounded-lg text-[20px] font-black tracking-widest"
                        style={{ color: GREEN, border: `4px solid ${GREEN}`, background: 'rgba(255,255,255,0.8)' }}
                      >
                        APPROVED
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Cora's tip travels back with the draft */}
              {showTipNote && feedback && (
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative -mt-3 ml-auto mr-[4%] w-[62%] rounded p-2.5 text-[15px] leading-snug shadow-lg rotate-2"
                  style={{ background: '#fbcfe8', color: '#500724' }}
                >
                  📌 <b>Tip:</b> {feedback}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Cora */}
        <div className="w-[20%] flex flex-col items-center gap-2">
          <AgentBot {...TEAM.critic} role={undefined} size={104} mood={coraMood} active={coraActive} dimmed={coraDim} />
          <CardChip set={!!v('critic_prompt')} color={TEAM.critic.color} glow={trig === 'cora-card'} />
        </div>
      </div>

      {printLine && (
        <motion.div
          key={`print-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 rounded-xl bg-black/50 border border-white/10 px-4 py-2 font-mono text-[14px] text-white/80 truncate"
        >
          <span className="text-white/40">🖨 </span>
          {printLine}
        </motion.div>
      )}

      {/* Past rounds: a compact chip row */}
      {showHistory && (
        <div className="flex-shrink-0 flex items-center gap-2 flex-wrap">
          {history.map((h) => (
            <motion.div
              key={h.round}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[48%] truncate text-[13px] px-2.5 py-1 rounded-full bg-white/5"
              style={{ color: h.text === 'APPROVED' ? GREEN : '#fbcfe8' }}
            >
              <span className="text-white/50 font-mono">R{h.round}</span>{' '}
              {h.text === 'APPROVED' ? '✅ APPROVED' : `🖍️ ${h.text}`}
            </motion.div>
          ))}
          {fuseOut && <div className="text-[13px] px-2.5 py-1 rounded-full bg-accent-gold/10 text-accent-gold">💥 fuse out: keep last draft</div>}
        </div>
      )}
    </div>
  );
}
