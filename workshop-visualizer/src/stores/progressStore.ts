import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { lessons } from '@/data/lessons';

interface LessonProgress {
  lastStep: number;
  totalSteps: number;
  completed: boolean;
  visitedAt: number;
}

interface ProgressState {
  lessonProgress: Record<string, LessonProgress>;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  updateStep: (lessonId: string, step: number, totalSteps: number) => void;
  markCompleted: (lessonId: string) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      lessonProgress: {},
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      updateStep: (lessonId, step, totalSteps) => {
        const prev = get().lessonProgress[lessonId];
        const completed = prev?.completed || step >= totalSteps - 1;
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              lastStep: step,
              totalSteps,
              completed,
              visitedAt: prev?.visitedAt || Date.now(),
            },
          },
        }));
      },

      markCompleted: (lessonId) => {
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              ...state.lessonProgress[lessonId],
              completed: true,
            },
          },
        }));
      },
    }),
    {
      name: 'workshop-progress',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Selectors
export function useLessonStatus(id: string): 'not-started' | 'in-progress' | 'completed' {
  const progress = useProgressStore((s) => s.lessonProgress[id]);
  if (!progress) return 'not-started';
  if (progress.completed) return 'completed';
  return 'in-progress';
}

export function usePartProgress(part: number): { completed: number; total: number } {
  const lessonProgress = useProgressStore((s) => s.lessonProgress);
  const partLessons = lessons.filter((l) => l.part === part);
  const completed = partLessons.filter((l) => lessonProgress[l.id]?.completed).length;
  return { completed, total: partLessons.length };
}

export function useOverallProgress(): { completed: number; total: number; pct: number } {
  const lessonProgress = useProgressStore((s) => s.lessonProgress);
  const completed = lessons.filter((l) => lessonProgress[l.id]?.completed).length;
  const total = lessons.length;
  return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
}
