'use client';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import StepControls from './StepControls';
import ResizableHandle from './ResizableHandle';
import { useTracerStore, TraceStep, TraceVariant } from '@/stores/tracerStore';
import { useFullscreen } from '@/hooks/useFullscreen';

interface LessonLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  animationPanel: ReactNode;
  steps: TraceStep[];
  variants?: TraceVariant[];
}

export default function LessonLayout({
  children,
  title,
  description,
  animationPanel,
  steps,
  variants,
}: LessonLayoutProps) {
  const { setSteps, setVariants, currentStep, steps: currentSteps } = useTracerStore();
  const { isFullscreen, toggleFullscreen, containerRef } = useFullscreen();
  const mainRef = useRef<HTMLDivElement>(null);
  const [tracerWidthPx, setTracerWidthPx] = useState(520);

  useEffect(() => {
    setSteps(steps);
    if (variants) {
      setVariants(variants);
    }
  }, [steps, variants, setSteps, setVariants]);

  const currentTraceStep = currentSteps[currentStep];

  const handleMainResize = useCallback((delta: number) => {
    setTracerWidthPx(prev => Math.max(320, Math.min(900, prev - delta)));
  }, []);

  return (
    <div ref={containerRef} className="flex h-screen overflow-hidden bg-navy-900">
      {!isFullscreen && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`px-6 border-b border-white/10 bg-navy-800/50 flex-shrink-0 ${isFullscreen ? 'py-2' : 'py-3'}`}>
          <div className="flex items-center justify-between">
            <div>
              {!isFullscreen && <h1 className="text-xl font-bold text-white">{title}</h1>}
              {!isFullscreen && <p className="text-sm text-white/40 mt-0.5">{description}</p>}
            </div>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-sm transition-all shrink-0"
              title="Fullscreen (F)"
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
          {currentTraceStep?.explanation && (
            <div className={`px-3 py-1.5 rounded-lg bg-accent-blue/10 border border-accent-blue/20 text-sm text-accent-blue ${isFullscreen ? '' : 'mt-2'}`}>
              {currentTraceStep.explanation}
            </div>
          )}
        </header>

        {/* Main content */}
        <div ref={mainRef} className="flex-1 flex overflow-hidden min-h-0">
          {/* Animation Panel */}
          <div className="flex-1 p-3 overflow-auto min-w-0">
            <div className="h-full rounded-xl border border-white/10 bg-navy-800/30 overflow-hidden">
              {animationPanel}
            </div>
          </div>

          {/* Tracer Panel — hidden in fullscreen */}
          {!isFullscreen && (
            <>
              <ResizableHandle direction="horizontal" onResize={handleMainResize} />
              <div
                style={{ width: tracerWidthPx }}
                className="flex-shrink-0 border-l border-white/10 overflow-hidden"
              >
                {children}
              </div>
            </>
          )}
        </div>

        {/* Step Controls */}
        <StepControls />
      </div>
    </div>
  );
}
