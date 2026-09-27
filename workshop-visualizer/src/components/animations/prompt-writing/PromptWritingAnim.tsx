'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useConceptStore } from '@/stores/conceptStore';
import AgentBot, { TEAM, type BotMood } from '@/components/animations/characters/AgentBot';
import PromptFixerPlayground from './PromptFixerPlayground';
import { ING, IngId, RECIPE, ClarityMeter, Rich, Seg, IngTag, Mia, Scene, Bubble, spring } from './shared';

const SOLO = TEAM.solo;
const BLUE = '#4a9eff';

// ---------- small props ----------

function Paper({ title, children, width, border = 'rgba(0,0,0,0.08)', dim = false, icon = '🤖' }: { title: string; children: ReactNode; width: number; border?: string; dim?: boolean; icon?: string }) {
  return (
    <motion.div animate={{ opacity: dim ? 0.55 : 1 }} className="rounded-xl bg-white text-[#1f2937] shadow-lg border-2" style={{ width, borderColor: border }}>
      <div className="px-3 pt-1.5 pb-1 border-b border-black/10 text-[13px] font-bold uppercase tracking-wide text-black/45">
        {icon} {title}
      </div>
      <div className="px-3 py-2 space-y-1.5 text-[14.5px] leading-snug">{children}</div>
    </motion.div>
  );
}

function PromptPaper({ title, children, width, border = '#f9a8d4', dim = false }: { title: string; children: ReactNode; width: number; border?: string; dim?: boolean }) {
  return (
    <motion.div animate={{ opacity: dim ? 0.55 : 1 }} className="rounded-xl bg-[#fffdf7] text-[#1f2937] shadow-lg border-2" style={{ width, borderColor: border }}>
      <div className="px-3 pt-1.5 pb-1 border-b border-black/10 text-[13px] font-bold uppercase tracking-wide text-black/45">📝 {title}</div>
      <div className="px-3 py-2 space-y-1.5 text-[15px] leading-snug">{children}</div>
    </motion.div>
  );
}

function Verdict({ ok, children, delay = 0.6 }: { ok: boolean; children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
      className={`px-3 py-1 rounded-full text-[13px] font-semibold w-fit ${ok ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/40' : 'bg-red-400/15 text-red-300 border border-red-400/40'}`}
    >
      {children}
    </motion.div>
  );
}

// ---------- step 0: intro ----------

function IntroScene() {
  const learn = ['Why vague prompts get vague answers', 'The six ingredients of a clear prompt', 'Fences, step by step, and fixing drafts'];
  return (
    <Scene id="intro">
      <div className="text-[13px] font-semibold tracking-widest uppercase mb-1" style={{ color: BLUE }}>
        Part 0 · Foundations
      </div>
      <h2 className="text-3xl font-bold text-white mb-6">Writing Good Prompts</h2>
      <div className="flex gap-10 items-center">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 w-[400px]">
          <div className="text-[13px] font-bold uppercase tracking-wide text-white/50 mb-2">What you&apos;ll learn</div>
          {learn.map((t, i) => (
            <motion.div key={t} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.2 + i * 0.15 }} className="flex gap-3 items-start py-1.5">
              <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold" style={{ color: BLUE, backgroundColor: `${BLUE}20`, border: `1px solid ${BLUE}50` }}>
                {i + 1}
              </span>
              <span className="text-[15px] text-white/80">{t}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-4">
          <AgentBot color={SOLO.color} badge={SOLO.badge} name={SOLO.name} role="the AI" size={96} mood="happy" />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="font-mono text-[13px] rounded-lg bg-black/40 border border-white/10 px-3 py-2 leading-relaxed">
            <div className="text-white/40">messages = [</div>
            <div className="pl-4 text-white/40">
              {'{"role": "system", …}'} <span className="font-sans text-[13px] text-accent-purple">✓ last lesson</span>
            </div>
            <div className="pl-4 text-white">
              {'{"role": "user", …}'} <span className="font-sans text-[13px] font-semibold" style={{ color: BLUE }}>← today</span>
            </div>
            <div className="text-white/40">]</div>
          </motion.div>
        </div>
      </div>
    </Scene>
  );
}

// ---------- steps 1-2: vague vs clear ----------

const DOG_GENERIC = 'Dogs are loyal animals that have lived with people for thousands of years. There are hundreds of breeds, and every dog needs food, walks and love.';

function VagueScene() {
  const guesses = [
    { t: '🎂 A birthday poem?', x: -150, y: 0 },
    { t: '📚 A school report?', x: 0, y: -40 },
    { t: '🦮 Training tips?', x: 150, y: 0 },
  ];
  return (
    <Scene id="vague">
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="text-[13px] text-white/50">You type:</div>
          <motion.div {...{ initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } }} transition={spring} className="rounded-2xl rounded-br-sm bg-accent-blue px-5 py-3 text-[22px] font-semibold text-white shadow-lg">
            Write about dogs
          </motion.div>
        </div>
        <div className="relative w-[420px] h-[280px] flex flex-col items-center justify-end">
          {guesses.map((g, i) => (
            <motion.div
              key={g.t}
              initial={{ opacity: 0, scale: 0.5, x: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%' }}
              transition={{ ...spring, delay: 0.4 + i * 0.25 }}
              className="absolute rounded-2xl bg-white/10 border border-white/20 px-3 py-1.5 text-[15px] text-white whitespace-nowrap"
              style={{ left: `calc(50% + ${g.x}px)`, top: 50 + g.y }}
            >
              {g.t}
            </motion.div>
          ))}
          <AgentBot color={SOLO.color} badge={SOLO.badge} name={SOLO.name} size={116} mood="confused" active />
        </div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 1.4 }} className="flex flex-col gap-2">
          <Paper title="Solo Bot's answer" width={300}>
            <div className="text-black/70">{DOG_GENERIC}</div>
          </Paper>
          <Verdict ok={false} delay={1.8}>😐 Safe, average, not useful</Verdict>
        </motion.div>
      </div>
    </Scene>
  );
}

