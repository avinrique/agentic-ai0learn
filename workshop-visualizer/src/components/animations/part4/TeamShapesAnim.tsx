'use client';
import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useConceptStore } from '@/stores/conceptStore';
import { TEAM } from '../characters/AgentBot';
import TeamShapesPlayground from './TeamShapesPlayground';
import { ACCENT, Bot, CallCounter, SceneLabel, Stage, TaskCard, Who, whoBadge, whoColor, whoName } from './TeamShapesStage';

const C = {
  rita: TEAM.researcher.color,
  wally: TEAM.writer.color,
  cora: TEAM.critic.color,
  max: TEAM.boss.color,
  milo: TEAM.math.color,
  rosa: TEAM.receptionist.color,
};

// ---------- small building blocks ----------

function Scene({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="h-full w-full flex flex-col items-center justify-center gap-3 px-6 py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  );
}

/** The everyday picture: a row of emoji boxes joined by arrows. */
function Picture({ items }: { items: { icon: string; label: string; dim?: boolean; hot?: boolean }[] }) {
  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-white/30 text-lg">→</span>}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: it.dim ? 0.35 : 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.25 }}
            className="flex flex-col items-center px-3 py-1.5 rounded-lg border"
            style={{
              borderColor: it.hot ? `${ACCENT}99` : 'rgba(255,255,255,0.12)',
              background: it.hot ? `${ACCENT}1a` : 'rgba(255,255,255,0.04)',
            }}
          >
            <span className="text-2xl leading-none">{it.icon}</span>
            <span className="text-[12px] text-white/70 mt-1 whitespace-nowrap">{it.label}</span>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function Callout({ children, color = ACCENT, delay = 0.6 }: { children: ReactNode; color?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="px-4 py-2 rounded-lg border text-[14px] text-white/85 text-center max-w-3xl"
      style={{ borderColor: `${color}55`, background: `${color}12` }}
    >
      {children}
    </motion.div>
  );
}

function Code({ lines, delay = 0.4 }: { lines: string[]; delay?: number }) {
  return (
    <motion.pre
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="text-[12.5px] leading-relaxed font-mono bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white/85 whitespace-pre overflow-hidden"
    >
      {lines.map((l, i) => {
        const hash = l.indexOf('#');
        return (
          <div key={i}>
            {hash >= 0 ? (
              <>
                {l.slice(0, hash)}
                <span className="text-white/40">{l.slice(hash)}</span>
              </>
            ) : (
              l || ' '
            )}
          </div>
        );
      })}
    </motion.pre>
  );
}

function FitBadge({ children, color = '#4ade80', delay = 1.4 }: { children: ReactNode; color?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 18 }}
      className="px-3 py-1 rounded-full border text-[13px] font-semibold"
      style={{ borderColor: `${color}66`, background: `${color}18`, color }}
    >
      {children}
    </motion.div>
  );
}

function FinalCard({ who, text, delay = 1.2 }: { who: Who; text: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 240, damping: 20 }}
      className="px-4 py-2 rounded-xl border-2 max-w-2xl text-[14px] text-white"
      style={{ borderColor: `${ACCENT}88`, background: '#0e2a33' }}
    >
      <span className="text-[12px] font-bold uppercase tracking-wide mr-2" style={{ color: ACCENT }}>
        📬 Final answer {who !== 'you' ? `from ${TEAM[who].name}` : ''}
      </span>
      {text}
    </motion.div>
  );
}

// ---------- Scene: intro ----------

const shapes = [
  { icon: '🏭', name: 'Assembly line', like: 'like a car factory', bots: ['researcher', 'writer', 'critic'] as Who[], join: '→', does: 'Pass the work down the line' },
  { icon: '👨‍🍳', name: 'Boss & helpers', like: 'like a head chef', bots: ['boss', 'researcher', 'math'] as Who[], join: '↘', does: 'The boss decides who works' },
  { icon: '🛎️', name: 'Receptionist', like: 'like a hospital front desk', bots: ['receptionist', 'math'] as Who[], join: '→', does: 'Send it to exactly ONE expert' },
  { icon: '📝', name: 'Writer & critic', like: 'like a teacher marking homework', bots: ['writer', 'critic'] as Who[], join: '⇄', does: 'Fix it until it’s good' },
];

function IntroScene() {
  return (
    <Scene>
      <SceneLabel>What you’ll learn</SceneLabel>
      <h2 className="text-3xl font-bold text-white">Four Team Shapes</h2>
      <p className="text-[15px] text-white/60 -mt-1">Same robots. Four different ways to pass the notes.</p>
      <div className="grid grid-cols-4 gap-3 w-full max-w-4xl mt-1">
        {shapes.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.2 }}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-3 flex flex-col items-center text-center"
          >
            <div className="text-3xl">{s.icon}</div>
            <div className="text-[15px] font-bold text-white mt-1">{i + 1}. {s.name}</div>
            <div className="text-[12px] text-white/50">{s.like}</div>
            <div className="flex items-end gap-0.5 my-2">
              {s.bots.map((b, j) => (
                <div key={j} className="flex items-center">
                  {j > 0 && <span className="text-white/40 text-sm mx-0.5 mb-5">{s.join}</span>}
                  <Bot who={b} size={40} hideRole />
                </div>
              ))}
            </div>
            <div className="text-[13px] font-medium" style={{ color: ACCENT }}>{s.does}</div>
          </motion.div>
        ))}
      </div>
      <Callout delay={1.2}>
        Under the hood it’s always the same: <b>every agent is one LLM call with its own system prompt</b>. Our code carries the
        notes from one agent to the next. No magic.
      </Callout>
    </Scene>
  );
}

