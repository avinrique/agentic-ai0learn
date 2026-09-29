'use client';
import { motion } from 'framer-motion';
import AgentBot, { TEAM, BotMood } from '@/components/animations/characters/AgentBot';
import { useTracerStore } from '@/stores/tracerStore';
import { bossAgentScenes, type BossScene, type Helper, type NotepadNote, type OrderSlip } from '@/data/traces/part4-boss-agent';

// Lesson 23: The Boss Agent — an office. Max 👑 sits at a big desk with an inbox and
// a tray of order slips (tool_calls). Rita 🔍 and Milo 🧮 sit at their own desks. A slip
// flies to a helper, the helper makes its own mini LLM call, a result note (role "tool")
// flies back, and Max's notepad (the messages list) grows at the bottom.

const ACCENT = '#22d3ee';

const HELPERS: Record<
  Helper,
  { bot: { name: string; color: string; badge: string; role: string }; fn: string; param: string; prompt: string; desc: string }
> = {
  rita: {
    bot: TEAM.researcher,
    fn: 'ask_researcher',
    param: 'question',
    prompt: '"You are Rita, a researcher. Answer with short, true facts."',
    desc: 'Ask Rita the researcher to find facts.',
  },
  milo: {
    bot: TEAM.math,
    fn: 'ask_math_whiz',
    param: 'problem',
    prompt: '"You are Milo, a math whiz. Solve it step by step."',
    desc: 'Ask Milo the math whiz to do a calculation.',
  },
};

/** The three menu steps, in order: the whole menu, then the descriptions, then the one parameter. */
type MenuPart = 'names' | 'desc' | 'param' | null;

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
      animate={{ opacity: faded ? 0.5 : 1, scale: 1 }}
      className="rounded-md px-3 py-1.5 text-[14px] leading-snug"
      style={{ background: '#fef3c7', color: '#1c1c44', boxShadow: active ? `0 0 0 2px ${ACCENT}` : 'none' }}
    >
      <div className="flex items-center justify-between gap-2 font-mono text-[13px] font-semibold">
        <span className="truncate">📝 {slip.id} → {h.bot.badge} {h.fn}</span>
        {slip.status === 'done' && <span>✅</span>}
      </div>
      <div className="truncate">&quot;{slip.arg}&quot;</div>
    </motion.div>
  );
}

type DeskSize = 'big' | 'mid' | 'small';

