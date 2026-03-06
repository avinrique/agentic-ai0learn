'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';
import { useAutoPlay } from '@/hooks/useAutoPlay';
import { lessons } from '@/data/lessons';
import StepProgressBar from '@/components/ui/StepProgressBar';
import StepTimeline from '@/components/ui/StepTimeline';

interface StepControlsProps {
  lessonId: string;
}

export default function StepControls({ lessonId }: StepControlsProps) {
  useAutoPlay();
  const { currentStep, steps, isPlaying, nextStep, prevStep, reset, togglePlay, goToStep } = useTracerStore();
  const [timelineOpen, setTimelineOpen] = useState(false);

  const lessonIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null;
  const isLastStep = currentStep >= steps.length - 1;

  return (
    <>
      <StepTimeline
        isOpen={timelineOpen}
        currentStep={currentStep}
        steps={steps.map((s) => ({ explanation: s.explanation }))}
        onStepClick={(i) => { goToStep(i); setTimelineOpen(false); }}
      />
      <div className="flex items-center gap-3 px-4 py-3 bg-navy-800 border-t border-white/10">
        {/* Prev lesson */}
        {prevLesson && (
          <Link
            href={prevLesson.route}
            className="text-xs text-white/25 hover:text-white/50 transition-colors mr-1"
            title={prevLesson.title}
          >
            ← Prev
          </Link>
        )}

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
          disabled={isLastStep}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next ▶
        </button>

        {/* Timeline toggle */}
        <button
          onClick={() => setTimelineOpen(!timelineOpen)}
          className={`px-2 py-1.5 rounded-lg text-xs transition-all ${
            timelineOpen
              ? 'bg-accent-blue/20 text-accent-blue'
              : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60'
          }`}
          title="Toggle step timeline"
        >
          Timeline
        </button>

        {/* Step progress bar */}
        <div className="ml-auto flex items-center gap-3">
          <StepProgressBar currentStep={currentStep} totalSteps={steps.length} onStepClick={goToStep} />
          <span className="text-xs text-white/30 font-mono whitespace-nowrap">
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        {/* Next lesson */}
        <AnimatePresence>
          {isLastStep && nextLesson && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <Link
                href={nextLesson.route}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-semibold transition-all whitespace-nowrap"
              >
                Next: {nextLesson.shortTitle} →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
