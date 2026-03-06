'use client';
import { useProgressStore } from '@/stores/progressStore';
import ProgressRing from './ProgressRing';

interface LessonStatusBadgeProps {
  lessonId: string;
  globalIndex: number;
  isActive: boolean;
  color?: string;
}

export default function LessonStatusBadge({ lessonId, globalIndex, isActive, color = '#4a9eff' }: LessonStatusBadgeProps) {
  const progress = useProgressStore((s) => s.lessonProgress[lessonId]);

  // Completed
  if (progress?.completed) {
    return (
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: '#4ade80', color: '#0a1628', boxShadow: '0 0 8px rgba(74, 222, 128, 0.4)' }}
      >
        ✓
      </span>
    );
  }

  // In progress — show progress ring
  if (progress && progress.lastStep > 0) {
    const pct = progress.totalSteps > 1 ? progress.lastStep / (progress.totalSteps - 1) : 0;
    return (
      <ProgressRing size={20} strokeWidth={2} progress={pct} color={color}>
        <span className={`text-[10px] font-bold ${isActive ? 'text-accent-blue' : 'text-white/60'}`}>
          {globalIndex}
        </span>
      </ProgressRing>
    );
  }

  // Not started — default circle
  return (
    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
      isActive ? 'bg-accent-blue text-navy-900' : 'bg-white/10 text-white/40'
    }`}>
      {globalIndex}
    </span>
  );
}
