'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';

const spring = { type: 'spring' as const, damping: 20, stiffness: 100 };

interface ExamplePair {
  input: string;
  output: string;
  outputColor: string;
  outputBg: string;
}

const examples: ExamplePair[] = [
  { input: 'I love this product!', output: 'Positive', outputColor: '#4ade80', outputBg: 'rgba(74,222,128,0.12)' },
  { input: 'This is terrible.', output: 'Negative', outputColor: '#f87171', outputBg: 'rgba(248,113,113,0.12)' },
];

const realInput = "It's okay, not great.";
const realOutput = 'Neutral';

export default function FewShotAnim() {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;

  // Determine what to show based on the trigger
  const showEx1User = ['addExample1User', 'addExample1Asst', 'addExample2User', 'addExample2Asst', 'buildFewShot', 'addRealQuestion', 'apiCall', 'apiProcessing', 'apiCallComplete', 'showPrediction'].includes(trigger || '');
  const showEx1Asst = ['addExample1Asst', 'addExample2User', 'addExample2Asst', 'buildFewShot', 'addRealQuestion', 'apiCall', 'apiProcessing', 'apiCallComplete', 'showPrediction'].includes(trigger || '');
  const showEx2User = ['addExample2User', 'addExample2Asst', 'buildFewShot', 'addRealQuestion', 'apiCall', 'apiProcessing', 'apiCallComplete', 'showPrediction'].includes(trigger || '');
  const showEx2Asst = ['addExample2Asst', 'buildFewShot', 'addRealQuestion', 'apiCall', 'apiProcessing', 'apiCallComplete', 'showPrediction'].includes(trigger || '');
  const showPattern = ['buildFewShot', 'addRealQuestion', 'apiCall', 'apiProcessing', 'apiCallComplete', 'showPrediction'].includes(trigger || '');
  const showRealInput = ['addRealQuestion', 'apiCall', 'apiProcessing', 'apiCallComplete', 'showPrediction'].includes(trigger || '');
  const isSending = trigger === 'apiCall' || trigger === 'apiProcessing';
  const showPrediction = trigger === 'showPrediction';

  const renderPair = (ex: ExamplePair, idx: number, showUser: boolean, showAsst: boolean) => {
    if (!showUser) return null;
    return (
      <motion.div
        key={`pair-${idx}`}
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring }}
        className="flex items-center gap-2"
      >
        <div className="text-xs text-white/20 w-16 text-right flex-shrink-0">Example {idx + 1}</div>
        <div className="flex-1 bg-accent-blue/10 border border-accent-blue/25 rounded-lg px-3 py-2">
          <div className="text-xs text-accent-blue font-bold uppercase">user</div>
          <div className="text-white/70 text-xs font-mono">&quot;{ex.input}&quot;</div>
        </div>
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 24, opacity: showAsst ? 1 : 0.3 }}
          className="border-t-2 border-dashed border-white/15 flex-shrink-0"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: showAsst ? 1 : 0.2, scale: showAsst ? 1 : 0.95 }}
          transition={spring}
          className="rounded-lg px-3 py-2 min-w-[90px] text-center border"
          style={{
            backgroundColor: showAsst ? ex.outputBg : 'rgba(255,255,255,0.02)',
            borderColor: showAsst ? `${ex.outputColor}40` : 'rgba(255,255,255,0.05)',
          }}
        >
          <div className="text-xs font-bold uppercase" style={{ color: showAsst ? ex.outputColor : 'rgba(255,255,255,0.2)' }}>
            assistant
          </div>
          <div className="text-xs font-bold" style={{ color: showAsst ? ex.outputColor : 'rgba(255,255,255,0.15)' }}>
            {showAsst ? ex.output : '???'}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col items-center p-6 overflow-auto">
      <div className="text-sm text-white/20 uppercase tracking-widest mb-4">Few-Shot Learning: Teaching by Example</div>

      <div className="w-full max-w-lg space-y-3">
        {/* System message */}
        <AnimatePresence>
          {(trigger === 'addSystemMsg' || showEx1User) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="bg-accent-purple/10 border border-accent-purple/25 rounded-lg px-3 py-2"
            >
              <div className="text-xs text-accent-purple font-bold uppercase">system</div>
              <div className="text-white/60 text-xs font-mono">&quot;You are a sentiment classifier. Respond with only Positive, Negative, or Neutral.&quot;</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        {showEx1User && (
          <div className="text-xs text-white/15 uppercase tracking-wider text-center">Examples (teaching the pattern)</div>
        )}

        {/* Example pairs */}
        {renderPair(examples[0], 0, showEx1User, showEx1Asst)}
        {renderPair(examples[1], 1, showEx2User, showEx2Asst)}

        {/* Pattern learned */}
        <AnimatePresence>
          {showPattern && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
              className="flex justify-center"
            >
              <motion.div
                animate={{ boxShadow: ['0 0 10px rgba(251,191,36,0.2)', '0 0 20px rgba(251,191,36,0.4)', '0 0 10px rgba(251,191,36,0.2)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-4 py-1.5 rounded-full bg-accent-gold/15 border border-accent-gold/40 text-accent-gold text-[11px] font-bold"
              >
                Pattern Learned: text → sentiment classification
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        {showRealInput && (
          <div className="text-xs text-white/15 uppercase tracking-wider text-center">Now the real question</div>
        )}

        {/* Real input + prediction */}
        <AnimatePresence>
          {showRealInput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="flex items-center gap-2"
            >
              <div className="text-xs text-accent-gold w-16 text-right flex-shrink-0 font-bold">NEW</div>
              <div className="flex-1 bg-accent-blue/15 border-2 border-accent-blue/40 rounded-lg px-3 py-2 shadow-glow-blue">
                <div className="text-xs text-accent-blue font-bold uppercase">user</div>
                <div className="text-white text-xs font-mono">&quot;{realInput}&quot;</div>
              </div>
              <div className="w-6 border-t-2 border-dashed border-accent-gold/30 flex-shrink-0" />
              <motion.div
                animate={{
                  scale: showPrediction ? 1.05 : 1,
                  boxShadow: showPrediction ? '0 0 20px rgba(251,191,36,0.3)' : 'none',
                }}
                transition={spring}
                className={`rounded-lg px-3 py-2 min-w-[90px] text-center border-2 ${
                  showPrediction
                    ? 'bg-accent-gold/15 border-accent-gold/50'
                    : isSending
                    ? 'bg-white/5 border-white/20 border-dashed'
                    : 'bg-white/3 border-white/10 border-dashed'
                }`}
              >
                <div className="text-xs font-bold uppercase text-accent-gold">
                  {showPrediction ? 'result' : 'prediction'}
                </div>
                {isSending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border border-accent-gold/30 border-t-accent-gold mx-auto my-1"
                  />
                ) : (
                  <div className={`text-sm font-bold ${showPrediction ? 'text-accent-gold' : 'text-white/15'}`}>
                    {showPrediction ? realOutput : '???'}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