function ClearScene() {
  return (
    <Scene id="clear">
      <div className="flex gap-8 items-start">
        {/* before */}
        <div className="flex flex-col gap-3 w-[380px]">
          <div className="text-[14px] font-bold uppercase tracking-wide text-red-300/80">Before</div>
          <PromptPaper title="Prompt" width={380} border="rgba(0,0,0,0.1)" dim>
            <div className="text-[18px]">Write about dogs</div>
          </PromptPaper>
          <Paper title="Answer" width={380} dim>
            <div className="text-black/70">{DOG_GENERIC}</div>
          </Paper>
        </div>
        {/* after */}
        <div className="flex flex-col gap-3 w-[520px]">
          <div className="text-[14px] font-bold uppercase tracking-wide text-emerald-300">After</div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.2 }}>
            <PromptPaper title="Prompt" width={520} border={BLUE}>
              <div className="text-[17px] leading-relaxed">
                <Rich text="{{task|Write 3 fun dog facts}} {{context|for my cousin's 8th birthday card}}. {{format|One short sentence each, with an emoji.}}" />
              </div>
              <div className="flex gap-2 pt-1">
                <IngTag id="task" small />
                <IngTag id="context" small />
                <IngTag id="format" small />
              </div>
            </PromptPaper>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex items-end gap-3">
            <Paper title="Answer" width={430} border="#4ade80">
              {['🐾 Every dog’s nose print is unique, like a fingerprint!', '👃 Dogs can smell thousands of times better than we can!', '🐶 Puppies are born with their eyes closed!'].map((t, i) => (
                <motion.div key={t} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 + i * 0.25 }} className="text-[15px]">
                  {t}
                </motion.div>
              ))}
            </Paper>
            <AgentBot color={SOLO.color} badge={SOLO.badge} size={72} mood="proud" />
          </motion.div>
        </div>
      </div>
    </Scene>
  );
}

// ---------- step 3: the recipe card ----------

const RECIPE_EXAMPLES: Record<string, string> = {
  task: 'Write… · Explain… · List…',
  role: '“You are a friendly science teacher.”',
  context: '“It’s for my class of 12-year-olds.”',
  format: '“3 bullet points, under 50 words.”',
  example: '“A title like: Do Worms Like the Dark?”',
  limits: '“Include one fun fact. Skip dates.”',
};

