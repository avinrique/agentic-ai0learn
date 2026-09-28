'use client';
import { ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import LessonBadge from '@/components/ui/LessonBadge';
import JourneyStrip from '@/components/ui/JourneyStrip';
import ConceptStepControls from './ConceptStepControls';
import { useConceptStore, ConceptStep } from '@/stores/conceptStore';
import { useProgressStore } from '@/stores/progressStore';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useUIStore } from '@/stores/uiStore';

// On small screens (e.g. 1280×720 projectors) the sidebar starts collapsed so the
// animation isn't shrunk; only the first time, so a student who re-opens it keeps it.
let sidebarAutoCollapsed = false;

interface ConceptLayoutProps {
  title: string;
  description: string;
  steps: ConceptStep[];
  animationPanel: ReactNode;
  lessonId: string;
}

export default function ConceptLayout({
  title,
  description,
  steps,
  animationPanel,
  lessonId,
}: ConceptLayoutProps) {
  const { setSteps, currentStep, steps: currentSteps } = useConceptStore();
  const updateStep = useProgressStore((s) => s.updateStep);
  const { isFullscreen, toggleFullscreen, containerRef } = useFullscreen();
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  useEffect(() => {
    if (!sidebarAutoCollapsed && window.innerWidth < 1400) {
      setSidebarCollapsed(true);
    }
    sidebarAutoCollapsed = true;
  }, [setSidebarCollapsed]);

  useEffect(() => {
    setSteps(steps);
  }, [steps, setSteps]);

  useEffect(() => {
    if (currentSteps.length > 0) {
      updateStep(lessonId, currentStep, currentSteps.length);
    }
  }, [lessonId, currentStep, currentSteps.length, updateStep]);

  const currentConceptStep = currentSteps[currentStep];

  return (
    <div ref={containerRef} className="flex h-screen overflow-hidden bg-navy-900">
      {/* Sidebar — hidden in fullscreen */}
      {!isFullscreen && <Sidebar />}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header — compact in fullscreen */}
        {isFullscreen ? (
          <>
            {currentConceptStep && (
              <motion.header
                key={currentStep}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="px-6 py-2 border-b border-white/5 bg-navy-900/80 backdrop-blur-sm flex-shrink-0 flex items-center gap-4"
              >
                <div className="flex-1 text-sm text-accent-blue">
                  {currentConceptStep.explanation}
                  {currentConceptStep.subtitle && (
                    <span className="text-xs text-accent-blue/50 ml-3">
                      {currentConceptStep.subtitle}
                    </span>
                  )}
                </div>
                <button
                  onClick={toggleFullscreen}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-xs transition-all shrink-0"
                  title="Exit fullscreen (F)"
                >
                  Exit Fullscreen
                </button>
              </motion.header>
            )}
          </>
        ) : (
          <header className="px-6 py-3 border-b border-white/10 bg-navy-800/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <LessonBadge lessonId={lessonId} />
                <h1 className="text-xl font-bold text-white">{title}</h1>
                <p className="text-sm text-white/40 mt-0.5">{description}</p>
              </div>
              <button
                onClick={toggleFullscreen}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-sm transition-all shrink-0"
                title="Fullscreen (F)"
              >
                Fullscreen
              </button>
            </div>
            {currentStep === 0 && <JourneyStrip lessonId={lessonId} />}
            {currentConceptStep && (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 px-4 py-2 rounded-lg bg-accent-blue/10 border border-accent-blue/20 text-[15px] leading-relaxed text-blue-100"
                >
                  {currentConceptStep.explanation}
                  {currentConceptStep.subtitle && (
                    <span className="block text-[13px] font-medium text-accent-blue mt-1">
                      {currentConceptStep.subtitle}
                    </span>
                  )}
                </motion.div>
              )}
          </header>
        )}

        {/* Animation Panel — takes full space in fullscreen */}
        {/* Clicking into the animation (e.g. a playground) pauses auto-play. */}
        <div
          className={isFullscreen ? 'flex-1 overflow-hidden min-h-0' : 'flex-1 p-3 overflow-hidden min-h-0'}
          onPointerDown={() => useConceptStore.getState().setPlaying(false)}
        >
          <div className={`h-full overflow-hidden ${isFullscreen ? '' : 'rounded-xl border border-white/10 bg-navy-800/30'}`}>
            {animationPanel}
          </div>
        </div>

        {/* Step Controls */}
        <ConceptStepControls lessonId={lessonId} />
      </div>
    </div>
  );
}
