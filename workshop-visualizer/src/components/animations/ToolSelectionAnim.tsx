'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';
import { useMemo } from 'react';

const springConfig = { type: 'spring' as const, damping: 20, stiffness: 100 };

export interface ToolCard {
  name: string;
  icon: string;
  color: string;
}

export const defaultTools: ToolCard[] = [
  { name: 'add', icon: '+', color: '#4a9eff' },
  { name: 'subtract', icon: '-', color: '#f87171' },
  { name: 'multiply', icon: '×', color: '#fbbf24' },
  { name: 'divide', icon: '÷', color: '#a78bfa' },
];

interface ToolSelectionAnimProps {
  tools?: ToolCard[];
  activeTool?: string | null;
  isExecuting?: boolean;
  isResult?: boolean;
  args?: string;
  result?: string;
  layout?: 'row' | 'grid';
  compact?: boolean;
}

/**
 * ToolSelectionAnim - props-driven tool card display.
 * When activeTool/isExecuting/isResult are NOT provided, falls back to reading from tracerStore (legacy).
 * When props are provided, acts as a pure presentational component.
 */
export default function ToolSelectionAnim({
  tools,
  activeTool: activeToolProp,
  isExecuting: isExecutingProp,
  isResult: isResultProp,
  args: argsProp,
  result: resultProp,
  layout = 'row',
  compact = false,
}: ToolSelectionAnimProps) {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;
  const currentTools = tools || defaultTools;

  // Props-driven mode: use props directly. Legacy mode: derive from store.
  const propsMode = activeToolProp !== undefined;

  // Legacy: parse selected tool from trigger
  const selectedToolFromStore = trigger?.startsWith('toolSelect-')
    ? trigger.replace('toolSelect-', '')
    : null;

  const isExecutingFromStore = trigger?.includes('execute') ?? false;
  const isResultFromStore = trigger?.includes('return') ?? false;

  const variables = steps[currentStep]?.variables ?? [];
  const argsVarFromStore = variables.find(v => v.name === 'arguments' || v.name === 'args');
  const resultVarFromStore = variables.find(v => v.name === 'result' || v.name === 'function_result');
  const toolNameVarFromStore = variables.find(v => v.name === 'tool_name' || v.name === 'function_name');

  // Legacy: keep track of which tool was last selected
  const activeToolFromStore = useMemo(() => {
    if (selectedToolFromStore) return selectedToolFromStore;
    if ((isExecutingFromStore || isResultFromStore) && toolNameVarFromStore) return toolNameVarFromStore.value;
    for (let i = currentStep; i >= 0; i--) {
      const t = steps[i]?.animationTrigger;
      if (t?.startsWith('toolSelect-')) return t.replace('toolSelect-', '');
    }
    return null;
  }, [selectedToolFromStore, isExecutingFromStore, isResultFromStore, toolNameVarFromStore, currentStep, steps]);

  // Resolve final values
  const activeTool = propsMode ? activeToolProp : activeToolFromStore;
  const isExecuting = propsMode ? (isExecutingProp ?? false) : isExecutingFromStore;
  const isResult = propsMode ? (isResultProp ?? false) : isResultFromStore;
  const argsValue = propsMode ? argsProp : argsVarFromStore?.value;
  const resultValue = propsMode ? resultProp : resultVarFromStore?.value;

  const useGrid = layout === 'grid' || currentTools.length > 5;

  // Compact sizing
  const cardClass = compact
    ? (useGrid ? 'w-10 h-12' : 'w-12 h-14')
    : (useGrid ? 'w-16 h-20' : 'w-20 h-24');
  const iconSize = compact
    ? (useGrid ? 'text-sm' : 'text-base')
    : (useGrid ? 'text-xl' : 'text-2xl');
  const nameSize = compact
    ? 'text-[7px]'
    : (useGrid ? 'text-[9px]' : 'text-[11px]');
  const spotlightH = compact ? 16 : 30;

  return (
    <div className={`flex flex-col items-center justify-center ${compact ? 'gap-2 p-1' : 'gap-4 p-4'}`}>
      {!compact && (
        <div className="text-xs text-white/30 uppercase tracking-wider">Tool Selection</div>
      )}
      <div className={useGrid
        ? `grid ${compact ? 'grid-cols-4 gap-1.5' : 'grid-cols-4 gap-3'}`
        : `flex ${compact ? 'gap-1.5' : 'gap-3'} flex-wrap justify-center`
      }>
        {currentTools.map((tool) => {
          const isSelected = activeTool === tool.name;
          return (
            <motion.div
              key={tool.name}
              animate={{
                y: isSelected ? (compact ? -6 : -12) : 0,
                scale: isSelected ? (compact ? 1.05 : 1.1) : 1,
              }}
              transition={springConfig}
              className="relative"
            >
              <motion.div
                animate={{
                  boxShadow: isSelected
                    ? `0 0 ${compact ? '16px' : '30px'} ${tool.color}50`
                    : `0 0 0px ${tool.color}00`,
                }}
                className={`${cardClass} rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 cursor-default`}
                style={{
                  backgroundColor: isSelected ? `${tool.color}20` : 'rgba(255,255,255,0.03)',
                  borderColor: isSelected ? `${tool.color}80` : 'rgba(255,255,255,0.1)',
                }}
              >
                <span className={`${iconSize} font-bold`} style={{ color: isSelected ? tool.color : 'rgba(255,255,255,0.3)' }}>
                  {tool.icon}
                </span>
                <span className={`${nameSize} font-mono`} style={{ color: isSelected ? tool.color : 'rgba(255,255,255,0.4)' }}>
                  {tool.name}
                </span>
              </motion.div>

              {/* Spotlight beam */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 0.3, height: spotlightH }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`absolute ${compact ? '-top-4' : '-top-8'} left-1/2 -translate-x-1/2 ${compact ? 'w-8' : 'w-14'}`}
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

      {/* Arguments display — hidden in compact mode */}
      {!compact && (
        <AnimatePresence>
          {activeTool && argsValue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={springConfig}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white/60"
            >
              arguments: {argsValue}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Execution phase — hidden in compact mode */}
      {!compact && (
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
                Running {activeTool}({argsValue || '...'})
              </span>
              {resultValue && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 text-xs font-mono ml-2"
                >
                  → {resultValue}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Result phase — hidden in compact mode */}
      {!compact && (
        <AnimatePresence>
          {isResult && resultValue && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, boxShadow: '0 0 20px rgba(74,222,128,0.15)' }}
              exit={{ opacity: 0 }}
              transition={springConfig}
              className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 font-mono text-xs"
            >
              <span className="text-green-400/60 mr-2">result:</span>
              <span className="text-green-400 font-bold">{resultValue}</span>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
