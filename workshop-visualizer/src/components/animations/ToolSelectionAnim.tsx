'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';

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
}

export default function ToolSelectionAnim({ tools }: ToolSelectionAnimProps) {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;
  const currentTools = tools || defaultTools;

  // Parse selected tool from trigger
  const selectedTool = trigger?.startsWith('toolSelect-')
    ? trigger.replace('toolSelect-', '')
    : null;

  // Get arguments from current step variables
  const variables = steps[currentStep]?.variables ?? [];
  const argsVar = variables.find(v => v.name === 'arguments' || v.name === 'args');

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6">
      <div className="text-xs text-white/30 uppercase tracking-wider">Tool Selection</div>
      <div className="flex gap-4">
        {currentTools.map((tool) => {
          const isSelected = selectedTool === tool.name;
          return (
            <motion.div
              key={tool.name}
              animate={{
                y: isSelected ? -20 : 0,
                scale: isSelected ? 1.15 : 1,
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
                className="w-20 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-default"
                style={{
                  backgroundColor: isSelected ? `${tool.color}20` : 'rgba(255,255,255,0.03)',
                  borderColor: isSelected ? `${tool.color}80` : 'rgba(255,255,255,0.1)',
                }}
              >
                <span className="text-2xl font-bold" style={{ color: isSelected ? tool.color : 'rgba(255,255,255,0.3)' }}>
                  {tool.icon}
                </span>
                <span className="text-[11px] font-mono" style={{ color: isSelected ? tool.color : 'rgba(255,255,255,0.4)' }}>
                  {tool.name}
                </span>
              </motion.div>

              {/* Spotlight beam */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 0.3, height: 40 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-16"
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
        {selectedTool && argsVar && (
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
    </div>
  );
}
