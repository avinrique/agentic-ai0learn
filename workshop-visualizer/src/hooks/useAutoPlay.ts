'use client';
import { useEffect } from 'react';
import { useTracerStore } from '@/stores/tracerStore';
import { useUIStore } from '@/stores/uiStore';
import { stepDelay } from '@/lib/pacing';

export function useAutoPlay() {
  const { isPlaying, nextStep, currentStep, steps } = useTracerStore();
  const playPace = useUIStore((s) => s.playPace);
  const explanation = steps[currentStep]?.explanation ?? '';

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) return;
    const timer = setTimeout(nextStep, stepDelay(explanation, playPace));
    return () => clearTimeout(timer);
  }, [isPlaying, nextStep, currentStep, steps.length, explanation, playPace]);
}