// ---------- Shape 1: Assembly line ----------

const lineBots = (active: Who | null, done: Who[] = []) =>
  (['researcher', 'writer', 'critic'] as Who[]).map((w, i) => ({
    who: w,
    x: 22 + i * 28,
    y: 150,
    active: active === w,
    dimmed: active !== null && active !== w && !done.includes(w),
    mood: done.includes(w) ? ('proud' as const) : undefined,
  }));

const lineArrows = [
  { from: { x: 28, y: 190 }, to: { x: 44, y: 190 }, color: ACCENT },
  { from: { x: 56, y: 190 }, to: { x: 72, y: 190 }, color: ACCENT },
];

function Belt() {
  return (
    <div className="absolute left-[8%] right-[8%] rounded-full overflow-hidden" style={{ top: 272, height: 12, background: '#1e293b' }}>
      <motion.div
        className="h-full w-[200%]"
        style={{ background: 'repeating-linear-gradient(90deg, #334155 0 14px, #1e293b 14px 28px)' }}
        animate={{ x: ['-50%', '0%'] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
      />
    </div>
  );
}

function LineIdeaScene() {
  return (
    <Scene>
      <SceneLabel>Shape 1 · The assembly line (a pipeline)</SceneLabel>
      <Picture
        items={[
          { icon: '🔩', label: 'build frame' },
          { icon: '🚪', label: 'add doors' },
          { icon: '🎨', label: 'paint' },
          { icon: '🚗', label: 'car done!', hot: true },
        ]}
      />
      <div className="w-full max-w-3xl">
        <Stage height={290} bots={lineBots(null)} arrows={lineArrows}>
          <Belt />
          {['1. find facts', '2. write it', '3. polish it'].map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.3 }}
              className="absolute text-[13px] font-semibold text-white/80 -translate-x-1/2"
              style={{ left: `${22 + i * 28}%`, top: 100 }}
            >
              {t}
            </motion.div>
          ))}
          <motion.div
            className="absolute text-2xl"
            style={{ top: 238 }}
            initial={{ left: '8%' }}
            animate={{ left: ['8%', '88%'] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          >
            📄
          </motion.div>
        </Stage>
      </div>
      <Callout>
        Each station does <b>one job</b> and passes the work on, like a relay race baton 🏃. The order is always the same:
        the line itself <i>is</i> the plan.
      </Callout>
    </Scene>
  );
}

function LineRunScene({ part }: { part: 1 | 2 }) {
  const notes =
    part === 1
      ? [
          {
            id: 'r1',
            from: { x: 22, y: 170 },
            to: { x: 36, y: 20 },
            title: 'Rita → Wally',
            text: 'Octopus facts: 3 hearts, blue blood, 8 arms, can change colour.',
            color: C.rita,
          },
        ]
      : [
          {
            id: 'r1',
            from: { x: 36, y: 20 },
            to: { x: 36, y: 20 },
            title: 'Rita → Wally',
            text: 'Octopus facts: 3 hearts, blue blood, 8 arms, can change colour.',
            color: C.rita,
            delay: 0,
          },
          {
            id: 'w1',
            from: { x: 50, y: 170 },
            to: { x: 64, y: 20 },
            title: 'Wally → Cora',
            text: 'Did you know? An octopus has 3 hearts and BLUE blood! It can change colour to hide.',
            color: C.wally,
            delay: 0.4,
          },
        ];
  return (
    <Scene>
      <SceneLabel>Shape 1 · Assembly line in action</SceneLabel>
      <div className="flex items-center gap-3">
        <TaskCard text="Make a fun fact card about octopuses" />
        <CallCounter count={part === 1 ? 1 : 3} />
      </div>
      <div className="w-full max-w-3xl">
        <Stage
          height={275}
          bots={part === 1 ? lineBots('researcher') : lineBots('writer', ['researcher'])}
          arrows={lineArrows}
          notes={notes}
        />
      </div>
      {part === 1 ? (
        <Code lines={['facts = run_agent(RESEARCHER, task)   # call 1: Rita', 'draft = run_agent(WRITER, facts)     # next: Wally reads her note']} />
      ) : (
        <>
          <FinalCard
            who="critic"
            text="🐙 Did you know? An octopus has three hearts and blue blood, and it changes colour to hide!"
            delay={1.5}
          />
          <FitBadge delay={2}>👍 Good when the steps are always the same: 3 calls, same order, every time</FitBadge>
        </>
      )}
    </Scene>
  );
}

