'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';
import { useMemo, useState } from 'react';

const spring = { type: 'spring' as const, damping: 20, stiffness: 100 };

const fallbackQuestions = [
  { id: 1, question: 'What is a list comprehension?', difficulty: 'easy', topic: 'syntax' },
  { id: 2, question: 'Explain the GIL.', difficulty: 'hard', topic: 'concurrency' },
  { id: 3, question: 'What are decorators?', difficulty: 'medium', topic: 'functions' },
];

const difficultyColors: Record<string, string> = {
  easy: '#4ade80',
  medium: '#fbbf24',
  hard: '#ef4444',
};

export default function JsonParseAnim() {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;
  const variables = useMemo(() => steps[currentStep]?.variables ?? [], [steps, currentStep]);
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine phase from trigger
  const phase = useMemo(() => {
    if (!trigger) return 'idle';
    if (trigger === 'addSystemMsg') return 'system';
    if (trigger === 'addUserMsg') return 'user';
    if (trigger === 'buildMessages') return 'responseFormat';
    if (trigger === 'apiCall' || trigger === 'apiProcessing' || trigger === 'apiCallComplete') return 'responseFormat';
    if (trigger === 'extractContent') return 'rawJson';
    if (trigger === 'jsonParse') return 'parsing';
    if (trigger === 'printOutput') return 'formatted';
    return 'idle';
  }, [trigger]);

  // Parse questions from trace variables
  const questions = useMemo(() => {
    const rawVar = variables.find(v => v.name === 'raw_json');
    if (rawVar) {
      try {
        const parsed = JSON.parse(rawVar.value);
        if (parsed.questions) return parsed.questions;
      } catch { /* fallback */ }
    }
    return fallbackQuestions;
  }, [variables]);

  const rawJsonStr = useMemo(() => {
    const rawVar = variables.find(v => v.name === 'raw_json');
    return rawVar?.value || JSON.stringify({ questions: fallbackQuestions });
  }, [variables]);

  const userPrompt = useMemo(() => {
    const v = variables.find(v => v.name === 'user_prompt');
    return v?.value?.replace(/^"|"$/g, '') || 'Give me 3 Python interview questions with difficulty levels and topics as JSON.';
  }, [variables]);

  const showSystem = ['system', 'user', 'responseFormat', 'rawJson', 'parsing', 'formatted'].includes(phase);
  const showUser = ['user', 'responseFormat', 'rawJson', 'parsing', 'formatted'].includes(phase);
  const showFormat = ['responseFormat', 'rawJson', 'parsing', 'formatted'].includes(phase);
  const showRaw = phase === 'rawJson';
  const showParsing = phase === 'parsing';
  const showFormatted = phase === 'formatted';

  return (
    <div className="h-full flex flex-col p-4 gap-3 overflow-hidden">
      {/* Phase A: Setup */}
      <AnimatePresence>
        {showSystem && (
          <motion.div
            key="system-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={spring}
            className="rounded-lg p-3 border border-purple-500/30 bg-purple-500/10"
          >
            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">System Prompt</div>
            <div className="text-xs text-white/70 font-mono">
              &quot;<span className="text-yellow-300 font-semibold">only responds in valid JSON</span>&quot;
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUser && (
          <motion.div
            key="user-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ ...spring, delay: 0.1 }}
            className="rounded-lg p-3 border border-blue-500/30 bg-blue-500/10"
          >
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">User Prompt</div>
            <div className="text-xs text-white/70 font-mono">&quot;{userPrompt}&quot;</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFormat && (
          <motion.div
            key="format-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, boxShadow: '0 0 20px rgba(251,191,36,0.15)' }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={spring}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 relative cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="text-yellow-400 text-sm">&#x1F512;</span>
            <span className="font-mono text-xs text-yellow-300">
              response_format: {`{"type": "json_object"}`}
            </span>
            <span className="text-[10px] font-bold text-yellow-500 ml-auto uppercase">JSON Mode ON</span>

            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 top-full mt-2 z-20 p-3 rounded-lg bg-navy-800 border border-white/20 text-xs text-white/70 w-72 shadow-xl"
                >
                  <div className="text-white/90 font-semibold mb-1">What JSON mode does:</div>
                  <div className="text-green-400">&#x2713; Guarantees valid, parseable JSON output</div>
                  <div className="text-red-400 mt-1">&#x2717; Does NOT guarantee a specific schema</div>
                  <div className="text-white/50 mt-1 text-[10px]">You still need to describe the desired structure in your prompt.</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase B: Raw Response */}
      <AnimatePresence>
        {showRaw && (
          <motion.div
            key="raw-json"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={spring}
            className="flex-1 min-h-0 flex flex-col"
          >
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Raw string (type: str)</div>
            <div className="font-mono text-[11px] text-white/50 bg-black/30 rounded-xl p-3 border border-white/10 overflow-auto flex-1">
              {rawJsonStr}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase C: Parsing */}
      <AnimatePresence>
        {showParsing && (
          <motion.div
            key="parsing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="flex-1 min-h-0 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">json.loads()</span>
              <motion.span
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-green-400 text-sm"
              >
                &#x2192;
              </motion.span>
              <span className="text-[10px] text-white/30 uppercase">Python dict (type: dict)</span>
            </div>
            <div className="font-mono text-[11px] text-white/70 bg-black/30 rounded-xl p-3 border border-green-500/20 overflow-auto flex-1">
              <div className="text-white/40">{`{`}</div>
              <div className="pl-4 text-purple-300">&quot;questions&quot;: [</div>
              {questions.map((q: { id?: number; question: string; difficulty: string; topic?: string }, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: i * 0.15 }}
                  className="pl-8 text-white/60"
                >
                  {`{ "question": "${q.question}", "difficulty": "${q.difficulty}"${q.topic ? `, "topic": "${q.topic}"` : ''} }`}{i < questions.length - 1 ? ',' : ''}
                </motion.div>
              ))}
              <div className="pl-4 text-purple-300">]</div>
              <div className="text-white/40">{`}`}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase D: Formatted Output */}
      <AnimatePresence>
        {showFormatted && (
          <motion.div
            key="formatted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="flex-1 min-h-0 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded">json.dumps(parsed, indent=2)</span>
            </div>
            <div className="space-y-2 overflow-auto flex-1">
              {questions.map((q: { id?: number; question: string; difficulty: string; topic?: string }, i: number) => {
                const diffColor = difficultyColors[q.difficulty] || '#fbbf24';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ ...spring, delay: i * 0.2 }}
                    className="bg-navy-700/50 border border-white/10 rounded-lg p-3 flex items-start gap-3"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-white/80 font-medium">{q.question}</div>
                    </div>
                    <div className="flex gap-2 items-center shrink-0">
                      {q.topic && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                          {q.topic}
                        </span>
                      )}
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                        style={{ color: diffColor, backgroundColor: `${diffColor}15`, border: `1px solid ${diffColor}30` }}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle state */}
      {phase === 'idle' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/20 text-sm">Step through the code to see JSON parsing in action</div>
        </div>
      )}
    </div>
  );
}
