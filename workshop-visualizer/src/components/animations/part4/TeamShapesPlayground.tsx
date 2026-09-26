'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ACCENT, CallCounter, Stage, StageArrow, StageBot, StageNote, Who, whoBadge, whoColor, whoName } from './TeamShapesStage';

// "Try it yourself": pick a request and a team shape, watch the run.
// Everything is pre-written example data: deterministic, no network.

type ShapeId = 'line' | 'boss' | 'router' | 'loop';
type Tone = 'red' | 'green' | 'final';

interface Ev {
  who: Who;
  to: Who;
  text: string;
  call: boolean; // did this step cost an LLM call?
  tone?: Tone;
  round?: number;
  also?: { to: Who; text: string }[]; // extra notes sent at the same moment (same call)
}
type VerdictKind = 'perfect' | 'works' | 'overkill' | 'poor';
interface Combo {
  events: Ev[];
  verdict: { kind: VerdictKind; text: string };
}

const SHAPES: { id: ShapeId; icon: string; name: string }[] = [
  { id: 'line', icon: '🏭', name: 'Assembly line' },
  { id: 'boss', icon: '👑', name: 'Boss & helpers' },
  { id: 'router', icon: '🛎️', name: 'Receptionist' },
  { id: 'loop', icon: '📝', name: 'Writer & critic' },
];

const POS: Record<ShapeId, Partial<Record<Who, { x: number; y: number }>>> = {
  line: { you: { x: 9, y: 170 }, researcher: { x: 33, y: 170 }, writer: { x: 57, y: 170 }, critic: { x: 81, y: 170 } },
  boss: {
    you: { x: 10, y: 20 },
    boss: { x: 50, y: 10 },
    researcher: { x: 15, y: 210 },
    math: { x: 38, y: 210 },
    writer: { x: 61, y: 210 },
    critic: { x: 84, y: 210 },
  },
  router: {
    you: { x: 10, y: 20 },
    receptionist: { x: 48, y: 20 },
    math: { x: 22, y: 210 },
    researcher: { x: 50, y: 210 },
    writer: { x: 78, y: 210 },
  },
  loop: { you: { x: 10, y: 170 }, writer: { x: 42, y: 170 }, critic: { x: 80, y: 170 } },
};

const ARROWS: Record<ShapeId, [Who, Who][]> = {
  line: [['you', 'researcher'], ['researcher', 'writer'], ['writer', 'critic']],
  boss: [['boss', 'researcher'], ['boss', 'math'], ['boss', 'writer'], ['boss', 'critic']],
  router: [['receptionist', 'math'], ['receptionist', 'researcher'], ['receptionist', 'writer']],
  loop: [['writer', 'critic']],
};

const q = (text: string, first: Who): Ev => ({ who: 'you', to: first, text, call: false });

