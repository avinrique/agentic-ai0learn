'use client';
import { useEffect, useRef } from 'react';
import { useTracerStore } from '@/stores/tracerStore';

export function useAutoPlay() {
  const { isPlaying, playSpeed, nextStep, currentStep, steps } = useTracerStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        nextStep();
      }, playSpeed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, playSpeed, nextStep, currentStep, steps.length]);
}
