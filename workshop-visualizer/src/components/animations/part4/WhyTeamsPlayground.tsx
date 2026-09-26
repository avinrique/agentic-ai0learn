'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AgentBot, { TEAM } from '@/components/animations/characters/AgentBot';

const CYAN = '#22d3ee';
const spring = { type: 'spring' as const, stiffness: 260, damping: 24 };
const SECONDS_PER_CALL = 2; // a rough, made-up average so the numbers are easy to compare

type Helper = 'rita' | 'wally' | 'cora';

interface Job {
  id: string;
  chip: string;
  task: string;
  soloQuality: number; // stars out of 5 when Solo Bot does it alone
  bonus: Record<Helper, number>; // how much each helper changes the stars
  out: { rita: string; writerSolo: string; wally: string; cora: string; fix?: string };
  coraFinds: boolean; // does Cora find something to fix? (then the writer runs once more)
  missing: Partial<Record<Helper, string>>; // what goes wrong without this helper
  wasted: Partial<Record<Helper, string>>; // what this helper adds when it is NOT needed
}

// All outputs are made-up examples so the playground works without any API calls.
const JOBS: Job[] = [
  {
    id: 'poem',
    chip: '🎂 Birthday poem',
    task: 'Write a short birthday poem for Grandma',
    soloQuality: 4,
    bonus: { rita: 0, wally: 1, cora: 0 },
    out: {
      rita: 'Searched "grandma birthday"… nothing a poem needs.',
      writerSolo: 'Happy birthday Grandma, you are great! Let us eat cake and celebrate!',
      wally: 'Roses are red, the cake is sweet, Grandma, you make our family complete! 🎂',
      cora: 'No facts to check here. OK!',
    },
    coraFinds: false,
    missing: { wally: 'A focused writer would make the poem a little nicer.' },
    wasted: { rita: 'Rita searched the web for a poem that needs no facts.', cora: 'Cora checked a poem that has no facts in it.' },
  },
  {
    id: 'trip',
    chip: '🚌 Plan a school trip',
    task: 'Plan a class trip to the science museum on Monday',
    soloQuality: 2,
    bonus: { rita: 1, wally: 1, cora: 1 },
    out: {
      rita: 'Museum: open Tue–Sun, 9–5. Closed Mondays! Kids ticket: $8. Bus ride: 40 min.',
      writerSolo: 'trip monday, bus 9am, tickets maybe $5?, lunch, back 3pm',
      wally: '9:00 Bus leaves 🚌 · 9:40 Arrive · 10:00 Space room · 12:00 Lunch · 14:30 Bus home',
      cora: '❌ The museum is closed on Mondays! Move the trip to Tuesday.',
      fix: 'Fixed: trip moved to Tuesday. ✓',
    },
    coraFinds: true,
    missing: {
      rita: 'No fact-finder: ticket prices and opening times were guessed.',
      wally: 'No focused writer: the plan is a messy list.',
      cora: 'No checker: nobody noticed the museum is closed on Mondays.',
    },
    wasted: {},
  },
  {
    id: 'math',
    chip: '➕ What is 2 + 2?',
    task: 'Answer: what is 2 + 2?',
    soloQuality: 5,
    bonus: { rita: 0, wally: -1, cora: 0 },
    out: {
      rita: 'Searched the web for "2 + 2". Found: 4.',
      writerSolo: '4',
      wally: 'Once upon a time, two friends met two more friends… and together they were FOUR! 🎉',
      cora: 'Checked: 2 + 2 is 4. OK!',
    },
    coraFinds: false,
    missing: {},
    wasted: {
      rita: 'Rita searched the web for 2 + 2.',
      wally: 'Wally turned "4" into a whole story. Longer is not better here!',
      cora: 'Cora double-checked that 2 + 2 = 4.',
    },
  },
  {
    id: 'quiz',
    chip: '🚀 Space quiz',
    task: 'Make a 5-question quiz about space',
    soloQuality: 3,
    bonus: { rita: 1, wally: 0, cora: 1 },
    out: {
      rita: 'Facts: 8 planets · Pluto = dwarf planet since 2006 · Sun is a star · Moon: 27 days to orbit Earth',
      writerSolo: 'Q1 How many planets? … Q4 Which is the 9th planet? (Pluto) …',
      wally: 'Q1 🪐 How many planets? … Q4 🌑 Which is the 9th planet? (Pluto) …',
      cora: '❌ Q4 is wrong: Pluto is a dwarf planet, not the 9th planet. Change it.',
      fix: 'Fixed: Q4 now asks "Which planet is closest to the Sun?" ✓',
    },
    coraFinds: true,
    missing: {
      rita: 'No fact-finder: questions come from memory, and memory can be wrong.',
      cora: 'No checker: a wrong answer (Pluto) goes out to the class.',
    },
    wasted: { wally: 'A short quiz is not much better with a special writer.' },
  },
];

