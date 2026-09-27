'use client';
/**
 * TokensCostAnim — Lesson 12 (Code: Tokens & Cost).
 *
 * One focal point per step: the question breaks into coloured token bricks with a
 * counter; a two-lane token meter (IN / OUT) runs while the AI answers;
 * response.usage prints as a receipt; price tags turn tokens into money; a coin
 * stack shows ×1,000. Finished stages shrink to small chips in the header.
 * Everything is derived from the current tracer step and the active variant.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { animate, motion } from 'framer-motion';
import AgentBot, { TEAM } from '@/components/animations/characters/AgentBot';
import { useTracerStore } from '@/stores/tracerStore';
import { useTracerScene } from '@/components/animations/part4/useTracerScene';
import { tokensCostScenes, dollars, type TokensCostScene } from '@/data/traces/tokens-cost';

const IN = '#4a9eff';
const OUT = '#f472b6';
const GOLD = '#fbbf24';
const GREEN = '#4ade80';
const GREY = '#94a3b8';
const BRICK_COLORS = ['#4a9eff', '#a78bfa', '#4ade80', '#fbbf24', '#f472b6'];
const spring = { type: 'spring' as const, damping: 20, stiffness: 180 };

const ORDER = [
  'intro', 'setup-tiktoken', 'setup-client', 'question', 'encoder', 'bricks', 'estimate', 'send', 'writing',
  'answer', 'receipt', 'receipt-in', 'receipt-out', 'receipt-total', 'price-in', 'price-out', 'cost-in',
  'cost-out', 'cost-total', 'cost-print', 'stack', 'history', 'tips', 'recap',
];
const rankOf = (t: string) => Math.max(0, ORDER.indexOf(t));
const num = (n: number) => n.toLocaleString('en-US');
/** Show the spaces and line breaks that belong to a token. */
const showToken = (t: string) => t.replace(/\n/g, '↵').replace(/ /g, '·');

// ── Small building blocks ───────────────────────────────────────────────────

/** Counts from `from` to `to` when `run` is set; otherwise just shows `to`. */
function CountUp({ to, from = 0, run, duration = 1.2 }: { to: number; from?: number; run: boolean; duration?: number }) {
  const [n, setN] = useState(run ? from : to);
  useEffect(() => {
    if (!run) {
      setN(to);
      return;
    }
    setN(from);
    const controls = animate(from, to, { duration, ease: 'easeOut', onUpdate: (v) => setN(v) });
    return () => controls.stop();
  }, [to, from, run, duration]);
  return <>{num(Math.round(n))}</>;
}

function Chip({ children, color }: { children: ReactNode; color: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-[13px] px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{ color, background: `${color}14`, border: `1px solid ${color}40` }}
    >
      {children}
    </motion.span>
  );
}

/** The question on a slip of paper. */
function Slip({ text, compact, long }: { text: string; compact?: boolean; long: boolean }) {
  const clamp = compact ? 44 : long ? 250 : undefined;
  return (
    <motion.div
      layout
      className="relative rounded-lg bg-white text-slate-800 shadow-xl overflow-hidden"
      style={{ width: compact ? '70%' : long ? '82%' : '78%', padding: compact ? '8px 14px' : '16px 20px', opacity: compact ? 0.55 : 1 }}
    >
      <div className="text-[13px] font-bold text-slate-500 mb-1">📄 question</div>
      <div
        className="leading-snug whitespace-pre-line"
        style={{ fontSize: compact ? 14 : long ? 15 : 22, maxHeight: clamp, overflow: 'hidden' }}
      >
        {text}
      </div>
      {long && (
        <div
          className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0), #fff)' }}
        />
      )}
    </motion.div>
  );
}

function Brick({ text, id, i }: { text: string; id: number; i: number }) {
  const c = BRICK_COLORS[i % BRICK_COLORS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, delay: 0.15 + i * 0.06 }}
      className="flex flex-col items-center gap-1"
    >
      <div
        className="px-2.5 py-1.5 rounded-lg border-2 font-mono text-[17px] font-bold whitespace-pre"
        style={{ borderColor: c, color: c, background: `${c}14` }}
      >
        {showToken(text)}
      </div>
      <span className="text-[13px] font-mono text-white/40">{id}</span>
    </motion.div>
  );
}

// ── Scenes ──────────────────────────────────────────────────────────────────