function RecipeScene() {
  return (
    <Scene id="recipe">
      <div className="flex items-center gap-8">
        <motion.div {...{ initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 } }} transition={spring} className="rounded-2xl bg-[#fffdf7] text-[#1f2937] shadow-xl border-2 border-[#f9a8d4]/70 w-[760px]">
          <div className="px-5 py-2.5 border-b-2 border-dashed border-black/10 flex items-baseline gap-3">
            <span className="text-[20px] font-bold">📝 Recipe for a clear prompt</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {RECIPE.map((id, i) => {
              const ing = ING[id];
              return (
                <motion.div key={id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.25 + i * 0.18 }} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: `${ing.color}22`, borderLeft: `5px solid ${ing.color}` }}>
                  <span className="w-[140px] shrink-0 text-[17px] font-bold">
                    {ing.icon} {ing.label}
                  </span>
                  <span className="w-[230px] shrink-0 text-[15px] font-medium">{ing.question}</span>
                  <span className="text-[13.5px] text-black/60">{RECIPE_EXAMPLES[id]}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 1.5 }}>
          <AgentBot color={SOLO.color} badge={SOLO.badge} name={SOLO.name} size={90} mood="happy" />
        </motion.div>
      </div>
    </Scene>
  );
}

// ---------- steps 4-10: Mia's poster prompt, one ingredient at a time ----------

const POSTER_SEGS: Record<string, string> = {
  role: 'You are a friendly science teacher.',
  task: 'Write the text for my science-fair poster about why plants bend toward light.',
  context: "I'm 12. For 2 weeks I grew 6 bean plants next to a window. Parents and teachers will read it as they walk past.",
  format: 'Give me a title and 3 boxes: My question, What I did, What I found. Max 2 sentences per box.',
  example: 'Make the title catchy, like: "Do Worms Like the Dark? 🪱"',
  limits: 'No hard science words. End with one fun fact.',
};
// The order the parts appear in the prompt text (the role goes on top).
const PROMPT_ORDER: IngId[] = ['role', 'task', 'context', 'format', 'example', 'limits'];

type PLine = { id: string; text: string; kind?: 'title' | 'box' | 'muted' | 'fun'; label?: string; hl?: boolean };

const Q_BOX: PLine = { id: 'q', kind: 'box', label: '❓ My question', text: 'Do plants really grow toward light? I tested it with beans.' };
const D_BOX: PLine = { id: 'd', kind: 'box', label: '🧪 What I did', text: 'I grew 6 bean plants next to a window for 2 weeks and checked them every day.' };
const F_BOX = (text: string, hl = false): PLine => ({ id: 'f', kind: 'box', label: '🔎 What I found', text, hl });
const F_AUXIN = 'All 6 stems bent toward the window. A plant chemical called auxin made the shady side grow faster.';
const F_SIMPLE = 'All 6 stems bent toward the window. The shady side of each stem grew faster, so it leaned toward the light.';
const TITLE_1 = 'How My Beans Chased the Light 🌱';
const TITLE_2 = 'Do Beans Chase the Sun? ☀️🌱';
const FUN: PLine = { id: 'fun', kind: 'fun', text: '⭐ Fun fact: young sunflowers turn to follow the sun across the sky!' };

// Prepared answers (made up for the lesson, like what a model might write).
const POSTER_ANSWERS: PLine[][] = [
  [
    { id: 'a', text: "Sure, I'd love to help! 😊 What is your poster about? Is it for school, a shop or a party?" },
    { id: 'b', text: 'Good posters have a big title, a picture and not too much text.' },
  ],
  [
    { id: 't', kind: 'title', text: 'Phototropism in Plants', hl: true },
    { id: 'p', text: 'Phototropism is the growth of a plant in response to a light stimulus. It is controlled by auxin, a plant hormone that builds up on the shaded side of the stem and makes those cells elongate, so the stem bends toward the light source.', hl: true },
    { id: 'm', kind: 'muted', text: '…and 380 more words 📏' },
  ],
  [
    { id: 't', kind: 'title', text: 'How Plants Chase the Light 🌱', hl: true },
    { id: 'p', text: 'Did you know plants can sense where light comes from? A plant chemical called auxin moves to the shady side of the stem. That side grows faster, so the stem bends toward the light!', hl: true },
    { id: 'm', kind: 'muted', text: '…and 250 more words 📏' },
  ],
  [
    { id: 't', kind: 'title', text: TITLE_1, hl: true },
    { id: 'p', text: 'I grew 6 bean plants next to a window for 2 weeks, and every one bent toward the glass! A plant chemical called auxin gathers on the shady side, so that side grows faster.', hl: true },
    { id: 'm', kind: 'muted', text: '…and 150 more words 📏' },
  ],
  [{ id: 't', kind: 'title', text: TITLE_1 }, { ...Q_BOX, hl: true }, { ...D_BOX, hl: true }, F_BOX(F_AUXIN, true)],
  [{ id: 't', kind: 'title', text: TITLE_2, hl: true }, Q_BOX, D_BOX, F_BOX(F_AUXIN)],
  [{ id: 't', kind: 'title', text: TITLE_2 }, Q_BOX, D_BOX, F_BOX(F_AUXIN.replace('auxin', '~~auxin~~')), { ...FUN, hl: true }],
];
const POSTER_CLARITY = [8, 30, 42, 60, 75, 85, 92, 100];
const POSTER_TAGS = ['🤷 Has to ask first', '📏 Right topic, too long and hard', '🙂 Friendlier, still general', "🌱 About Mia's own beans", '🪧 Poster-shaped', '✨ Catchy title', '⭐ Fun fact added'];
const POSTER_MOODS: BotMood[] = ['confused', 'thinking', 'thinking', 'happy', 'happy', 'proud', 'proud'];

