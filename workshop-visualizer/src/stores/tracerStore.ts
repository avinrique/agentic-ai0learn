import { create } from 'zustand';

export interface Variable {
  name: string;
  value: string;
  isNew?: boolean;
  isChanged?: boolean;
}

export interface TraceStep {
  lineNumber: number;
  variables: Variable[];
  output: string;
  animationTrigger?: string;
  explanation: string;
}

export interface TraceVariant {
  id: string;
  label: string;
  inputValue: string;
  steps: TraceStep[];
}

interface TracerState {
  currentStep: number;
  steps: TraceStep[];
  variants: TraceVariant[];
  activeVariantId: string;
  isPlaying: boolean;
  playSpeed: number;
  cumulativeOutput: string[];

  setSteps: (steps: TraceStep[]) => void;
  setVariants: (variants: TraceVariant[]) => void;
  setActiveVariant: (id: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
}

export const useTracerStore = create<TracerState>((set, get) => ({
  currentStep: 0,
  steps: [],
  variants: [],
  activeVariantId: 'default',
  isPlaying: false,
  playSpeed: 1500,
  cumulativeOutput: [],

  setSteps: (steps) => set({ steps, currentStep: 0, cumulativeOutput: [] }),

  setVariants: (variants) => set({ variants }),

  setActiveVariant: (id) => {
    const { variants } = get();
    const variant = variants.find(v => v.id === id);
    if (variant) {
      set({
        activeVariantId: id,
        steps: variant.steps,
        currentStep: 0,
        cumulativeOutput: [],
        isPlaying: false,
      });
    }
  },

  nextStep: () => {
    const { currentStep, steps, cumulativeOutput } = get();
    if (currentStep < steps.length - 1) {
      const nextIdx = currentStep + 1;
      const newOutput = steps[nextIdx].output
        ? [...cumulativeOutput, steps[nextIdx].output]
        : cumulativeOutput;
      set({ currentStep: nextIdx, cumulativeOutput: newOutput });
    } else {
      set({ isPlaying: false });
    }
  },

  prevStep: () => {
    const { currentStep, steps } = get();
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      // Rebuild cumulative output up to prevIdx
      const newOutput: string[] = [];
      for (let i = 0; i <= prevIdx; i++) {
        if (steps[i].output) newOutput.push(steps[i].output);
      }
      set({ currentStep: prevIdx, cumulativeOutput: newOutput });
    }
  },

  goToStep: (step) => {
    const { steps } = get();
    if (step >= 0 && step < steps.length) {
      const newOutput: string[] = [];
      for (let i = 0; i <= step; i++) {
        if (steps[i].output) newOutput.push(steps[i].output);
      }
      set({ currentStep: step, cumulativeOutput: newOutput });
    }
  },

  reset: () => set({ currentStep: 0, cumulativeOutput: [], isPlaying: false }),

  togglePlay: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),
}));