function Intro() {
  const cards = [
    { icon: '🧱', label: 'Count tokens', color: IN },
    { icon: '🧾', label: 'Read the receipt', color: '#e2e8f0' },
    { icon: '💰', label: 'Work out cost', color: GOLD },
  ];
  return (
    <div className="flex items-center justify-center gap-3">
      {cards.map((c, i) => (
        <div key={c.label} className="flex items-center gap-3">
          {i > 0 && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.35 }} className="text-[22px] text-white/30">
              ➜
            </motion.span>
          )}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: i * 0.35 }}
            className="w-[168px] rounded-2xl px-3 py-5 flex flex-col items-center gap-2 border-2"
            style={{ borderColor: `${c.color}66`, background: `${c.color}10` }}
          >
            <span className="text-[44px] leading-none">{c.icon}</span>
            <span className="text-[17px] font-semibold text-center" style={{ color: c.color }}>{c.label}</span>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function Setup({ focus }: { focus: 'tiktoken' | 'client' }) {
  const cards = [
    { key: 'tiktoken', icon: '✂️', title: 'tiktoken', sub: 'token counter · runs on your computer', color: IN },
    { key: 'client', icon: '📞', title: 'client', sub: 'talks to the API', color: GREEN },
  ] as const;
  return (
    <div className="flex items-center justify-center gap-6">
      {cards.map((c) => {
        const on = c.key === focus;
        const done = c.key === 'tiktoken' && focus === 'client';
        return (
          <motion.div
            key={c.key}
            animate={{ opacity: on ? 1 : done ? 0.4 : 0.25, scale: on ? 1 : 0.88 }}
            transition={spring}
            className="w-[250px] rounded-2xl px-4 py-6 flex flex-col items-center gap-2 border-2"
            style={{ borderColor: on ? c.color : 'rgba(255,255,255,0.15)', background: on ? `${c.color}12` : 'transparent' }}
          >
            <span className="text-[44px] leading-none">{c.icon}</span>
            <span className="text-[20px] font-mono font-bold" style={{ color: c.color }}>
              {c.title} {done ? '✓' : ''}
            </span>
            <span className="text-[15px] text-white/60 text-center">{c.sub}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function Encoder({ scene, long }: { scene: TokensCostScene; long: boolean }) {
  return (
    <div className="w-full flex flex-col items-center gap-3">
      <Slip text={scene.question} compact long={long} />
      <span className="text-[22px] text-white/30">⬇</span>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring}
        className="rounded-2xl px-8 py-5 flex flex-col items-center gap-1.5 border-2"
        style={{ borderColor: IN, background: `${IN}12`, boxShadow: `0 0 28px ${IN}33` }}
      >
        <motion.span
          className="text-[40px] leading-none"
          animate={{ rotate: [0, -18, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        >
          ✂️
        </motion.span>
        <span className="text-[22px] font-mono font-bold" style={{ color: IN }}>o200k_base</span>
        <span className="text-[15px] text-white/60">gpt-4o&apos;s cutting rules</span>
      </motion.div>
    </div>
  );
}

function Bricks({ scene, phase }: { scene: TokensCostScene; phase: 'bricks' | 'estimate' }) {
  const hidden = scene.estimate - scene.pieces.length;
  const isEstimate = phase === 'estimate';
  return (
    <div className="w-full flex flex-col items-center gap-5">
      <motion.div
        animate={{ opacity: isEstimate ? 0.3 : 1 }}
        className="flex flex-wrap justify-center items-start gap-x-2 gap-y-2.5 max-w-[92%]"
      >
        {scene.pieces.map((p, i) => (
          <Brick key={`${i}-${p}`} text={p} id={scene.ids[i]} i={i} />
        ))}
        {hidden > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + scene.pieces.length * 0.06 }}
            className="self-center px-3 py-1.5 rounded-lg border-2 border-dashed border-white/25 text-[16px] font-mono text-white/60"
          >
            +{num(hidden)} more
          </motion.div>
        )}
      </motion.div>

      <motion.div
        animate={{ scale: isEstimate ? 1.12 : 1 }}
        transition={spring}
        className="flex flex-col items-center rounded-2xl px-7 py-3 border-2"
        style={{
          borderColor: isEstimate ? GOLD : `${IN}88`,
          borderStyle: isEstimate ? 'dashed' : 'solid',
          background: isEstimate ? `${GOLD}12` : `${IN}10`,
        }}
      >
        <span className="font-mono text-[46px] font-bold leading-none" style={{ color: isEstimate ? GOLD : IN }}>
          {isEstimate ? '≈ ' : ''}
          <CountUp to={scene.estimate} run={!isEstimate} duration={Math.min(2, 0.5 + scene.estimate / 120)} />
        </span>
        <span className="text-[15px] mt-1" style={{ color: isEstimate ? GOLD : 'rgba(255,255,255,0.6)' }}>
          {isEstimate ? 'estimate' : 'tokens'}
        </span>
      </motion.div>
    </div>
  );
}

/** One lane of the API's token meter. */
function Lane({
  label,
  sub,
  color,
  value,
  counted,
  max,
  active,
  run,
}: {
  label: string;
  sub: string;
  color: string;
  value: number;
  counted?: number; // IN lane: the part tiktoken counted; the rest is the message "envelope"
  max: number;
  active: boolean;
  run: boolean;
}) {
  const pct = (n: number) => (value === 0 ? 0 : Math.max(1.5, (n / max) * 100));
  const main = counted ?? value;
  const extra = value - main;
  const dur = Math.min(2.2, 0.6 + value / 160);
  const stripes = (c: string) =>
    `repeating-linear-gradient(90deg, ${c} 0 9px, ${c}aa 9px 11px)`;
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.45 }}
      className="flex items-center gap-4 rounded-xl px-4 py-3"
      style={{ background: active ? `${color}10` : 'transparent', border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.08)'}` }}
    >
      <div className="w-[88px] flex-shrink-0">
        <div className="text-[20px] font-black tracking-wide" style={{ color }}>{label}</div>
        <div className="text-[13px] text-white/55">{sub}</div>
      </div>
      <div className="flex-1 h-9 rounded-lg bg-white/5 overflow-hidden flex">
        <motion.div
          key={`m-${run}`}
          initial={run ? { width: '0%' } : false}
          animate={{ width: `${pct(main)}%` }}
          transition={{ duration: run ? dur : 0.3, ease: 'easeOut' }}
          style={{ background: stripes(color) }}
        />
        {extra > 0 && (
          <motion.div
            key={`e-${run}`}
            initial={run ? { width: '0%' } : false}
            animate={{ width: `${pct(extra)}%` }}
            transition={{ duration: run ? 0.4 : 0.3, delay: run ? dur : 0 }}
            style={{ background: stripes('#64748b') }}
          />
        )}
      </div>
      <div className="w-[96px] text-right font-mono text-[34px] font-bold leading-none" style={{ color }}>
        <CountUp to={value} run={run} duration={dur} />
      </div>
    </motion.div>
  );
}

function Meter({ scene, phase }: { scene: TokensCostScene; phase: 'send' | 'writing' }) {
  const max = Math.max(scene.prompt, scene.completion);
  const writing = phase === 'writing';
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="relative">
        <AgentBot {...TEAM.solo} name="gpt-4o-mini" role={undefined} size={96} mood={writing ? 'working' : 'thinking'} active={writing} />
        {writing &&
          [0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-full w-5 h-3.5 rounded-sm"
              style={{ background: OUT, marginLeft: -10 }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: [0, 26], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.37, ease: 'easeIn' }}
            />
          ))}
      </div>
      <div className="w-[92%] rounded-2xl border border-white/10 bg-black/25 p-3 flex flex-col gap-2.5">
        <div className="text-[13px] font-semibold text-white/45 uppercase tracking-wider px-1">🧮 API token meter</div>
        <Lane label="IN" sub="we send" color={IN} value={scene.prompt} counted={scene.estimate} max={max} active={!writing} run={!writing} />
        <Lane label="OUT" sub="AI writes" color={OUT} value={writing ? scene.completion : 0} max={max} active={writing} run={writing} />
      </div>
    </div>
  );
}