function AnswerLine({ line, hl }: { line: PLine; hl: string | null }) {
  const style = hl ? { backgroundColor: `${hl}2e`, boxShadow: `inset 4px 0 0 ${hl}` } : undefined;
  const anim = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { ...spring, delay: 0.35 } };
  if (line.kind === 'title') {
    return (
      <motion.div {...anim} className="rounded-md px-2 py-0.5 text-[19px] font-bold" style={style}>
        <Rich text={line.text} />
      </motion.div>
    );
  }
  if (line.kind === 'box') {
    return (
      <motion.div {...anim} className="rounded-md px-2 py-1 border border-black/10" style={style}>
        <div className="text-[13px] font-bold uppercase tracking-wide text-black/45">{line.label}</div>
        <div className="text-[14.5px]">
          <Rich text={line.text} />
        </div>
      </motion.div>
    );
  }
  if (line.kind === 'muted') {
    return (
      <motion.div {...anim} className="px-2 text-[13px] italic text-black/45">
        {line.text}
      </motion.div>
    );
  }
  if (line.kind === 'fun') {
    return (
      <motion.div {...anim} className="rounded-md px-2 py-1 bg-amber-50 border border-amber-200 text-[14.5px]" style={style}>
        {line.text}
      </motion.div>
    );
  }
  return (
    <motion.div {...anim} className="rounded-md px-2 py-0.5 text-[14.5px]" style={style}>
      <Rich text={line.text} />
    </motion.div>
  );
}

