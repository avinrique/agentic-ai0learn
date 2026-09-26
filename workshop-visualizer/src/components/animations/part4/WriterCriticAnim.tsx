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

function status(trig: string, round: number, approved: boolean): string {
  switch (trig) {
    case 'intro': return 'Write ➜ check ➜ fix ➜ repeat';
    case 'setup': return 'Getting ready…';
    case 'wally-card': return "Pinning Wally's job card";
    case 'cora-card': return "Pinning Cora's job card";
    case 'task': return 'The job lands on the table';
    case 'wally-work': return 'Wally is writing draft 1…';
    case 'draft': return 'A draft is on the table';
    case 'round': return `Round ${round} begins`;
    case 'slide': return 'The draft slides over to Cora';
    case 'cora-work': return 'Cora is reviewing…';
    case 'feedback': return approved ? 'Cora says APPROVED!' : 'Cora gives one tip';
    case 'check': return approved ? '"APPROVED"? Yes!' : '"APPROVED"? Not yet…';
    case 'approved': return 'Approved ➜ break out of the loop';
    case 'rewrite-note': return "Tip + old draft go back to Wally";
    case 'wally-rewrite': return 'Wally is rewriting…';
    case 'fuse-out': return 'Fuse burnt out ➜ loop ends';
    case 'final': return 'Printing the final slogan';
    case 'recap': return 'Done ✓';
    default: return '';
  }
}