const REQUESTS: { chip: string; combos: Record<ShapeId, Combo> }[] = [
  {
    chip: 'What is 15 × 12?',
    combos: {
      line: {
        events: [
          q('What is 15 × 12?', 'researcher'),
          { who: 'researcher', to: 'writer', text: '15 × 12 is a multiplication: 15, twelve times.', call: true },
          { who: 'writer', to: 'critic', text: '15 × 12 = 180', call: true },
          { who: 'critic', to: 'you', text: '15 × 12 = 180 ✔️', call: true, tone: 'final' },
        ],
        verdict: { kind: 'overkill', text: '3 robots and 3 calls for one sum! Rita and Cora added nothing. A receptionist + Milo does it in 2.' },
      },
      boss: {
        events: [
          q('What is 15 × 12?', 'boss'),
          { who: 'boss', to: 'math', text: 'ask_math_whiz(“15 × 12”)', call: true },
          { who: 'math', to: 'boss', text: '180', call: true },
          { who: 'boss', to: 'you', text: '15 × 12 = 180', call: true, tone: 'final' },
        ],
        verdict: { kind: 'works', text: 'Right answer, but Max’s planning and final reply are 2 extra calls for a one-step question.' },
      },
      router: {
        events: [
          q('What is 15 × 12?', 'receptionist'),
          { who: 'receptionist', to: 'math', text: 'math', call: true },
          { who: 'math', to: 'you', text: '15 × 12 = 180', call: true, tone: 'final' },
        ],
        verdict: { kind: 'perfect', text: 'One question, one expert, 2 calls. Rosa sends it straight to Milo. Cheap and fast!' },
      },
      loop: {
        events: [
          q('What is 15 × 12?', 'writer'),
          { who: 'writer', to: 'critic', text: 'Draft 1: 15 × 12 = 170', call: true, round: 1 },
          { who: 'critic', to: 'writer', text: '❌ Check again: 15 × 10 = 150, plus 15 × 2 = 30.', call: true, tone: 'red', round: 1 },
          { who: 'writer', to: 'critic', text: 'Draft 2: 15 × 12 = 180', call: true, round: 2 },
          { who: 'critic', to: 'writer', text: 'APPROVED ✅', call: true, tone: 'green', round: 2 },
          { who: 'writer', to: 'you', text: '15 × 12 = 180', call: false, tone: 'final', round: 2 },
        ],
        verdict: { kind: 'overkill', text: 'Cora caught Wally’s slip, but that took 4 calls. Milo the math whiz gets it right in 1.' },
      },
    },
  },
  {
    chip: 'Write a story about a dragon and check it',
    combos: {
      line: {
        events: [
          q('Write a story about a dragon and check it', 'researcher'),
          { who: 'researcher', to: 'writer', text: 'Dragon facts: breathe fire, hoard gold, live in caves.', call: true },
          { who: 'writer', to: 'critic', text: 'Ember the dragon guarded her gold in a dark, dark cave…', call: true },
          { who: 'critic', to: 'you', text: 'Fixed 2 typos. Here’s the story: Ember the dragon guarded her gold…', call: true, tone: 'final' },
        ],
        verdict: { kind: 'works', text: 'Checked once, but Cora can’t send it back for a rewrite. And Rita’s facts weren’t really needed.' },
      },
      boss: {
        events: [
          q('Write a story about a dragon and check it', 'boss'),
          { who: 'boss', to: 'writer', text: 'ask_writer(“a dragon story”)', call: true },
          { who: 'writer', to: 'boss', text: 'Ember the dragon guarded her gold in a dark cave…', call: true },
          { who: 'boss', to: 'critic', text: 'ask_critic(“review this story: …”)', call: true },
          { who: 'critic', to: 'boss', text: 'Nice, but the ending is weak.', call: true, tone: 'red' },
          { who: 'boss', to: 'you', text: 'Here’s your story! (The critic says the ending is a bit weak.)', call: true, tone: 'final' },
        ],
        verdict: { kind: 'works', text: 'Works, but 5 calls, and nobody fixed the weak ending. A writer & critic loop does this job better.' },
      },
      router: {
        events: [
          q('Write a story about a dragon and check it', 'receptionist'),
          { who: 'receptionist', to: 'writer', text: 'story', call: true },
          { who: 'writer', to: 'you', text: 'Ember the dragon guarded her gold in a dark cave…', call: true, tone: 'final' },
        ],
        verdict: { kind: 'poor', text: 'Nobody checked it! You asked for a check, but a router only ever picks ONE agent.' },
      },
      loop: {
        events: [
          q('Write a story about a dragon and check it', 'writer'),
          { who: 'writer', to: 'critic', text: 'Draft 1: A dragon lived in a cave. The end.', call: true, round: 1 },
          { who: 'critic', to: 'writer', text: '❌ Too short. Give her a name and a problem.', call: true, tone: 'red', round: 1 },
          { who: 'writer', to: 'critic', text: 'Draft 2: Ember was scared of the dark, so she sneezed sparks to light her cave.', call: true, round: 2 },
          { who: 'critic', to: 'writer', text: 'APPROVED ✅', call: true, tone: 'green', round: 2 },
          { who: 'writer', to: 'you', text: 'Ember was scared of the dark, so she sneezed sparks to light her cave.', call: false, tone: 'final', round: 2 },
        ],
        verdict: { kind: 'perfect', text: 'Write, check, fix, approved: exactly what the request asked for, in 4 calls.' },
      },
    },
  },
  {
    chip: 'Plan a picnic: weather, food, games',
    combos: {
      line: {
        events: [
          q('Plan a picnic: weather, food, games', 'researcher'),
          { who: 'researcher', to: 'writer', text: 'Saturday: sunny, 24°C. The park has a big field.', call: true },
          { who: 'writer', to: 'critic', text: 'Picnic plan: Saturday at the park. Games: frisbee and tag.', call: true },
          { who: 'critic', to: 'you', text: 'Picnic on Saturday at the park, frisbee and tag! (Food? Nobody planned it.)', call: true, tone: 'final' },
        ],
        verdict: { kind: 'works', text: 'OK, but the line is fixed: there’s no station for food costs, and it can’t add one just for this request.' },
      },
      boss: {
        events: [
          q('Plan a picnic: weather, food, games', 'boss'),
          {
            who: 'boss',
            to: 'researcher',
            text: 'ask_researcher(“weather Saturday?”)',
            call: true,
            also: [
              { to: 'math', text: 'ask_math_whiz(“food for 6 at $5”)' },
              { to: 'writer', text: 'ask_writer(“3 picnic games”)' },
            ],
          },
          { who: 'researcher', to: 'boss', text: 'Sunny, 24°C ☀️', call: true },
          { who: 'math', to: 'boss', text: '6 × $5 = $30', call: true },
          { who: 'writer', to: 'boss', text: 'Frisbee, tag, treasure hunt', call: true },
          { who: 'boss', to: 'you', text: 'Saturday is sunny! Food costs $30. Games: frisbee, tag, treasure hunt.', call: true, tone: 'final' },
        ],
        verdict: { kind: 'perfect', text: 'Three different jobs, and Max picked the right helper for each one. Worth the 5 calls.' },
      },
      router: {
        events: [
          q('Plan a picnic: weather, food, games', 'receptionist'),
          { who: 'receptionist', to: 'researcher', text: 'facts', call: true },
          { who: 'researcher', to: 'you', text: 'Saturday will be sunny, 24°C.', call: true, tone: 'final' },
        ],
        verdict: { kind: 'poor', text: 'Only one expert answers, so food and games are missing. This request needs a team, not one expert.' },
      },
      loop: {
        events: [
          q('Plan a picnic: weather, food, games', 'writer'),
          { who: 'writer', to: 'critic', text: 'Draft 1: Picnic on Saturday! Bring food, play games.', call: true, round: 1 },
          { who: 'critic', to: 'writer', text: '❌ What’s the weather? How much food?', call: true, tone: 'red', round: 1 },
          { who: 'writer', to: 'critic', text: 'Draft 2: Picnic on Saturday (probably sunny?)…', call: true, round: 2 },
          { who: 'critic', to: 'writer', text: '❌ You guessed the weather. Check it!', call: true, tone: 'red', round: 2 },
          { who: 'writer', to: 'critic', text: 'Draft 3: Sorry, I can’t look up the weather…', call: true, round: 3 },
          { who: 'critic', to: 'writer', text: '❌ Still no real weather.', call: true, tone: 'red', round: 3 },
          { who: 'writer', to: 'you', text: 'Draft 3 (NOT approved: round limit reached)', call: false, tone: 'final', round: 3 },
        ],
        verdict: { kind: 'poor', text: 'Wally can’t check the weather, so Cora keeps saying no. The 3-round limit stops it after 6 calls.' },
      },
    },
  },
  {
    chip: 'Explain photosynthesis simply',
    combos: {
      line: {
        events: [
          q('Explain photosynthesis simply', 'researcher'),
          { who: 'researcher', to: 'writer', text: 'Plants use sunlight, water and CO₂ to make sugar and oxygen.', call: true },
          { who: 'writer', to: 'critic', text: 'Plants are little chefs: they cook sunlight, water and air into food!', call: true },
          { who: 'critic', to: 'you', text: 'Plants are little chefs: they cook sunlight, water and air into food, and breathe out oxygen for us!', call: true, tone: 'final' },
        ],
        verdict: { kind: 'perfect', text: 'Find facts → explain → polish: the same fixed steps every explainer needs. 3 calls, well spent.' },
      },
      boss: {
        events: [
          q('Explain photosynthesis simply', 'boss'),
          { who: 'boss', to: 'researcher', text: 'ask_researcher(“photosynthesis facts”)', call: true },
          { who: 'researcher', to: 'boss', text: 'Sunlight + water + CO₂ → sugar + oxygen', call: true },
          { who: 'boss', to: 'writer', text: 'ask_writer(“explain this simply: …”)', call: true },
          { who: 'writer', to: 'boss', text: 'Plants are little chefs: they cook sunlight into food!', call: true },
          { who: 'boss', to: 'you', text: 'Plants are little chefs: they cook sunlight, water and air into food!', call: true, tone: 'final' },
        ],
        verdict: { kind: 'works', text: 'Good answer, but explainers always need the same steps, so Max’s planning costs extra calls. An assembly line is simpler.' },
      },
      router: {
        events: [
          q('Explain photosynthesis simply', 'receptionist'),
          { who: 'receptionist', to: 'researcher', text: 'facts', call: true },
          { who: 'researcher', to: 'you', text: '6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂', call: true, tone: 'final' },
        ],
        verdict: { kind: 'works', text: 'Cheap (2 calls), but Rita answers with a formula, not a simple explanation. Nobody made it kid-friendly.' },
      },
      loop: {
        events: [
          q('Explain photosynthesis simply', 'writer'),
          { who: 'writer', to: 'critic', text: 'Draft 1: Photosynthesis converts light energy into chemical energy via chlorophyll.', call: true, round: 1 },
          { who: 'critic', to: 'writer', text: '❌ Too many big words for a kid.', call: true, tone: 'red', round: 1 },
          { who: 'writer', to: 'critic', text: 'Draft 2: Plants are little chefs: they cook sunlight, water and air into food!', call: true, round: 2 },
          { who: 'critic', to: 'writer', text: 'APPROVED ✅', call: true, tone: 'green', round: 2 },
          { who: 'writer', to: 'you', text: 'Plants are little chefs: they cook sunlight, water and air into food!', call: false, tone: 'final', round: 2 },
        ],
        verdict: { kind: 'works', text: 'Nice and simple after one fix (4 calls). But nobody researched the facts first.' },
      },
    },
  },
];

