'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';

const springConfig = { type: 'spring' as const, damping: 20, stiffness: 100 };

const sampleJson = {
  questions: [
    { question: "What is a decorator in Python?", difficulty: "Medium" },
    { question: "Explain list vs tuple", difficulty: "Easy" },
    { question: "What is a GIL?", difficulty: "Hard" },
  ]
};

export default function JsonParseAnim() {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;
  const isParsed = trigger === 'jsonParse';

  return (
    <div className="h-full flex items-center justify-center p-8">
      <AnimatePresence mode="wait">
        {!isParsed ? (
          <motion.div
            key="raw"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="font-mono text-xs text-white/50 bg-black/30 rounded-xl p-6 max-w-md border border-white/10"
          >
            <div className="text-white/20 text-[10px] mb-2">Raw JSON string:</div>
            {JSON.stringify(sampleJson, null, 0).slice(0, 200)}...
          </motion.div>
        ) : (
          <motion.div
            key="parsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 w-full max-w-lg"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springConfig}
              className="text-accent-gold text-xs font-mono mb-2"
            >
              response_format: {`{ "type": "json_object" }`}
            </motion.div>
            {sampleJson.questions.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ ...springConfig, delay: i * 0.2 }}
                className="bg-navy-700/50 border border-accent-gold/20 rounded-lg p-3 flex gap-4"
              >
                <div className="flex-1">
                  <div className="text-[10px] text-accent-blue font-semibold uppercase">question</div>
                  <div className="text-white/80 text-sm mt-1 font-mono">&quot;{q.question}&quot;</div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springConfig, delay: i * 0.2 + 0.1 }}
                  className="text-right"
                >
                  <div className="text-[10px] text-accent-purple font-semibold uppercase">difficulty</div>
                  <div className={`text-sm mt-1 font-bold ${
                    q.difficulty === 'Easy' ? 'text-accent-green' :
                    q.difficulty === 'Medium' ? 'text-accent-gold' : 'text-accent-red'
                  }`}>
                    {q.difficulty}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
