'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { lessonGuides } from '@/data/lessonGuides';
import { lessons } from '@/data/lessons';
import { useProgressStore } from '@/stores/progressStore';

const spring = { type: 'spring' as const, damping: 22, stiffness: 220 };

// "Quick check" button for the last step of a lesson. It pulses until the quiz
// has been taken once, then shows the best score.
export function QuizLauncher({ lessonId }: { lessonId: string }) {
  const [open, setOpen] = useState(false);
  const best = useProgressStore((s) => s.quizScores[lessonId]);
  const guide = lessonGuides[lessonId];
  if (!guide) return null;
  const total = guide.quiz.length;

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        animate={best === undefined ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={best === undefined ? { repeat: Infinity, duration: 1.6 } : undefined}
        className="px-3 py-1.5 rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 text-sm font-semibold transition-colors whitespace-nowrap"
      >
        🧠 Quick check{best !== undefined ? ` · ${best}/${total}` : ''}
      </motion.button>
      <AnimatePresence>{open && <LessonQuiz lessonId={lessonId} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function LessonQuiz({ lessonId, onClose }: { lessonId: string; onClose: () => void }) {
  const quiz = lessonGuides[lessonId]?.quiz ?? [];
  const setQuizScore = useProgressStore((s) => s.setQuizScore);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const finished = index >= quiz.length;

  const lessonIndex = lessons.findIndex((l) => l.id === lessonId);
  const nextLesson = lessons[lessonIndex + 1];

  // Esc closes; keys must not reach the global step navigation while the quiz is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  useEffect(() => {
    if (finished) setQuizScore(lessonId, score);
  }, [finished, lessonId, score, setQuizScore]);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === quiz[index].answer) setScore((s) => s + 1);
  };

  const next = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
  };

  const q = quiz[index];
  const correct = picked !== null && q && picked === q.answer;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 30, scale: 0.96 }}
        transition={spring}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-white/10 bg-navy-800 shadow-2xl overflow-hidden"
        role="dialog"
        aria-label="Quick check"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="text-sm font-semibold text-accent-purple">🧠 Quick check</div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {quiz.map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    i < index ? 'bg-accent-purple' : i === index && !finished ? 'bg-accent-purple/60' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white text-lg leading-none" aria-label="Close">
              ×
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {!finished && q ? (
              <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-xs text-white/40 mb-2">
                  Question {index + 1} of {quiz.length}
                </div>
                <div className="text-lg font-semibold text-white leading-snug mb-4">{q.q}</div>
                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const isAnswer = i === q.answer;
                    const isPicked = i === picked;
                    const state =
                      picked === null ? 'idle' : isAnswer ? 'right' : isPicked ? 'wrong' : 'faded';
                    return (
                      <motion.button
                        key={i}
                        onClick={() => choose(i)}
                        disabled={picked !== null}
                        animate={state === 'wrong' ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                        transition={{ duration: 0.35 }}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-[15px] transition-colors ${
                          state === 'idle'
                            ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                            : state === 'right'
                              ? 'border-accent-green/50 bg-accent-green/15 text-white'
                              : state === 'wrong'
                                ? 'border-accent-red/50 bg-accent-red/15 text-white'
                                : 'border-white/5 bg-white/[0.02] text-white/30'
                        }`}
                      >
                        <span className="mr-2">{state === 'right' ? '✅' : state === 'wrong' ? '❌' : String.fromCharCode(65 + i) + '.'}</span>
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {picked !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 px-4 py-3 rounded-xl text-[14px] leading-relaxed ${
                        correct ? 'bg-accent-green/10 text-green-100' : 'bg-accent-gold/10 text-amber-100'
                      }`}
                    >
                      <span className="font-semibold">{correct ? 'Nice! ' : 'Not quite. '}</span>
                      {q.why}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end mt-5">
                  <button
                    onClick={next}
                    disabled={picked === null}
                    className="px-4 py-2 rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {index === quiz.length - 1 ? 'See my score' : 'Next question →'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="text-5xl mb-3">{score === quiz.length ? '🏆' : score >= quiz.length - 1 ? '🌟' : '💪'}</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {score} / {quiz.length} correct
                </div>
                <div className="text-[15px] text-white/60 mb-6">
                  {score === quiz.length
                    ? 'Perfect! You really understood this lesson.'
                    : score >= quiz.length - 1
                      ? 'Great job! Read the explanations for the one you missed.'
                      : 'Good try! Step back through the lesson, then try again.'}
                </div>
                <div className="flex justify-center gap-3">
                  <button onClick={restart} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm">
                    Try again
                  </button>
                  {nextLesson ? (
                    <Link
                      href={nextLesson.route}
                      className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-semibold"
                    >
                      Next: {nextLesson.shortTitle} →
                    </Link>
                  ) : (
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-semibold">
                      Finish 🎉
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
