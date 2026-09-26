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
  const systemPrompt = unquote(get('system_prompt'));
  const userPrompt = unquote(get('user_prompt'));

  const sent = reached >= JSON_RANK.apiCall;
  const received = reached >= JSON_RANK.apiCallComplete;
  const jsonMode = reached >= JSON_RANK.buildMessages;

  return (
    <div className="h-full flex gap-2 p-3 overflow-hidden text-white">
      {/* LAPTOP */}
      <motion.div
        animate={{ borderColor: reached >= 2 && !sent ? 'rgba(74,158,255,0.6)' : 'rgba(74,158,255,0.25)' }}
        className="flex-[1.4] min-w-0 rounded-xl border-2 bg-accent-blue/5 p-2 flex flex-col gap-1.5 overflow-hidden"
      >
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className="text-sm font-bold text-accent-blue">Your laptop</span>
          {reached >= 2 && (
            <Pop on={at('import')} color="#a78bfa" className="rounded px-1.5 bg-accent-purple/10 border border-accent-purple/30 text-xs font-mono text-accent-purple">
              openai
            </Pop>
          )}
          {reached >= 3 && (
            <Pop on={at('createClient')} color="#4a9eff" className="rounded px-1.5 bg-accent-blue/10 border border-accent-blue/30 text-xs font-mono text-accent-blue">
              client <span className="font-sans text-white/45">(phone line)</span>
            </Pop>
          )}
        </div>

        {reached < JSON_RANK.startRequest && (
          <div className="text-xs text-white/40 leading-snug">
            {reached >= JSON_RANK.addSystemMsg
              ? 'First we write the two prompts (see below). Then we pack them into a request.'
              : 'Goal: ask the AI for data that a program can read, not a chatty paragraph.'}
          </div>
        )}

        {reached >= JSON_RANK.startRequest && !sent && (
          <Pop
            on={at('startRequest')}
            color="#4a9eff"
            className="flex-1 min-h-0 rounded-lg border border-dashed border-accent-blue/40 bg-navy-900/60 p-1.5 flex flex-col gap-1 overflow-hidden relative"
          >
            <div className="flex items-center gap-2 shrink-0">
              <Envelope color="#4a9eff" size={22} />
              <span className="text-xs font-bold text-white/85">The request</span>
              {reached >= JSON_RANK.selectModel && (
                <Pop on={at('selectModel')} color="#4a9eff" className="rounded px-1.5 bg-accent-blue/20 border border-accent-blue/50 text-xs font-mono text-accent-blue font-bold">
                  {model}
                </Pop>
              )}
            </div>
            {reached >= JSON_RANK.packSystem && (
              <Pop on={at('packSystem')} color="#a78bfa" className="rounded-md bg-accent-purple/10 border border-accent-purple/30 px-1.5 py-0.5 text-xs truncate">
                <span className="font-mono font-bold text-accent-purple">system</span>
                <span className="text-white/40 font-mono"> = system_prompt: </span>
                <span className="text-white/70">{systemPrompt}</span>
              </Pop>
            )}
            {reached >= JSON_RANK.packUser && (
              <Pop on={at('packUser')} color="#4a9eff" className="rounded-md bg-accent-blue/10 border border-accent-blue/30 px-1.5 py-0.5 text-xs truncate">
                <span className="font-mono font-bold text-accent-blue">user</span>
                <span className="text-white/40 font-mono"> = user_prompt: </span>
                <span className="text-white/70">{userPrompt}</span>
              </Pop>
            )}
            {jsonMode && (
              <motion.div
                initial={{ opacity: 0, scale: 1.8, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: -4 }}
                transition={{ type: 'spring', damping: 12, stiffness: 180 }}
                className="self-end rounded-md border-2 border-accent-gold bg-accent-gold/15 px-2 py-0.5 text-xs font-bold text-accent-gold"
              >
                JSON MODE ON
                <span className="font-mono font-normal text-white/60"> response_format</span>
              </motion.div>
            )}
          </Pop>
        )}

        {sent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-white/55">
            <Envelope color="rgba(255,255,255,0.4)" size={18} />
            Request sent: {model} + 2 messages + JSON mode
          </motion.div>
        )}
        {(at('apiCall') || at('apiProcessing')) && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="text-xs text-accent-gold"
          >
            Line 11 is waiting for the answer…
          </motion.div>
        )}
        {received && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-xs text-accent-green">
            <span className="rounded bg-accent-green/20 border border-accent-green/50 px-1 font-mono font-bold">{'{ }'}</span>
            response arrived: its content is JSON text (see below)
          </motion.div>
        )}
      </motion.div>

      {/* INTERNET LANE */}
      <div className="flex-[0.45] min-w-[80px] flex flex-col justify-center gap-5">
        <div className="text-[11px] text-center text-white/35 uppercase tracking-widest">internet</div>
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-accent-blue/25" />
          {at('apiCall') && (
            <motion.div
              key={`req-${resetKey}`}
              initial={{ left: '0%', opacity: 0 }}
              animate={{ left: '50%', opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute top-0 flex flex-col items-center"
            >
              <Envelope color="#4a9eff" size={30} />
            </motion.div>
          )}
          <div className="absolute inset-x-0 -bottom-4 text-center text-[11px] text-white/40">{sent ? '✓ sent' : 'request →'}</div>
        </div>
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-accent-green/25" />
          {at('apiCallComplete') && (
            <motion.div
              key={`res-${resetKey}`}
              initial={{ left: '50%', opacity: 0 }}
              animate={{ left: '0%', opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute top-1 rounded bg-accent-green/25 border-2 border-accent-green px-1 font-mono text-[11px] font-bold text-accent-green"
            >
              {'{ }'}
            </motion.div>
          )}
          <div className="absolute inset-x-0 -bottom-4 text-center text-[11px] text-white/40">{received ? '✓ received' : '← response'}</div>
        </div>
      </div>

      {/* OPENAI SERVER */}
      <motion.div
        animate={{
          borderColor: at('apiProcessing') ? '#fbbf24' : sent ? 'rgba(74,222,128,0.6)' : 'rgba(74,222,128,0.2)',
          boxShadow: at('apiProcessing') ? '0 0 24px rgba(251,191,36,0.2)' : 'none',
        }}
        className="flex-1 min-w-0 rounded-xl border-2 bg-accent-green/5 p-2 flex flex-col gap-1.5 overflow-hidden"
      >
        <span className="text-sm font-bold text-accent-green shrink-0">OpenAI server</span>
        {!sent ? (
          <div className="text-xs text-white/40 leading-snug">Waits for your request and runs the AI model.</div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-white/70">
              Running <span className="font-mono text-accent-blue">{model}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-md border border-accent-gold/40 bg-accent-gold/10 px-1.5 py-1 text-xs text-accent-gold"
            >
              JSON mode rule: the reply must be valid JSON. No chatty sentences.
            </motion.div>
            {reached >= JSON_RANK.apiProcessing && (
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                {at('apiProcessing') ? (
                  <>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-accent-gold"
                      />
                    ))}
                    <span className="text-accent-gold">writing JSON…</span>
                  </>
                ) : (
                  <span className="text-accent-green">✓ JSON reply sent back</span>
                )}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
