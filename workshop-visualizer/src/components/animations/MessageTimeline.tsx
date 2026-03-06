'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';
import { useMemo, useState, useEffect } from 'react';

const spring = { type: 'spring' as const, damping: 20, stiffness: 100 };

const roleConfig: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  system: { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa', icon: '⚙️' },
  user: { bg: 'rgba(74,158,255,0.12)', border: 'rgba(74,158,255,0.3)', text: '#4a9eff', icon: '👤' },
  assistant_tool: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b', icon: '🔧' },
  tool: { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)', text: '#4ade80', icon: '📦' },
  assistant_final: { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)', text: '#4ade80', icon: '💬' },
};

interface TimelineMessage {
  role: string;
  content: string;
  loop?: number;
}

export default function MessageTimeline() {
  const { currentStep, steps } = useTracerStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const trigger = steps[currentStep]?.animationTrigger;

  // Auto-expand on return
  useEffect(() => {
    if (trigger?.includes('return')) {
      setIsExpanded(true);
    }
  }, [trigger]);

  // Build message list by walking through steps 0..currentStep
  const messages = useMemo(() => {
    const msgs: TimelineMessage[] = [];
    let currentLoop = 0;
    let lastUserMsg = '';

    for (let i = 0; i <= currentStep; i++) {
      const step = steps[i];
      if (!step?.animationTrigger) continue;
      const t = step.animationTrigger;
      const vars = step.variables ?? [];

      if (t === 'addSystemMsg') {
        const sysVar = vars.find(v => v.name === 'system_prompt' || v.name === 'system_message');
        msgs.push({ role: 'system', content: sysVar?.value || 'System message set' });
      } else if (t.includes('send') && !t.includes('send2') && !t.includes('send3')) {
        const msgVar = vars.find(v => v.name === 'messages');
        let content = 'User query';
        if (msgVar?.value) {
          const match = msgVar.value.match(/content:"([^"]+)"/);
          if (match) content = match[1];
        }
        // Only add user message if different from last
        if (content !== lastUserMsg) {
          currentLoop++;
          msgs.push({ role: 'user', content, loop: currentLoop });
          lastUserMsg = content;
        }
      } else if (t.includes('decide')) {
        const toolVar = vars.find(v => v.name === 'tool_name' || v.name === 'function_name');
        const argsVar = vars.find(v => v.name === 'arguments' || v.name === 'args');
        const name = toolVar?.value || 'tool';
        const args = argsVar?.value || '';
        msgs.push({ role: 'assistant_tool', content: `→ ${name}(${args})`, loop: currentLoop });
      } else if (t.includes('return')) {
        const resVar = vars.find(v => v.name === 'result' || v.name === 'function_result');
        msgs.push({ role: 'tool', content: `result: ${resVar?.value || '...'}`, loop: currentLoop });
      } else if (t.includes('finalAnswer') || t === 'final') {
        const ansVar = vars.find(v => v.name === 'final_answer' || v.name === 'assistant_msg' || v.name === 'content');
        msgs.push({ role: 'assistant_final', content: ansVar?.value || 'Response generated' });
      }
    }

    return msgs;
  }, [currentStep, steps]);

  // Determine loop boundaries for separators
  const hasMultipleLoops = useMemo(() => {
    const loopSet = new Set<number>();
    messages.forEach(m => { if (m.loop) loopSet.add(m.loop); });
    return loopSet.size > 1;
  }, [messages]);

  if (messages.length === 0) return null;

  const lastMsg = messages[messages.length - 1];
  const lastConfig = roleConfig[lastMsg.role] || roleConfig.user;

  return (
    <div className="flex-shrink-0">
      {/* Collapsed bar */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors hover:bg-white/5"
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <span className="text-[10px] text-white/40 font-mono">messages[{messages.length}]</span>
        <div className="flex-1" />
        {/* Latest message preview */}
        <span
          className="text-[10px] font-mono truncate max-w-[180px]"
          style={{ color: lastConfig.text }}
        >
          {lastMsg.content.length > 30 ? lastMsg.content.slice(0, 30) + '...' : lastMsg.content}
        </span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-white/30 text-xs"
        >
          ▼
        </motion.span>
      </motion.button>

      {/* Expanded timeline */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1 px-1 space-y-1 max-h-[200px] overflow-y-auto">
              {messages.map((msg, i) => {
                const config = roleConfig[msg.role] || roleConfig.user;
                const isNewest = i === messages.length - 1;

                // Show loop separator if this message starts a new loop
                const prevMsg = i > 0 ? messages[i - 1] : null;
                const showSeparator = hasMultipleLoops && msg.loop && prevMsg?.loop && msg.loop !== prevMsg.loop;

                return (
                  <div key={i}>
                    {showSeparator && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-[9px] text-white/25 font-mono">Loop {msg.loop}</span>
                        <div className="flex-1 h-px bg-white/10" />
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * i, ...spring }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                      style={{
                        backgroundColor: isNewest ? config.bg : 'transparent',
                        boxShadow: isNewest ? `0 0 12px ${config.border}` : 'none',
                      }}
                    >
                      <span className="text-[10px]">{config.icon}</span>
                      <span className="text-[9px] font-bold uppercase w-10 flex-shrink-0" style={{ color: config.text }}>
                        {msg.role === 'assistant_tool' ? 'asst' : msg.role === 'assistant_final' ? 'asst' : msg.role === 'tool' ? 'tool' : msg.role}
                      </span>
                      <span className="text-[10px] font-mono truncate" style={{ color: isNewest ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)' }}>
                        {msg.content}
                      </span>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
