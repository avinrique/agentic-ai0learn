'use client';
import { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { getRunInfo } from '@/data/runRegistry';
import { useTracerStore } from '@/stores/tracerStore';
import RunItModal from './RunItModal';

// "💻 Run it yourself" button in a code lesson's header: opens the run box. Renders
// nothing when the lesson has no downloadable program.
export default function RunItButton({ lessonId }: { lessonId: string }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const info = getRunInfo(lessonId);
  if (!info) return null;

  const openBox = () => {
    // Autoplay would keep stepping the lesson behind the box, so pause it.
    useTracerStore.getState().setPlaying(false);
    setOpen(true);
  };
  const closeBox = () => {
    setOpen(false);
    buttonRef.current?.focus(); // keyboard users land back where they were
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={openBox}
        className="px-3 py-1.5 rounded-lg border border-accent-green/50 bg-accent-green/10 hover:bg-accent-green/20 text-white text-sm font-semibold transition-colors whitespace-nowrap"
        title="Run this program on your own computer"
      >
        💻 Run it yourself
      </button>
      <AnimatePresence>{open && <RunItModal info={info} onClose={closeBox} />}</AnimatePresence>
    </>
  );
}