function Answer({ scene, long }: { scene: TokensCostScene; long: boolean }) {
  return (
    <div className="w-full flex flex-col items-center gap-3">
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="relative w-[84%] rounded-lg bg-white text-slate-800 shadow-xl overflow-hidden px-5 py-4"
      >
        <div className="text-[13px] font-bold text-slate-500 mb-1.5">🤖 answer</div>
        <div className="leading-snug whitespace-pre-line" style={{ fontSize: long ? 15 : 19, maxHeight: long ? 300 : undefined, overflow: 'hidden' }}>
          {scene.answer}
        </div>
        {long && (
          <div className="absolute inset-x-0 bottom-0 h-14 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0), #fff)' }} />
        )}
      </motion.div>
      <Chip color={OUT}>OUT: {num(scene.completion)} tokens</Chip>
    </div>
  );
}

function Receipt({ scene, focus }: { scene: TokensCostScene; focus: 'all' | 'in' | 'out' | 'total' }) {
  const total = scene.prompt + scene.completion;
  const rows = [
    { key: 'in', name: 'prompt_tokens', value: scene.prompt, tag: 'IN', color: IN },
    { key: 'out', name: 'completion_tokens', value: scene.completion, tag: 'OUT', color: OUT },
    { key: 'total', name: 'total_tokens', value: total, tag: '', color: '#16a34a' },
  ];
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <motion.div
        initial={focus === 'all' ? { y: -30, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative w-[420px] bg-[#f8fafc] text-slate-800 font-mono shadow-2xl rounded-t-md"
      >
        <div className="px-6 pt-4 pb-2 text-center">
          <div className="text-[19px] font-bold">🧾 response.usage</div>
          <div className="text-[13px] text-slate-500">gpt-4o-mini · 1 call</div>
        </div>
        <div className="mx-6 border-t-2 border-dashed border-slate-300" />
        <div className="px-4 py-2 flex flex-col gap-1">
          {rows.map((r) => {
            const on = focus === r.key;
            const dim = focus !== 'all' && !on;
            return (
              <div key={r.key}>
                {r.key === 'total' && <div className="mx-2 my-1 border-t-2 border-dashed border-slate-300" />}
                <motion.div
                  animate={{ opacity: dim ? 0.35 : 1, scale: on ? 1.05 : 1 }}
                  transition={spring}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5"
                  style={{ background: on ? `${r.color}22` : 'transparent', outline: on ? `2px solid ${r.color}` : 'none' }}
                >
                  <span className="text-[17px] font-semibold">{r.name}</span>
                  {r.tag && (
                    <span className="text-[13px] font-bold px-1.5 rounded" style={{ color: r.color, background: `${r.color}1a` }}>
                      {r.tag}
                    </span>
                  )}
                  <span className="ml-auto text-[22px] font-bold" style={{ color: on ? r.color : undefined }}>{num(r.value)}</span>
                </motion.div>
              </div>
            );
          })}
        </div>
        {/* torn paper edge */}
        <div
          className="absolute left-0 right-0 -bottom-[9px] h-[10px]"
          style={{
            background:
              'linear-gradient(-45deg, transparent 6px, #f8fafc 0) 0 0 / 14px 10px repeat-x, linear-gradient(45deg, transparent 6px, #f8fafc 0) 0 0 / 14px 10px repeat-x',
          }}
        />
      </motion.div>

      {focus === 'in' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.3 }}
          className="mt-3 flex items-center gap-2.5 text-[17px] font-mono font-bold"
        >
          <span className="px-3 py-1.5 rounded-lg" style={{ color: IN, background: `${IN}18`, border: `1.5px solid ${IN}` }}>
            🧱 {num(scene.estimate)} counted
          </span>
          <span className="text-white/40">+</span>
          <span className="px-3 py-1.5 rounded-lg text-slate-300" style={{ background: '#64748b33', border: '1.5px dashed #94a3b8' }}>
            ✉️ {scene.prompt - scene.estimate} envelope
          </span>
          <span className="text-white/40">=</span>
          <span style={{ color: IN }}>{num(scene.prompt)}</span>
        </motion.div>
      )}
    </div>
  );
}

