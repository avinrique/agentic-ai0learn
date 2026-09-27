'use client';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { getRunInfo } from '@/data/runRegistry';
import RunItModal from './RunItModal';

// "💻 Run it yourself" button for code lessons: opens the run box. Renders nothing when
// the lesson has no downloadable program. `compact` is the small last-step version; it is
// hidden on narrow screens, where the step bar is already full (the header button stays).
export default function RunItButton({ lessonId, compact = false }: { lessonId: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const info = getRunInfo(lessonId);
  if (!info) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          compact
            ? 'hidden min-[1400px]:inline-block px-3 py-1.5 rounded-lg bg-accent-green/15 text-accent-green hover:bg-accent-green/25 text-sm font-semibold transition-colors whitespace-nowrap'
            : 'px-3 py-1.5 rounded-lg border border-accent-green/50 bg-accent-green/10 hover:bg-accent-green/20 text-white text-sm font-semibold transition-colors whitespace-nowrap'
        }
        title="Run this program on your own computer"
      >
        {compact ? '💻 Run it' : '💻 Run it yourself'}
      </button>
      <AnimatePresence>{open && <RunItModal info={info} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