// ---------- Shape 2: Boss & helpers ----------

const helperXs: Record<string, number> = { researcher: 14, math: 38, writer: 62, critic: 86 };

function bossBots(opts: { boss?: 'thinking' | 'working' | 'proud' | 'happy'; bossActive?: boolean; used?: Who[]; activeHelpers?: boolean }) {
  const used = opts.used;
  return [
    { who: 'boss' as Who, x: 50, y: 0, mood: opts.boss, active: opts.bossActive },
    ...(['researcher', 'math', 'writer', 'critic'] as Who[]).map((w) => ({
      who: w,
      x: helperXs[w],
      y: 185,
      active: !!(opts.activeHelpers && used?.includes(w)),
      dimmed: used ? !used.includes(w) : false,
      mood: used && !used.includes(w) ? ('sleeping' as const) : undefined,
    })),
  ];
}

function bossArrows(used?: Who[], up = false) {
  return (['researcher', 'math', 'writer', 'critic'] as Who[]).map((w) => {
    const top = { x: 50, y: 120 };
    const bottom = { x: helperXs[w], y: 182 };
    return {
      from: up ? bottom : top,
      to: up ? top : bottom,
      color: used && used.includes(w) ? whoColor(w) : '#94a3b8',
      dashed: !used || !used.includes(w),
      dim: used ? !used.includes(w) : false,
    };
  });
}

function BossIdeaScene() {
  return (
    <Scene>
      <SceneLabel>Shape 2 · Boss & helpers (an orchestrator)</SceneLabel>
      <Picture
        items={[
          { icon: '🧾', label: '“2 pizzas, 1 salad!”' },
          { icon: '👨‍🍳', label: 'head chef reads it', hot: true },
          { icon: '🍕', label: 'pizza cook' },
          { icon: '🥗', label: 'salad cook' },
        ]}
      />
      <div className="w-full max-w-3xl">
        <Stage height={300} bots={bossBots({ boss: 'thinking', bossActive: true })} arrows={bossArrows()} />
      </div>
      <Callout>
        Max 👑 doesn’t do the work himself. He <b>reads the request</b>, <b>decides who to ask</b>, collects their answers, and
        writes the final reply.
      </Callout>
    </Scene>
  );
}

function BossPlanScene() {
  return (
    <Scene>
      <SceneLabel>Shape 2 · Max plans with tool calls</SceneLabel>
      <div className="flex items-center gap-3">
        <TaskCard text="Plan a party for 8 friends: cake cost + an invite" />
        <CallCounter count={1} />
      </div>
      <div className="flex gap-5 w-full max-w-5xl items-center">
        <div className="flex-1 min-w-0">
          <Stage height={300} size={64} bots={bossBots({ boss: 'thinking', bossActive: true, used: ['math', 'writer'] })} arrows={bossArrows(['math', 'writer'])} />
        </div>
        <div className="w-[360px] shrink-0 flex flex-col gap-2">
          <div className="text-[12px] text-white/50">Max’s LLM reply (not text: tool calls!)</div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-lg border bg-black/40 px-3 py-2 font-mono text-[12.5px] leading-relaxed"
            style={{ borderColor: `${C.max}66` }}
          >
            <div className="text-white/40">tool_calls:</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <span style={{ color: C.milo }}>ask_math_whiz</span>
              <span className="text-white/80">(“8 slices at $3. Total?”)</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
              <span style={{ color: C.wally }}>ask_writer</span>
              <span className="text-white/80">(“Fun invite: Saturday 3pm, park”)</span>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="rounded-lg border px-3 py-2 text-[13px] text-white/85"
            style={{ borderColor: `${ACCENT}55`, background: `${ACCENT}10` }}
          >
            🔧 <b>Tool calling from Part 2!</b> Max’s tools are other agents:
            <div className="font-mono text-[12px] mt-1 text-white/70">
              ask_researcher · ask_writer · ask_math_whiz · ask_critic
            </div>
            <div className="mt-1">
              Each tool just runs <span className="font-mono text-[12px]">run_agent(helper_prompt, task)</span>.
            </div>
          </motion.div>
        </div>
      </div>
    </Scene>
  );
}

function BossCollectScene() {
  return (
    <Scene>
      <SceneLabel>Shape 2 · Helpers work, answers come back</SceneLabel>
      <div className="flex items-center gap-3">
        <TaskCard text="Plan a party for 8 friends: cake cost + an invite" />
        <CallCounter count={3} />
      </div>
      <div className="w-full max-w-3xl">
        <Stage
          height={300}
          bots={bossBots({ boss: 'working', used: ['math', 'writer'], activeHelpers: true })}
          arrows={bossArrows(['math', 'writer'], true)}
          notes={[
            { id: 'm', from: { x: 38, y: 200 }, to: { x: 22, y: 20 }, title: 'Milo → Max', text: '8 × $3 = $24 for the cake.', color: C.milo, delay: 0.5 },
            { id: 'w', from: { x: 62, y: 200 }, to: { x: 78, y: 12 }, title: 'Wally → Max', text: '🎉 You’re invited! Saturday 3pm at the park. Bring your smile!', color: C.wally, delay: 1.1 },
          ]}
        />
      </div>
      <Callout delay={1.8}>
        Rita and Cora are asleep 💤: <b>this</b> request didn’t need them. Max only calls the helpers he picked.
      </Callout>
    </Scene>
  );
}

