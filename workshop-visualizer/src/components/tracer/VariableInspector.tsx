'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';

export default function VariableInspector() {
  const { currentStep, steps } = useTracerStore();
  const variables = steps[currentStep]?.variables ?? [];

  return (
    <div>
      <div className="px-3 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider border-b border-white/10 bg-navy-800/50">
        Variables
      </div>
      <div className="p-3 space-y-1.5">
        <AnimatePresence mode="popLayout">
          {variables.length === 0 ? (
            <p className="text-xs text-white/20 italic">No variables yet</p>
          ) : (
            variables.map((v) => (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className={`flex items-start gap-2 px-2 py-1.5 rounded-md text-xs font-mono ${
                  v.isNew
                    ? 'bg-accent-green/10 border border-accent-green/30'
                    : v.isChanged
                    ? 'bg-accent-gold/10 border border-accent-gold/30'
                    : 'bg-white/5 border border-white/5'
                }`}
              >
                <span className={`font-semibold ${
                  v.isNew ? 'text-accent-green' : v.isChanged ? 'text-accent-gold' : 'text-accent-purple'
                }`}>
                  {v.name}
                </span>
                <span className="text-white/30">=</span>
                <span className="text-white/70 break-all flex-1">{v.value}</span>
                {v.isNew && (
                  <span className="text-[10px] text-accent-green bg-accent-green/20 px-1 rounded">NEW</span>
                )}
                {v.isChanged && (
                  <span className="text-[10px] text-accent-gold bg-accent-gold/20 px-1 rounded">CHANGED</span>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