function HelperDesk({ who, s, size, menu }: { who: Helper; s: BossScene; size: DeskSize; menu: MenuPart }) {
  const h = HELPERS[who];
  const slip = s.current >= 0 ? s.slips[s.current] : undefined;
  const mine = slip?.to === who;
  const working = mine && (s.phase === 'send' || s.phase === 'helperLLM');
  const llm = mine && s.phase === 'helperLLM';
  const answered = mine && s.phase === 'noteBack';
  const focused = s.focus === who;
  const plateGlow = menu === 'names';
  const paramGlow = menu === 'param' && focused;
  const showPlate = size !== 'small' || s.phase === 'tools';
  const jobsDone = s.notepad.filter((n) => n.role === 'tool' && n.by === who).length;

  let mood: BotMood = 'happy';
  if (working) mood = 'working';
  else if (answered) mood = 'proud';

  const big = size === 'big';
  return (
    <motion.div
      layout
      className={`h-full rounded-xl flex items-center ${big ? 'gap-4 px-4 py-3' : 'gap-3 px-3 py-1.5'}`}
      style={{
        background: big ? `${h.bot.color}12` : 'transparent',
        boxShadow: big ? `inset 0 0 0 1.5px ${h.bot.color}88` : 'none',
      }}
    >
      <AgentBot
        color={h.bot.color}
        badge={h.bot.badge}
        name={h.bot.name}
        mood={mood}
        size={big ? 96 : size === 'mid' ? 64 : 40}
        active={working || (focused && s.phase === 'helpers')}
        dimmed={size === 'small'}
      />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* The order slip lands on this desk (it slides in from Max's side, on its own row above the plate) */}
        {big && slip && mine && s.phase === 'send' && (
          <motion.div
            key={`slip-${slip.id}`}
            className="rounded-md px-3 py-2 text-[15px] leading-snug shadow-lg"
            style={{ background: '#fef3c7', color: '#1c1c44' }}
            initial={{ x: -220, opacity: 0.4, rotate: -6 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          >
            <div className="font-mono text-[13px] font-semibold">📝 {slip.id}</div>
            <div className="line-clamp-2">&quot;{slip.arg}&quot;</div>
          </motion.div>
        )}
        {showPlate && (
          <div
            className={`font-mono rounded px-2 py-0.5 self-start max-w-full break-words ${big ? 'text-[15px]' : 'text-[13px]'}`}
            style={{
              background: plateGlow ? `${ACCENT}33` : 'rgba(255,255,255,0.06)',
              color: plateGlow ? ACCENT : 'rgba(255,255,255,0.6)',
              boxShadow: plateGlow ? `0 0 0 1px ${ACCENT}` : 'none',
            }}
          >
            🔧 {h.fn}(
            <span
              className="rounded px-0.5"
              style={paramGlow ? { background: '#fbbf2440', color: '#fde68a', boxShadow: '0 0 0 1px #fbbf24' } : undefined}
            >
              {h.param}
            </span>
            ){paramGlow && <span className="ml-2 font-sans text-amber-200">📝 one string</span>}
          </div>
        )}
        {menu === 'desc' && (
          <div
            className={`rounded-md px-2 py-1 leading-snug ${big ? 'text-[16px]' : 'text-[13px]'}`}
            style={{
              background: focused ? '#fbbf2426' : 'rgba(255,255,255,0.04)',
              boxShadow: focused ? '0 0 0 1.5px #fbbf24' : 'none',
              color: focused ? '#fde68a' : 'rgba(255,255,255,0.6)',
            }}
          >
            &quot;{h.desc}&quot;
          </div>
        )}
        {big && llm ? (
          <motion.div
            className="rounded-lg px-3 py-2 text-[16px] font-semibold text-white"
            style={{ background: `${h.bot.color}33` }}
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            🧠 its own LLM call: run_agent → OpenAI
          </motion.div>
        ) : big && s.phase === 'helpers' ? (
          <div className="text-[15px] text-white/85 leading-snug">{h.prompt}</div>
        ) : big && answered ? (
          <div className="text-[16px] font-semibold text-green-300">✅ Done!</div>
        ) : !big && jobsDone > 0 ? (
          <div className="text-[13px] text-green-300/80">✅ {jobsDone} done</div>
        ) : null}
      </div>
    </motion.div>
  );
}

function noteStyle(n: NotepadNote): { bg: string; fg: string; label: string } {
  if (n.role === 'system') return { bg: 'rgba(148,163,184,0.18)', fg: '#cbd5e1', label: 'system' };
  if (n.role === 'user') return { bg: 'rgba(34,211,238,0.15)', fg: '#a5f3fc', label: 'user' };
  if (n.role === 'assistant') return { bg: 'rgba(251,191,36,0.18)', fg: '#fde68a', label: `👑 ${n.text}` };
  const c = n.by ? HELPERS[n.by].bot.color : '#94a3b8';
  return { bg: `${c}26`, fg: '#e0e7ff', label: `📄 tool ${n.id}` };
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
  const newNote = prev ? s.notepad.length > prev.notepad.length : false;
  const callsBump = prev ? s.maxCalls + s.helperCalls > prev.maxCalls + prev.helperCalls : false;
  // Which part of the tool menu this step is about (1st menu step: names, 2nd: descriptions, 3rd: the parameter).
  const menuParts: MenuPart[] = ['names', 'desc', 'param'];
  const menu: MenuPart =
    s.phase === 'tools' ? menuParts[Math.min(2, scenes.slice(0, idx).filter((x) => x.phase === 'tools').length)] : null;

  // Who is the focal point of this step?
  const helperFocus: Helper | null = s.focus === 'rita' || s.focus === 'milo' ? s.focus : null;
  const maxFocal = !helperFocus && s.focus !== 'none';
  const deskSize = (who: Helper): DeskSize =>
    helperFocus ? (helperFocus === who ? 'big' : 'small') : s.focus === 'all' ? 'mid' : 'small';

  // The inbox stays on Max's desk, but steps aside while a helper's desk is the focal point.
  const inboxShown = !['intro', 'runAgent', 'helpers', 'tools', 'phonebook', 'bossPrompt'].includes(s.phase) && !helperFocus;
  const inboxBig = s.phase === 'inbox';
  const showSlips = !helperFocus && !setup && (s.slips.length > 0 || s.phase === 'reply' || s.phase === 'check');

  // Where the result note starts (the helper's desk, percent of the stage box); it lands on Max's side.
  const spot = {
    rita: { left: '50%', top: '22%' },
    milo: { left: '50%', top: '46%' },
  };

  return (
    <div className="h-full w-full flex flex-col gap-3 p-4 text-white overflow-hidden" style={{ minHeight: 480 }}>
      {/* Header: title, turn, calls to OpenAI */}
      <div className="flex items-center gap-3">
        <div className="text-[16px] font-bold">🏢 Max&apos;s office</div>
        <div className="ml-auto flex items-center gap-2 text-[13px]">
          {s.turn > 0 && (
            <span className="rounded-full px-2.5 py-0.5 font-semibold" style={{ background: `${ACCENT}1f`, color: ACCENT }}>
              🔁 Turn {s.turn}
            </span>
          )}
          <motion.span
            key={`c${s.maxCalls + s.helperCalls}`}
            initial={callsBump ? { scale: 1.35 } : false}
            animate={{ scale: 1 }}
            className="rounded-full px-2.5 py-0.5 font-semibold bg-white/5 text-white/80"
          >
            📞 OpenAI calls: <span className="text-amber-300">👑 {s.maxCalls}</span> +{' '}
            <span className="text-violet-300">helpers {s.helperCalls}</span>
          </motion.span>
        </div>
      </div>

      {/* One-idea banner, only on the step that introduces the phone book */}
      {s.phase === 'phonebook' && (
        <motion.div
          key={s.phase}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl px-4 py-3 text-center"
          style={{ background: `${ACCENT}12`, boxShadow: `inset 0 0 0 1.5px ${ACCENT}66` }}
        >
          <span className="font-mono text-[15px]">
            📖 &quot;ask_researcher&quot; → Rita 🔍 &nbsp;·&nbsp; &quot;ask_math_whiz&quot; → Milo 🧮
          </span>
        </motion.div>
      )}

      {/* Stage */}
      <div className="relative flex-1 min-h-0 flex gap-4">
        {/* run_agent: the one building block, big, with every agent in the office built from it */}
        {s.phase === 'runAgent' && (
          <motion.div
            key="runAgent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 min-h-0 flex flex-col items-center justify-center gap-8"
          >
            <div
              className="rounded-2xl px-7 py-5 flex flex-col items-center gap-3"
              style={{ background: `${ACCENT}12`, boxShadow: `inset 0 0 0 1.5px ${ACCENT}88` }}
            >
              <span className="font-mono text-[20px] font-semibold" style={{ color: ACCENT }}>
                run_agent(system_prompt, task)
              </span>
              <span className="text-[16px] text-white/85">📋 job card + 📝 task ➜ 🧠 1 LLM call ➜ 💬 reply</span>
            </div>
            <div className="flex items-end gap-10">
              {[TEAM.boss, TEAM.researcher, TEAM.math].map((b) => (
                <div key={b.name} className="flex flex-col items-center gap-2">
                  <AgentBot color={b.color} badge={b.badge} name={b.name} mood="happy" size={64} />
                  <span className="font-mono text-[13px] px-2 py-0.5 rounded bg-white/5 text-white/60">run_agent</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {s.phase !== 'runAgent' && !(finished && s.final) && (
          <>
            {/* Max's desk */}
            <motion.div
              layout
              className="min-h-0 flex flex-col justify-center gap-3"
              style={{ width: helperFocus ? '34%' : s.focus === 'all' ? '46%' : '70%' }}
            >
              {inboxShown && (
                <div
                  className={`rounded-lg px-3 ${inboxBig ? 'py-2.5 text-[16px]' : 'py-1 text-[13px]'} leading-snug`}
                  style={{
                    background: inboxBig ? `${ACCENT}1a` : 'rgba(255,255,255,0.05)',
                    boxShadow: inboxBig ? `inset 0 0 0 1.5px ${ACCENT}` : 'none',
                    opacity: maxFocal ? 1 : 0.5,
                  }}
                >
                  📥 <span className="text-white/90">&quot;{s.request}&quot;</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <AgentBot
                  color={TEAM.boss.color}
                  badge={TEAM.boss.badge}
                  name={TEAM.boss.name}
                  mood={maxMood(s)}
                  size={maxFocal ? 88 : 56}
                  active={s.focus === 'max' && !finished}
                  dimmed={!maxFocal && s.focus !== 'none'}
                />
                {maxFocal && (
                  <motion.div
                    key={`say-${idx}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl rounded-bl-sm px-3.5 py-2 text-[16px] leading-snug bg-white text-[#1c1c44] font-medium"
                  >
                    {maxSays(s)}
                  </motion.div>
                )}
              </div>

              {showSlips && (
                <div className="flex flex-col gap-1.5 min-h-0 overflow-hidden p-1 -m-1">
                  {s.slips.length === 0 ? (
                    <div className="text-[14px] text-white/60">📝 no order slips → final answer</div>
                  ) : (
                    s.slips.map((sl, i) => <SlipChip key={sl.id} slip={sl} active={i === s.current && s.phase === 'read'} />)
                  )}
                </div>
              )}
            </motion.div>

            {/* Helper desks: the one at work is big, the other shrinks */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-3 min-h-0">
              {(['rita', 'milo'] as Helper[]).map((who) => {
                const sz = deskSize(who);
                return (
                  <motion.div key={who} layout className="min-h-0" style={{ flex: sz === 'big' ? 3 : helperFocus ? 1 : '0 0 auto' }}>
                    <HelperDesk who={who} s={s} size={sz} menu={menu} />
                  </motion.div>
                );
              })}
            </div>

            {/* A result note flying back to Max (the outgoing slip is drawn on the helper's desk) */}
            {slip && s.phase === 'noteBack' && (
              <motion.div
                key={`back-${idx}`}
                className="absolute z-20 w-[34%] rounded-md px-3 py-2 text-[15px] shadow-lg pointer-events-none"
                style={{ background: '#dcfce7', color: '#14301f', border: `2px solid ${HELPERS[slip.to].bot.color}` }}
                initial={{ ...spot[slip.to], opacity: 0.4 }}
                animate={{ left: '0%', top: '8%', opacity: 1 }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
              >
                <div className="font-mono text-[13px] font-semibold">📄 tool · {slip.id}</div>
                <div className="line-clamp-4">{slip.result}</div>
              </motion.div>
            )}
          </>
        )}

        {/* Final answer card: the only thing on the stage once Max is done */}
        {finished && s.final && (
          <div className="absolute inset-0 z-30 flex items-center justify-center px-[3%]">
          <motion.div
            key={`final-${s.phase === 'recap' ? 'r' : 'f'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full rounded-2xl p-4 shadow-2xl"
            style={{ background: '#1c1c44', border: '2px solid #fbbf24' }}
          >
            <div className="text-[14px] font-semibold text-amber-300">👑 Max&apos;s final answer</div>
            <div className="mt-1.5 text-[17px] leading-snug text-white">{s.final}</div>
            <div className="mt-2 text-[14px] text-white/60">
              📞 {s.maxCalls} + {s.helperCalls} = {s.maxCalls + s.helperCalls} calls to OpenAI
            </div>
            {s.phase === 'recap' && (
              <ul className="mt-3 text-[15px] text-cyan-100 list-disc pl-5 space-y-1">
                <li>A helper agent can be a tool: tool call → the helper&apos;s own LLM call.</li>
                <li>The boss runs the same agent loop from Part 3.</li>
                <li>tool_call_id links each result note to its order slip.</li>
              </ul>
            )}
          </motion.div>
          </div>
        )}
      </div>

      {/* Max's notepad = the messages list, as a compact chip row */}
      {s.notepad.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-[13px] font-semibold mr-1"
            style={{ color: s.phase === 'notepad' || newNote ? ACCENT : 'rgba(255,255,255,0.5)' }}
          >
            📒 messages
          </span>
          {s.notepad.map((n, i) => {
            const st = noteStyle(n);
            const isNew = newNote && i >= (prev?.notepad.length ?? 0);
            return (
              <motion.span
                key={`${i}-${n.role}-${n.id ?? ''}`}
                initial={isNew ? { opacity: 0, y: -10, scale: 0.8 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="rounded-full px-2.5 py-0.5 text-[13px] max-w-[180px] truncate"
                style={{ background: st.bg, color: st.fg, boxShadow: isNew ? `0 0 0 1.5px ${ACCENT}` : 'none' }}
              >
                {st.label}
              </motion.span>
            );
          })}
        </div>
      )}
    </div>
  );
}