function BossFinalScene() {
  return (
    <Scene>
      <SceneLabel>Shape 2 · Max puts it together</SceneLabel>
      <div className="flex items-center gap-4">
        <Bot who="boss" size={84} mood="proud" active />
        <div className="flex flex-col gap-2 items-start">
          <CallCounter count={4} />
          <div className="text-[13px] text-white/60">1 plan + 2 helpers + 1 final reply = 4 calls</div>
        </div>
      </div>
      <FinalCard
        who="boss"
        delay={0.4}
        text="Party plan! 🎂 The cake for 8 costs $24. Invite: “You’re invited! Saturday 3pm at the park. Bring your smile!”"
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="w-full max-w-3xl">
        <div className="text-[13px] text-white/50 mb-1 text-center">A different request gets different helpers:</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { q: 'Is a tomato a fruit?', calls: ['researcher'] as Who[] },
            { q: 'Write a poem and check it', calls: ['writer', 'critic'] as Who[] },
          ].map((r) => (
            <div key={r.q} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <span className="text-[13px] text-white/85 flex-1">“{r.q}”</span>
              <span className="text-white/40">→</span>
              {r.calls.map((w) => (
                <span key={w} className="text-[12px] font-semibold px-2 py-0.5 rounded-full" style={{ color: whoColor(w), background: `${whoColor(w)}22` }}>
                  {whoBadge(w)} {whoName(w)}
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
      <FitBadge delay={1.6}>👍 Good when the steps change from request to request</FitBadge>
    </Scene>
  );
}

// ---------- Shape 3: Receptionist / router ----------

function RouterIdeaScene() {
  return (
    <Scene>
      <SceneLabel>Shape 3 · The receptionist (a router)</SceneLabel>
      <Picture
        items={[
          { icon: '🤒', label: '“My tooth hurts!”' },
          { icon: '🛎️', label: 'front desk', hot: true },
          { icon: '🦷', label: 'dentist ✅', hot: true },
        ]}
      />
      <div className="flex gap-2 -mt-1 text-[12px] text-white/40">
        <span>👁️ eye doctor: not called</span>·<span>🦴 bone doctor: not called</span>
      </div>
      <div className="w-full max-w-3xl">
        <Stage
          height={280}
          size={66}
          bots={[
            { who: 'receptionist', x: 22, y: 90, active: true, mood: 'thinking' },
            { who: 'math', x: 66, y: 0, role: 'math door' },
            { who: 'researcher', x: 66, y: 150, role: 'facts door' },
            { who: 'writer', x: 88, y: 75, role: 'stories door' },
          ]}
          arrows={[
            { from: { x: 30, y: 125 }, to: { x: 60, y: 45 }, color: C.milo, dashed: true },
            { from: { x: 30, y: 135 }, to: { x: 60, y: 190 }, color: C.rita, dashed: true },
            { from: { x: 30, y: 130 }, to: { x: 81, y: 118 }, color: C.wally, dashed: true },
          ]}
        />
      </div>
      <Callout>
        Rosa 🛎️ doesn’t answer the question. She reads it and sends it to <b>exactly ONE</b> specialist: Milo for math, Rita
        for facts, Wally for stories.
      </Callout>
    </Scene>
  );
}

function RouterRunScene() {
  const examples = [
    { q: 'What is 15 × 12?', label: 'math', who: 'math' as const },
    { q: 'Who painted the Mona Lisa?', label: 'facts', who: 'researcher' as const },
    { q: 'Tell me a story about a cat', label: 'story', who: 'writer' as const },
  ];
  return (
    <Scene>
      <SceneLabel>Shape 3 · Rosa routes one question</SceneLabel>
      <div className="flex items-center gap-3">
        <TaskCard text="What is 15 × 12?" />
        <CallCounter count={2} />
      </div>
      <div className="flex gap-5 w-full max-w-5xl items-center">
        <div className="flex-1 min-w-0">
          <Stage
            height={310}
            size={60}
            bots={[
              { who: 'receptionist', x: 16, y: 100, mood: 'proud' },
              { who: 'math', x: 62, y: 0, active: true },
              { who: 'researcher', x: 62, y: 105, dimmed: true, mood: 'sleeping' },
              { who: 'writer', x: 62, y: 210, dimmed: true, mood: 'sleeping' },
            ]}
            arrows={[
              { from: { x: 24, y: 130 }, to: { x: 55, y: 40 }, color: C.milo },
              { from: { x: 24, y: 140 }, to: { x: 55, y: 145 }, color: '#94a3b8', dashed: true, dim: true },
              { from: { x: 24, y: 150 }, to: { x: 55, y: 245 }, color: '#94a3b8', dashed: true, dim: true },
            ]}
            notes={[
              { id: 'rosa', from: { x: 16, y: 120 }, to: { x: 30, y: 10 }, title: 'Rosa’s reply', text: 'math', color: C.rosa, width: 120, delay: 0.4 },
              { id: 'milo', from: { x: 62, y: 30 }, to: { x: 86, y: 20 }, title: 'Milo → You', text: '15 × 12 = 180', color: C.milo, tone: 'final', width: 140, delay: 1.3 },
            ]}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="w-[340px] shrink-0 flex flex-col gap-2"
        >
          <div className="text-[12px] text-white/50">Rosa’s whole job: reply with ONE word.</div>
          {examples.map((e, i) => (
            <div
              key={e.q}
              className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
              style={{ borderColor: i === 0 ? `${TEAM[e.who].color}88` : 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
            >
              <span className="text-[13px] text-white/85 flex-1">“{e.q}”</span>
              <span className="font-mono text-[12px] px-1.5 rounded" style={{ color: C.rosa, background: `${C.rosa}1f` }}>{e.label}</span>
              <span className="text-white/40">→</span>
              <span className="text-[12px] font-semibold" style={{ color: TEAM[e.who].color }}>
                {TEAM[e.who].badge} {TEAM[e.who].name}
              </span>
            </div>
          ))}
          <div className="rounded-lg border px-3 py-2 text-[13px] text-white/85" style={{ borderColor: '#4ade8055', background: '#4ade8012' }}>
            💰 Always <b>2 calls</b>: Rosa’s one-word label + one expert. <b>Cheap and fast.</b> Nobody else wakes up.
          </div>
        </motion.div>
      </div>
    </Scene>
  );
}

// ---------- Shape 4: Writer & critic loop ----------

function RoundCounter({ round, max = 3, done }: { round: number; max?: number; done?: 'approved' | 'stopped' }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] text-white/60">Round</span>
      {Array.from({ length: max }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0.6 }}
          animate={{ scale: i + 1 === round ? 1.15 : 1 }}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold border"
          style={{
            borderColor: i < round ? C.cora : 'rgba(255,255,255,0.2)',
            background: i < round ? `${C.cora}30` : 'transparent',
            color: i < round ? '#fff' : 'rgba(255,255,255,0.4)',
          }}
        >
          {i + 1}
        </motion.span>
      ))}
      <span className="text-[13px] text-white/60">of {max}</span>
      {done === 'approved' && <FitBadge delay={1.8}>✅ APPROVED: loop stops</FitBadge>}
      {done === 'stopped' && <FitBadge color="#f87171" delay={0.3}>🛑 limit reached: stop</FitBadge>}
    </div>
  );
}

function CriticIdeaScene() {
  return (
    <Scene>
      <SceneLabel color={C.cora}>Shape 4 · Writer & critic (a reflection loop)</SceneLabel>
      <Picture
        items={[
          { icon: '📄', label: 'homework' },
          { icon: '🖍️', label: 'teacher marks it red' },
          { icon: '✏️', label: 'student fixes it' },
          { icon: '🅰️', label: 'good to go!', hot: true },
        ]}
      />
      <div className="w-full max-w-2xl">
        <Stage
          height={270}
          size={76}
          bots={[
            { who: 'writer', x: 25, y: 70, active: true },
            { who: 'critic', x: 75, y: 70, mood: 'thinking' },
          ]}
          arrows={[
            { from: { x: 34, y: 95 }, to: { x: 66, y: 95 }, color: C.wally },
            { from: { x: 66, y: 150 }, to: { x: 34, y: 150 }, color: C.cora },
          ]}
        >
          <div className="absolute -translate-x-1/2 text-[13px] font-semibold" style={{ left: '50%', top: 68, color: C.wally }}>
            draft ✍️
          </div>
          <div className="absolute -translate-x-1/2 text-[13px] font-semibold" style={{ left: '50%', top: 158, color: C.cora }}>
            red-pen notes 🖍️
          </div>
          <motion.div
            className="absolute -translate-x-1/2 text-3xl"
            style={{ left: '50%', top: 105 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          >
            🔁
          </motion.div>
        </Stage>
      </div>
      <Callout color={C.cora}>
        Wally writes, Cora reviews it with a red pen, Wally fixes it… and round they go until Cora says <b>“APPROVED”</b>.
      </Callout>
    </Scene>
  );
}

function CriticRoundScene({ round }: { round: 1 | 2 }) {
  const draft1 = 'A dragon lived in a cave. It was big. The end.';
  const draft2 = 'Ember the dragon was scared of the dark, so every night she sneezed tiny sparks to light up her cave.';
  return (
    <Scene>
      <SceneLabel color={C.cora}>Shape 4 · Round {round}</SceneLabel>
      <div className="flex items-center gap-3">
        <TaskCard text="Write a tiny story about a dragon" />
        <CallCounter count={round * 2} />
      </div>
      <RoundCounter round={round} done={round === 2 ? 'approved' : undefined} />
      <div className="w-full max-w-3xl">
        <Stage
          height={300}
          size={74}
          bots={[
            { who: 'writer', x: 18, y: 80, active: true, mood: round === 2 ? 'proud' : 'working' },
            { who: 'critic', x: 82, y: 80, mood: round === 2 ? 'proud' : 'thinking' },
          ]}
          arrows={[
            { from: { x: 27, y: 105 }, to: { x: 73, y: 105 }, color: C.wally },
            { from: { x: 73, y: 160 }, to: { x: 27, y: 160 }, color: C.cora },
          ]}
          notes={[
            {
              id: `d${round}`,
              from: { x: 18, y: 100 },
              to: { x: 50, y: 0 },
              title: `Wally → Cora · draft ${round}`,
              text: round === 1 ? draft1 : draft2,
              color: C.wally,
              width: 330,
              delay: 0.3,
            },
            round === 1
              ? {
                  id: 'rev1',
                  from: { x: 82, y: 120 },
                  to: { x: 50, y: 190 },
                  title: 'Cora → Wally · review',
                  text: '❌ Too short and a bit boring. Give the dragon a name and a problem.',
                  color: C.cora,
                  tone: 'red' as const,
                  width: 330,
                  delay: 1.3,
                }
              : {
                  id: 'rev2',
                  from: { x: 82, y: 120 },
                  to: { x: 50, y: 190 },
                  title: 'Cora → Wally · review',
                  text: 'APPROVED ✅ Lovely name, a real problem, and a clever fix.',
                  color: '#4ade80',
                  tone: 'green' as const,
                  width: 330,
                  delay: 1.3,
                },
          ]}
        />
      </div>
      <Code
        delay={1.6}
        lines={
          round === 1
            ? ['review = run_agent(CRITIC, draft)', 'draft = run_agent(WRITER, draft + "\\nFix this: " + review)   # go again']
            : ['if "APPROVED" in review:', '    break   # our code sees the magic word and stops the loop']
        }
      />
    </Scene>
  );
}

function CriticLimitScene() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((v) => (v < 99 ? v + 2 : v)), 300);
    return () => clearInterval(t);
  }, []);
  return (
    <Scene>
      <SceneLabel color="#f87171">Shape 4 · Why a round limit matters</SceneLabel>
      <div className="grid grid-cols-2 gap-5 w-full max-w-5xl">
        <div className="rounded-xl border border-red-400/30 bg-red-400/[0.06] p-3 flex flex-col items-center gap-2">
          <div className="text-[15px] font-bold text-red-300">😬 No limit + a picky critic</div>
          <div className="flex items-center gap-3">
            <Bot who="writer" size={56} mood="tired" hideRole />
            <motion.span className="text-2xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>🔁</motion.span>
            <Bot who="critic" size={56} mood="confused" hideRole />
          </div>
          <div className="flex flex-wrap justify-center gap-1 max-w-[380px] min-h-[52px]">
            {Array.from({ length: Math.min(Math.floor(n / 2), 16) }).map((_, i) => (
              <span key={i} className="text-[12px] px-1.5 py-0.5 rounded bg-red-400/20 text-red-200">❌ {i + 1}</span>
            ))}
          </div>
          <div className="text-[14px] text-white/85">
            API calls: <b className="text-red-300 tabular-nums">{n}{n >= 99 ? '+ …' : ''}</b> · 💸 the bill keeps growing
          </div>
        </div>
        <div className="rounded-xl border p-3 flex flex-col items-center gap-2" style={{ borderColor: '#4ade8055', background: '#4ade800f' }}>
          <div className="text-[15px] font-bold text-green-300">🛑 With MAX_ROUNDS = 3</div>
          <RoundCounter round={3} done="stopped" />
          <div className="flex gap-1">
            {[1, 2, 3].map((r) => (
              <span key={r} className="text-[12px] px-1.5 py-0.5 rounded bg-red-400/20 text-red-200">❌ round {r}</span>
            ))}
            <span className="text-[12px] px-1.5 py-0.5 rounded bg-green-400/20 text-green-200">→ stop</span>
          </div>
          <div className="text-[14px] text-white/85 text-center">
            At most <b>6 calls</b>. We keep Wally’s latest draft, which is still better than draft 1.
          </div>
        </div>
      </div>
      <Code
        delay={0.6}
        lines={[
          'MAX_ROUNDS = 3',
          'for round in range(1, MAX_ROUNDS + 1):',
          '    review = run_agent(CRITIC, draft)',
          '    if "APPROVED" in review:',
          '        break                       # happy critic: stop early',
          '    draft = run_agent(WRITER, draft + "\\nFix this: " + review)',
          '# after the loop: use draft, approved or not',
        ]}
      />
    </Scene>
  );
}

