'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useConceptStore } from '@/stores/conceptStore';
import AgentBot, { TEAM } from '@/components/animations/characters/AgentBot';
import WhyTeamsPlayground from './WhyTeamsPlayground';

const CYAN = '#22d3ee';
const spring = { type: 'spring' as const, stiffness: 240, damping: 24 };
const pop = { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 } };

// ---------- small shared props (paper notes, cards, bubbles) ----------

function StickyNote({ title, lines, color = '#fde68a', width = 260, delay = 0 }: { title: string; lines: ReactNode[]; color?: string; width?: number; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, rotate: -3 }}
      animate={{ opacity: 1, y: 0, rotate: -1.5 }}
      transition={{ ...spring, delay }}
      className="rounded-md px-3 py-2 shadow-lg"
      style={{ backgroundColor: color, width, color: '#1f2937' }}
    >
      <div className="text-[12px] font-bold uppercase tracking-wide opacity-70 mb-1">{title}</div>
      <div className="space-y-0.5">
        {lines.map((l, i) => (
          <div key={i} className="text-[13px] leading-snug">{l}</div>
        ))}
      </div>
    </motion.div>
  );
}

function PromptCard({ owner, color, children, width = 250, compact = false }: { owner: string; color: string; children: ReactNode; width?: number; compact?: boolean }) {
  return (
    <div className="rounded-lg border-2 bg-[#f8fafc] text-[#1f2937] shadow-md" style={{ borderColor: color, width }}>
      <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white rounded-t-[5px]" style={{ backgroundColor: color }}>
        📋 {owner}&apos;s system prompt
      </div>
      <div className={`px-2.5 ${compact ? 'py-1.5' : 'py-2'} text-[13px] leading-snug`}>{children}</div>
    </div>
  );
}

function Bubble({ children, color = '#ffffff', delay = 0.2 }: { children: ReactNode; color?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...spring, delay }}
      className="relative rounded-2xl px-3 py-1.5 text-[14px] font-medium text-[#0f172a] shadow"
      style={{ backgroundColor: color }}
    >
      {children}
    </motion.div>
  );
}

function Paper({ title, children, width = 300, border = 'rgba(255,255,255,0.15)' }: { title: string; children: ReactNode; width?: number; border?: string }) {
  return (
    <div className="rounded-lg bg-[#fffdf7] text-[#1f2937] shadow-lg border-2" style={{ width, borderColor: border }}>
      <div className="px-3 pt-2 pb-1 border-b border-black/10 text-[12px] font-bold uppercase tracking-wide text-black/50">{title}</div>
      <div className="px-3 py-2 space-y-1 text-[13px] leading-snug">{children}</div>
    </div>
  );
}

