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
  const listClosed = lineReached(20);
  const tripStarted = currentStep >= 0 && lineReached(22);
  const sending = trig === 'apiCall';
  const thinking = trig === 'apiProcessing';
  const predicted = reached('showPrediction');
  const headingPrinted = lineReached(27);
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
        className="flex items-center gap-2"
      >
        <div className={`w-16 text-right text-xs flex-shrink-0 font-bold ${isReal ? 'text-accent-gold' : 'text-white/40'}`}>
          {isReal ? 'NEW' : `Example ${i + 1}`}
        </div>
        <div
          className={`flex-1 min-w-0 rounded-lg px-3 py-1.5 border ${
            isReal ? 'border-2 border-accent-blue/60 bg-accent-blue/15 shadow-glow-blue' : 'border-accent-blue/30 bg-accent-blue/10'
          }`}
        >
          <div className="text-[11px] text-accent-blue font-bold">user (input)</div>
          <div className="text-sm text-white/90 truncate">&quot;{r.input}&quot;</div>
        </div>
        <motion.div
          animate={{ opacity: patternOn || isReal ? 1 : 0.5, color: patternOn ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}
          className="text-lg flex-shrink-0"
        >
          ➜
        </motion.div>
        <div className="w-[120px] flex-shrink-0">
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
                className="rounded-lg px-2 py-1.5 border-2 text-center"
                style={{ borderColor: `${color}88`, backgroundColor: `${color}1f` }}
              >
                <div className="text-[11px] font-bold" style={{ color }}>
                  {isReal ? 'AI wrote' : 'assistant (label)'}
                </div>
                <div className="text-sm font-bold" style={{ color }}>
                  {lbl}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                animate={thinking && isReal ? { borderColor: ['#fbbf2433', '#fbbf24cc', '#fbbf2433'] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className="rounded-lg px-2 py-1.5 border-2 border-dashed border-white/20 text-center"
              >
                <div className="text-[11px] text-white/40 font-bold">{isReal ? 'empty slot' : 'answer'}</div>
                <div className="text-sm font-bold text-white/30">{thinking && isReal ? '...' : '?'}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const placeholder = (label: string, key: string) => (
    <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
      <div className="w-16 text-right text-xs text-white/30 flex-shrink-0 font-bold">{label}</div>
      <div className="flex-1 h-11 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-xs text-white/30">
        coming next: input
      </div>
      <div className="text-lg text-white/20">➜</div>
      <div className="w-[120px] h-11 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-xs text-white/30">
        label
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col p-4 gap-2.5 overflow-hidden">
      <div className="text-center text-xs text-white/40 uppercase tracking-widest">Few-shot learning: teaching by example</div>

      {/* Setup checklist */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {chips.map((c) => {
          const current = setupPhase && line === c.l;
          return (
            <motion.div
              key={c.code}
              animate={{ opacity: c.on ? 1 : 0.25, scale: current ? 1.08 : 1 }}
              transition={spring}
              className={`px-2 py-1 rounded-md border text-xs ${
                current
                  ? 'border-accent-blue/70 bg-accent-blue/15 shadow-glow-blue'
                  : c.on
                  ? 'border-white/15 bg-white/5'
                  : 'border-dashed border-white/10'
              }`}
            >
              <span className="font-mono text-accent-blue">{c.code}</span>
              <span className="text-white/50"> · {c.plain}</span>
            </motion.div>
          );
        })}
        {listClosed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: line === 20 ? 1.08 : 1 }}
            className={`px-2 py-1 rounded-md border text-xs ${
              line === 20 ? 'border-accent-gold/70 bg-accent-gold/15 shadow-glow-gold' : 'border-white/15 bg-white/5'
            }`}
          >
            <span className="font-mono text-accent-gold">len(messages) = {msgs.length}</span>
            <span className="text-white/50"> · list closed with ]</span>
          </motion.div>
        )}
      </div>

      {/* System rule */}
      {sys ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="rounded-lg border border-accent-purple/40 bg-accent-purple/10 px-3 py-1.5"
        >
          <span className="text-xs font-bold text-accent-purple">system (the job): </span>
          <span className="text-xs text-white/80 font-mono">&quot;{sys.content}&quot;</span>
        </motion.div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/10 px-3 py-1.5 text-xs text-white/30 text-center">
          {lineReached(7) ? 'messages = [ ... ] is open. The job description goes first.' : 'No messages yet.'}
        </div>
      )}

      {/* Examples = the pattern */}
      <motion.div
        animate={{
          borderColor: patternOn ? 'rgba(251,191,36,0.55)' : 'rgba(255,255,255,0.08)',
          backgroundColor: patternOn ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0)',
        }}
        className="relative rounded-xl border-2 border-dashed p-2.5 pt-4 flex flex-col gap-2"
      >
        <div className="absolute -top-2.5 left-3 px-2 text-[11px] font-bold bg-navy-900 rounded">
          {patternOn ? (
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-accent-gold"
            >
              ★ Pattern: a sentence goes in ➜ ONE word label comes out
            </motion.span>
          ) : (
            <span className="text-white/40">Examples (we write both sides)</span>
          )}
        </div>
        {examples.map((r, i) => renderRow(r, i))}
        {showEx1Placeholder && placeholder('Example 1', 'ph1')}
        {examples.length === 0 && !showEx1Placeholder && (
          <div className="h-11 flex items-center justify-center text-xs text-white/25">examples will line up here</div>
        )}
      </motion.div>

      {/* The real question */}
      <div className="flex flex-col gap-1">
        {real ? renderRow(real, 0) : showRealPlaceholder ? placeholder('NEW', 'ph-real') : null}
        {(real || showRealPlaceholder) && !predicted && (
          <div className="text-[11px] text-white/40 text-center">
            {real ? 'No answer after this one. The AI must fill the empty slot.' : 'The real question slides in here, with NO answer.'}
          </div>
        )}
      </div>

      {/* Trip + output, then the zero-shot vs few-shot comparison */}
      <div className="flex-1 min-h-0 flex flex-col justify-end gap-2">
        {tripStarted && !compare && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/70">💻 Your laptop</span>
            <div className="relative flex-1 h-6 flex items-center">
              <div className="w-full border-t-2 border-dashed border-white/15" />
              <motion.div
                className="absolute px-1.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap"
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
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/70">☁️ OpenAI</span>
            <span className="w-[190px] text-[11px] text-white/50 leading-tight">
              {sending
                ? 'Sending the examples AND the question'
                : thinking
                ? 'The AI studies the examples, then continues the pattern'
                : labelPrinted
                ? `print() showed: ${prediction}`
                : headingPrinted
                ? 'print() wrote the heading line'
                : predicted
                ? 'Reply received and saved in response'
                : 'create() is ready to send'}
            </span>
          </motion.div>
        )}

        {compare && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex flex-col gap-1.5">
            {isLast ? (
              <div className="flex justify-center gap-2 text-[11px] font-bold flex-wrap">
                {['1. examples = user/assistant pairs', '2. called few-shot', '3. AI copies the style'].map((t) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-2 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold"
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-white/50 text-center">Same question, two ways of asking</div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/15 bg-white/5 p-2.5 flex flex-col gap-1">
                <div className="text-xs font-bold text-white/60">Zero-shot: rule only, no examples</div>
                <div className="text-[11px] text-white/40 font-mono">2 messages: system + question</div>
                <div className="text-xs text-white/40">a possible reply:</div>
                <div className="text-sm text-white/80 leading-snug">&quot;{zeroShot}&quot;</div>
                <div className="text-[11px] text-accent-red mt-auto">format can drift: extra words</div>
              </div>
              <motion.div
                animate={{ boxShadow: `0 0 18px ${labelColor(prediction)}44` }}
                className="rounded-lg border-2 p-2.5 flex flex-col gap-1"
                style={{ borderColor: `${labelColor(prediction)}88`, backgroundColor: `${labelColor(prediction)}14` }}
              >
                <div className="text-xs font-bold text-accent-gold">Few-shot: rule + {examples.length} examples</div>
                <div className="text-[11px] text-white/40 font-mono">{msgs.length} messages</div>
                <div className="text-xs text-white/40">the reply:</div>
                <div className="text-sm font-bold leading-snug" style={{ color: labelColor(prediction) }}>
                  &quot;{prediction}&quot;
                </div>
                <div className="text-[11px] text-accent-green mt-auto">exactly the example format</div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {!tripStarted && (
          <div className="text-center text-xs text-white/30">
            {currentStep === 0 ? 'Watch the examples line up, then the AI fill in the last answer.' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
