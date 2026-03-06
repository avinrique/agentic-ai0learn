'use client';
import { motion } from 'framer-motion';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (index: number) => void;
}

export default function StepProgressBar({ currentStep, totalSteps, onStepClick }: StepProgressBarProps) {
  const compact = totalSteps > 14;

  if (compact) {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isVisited = i <= currentStep;
          const isCurrent = i === currentStep;
          return (
            <button
              key={i}
              onClick={() => onStepClick(i)}
              className="relative h-2 transition-all duration-200 hover:opacity-80"
              style={{ width: `${Math.max(100 / totalSteps, 4)}%`, minWidth: 4 }}
              title={`Step ${i + 1}`}
            >
              <div
                className={`h-full rounded-sm transition-all duration-300 ${
                  isCurrent
                    ? 'bg-accent-blue shadow-glow-blue'
                    : isVisited
                    ? 'bg-accent-blue/70'
                    : 'bg-white/10'
                }`}
              />
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-sm bg-accent-blue/40"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isVisited = i <= currentStep;
        const isCurrent = i === currentStep;
        return (
          <button
            key={i}
            onClick={() => onStepClick(i)}
            className="relative flex items-center justify-center group"
            title={`Step ${i + 1}`}
          >
            {isCurrent && (
              <motion.div
                className="absolute w-5 h-5 rounded-full border-2 border-accent-blue"
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.3, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                isCurrent
                  ? 'bg-accent-blue scale-125'
                  : isVisited
                  ? 'bg-accent-blue/70 group-hover:bg-accent-blue'
                  : 'bg-white/15 group-hover:bg-white/30'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
