'use client';
import { motion } from 'framer-motion';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import AgentBot, { TEAM, type BotMood } from '@/components/animations/characters/AgentBot';
import { useConceptStore } from '@/stores/conceptStore';
import { ING, ClarityMeter, FitFill, Rich, Seg, spring } from './shared';
import { SCENARIOS, CHIPS, NO_FLAGS, clarity, nextTip, type ALine, type ChipId, type Flags } from './fixerData';

const BLUE = '#4a9eff';

function moodFor(score: number): BotMood {
  if (score < 30) return 'confused';
  if (score < 60) return 'thinking';
  if (score < 90) return 'happy';
  return 'proud';
}

function FenceLine() {
  return (
    <motion.div initial={{ opacity: 0, scaleX: 0.3 }} animate={{ opacity: 1, scaleX: 1 }} transition={spring} className="rounded bg-slate-300 text-slate-800 font-mono font-bold text-[14px] px-2 leading-5">
      &quot;&quot;&quot;
    </motion.div>
  );
}

function AnswerRow({ line, i }: { line: ALine; i: number }) {
  const c = line.by === 'base' ? null : ING[line.by].color;
  const style = c ? { backgroundColor: `${c}26`, boxShadow: `inset 4px 0 0 ${c}` } : undefined;
  const anim = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { ...spring, delay: 0.55 + i * 0.09 } };
  if (line.kind === 'muted') {
    return (
      <motion.div {...anim} className="px-2 text-[13px] italic text-black/45">
        {line.text}
      </motion.div>
    );
  }
  if (line.kind === 'warn') {
    return (
      <motion.div {...anim} className="rounded-md px-2 py-1 bg-red-100 border border-red-300">
        <div className="text-[14px]">{line.text}</div>
        <div className="text-[13px] font-semibold text-red-700">↑ It obeyed a line inside the story</div>
      </motion.div>
    );
  }
  return (
    <motion.div {...anim} className={`rounded-md px-2 py-0.5 ${line.kind === 'title' ? 'text-[17px] font-bold' : 'text-[14px]'}`} style={style}>
      {line.kind === 'bullet' && '• '}
      <Rich text={line.text} />
    </motion.div>
  );
}