function PriceTag({ lane, price, color, on, badge }: { lane: string; price: string; color: string; on: boolean; badge?: string }) {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0, rotate: -8 }}
      animate={{ y: 0, opacity: on ? 1 : 0.35, rotate: -3, scale: on ? 1 : 0.86 }}
      transition={spring}
      className="relative w-[230px] rounded-2xl pl-9 pr-5 py-5 border-2"
      style={{ borderColor: color, background: `${color}14` }}
    >
      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: color }} />
      <div className="text-[15px] font-bold tracking-wide" style={{ color }}>{lane}</div>
      <div className="font-mono text-[46px] font-bold leading-tight text-white">{price}</div>
      <div className="text-[14px] text-white/60">per 1M tokens</div>
      {badge && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...spring, delay: 0.35 }}
          className="absolute -top-4 -right-4 w-14 h-14 rounded-full flex items-center justify-center text-[20px] font-black text-navy-900"
          style={{ background: GOLD }}
        >
          {badge}
        </motion.span>
      )}
    </motion.div>
  );
}

function Prices({ phase }: { phase: 'price-in' | 'price-out' }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-start justify-center gap-10">
        <PriceTag lane="IN · input" price="$0.15" color={IN} on={phase === 'price-in'} />
        {phase === 'price-out' && <PriceTag lane="OUT · output" price="$0.60" color={OUT} on badge="4×" />}
      </div>
      <div className="text-[13px] text-white/45">example prices · check openai.com/api/pricing</div>
    </div>
  );
}