const VERDICT: Record<VerdictKind, { label: string; color: string }> = {
  perfect: { label: '✅ Perfect fit', color: '#4ade80' },
  works: { label: '👍 Works, but…', color: '#fbbf24' },
  overkill: { label: '💸 Overkill', color: '#fb923c' },
  poor: { label: '❌ Poor fit', color: '#f87171' },
};

const STEP_MS = 1700;

function restSpot(p: { x: number; y: number }) {
  return {
    x: Math.min(84, Math.max(16, p.x)),
    y: p.y >= 150 ? p.y - 64 : p.y + 108,
  };
}

export default function TeamShapesPlayground() {
  const [reqIdx, setReqIdx] = useState(0);
  const [shape, setShape] = useState<ShapeId>('router');
  const [runId, setRunId] = useState(0);
  const [idx, setIdx] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  const combo = REQUESTS[reqIdx].combos[shape];
  const events = combo.events;
  const done = idx >= events.length - 1;

  useEffect(() => {
    setIdx(0);
    const t = setInterval(() => {
      setIdx((i) => {
        if (i >= events.length - 1) {
          clearInterval(t);
          return i;
        }
        return i + 1;
      });
    }, STEP_MS);
    return () => clearInterval(t);
  }, [reqIdx, shape, runId, events.length]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [idx, reqIdx, shape, runId]);

  const cur = events[Math.min(idx, events.length - 1)];
  const calls = events.slice(0, idx + 1).filter((e) => e.call).length;
  const round = cur.round ?? 0;
  const pos = POS[shape];

  // Everyone who appears in this shape; the current speaker is active, the receiver is awake.
  const castInShape = Object.keys(pos) as Who[];
  const usedSoFar = new Set<Who>(events.slice(0, idx + 1).flatMap((e) => [e.who, e.to, ...(e.also ?? []).map((a) => a.to)]));
  const bots: StageBot[] = castInShape.map((w) => ({
    who: w,
    x: pos[w]!.x,
    y: pos[w]!.y,
    active: !done && w === cur.who && cur.call,
    dimmed: !usedSoFar.has(w),
    mood: done && w === cur.who ? 'proud' : !usedSoFar.has(w) && done ? 'sleeping' : w === cur.to ? 'thinking' : undefined,
  }));

  const arrows: StageArrow[] = ARROWS[shape].map(([a, b]) => {
    const pa = pos[a]!;
    const pb = pos[b]!;
    const lit = (cur.who === a && cur.to === b) || (cur.who === b && cur.to === a) || (cur.also ?? []).some((x) => cur.who === a && x.to === b);
    const vertical = Math.abs(pa.y - pb.y) > 60;
    return {
      from: vertical ? { x: pa.x, y: pa.y + 105 } : { x: pa.x + 6, y: pa.y + 40 },
      to: vertical ? { x: pb.x, y: pb.y - 4 } : { x: pb.x - 6, y: pb.y + 40 },
      color: lit ? ACCENT : '#94a3b8',
      dashed: !lit,
      dim: !lit,
    };
  });

  const mkNote = (from: Who, to: Who, text: string, id: string, tone?: Tone, delay = 0.1): StageNote => {
    const pf = pos[from]!;
    return {
      id,
      from: { x: pf.x, y: pf.y + 30 },
      to: restSpot(pos[to]!),
      title: `${whoName(from)} → ${whoName(to)}`,
      text,
      color: whoColor(from),
      tone: tone === 'final' ? 'final' : tone,
      width: 200,
      delay,
    };
  };
  const notes: StageNote[] = [
    mkNote(cur.who, cur.to, cur.text, `${runId}-${reqIdx}-${shape}-${idx}`, cur.tone),
    ...(cur.also ?? []).map((a, j) => mkNote(cur.who, a.to, a.text, `${runId}-${reqIdx}-${shape}-${idx}-${j}`, undefined, 0.3 + j * 0.2)),
  ];
  // Fanned-out notes from the boss would overlap: spread them sideways.
  if (notes.length > 1) notes.forEach((n) => (n.width = 130));

  const verdict = VERDICT[combo.verdict.kind];

  return (
    <div className="h-full w-full flex flex-col gap-2 px-4 py-3">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[12px] text-white/50 w-[88px]">1. Request:</span>
        {REQUESTS.map((r, i) => (
          <button
            key={r.chip}
            onClick={() => setReqIdx(i)}
            className="px-2.5 py-1 rounded-full border text-[13px] transition-colors"
            style={{
              borderColor: reqIdx === i ? `${ACCENT}bb` : 'rgba(255,255,255,0.15)',
              background: reqIdx === i ? `${ACCENT}22` : 'rgba(255,255,255,0.04)',
              color: reqIdx === i ? '#cffafe' : 'rgba(255,255,255,0.7)',
            }}
          >
            {r.chip}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[12px] text-white/50 w-[88px]">2. Team shape:</span>
        {SHAPES.map((s) => (
          <button
            key={s.id}
            onClick={() => setShape(s.id)}
            className="px-3 py-1 rounded-lg border text-[13px] font-semibold transition-colors"
            style={{
              borderColor: shape === s.id ? `${ACCENT}bb` : 'rgba(255,255,255,0.15)',
              background: shape === s.id ? `${ACCENT}22` : 'rgba(255,255,255,0.04)',
              color: shape === s.id ? '#cffafe' : 'rgba(255,255,255,0.7)',
            }}
          >
            {s.icon} {s.name}
          </button>
        ))}
        <button
          onClick={() => setRunId((r) => r + 1)}
          className="ml-auto px-3 py-1 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-[13px] text-white/80"
        >
          ▶ Run again
        </button>
      </div>

      {/* Stage + side panel */}
      <div className="flex-1 min-h-0 flex gap-3">
        <div className="flex-1 min-w-0 rounded-xl border border-white/10 bg-black/20 relative overflow-hidden">
          <div className="absolute inset-x-3 top-2">
            <Stage height={330} size={58} bots={bots} arrows={arrows} notes={notes} />
          </div>
        </div>

        <div className="w-[290px] shrink-0 flex flex-col gap-2 min-h-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CallCounter count={calls} />
            {shape === 'loop' && round > 0 && (
              <span className="text-[13px] px-2 py-0.5 rounded-full border" style={{ borderColor: '#f472b666', color: '#fbcfe8' }}>
                🔁 Round {round} / 3
              </span>
            )}
          </div>
          <div ref={logRef} className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-2 flex flex-col gap-1.5">
            <div className="text-[11px] uppercase tracking-wide text-white/40">Message log</div>
            {events.slice(0, idx + 1).map((e, i) => {
              const latest = i === idx;
              return (
                <motion.div
                  key={`${runId}-${reqIdx}-${shape}-${i}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: latest ? 1 : 0.6, x: 0 }}
                  className="text-[12px] leading-snug"
                >
                  <span className="font-semibold" style={{ color: whoColor(e.who) }}>
                    {whoBadge(e.who)} {whoName(e.who)}
                  </span>
                  <span className="text-white/40"> → {whoName(e.to)}</span>
                  {e.call && <span className="text-white/40"> · 📞</span>}
                  <div className={`${latest ? '' : 'truncate'} ${e.tone === 'red' ? 'text-rose-300' : e.tone === 'green' ? 'text-green-300' : 'text-white/85'}`}>
                    {e.text}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div
            className="rounded-lg border px-3 py-2 min-h-[92px]"
            style={{ borderColor: done ? `${verdict.color}77` : 'rgba(255,255,255,0.1)', background: done ? `${verdict.color}14` : 'transparent' }}
          >
            {done ? (
              <motion.div key={`${runId}-${reqIdx}-${shape}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-[14px] font-bold" style={{ color: verdict.color }}>
                  {verdict.label}
                </div>
                <div className="text-[13px] text-white/85 leading-snug mt-0.5">{combo.verdict.text}</div>
              </motion.div>
            ) : (
              <div className="text-[13px] text-white/40">Running… the verdict appears when the answer reaches you.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
