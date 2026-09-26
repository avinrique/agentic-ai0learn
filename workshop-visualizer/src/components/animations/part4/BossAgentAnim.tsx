'use client';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import AgentBot, { TEAM, BotMood } from '@/components/animations/characters/AgentBot';
import { useTracerStore } from '@/stores/tracerStore';
import { bossAgentScenes, type BossScene, type Helper, type NotepadNote, type OrderSlip } from '@/data/traces/part4-boss-agent';

// Lesson 23: The Boss Agent — an office. Max 👑 sits at a big desk with an inbox and
// a tray of order slips (tool_calls). Rita 🔍 and Milo 🧮 sit at their own desks. A slip
// flies to a helper, the helper makes its own mini LLM call, a result note (role "tool")
// flies back, and Max's notepad (the messages list) grows at the bottom.

const ACCENT = '#22d3ee';

const HELPERS: Record<Helper, { bot: { name: string; color: string; badge: string; role: string }; fn: string; param: string; prompt: string }> = {
  rita: {
    bot: TEAM.researcher,
    fn: 'ask_researcher',
    param: 'question',
    prompt: '"You are Rita, a researcher. Answer with short, true facts."',
  },
  milo: {
    bot: TEAM.math,
    fn: 'ask_math_whiz',
    param: 'problem',
    prompt: '"You are Milo, a math whiz. Solve it step by step."',
  },
};

// Where things sit on the stage (percent of the stage box), for the flying slip / note.
const SPOT = {
  max: { left: '6%', top: '64%' },
  rita: { left: '55%', top: '20%' },
  milo: { left: '55%', top: '70%' },
};

const SETUP_PHASES = ['intro', 'runAgent', 'helpers', 'tools', 'phonebook', 'bossPrompt', 'inbox', 'notepad'];

function maxSays(s: BossScene): string {
  const slip = s.current >= 0 ? s.slips[s.current] : undefined;
  const who = slip ? HELPERS[slip.to].bot.name : '';
  if (s.say) return s.say;
  switch (s.phase) {
    case 'intro':
      return "I'm the boss. My tools are my helpers!";
    case 'runAgent':
      return 'Every one of us is built from run_agent.';
    case 'helpers':
      return 'Meet my team →';
    case 'tools':
      return 'My menu: ask_researcher, ask_math_whiz.';
    case 'phonebook':
      return 'The phone book rings the right desk.';
    case 'bossPrompt':
      return "Split it, ask helpers, write the answer. I don't do the work!";
    case 'inbox':
      return 'A new request in my inbox! 📥';
    case 'notepad':
      return `My notepad has ${s.notepad.length} notes.`;
    case 'loop':
      return `Turn ${s.turn}. Time to decide…`;
    case 'thinking':
      return '📞 Asking OpenAI (notepad + menu)…';
    case 'reply':
      return s.slips.length > 0
        ? `I need help: ${s.slips.length} order slip${s.slips.length > 1 ? 's' : ''}!`
        : "I have everything. Here's my answer!";
    case 'check':
      return s.slips.length > 0 ? 'Slips? Yes → not done yet.' : 'No slips → I am done!';
    case 'read':
      return slip ? `Slip ${slip.id} is for ${who}.` : '';
    case 'send':
      return `Go, ${who}!`;
    case 'helperLLM':
      return `Waiting for ${who}…`;
    case 'noteBack':
      return 'A result note is coming back!';
    case 'toolMsg':
      return slip ? `Pinned note ${slip.id} ✔` : '';
    default:
      return 'All done! 🎉';
  }
}

function maxMood(s: BossScene): BotMood {
  if (s.phase === 'thinking' || s.phase === 'loop') return 'thinking';
  if (s.phase === 'read' || s.phase === 'toolMsg' || s.phase === 'check') return 'working';
  if (s.phase === 'final' || s.phase === 'done' || s.phase === 'recap') return 'proud';
  return 'happy';
}

function SlipChip({ slip, active }: { slip: OrderSlip; active: boolean }) {
  const h = HELPERS[slip.to];
  const faded = slip.status === 'sent';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: faded ? 0.45 : 1, scale: active ? 1.03 : 1 }}
      className="rounded-md px-2 py-1 text-[12px] leading-snug"
      style={{
        background: '#fef3c7',
        color: '#1c1c44',
        boxShadow: active ? `0 0 0 2px ${ACCENT}` : 'none',
      }}
    >
      <div className="flex items-center justify-between gap-1 font-mono text-[11px]">
        <span>
          📝 {slip.id} → {h.bot.badge} {h.fn}
        </span>
        <span>{slip.status === 'done' ? '✅' : slip.status === 'sent' ? `at ${h.bot.name}'s desk` : ''}</span>
      </div>
      <div className="truncate">&quot;{slip.arg}&quot;</div>
    </motion.div>
  );
}

