'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';

const spring = { type: 'spring' as const, damping: 20, stiffness: 100 };

export default function ApiCallFlow() {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;
  const variables = steps[currentStep]?.variables ?? [];

  // Animation states based on trigger
  const phase = (() => {
    if (!trigger) return 'idle';
    if (trigger === 'import') return 'import';
    if (trigger === 'createClient') return 'client';
    if (trigger === 'selectModel') return 'model';
    if (trigger === 'buildMessages') return 'messages';
    if (trigger === 'apiCall') return 'sending';
    if (trigger === 'apiProcessing') return 'processing';
    if (trigger === 'apiCallComplete') return 'response';
    if (trigger === 'extractContent') return 'extract';
    if (trigger === 'printOutput') return 'output';
    return 'idle';
  })();

  const showClient = ['client', 'model', 'messages', 'sending', 'processing', 'response', 'extract', 'output'].includes(phase);
  const showModel = ['model', 'messages', 'sending', 'processing', 'response', 'extract', 'output'].includes(phase);
  const showMessages = ['messages', 'sending', 'processing', 'response', 'extract', 'output'].includes(phase);
  const isSending = phase === 'sending';
  const isProcessing = phase === 'processing';
  const hasResponse = ['response', 'extract', 'output'].includes(phase);
  const isExtracting = phase === 'extract' || phase === 'output';

  // Get current variable values for display
  const modelVar = variables.find(v => v.name === 'model');
  const contentVar = variables.find(v => v.name === 'content');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top: Your Code → OpenAI flow */}
      <div className="flex-1 flex items-center justify-center px-6 py-4 relative">

        {/* YOUR CODE side */}
        <div className="flex flex-col items-center gap-3 w-48 flex-shrink-0">
          <motion.div
            animate={{
              scale: isSending ? 1.05 : 1,
              borderColor: isSending ? '#4a9eff' : 'rgba(74,158,255,0.3)',
            }}
            transition={spring}
            className="w-full rounded-xl bg-accent-blue/10 border-2 p-4 relative"
          >
            <div className="text-accent-blue font-bold text-sm mb-2">Your Python Code</div>

            {/* Client created */}
            <AnimatePresence>
              {showClient && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={spring}
                  className="text-[10px] font-mono text-white/50 mb-1"
                >
                  client = OpenAI()
                </motion.div>
              )}
            </AnimatePresence>

            {/* Model selection */}
            <AnimatePresence>
              {showModel && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={spring}
                  className="mt-1"
                >
                  <div className="text-[9px] text-white/30 uppercase">model</div>
                  <motion.div
                    animate={{ boxShadow: phase === 'model' ? '0 0 12px rgba(74,158,255,0.4)' : 'none' }}
                    className="inline-block px-2 py-0.5 rounded bg-accent-blue/20 border border-accent-blue/40 text-accent-blue text-[11px] font-mono font-bold"
                  >
                    {modelVar?.value || 'gpt-4o-mini'}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages being built */}
            <AnimatePresence>
              {showMessages && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.1 }}
                  className="mt-2 space-y-1"
                >
                  <div className="text-[9px] text-white/30 uppercase">messages</div>
                  <motion.div
                    animate={{ boxShadow: phase === 'messages' ? '0 0 12px rgba(167,139,250,0.3)' : 'none' }}
                    className="rounded bg-black/20 p-1.5 text-[10px] font-mono space-y-0.5"
                  >
                    <div className="text-accent-purple/80">{'{'}&quot;role&quot;: &quot;user&quot;,</div>
                    <div className="text-accent-blue/80 pl-1">&quot;content&quot;: &quot;Write a funny...&quot;{'}'}</div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* CONNECTION / INTERNET zone */}
        <div className="flex-1 relative mx-4 min-w-[120px]">
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {/* Top line (request path) */}
            <line x1="0" y1="40%" x2="100%" y2="40%" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="6 4" />
            {/* Bottom line (response path) */}
            <line x1="100%" y1="60%" x2="0" y2="60%" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="6 4" />
          </svg>

          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] text-white/15 uppercase tracking-[0.2em]">
            HTTPS Request
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-white/15 uppercase tracking-[0.2em]">
            HTTPS Response
          </div>

          {/* Request packet flying right */}
          <AnimatePresence>
            {isSending && (
              <motion.div
                key="req-packet"
                initial={{ left: '0%', opacity: 0 }}
                animate={{ left: '85%', opacity: [0, 1, 1, 0.8] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                className="absolute top-[32%] -translate-y-1/2"
                style={{ zIndex: 20 }}
              >
                <div className="px-3 py-2 rounded-lg bg-accent-blue shadow-glow-blue text-navy-900 text-[10px] font-bold whitespace-nowrap">
                  <div className="text-[8px] opacity-60">POST /v1/chat/completions</div>
                  <div>model + messages</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing indicator */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 rounded-full border-2 border-accent-gold/30 border-t-accent-gold"
                />
                <div className="text-[9px] text-accent-gold text-center mt-1">Thinking...</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Response packet flying left */}
          <AnimatePresence>
            {hasResponse && (
              <motion.div
                key="res-packet"
                initial={{ left: '85%', opacity: 0 }}
                animate={{ left: '0%', opacity: [0, 1, 1, 0.8] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                className="absolute top-[58%] -translate-y-1/2"
                style={{ zIndex: 20 }}
              >
                <div className="px-3 py-2 rounded-lg bg-accent-green shadow-glow-green text-navy-900 text-[10px] font-bold whitespace-nowrap">
                  <div className="text-[8px] opacity-60">200 OK</div>
                  <div>choices[0].message</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* OPENAI SERVER side */}
        <div className="flex flex-col items-center gap-3 w-48 flex-shrink-0">
          <motion.div
            animate={{
              scale: isProcessing ? 1.05 : 1,
              borderColor: isProcessing
                ? '#fbbf24'
                : hasResponse
                ? '#4ade80'
                : 'rgba(74,222,128,0.3)',
              boxShadow: isProcessing
                ? '0 0 30px rgba(251,191,36,0.2)'
                : hasResponse
                ? '0 0 20px rgba(74,222,128,0.15)'
                : 'none',
            }}
            transition={spring}
            className="w-full rounded-xl bg-accent-green/10 border-2 p-4"
          >
            <div className="text-accent-green font-bold text-sm mb-2">OpenAI API Server</div>
            <div className="text-[10px] font-mono text-white/40 space-y-1">
              <div>Endpoint: /v1/chat/completions</div>
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-accent-gold"
                  >
                    Processing with gpt-4o-mini...
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {hasResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={spring}
                    className="text-accent-green"
                  >
                    Response generated!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom: Extracted content display */}
      <AnimatePresence>
        {isExtracting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={spring}
            className="border-t border-white/10 px-6 py-3 bg-navy-800/50"
          >
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
              response.choices[0].message.content
            </div>
            <div className="px-3 py-2 rounded-lg bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm font-mono">
              {contentVar?.value || '"Oh AI, you slice through data with ease..."'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