const HELPERS: { id: Helper; bot: (typeof TEAM)[keyof typeof TEAM] }[] = [
  { id: 'rita', bot: TEAM.researcher },
  { id: 'wally', bot: TEAM.writer },
  { id: 'cora', bot: TEAM.critic },
];

interface Stage {
  who: (typeof TEAM)[keyof typeof TEAM];
  label: string;
  text: string;
}

function buildStages(job: Job, team: Record<Helper, boolean>): Stage[] {
  const writer = team.wally ? TEAM.writer : TEAM.solo;
  const stages: Stage[] = [];
  if (team.rita) stages.push({ who: TEAM.researcher, label: 'finds facts', text: job.out.rita });
  stages.push({ who: writer, label: team.wally ? 'writes' : 'does the rest', text: team.wally ? job.out.wally : job.out.writerSolo });
  if (team.cora) {
    stages.push({ who: TEAM.critic, label: 'checks', text: job.out.cora });
    if (job.coraFinds && job.out.fix) stages.push({ who: writer, label: 'fixes', text: job.out.fix });
  }
  return stages;
}

function score(job: Job, team: Record<Helper, boolean>) {
  const stages = buildStages(job, team);
  const calls = stages.length;
  let q = job.soloQuality;
  (Object.keys(team) as Helper[]).forEach((h) => {
    if (team[h]) q += job.bonus[h];
  });
  const quality = Math.max(1, Math.min(5, q));
  const problems: string[] = [];
  const waste: string[] = [];
  (Object.keys(team) as Helper[]).forEach((h) => {
    if (!team[h] && job.bonus[h] > 0 && job.missing[h]) problems.push(job.missing[h] as string);
    if (team[h] && job.bonus[h] <= 0 && job.wasted[h]) waste.push(job.wasted[h] as string);
  });
  let verdict: { text: string; color: string };
  if (calls === 1 && quality < job.soloQuality) {
    verdict = { text: '🤔 One agent is enough here, but this one is the wrong fit. Try Solo Bot (turn Wally off).', color: '#fbbf24' };
  } else if (calls === 1) {
    verdict =
      quality >= 5
        ? { text: '✅ One agent is perfect for this job. Quick and cheap!', color: '#4ade80' }
        : { text: '🤔 One agent is quick, but parts of the job suffer. Try adding helpers.', color: '#fbbf24' };
  } else if (quality > job.soloQuality) {
    verdict = {
      text: `🙌 Team helps! +${quality - job.soloQuality} ⭐ for ${calls - 1} extra call${calls - 1 > 1 ? 's' : ''}.${waste.length ? ' (Someone on the team was not needed, though.)' : ''}`,
      color: '#4ade80',
    };
  } else {
    verdict = { text: `🙅 Overkill: one agent is enough. ${calls - 1} extra call${calls - 1 > 1 ? 's' : ''} for no better result.`, color: '#f87171' };
  }
  return { stages, calls, quality, problems, waste, verdict };
}