export default function PromptFixerPlayground() {
  const [sIdx, setSIdx] = useState(0);
  const [flags, setFlags] = useState<Flags>(NO_FLAGS);
  const [lastOn, setLastOn] = useState<ChipId | null>(null);
  const s = SCENARIOS[sIdx];
  const score = clarity(s, flags);
  const tip = nextTip(s, flags);
  const lines = s.answer(flags);
  const sig = `${s.id}:${CHIPS.map((c) => (flags[c] ? 1 : 0)).join('')}`;
  const promptRef = useRef<HTMLDivElement>(null);

  // Solo Bot "writes" for a moment after every change, then the new answer slides in.
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    setBusy(true);
    const t = setTimeout(() => setBusy(false), 650);
    return () => clearTimeout(t);
  }, [sig]);

  // If the prompt is taller than its box, scroll so the ingredient just added is in view.
  useEffect(() => {
    const box = promptRef.current;
    const el = lastOn ? box?.querySelector<HTMLElement>(`[data-ing="${lastOn}"]`) : null;
    if (!box || !el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (bottom > box.scrollTop + box.clientHeight) box.scrollTo({ top: bottom - box.clientHeight + 8, behavior: 'smooth' });
    else if (top < box.scrollTop) box.scrollTo({ top: Math.max(0, top - 8), behavior: 'smooth' });
  }, [sig, lastOn]);

  // Using the playground pauses autoplay, so the lesson doesn't move on while you experiment.
  const pauseAutoplay = () => useConceptStore.getState().setPlaying(false);
  const toggle = (c: ChipId) => {
    pauseAutoplay();
    setLastOn(flags[c] ? null : c);
    setFlags((f) => ({ ...f, [c]: !f[c] }));
  };
  const reset = (i: number) => {
    pauseAutoplay();
    setSIdx(i);
    setFlags(NO_FLAGS);
    setLastOn(null);
    promptRef.current?.scrollTo({ top: 0 });
  };
  const on = (c: ChipId) => flags[c] && !!s.lines[c];
  const shaped = lines.some((l) => l.by !== 'base' && l.kind !== 'muted' && l.kind !== 'warn');
  const notNeeded = CHIPS.filter((c) => !s.lines[c]);

  // Space on a focused chip should press the chip, not start the lesson's autoplay (the page listens for Space).
  const keepSpace = (e: KeyboardEvent) => {
    if (e.key === ' ' && (e.target as HTMLElement).tagName === 'BUTTON') e.stopPropagation();
  };

  // On a short panel (1280x720 laptops) the chips go into two columns, so nothing has to shrink below 13px.
  return (
    <FitFill minW={1060} minH={560} compact={{ minW: 1060, minH: 440 }}>
      {(compact) => (
        <div className="w-full h-full flex flex-col gap-3 p-4 text-white" onKeyDown={keepSpace}>
          {/* ---------- header: pick a messy prompt ---------- */}
          <div className="flex items-center gap-3">
            <div className="text-[13px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: BLUE }}>
              🧪 Prompt Fixer
            </div>
            <div className="text-[13px] text-white/60 ml-3 whitespace-nowrap">1. Pick a messy prompt:</div>
            <div className="flex gap-1.5">
              {SCENARIOS.map((sc, i) => (
                <button
                  key={sc.id}
                  onClick={() => reset(i)}
                  className="px-3 py-1 rounded-full border text-[14px] transition-colors whitespace-nowrap"
                  style={{
                    borderColor: i === sIdx ? `${BLUE}b0` : 'rgba(255,255,255,0.15)',
                    backgroundColor: i === sIdx ? `${BLUE}25` : 'rgba(255,255,255,0.04)',
                    color: i === sIdx ? '#e0efff' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {sc.chip}
                </button>
              ))}
            </div>
            <button onClick={() => reset(sIdx)} className="ml-auto px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[13px] text-white/60 hover:text-white whitespace-nowrap">
              ↺ Start over
            </button>
          </div>

          <div className="flex-1 min-h-0 flex gap-4">
            {/* ---------- ingredient chips + meter + tip ---------- */}
            <div className={`${compact ? 'w-[336px]' : 'w-[262px]'} shrink-0 flex flex-col gap-1.5`}>
              <div className="text-[13px] text-white/60 mb-0.5">2. Add ingredients:</div>
              <div className={compact ? 'grid grid-cols-2 gap-1.5' : 'flex flex-col gap-1.5'}>
                {CHIPS.map((c) => {
                  const ing = ING[c];
                  const relevant = !!s.lines[c];
                  const isOn = on(c);
                  const suggested = tip === c;
                  return (
                    <motion.button
                      key={c}
                      onClick={() => relevant && toggle(c)}
                      disabled={!relevant}
                      aria-pressed={isOn}
                      title={relevant ? undefined : s.notNeeded[c]}
                      animate={{ boxShadow: suggested ? ['0 0 0px #ffffff00', `0 0 12px ${ing.color}`, '0 0 0px #ffffff00'] : '0 0 0px #ffffff00' }}
                      transition={suggested ? { duration: 1.6, repeat: Infinity } : { duration: 0.2 }}
                      className={`flex items-center gap-2 rounded-lg border-2 px-2.5 py-1 text-left transition-colors ${relevant ? '' : 'cursor-not-allowed'}`}
                      style={{
                        borderColor: isOn ? ing.color : suggested ? `${ing.color}90` : relevant ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)',
                        borderStyle: relevant ? 'solid' : 'dashed',
                        backgroundColor: isOn ? `${ing.color}22` : 'transparent',
                      }}
                    >
                      <span
                        className={`w-5 h-5 shrink-0 rounded flex items-center justify-center text-[13px] font-bold ${relevant ? '' : 'opacity-40'}`}
                        style={isOn ? { backgroundColor: ing.color, color: '#0f172a' } : { border: '1.5px solid rgba(255,255,255,0.3)' }}
                      >
                        {isOn ? '✓' : ''}
                      </span>
                      <span className={`text-[14px] font-semibold whitespace-nowrap ${relevant ? '' : 'opacity-40'}`} style={{ color: isOn ? ing.color : 'rgba(255,255,255,0.85)' }}>
                        {ing.icon} {ing.label}
                      </span>
                      {!relevant && !compact && <span className="ml-auto text-[13px] text-white/70">not needed</span>}
                    </motion.button>
                  );
                })}
              </div>
              {compact && notNeeded.length > 0 && (
                <div className="text-[13px] text-white/60">Not needed here: {notNeeded.map((c) => ING[c].label).join(', ')}</div>
              )}

              <div className="mt-2 flex flex-col gap-2">
                <ClarityMeter value={score} width={compact ? 336 : 262} />
                <motion.div
                  key={`${s.id}-${tip}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border px-3 py-2 text-[13px] leading-snug"
                  style={tip ? { borderColor: `${ING[tip].color}70`, backgroundColor: `${ING[tip].color}12` } : { borderColor: '#4ade8070', backgroundColor: '#4ade8012' }}
                >
                  {tip ? (
                    <>
                      <div className="font-bold mb-0.5" style={{ color: ING[tip].color }}>
                        💡 Next best ingredient
                      </div>
                      <div className="text-white/85">{s.tips[tip]}</div>
                    </>
                  ) : (
                    <span className="text-emerald-200">✨ Crystal clear! Notice you didn&apos;t need every chip, only the ones this job uses.</span>
                  )}
                </motion.div>
              </div>
            </div>

            {/* ---------- the assembled prompt ---------- */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <div className="text-[13px] text-white/60">3. Your prompt, built live:</div>
              <div ref={promptRef} className="relative min-h-0 rounded-xl bg-[#fffdf7] text-[#1f2937] border-2 border-[#f9a8d4]/70 shadow-lg overflow-y-auto">
                <div className="px-3 py-2 space-y-1.5 text-[14px] leading-snug">
                  {on('role') && (
                    <div data-ing="role">
                      <Seg id="role">{s.lines.role}</Seg>
                    </div>
                  )}
                  {on('task') ? (
                    <div data-ing="task">
                      <Seg id="task" className="text-[15px] font-medium">
                        {s.lines.task}
                      </Seg>
                    </div>
                  ) : (
                    <motion.div layout className="px-2.5 py-1 rounded-md bg-black/[0.05] text-[15px] font-medium">
                      {s.base}
                    </motion.div>
                  )}
                  {on('context') && (
                    <div data-ing="context">
                      <Seg id="context">{s.lines.context}</Seg>
                    </div>
                  )}
                  {s.pasted && (
                    <motion.div layout className="space-y-1" data-ing="fence">
                      {on('fence') && <Seg id="fence">{s.lines.fence}</Seg>}
                      {on('fence') && <FenceLine />}
                      <div className="px-2.5 py-1 rounded-md border border-dashed border-black/20 text-[13px] text-black/70 leading-snug">
                        <div className="text-[13px] font-bold uppercase tracking-wide text-black/40">pasted story</div>
                        {s.pasted.slice(0, -1).map((p) => (
                          <div key={p}>{p}</div>
                        ))}
                        <div className="font-medium text-black/80 underline decoration-dotted decoration-red-400 underline-offset-2">{s.pasted[s.pasted.length - 1]}</div>
                      </div>
                      {on('fence') && <FenceLine />}
                    </motion.div>
                  )}
                  {(['format', 'example', 'limits', 'step'] as ChipId[]).map(
                    (c) =>
                      on(c) && (
                        <div key={c} data-ing={c}>
                          <Seg id={c}>{s.lines[c]}</Seg>
                        </div>
                      ),
                  )}
                </div>
              </div>
            </div>

            {/* ---------- Solo Bot's answer ---------- */}
            <div className={`${compact ? 'w-[360px]' : 'w-[392px]'} shrink-0 flex flex-col gap-1.5`}>
              <div className="flex items-end gap-2">
                <AgentBot color={TEAM.solo.color} badge={TEAM.solo.badge} size={50} mood={busy ? 'working' : moodFor(score)} active={busy} />
                <div className="text-[13px] text-white/60 pb-2">{busy ? '✍️ writing…' : "4. Solo Bot's answer"}</div>
              </div>
              <div key={sig} className="min-h-0 rounded-xl bg-white text-[#1f2937] shadow-lg px-2 py-2 space-y-1.5 overflow-y-auto">
                {lines.map((l, i) => (
                  <AnswerRow key={`${i}-${l.text}`} line={l} i={i} />
                ))}
              </div>
              {shaped && <div className="text-[13px] text-white/60">Coloured edge = the ingredient that shaped that line</div>}
            </div>
          </div>
        </div>
      )}
    </FitFill>
  );
}