function Scene({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`absolute inset-0 flex flex-col items-center justify-center px-6 py-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ---------- scenes ----------

function IntroScene() {
  const learn = [
    'Why one agent doing everything gets overloaded',
    'What an agent really is on the inside',
    'How agents pass work along, and when NOT to use a team',
  ];
  const cast = [TEAM.solo, TEAM.researcher, TEAM.writer, TEAM.critic];
  return (
    <Scene id="intro">
      <div className="text-[13px] font-semibold tracking-widest uppercase mb-1" style={{ color: CYAN }}>Part 4 · Multi-Agent Teams</div>
      <h2 className="text-3xl font-bold text-white mb-5">Why a Team of Agents?</h2>
      <div className="flex gap-10 items-center">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 w-[380px]">
          <div className="text-[13px] font-bold uppercase tracking-wide text-white/50 mb-2">What you&apos;ll learn</div>
          {learn.map((t, i) => (
            <motion.div key={t} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.2 + i * 0.15 }} className="flex gap-3 items-start py-1.5">
              <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ color: CYAN, backgroundColor: `${CYAN}20`, border: `1px solid ${CYAN}50` }}>{i + 1}</span>
              <span className="text-[15px] text-white/80">{t}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-3 items-end">
          {cast.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.4 + i * 0.12 }}>
              <AgentBot color={c.color} badge={c.badge} name={c.name} role={c.role} size={i === 0 ? 92 : 80} mood="happy" />
            </motion.div>
          ))}
        </div>
      </div>
    </Scene>
  );
}

function HookScene() {
  const jobs = [
    { icon: '🔍', label: 'Research', pos: { left: -170, top: 10 } },
    { icon: '✍️', label: 'Write', pos: { left: 170, top: 10 } },
    { icon: '✅', label: 'Check facts', pos: { left: -180, top: 120 } },
    { icon: '🎉', label: 'Make it fun', pos: { left: 175, top: 120 } },
  ];
  return (
    <Scene id="hook">
      <motion.div {...pop} transition={spring} className="rounded-lg bg-[#fffdf7] text-[#1f2937] px-5 py-3 shadow-lg mb-6 w-[440px] text-center border-2 border-[#fb923c]">
        <div className="text-[12px] font-bold uppercase tracking-widest text-black/50">📰 School Newsletter · next issue</div>
        <div className="text-xl font-bold mt-1">🌋 Article needed: VOLCANOES</div>
        <div className="text-[13px] text-black/60">Fun, true, and easy to read for kids.</div>
      </motion.div>
      <div className="relative w-[140px] h-[200px] flex flex-col items-center">
        <div className="mb-2"><Bubble delay={0.9}>I have to do ALL of this?!</Bubble></div>
        <AgentBot color={TEAM.solo.color} badge={TEAM.solo.badge} name={TEAM.solo.name} role={TEAM.solo.role} size={110} mood="confused" active />
        {jobs.map((j, i) => (
          <motion.div
            key={j.label}
            initial={{ opacity: 0, scale: 0.5, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%' }}
            transition={{ ...spring, delay: 0.3 + i * 0.15 }}
            className="absolute px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[14px] font-medium whitespace-nowrap"
            style={{ left: `calc(50% + ${j.pos.left}px)`, top: 50 + j.pos.top }}
          >
            {j.icon} {j.label}
          </motion.div>
        ))}
      </div>
    </Scene>
  );
}

const SOLO_RULES = [
  'You are a researcher AND a writer AND a fact-checker AND a fun editor.',
  'Search the web for facts about the topic.',
  'Find at least 5 facts and cite sources.',
  'Write about 150 words.',
  'Use simple words for 10-year-olds.',
  'Add a catchy title.',
  'Add one joke, but not too silly.',
  'Keep a friendly tone.',
  'Check every fact is true.',
  'Never invent facts.',
  'Check spelling and grammar.',
  'Make it exciting!',
  'No hard science words.',
  '…and 9 more rules',
];

function SoloScene({ showMistakes }: { showMistakes: boolean }) {
  return (
    <Scene id="solo">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2 w-[150px]">
          <Bubble delay={1.6}>{showMistakes ? 'Oops… did I check that?' : 'So… many… rules…'}</Bubble>
          <AgentBot color={TEAM.solo.color} badge={TEAM.solo.badge} name={TEAM.solo.name} role="does everything" size={112} mood={showMistakes ? 'confused' : 'tired'} active={!showMistakes} />
        </div>
        <motion.div animate={{ width: showMistakes ? 300 : 380 }} transition={spring}>
          <PromptCard owner="Solo Bot" color={TEAM.solo.color} width={showMistakes ? 300 : 380} compact>
            <div className="space-y-0.5">
              {SOLO_RULES.map((r, i) => (
                <motion.div
                  key={r}
                  initial={showMistakes ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: showMistakes ? 0 : 0.15 + i * 0.12 }}
                  className={`${showMistakes ? 'text-[12px]' : 'text-[13px]'} ${i === 0 ? 'font-semibold' : ''}`}
                >
                  {i === 0 ? '' : '• '}{r}
                </motion.div>
              ))}
            </div>
          </PromptCard>
          <div className="mt-2 text-center text-[13px] text-white/60">Rules to juggle: <span className="font-bold text-[#fb923c]">22</span></div>
        </motion.div>
        {showMistakes && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.2 }} className="flex flex-col gap-3">
            <Paper title="Solo Bot's article" width={330} border="#f87171">
              <div className="font-bold text-[15px]">VOLCANOES!!! 🌋</div>
              <div>Volcanoes are mountains where hot melted rock called magma comes out.</div>
              <div className="rounded px-1 bg-orange-200">Subduction-zone stratovolcanoes exhibit explosive eruptive behaviour.<span className="block text-[11px] font-bold text-orange-700">⚠ way too hard for kids</span></div>
              <div className="rounded px-1 bg-red-200">Mount Everest is the tallest volcano on Earth!<span className="block text-[11px] font-bold text-red-700">✗ wrong: Everest is not a volcano</span></div>
              <div className="rounded px-1 bg-orange-200">lava is really hot. like REALLY hot lol<span className="block text-[11px] font-bold text-orange-700">⚠ messy style, no number</span></div>
            </Paper>
          </motion.div>
        )}
      </div>
      {showMistakes && (
        <div className="flex gap-3 mt-4">
          {['📜 One prompt doing everything', '🤹 A long list of rules to juggle', '👀 Nobody double-checks'].map((t, i) => (
            <motion.div key={t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 + i * 0.2 }} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-400/30 text-[14px] text-red-100">
              {t}
            </motion.div>
          ))}
        </div>
      )}
    </Scene>
  );
}

const SPECIALISTS = [
  { ...TEAM.researcher, job: '🔍 Find the facts', prompt: 'You find facts. Search the web and list 5 short, true facts with a source. Do not write the article.' },
  { ...TEAM.writer, job: '✍️ Write the article', prompt: 'You write fun articles for 10-year-olds. Use ONLY the notes you are given. About 150 words.' },
  { ...TEAM.critic, job: '🧐 Check the facts', prompt: 'You check an article against the notes. List any fact that is wrong or not in the notes. Otherwise say OK.' },
];

function SplitScene() {
  return (
    <Scene id="split">
      <div className="flex items-center gap-8">
        <motion.div initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0.6, scale: 0.9 }} transition={{ delay: 0.3, duration: 0.6 }} className="flex flex-col items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-white/10 text-white text-[14px] font-semibold">One BIG job</div>
          <AgentBot color={TEAM.solo.color} badge={TEAM.solo.badge} name={TEAM.solo.name} size={100} mood="tired" />
        </motion.div>
        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.6, duration: 0.5 }} className="text-5xl" style={{ color: CYAN, originX: 0 }}>
          ➜
        </motion.div>
        <div className="flex flex-col items-center gap-3">
          <div className="px-3 py-1 rounded-full text-[14px] font-semibold" style={{ color: CYAN, backgroundColor: `${CYAN}20` }}>Three small jobs</div>
          <div className="flex gap-6">
            {SPECIALISTS.map((a, i) => (
              <motion.div key={a.name} initial={{ opacity: 0, x: -60, scale: 0.5 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ ...spring, delay: 0.9 + i * 0.2 }} className="flex flex-col items-center gap-2">
                <AgentBot color={a.color} badge={a.badge} name={a.name} role={a.role} size={90} mood="happy" />
                <div className="px-2.5 py-1 rounded-md text-[13px] text-white whitespace-nowrap" style={{ backgroundColor: `${a.color}30`, border: `1px solid ${a.color}70` }}>{a.job}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-[15px] text-white/80 max-w-[640px] text-center">
        📚 Just like a school group project: one friend finds facts, one writes, one checks. Nobody has to do everything.
      </motion.div>
    </Scene>
  );
}

function MeetTeamScene() {
  return (
    <Scene id="meetTeam">
      <div className="flex gap-6 items-start">
        {SPECIALISTS.map((a, i) => (
          <motion.div key={a.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: i * 0.25 }} className="flex flex-col items-center gap-3">
            <AgentBot color={a.color} badge={a.badge} name={a.name} role={a.role} size={96} mood="happy" active={false} />
            <PromptCard owner={a.name} color={a.color} width={260}>{a.prompt}</PromptCard>
            <div className="text-[13px] text-white/60">1 job · 2 lines</div>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-5 flex items-center gap-3 text-[14px] text-white/70">
        <span className="px-2 py-0.5 rounded bg-white/10">Solo Bot&apos;s card: 22 rules</span>
        <span>vs.</span>
        <span className="px-2 py-0.5 rounded" style={{ backgroundColor: `${CYAN}20`, color: CYAN }}>each of these: one short, focused card</span>
      </motion.div>
    </Scene>
  );
}

function InsideAgentScene() {
  const rita = TEAM.researcher;
  const parts = [
    { icon: '🧠', title: 'The LLM', body: <>gpt-4o-mini: the same brain every agent in this lesson uses</> },
    { icon: '📋', title: 'Her own system prompt', body: <>“You find facts. Search the web and list 5 short, true facts…”</> },
    { icon: '🧰', title: 'Her own tools', body: <span className="font-mono text-[12px]">web_search(query)</span> },
    {
      icon: '💬',
      title: 'Her own messages list',
      body: (
        <div className="font-mono text-[11.5px] leading-tight">
          [ {'{'}role: &quot;system&quot;, content: RITA_PROMPT{'}'},<br />
          &nbsp;&nbsp;{'{'}role: &quot;user&quot;, content: &quot;Find facts about volcanoes&quot;{'}'} ]
        </div>
      ),
    },
  ];
  return (
    <Scene id="insideAgent">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Bubble color="#dbeafe" delay={0.2}>Look inside me!</Bubble>
          <AgentBot color={rita.color} badge={rita.badge} name={rita.name} role={rita.role} size={110} mood="proud" active />
        </div>
        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.3 }} className="text-4xl" style={{ color: rita.color, originX: 0 }}>➜</motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.4 }} className="rounded-2xl border-2 p-4 w-[560px]" style={{ borderColor: rita.color, backgroundColor: `${rita.color}10` }}>
          <div className="text-[13px] font-bold uppercase tracking-wide mb-3" style={{ color: rita.color }}>Inside Rita = just these 4 things</div>
          <div className="grid grid-cols-2 gap-3">
            {parts.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.7 + i * 0.25 }} className="rounded-xl bg-navy-900/70 border border-white/10 p-3">
                <div className="text-[15px] font-semibold text-white mb-1">{p.icon} {p.title}</div>
                <div className="text-[13px] text-white/70">{p.body}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} className="mt-5 text-[15px] text-white/75">
        No magic, no hidden person. An agent is an LLM call wearing its own instructions.
      </motion.div>
    </Scene>
  );
}

function SameBrainScene() {
  const codeArg = ['task', 'notes', 'draft'];
  return (
    <Scene id="sameBrain">
      <motion.div {...pop} transition={spring} className="rounded-2xl border-2 px-6 py-3 text-center mb-2" style={{ borderColor: CYAN, backgroundColor: `${CYAN}12` }}>
        <div className="text-3xl">🧠</div>
        <div className="text-[16px] font-bold text-white">One LLM: gpt-4o-mini</div>
        <div className="text-[13px] text-white/60">the same brain for everyone</div>
      </motion.div>
      <svg width="700" height="60" className="overflow-visible" aria-hidden>
        {[117, 350, 583].map((x, i) => (
          <motion.line key={x} x1={350} y1={0} x2={x} y2={60} stroke={SPECIALISTS[i].color} strokeWidth={3} strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }} />
        ))}
      </svg>
      <div className="flex gap-6">
        {SPECIALISTS.map((a, i) => (
          <motion.div key={a.name} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.5 + i * 0.2 }} className="w-[210px] flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <AgentBot color={a.color} badge={a.badge} name={a.name} size={70} mood="happy" />
              <div className="text-[12px] text-white/60 leading-tight">🎭 costume:<br /><span className="font-semibold" style={{ color: a.color }}>{a.role} card</span></div>
            </div>
            <div className="font-mono text-[12px] px-2 py-1 rounded bg-black/40 border border-white/10 text-white/85 whitespace-nowrap">
              run_agent(<span style={{ color: a.color }}>{a.name.toUpperCase()}_PROMPT</span>, {codeArg[i]})
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-[15px] text-white/80">
        🎭 Like one actor playing three parts: same person, different costume and script.
      </motion.div>
    </Scene>
  );
}

function MailCarrierScene() {
  const rita = TEAM.researcher;
  const wally = TEAM.writer;
  return (
    <Scene id="mailCarrier">
      <div className="relative flex items-end justify-between w-[720px] h-[200px]">
        <AgentBot color={rita.color} badge={rita.badge} name={rita.name} role="finished her notes" size={96} mood="proud" />
        <div className="flex flex-col items-center mb-6">
          <div className="text-4xl">🐍📬</div>
          <div className="text-[14px] font-semibold" style={{ color: CYAN }}>our Python code</div>
          <div className="text-[12px] text-white/60">the mail carrier</div>
        </div>
        <AgentBot color={wally.color} badge={wally.badge} name={wally.name} role="waiting for a task" size={96} mood="thinking" active />
        {/* the note travelling Rita -> code -> Wally, over and over */}
        <motion.div
          className="absolute top-0"
          initial={{ left: 40 }}
          animate={{ left: [40, 290, 290, 520, 520] }}
          transition={{ duration: 4, times: [0, 0.35, 0.5, 0.85, 1], repeat: Infinity, repeatDelay: 0.6 }}
        >
          <div className="rounded-md px-2 py-1 shadow-lg bg-[#fde68a] text-[#1f2937] w-[170px] -rotate-2">
            <div className="text-[11px] font-bold uppercase opacity-60">notes (just text)</div>
            <div className="text-[12px] leading-tight">• Magma = melted rock<br />• Mauna Loa = biggest active volcano<br />• Lava: 700–1,200 °C …</div>
          </div>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.4 }} className="mt-4 rounded-xl bg-black/50 border border-white/10 px-4 py-3 font-mono text-[13px] leading-relaxed text-white/85 w-[720px]">
        <div className="text-white/40"># Rita does her job. Her answer comes back as a string.</div>
        <div>notes = run_agent(<span style={{ color: rita.color }}>RITA_PROMPT</span>, <span className="text-amber-200">&quot;Find facts about volcanoes&quot;</span>)</div>
        <div className="text-white/40 mt-1"># Our code hands that same string to Wally as his task.</div>
        <div>draft = run_agent(<span style={{ color: wally.color }}>WALLY_PROMPT</span>, <span className="text-amber-200">&quot;Write an article using these notes:\n&quot;</span> + <span className="bg-[#fde68a] text-[#1f2937] px-1 rounded">notes</span>)</div>
      </motion.div>
      <div className="mt-3 text-[15px] text-white/75">No wires between robots. Just one variable passed from one call to the next.</div>
    </Scene>
  );
}

const NOTES = [
  '• Magma = melted rock under the ground',
  '• Lava = magma that comes out, 700–1,200 °C',
  '• Mauna Loa (Hawaii) = biggest active volcano',
  "• Hawaii's islands were built by volcanoes",
  '• About 1,350 volcanoes on land could erupt again',
];

function RelayScene({ phase }: { phase: number }) {
  const legs = [TEAM.researcher, TEAM.writer, TEAM.critic];
  // who is running right now: 0 Rita, 1 Wally, 2 Cora, 3 Wally (fix)
  const activeIdx = phase === 3 ? 1 : phase;
  const calls = phase + 1;
  const moods = legs.map((_, i) => {
    if (phase === 3) return 'proud' as const;
    if (i === activeIdx) return 'working' as const;
    return i < activeIdx ? ('happy' as const) : ('sleeping' as const);
  });
  const carryLeg = phase === 1 ? 0 : phase === 2 ? 1 : phase === 3 ? 2 : -1; // which gap the note travels through
  return (
    <Scene id="relay" className="justify-start pt-3">
      <div className="flex items-center justify-between w-[940px] mb-1">
        <div className="text-[14px] font-semibold" style={{ color: CYAN }}>🏃 The relay race</div>
        <div className="px-3 py-1 rounded-full bg-white/10 text-white text-[14px]">
          LLM calls so far: <motion.span key={calls} initial={{ scale: 1.8, color: CYAN }} animate={{ scale: 1, color: '#ffffff' }} className="inline-block font-bold">{calls}</motion.span>
        </div>
      </div>
      {/* the track with the three runners */}
      <div className="relative grid grid-cols-3 w-[940px] h-[140px] items-end">
        {legs.map((a, i) => (
          <div key={a.name} className="flex justify-center">
            <AgentBot color={a.color} badge={a.badge} name={a.name} role={a.role} size={84} mood={moods[i]} active={phase < 3 && i === activeIdx} dimmed={phase < 3 && i !== activeIdx} />
          </div>
        ))}
        {[0, 1].map((g) => (
          <div key={g} className="absolute top-[40px] flex flex-col items-center" style={{ left: `${(g + 1) * 33.33 - 6}%`, width: '12%' }}>
            <div className="text-[11px] text-white/50">🐍 our code</div>
            <div className="text-2xl" style={{ color: CYAN }}>{g === 1 && phase >= 2 ? '⇄' : '→'}</div>
          </div>
        ))}
        {carryLeg >= 0 && (
          <motion.div
            key={`carry-${phase}`}
            className="absolute top-[4px] text-2xl"
            initial={{ left: carryLeg === 2 ? '72%' : `${carryLeg * 33.33 + 22}%`, opacity: 1 }}
            animate={{ left: carryLeg === 2 ? '48%' : `${carryLeg * 33.33 + 44}%`, opacity: [1, 1, 0] }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          >
            {carryLeg === 2 ? '🩷📝' : '📝'}
          </motion.div>
        )}
      </div>
      {/* what each runner produced */}
      <div className="grid grid-cols-3 w-[940px] mt-3 items-start">
        <div className="flex justify-center">
          <StickyNote delay={phase === 0 ? 0.8 : 0} title="Rita's notes (from web_search)" lines={[...NOTES, <span key="src" className="text-[11px] opacity-60">source: usgs.gov</span>]} width={280} />
        </div>
        <div className="flex justify-center">
          {phase >= 1 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: phase === 1 ? 0.9 : 0 }}>
              <Paper title={phase === 3 ? "Wally's article (fixed ✓)" : "Wally's draft"} width={290} border={phase === 3 ? '#4ade80' : phase === 2 ? '#f87171' : 'rgba(0,0,0,0.1)'}>
                <div className="font-bold text-[14px]">🌋 Volcanoes: Earth&apos;s Hot Spots!</div>
                <div>Deep under our feet, rock gets so hot it melts. That&apos;s magma! When it bursts out, it&apos;s called lava, and it can be 1,200 °C.</div>
                <div>Mauna Loa in Hawaii is the biggest active volcano on Earth.</div>
                {phase < 3 ? (
                  <div className={`rounded px-1 ${phase === 2 ? 'bg-red-200' : 'bg-amber-100'}`}>
                    Fun fact: Mount Everest is a volcano too!
                    <span className={`block text-[11px] font-bold ${phase === 2 ? 'text-red-700' : 'text-amber-700'}`}>{phase === 2 ? '✗ caught by Cora' : '✨ not in the notes…'}</span>
                  </div>
                ) : (
                  <motion.div initial={{ backgroundColor: '#bbf7d0' }} animate={{ backgroundColor: '#dcfce7' }} className="rounded px-1">
                    <span className="line-through text-red-600/70 text-[12px]">Mount Everest is a volcano too!</span>
                    <br />Fun fact: Hawaii&apos;s islands were built by volcanoes!
                  </motion.div>
                )}
              </Paper>
            </motion.div>
          )}
        </div>
        <div className="flex justify-center">
          {phase >= 2 && (
            <div className="flex flex-col items-center gap-3">
              <StickyNote
                title={phase === 3 ? "Cora's check" : "Cora's feedback"}
                color="#fbcfe8"
                width={260}
                delay={phase === 2 ? 0.8 : 0}
                lines={
                  phase === 2
                    ? ['❌ "Mount Everest is a volcano" is wrong, and it is not in the notes.', '👉 Please swap it for a fact from the notes.']
                    : ['✅ Every fact matches the notes.', 'OK to publish!']
                }
              />
              {phase === 3 && (
                <motion.div {...pop} transition={{ ...spring, delay: 0.5 }} className="px-4 py-2 rounded-lg bg-[#fffdf7] text-[#1f2937] font-bold text-[15px] border-2 border-[#fb923c]">
                  📰 Published in the newsletter!
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </Scene>
  );
}

function ProsScene() {
  const pros = [
    { icon: '🎯', title: 'Focus', text: 'Each agent has one short prompt, so it does its one job well.', who: TEAM.researcher },
    { icon: '🔧', title: 'Easy to fix', text: "Jokes not funny? Change only Wally's card. Rita and Cora stay the same.", who: TEAM.writer },
    { icon: '🧐', title: 'Check each other', text: 'Cora caught the Everest mistake before anyone read it.', who: TEAM.critic },
    { icon: '⚡', title: 'Work at the same time', text: 'Three Ritas could search lava, Hawaii and history all at once.', who: TEAM.researcher },
  ];
  return (
    <Scene id="pros">
      <div className="text-2xl font-bold text-white mb-4">👍 Why a team helps</div>
      <div className="grid grid-cols-2 gap-4 w-[820px]">
        {pros.map((p, i) => (
          <motion.div key={p.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: i * 0.2 }} className="flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] p-3">
            {i === 3 ? (
              <div className="flex -space-x-6 shrink-0">
                {[0, 1, 2].map((k) => (
                  <AgentBot key={k} color={p.who.color} badge={p.who.badge} size={44} mood="working" active />
                ))}
              </div>
            ) : (
              <div className="shrink-0"><AgentBot color={p.who.color} badge={p.who.badge} size={60} mood="happy" /></div>
            )}
            <div>
              <div className="text-[16px] font-semibold text-white">{p.icon} {p.title}</div>
              <div className="text-[14px] text-white/70 leading-snug">{p.text}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </Scene>
  );
}

function ConsScene() {
  const rows = [
    { label: 'Solo Bot', calls: 1, color: TEAM.solo.color },
    { label: 'Team of 3', calls: 4, color: CYAN },
  ];
  return (
    <Scene id="cons">
      <div className="text-2xl font-bold text-white mb-4">👎 The honest part</div>
      <div className="flex gap-6 items-stretch">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 w-[420px]">
          <div className="text-[13px] font-bold uppercase tracking-wide text-white/50 mb-2">The volcano article</div>
          {rows.map((r, i) => (
            <div key={r.label} className="mb-3">
              <div className="flex justify-between text-[14px] text-white/80 mb-1">
                <span>{r.label}</span>
                <span>{r.calls} API call{r.calls > 1 ? 's' : ''} · about {r.calls * 2} s · {'💰'.repeat(r.calls)}</span>
              </div>
              <div className="h-4 rounded-full bg-white/5 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: r.color }} initial={{ width: 0 }} animate={{ width: `${r.calls * 25}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.4 }} />
              </div>
            </div>
          ))}
          <div className="space-y-1.5 mt-3 text-[14px] text-white/75">
            <div>💸 More calls = more money</div>
            <div>⏳ More calls = more waiting</div>
            <div>🧩 More moving parts = more things that can break</div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.8 }} className="rounded-xl border border-amber-300/30 bg-amber-300/[0.06] p-4 w-[360px] flex flex-col items-center text-center">
          <div className="text-5xl mb-1">🥪</div>
          <div className="flex -space-x-5 mb-2">
            {[TEAM.researcher, TEAM.writer, TEAM.critic, TEAM.boss, TEAM.math].map((a) => (
              <AgentBot key={a.name} color={a.color} badge={a.badge} size={46} mood="confused" />
            ))}
          </div>
          <div className="text-[16px] font-semibold text-white">Don&apos;t hire 5 people to make a sandwich.</div>
          <div className="text-[14px] text-white/70 mt-1">&quot;What is 2 + 2?&quot; needs one call, not a team.</div>
          <div className="mt-3 text-[13px] rounded-lg px-3 py-2" style={{ color: CYAN, backgroundColor: `${CYAN}15` }}>
            Rule of thumb: use a team when the job has clearly different parts, or when mistakes really matter.
          </div>
        </motion.div>
      </div>
    </Scene>
  );
}