function BuildScene({ stage }: { stage: number }) {
  const have = RECIPE.slice(0, stage);
  const newest = stage > 0 ? RECIPE[stage - 1] : null;
  const hl = newest ? ING[newest].color : null;
  return (
    <Scene id="build">
      <div className="flex items-start gap-4">
        {/* Mia's prompt, the recipe card */}
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-xl bg-[#fffdf7] text-[#1f2937] shadow-lg border-2 border-[#f9a8d4]/70 w-[500px]">
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-black/10">
              <Mia size={30} label={false} />
              <span className="text-[13px] font-bold uppercase tracking-wide text-black/50">Mia&apos;s prompt</span>
              <span className="ml-auto text-[13px] font-mono text-black/40">draft {stage + 1}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 px-3 pt-2">
              {RECIPE.map((id) => {
                const ing = ING[id];
                const on = have.includes(id);
                return (
                  <motion.span
                    key={id}
                    animate={{ scale: id === newest ? [1, 1.15, 1] : 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="px-2 py-0.5 rounded-full text-[13px] font-semibold border"
                    style={
                      on
                        ? { backgroundColor: ing.color, borderColor: ing.color, color: '#0f172a' }
                        : { borderColor: 'rgba(0,0,0,0.18)', borderStyle: 'dashed', color: 'rgba(0,0,0,0.35)' }
                    }
                  >
                    {on ? '✓' : ing.icon} {ing.label}
                  </motion.span>
                );
              })}
            </div>
            <div className="px-3 py-3 space-y-1.5 text-[15px] leading-snug min-h-[110px]">
              {stage === 0 && <div className="text-[22px] font-medium text-black/75 py-3">help with my poster</div>}
              {stage === 1 && (
                <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0.55 }} transition={{ delay: 0.3 }} className="text-[14px] text-black/45 line-through">
                  help with my poster
                </motion.div>
              )}
              {PROMPT_ORDER.filter((id) => have.includes(id)).map((id) => (
                <Seg key={id} id={id} glow={id === newest} dim={stage > 1 && id !== newest}>
                  {POSTER_SEGS[id]}
                </Seg>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-24 text-3xl text-white/40">➜</div>

        {/* Solo Bot's answer + the clarity meter */}
        <div className="flex flex-col gap-2 w-[540px]">
          <div className="flex items-end gap-3">
            <AgentBot color={SOLO.color} badge={SOLO.badge} size={66} mood={POSTER_MOODS[stage]} />
            <div className="flex-1 pb-2 flex flex-col gap-2">
              <ClarityMeter value={POSTER_CLARITY[stage]} width={440} />
              <motion.div key={stage} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="text-[14px] font-semibold" style={{ color: hl ?? '#f87171' }}>
                {POSTER_TAGS[stage]}
              </motion.div>
            </div>
          </div>
          <div className="rounded-xl bg-white text-[#1f2937] shadow-lg border-2" style={{ borderColor: hl ? `${hl}aa` : 'rgba(0,0,0,0.1)' }}>
            <div className="px-3 pt-1.5 pb-1 border-b border-black/10 text-[13px] font-bold uppercase tracking-wide text-black/45">🤖 Solo Bot&apos;s answer</div>
            <div className="px-2 py-2 space-y-1.5 leading-snug">
              {POSTER_ANSWERS[stage].map((l) => (
                <AnswerLine key={`${l.id}-${l.text}`} line={l} hl={l.hl ? hl : null} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}

// ---------- step 11: say what TO do ----------

function SayDoScene() {
  const more = [
    { no: "Don't make it long.", yes: 'Max 2 sentences per box.' },
    { no: "Don't be boring.", yes: 'Start with a surprising question.' },
  ];
  const lim = ING.limits.color;
  return (
    <Scene id="sayDo">
      <div className="flex items-center gap-5">
        {/* the don't */}
        <div className="flex flex-col gap-2 w-[420px]">
          <div className="text-[14px] font-bold uppercase tracking-wide text-red-300">❌ Only what to avoid</div>
          <PromptPaper title="Mia's limits" width={420} border="#f87171" dim>
            <div className="text-[19px] font-semibold">No hard science words.</div>
          </PromptPaper>
          <Paper title="🔎 What I found" icon="" width={420} dim>
            <div>
              <Rich text={F_AUXIN.replace('auxin', '~~auxin~~')} />
            </div>
          </Paper>
          <Verdict ok={false} delay={0.4}>🤔 Which words count as hard?</Verdict>
        </div>

        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.5 }} className="text-5xl" style={{ color: lim, originX: 0 }}>
          ➜
        </motion.div>

        {/* the do */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.7 }} className="flex flex-col gap-2 w-[460px]">
          <div className="text-[14px] font-bold uppercase tracking-wide text-emerald-300">✅ What TO do</div>
          <PromptPaper title="Mia's limits" width={460} border={lim}>
            <Seg id="limits" glow>
              <span className="text-[19px] font-semibold">Use words a 10-year-old knows.</span>
            </Seg>
          </PromptPaper>
          <Paper title="🔎 What I found" icon="" width={460} border="#4ade80">
            <motion.div initial={{ backgroundColor: '#bbf7d0' }} animate={{ backgroundColor: '#ffffff00' }} transition={{ delay: 1.4, duration: 1.2 }} className="rounded px-1">
              {F_SIMPLE}
            </motion.div>
          </Paper>
          <Verdict ok delay={1.2}>🎯 A clear target: &apos;auxin&apos; is gone</Verdict>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="mt-6 flex gap-4">
        {more.map((m) => (
          <div key={m.no} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[14px]">
            <span className="text-red-300 line-through decoration-red-400/70">{m.no}</span>
            <span className="text-white/40">➜</span>
            <span className="text-emerald-300">{m.yes}</span>
          </div>
        ))}
      </motion.div>
    </Scene>
  );
}

// ---------- step 12: delimiters (a fence around pasted text) ----------

const NOTES = ['Day 1: planted 6 beans by the window.', 'Day 7: the stems started to lean.', 'Day 14: all 6 lean toward the glass.'];
const TODO = 'To do: think of a funny title!';

function Fence({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.3 }}
      animate={{ opacity: 1, scaleX: 1, boxShadow: ['0 0 0px #cbd5e100', '0 0 12px #94a3b8', '0 0 0px #cbd5e100'] }}
      transition={{ delay, boxShadow: { duration: 1.8, repeat: Infinity, delay } }}
      className="w-full rounded bg-slate-300 text-slate-800 font-mono font-bold text-[15px] px-2 leading-6 flex items-center justify-between"
    >
      <span>&quot;&quot;&quot;</span>
      <span className="text-[13px] font-sans font-semibold tracking-wide uppercase text-slate-600">🧱 fence</span>
    </motion.div>
  );
}

function DelimitersScene() {
  return (
    <Scene id="delimiters">
      <div className="flex gap-8 items-start">
        {/* without */}
        <div className="flex flex-col gap-2 w-[440px]">
          <div className="text-[14px] font-bold uppercase tracking-wide text-red-300">No fence</div>
          <PromptPaper title="Mia's prompt" width={440} border="rgba(0,0,0,0.1)" dim>
            <div className="font-semibold">Summarise my notes in 2 sentences:</div>
            <div className="text-[14px] text-black/70 space-y-0.5">
              {NOTES.map((n) => (
                <div key={n}>{n}</div>
              ))}
              <div className="rounded px-1 bg-red-100 text-red-700 w-fit">{TODO}</div>
            </div>
          </PromptPaper>
          <Paper title="Answer" width={440} border="#f87171" dim>
            <div>All 6 bean plants leaned toward the window in 14 days.</div>
            <div className="rounded px-1 bg-red-100">Funny title: “Bean There, Grown That!” 😄</div>
          </Paper>
          <Verdict ok={false} delay={0.5}>✗ It obeyed a line inside the notes</Verdict>
        </div>

        {/* with */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.4 }} className="flex flex-col gap-2 w-[500px]">
          <div className="text-[14px] font-bold uppercase tracking-wide text-emerald-300">With a fence</div>
          <PromptPaper title="Mia's prompt" width={500} border="#94a3b8">
            <div className="font-semibold">
              Summarise the notes between the <span className="font-mono bg-slate-200 rounded px-1">&quot;&quot;&quot;</span> marks in 2 sentences.
            </div>
            <Fence delay={0.8} />
            <div className="text-[14px] text-black/70 space-y-0.5 pl-2">
              {NOTES.map((n) => (
                <div key={n}>{n}</div>
              ))}
              <div>{TODO}</div>
            </div>
            <Fence delay={1.0} />
            <div className="text-[13px] text-black/45 text-right">### works too</div>
          </PromptPaper>
          <Paper title="Answer" width={500} border="#4ade80">
            <div>Over 14 days, all 6 bean plants slowly leaned toward the window. The notes also say a funny title is still to do.</div>
          </Paper>
          <Verdict ok delay={1.4}>✓ Notes treated as notes</Verdict>
        </motion.div>
      </div>
    </Scene>
  );
}

// ---------- step 13: step by step ----------

function StepByStepScene() {
  const steps = [
    { t: 'Add them up: 3 + 5 + 4 + 6 + 2 + 4 = 24 cm', n: 'Step 1' },
    { t: 'Count the plants: 6', n: 'Step 2' },
    { t: 'Divide: 24 ÷ 6 = 4', n: 'Step 3' },
  ];
  const cyan = ING.step.color;
  return (
    <Scene id="stepByStep">
      <motion.div {...{ initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 } }} transition={spring} className="flex items-center gap-3 mb-5">
        <Mia size={40} label={false} />
        <div className="rounded-2xl rounded-bl-sm bg-accent-blue px-4 py-2 text-[18px] font-medium text-white shadow">
          My 6 beans grew 3, 5, 4, 6, 2 and 4 cm. What&apos;s the average growth?
        </div>
      </motion.div>
      <div className="flex gap-8 items-start">
        {/* rushed */}
        <div className="flex flex-col gap-2 w-[360px]">
          <div className="text-[14px] font-bold uppercase tracking-wide text-red-300">Just the question</div>
          <div className="flex items-end gap-2">
            <AgentBot color={SOLO.color} badge={SOLO.badge} size={60} mood="working" dimmed />
            <Paper title="Answer" width={280} border="#f87171" dim>
              <div className="text-[18px] font-semibold">
                The average is <span className="text-red-600 line-through decoration-2">4.5 cm</span>.
              </div>
            </Paper>
          </div>
          <Verdict ok={false} delay={0.4}>✗ Rushed and wrong (example)</Verdict>
        </div>

        {/* step by step */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.4 }} className="flex flex-col gap-2 w-[520px]">
          <div className="text-[14px] font-bold uppercase tracking-wide text-emerald-300">+ one extra line</div>
          <div className="rounded-xl bg-[#fffdf7] text-[#1f2937] px-3 py-2 border-2" style={{ borderColor: cyan }}>
            <Seg id="step" glow>
              <span className="text-[16px] font-semibold">Work it out step by step and show your steps.</span>
            </Seg>
          </div>
          <div
            className="rounded-xl border-2 border-emerald-400/70 px-4 py-3 text-[#1f2937] shadow-lg"
            style={{ backgroundColor: '#fefce8', backgroundImage: 'linear-gradient(#e0f2fe 1px, transparent 1px)', backgroundSize: '100% 30px' }}
          >
            <div className="text-[13px] font-bold uppercase tracking-wide text-black/45 mb-1">🤖 Answer (scrap paper)</div>
            {steps.map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.35 }} className="flex items-center gap-2 text-[16px] leading-[30px]">
                <span className="text-[13px] font-bold rounded px-1.5" style={{ backgroundColor: `${cyan}40` }}>
                  {s.n}
                </span>
                <span className="font-mono">{s.t}</span>
                <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.35 }} className="text-emerald-600 font-bold">
                  ✓
                </motion.span>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="text-[18px] font-bold leading-[30px]">
              Average: 4 cm ✅
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Scene>
  );
}

