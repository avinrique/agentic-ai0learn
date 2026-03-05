'use client';
import { useEffect, useRef } from 'react';
import { useConceptStore } from '@/stores/conceptStore';

export default function ConceptStepControls() {
  const { currentStep, steps, isPlaying, nextStep, prevStep, reset, togglePlay } = useConceptStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        nextStep();
      }, 2500);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, currentStep, steps.length, nextStep]);

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-navy-800 border-t border-white/10">
      <button
        onClick={reset}
        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all"
        title="Reset"
      >
        Reset
      </button>
      <button
        onClick={prevStep}
        disabled={currentStep === 0}
        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ◀ Prev
      </button>
      <button
        onClick={togglePlay}
        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
          isPlaying
            ? 'bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30'
            : 'bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30'
        }`}
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
      <button
        onClick={nextStep}
        disabled={currentStep >= steps.length - 1}
        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next ▶
      </button>
      <div className="ml-auto text-xs text-white/30 font-mono">
        Step {currentStep + 1} / {steps.length}
      </div>
    </div>
  );
}