// ---------- Compare, whiteboard, warning ----------

const compareRows = [
  { icon: '🏭', name: 'Assembly line', who: 'Rita → Wally → Cora', when: 'The steps are always the same', calls: 'one per station (3)', color: C.rita },
  { icon: '👑', name: 'Boss & helpers', who: 'Max + chosen helpers', when: 'The steps change per request', calls: 'plan + helpers + final (3–6)', color: C.max },
  { icon: '🛎️', name: 'Receptionist', who: 'Rosa → ONE expert', when: 'Each question needs one expert', calls: 'always 2: cheapest', color: C.rosa },
  { icon: '📝', name: 'Writer & critic', who: 'Wally ⇄ Cora', when: 'Quality matters: polish until good', calls: '2 per round (limit it!)', color: C.cora },
];

function CompareScene() {
  return (
    <Scene>
      <SceneLabel>Which shape should I use?</SceneLabel>
      <div className="w-full max-w-4xl rounded-xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-[1.3fr_1.3fr_1.6fr_1.3fr] text-[12px] uppercase tracking-wide text-white/50 bg-white/[0.05] px-4 py-2">
          <div>Shape</div>
          <div>Who</div>
          <div style={{ color: ACCENT }}>Use it when…</div>
          <div>API calls</div>
        </div>
        {compareRows.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.25 }}
            className="grid grid-cols-[1.3fr_1.3fr_1.6fr_1.3fr] items-center px-4 py-3 border-t border-white/10 text-[14px]"
            style={{ borderLeft: `4px solid ${r.color}` }}
          >
            <div className="font-bold text-white">{r.icon} {r.name}</div>
            <div className="text-white/70">{r.who}</div>
            <div className="text-white font-medium">{r.when}</div>
            <div className="text-white/70">{r.calls}</div>
          </motion.div>
        ))}
      </div>
      <Callout delay={1.4}>
        Real apps often <b>mix shapes</b>: a receptionist in front, and one of its experts is itself a writer & critic loop.
      </Callout>
    </Scene>
  );
}