// ---------- step 14: iterate ----------

const DRAFTS: { label: ReactNode; value: number }[] = [
  { label: '“help with my poster”', value: POSTER_CLARITY[0] },
  ...RECIPE.map((id, i) => ({ label: <>+ {ING[id].icon} {ING[id].label.toLowerCase()}</>, value: POSTER_CLARITY[i + 1] })),
  { label: <>✏️ say what TO do</>, value: POSTER_CLARITY[7] },
];

function IterateScene() {
  const nodes = [
    { t: '✍️ Write', a: -90 },
    { t: '🧪 Test', a: 0 },
    { t: '👀 Look', a: 90 },
    { t: '🔧 Fix', a: 180 },
  ];
  const R = 120;
  return (
    <Scene id="iterate">
      <div className="flex items-center gap-14">
        {/* the loop */}
        <div className="relative w-[340px] h-[340px]">
          <svg viewBox="0 0 340 340" className="absolute inset-0" aria-hidden>
            <circle cx="170" cy="170" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeDasharray="8 8" />
          </svg>
          <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
            <div className="absolute w-4 h-4 rounded-full bg-accent-blue shadow-glow-blue" style={{ left: 170 - 8, top: 170 - R - 8 }} />
          </motion.div>
          {nodes.map((n, i) => {
            const rad = (n.a * Math.PI) / 180;
            return (
              <motion.div
                key={n.t}
                initial={{ opacity: 0, scale: 0.6, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                transition={{ ...spring, delay: 0.2 + i * 0.2 }}
                className="absolute rounded-full px-4 py-2 bg-navy-700 border-2 border-accent-blue/60 text-[16px] font-semibold text-white whitespace-nowrap"
                style={{ left: 170 + R * Math.cos(rad), top: 170 + R * Math.sin(rad) }}
              >
                {n.t}
              </motion.div>
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center text-[15px] font-semibold text-white/60">🔁 repeat</div>
        </div>

        {/* Mia's drafts */}
        <div className="w-[420px]">
          <div className="flex items-center gap-2 mb-2">
            <Mia size={30} label={false} />
            <span className="text-[14px] font-bold uppercase tracking-wide text-white/60">Mia&apos;s drafts</span>
          </div>
          <div className="space-y-1.5">
            {DRAFTS.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.5 + i * 0.12 }} className="flex items-center gap-3">
                <span className="w-7 text-[13px] font-mono text-white/50">v{i + 1}</span>
                <span className="w-[190px] text-[14px] text-white/85 whitespace-nowrap">{d.label}</span>
                <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    transition={{ duration: 0.6, delay: 0.6 + i * 0.12 }}
                    style={{ backgroundColor: d.value < 30 ? '#f87171' : d.value < 60 ? '#fb923c' : d.value < 85 ? '#fbbf24' : '#4ade80' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-2 text-right text-[13px] text-white/45">bars = clarity meter</div>
        </div>
      </div>
    </Scene>
  );
}

// ---------- step 15: common mistakes ----------

function MistakesScene() {
  const cards: { icon: string; title: string; prompt: string; bubble: string; mood: BotMood; fix: string }[] = [
    { icon: '🌫️', title: 'Too vague', prompt: 'Make it better.', bubble: 'Better how? 🤔', mood: 'confused', fix: 'Make the title shorter and funnier.' },
    { icon: '🤹', title: 'Too many tasks', prompt: 'Write my poster, check my maths, plan my party and explain black holes.', bubble: 'Where do I start?!', mood: 'tired', fix: 'One task per prompt, or a numbered list of steps.' },
    { icon: '⚔️', title: 'Rules that fight', prompt: 'Explain every detail. Keep it under 20 words.', bubble: 'Both?! 😵', mood: 'confused', fix: 'Explain the main idea in under 20 words.' },
  ];
  return (
    <Scene id="mistakes">
      <div className="flex gap-5 items-stretch">
        {cards.map((c, i) => (
          <motion.div key={c.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: i * 0.25 }} className="w-[330px] rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col items-center gap-3">
            <div className="text-[19px] font-bold text-white">
              {c.icon} {c.title}
            </div>
            <div className="w-full rounded-lg bg-[#fffdf7] text-[#1f2937] px-3 py-2 text-[15px] border-2 border-red-300 min-h-[70px] flex items-center">“{c.prompt}”</div>
            <div className="flex flex-col items-center gap-1">
              <Bubble delay={0.5 + i * 0.25}>{c.bubble}</Bubble>
              <AgentBot color={SOLO.color} badge={SOLO.badge} size={70} mood={c.mood} />
            </div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 1.0 + i * 0.25 }} className="mt-auto w-full rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-[14.5px] text-emerald-100">
              <span className="font-bold text-emerald-300">✅ Fix: </span>
              {c.fix}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </Scene>
  );
}

// ---------- step 17: takeaways ----------

function TakeawaysScene() {
  const items = [
    { text: 'The AI only knows what you tell it. A vague prompt gets a safe, average answer.', color: '#f87171' },
    { text: 'Add the ingredients the job needs: task, role, context, format, examples and limits.', color: BLUE },
    { text: 'Fence off pasted text, ask for steps on maths, say what TO do, and keep improving drafts.', color: '#4ade80' },
  ];
  return (
    <Scene id="takeaways">
      <h2 className="text-2xl font-bold text-white mb-5">What you learned</h2>
      <div className="space-y-3 w-[680px]">
        {items.map((it, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: i * 0.15 }} className="flex items-center gap-4 px-5 py-3 rounded-xl border bg-white/[0.02]" style={{ borderColor: `${it.color}40` }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border" style={{ color: it.color, borderColor: `${it.color}60`, backgroundColor: `${it.color}15` }}>
              {i + 1}
            </span>
            <span className="text-[15px] text-white/80">{it.text}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-6">
        <div className="flex gap-1.5">
          {RECIPE.map((id, i) => (
            <motion.span key={id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }}>
              <IngTag id={id} />
            </motion.span>
          ))}
        </div>
        <AgentBot color={SOLO.color} badge={SOLO.badge} size={64} mood="proud" />
      </div>
    </Scene>
  );
}

// ---------- main ----------

const BUILD_STAGE: Record<string, number> = { poster0: 0, addTask: 1, addRole: 2, addContext: 3, addFormat: 4, addExample: 5, addLimits: 6 };

export default function PromptWritingAnim() {
  const trigger = useConceptStore((st) => st.steps[st.currentStep]?.animationTrigger) ?? 'intro';

  let scene: ReactNode;
  if (trigger in BUILD_STAGE) {
    scene = <BuildScene stage={BUILD_STAGE[trigger]} />;
  } else {
    switch (trigger) {
      case 'vague':
        scene = <VagueScene />;
        break;
      case 'clear':
        scene = <ClearScene />;
        break;
      case 'recipe':
        scene = <RecipeScene />;
        break;
      case 'sayDo':
        scene = <SayDoScene />;
        break;
      case 'delimiters':
        scene = <DelimitersScene />;
        break;
      case 'stepByStep':
        scene = <StepByStepScene />;
        break;
      case 'iterate':
        scene = <IterateScene />;
        break;
      case 'mistakes':
        scene = <MistakesScene />;
        break;
      case 'playground':
        scene = (
          <Scene id="playground" className="!p-0">
            <PromptFixerPlayground />
          </Scene>
        );
        break;
      case 'takeaways':
        scene = <TakeawaysScene />;
        break;
      default:
        scene = <IntroScene />;
    }
  }

  // Keep the poster scene mounted across its steps so new ingredients slide in and the meter moves.
  const sceneKey = trigger in BUILD_STAGE ? 'build' : trigger;

  return (
    <div className="relative w-full h-full overflow-hidden bg-navy-900/40">
      <div key={sceneKey} className="absolute inset-0">
        {scene}
      </div>
    </div>
  );
}
