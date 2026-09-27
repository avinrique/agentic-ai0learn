'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AgentBot, { TEAM, type BotMood } from '@/components/animations/characters/AgentBot';
import { ING, ClarityMeter, Rich, Seg, spring } from './shared';
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
  const s = SCENARIOS[sIdx];
  const score = clarity(s, flags);
  const tip = nextTip(s, flags);
  const lines = s.answer(flags);
  const sig = `${s.id}:${CHIPS.map((c) => (flags[c] ? 1 : 0)).join('')}`;

  // Solo Bot "writes" for a moment after every change, then the new answer slides in.
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    setBusy(true);
    const t = setTimeout(() => setBusy(false), 650);
    return () => clearTimeout(t);
  }, [sig]);

  const toggle = (c: ChipId) => setFlags((f) => ({ ...f, [c]: !f[c] }));
  const on = (c: ChipId) => flags[c] && !!s.lines[c];

  return (
    <div className="w-full h-full flex flex-col gap-3 p-4 text-white">
      {/* ---------- header: pick a messy prompt ---------- */}
      <div className="flex items-center gap-3">
        <div className="text-[13px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: BLUE }}>
          🧪 Prompt Fixer
        </div>
        <div className="text-[13px] text-white/60 ml-3">1. Pick a messy prompt:</div>
        <div className="flex gap-1.5">
          {SCENARIOS.map((sc, i) => (
            <button
              key={sc.id}
              onClick={() => {
                setSIdx(i);
                setFlags(NO_FLAGS);
              }}
              className="px-3 py-1 rounded-full border text-[14px] transition-colors"
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
        <button onClick={() => setFlags(NO_FLAGS)} className="ml-auto px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[13px] text-white/60 hover:text-white">
          ↺ Start over
        </button>
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        {/* ---------- ingredient chips + meter + tip ---------- */}
        <div className="w-[262px] shrink-0 flex flex-col gap-1.5">
          <div className="text-[13px] text-white/60 mb-0.5">2. Add ingredients:</div>
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
                className={`flex items-center gap-2 rounded-lg border-2 px-2.5 py-1.5 text-left transition-colors ${relevant ? '' : 'opacity-40 cursor-not-allowed'}`}
                style={{
                  borderColor: isOn ? ing.color : suggested ? `${ing.color}90` : 'rgba(255,255,255,0.12)',
                  borderStyle: relevant ? 'solid' : 'dashed',
                  backgroundColor: isOn ? `${ing.color}22` : 'transparent',
                }}
              >
                <span className="w-5 h-5 shrink-0 rounded flex items-center justify-center text-[12px] font-bold" style={isOn ? { backgroundColor: ing.color, color: '#0f172a' } : { border: '1.5px solid rgba(255,255,255,0.3)' }}>
                  {isOn ? '✓' : ''}
                </span>
                <span className="text-[14px] font-semibold whitespace-nowrap" style={{ color: isOn ? ing.color : 'rgba(255,255,255,0.85)' }}>
                  {ing.icon} {ing.label}
                </span>
                {!relevant && <span className="ml-auto text-[13px] text-white/60">not needed</span>}
              </motion.button>
            );
          })}

          <div className="mt-3 flex flex-col gap-2">
            <ClarityMeter value={score} width={262} />
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
          <div className="min-h-0 rounded-xl bg-[#fffdf7] text-[#1f2937] border-2 border-[#f9a8d4]/70 shadow-lg overflow-hidden">
            <div className="px-3 py-2 space-y-1.5 text-[14px] leading-snug">
              {on('role') && <Seg id="role">{s.lines.role}</Seg>}
              <motion.div layout className="px-2.5 py-1 rounded-md bg-black/[0.05] text-[15px] font-medium">
                {s.base}
                {on('fence') && s.fenceNote && (
                  <span className="rounded px-0.5" style={{ backgroundColor: '#cbd5e1' }}>
                    {s.fenceNote}
                  </span>
                )}
              </motion.div>
              {on('context') && <Seg id="context">{s.lines.context}</Seg>}
              {s.pasted && (
                <motion.div layout className="space-y-1">
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
              {on('format') && <Seg id="format">{s.lines.format}</Seg>}
              {on('example') && <Seg id="example">{s.lines.example}</Seg>}
              {on('limits') && <Seg id="limits">{s.lines.limits}</Seg>}
              {on('step') && <Seg id="step">{s.lines.step}</Seg>}
            </div>
          </div>
        </div>

        {/* ---------- Solo Bot's answer ---------- */}
        <div className="w-[392px] shrink-0 flex flex-col gap-1.5">
          <div className="flex items-end gap-2">
            <AgentBot color={TEAM.solo.color} badge={TEAM.solo.badge} size={50} mood={busy ? 'working' : moodFor(score)} active={busy} />
            <div className="text-[13px] text-white/60 pb-2">{busy ? '✍️ writing…' : "4. Solo Bot's answer"}</div>
          </div>
          <div key={sig} className="min-h-0 rounded-xl bg-white text-[#1f2937] shadow-lg px-2 py-2 space-y-1.5 overflow-hidden">
            {lines.map((l, i) => (
              <AnswerRow key={`${i}-${l.text}`} line={l} i={i} />
            ))}
          </div>
          <div className="text-[13px] text-white/50">Coloured edge = the ingredient that shaped that line</div>
        </div>
      </div>
    </div>
  );
}
