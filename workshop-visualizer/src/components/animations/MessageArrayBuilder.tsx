'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';

const spring = { type: 'spring' as const, damping: 20, stiffness: 100 };

const roleConfig: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  system: { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.4)', text: '#a78bfa', glow: 'rgba(167,139,250,0.2)' },
  user: { bg: 'rgba(74,158,255,0.12)', border: 'rgba(74,158,255,0.4)', text: '#4a9eff', glow: 'rgba(74,158,255,0.2)' },
  assistant: { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.4)', text: '#4ade80', glow: 'rgba(74,222,128,0.2)' },
};

export default function MessageArrayBuilder() {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;
  const variables = steps[currentStep]?.variables ?? [];

  // Parse which messages to show based on trigger
  const phase = (() => {
    if (!trigger) return 'idle';
    if (trigger === 'import') return 'import';
    if (trigger === 'createClient') return 'client';
    if (trigger === 'addSystemMsg') return 'system';
    if (trigger === 'addUserMsg') return 'user';
    if (trigger === 'buildMessages') return 'all';
    if (trigger === 'apiCall' || trigger === 'apiProcessing') return 'sending';
    if (trigger === 'apiCallComplete') return 'response';
    if (trigger === 'extractContent') return 'extract';
    if (trigger === 'printOutput') return 'output';
    // For few-shot
    if (trigger === 'addExample1User') return 'ex1u';
    if (trigger === 'addExample1Asst') return 'ex1a';
    if (trigger === 'addExample2User') return 'ex2u';
    if (trigger === 'addExample2Asst') return 'ex2a';
    if (trigger === 'addRealQuestion') return 'real';
    return trigger || 'idle';
  })();

  // Determine messages to show from variables
  const messagesList: Array<{ role: string; content: string }> = [];
  const messagesVar = variables.find(v => v.name === 'messages_display');

  if (messagesVar) {
    try {
      const parsed = JSON.parse(messagesVar.value);
      messagesList.push(...parsed);
    } catch {
      // fallback
    }
  }

  // Fallback: build messages based on phase for system-prompts lesson
  if (messagesList.length === 0) {
    if (['system', 'user', 'all', 'sending', 'response', 'extract', 'output'].includes(phase)) {
      messagesList.push({ role: 'system', content: 'You are a friendly Python tutor.' });
    }
    if (['user', 'all', 'sending', 'response', 'extract', 'output'].includes(phase)) {
      messagesList.push({ role: 'user', content: 'Explain what a list comprehension is with an example.' });
    }
  }

  const isSending = phase === 'sending';
  const hasResponse = ['response', 'extract', 'output'].includes(phase);

  return (
    <div className="h-full flex flex-col items-center p-6 overflow-auto">
      <div className="text-[10px] text-white/20 uppercase tracking-widest mb-3">Message Array Construction</div>

      {/* Messages array visualized */}
      <div className="w-full max-w-lg">
        <div className="text-xs font-mono text-white/30 mb-2">messages = [</div>
        <div className="space-y-2 pl-4">
          <AnimatePresence>
            {messagesList.map((msg, i) => {
              const config = roleConfig[msg.role] || roleConfig.user;
              const isNewest = i === messagesList.length - 1;
              return (
                <motion.div
                  key={`${msg.role}-${i}-${msg.content.slice(0, 20)}`}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    boxShadow: isNewest ? `0 0 20px ${config.glow}` : 'none',
                  }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ ...spring, delay: i * 0.1 }}
                  className="rounded-lg p-3 border-2"
                  style={{
                    backgroundColor: config.bg,
                    borderColor: isNewest ? config.border : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: config.text, backgroundColor: `${config.text}15` }}
                    >
                      {msg.role}
                    </span>
                    <span className="text-[9px] text-white/20 font-mono">
                      {'{'}  &quot;role&quot;: &quot;{msg.role}&quot;  {'}'}
                    </span>
                  </div>
                  <div className="text-white/70 text-sm font-mono leading-relaxed pl-2 border-l-2" style={{ borderColor: `${config.text}30` }}>
                    &quot;{msg.content}&quot;
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {messagesList.length === 0 && (
            <div className="text-white/15 text-xs italic py-4 text-center">Messages will appear here as they are added...</div>
          )}
        </div>
        <div className="text-xs font-mono text-white/30 mt-2">]</div>
      </div>

      {/* Sending indicator */}
      <AnimatePresence>
        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="mt-4 flex items-center gap-2 text-accent-blue text-xs"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-3 h-3 rounded-full border border-accent-blue/40 border-t-accent-blue"
            />
            Sending {messagesList.length} messages to OpenAI API...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response received */}
      <AnimatePresence>
        {hasResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="mt-4 w-full max-w-lg"
          >
            <div className="rounded-lg p-3 border-2" style={{ backgroundColor: roleConfig.assistant.bg, borderColor: roleConfig.assistant.border }}>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-accent-green bg-accent-green/15">
                assistant response
              </span>
              <div className="text-white/70 text-sm font-mono leading-relaxed mt-2">
                {variables.find(v => v.name === 'content')?.value || 'Response content...'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
