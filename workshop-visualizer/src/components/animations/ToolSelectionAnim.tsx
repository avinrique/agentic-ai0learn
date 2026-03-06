'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';
import { useMemo } from 'react';

const springConfig = { type: 'spring' as const, damping: 20, stiffness: 100 };

interface ToolCard {
  name: string;
  icon: string;
  color: string;
}

const defaultTools: ToolCard[] = [
  { name: 'add', icon: '+', color: '#4a9eff' },
  { name: 'subtract', icon: '-', color: '#f87171' },
  { name: 'multiply', icon: '×', color: '#fbbf24' },
  { name: 'divide', icon: '÷', color: '#a78bfa' },
];

interface ToolSelectionAnimProps {
  tools?: ToolCard[];
  layout?: 'row' | 'grid';
}

export default function ToolSelectionAnim({ tools, layout = 'row' }: ToolSelectionAnimProps) {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;
  const currentTools = tools || defaultTools;

  // Parse selected tool from trigger
  const selectedTool = trigger?.startsWith('toolSelect-')
    ? trigger.replace('toolSelect-', '')
    : null;

  // Determine if we're in execution or result phase
  const isExecuting = trigger?.includes('execute');
  const isResult = trigger?.includes('return');

  // Get arguments and result from current step variables
  const variables = steps[currentStep]?.variables ?? [];
  const argsVar = variables.find(v => v.name === 'arguments' || v.name === 'args');
  const resultVar = variables.find(v => v.name === 'result' || v.name === 'function_result');
  const toolNameVar = variables.find(v => v.name === 'tool_name' || v.name === 'function_name');

  // Keep track of which tool was last selected (for execute/return phases)
  const activeTool = useMemo(() => {
    if (selectedTool) return selectedTool;
    if ((isExecuting || isResult) && toolNameVar) return toolNameVar.value;
    // Look back through steps to find the last toolSelect trigger
    for (let i = currentStep; i >= 0; i--) {
      const t = steps[i]?.animationTrigger;
      if (t?.startsWith('toolSelect-')) return t.replace('toolSelect-', '');
    }
    return null;
  }, [selectedTool, isExecuting, isResult, toolNameVar, currentStep, steps]);

  const useGrid = layout === 'grid' || currentTools.length > 5;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className="text-xs text-white/30 uppercase tracking-wider">Tool Selection</div>
      <div className={useGrid
        ? 'grid grid-cols-4 gap-3'
        : 'flex gap-3 flex-wrap justify-center'
      }>
        {currentTools.map((tool) => {
          const isSelected = activeTool === tool.name;
          return (
            <motion.div
              key={tool.name}
              animate={{
                y: isSelected ? -12 : 0,
                scale: isSelected ? 1.1 : 1,
              }}
              transition={springConfig}
              className="relative"
            >
              <motion.div
                animate={{
                  boxShadow: isSelected
                    ? `0 0 30px ${tool.color}50`
                    : `0 0 0px ${tool.color}00`,
                }}
                className={`${useGrid ? 'w-16 h-20' : 'w-20 h-24'} rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 cursor-default`}
                style={{
                  backgroundColor: isSelected ? `${tool.color}20` : 'rgba(255,255,255,0.03)',
                  borderColor: isSelected ? `${tool.color}80` : 'rgba(255,255,255,0.1)',
                }}
              >
                <span className={`${useGrid ? 'text-xl' : 'text-2xl'} font-bold`} style={{ color: isSelected ? tool.color : 'rgba(255,255,255,0.3)' }}>
                  {tool.icon}
                </span>
                <span className={`${useGrid ? 'text-[9px]' : 'text-[11px]'} font-mono`} style={{ color: isSelected ? tool.color : 'rgba(255,255,255,0.4)' }}>
                  {tool.name}
                </span>
              </motion.div>

              {/* Spotlight beam */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 0.3, height: 30 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-14"
                    style={{
                      background: `linear-gradient(to bottom, ${tool.color}40, transparent)`,
                      borderRadius: '50% 50% 0 0',
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Arguments display */}
      <AnimatePresence>
        {activeTool && argsVar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={springConfig}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white/60"
          >
            arguments: {argsVar.value}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution phase */}
      <AnimatePresence>
        {isExecuting && activeTool && (
          <motion.div
            key="executing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={springConfig}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-3 h-3 rounded-full border border-yellow-500/30 border-t-yellow-500"
            />
            <span className="text-xs text-yellow-400 font-mono">
              Running {activeTool}({argsVar?.value || '...'})
            </span>
            {resultVar && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 text-xs font-mono ml-2"
              >
                → {resultVar.value}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result phase */}
      <AnimatePresence>
        {isResult && resultVar && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, boxShadow: '0 0 20px rgba(74,222,128,0.15)' }}
            exit={{ opacity: 0 }}
            transition={springConfig}
            className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 font-mono text-xs"
          >
            <span className="text-green-400/60 mr-2">result:</span>
            <span className="text-green-400 font-bold">{resultVar.value}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