function FormulaRow({ tokens, price, result, color, big }: { tokens: number; price: string; result: string; color: string; big: boolean }) {
  return (
    <motion.div
      layout
      animate={{ opacity: big ? 1 : 0.5 }}
      className="flex items-center justify-center flex-wrap gap-x-2 font-mono font-bold rounded-xl px-4"
      style={{
        fontSize: big ? 24 : 15,
        paddingTop: big ? 14 : 6,
        paddingBottom: big ? 14 : 6,
        background: big ? `${color}12` : 'transparent',
        border: big ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span style={{ color }}>{num(tokens)}</span>
      <span className="text-white/50">÷ 1,000,000 ×</span>
      <span className="text-white">{price}</span>
      <span className="text-white/50">=</span>
      <span style={{ color: GOLD }}>${result}</span>
    </motion.div>
  );
}

function CostBoard({ scene, phase }: { scene: TokensCostScene; phase: 'cost-in' | 'cost-out' | 'cost-total' }) {
  const all = scene.inUnits + scene.outUnits;
  const inPct = Math.round((scene.inUnits / all) * 100);
  const isTotal = phase === 'cost-total';
  return (
    <div className="w-[92%] flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="w-[52px] text-[16px] font-black" style={{ color: IN }}>IN</span>
        <div className="flex-1">
          <FormulaRow tokens={scene.prompt} price="$0.15" result={dollars(scene.inUnits)} color={IN} big={phase === 'cost-in'} />
        </div>
      </div>
      {phase !== 'cost-in' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <span className="w-[52px] text-[16px] font-black" style={{ color: OUT }}>OUT</span>
          <div className="flex-1">
            <FormulaRow tokens={scene.completion} price="$0.60" result={dollars(scene.outUnits)} color={OUT} big={phase === 'cost-out'} />
          </div>
        </motion.div>
      )}
      {isTotal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.2 }}
          className="mt-3 flex flex-col items-center gap-3"
        >
          <div className="text-[15px] text-white/55">cost</div>
          <div className="font-mono text-[44px] font-bold leading-none" style={{ color: GOLD }}>${dollars(all)}</div>
          <div className="w-[80%] mt-2">
            <div className="h-7 rounded-lg overflow-hidden flex bg-white/5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(inPct, 1)}%` }} transition={{ duration: 0.8, delay: 0.4 }} style={{ background: IN }} />
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(100 - inPct, 1)}%` }} transition={{ duration: 0.8, delay: 0.4 }} style={{ background: OUT }} />
            </div>
            <div className="flex justify-between mt-1.5 text-[15px] font-semibold">
              <span style={{ color: IN }}>input {inPct}%</span>
              <span style={{ color: OUT }}>output {100 - inPct}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function CostPrint({ scene }: { scene: TokensCostScene }) {
  const all = scene.inUnits + scene.outUnits;
  // 1 cent = $0.01 = 1,000,000 units of 1/100,000,000 dollar.
  const share = all / 1_000_000;
  return (
    <div className="w-[80%] flex flex-col items-center gap-7">
      <div className="flex flex-col items-center">
        <div className="text-[15px] text-white/55 mb-1">this call</div>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="font-mono text-[60px] font-bold leading-none"
          style={{ color: GOLD }}
        >
          ${scene.printedCost}
        </motion.div>
      </div>
      <div className="w-full flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <span className="w-[90px] text-[14px] text-white/60 text-right">1 cent</span>
          <div className="flex-1 h-6 rounded-md" style={{ background: '#b4533966', border: '1px solid #d97706' }} />
        </div>
        <div className="flex items-center gap-3">
          <span className="w-[90px] text-[14px] text-right" style={{ color: GOLD }}>this call</span>
          <div className="flex-1 h-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(share * 100, 0.4)}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full rounded-sm"
              style={{ background: GOLD, minWidth: 3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CoinStack({ scene }: { scene: TokensCostScene }) {
  const COINS = 14;
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-end justify-center gap-8">
        {/* One call */}
        <div className="flex flex-col items-center gap-2 opacity-60">
          <div className="w-16 h-5 rounded-[50%] border-2" style={{ background: `${GOLD}cc`, borderColor: '#b45309' }} />
          <div className="text-[14px] text-white/70">1 call</div>
          <div className="font-mono text-[15px]" style={{ color: GOLD }}>${scene.printedCost}</div>
        </div>
        <div className="pb-14 text-[20px] font-bold text-white/50">×1,000 ➜</div>
        {/* A thousand calls */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col-reverse items-center">
            {Array.from({ length: COINS }, (_, i) => (
              <motion.div
                key={i}
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...spring, delay: 0.2 + i * 0.09 }}
                className="w-20 h-6 rounded-[50%] border-2 -mt-3 first:mt-0"
                style={{ background: GOLD, borderColor: '#b45309' }}
              />
            ))}
          </div>
          <div className="text-[16px] text-white/80 font-semibold">
            <CountUp to={1000} from={1} run duration={1.4} /> calls
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="font-mono text-[40px] font-bold leading-none"
            style={{ color: GOLD }}
          >
            ${scene.printed1000}
          </motion.div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9 }}
        className="text-[15px] text-white/55"
      >
        1,000,000 calls ≈ <span className="font-mono font-bold" style={{ color: GOLD }}>${scene.million}</span>
      </motion.div>
    </div>
  );
}

function HistoryBars({ scene }: { scene: TokensCostScene }) {
  const max = scene.turns[scene.turns.length - 1];
  return (
    <div className="w-[90%] flex flex-col gap-3">
      <div className="flex items-center justify-between text-[14px] text-white/55 px-1">
        <span>input tokens sent each turn</span>
        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[13px]">illustrative</span>
      </div>
      {scene.turns.map((t, k) => {
        const fresh = k === 0 ? t : 18;
        const old = t - fresh;
        return (
          <div key={k} className="flex items-center gap-3">
            <span className="w-[62px] text-[15px] text-white/70">Turn {k + 1}</span>
            <div className="flex-1 h-9 flex rounded-md overflow-hidden bg-white/[0.03]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(old / max) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.2 + k * 0.35 }}
                style={{ background: `repeating-linear-gradient(135deg, ${IN}55 0 6px, ${IN}22 6px 12px)` }}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max((fresh / max) * 100, 1.5)}%` }}
                transition={{ duration: 0.4, delay: 0.2 + k * 0.35 }}
                style={{ background: IN }}
              />
            </div>
            <span className="w-[70px] font-mono text-[18px] font-bold" style={{ color: IN }}>
              {k === 0 ? '' : '≈'}{num(t)}
            </span>
          </div>
        );
      })}
      <div className="flex items-center gap-5 text-[14px] text-white/60 pl-[74px] mt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-3.5 rounded-sm" style={{ background: `repeating-linear-gradient(135deg, ${IN}88 0 3px, ${IN}33 3px 6px)` }} />
          re-sent history
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-3.5 rounded-sm" style={{ background: IN }} />
          new question
        </span>
      </div>
    </div>
  );
}