function HelperDesk({ who, s }: { who: Helper; s: BossScene }) {
  const h = HELPERS[who];
  const slip = s.current >= 0 ? s.slips[s.current] : undefined;
  const mine = slip?.to === who;
  const working = mine && (s.phase === 'send' || s.phase === 'helperLLM');
  const llm = mine && s.phase === 'helperLLM';
  const answered = mine && s.phase === 'noteBack';
  const focused = s.focus === who;
  const dimmed = !(s.focus === 'all' || s.focus === 'none' || focused);
  const plateGlow = s.phase === 'tools' && (s.focus === 'all' || focused);
  const jobsDone = s.notepad.filter((n) => n.role === 'tool' && n.by === who).length;

  let mood: BotMood = 'happy';
  if (working) mood = 'working';
  else if (answered) mood = 'proud';

  return (
    <div
      className="h-full rounded-xl border px-2 py-1.5 flex gap-2 items-center transition-colors"
      style={{
        borderColor: focused || working ? h.bot.color : 'rgba(255,255,255,0.1)',
        background: working ? `${h.bot.color}14` : 'rgba(255,255,255,0.03)',
      }}
    >
      <AgentBot
        color={h.bot.color}
        badge={h.bot.badge}
        name={h.bot.name}
        role={h.bot.role}
        mood={mood}
        size={54}
        active={working || (focused && s.phase === 'helpers')}
        dimmed={dimmed && !working}
      />
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div
          className="font-mono text-[11px] rounded px-1.5 py-0.5 self-start transition-all"
          style={{
            background: plateGlow ? `${ACCENT}33` : 'rgba(255,255,255,0.06)',
            color: plateGlow ? ACCENT : 'rgba(255,255,255,0.6)',
            boxShadow: plateGlow ? `0 0 0 1px ${ACCENT}` : 'none',
          }}
        >
          🔧 {h.fn}({h.param})
        </div>
        {llm ? (
          <div className="rounded-md border border-dashed px-1.5 py-1 text-[11px]" style={{ borderColor: h.bot.color }}>
            <div className="text-white/60">tool call {slip?.id} contains…</div>
            <motion.div
              className="mt-0.5 rounded px-1.5 py-1 text-[12px] font-semibold text-white"
              style={{ background: `${h.bot.color}33` }}
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              🧠 a whole LLM call: run_agent → OpenAI
            </motion.div>
          </div>
        ) : s.phase === 'helpers' && focused ? (
          <div className="text-[11px] text-white/80 leading-snug">
            <span className="text-white/40">system prompt: </span>
            {h.prompt}
          </div>
        ) : working ? (
          <div className="text-[12px] text-white/80">📝 got slip {slip?.id}. Working…</div>
        ) : answered ? (
          <div className="text-[12px] text-green-300">✅ Done! Sending the answer back.</div>
        ) : (
          <div className="text-[12px] text-white/40">
            {jobsDone > 0 ? `✅ jobs done: ${jobsDone}` : '☕ waiting for an order slip'}
          </div>
        )}
      </div>
    </div>
  );
}

function noteStyle(n: NotepadNote): { bg: string; fg: string; label: string } {
  if (n.role === 'system') return { bg: 'rgba(148,163,184,0.18)', fg: '#cbd5e1', label: `system: ${n.text}` };
  if (n.role === 'user') return { bg: 'rgba(34,211,238,0.15)', fg: '#a5f3fc', label: `user: ${n.text}` };
  if (n.role === 'assistant') return { bg: 'rgba(251,191,36,0.18)', fg: '#fde68a', label: `assistant 👑: ${n.text}` };
  const who = n.by;
  const c = who ? HELPERS[who].bot.color : '#94a3b8';
  return { bg: `${c}26`, fg: '#e0e7ff', label: `tool ${n.id}: ${n.text}` };
}

