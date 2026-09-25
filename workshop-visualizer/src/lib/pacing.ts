export type PlayPace = 'slow' | 'normal' | 'fast';

export const paceLabels: Record<PlayPace, string> = {
  slow: 'Slow',
  normal: 'Normal',
  fast: 'Fast',
};

const paceMultiplier: Record<PlayPace, number> = {
  slow: 1.6,
  normal: 1,
  fast: 0.6,
};

// Auto-play waits long enough to read the step's text and watch its animation:
// a fixed base for the animation plus ~250ms per word (a relaxed reading speed).
export function stepDelay(text: string, pace: PlayPace): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const ms = Math.min(14000, Math.max(3500, 2500 + words * 250));
  return Math.round(ms * paceMultiplier[pace]);
}