function Tips({ focus }: { focus: 'prompts' | 'answers' }) {
  const tips = [
    { key: 'prompts', icon: '✂️', title: 'Shorter prompts', hint: 'cut what isn’t needed' },
    { key: 'answers', icon: '📏', title: 'Shorter answers', hint: '“in 2 sentences”' },
    { key: 'model', icon: '🪙', title: 'Cheaper model', hint: 'mini models cost less' },
  ];
  return (
    <div className="flex items-stretch justify-center gap-4">
      {tips.map((t, i) => {
        const on = t.key === focus;
        return (
          <motion.div
            key={t.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: i * 0.25 }}
            className="w-[200px] rounded-2xl px-4 py-6 flex flex-col items-center gap-2 border-2"
            style={{ borderColor: on ? GREEN : 'rgba(255,255,255,0.14)', background: on ? `${GREEN}10` : 'rgba(255,255,255,0.02)' }}
          >
            <span className="text-[40px] leading-none">{t.icon}</span>
            <span className="text-[18px] font-bold text-center" style={{ color: on ? GREEN : '#e2e8f0' }}>{t.title}</span>
            <span className="text-[14px] text-white/55 text-center">{t.hint}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function Recap() {
  const points = [
    { icon: '🧱', text: 'The API measures text in tokens: input and output.' },
    { icon: '🧾', text: 'tiktoken estimates before sending; response.usage has the exact counts.' },
    { icon: '💰', text: 'Cost = tokens ÷ 1,000,000 × price, and it adds up.' },
  ];
  return (
    <div className="w-[86%] flex flex-col gap-4">
      {points.map((p, i) => (
        <motion.div
          key={p.icon}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring, delay: i * 0.3 }}
          className="flex items-center gap-4 rounded-xl px-5 py-4 bg-white/[0.04] border border-white/10"
        >
          <span className="text-[30px] leading-none">{p.icon}</span>
          <span className="text-[18px] leading-snug text-white/90">{p.text}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export default function TokensCostAnim() {
  const { steps, trig } = useTracerScene();
  const variantId = useTracerStore((s) => s.activeVariantId);
  if (steps.length === 0) return null;

  const scene = tokensCostScenes[variantId] ?? tokensCostScenes.default;
  const longQuestion = scene.question.length > 200;
  const r = rankOf(trig);

  let body: ReactNode = null;
  switch (trig) {
    case 'intro':
      body = <Intro />;
      break;
    case 'setup-tiktoken':
    case 'setup-client':
      body = <Setup focus={trig === 'setup-client' ? 'client' : 'tiktoken'} />;
      break;
    case 'question':
      body = <Slip text={scene.question} long={longQuestion} />;
      break;
    case 'encoder':
      body = <Encoder scene={scene} long={longQuestion} />;
      break;
    case 'bricks':
    case 'estimate':
      body = <Bricks scene={scene} phase={trig} />;
      break;
    case 'send':
    case 'writing':
      body = <Meter scene={scene} phase={trig} />;
      break;
    case 'answer':
      body = <Answer scene={scene} long={scene.answer.length > 600} />;
      break;
    case 'receipt':
      body = <Receipt scene={scene} focus="all" />;
      break;
    case 'receipt-in':
    case 'receipt-out':
    case 'receipt-total':
      body = <Receipt scene={scene} focus={trig.slice(8) as 'in' | 'out' | 'total'} />;
      break;
    case 'price-in':
    case 'price-out':
      body = <Prices phase={trig} />;
      break;
    case 'cost-in':
    case 'cost-out':
    case 'cost-total':
      body = <CostBoard scene={scene} phase={trig} />;
      break;
    case 'cost-print':
      body = <CostPrint scene={scene} />;
      break;
    case 'stack':
      body = <CoinStack scene={scene} />;
      break;
    case 'history':
      body = <HistoryBars scene={scene} />;
      break;
    case 'tips':
      body = <Tips focus={longQuestion ? 'prompts' : 'answers'} />;
      break;
    case 'recap':
      body = <Recap />;
      break;
  }

  // Finished stages, shrunk to chips in the header.
  const showChips = trig !== 'intro' && trig !== 'recap';
  const chips: ReactNode[] = [];
  if (showChips && r > rankOf('estimate')) chips.push(<Chip key="est" color={GREY}>🧱 estimate {num(scene.estimate)}</Chip>);
  if (showChips && r > rankOf('receipt-total'))
    chips.push(
      <Chip key="use" color={GREY}>
        🧾 {num(scene.prompt)} in · {num(scene.completion)} out
      </Chip>,
    );
  if (showChips && r > rankOf('cost-print')) chips.push(<Chip key="cost" color={GOLD}>💰 ${scene.printedCost}</Chip>);

  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-hidden text-white">
      <div className="flex items-center gap-3 flex-shrink-0 min-h-[28px]">
        <div className="text-[16px] font-bold" style={{ color: GOLD }}>🧱 Tokens &amp; Cost</div>
        <div className="ml-auto flex items-center gap-2">{chips}</div>
      </div>
      <div key={`${variantId}-${trig}`} className="flex-1 min-h-0 flex items-center justify-center">
        {body}
      </div>
    </div>
  );
}