export default function BossAgentAnim() {
  const { currentStep, activeVariantId } = useTracerStore();
  const scenes = bossAgentScenes[activeVariantId] ?? bossAgentScenes.default;
  const idx = Math.max(0, Math.min(currentStep, scenes.length - 1));
  const s = scenes[idx];
  const prev = idx > 0 ? scenes[idx - 1] : undefined;
  const slip = s.current >= 0 ? s.slips[s.current] : undefined;
  const setup = SETUP_PHASES.includes(s.phase);
  const finished = s.phase === 'final' || s.phase === 'done' || s.phase === 'recap';
  const maxFocus = s.focus === 'max' || s.focus === 'all' || s.focus === 'none';
  const newNote = prev ? s.notepad.length > prev.notepad.length : false;
  const maxBump = prev ? s.maxCalls > prev.maxCalls : false;
  const helperBump = prev ? s.helperCalls > prev.helperCalls : false;

  // The strip under the header: one big idea for this moment.
  let sign: ReactNode = (
    <span>
      📝 order slip = a <b className="text-white">tool_call</b> &nbsp;·&nbsp; 📄 result note = a{' '}
      <b className="text-white">role &quot;tool&quot;</b> message with the same id
    </span>
  );
  if (s.phase === 'intro' || s.phase === 'runAgent')
    sign = (
      <span>
        <b className="text-white">run_agent(system_prompt, task)</b> = 1 LLM call. Max, Rita and Milo are ALL built from it.
      </span>
    );
  else if (s.phase === 'phonebook')
    sign = (
      <span className="font-mono">
        📖 helpers = {'{'} &quot;ask_researcher&quot; → Rita 🔍, &quot;ask_math_whiz&quot; → Milo 🧮 {'}'}
      </span>
    );
  else if (s.phase === 'helperLLM')
    sign = (
      <span>
        🔧 Max&apos;s <b className="text-white">tool call</b> runs a helper, and the helper makes its own{' '}
        <b className="text-white">🧠 LLM call</b> inside it!
      </span>
    );

  return (
    <div className="h-full w-full flex flex-col gap-2 p-3 text-white overflow-hidden" style={{ minHeight: 480 }}>
      {/* Header: title, turn counter, calls-to-OpenAI counter */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-[15px] font-bold">
          🏢 Max&apos;s office{' '}
          <span className="text-[12px] font-normal text-white/40">the boss loop</span>
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          <span
            className="rounded-full px-2 py-0.5 font-semibold"
            style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}55` }}
          >
            🔁 Turn {s.turn || '–'}
          </span>
          <span className="text-white/50">📞 Calls to OpenAI:</span>
          <motion.span
            key={`m${s.maxCalls}`}
            initial={maxBump ? { scale: 1.4 } : false}
            animate={{ scale: 1 }}
            className="rounded-full px-2 py-0.5 font-semibold"
            style={{ background: '#fbbf2426', color: '#fbbf24' }}
          >
            👑 Max {s.maxCalls}
          </motion.span>
          <motion.span
            key={`h${s.helperCalls}`}
            initial={helperBump ? { scale: 1.4 } : false}
            animate={{ scale: 1 }}
            className="rounded-full px-2 py-0.5 font-semibold"
            style={{ background: '#a78bfa26', color: '#c4b5fd' }}
          >
            🔍🧮 Helpers {s.helperCalls}
          </motion.span>
        </div>
      </div>

      {/* The big idea strip */}
      <div
        className="rounded-lg px-3 py-1.5 text-[12.5px] text-white/75 leading-snug"
        style={{ background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.25)' }}
      >
        {sign}
      </div>

      {/* Stage */}
      <div className="relative flex-1 min-h-[250px] flex gap-3">
        {/* Max's big desk */}
        <div
          className="w-[48%] rounded-xl border p-2 flex flex-col gap-1.5 min-h-0 transition-colors"
          style={{
            borderColor: maxFocus && !setup ? '#fbbf2499' : 'rgba(255,255,255,0.12)',
            background: 'rgba(251,191,36,0.05)',
          }}
        >
          {/* inbox */}
          <div
            className="rounded-md px-2 py-1 text-[12px] leading-snug transition-all"
            style={{
              background: s.phase === 'inbox' ? `${ACCENT}22` : 'rgba(255,255,255,0.05)',
              boxShadow: s.phase === 'inbox' ? `0 0 0 1px ${ACCENT}` : 'none',
            }}
          >
            <span className="font-semibold text-white/60">📥 Inbox: </span>
            {s.phase === 'intro' || s.phase === 'runAgent' || s.phase === 'helpers' || s.phase === 'tools' || s.phase === 'phonebook' || s.phase === 'bossPrompt' ? (
              <span className="text-white/30">(empty)</span>
            ) : (
              <span className="text-white/90">&quot;{s.request}&quot;</span>
            )}
          </div>

          <div className="flex items-start gap-2">
            <AgentBot
              color={TEAM.boss.color}
              badge={TEAM.boss.badge}
              name={TEAM.boss.name}
              role={TEAM.boss.role}
              mood={maxMood(s)}
              size={70}
              active={s.focus === 'max' && !finished}
              dimmed={!maxFocus}
            />
            <motion.div
              key={`say-${idx}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mt-2 rounded-xl px-2.5 py-1.5 text-[13px] leading-snug bg-white text-[#1c1c44] font-medium"
            >
              {maxSays(s)}
            </motion.div>
          </div>

          {/* order slip tray */}
          <div className="text-[11px] uppercase tracking-wider text-white/40">
            Order slips (tool_calls) in Max&apos;s reply
          </div>
          <div className="flex flex-col gap-1 min-h-0 overflow-hidden">
            {s.slips.length === 0 ? (
              <div className="text-[12px] text-white/30">
                {s.phase === 'reply' || s.phase === 'check' ? 'none — the reply is the final answer' : '—'}
              </div>
            ) : (
              s.slips.map((sl, i) => <SlipChip key={sl.id} slip={sl} active={i === s.current && s.phase === 'read'} />)
            )}
          </div>
        </div>

        {/* Helper desks */}
        <div className="w-[52%] flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0">
            <HelperDesk who="rita" s={s} />
          </div>
          <div className="flex-1 min-h-0">
            <HelperDesk who="milo" s={s} />
          </div>
        </div>

        {/* A slip flying to a helper, or a result note flying back to Max */}
        {slip && s.phase === 'send' && (
          <motion.div
            key={`fly-${idx}`}
            className="absolute z-20 w-[42%] rounded-md px-2 py-1 text-[12px] shadow-lg pointer-events-none"
            style={{ background: '#fef3c7', color: '#1c1c44' }}
            initial={{ ...SPOT.max, opacity: 0.4, rotate: -6 }}
            animate={{ ...SPOT[slip.to], opacity: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          >
            <div className="font-mono text-[11px]">📝 {slip.id} · {slip.fn}</div>
            <div className="line-clamp-2">&quot;{slip.arg}&quot;</div>
          </motion.div>
        )}
        {slip && s.phase === 'noteBack' && (
          <motion.div
            key={`back-${idx}`}
            className="absolute z-20 w-[44%] rounded-md px-2 py-1 text-[12px] shadow-lg pointer-events-none"
            style={{ background: '#dcfce7', color: '#14301f', border: `2px solid ${HELPERS[slip.to].bot.color}` }}
            initial={{ ...SPOT[slip.to], opacity: 0.4 }}
            animate={{ ...SPOT.max, opacity: 1 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          >
            <div className="font-mono text-[11px]">📄 role: &quot;tool&quot; · tool_call_id: {slip.id}</div>
            <div className="line-clamp-3">{slip.result}</div>
          </motion.div>
        )}

        {/* Final answer card */}
        {finished && s.final && (
          <motion.div
            key={`final-${s.phase === 'recap' ? 'r' : 'f'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-30 left-[4%] right-[4%] top-[18%] rounded-2xl p-3 shadow-2xl"
            style={{ background: '#1c1c44', border: '2px solid #fbbf24' }}
          >
            <div className="text-[12px] uppercase tracking-wider text-amber-300 font-semibold">
              👑 Max&apos;s final answer
            </div>
            <div className="mt-1 text-[15px] leading-snug text-white">{s.final}</div>
            <div className="mt-2 text-[12px] text-white/60">
              Calls to OpenAI: 👑 Max {s.maxCalls} + 🔍🧮 helpers {s.helperCalls} = {s.maxCalls + s.helperCalls}
            </div>
            {s.phase === 'recap' && (
              <ul className="mt-2 text-[13px] text-cyan-100 list-disc pl-5 space-y-0.5">
                <li>A helper agent can be a tool: tool call → the helper&apos;s own LLM call.</li>
                <li>The boss runs the same agent loop from Part 3.</li>
                <li>tool_call_id links each result note to its order slip.</li>
              </ul>
            )}
          </motion.div>
        )}
      </div>

      {/* Max's notepad = the messages list */}
      <div
        className="rounded-xl border px-2 py-1.5 transition-colors"
        style={{
          borderColor: s.phase === 'notepad' || newNote ? `${ACCENT}99` : 'rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        <div className="text-[11px] uppercase tracking-wider text-white/40 mb-1">
          📒 Max&apos;s notepad = messages ({s.notepad.length} notes)
        </div>
        <div className="flex flex-wrap gap-1 min-h-[26px]">
          {s.notepad.length === 0 && <span className="text-[12px] text-white/30">empty</span>}
          {s.notepad.map((n, i) => {
            const st = noteStyle(n);
            const isNew = newNote && i >= (prev?.notepad.length ?? 0);
            return (
              <motion.span
                key={`${i}-${n.role}-${n.id ?? ''}`}
                initial={isNew ? { opacity: 0, y: -10, scale: 0.8 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="rounded px-1.5 py-0.5 text-[12px] max-w-[48%] truncate"
                style={{ background: st.bg, color: st.fg, boxShadow: isNew ? `0 0 0 1.5px ${ACCENT}` : 'none' }}
              >
                {st.label}
              </motion.span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
