'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface StepTimelineProps {
  isOpen: boolean;
  currentStep: number;
  steps: { explanation?: string; label?: string }[];
  onStepClick: (index: number) => void;
}

export default function StepTimeline({ isOpen, currentStep, steps, onStepClick }: StepTimelineProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden border-t border-white/10 bg-navy-800/80"
        >
          <div className="p-3 max-h-48 overflow-y-auto">
            <div className="space-y-1">
              {steps.map((step, i) => {
                const isVisited = i <= currentStep;
                const isCurrent = i === currentStep;
                const label = step.explanation || step.label || `Step ${i + 1}`;
                return (
                  <button
                    key={i}
                    onClick={() => onStepClick(i)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-all ${
                      isCurrent
                        ? 'bg-accent-blue/20 text-accent-blue'
                        : isVisited
                        ? 'text-white/60 hover:bg-white/5 hover:text-white/80'
                        : 'text-white/25 hover:bg-white/5 hover:text-white/40'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isCurrent
                          ? 'bg-accent-blue'
                          : isVisited
                          ? 'bg-accent-blue/50'
                          : 'bg-white/15'
                      }`}
                    />
                    <span className="truncate">{i + 1}. {label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
