import { create } from 'zustand';

interface AnimationState {
  activeAnimation: string | null;
  animationStep: number;
  isAnimating: boolean;

  setAnimation: (name: string | null) => void;
  setAnimationStep: (step: number) => void;
  setAnimating: (animating: boolean) => void;
  resetAnimation: () => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  activeAnimation: null,
  animationStep: 0,
  isAnimating: false,

  setAnimation: (name) => set({ activeAnimation: name }),
  setAnimationStep: (step) => set({ animationStep: step }),
  setAnimating: (animating) => set({ isAnimating: animating }),
  resetAnimation: () => set({ activeAnimation: null, animationStep: 0, isAnimating: false }),
}));
