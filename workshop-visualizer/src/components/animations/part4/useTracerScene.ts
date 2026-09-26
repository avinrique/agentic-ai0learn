'use client';
import { useTracerStore, TraceStep } from '@/stores/tracerStore';

/** Read a variable's value from a trace step. String values (stored JSON-quoted) come back as plain text. */
export function readVar(step: TraceStep | undefined, name: string): string | undefined {
  const raw = step?.variables.find((v) => v.name === name)?.value;
  if (raw === undefined) return undefined;
  if (raw.startsWith('"')) {
    try {
      return JSON.parse(raw) as string;
    } catch {
      return raw;
    }
  }
  return raw;
}

/** The current tracer step for the Part 4 code-lesson animations (everything is derived from it). */
export function useTracerScene() {
  const steps = useTracerStore((s) => s.steps);
  const currentStep = useTracerStore((s) => s.currentStep);
  const index = Math.min(currentStep, Math.max(0, steps.length - 1));
  const step = steps[index];
  return {
    steps,
    index,
    step,
    trig: step?.animationTrigger ?? '',
    v: (name: string) => readVar(step, name),
  };
}