/** The max-3-rounds safety fuse: one notch burns per round started. */
function Fuse({ used, burntOut, stopped }: { used: number; burntOut: boolean; stopped: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-white/60 mr-0.5">safety fuse</span>
      {Array.from({ length: MAX_ROUNDS }, (_, i) => {
        const burnt = i < used;
        const current = i === used - 1 && !burntOut && !stopped;
        return (
          <motion.div
            key={i}
            className="relative h-2.5 w-9 rounded-full"
            animate={{ backgroundColor: burnt ? '#4b5563' : '#f59e0b' }}
            style={{ border: '1px solid rgba(255,255,255,0.15)' }}
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
      <span className="text-[13px]">{burntOut ? '💥' : '💣'}</span>
      <span className="text-[11px] text-white/50">max {MAX_ROUNDS} rounds</span>
    </div>
  );
}

function MiniCard({ who, text, color, glow, highlight }: { who: string; text?: string; color: string; glow: boolean; highlight?: string }) {
  let body: ReactNode = text;
  if (text && highlight && text.includes(highlight)) {
    const [a, b] = text.split(highlight);
    body = (
      <>
        {a}
        <b className="px-0.5 rounded" style={{ background: `${GREEN}33`, color: GREEN }}>{highlight}</b>
        {b}
      </>
    );
  }
  return (
    <div
      className="w-full rounded-lg px-1.5 py-1 text-[10.5px] leading-snug"
      style={{
        border: `1.5px ${text ? 'solid' : 'dashed'} ${text ? color : 'rgba(255,255,255,0.15)'}`,
        background: text ? `${color}12` : 'transparent',
        boxShadow: glow ? `0 0 14px ${color}66` : 'none',
      }}
    >
      <div className="font-semibold text-[11px]" style={{ color: text ? color : 'rgba(255,255,255,0.3)' }}>📋 {who}&apos;s job card</div>
      <div className={text ? 'text-white/75' : 'text-white/25 italic'}>{text ? body : 'not written yet'}</div>
    </div>
  );
}

export default function WriterCriticAnim() {
  const { steps, index, trig, v } = useTracerScene();
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
  const paperLeft = { wally: '0%', middle: '21%', cora: '42%' }[spot];

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
  const loopy = ['slide', 'cora-work', 'feedback', 'check', 'approved', 'rewrite-note', 'wally-rewrite', 'draft', 'wally-work'];
  const wallyDim = loopy.includes(trig) && !wallyActive && !['draft', 'rewrite-note', 'approved'].includes(trig);
  const coraDim = loopy.includes(trig) && !coraActive && !['check', 'approved', 'slide'].includes(trig);

  const writing = trig === 'wally-work' || trig === 'wally-rewrite';
  const showMarks = hasFeedbackThisRound && !approved && trig !== 'rewrite-note';
  const showTipNote = trig === 'rewrite-note' || trig === 'wally-rewrite';
  const showBubble = hasFeedbackThisRound && !!feedback;

  return (
    <div className="h-full flex flex-col gap-2 p-3 overflow-hidden text-white">
      {/* Header: title, round counter, safety fuse */}
      <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
        <div className="text-[15px] font-bold" style={{ color: ACCENT }}>🔁 The Review Table</div>
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_ROUNDS }, (_, i) => (
            <motion.span
              key={i}
              animate={{ scale: round === i + 1 ? 1.1 : 1 }}
              className="text-[11px] px-1.5 py-0.5 rounded-md font-semibold"
              style={{
                background: round === i + 1 ? `${ACCENT}33` : i < round ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: round === i + 1 ? ACCENT : i < round ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
                border: `1px solid ${round === i + 1 ? ACCENT : 'rgba(255,255,255,0.12)'}`,
              }}
            >
              {i + 1}
            </motion.span>
          ))}
          <span className="text-[13px] font-mono font-bold ml-1" style={{ color: ACCENT }}>
            Round {round > 0 ? round : '–'} / {MAX_ROUNDS}
          </span>
        </div>
        <div className="ml-auto">
          <Fuse used={round} burntOut={fuseOut} stopped={endedApproved} />
        </div>
      </div>
      <motion.div
        key={`${trig}-${round}`}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="self-start text-[12px] px-2.5 py-1 rounded-full flex-shrink-0"
        style={{ background: `${ACCENT}1a`, color: ACCENT, border: `1px solid ${ACCENT}44` }}
      >
        {status(trig, round, approved)}
        {fuseOut && <span className="text-white/70"> (so they can&apos;t argue forever)</span>}
      </motion.div>

      {/* Stage */}
      <div className="flex gap-2 flex-shrink-0 h-[300px]">
        {/* Wally */}
        <div className="w-[26%] flex flex-col items-center gap-1.5">
          <AgentBot {...TEAM.writer} size={68} mood={wallyMood} active={wallyActive} dimmed={wallyDim} />
          <MiniCard who="Wally" text={v('writer_prompt')} color={TEAM.writer.color} glow={trig === 'wally-card'} />
        </div>

        {/* Table */}
        <div className="flex-1 relative">
          {/* Cora's speech bubble */}
          {showBubble && (
            <motion.div
              key={`bubble-${round}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute right-0 top-0 max-w-[80%] rounded-2xl rounded-tr-sm px-3 py-2 text-[13px] font-semibold shadow-lg z-20"
              style={{
                background: approved ? `${GREEN}22` : '#2a1020',
                border: `2px solid ${approved ? GREEN : TEAM.critic.color}`,
                color: approved ? GREEN : '#fbcfe8',
              }}
            >
              {approved ? '✅ APPROVED' : `🖍️ Tip: ${feedback}`}
            </motion.div>
          )}

          {/* Task slip */}
          {task && ['task', 'wally-work'].includes(trig) && (
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute left-0 top-0 rounded-md px-2 py-1 text-[12px] bg-white text-slate-800 shadow"
            >
              📄 <b>task:</b> {task}
            </motion.div>
          )}

          {/* Table top */}
          <div
            className="absolute left-0 right-0 bottom-0 h-[170px] rounded-2xl"
            style={{ background: 'linear-gradient(#3b2a1a, #2a1d12)', border: '2px solid #5b4128' }}
          />

          {/* The draft paper */}
          {(draft || writing) && (
            <motion.div
              initial={false}
              animate={{ left: paperLeft, rotate: spot === 'cora' ? 2 : spot === 'wally' ? -2 : 0, scale: spot === 'middle' ? 1.05 : 1 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              className="absolute bottom-[18px] w-[58%] min-h-[118px] rounded-md p-2.5 bg-white text-slate-800 shadow-xl"
            >
              <div className="text-[11px] font-bold text-slate-500 mb-1">
                📝 {draft ? 'draft' : 'first draft'}
                {round > 0 && draft && <span className="font-normal"> · round {round}</span>}
              </div>
              {draft ? (
                <div className={`text-[13.5px] leading-snug whitespace-pre-line ${writing ? 'opacity-30' : ''}`}>
                  {showMarks ? (
                    <span style={{ textDecoration: `underline wavy ${RED}`, textUnderlineOffset: 4 }}>{draft}</span>
                  ) : (
                    draft
                  )}
                </div>
              ) : null}
              {writing && (
                <motion.div
                  className="text-[13px] text-green-700 font-semibold mt-1"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.1 }}
                >
                  ✍️ Wally is {draft ? 'rewriting' : 'writing'}…
                </motion.div>
              )}
              {showMarks && (
                <motion.div
                  initial={{ rotate: -30, x: 20, opacity: 0 }}
                  animate={{ rotate: 0, x: 0, opacity: 1 }}
                  className="absolute -right-3 -top-3 text-[22px]"
                >
                  🖍️
                </motion.div>
              )}
              {showTipNote && feedback && (
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -right-4 -bottom-3 w-[62%] rounded p-1.5 text-[11.5px] leading-snug shadow-lg rotate-3"
                  style={{ background: '#fbcfe8', color: '#500724' }}
                >
                  📌 <b>Cora&apos;s tip:</b> {feedback}
                </motion.div>
              )}
              {endedApproved && (
                <motion.div
                  initial={{ scale: 2.5, opacity: 0, rotate: -25 }}
                  animate={{ scale: 1, opacity: 1, rotate: -12 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 180 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <span
                    className="px-3 py-1 rounded-lg text-[22px] font-black tracking-widest"
                    style={{ color: GREEN, border: `4px solid ${GREEN}`, background: 'rgba(255,255,255,0.75)' }}
                  >
                    APPROVED
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Our code moves the paper */}
          {['slide', 'rewrite-note'].includes(trig) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-[140px] text-[11px] font-semibold px-2 py-0.5 rounded-full z-10"
              style={{ background: '#0b1b2b', border: `1px solid ${ACCENT}`, color: ACCENT }}
            >
              🐍 our code slides it {trig === 'slide' ? '➡' : '⬅'}
            </motion.div>
          )}
        </div>

        {/* Cora */}
        <div className="w-[26%] flex flex-col items-center gap-1.5">
          <AgentBot {...TEAM.critic} size={68} mood={coraMood} active={coraActive} dimmed={coraDim} />
          <MiniCard who="Cora" text={v('critic_prompt')} color={TEAM.critic.color} glow={trig === 'cora-card'} highlight="APPROVED" />
        </div>
      </div>

      {/* Bottom: round history / final result / recap */}
      <div className="flex-1 min-h-[80px] rounded-xl border border-white/10 bg-white/[0.03] p-2.5 overflow-hidden">
        {trig === 'recap' ? (
          <div className="flex flex-col gap-1 text-[13px]">
            <div className="font-bold" style={{ color: ACCENT }}>What you learned</div>
            <div>1️⃣ A critic agent (Cora) checks a writer agent (Wally).</div>
            <div>2️⃣ The loop repeats until &quot;APPROVED&quot; triggers <span className="font-mono">break</span>.</div>
            <div>3️⃣ A max-rounds fuse means it always ends.</div>
          </div>
        ) : trig === 'intro' ? (
          <div className="h-full flex items-center justify-center gap-2 text-[14px] font-semibold flex-wrap">
            <span style={{ color: TEAM.writer.color }}>✍️ Wally writes</span>
            <span className="text-white/40">➜</span>
            <span style={{ color: TEAM.critic.color }}>🧐 Cora checks</span>
            <span className="text-white/40">➜</span>
            <span className="text-white/80">tip? Wally fixes it 🔁</span>
            <span className="text-white/40">➜</span>
            <span style={{ color: GREEN }}>APPROVED ✅</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="text-[11px] uppercase tracking-wider text-white/40">Rounds so far</div>
            {history.length === 0 && <div className="text-[12px] text-white/30 italic">No reviews yet</div>}
            {history.map((h) => (
              <motion.div
                key={h.round}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[12.5px] flex gap-2 items-baseline"
              >
                <span className="font-mono text-white/50">Round {h.round}</span>
                {h.text === 'APPROVED' ? (
                  <span className="font-bold" style={{ color: GREEN }}>✅ APPROVED</span>
                ) : (
                  <span style={{ color: '#fbcfe8' }}>🖍️ {h.text}</span>
                )}
              </motion.div>
            ))}
            {fuseOut && (
              <div className="text-[12.5px] text-accent-gold">💥 3 rounds used up: we keep Wally&apos;s last draft.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