function TakeawaysScene() {
  const items = [
    { text: 'One agent doing everything gets overloaded: a long prompt, many rules, nobody checking.', color: TEAM.solo.color },
    { text: 'Each agent is just an LLM call with its own short system prompt (and maybe its own tools).', color: TEAM.researcher.color },
    { text: 'Agents "talk" because our code passes text from one to the next. Use a team only when the job needs it.', color: CYAN },
  ];
  return (
    <Scene id="takeaways">
      <h2 className="text-2xl font-bold text-white mb-5">What you learned</h2>
      <div className="space-y-3 w-[640px]">
        {items.map((it, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: i * 0.15 }} className="flex items-center gap-4 px-5 py-3 rounded-xl border bg-white/[0.02]" style={{ borderColor: `${it.color}40` }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border" style={{ color: it.color, borderColor: `${it.color}60`, backgroundColor: `${it.color}15` }}>{i + 1}</span>
            <span className="text-[15px] text-white/80">{it.text}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        {[TEAM.researcher, TEAM.writer, TEAM.critic].map((a) => (
          <AgentBot key={a.name} color={a.color} badge={a.badge} name={a.name} size={60} mood="proud" />
        ))}
      </div>
    </Scene>
  );
}

// ---------- main ----------

export default function WhyTeamsAnim() {
  const trigger = useConceptStore((st) => st.steps[st.currentStep]?.animationTrigger) ?? 'intro';

  let scene: ReactNode;
  switch (trigger) {
    case 'hook':
      scene = <HookScene />;
      break;
    case 'bigPrompt':
      scene = <SoloScene showMistakes={false} />;
      break;
    case 'mistakes':
      scene = <SoloScene showMistakes />;
      break;
    case 'split':
      scene = <SplitScene />;
      break;
    case 'meetTeam':
      scene = <MeetTeamScene />;
      break;
    case 'insideAgent':
      scene = <InsideAgentScene />;
      break;
    case 'sameBrain':
      scene = <SameBrainScene />;
      break;
    case 'mailCarrier':
      scene = <MailCarrierScene />;
      break;
    case 'relayResearch':
      scene = <RelayScene phase={0} />;
      break;
    case 'relayWrite':
      scene = <RelayScene phase={1} />;
      break;
    case 'relayCheck':
      scene = <RelayScene phase={2} />;
      break;
    case 'relayDone':
      scene = <RelayScene phase={3} />;
      break;
    case 'pros':
      scene = <ProsScene />;
      break;
    case 'cons':
      scene = <ConsScene />;
      break;
    case 'playground':
      scene = (
        <Scene id="playground" className="!p-0">
          <WhyTeamsPlayground />
        </Scene>
      );
      break;
    case 'takeaways':
      scene = <TakeawaysScene />;
      break;
    default:
      scene = <IntroScene />;
  }

  // keep the Solo and Relay scenes mounted across their steps so things move instead of re-appearing
  const sceneKey = ['bigPrompt', 'mistakes'].includes(trigger) ? 'solo' : trigger.startsWith('relay') ? 'relay' : trigger;

  return (
    <div className="relative w-full h-full overflow-hidden bg-navy-900/40">
      <div key={sceneKey} className="absolute inset-0">
        {scene}
      </div>
    </div>
  );
}
