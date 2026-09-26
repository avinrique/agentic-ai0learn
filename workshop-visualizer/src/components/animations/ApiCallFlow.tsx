'use client';
import { motion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';
import { useTracerStore } from '@/stores/tracerStore';

// ─────────────────────────────────────────────────────────────────────────────
// ApiCallFlow: compact round trip for the JSON Output lesson.
// Laptop packs a request (model + system/user messages + JSON-mode stamp) →
// it travels to the OpenAI server → a JSON reply travels back.
// Everything is derived from the step index, so Prev/Next/jumps render correctly.
// ─────────────────────────────────────────────────────────────────────────────

const spring = { type: 'spring' as const, damping: 22, stiffness: 140 };

// Shared with JsonParseAnim (it also understands the challenge's triggers).
export const JSON_RANK: Record<string, number> = {
  intro: 0,
  jsonIntro: 1,
  import: 2,
  createClient: 3,
  printStart: 4,
  addSystemMsg: 5,
  addUserMsg: 6,
  highlightKeys: 7,
  startRequest: 8,
  selectModel: 9,
  packSystem: 10,
  packUser: 11,
  buildMessages: 12,
  whyBoth: 13,
  apiCall: 14,
  apiProcessing: 15,
  apiCallComplete: 16,
  printHeading: 17,
  extractContent: 18,
  isString: 19,
  jsonParse: 20,
  printOutput: 21,
  summary: 22,
};

export function reachedRank(steps: { animationTrigger?: string }[], currentStep: number) {
  let r = 0;
  for (let i = 0; i <= currentStep && i < steps.length; i++) {
    const t = steps[i].animationTrigger;
    if (t && JSON_RANK[t] !== undefined) r = Math.max(r, JSON_RANK[t]);
  }
  return r;
}

function Envelope({ color, size = 32 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 40 28" fill="none">
      <rect x="1" y="1" width="38" height="26" rx="3" fill={`${color}33`} stroke={color} strokeWidth="2" />
      <path d="M2 3 L20 16 L38 3" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

function Pop({ on, color, children, className = '' }: { on: boolean; color: string; children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: on ? `0 0 0 1px ${color}, 0 0 14px ${color}55` : '0 0 0 0px rgba(0,0,0,0)',
      }}
      transition={spring}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function unquote(s?: string) {
  return (s ?? '').replace(/^("""|")|("""|")$/g, '');
}

export default function ApiCallFlow() {
  const { currentStep, steps, activeVariantId } = useTracerStore();
  const step = steps[currentStep];
  const cur = step?.animationTrigger ?? '';
  const at = (t: string) => cur === t;
  const reached = useMemo(() => reachedRank(steps, currentStep), [steps, currentStep]);
  const resetKey = `${activeVariantId}-${currentStep}`;

  const vars = step?.variables ?? [];
  const finalVars = steps[steps.length - 1]?.variables ?? [];
  const get = (n: string) => vars.find((v) => v.name === n)?.value ?? finalVars.find((v) => v.name === n)?.value;
  const model = unquote(get('model') ?? '"gpt-4o-mini"');

  const sent = reached >= JSON_RANK.apiCall;
  const received = reached >= JSON_RANK.apiCallComplete;
  const jsonMode = reached >= JSON_RANK.buildMessages;
  const packing = reached >= JSON_RANK.startRequest && !sent;
  const thinking = at('apiProcessing');
  // This panel is the focus from the import until the reply arrives.
  const focus =
    (reached >= JSON_RANK.import && reached <= JSON_RANK.createClient) ||
    (reached >= JSON_RANK.startRequest && reached <= JSON_RANK.apiCallComplete && !at('whyBoth') && !at('buildMessages'));

  return (
    <motion.div
      animate={{ opacity: focus ? 1 : 0.5 }}
      transition={{ duration: 0.3 }}
      className="h-full flex items-center gap-3 px-5 py-3 overflow-hidden text-white"
    >
      {/* LAPTOP */}
      <div className="flex-[1.5] min-w-0 h-full rounded-2xl bg-accent-blue/[0.06] px-4 py-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className="text-[15px] font-semibold text-accent-blue mr-1">Your laptop</span>
          {reached >= JSON_RANK.import && (
            <Pop on={at('import')} color="#a78bfa" className="rounded-md px-2 py-0.5 bg-accent-purple/10 text-[13px] font-mono text-accent-purple">
              openai
            </Pop>
          )}
          {reached >= JSON_RANK.createClient && (
            <Pop on={at('createClient')} color="#4a9eff" className="rounded-md px-2 py-0.5 bg-accent-blue/10 text-[13px] font-mono text-accent-blue">
              client
            </Pop>
          )}
        </div>

        {packing && (
          <Pop
            on={at('startRequest')}
            color="#4a9eff"
            className="flex-1 min-h-0 rounded-xl bg-navy-900/60 px-3 py-2.5 flex flex-col gap-2 overflow-hidden"
          >
            <div className="flex items-center gap-2 shrink-0">
              <Envelope color="#4a9eff" size={24} />
              <span className="text-[14px] font-semibold text-white/85">request</span>
              {reached >= JSON_RANK.selectModel && (
                <Pop on={at('selectModel')} color="#4a9eff" className="rounded-md px-2 py-0.5 bg-accent-blue/15 text-[13px] font-mono text-accent-blue">
                  {model}
                </Pop>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {reached >= JSON_RANK.packSystem && (
                <Pop on={at('packSystem')} color="#a78bfa" className="rounded-lg bg-accent-purple/15 px-2.5 py-1 text-[14px] font-mono text-accent-purple">
                  system
                </Pop>
              )}
              {reached >= JSON_RANK.packUser && (
                <Pop on={at('packUser')} color="#4a9eff" className="rounded-lg bg-accent-blue/15 px-2.5 py-1 text-[14px] font-mono text-accent-blue">
                  user
                </Pop>
              )}
              {jsonMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 1.8, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: -4 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 180 }}
                  className="ml-auto rounded-md border-2 border-accent-gold bg-accent-gold/15 px-2 py-0.5 text-[13px] font-bold text-accent-gold"
                >
                  JSON MODE ON
                </motion.div>
              )}
            </div>
          </Pop>
        )}

        {sent && (
          <div className="flex flex-col gap-2 text-[14px]">
            <div className="flex items-center gap-2 text-white/50">
              <Envelope color="rgba(255,255,255,0.4)" size={20} />
              sent
            </div>
            {received && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-accent-green">
                <span className="rounded bg-accent-green/20 px-1.5 font-mono font-bold">{'{ }'}</span>
                response
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* INTERNET LANE */}
      <div className="flex-[0.5] min-w-[70px] flex flex-col justify-center gap-6">
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-accent-blue/25" />
          {at('apiCall') && (
            <motion.div
              key={`req-${resetKey}`}
              initial={{ left: '0%', opacity: 0 }}
              animate={{ left: '55%', opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute top-0"
            >
              <Envelope color="#4a9eff" size={30} />
            </motion.div>
          )}
          {!at('apiCall') && <span className="absolute right-0 top-1/2 -translate-y-1/2 text-accent-blue/40 text-[15px]">→</span>}
        </div>
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-accent-green/25" />
          {at('apiCallComplete') && (
            <motion.div
              key={`res-${resetKey}`}
              initial={{ left: '55%', opacity: 0 }}
              animate={{ left: '0%', opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute top-1 rounded bg-accent-green/25 border-2 border-accent-green px-1 font-mono text-[13px] font-bold text-accent-green"
            >
              {'{ }'}
            </motion.div>
          )}
          {!at('apiCallComplete') && <span className="absolute left-0 top-1/2 -translate-y-1/2 text-accent-green/40 text-[15px]">←</span>}
        </div>
      </div>

      {/* OPENAI SERVER */}
      <motion.div
        animate={{
          borderColor: thinking ? '#fbbf24' : sent ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.15)',
          boxShadow: thinking ? '0 0 24px rgba(251,191,36,0.25)' : 'none',
        }}
        className="flex-1 min-w-0 h-full rounded-2xl border-2 bg-accent-green/[0.04] px-4 py-3 flex flex-col items-center justify-center gap-2 text-center"
      >
        <span className="text-[16px] font-semibold text-accent-green">OpenAI</span>
        {thinking ? (
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-accent-gold"
              />
            ))}
            <span className="text-[14px] text-accent-gold ml-1">writing JSON</span>
          </div>
        ) : (
          <span className={`text-[14px] ${received ? 'text-accent-green' : sent ? 'text-white/70' : 'text-white/35'}`}>
            {received ? '✓ done' : sent ? model : 'waiting'}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