function WhiteboardScene() {
  const entries = [
    { who: 'researcher' as const, text: 'Saturday: sunny, 24°C ☀️' },
    { who: 'math' as const, text: 'Food for 6 at $5 each = $30' },
    { who: 'researcher' as const, text: 'Park has a big field for games' },
  ];
  return (
    <Scene>
      <SceneLabel>Bonus idea · The shared whiteboard (shared memory)</SceneLabel>
      <TaskCard text="Plan a picnic for 6 friends" />
      <div className="flex gap-6 w-full max-w-5xl items-center">
        <div className="flex flex-col gap-3 items-center">
          <Bot who="researcher" size={58} active hideRole />
          <Bot who="math" size={58} active hideRole />
        </div>
        <div className="text-white/40 text-2xl">✏️→</div>
        <div className="flex-1 rounded-xl border-4 border-slate-400/60 bg-slate-100 px-4 py-3 min-h-[200px] shadow-inner">
          <div className="text-[13px] font-bold text-slate-700 mb-2">📋 SHARED NOTES</div>
          {entries.map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.7 }}
              className="text-[14px] text-slate-800 mb-1.5 font-medium"
            >
              <span className="font-bold" style={{ color: TEAM[e.who].color === C.rita ? '#1d4ed8' : '#6d28d9' }}>
                {TEAM[e.who].name}:
              </span>{' '}
              {e.text}
            </motion.div>
          ))}
        </div>
        <motion.div className="text-white/40 text-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }}>
          👀→
        </motion.div>
        <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }}>
          <Bot who="writer" size={64} active role="reads it all" />
        </motion.div>
      </div>
      <div className="flex gap-4 items-center w-full max-w-5xl">
        <Code
          delay={0.8}
          lines={[
            'board = []                                        # the shared whiteboard',
            'board.append(run_agent(RESEARCHER, "Weather on Saturday?"))',
            'board.append(run_agent(MATH_WHIZ, "Food for 6 at $5 each?"))',
            'plan = run_agent(WRITER, "Plan a picnic using:\\n" + "\\n".join(board))',
          ]}
        />
        <Callout delay={2.8}>
          No magic memory: it’s <b>a plain list</b> our code keeps and pastes into each prompt. Everyone sees what the others
          found, so nobody repeats work.
        </Callout>
      </div>
    </Scene>
  );
}

