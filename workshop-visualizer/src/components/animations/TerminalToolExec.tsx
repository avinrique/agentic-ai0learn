'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';
import { useMemo } from 'react';

const spring = { type: 'spring' as const, damping: 20, stiffness: 100 };

export default function TerminalToolExec() {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;
  const variables = useMemo(() => steps[currentStep]?.variables ?? [], [steps, currentStep]);

  const { phase, command, output, toolName } = useMemo(() => {
    let phase: 'idle' | 'command' | 'running' | 'output' = 'idle';
    let command = '';
    let output = '';
    let toolName = '';

    if (!trigger) return { phase, command, output, toolName };

    if (trigger.startsWith('toolSelect-')) {
      toolName = trigger.replace('toolSelect-', '');
      phase = 'command';
      const argsV = variables.find(v => v.name === 'arguments' || v.name === 'args');
      if (argsV) {
        try {
          const parsed = JSON.parse(argsV.value);
          command = parsed.command || parsed.path || parsed.filename || argsV.value;
        } catch {
          command = argsV.value;
        }
      }
    } else if (trigger.includes('execute')) {
      phase = 'running';
      const argsV = variables.find(v => v.name === 'arguments' || v.name === 'args');
      if (argsV) {
        try {
          const parsed = JSON.parse(argsV.value);
          command = parsed.command || parsed.path || parsed.filename || argsV.value;
        } catch {
          command = argsV.value;
        }
      }
      const resultV = variables.find(v => v.name === 'result' || v.name === 'function_result');
      if (resultV) {
        output = resultV.value;
        phase = 'output';
      }
    } else if (trigger.includes('return')) {
      phase = 'output';
      const resultV = variables.find(v => v.name === 'result' || v.name === 'function_result');
      if (resultV) output = resultV.value;
    }

    return { phase, command, output, toolName };
  }, [trigger, variables]);

  const isActive = phase !== 'idle';

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden border border-white/10 bg-[#1a1a2e]"
    >
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d0d1a] border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-[10px] text-white/30 font-mono ml-2">
          {toolName === 'run_command' ? 'Terminal' : toolName === 'read_file' ? 'File Reader' : toolName === 'write_file' ? 'File Writer' : 'Terminal'}
        </span>
      </div>

      {/* Terminal body */}
      <div className="p-3 font-mono text-xs min-h-[80px]">
        {/* Command line */}
        <AnimatePresence>
          {command && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 mb-2"
            >
              <span className="text-green-400">$</span>
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: 'auto' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-white/80 overflow-hidden whitespace-nowrap"
              >
                {command}
              </motion.span>
              {phase === 'command' && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-white/60"
                >
                  ▋
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Running indicator */}
        {phase === 'running' && !output && (
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-yellow-400/60"
          >
            Running...
          </motion.div>
        )}

        {/* Output */}
        <AnimatePresence>
          {output && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...spring, delay: 0.2 }}
              className="text-white/60 whitespace-pre-wrap border-l-2 border-white/10 pl-2"
            >
              {output.split('\n').map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {line || '\u00A0'}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