export default function WhyTeamsPlayground() {
  const [jobIdx, setJobIdx] = useState(0);
  const [team, setTeam] = useState<Record<Helper, boolean>>({ rita: false, wally: true, cora: false });
  const [shown, setShown] = useState(-1); // how many stages have run; -1 = not started
  const job = JOBS[jobIdx];
  const result = score(job, team);
  const { stages } = result;
  const running = shown >= 0 && shown < stages.length;
  const done = shown >= stages.length;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setShown((n) => n + 1), 1100);
    return () => clearTimeout(t);
  }, [running, shown]);

  const reset = () => setShown(-1);
  const toggle = (h: Helper) => {
    setTeam((t) => ({ ...t, [h]: !t[h] }));
    reset();
  };

  return (
    <div className="w-full h-full flex gap-4 p-4 text-white">
      {/* ---------- controls ---------- */}
      <div className="w-[300px] shrink-0 flex flex-col gap-3">
        <div className="text-[13px] font-bold uppercase tracking-wide" style={{ color: CYAN }}>🧪 Try it yourself</div>
        <div>
          <div className="text-[13px] text-white/60 mb-1.5">1. Pick a job</div>
          <div className="flex flex-wrap gap-1.5">
            {JOBS.map((j, i) => (
              <button
                key={j.id}
                onClick={() => {
                  setJobIdx(i);
                  reset();
                }}
                className="px-2.5 py-1 rounded-full border text-[13px] transition-colors"
                style={{
                  borderColor: i === jobIdx ? `${CYAN}b0` : 'rgba(255,255,255,0.15)',
                  backgroundColor: i === jobIdx ? `${CYAN}25` : 'rgba(255,255,255,0.04)',
                  color: i === jobIdx ? '#e0fbff' : 'rgba(255,255,255,0.7)',
                }}
              >
                {j.chip}
              </button>
            ))}
          </div>
          <div className="mt-2 text-[13px] text-white/80 rounded-lg bg-white/[0.05] border border-white/10 px-2.5 py-1.5">📝 &quot;{job.task}&quot;</div>
        </div>
        <div>
          <div className="text-[13px] text-white/60 mb-1.5">2. Switch helpers on or off</div>
          <div className="flex gap-2">
            {HELPERS.map(({ id, bot }) => (
              <button
                key={id}
                onClick={() => toggle(id)}
                aria-pressed={team[id]}
                className="flex-1 rounded-xl border-2 py-1.5 flex flex-col items-center transition-colors"
                style={{ borderColor: team[id] ? bot.color : 'rgba(255,255,255,0.1)', backgroundColor: team[id] ? `${bot.color}18` : 'transparent' }}
              >
                <AgentBot color={bot.color} badge={bot.badge} name={bot.name} size={48} mood={team[id] ? 'happy' : 'sleeping'} dimmed={!team[id]} />
                <span className="text-[12px] mt-0.5" style={{ color: team[id] ? bot.color : 'rgba(255,255,255,0.4)' }}>{team[id] ? 'ON' : 'off'}</span>
              </button>
            ))}
          </div>
          <div className="text-[12px] text-white/50 mt-1.5">No Wally? Solo Bot does the writing (and everything else nobody is on).</div>
        </div>
        <button
          onClick={() => setShown(0)}
          disabled={running}
          className="mt-1 py-2 rounded-lg font-semibold text-[15px] text-navy-900 disabled:opacity-50"
          style={{ backgroundColor: CYAN }}
        >
          {running ? 'Running…' : done ? '↻ Run again' : '▶ Run the team'}
        </button>
      </div>

      {/* ---------- relay + scorecard ---------- */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex-1 min-h-0 flex flex-col">
          <div className="text-[13px] text-white/60 mb-2">The relay: our code passes each answer (a note of text) to the next agent</div>
          <div className="flex items-start gap-1 flex-1 min-h-0">
            {stages.map((st, i) => {
              const isActive = shown === i;
              const isDone = shown > i;
              return (
                <div key={`${job.id}-${i}-${st.who.name}`} className="flex items-start gap-1 flex-1 min-w-0">
                  {i > 0 && (
                    <div className="pt-6 text-xl shrink-0" style={{ color: isDone || isActive ? CYAN : 'rgba(255,255,255,0.2)' }}>
                      →
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col items-center gap-1.5">
                    <AgentBot color={st.who.color} badge={st.who.badge} name={st.who.name} role={st.label} size={58} mood={isActive ? 'working' : isDone ? 'happy' : 'sleeping'} active={isActive} dimmed={!isActive && !isDone} />
                    {isDone && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, rotate: -2 }}
                        animate={{ opacity: 1, y: 0, rotate: -1 }}
                        transition={spring}
                        className="w-full rounded-md px-2 py-1.5 text-[12px] leading-snug shadow"
                        style={{ backgroundColor: st.who.name === 'Cora' ? '#fbcfe8' : '#fde68a', color: '#1f2937' }}
                      >
                        {st.text}
                      </motion.div>
                    )}
                    {isActive && <div className="text-[12px] text-white/60">thinking…</div>}
                  </div>
                </div>
              );
            })}
          </div>
          {shown < 0 && <div className="text-center text-[13px] text-white/50">Press ▶ Run to start the relay.</div>}
        </div>

        {/* scorecard */}
        <motion.div
          animate={{ opacity: done ? 1 : 0.35 }}
          className="rounded-xl border p-3"
          style={{ borderColor: done ? `${result.verdict.color}60` : 'rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-6 mb-2">
            <div className="text-[13px] font-bold uppercase tracking-wide text-white/60">Scorecard</div>
            <div className="text-[14px]">Quality: <span className="text-amber-300">{done ? '★'.repeat(result.quality) + '☆'.repeat(5 - result.quality) : '?'}</span></div>
            <div className="text-[14px]">API calls: <span className="font-bold">{done ? result.calls : '?'}</span></div>
            <div className="text-[14px]">Time: <span className="font-bold">{done ? `about ${result.calls * SECONDS_PER_CALL} s` : '?'}</span></div>
          </div>
          {done ? (
            <>
              <div className="text-[15px] font-semibold" style={{ color: result.verdict.color }}>{result.verdict.text}</div>
              <div className="mt-1 space-y-0.5 text-[13px] text-white/70">
                {result.problems.map((p) => (
                  <div key={p}>⚠️ {p}</div>
                ))}
                {result.waste.map((w) => (
                  <div key={w}>💸 {w}</div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-[13px] text-white/50">Run the team to see the score. Solo Bot alone would score {'★'.repeat(job.soloQuality)} with 1 call.</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