function WarningScene() {
  const costs: { name: string; calls: number; label: string; color: string }[] = [
    { name: 'Solo Bot', calls: 1, label: '1', color: TEAM.solo.color },
    { name: 'Receptionist', calls: 2, label: '2', color: C.rosa },
    { name: 'Assembly line', calls: 3, label: '3', color: C.rita },
    { name: 'Boss & helpers', calls: 5, label: '3–6', color: C.max },
    { name: 'Writer & critic', calls: 6, label: 'up to 6', color: C.cora },
  ];
  const chain: { who: Who; text: string }[] = [
    { who: 'researcher', text: 'Octopus has 2 hearts' },
    { who: 'writer', text: 'Wow! 2 hearts!' },
    { who: 'critic', text: 'Looks great ✅' },
  ];
  return (
    <Scene>
      <SceneLabel color="#fbbf24">An honest warning</SceneLabel>
      <div className="grid grid-cols-2 gap-5 w-full max-w-5xl">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-[15px] font-bold text-white mb-2">📞 More agents = more calls = more cost & waiting</div>
          {costs.map((c, i) => (
            <div key={c.name} className="flex items-center gap-2 mb-1.5">
              <span className="w-[120px] text-[13px] text-white/75 shrink-0">{c.name}</span>
              <div className="flex gap-1">
                {Array.from({ length: c.calls }).map((_, j) => (
                  <motion.span
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.2 + j * 0.06 }}
                    className="w-5 h-5 rounded-md text-[11px] flex items-center justify-center"
                    style={{ background: `${c.color}33`, border: `1px solid ${c.color}88` }}
                  >
                    📞
                  </motion.span>
                ))}
              </div>
              <span className="text-[12px] text-white/50 ml-1">{c.label}</span>
            </div>
          ))}
          <div className="text-[12px] text-white/50 mt-1">Each call takes a few seconds and costs a little money.</div>
        </div>
        <div className="rounded-xl border border-red-400/30 bg-red-400/[0.05] p-3 flex flex-col">
          <div className="text-[15px] font-bold text-white mb-2">🧩 More agents = more places to go wrong</div>
          <div className="flex items-start justify-between gap-1">
            {chain.map((c, i) => (
              <div key={i} className="flex items-start gap-1">
                {i > 0 && <span className="text-red-300 mt-6">→</span>}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.6 }}
                  className="flex flex-col items-center"
                >
                  <Bot who={c.who} size={46} hideRole mood={i === 0 ? 'confused' : 'happy'} />
                  <div className="mt-1 text-[12px] px-2 py-1 rounded bg-[#ffe4e6] text-[#9f1239] font-medium text-center w-[110px]">
                    {c.text}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4 }}
            className="text-[13px] text-red-200 mt-2 text-center"
          >
            Rita’s one wrong fact (it’s really 3!) travels all the way to the final answer.
          </motion.div>
        </div>
      </div>
      <Callout color="#fbbf24" delay={2.8}>
        💡 Start with <b>one</b> agent. Add teammates only when it clearly helps, and pick the <b>simplest shape</b> that fits.
      </Callout>
    </Scene>
  );
}

