'use client';
import { useEffect } from 'react';
import { useTracerStore } from '@/stores/tracerStore';
import { useConceptStore } from '@/stores/conceptStore';

type StoreType = 'tracer' | 'concept';

export function useKeyboardNav(storeType: StoreType) {
  const tracerStore = useTracerStore();
  const conceptStore = useConceptStore();

  const store = storeType === 'tracer' ? tracerStore : conceptStore;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        store.prevStep();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        store.nextStep();
      } else if (e.key === ' ') {
        e.preventDefault();
        store.togglePlay();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);
}
