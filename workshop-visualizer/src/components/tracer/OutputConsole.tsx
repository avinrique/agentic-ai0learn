'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';

export default function OutputConsole({ hideHeader = false }: { hideHeader?: boolean }) {
  const { cumulativeOutput } = useTracerStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest printed line in view, like a real terminal.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    const outer = el.parentElement?.parentElement;
    if (outer) outer.scrollTop = outer.scrollHeight;
  }, [cumulativeOutput]);

  return (
    <div className="h-full flex flex-col">
      {!hideHeader && (
        <div className="px-3 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider border-b border-white/10 bg-navy-800/50">
          Console Output
        </div>
      )}
      <div ref={scrollRef} className="p-3 font-mono text-xs bg-black/30 flex-1 min-h-0 overflow-auto">
        <AnimatePresence mode="popLayout">
          {cumulativeOutput.length === 0 ? (
            <p className="text-white/20 italic">No output yet...</p>
          ) : (
            cumulativeOutput.map((line, i) => (
              <motion.div
                key={`${i}-${line.slice(0, 20)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className="text-accent-green whitespace-pre-wrap mb-1"
              >
                <span className="text-white/20 select-none">{'>'} </span>
                {line}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