// ---------- Takeaways ----------

const takeaways = [
  { text: 'Four shapes: assembly line (fixed steps), boss & helpers (steps change), receptionist (one expert), writer & critic (loop with a limit).', color: ACCENT },
  { text: 'Under the hood each agent is just an LLM call. Our code passes the notes, and a boss uses tool calling where the tools are agents.', color: C.max },
  { text: 'More agents = more calls, cost and places to go wrong. Pick the simplest shape that fits the request.', color: '#f87171' },
];

function TakeawaysScene() {
  return (
    <Scene>
      <h2 className="text-4xl font-bold text-white mb-2">What you learned</h2>
      <div className="max-w-2xl w-full">
        {takeaways.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.2 }}
            className="flex items-center gap-4 mb-3 px-5 py-3 rounded-xl bg-white/5 border"
            style={{ borderColor: `${t.color}40` }}
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border"
              style={{ color: t.color, borderColor: `${t.color}60`, background: `${t.color}18` }}
            >
              {i + 1}
            </span>
            <span className="text-white/85 text-[15px] font-medium">{t.text}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        {(['researcher', 'writer', 'critic', 'boss', 'math', 'receptionist'] as Who[]).map((w) => (
          <Bot key={w} who={w} size={46} mood="proud" hideRole />
        ))}
      </div>
    </Scene>
  );
}

// ---------- main ----------

export default function TeamShapesAnim() {
  const { currentStep, steps } = useConceptStore();
  const trigger = steps[currentStep]?.animationTrigger ?? 'intro';

  let scene: ReactNode;
  switch (trigger) {
    case 'lineIdea': scene = <LineIdeaScene />; break;
    case 'lineRun1': scene = <LineRunScene part={1} />; break;
    case 'lineRun2': scene = <LineRunScene part={2} />; break;
    case 'bossIdea': scene = <BossIdeaScene />; break;
    case 'bossPlan': scene = <BossPlanScene />; break;
    case 'bossCollect': scene = <BossCollectScene />; break;
    case 'bossFinal': scene = <BossFinalScene />; break;
    case 'routerIdea': scene = <RouterIdeaScene />; break;
    case 'routerRun': scene = <RouterRunScene />; break;
    case 'criticIdea': scene = <CriticIdeaScene />; break;
    case 'criticRound1': scene = <CriticRoundScene round={1} />; break;
    case 'criticRound2': scene = <CriticRoundScene round={2} />; break;
    case 'criticLimit': scene = <CriticLimitScene />; break;
    case 'compare': scene = <CompareScene />; break;
    case 'whiteboard': scene = <WhiteboardScene />; break;
    case 'warning': scene = <WarningScene />; break;
    case 'playground': scene = <TeamShapesPlayground />; break;
    case 'takeaways': scene = <TakeawaysScene />; break;
    default: scene = <IntroScene />;
  }

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
    >
      <div key={trigger} className="absolute inset-0">
        {scene}
      </div>
    </div>
  );
}
