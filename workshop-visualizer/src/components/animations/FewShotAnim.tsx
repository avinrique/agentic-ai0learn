'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';

const spring = { type: 'spring' as const, damping: 20, stiffness: 120 };

function labelColor(label?: string): string {
  const l = (label ?? '').toLowerCase();
  if (l.startsWith('positive')) return '#4ade80';
  if (l.startsWith('negative')) return '#f87171';
  if (l.startsWith('neutral')) return '#fbbf24';
  return '#22d3ee';
}

interface Row {
  input?: string;
  label?: string;
  kind: 'example' | 'real';
}

interface Props {
  /** A typical reply with NO examples (zero-shot), keyed by variant id. */
  zeroShotReplies?: Record<string, string>;
}

export default function FewShotAnim({ zeroShotReplies = {} }: Props) {
  const { currentStep, steps, activeVariantId } = useTracerStore();
  const step = steps[currentStep];
  const trig = step?.animationTrigger;
  const line = step?.lineNumber ?? 0;
  const vars = step?.variables ?? [];
  const get = (n: string) => vars.find((v) => v.name === n)?.value;

  const firstIdx = (t: string) => steps.findIndex((s) => s.animationTrigger === t);
  const reached = (t: string) => {
    const i = firstIdx(t);
    return i >= 0 && currentStep >= i;
  };
  const lineReached = (l: number) => steps.slice(0, currentStep + 1).some((s) => s.lineNumber === l);

  // Everything is drawn from the `messages` variable of the current step.
  let msgs: { role: string; content: string }[] = [];
  try {
    msgs = JSON.parse(get('messages') ?? '[]');
  } catch {
    msgs = [];
  }
  const sys = msgs.find((m) => m.role === 'system');
  const rows: Row[] = [];
  const convo = msgs.filter((m) => m.role !== 'system');
  for (let i = 0; i < convo.length; i++) {
    const m = convo[i];
    if (m.role !== 'user') continue;
    const next = convo[i + 1];
    if (next?.role === 'assistant') rows.push({ input: m.content, label: next.content, kind: 'example' });
    else rows.push({ input: m.content, kind: i === convo.length - 1 && lineReached(19) ? 'real' : 'example' });
  }
  const examples = rows.filter((r) => r.kind === 'example');
  const real = rows.find((r) => r.kind === 'real');

  // Placeholder rows, shown when the code reaches the comment lines.
  const showEx1Placeholder = examples.length === 0 && lineReached(10);
  const showRealPlaceholder = !real && lineReached(18);

  const patternOn = reached('buildFewShot');
  const tripStarted = currentStep >= 0 && lineReached(22);
  const sending = trig === 'apiCall';
  const thinking = trig === 'apiProcessing';
  const predicted = reached('showPrediction');
  const labelPrinted = steps.slice(0, currentStep + 1).some((s) => s.lineNumber === 28 && s.output);
  const compare = reached('compare');
  const isLast = compare && currentStep === steps.length - 1;

  // The model's answer is the text printed on line 28 of this example's trace.
  const prediction = steps.find((s) => s.lineNumber === 28 && s.output)?.output ?? '';
  const zeroShot = zeroShotReplies[activeVariantId] ?? zeroShotReplies.default ?? '';

  const chips = [
    { l: 2, code: 'OpenAI', plain: 'library loaded', on: !!get('OpenAI') },
    { l: 3, code: 'client', plain: 'phone line to OpenAI', on: !!get('client') },
    { l: 5, code: 'print()', plain: 'status message', on: lineReached(5) },
    { l: 7, code: 'messages', plain: 'the made-up conversation', on: lineReached(7) },
  ];
  const setupPhase = !sys;

  const renderRow = (r: Row, i: number) => {
    const isReal = r.kind === 'real';
    const lbl = isReal ? (predicted ? prediction : undefined) : r.label;
    const color = labelColor(lbl);
    const scanning = thinking && !isReal;
    return (
      <motion.div
        key={(isReal ? 'real-' : 'ex-') + i}
        initial={{ opacity: 0, x: isReal ? 80 : 0, y: isReal ? 0 : 16 }}
        animate={{
          opacity: scanning ? [0.5, 1, 0.5] : 1,
          x: 0,
          y: 0,
        }}
        transition={scanning ? { duration: 1.2, repeat: Infinity, delay: i * 0.3 } : spring}
        className="flex items-center gap-3"
      >
        <div className={`w-[74px] text-right text-[13px] flex-shrink-0 font-semibold ${isReal ? 'text-accent-gold' : 'text-white/40'}`}>
          {isReal ? 'NEW' : `Example ${i + 1}`}
        </div>
        <div
          className={`flex-1 min-w-0 rounded-xl px-3.5 py-2 ${
            isReal ? 'border-2 border-accent-blue/60 bg-accent-blue/15 shadow-glow-blue' : 'bg-accent-blue/10'
          }`}
        >
          <div className="text-[13px] text-accent-blue">user</div>
          <div className="text-[15px] text-white/90 truncate">&quot;{r.input}&quot;</div>
        </div>
        <motion.div
          animate={{ opacity: patternOn || isReal ? 1 : 0.5, color: patternOn ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}
          className="text-xl flex-shrink-0"
        >
          ➜
        </motion.div>
        <div className="w-[130px] flex-shrink-0">
          <AnimatePresence mode="popLayout" initial={false}>
            {lbl ? (
              <motion.div
                key={'l-' + lbl}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{
                  scale: isReal && predicted ? [1.25, 1] : 1,
                  opacity: 1,
                  boxShadow: isReal ? `0 0 22px ${color}66` : '0 0 0 rgba(0,0,0,0)',
                }}
                transition={spring}
                className="rounded-xl px-2 py-2 border-2 text-center"
                style={{ borderColor: `${color}88`, backgroundColor: `${color}1f` }}
              >
                <div className="text-[13px]" style={{ color }}>
                  {isReal ? 'AI wrote' : 'assistant'}
                </div>
                <div className="text-[16px] font-bold" style={{ color }}>
                  {lbl}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                animate={thinking && isReal ? { borderColor: ['#fbbf2433', '#fbbf24cc', '#fbbf2433'] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className="rounded-xl px-2 py-2 border-2 border-dashed border-white/20 text-center"
              >
                <div className="text-[13px] text-white/40">{isReal ? 'empty' : 'answer'}</div>
                <div className="text-[16px] font-bold text-white/30">{thinking && isReal ? '...' : '?'}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const placeholder = (label: string, key: string) => (
    <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
      <div className="w-[74px] text-right text-[13px] text-white/30 flex-shrink-0 font-semibold">{label}</div>
      <div className="flex-1 h-14 rounded-xl border-2 border-dashed border-white/10" />
      <div className="text-xl text-white/20">➜</div>
      <div className="w-[130px] h-14 rounded-xl border-2 border-dashed border-white/10" />
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col justify-center px-5 py-4 gap-4 overflow-hidden">
      {/* Setup checklist: only while setting up */}
      {setupPhase && (
        <div className="flex flex-wrap justify-center gap-2">
          {chips.map((c) => {
            const current = line === c.l;
            return (
              <motion.div
                key={c.code}
                animate={{ opacity: c.on ? 1 : 0.25, scale: current ? 1.08 : 1 }}
                transition={spring}
                className={`px-2.5 py-1 rounded-lg text-[14px] ${
                  current ? 'bg-accent-blue/15 ring-1 ring-accent-blue/70' : c.on ? 'bg-white/5' : 'border border-dashed border-white/10'
                }`}
              >
                <span className="font-mono text-accent-blue">{c.code}</span>
                {current && <span className="text-white/60"> · {c.plain}</span>}
              </motion.div>
            );
          })}
        </div>
      )}

      {compare ? (
        /* Zero-shot vs few-shot: the only thing on screen at the end */
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex flex-col gap-3">
          {isLast && (
            <div className="flex justify-center gap-2 text-[13px] font-semibold flex-wrap">
              {['1. examples = user/assistant pairs', '2. called few-shot', '3. AI copies the style'].map((t) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-2.5 py-1 rounded-full bg-accent-gold/20 text-accent-gold"
                >
                  {t}
                </motion.span>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/[0.04] px-4 py-3 flex flex-col gap-2">
              <div className="text-[15px] font-semibold text-white/65">Zero-shot</div>
              <div className="text-[13px] text-white/45">rule only · 2 messages</div>
              <div className="text-[15px] text-white/80 leading-snug">&quot;{zeroShot}&quot;</div>
              <div className="text-[13px] text-accent-red mt-auto">extra words</div>
            </div>
            <motion.div
              animate={{ boxShadow: `0 0 18px ${labelColor(prediction)}44` }}
              className="rounded-2xl border-2 px-4 py-3 flex flex-col gap-2"
              style={{ borderColor: `${labelColor(prediction)}88`, backgroundColor: `${labelColor(prediction)}14` }}
            >
              <div className="text-[15px] font-semibold text-accent-gold">Few-shot</div>
              <div className="text-[13px] text-white/45">
                rule + {examples.length} examples · {msgs.length} messages
              </div>
              <div className="text-[20px] font-bold leading-snug" style={{ color: labelColor(prediction) }}>
                &quot;{prediction}&quot;
              </div>
              <div className="text-[13px] text-accent-green mt-auto">exact format</div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* System rule */}
          {sys && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: examples.length > 0 ? 0.6 : 1, y: 0 }}
              transition={spring}
              className="rounded-xl bg-accent-purple/10 px-4 py-2.5"
            >
              <div className="text-[13px] font-semibold text-accent-purple mb-0.5">system</div>
              <div className="text-[14px] text-white/80 font-mono leading-snug">&quot;{sys.content}&quot;</div>
            </motion.div>
          )}

          {/* Examples = the pattern */}
          {(examples.length > 0 || showEx1Placeholder) && (
            <motion.div
              animate={{
                borderColor: patternOn ? 'rgba(251,191,36,0.55)' : 'rgba(255,255,255,0)',
                backgroundColor: patternOn ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0)',
                opacity: real && !patternOn && !thinking ? 0.7 : 1,
              }}
              className="relative rounded-2xl border-2 border-dashed px-3 pb-3 pt-5 flex flex-col gap-2.5"
            >
              {patternOn && (
                <div className="absolute -top-3 left-4 px-2 text-[13px] font-semibold bg-navy-900 rounded text-accent-gold">
                  ★ sentence ➜ one word
                </div>
              )}
              {examples.map((r, i) => renderRow(r, i))}
              {showEx1Placeholder && placeholder('Example 1', 'ph1')}
            </motion.div>
          )}

          {/* The real question */}
          {(real || showRealPlaceholder) && (
            <div className="px-3">{real ? renderRow(real, 0) : placeholder('NEW', 'ph-real')}</div>
          )}

          {/* Trip to OpenAI */}
          {tripStarted && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-[13px] px-3">
              <span className="text-white/60">💻 laptop</span>
              <div className="relative flex-1 h-7 flex items-center">
                <div className="w-full border-t-2 border-dashed border-white/15" />
                <motion.div
                  className="absolute px-2 py-0.5 rounded-md text-[13px] font-bold whitespace-nowrap"
                  style={{
                    backgroundColor: predicted ? 'rgba(74,222,128,0.2)' : 'rgba(167,139,250,0.2)',
                    color: predicted ? '#4ade80' : '#a78bfa',
                  }}
                  initial={false}
                  animate={{ left: sending ? ['0%', '65%'] : thinking ? '65%' : '0%' }}
                  transition={sending ? { duration: 1.4, repeat: Infinity } : spring}
                >
                  {predicted ? `📩 "${prediction}"` : `✉️ all ${msgs.length} messages`}
                </motion.div>
              </div>
              <span className="text-white/60">☁️ OpenAI</span>
              {labelPrinted && <span className="text-accent-green">✓ printed</span>}
            </motion.div>
          )}

          {/* The list is closed: how many messages go out */}
          {line === 20 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="self-center px-4 py-1.5 rounded-lg bg-accent-gold/15 ring-1 ring-accent-gold/60 font-mono text-[15px] text-accent-gold"
            >
              len(messages) = {msgs.length}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
