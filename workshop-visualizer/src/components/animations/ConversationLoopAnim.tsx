'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';
import { useMemo } from 'react';

const spring = { type: 'spring' as const, damping: 20, stiffness: 100 };

const roleColors: Record<string, { bg: string; border: string; text: string; glow: string; label: string }> = {
  system:    { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.4)', text: '#a78bfa', glow: 'rgba(167,139,250,0.2)', label: 'SYSTEM' },
  user:      { bg: 'rgba(74,158,255,0.12)',  border: 'rgba(74,158,255,0.4)',  text: '#4a9eff', glow: 'rgba(74,158,255,0.2)',  label: 'USER' },
  assistant: { bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.4)',  text: '#4ade80', glow: 'rgba(74,222,128,0.2)',  label: 'ASSISTANT' },
};

interface Message {
  role: string;
  content: string;
}

// Map triggers to cumulative message state
const triggerMessages: Record<string, Message[]> = {
  initMessages: [
    { role: 'system', content: 'You are a helpful assistant.' },
  ],
  loopStart: [
    { role: 'system', content: 'You are a helpful assistant.' },
  ],
  userInput1: [
    { role: 'system', content: 'You are a helpful assistant.' },
  ],
  appendUser1: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is Python?' },
  ],
  apiCall1: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is Python?' },
  ],
  apiResponse1: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is Python?' },
  ],
  appendAssistant1: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is Python?' },
    { role: 'assistant', content: 'Python is a high-level programming language...' },
  ],
  printResponse1: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is Python?' },
    { role: 'assistant', content: 'Python is a high-level programming language...' },
  ],
  userInput2: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is Python?' },
    { role: 'assistant', content: 'Python is a high-level programming language...' },
  ],
  appendUser2: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is Python?' },
    { role: 'assistant', content: 'Python is a high-level programming language...' },
    { role: 'user', content: 'How is it different from Java?' },
  ],
  apiCall2: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is Python?' },
    { role: 'assistant', content: 'Python is a high-level programming language...' },
    { role: 'user', content: 'How is it different from Java?' },
  ],
  appendAssistant2: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is Python?' },
    { role: 'assistant', content: 'Python is a high-level programming language...' },
    { role: 'user', content: 'How is it different from Java?' },
    { role: 'assistant', content: 'Python uses dynamic typing while Java uses static typing...' },
  ],
};

const tokenEstimates: Record<number, number> = {
  1: 15,
  2: 50,
  3: 127,
  4: 384,
  5: 500,
};

const insightCallouts: Record<string, { text: string; color: string }> = {
  appendAssistant1: { text: "The AI has no memory \u2014 we REPLAY everything each turn", color: '#fbbf24' },
  userInput2:       { text: "Turn 2: 'How is it different from Java?' \u2014 no mention of Python!", color: '#4a9eff' },
  appendAssistant2: { text: "It worked! The AI saw the full history and knew 'it' = Python", color: '#4ade80' },
};

const apiCallInfo: Record<string, string> = {
  apiCall1:    'Sending 2 messages \u2192 OpenAI',
  apiResponse1: 'Response received',
  apiCall2:    'Sending 4 messages \u2192 OpenAI  (~384 tokens)',
};

export default function ConversationLoopAnim() {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;

  // Build messages array from trigger
  const messages = useMemo(() => {
    if (!trigger) return [];
    // Try to read from variables first (for variant support)
    const variables = steps[currentStep]?.variables ?? [];
    const messagesVar = variables.find(v => v.name === 'messages');
    if (messagesVar) {
      try {
        const parsed = JSON.parse(messagesVar.value);
        if (Array.isArray(parsed)) return parsed as Message[];
      } catch {
        // Fall through to static mapping
      }
    }
    return triggerMessages[trigger] || [];
  }, [trigger, currentStep, steps]);

  const msgCount = messages.length;
  const tokenCount = tokenEstimates[msgCount] || 0;

  const isSending = trigger === 'apiCall1' || trigger === 'apiCall2' || trigger === 'apiResponse1';
  const calloutInfo = trigger ? insightCallouts[trigger] : undefined;
  const apiInfo = trigger ? apiCallInfo[trigger] : undefined;

  return (
    <div className="h-full flex flex-col p-4 gap-3 overflow-hidden">
      {/* Zone 1: Messages Array */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Header with count + tokens */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-white/40">messages = [</span>
            <AnimatePresence mode="wait">
              {msgCount > 0 && (
                <motion.span
                  key={msgCount}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
                >
                  {msgCount} msg{msgCount !== 1 ? 's' : ''}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            {tokenCount > 0 && (
              <motion.span
                key={tokenCount}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-[10px] font-mono text-white/30"
              >
                ~{tokenCount} tokens
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Message cards */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
          <AnimatePresence>
            {messages.map((msg, i) => {
              const config = roleColors[msg.role] || roleColors.user;
              const isNewest = i === messages.length - 1;
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
                  transition={{ ...spring, delay: isNewest ? 0.1 : 0 }}
                  className="rounded-lg p-3 border-2"
                  style={{
                    backgroundColor: config.bg,
                    borderColor: isNewest ? config.border : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: config.text, backgroundColor: `${config.text}15` }}
                    >
                      {config.label}
                    </span>
                    <span className="text-[10px] text-white/20 font-mono">[{i}]</span>
                  </div>
                  <div className="text-sm text-white/80 font-mono leading-relaxed">
                    &quot;{msg.content}&quot;
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {msgCount > 0 && (
            <div className="font-mono text-xs text-white/40 mt-1">]</div>
          )}
        </div>
      </div>

      {/* Zone 2: API Call Indicator */}
      <AnimatePresence>
        {(isSending || apiInfo) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <motion.div
                animate={isSending ? { x: [0, 8, 0] } : {}}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                className="text-accent-gold text-sm"
              >
                {isSending ? '\u2192' : '\u2713'}
              </motion.div>
              <span className="font-mono text-xs text-white/60">
                {apiInfo}
              </span>
              {isSending && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-3 h-3 rounded-full border border-accent-gold/30 border-t-accent-gold ml-auto"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone 3: Insight Callouts */}
      <AnimatePresence mode="wait">
        {calloutInfo && (
          <motion.div
            key={trigger}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={spring}
            className="px-4 py-2.5 rounded-lg border text-sm font-medium"
            style={{
              backgroundColor: `${calloutInfo.color}10`,
              borderColor: `${calloutInfo.color}30`,
              color: calloutInfo.color,
            }}
          >
            {calloutInfo.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
