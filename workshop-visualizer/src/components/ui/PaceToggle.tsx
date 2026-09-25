'use client';
import { useUIStore } from '@/stores/uiStore';
import { paceLabels, PlayPace } from '@/lib/pacing';

const order: PlayPace[] = ['slow', 'normal', 'fast'];

export default function PaceToggle() {
  const { playPace, setPlayPace } = useUIStore();
  const next = order[(order.indexOf(playPace) + 1) % order.length];

  return (
    <button
      onClick={() => setPlayPace(next)}
      className="px-2 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 transition-all whitespace-nowrap"
      title="Auto-play speed (click to change)"
    >
      Speed: {paceLabels[playPace]}
    </button>
  );
}
