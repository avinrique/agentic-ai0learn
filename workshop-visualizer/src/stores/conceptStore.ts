import { create } from 'zustand';

export interface ConceptStep {
  explanation: string;
  animationTrigger: string;
  subtitle?: string;
}

interface ConceptState {
  currentStep: number;
  steps: ConceptStep[];
  isPlaying: boolean;
  playSpeed: number;

  setSteps: (steps: ConceptStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
}

export const useConceptStore = create<ConceptState>((set, get) => ({
  currentStep: 0,
  steps: [],
  isPlaying: false,
  playSpeed: 2500,

  setSteps: (steps) => set({ steps, currentStep: 0, isPlaying: false }),

  nextStep: () => {
    const { currentStep, steps } = get();
    if (currentStep < steps.length - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  goToStep: (step) => {
    const { steps } = get();
    if (step >= 0 && step < steps.length) {
      set({ currentStep: step });
    }
  },

  reset: () => set({ currentStep: 0, isPlaying: false }),

  togglePlay: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),
}));
