'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

/*
 * Hallucination lesson playgrounds.
 *  - mode "quiz": Real or Made-up? Eight AI-style statements, click to guess, animated reveal + score.
 *  - mode "fix":  the same question answered without and with grounding (a retrieved source to quote).
 * All answers are prepared text (no live model). Fake people, journals and court cases are invented
 * for this demo and deliberately given unusual names.
 */

const spring = { type: 'spring' as const, damping: 22, stiffness: 200 };

interface QuizItem {
  kind: string;
  text: string;
  real: boolean;
  why: string;
}

const quiz: QuizItem[] = [
  {
    kind: 'Fact',
    text: 'Octopuses have three hearts: two pump blood through the gills and one pumps it to the rest of the body.',
    real: true,
    why: 'True. Two “branchial” hearts serve the gills and one “systemic” heart serves the body.',
  },
  {
    kind: 'Citation',
    text: 'A 2019 study by Dr. Elowen Brackwater in the Journal of Quantum Gastronomy found that dark chocolate improves memory by 40%.',
    real: false,
    why: 'Made up. There is no such author or journal (invented for this demo). A precise number plus a formal-sounding source is a classic hallucination pattern.',
  },
  {
    kind: 'Fact',
    text: 'Botanically, bananas count as berries, but strawberries do not.',
    real: true,
    why: 'True, even though it sounds wrong. Botanists define berries by how the fruit forms from the flower, not by everyday usage.',
  },
  {
    kind: 'Fact',
    text: 'The Python programming language is named after the python snake.',
    real: false,
    why: 'Wrong. Guido van Rossum named it after the comedy show “Monty Python’s Flying Circus”. The snake guess just sounds likely.',
  },
  {
    kind: 'Court case',
    text: 'In Thornbury v. Glimmerstone Robotics (2021), a US court ruled that chatbots can own the copyright to their writing.',
    real: false,
    why: 'Made up (names invented for this demo). In real US cases such as Thaler v. Perlmutter (2023), courts held that copyright needs a human author.',
  },
  {
    kind: 'Fact',
    text: 'The Eiffel Tower was completed in 1889, in time for the World’s Fair in Paris.',
    real: true,
    why: 'True. It was finished in March 1889 for the Exposition Universelle (the 1889 World’s Fair).',
  },
  {
    kind: 'Fact',
    text: 'The Great Wall of China is easy to see from the Moon with the naked eye.',
    real: false,
    why: 'A popular myth. The wall is long but very narrow; from the Moon it is far too small to see. Models repeat myths that appear often in their training text.',
  },
  {
    kind: 'Fact',
    text: 'Light from the Sun takes about 8 minutes to reach Earth.',
    real: true,
    why: 'True. At about 150 million km away, sunlight takes roughly 8 minutes and 20 seconds.',
  },
];

function stopSpace(e: React.KeyboardEvent) {
  // Keep Space on a focused button from also toggling autoplay (arrows still change steps).
  if (e.key === ' ' && (e.target as HTMLElement).tagName === 'BUTTON') e.stopPropagation();
}

/* ------------------------------------------------------------------ */
/* Quiz                                                                */
/* ------------------------------------------------------------------ */

function Quiz() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(() => quiz.map(() => null));
  const done = idx >= quiz.length;
  const item = quiz[Math.min(idx, quiz.length - 1)];
  const guess = done ? null : answers[idx];
  const answered = guess !== null;
  const correct = answered && guess === item.real;
  const score = answers.filter((a, i) => a !== null && a === quiz[i].real).length;

  const choose = (g: boolean) => {
    if (answered) return;
    setAnswers((prev) => prev.map((a, i) => (i === idx ? g : a)));
  };
  const restart = () => {
    setAnswers(quiz.map(() => null));
    setIdx(0);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-4 gap-4" onKeyDownCapture={stopSpace}>
      {/* Header + progress */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <p className="text-sm font-semibold text-white/80">
          Real or Made up? <span className="text-white/40 font-normal">Each line is something an AI might say.</span>
        </p>
        <motion.span
          key={score}
          className="text-sm font-bold text-accent-gold px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/30"
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={spring}
        >
          Score {score}/{quiz.length}
        </motion.span>
      </div>
      <div className="w-full max-w-2xl flex gap-1.5">
        {quiz.map((q, i) => {
          const a = answers[i];
          const color = a === null ? 'rgba(255,255,255,0.12)' : a === q.real ? '#4ade80' : '#ef4444';
          return (
            <motion.div
              key={i}
              className="flex-1 h-2 rounded-full"
              animate={{ backgroundColor: color, scaleY: i === idx ? 1.6 : 1 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={idx}
            className="w-full max-w-2xl flex flex-col gap-3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={spring}
          >
            {/* Statement card */}
            <motion.div
              className="relative rounded-xl border-2 p-5"
              animate={{
                borderColor: !answered ? 'rgba(74,222,128,0.3)' : item.real ? 'rgba(74,222,128,0.7)' : 'rgba(239,68,68,0.7)',
                backgroundColor: !answered ? 'rgba(74,222,128,0.05)' : item.real ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)',
                x: answered && !correct ? [0, -8, 8, -5, 5, 0] : 0,
              }}
              transition={{ duration: 0.45 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green">AI</span>
                <span className="text-xs text-white/40">
                  {idx + 1} of {quiz.length} · {item.kind}
                </span>
              </div>
              <p className="text-base text-white/90 leading-relaxed">&quot;{item.text}&quot;</p>

              <AnimatePresence>
                {answered && (
                  <motion.div
                    className="absolute -top-3 -right-3 px-3 py-1 rounded-lg border-2"
                    style={{
                      backgroundColor: item.real ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)',
                      borderColor: item.real ? 'rgba(74,222,128,0.6)' : 'rgba(239,68,68,0.6)',
                    }}
                    initial={{ scale: 0, rotate: 20 }}
                    animate={{ scale: 1, rotate: -8 }}
                    transition={spring}
                  >
                    <span className="font-bold text-sm" style={{ color: item.real ? '#4ade80' : '#f87171' }}>
                      {item.real ? 'REAL' : 'MADE UP'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Buttons or explanation */}
            {!answered ? (
              <div className="flex gap-3 justify-center">
                <motion.button
                  type="button"
                  onClick={() => choose(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 rounded-xl border-2 border-accent-green/50 bg-accent-green/10 text-accent-green font-bold text-sm"
                >
                  ✓ Real
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => choose(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 rounded-xl border-2 border-red-400/50 bg-red-400/10 text-red-400 font-bold text-sm"
                >
                  ✗ Made up
                </motion.button>
              </div>
            ) : (
              <motion.div
                className="flex items-start gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.2 }}
              >
                <div className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-3">
                  <p className="text-sm font-bold mb-1" style={{ color: correct ? '#4ade80' : '#f87171' }}>
                    {correct ? 'You got it!' : 'Not quite.'}
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed">{item.why}</p>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setIdx(idx + 1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="self-center px-4 py-2.5 rounded-xl border border-accent-blue/50 bg-accent-blue/15 text-accent-blue font-bold text-sm whitespace-nowrap"
                >
                  {idx === quiz.length - 1 ? 'See score' : 'Next →'}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="done"
            className="w-full max-w-xl flex flex-col items-center gap-3 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
          >
            <motion.p
              className="text-5xl font-bold"
              style={{ color: score >= 6 ? '#4ade80' : score >= 4 ? '#fbbf24' : '#f87171' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...spring, delay: 0.2 }}
            >
              {score}/{quiz.length}
            </motion.p>
            <p className="text-base text-white/80">
              {score === quiz.length
                ? 'Perfect! But notice how much you had to already know.'
                : 'Tricky, right? The fakes sounded just as confident as the real ones.'}
            </p>
            <p className="text-sm text-white/50 leading-relaxed">
              Every statement was written in the same calm, sure tone. That is the problem: the only reliable way to
              tell is to check a trusted source.
            </p>
            <motion.button
              type="button"
              onClick={restart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-1 px-5 py-2 rounded-xl border border-accent-blue/50 bg-accent-blue/15 text-accent-blue font-bold text-sm"
            >
              ↻ Try again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fix it: grounding on / off                                          */
/* ------------------------------------------------------------------ */

interface FixCase {
  label: string;
  question: string;
  sourceName: string;
  sourceText: string;
  ungrounded: string;
  ungroundedProblem: string;
  grounded: string;
}

const fixCases: FixCase[] = [
  {
    label: 'Eiffel Tower',
    question: 'When was the Eiffel Tower completed?',
    sourceName: 'Encyclopedia excerpt: “Eiffel Tower”',
    sourceText: 'The tower was completed in March 1889 and opened for the Exposition Universelle, the 1889 World’s Fair in Paris.',
    ungrounded: 'The Eiffel Tower was completed in 1892, three years after construction began, as a centerpiece for the World’s Fair.',
    ungroundedProblem: 'Wrong year, stated with total confidence.',
    grounded: 'It was completed in March 1889, for the 1889 World’s Fair in Paris [1].',
  },
  {
    label: 'School library fines',
    question: 'What is our school library’s late-return policy?',
    sourceName: 'Maplecrest School Handbook (fictional), page 12',
    sourceText: 'Late books: there are no fines. Borrowing is paused until the late book is returned or replaced.',
    ungrounded: 'Late books are charged $0.25 per day, up to a maximum of $10 per book.',
    ungroundedProblem: 'Invented. The model has never seen this private handbook, so it guessed a “typical” policy.',
    grounded: 'There are no fines. Your borrowing is paused until the late book is returned or replaced [1].',
  },
  {
    label: 'A source, please',
    question: 'Give me a source for “octopuses have three hearts”.',
    sourceName: 'Aquarium fact sheet (provided document)',
    sourceText: 'Octopuses have three hearts. Two pump blood through the gills; the third pumps it through the rest of the body.',
    ungrounded: 'See Brackwater & Finch (2018), “Cardiac Triplicity in Cephalopods”, Journal of Marine Curiosities, 12(4): 55–61.',
    ungroundedProblem: 'Fabricated citation (names invented for this demo). Looks perfect, does not exist.',
    grounded: 'Source [1], the aquarium fact sheet you gave me, says: “Octopuses have three hearts. Two pump blood through the gills…”',
  },
];

function FixIt() {
  const [caseIdx, setCaseIdx] = useState(0);
  const [grounded, setGrounded] = useState(false);
  const c = fixCases[caseIdx];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-4 gap-3" onKeyDownCapture={stopSpace}>
      <div className="w-full max-w-3xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {fixCases.map((fc, i) => (
            <motion.button
              key={fc.label}
              type="button"
              onClick={() => setCaseIdx(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 rounded-full border text-xs font-medium"
              animate={{
                backgroundColor: caseIdx === i ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.04)',
                borderColor: caseIdx === i ? 'rgba(74,158,255,0.7)' : 'rgba(255,255,255,0.15)',
                color: caseIdx === i ? '#4a9eff' : 'rgba(255,255,255,0.6)',
              }}
            >
              {fc.label}
            </motion.button>
          ))}
        </div>

        {/* Toggle */}
        <button
          type="button"
          onClick={() => setGrounded(!grounded)}
          className="flex items-center gap-2 text-sm font-semibold"
          aria-pressed={grounded}
        >
          <span className={grounded ? 'text-white/40' : 'text-red-400'}>Guessing</span>
          <motion.span
            className="relative w-12 h-6 rounded-full border"
            animate={{
              backgroundColor: grounded ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.25)',
              borderColor: grounded ? 'rgba(74,222,128,0.7)' : 'rgba(239,68,68,0.6)',
            }}
          >
            <motion.span
              className="absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white"
              animate={{ left: grounded ? 26 : 3 }}
              transition={spring}
            />
          </motion.span>
          <span className={grounded ? 'text-accent-green' : 'text-white/40'}>Grounding (RAG)</span>
        </button>
      </div>

      <div className="w-full max-w-3xl flex gap-4 items-stretch">
        {/* Left: what the model receives */}
        <div className="w-[42%] flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wider text-white/40">What the model is given</p>
          <motion.div
            key={`q-${caseIdx}`}
            className="rounded-lg border border-accent-blue/30 bg-accent-blue/10 px-3 py-2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[10px] font-bold uppercase text-white/40 block">question</span>
            <span className="text-sm text-blue-100">{c.question}</span>
          </motion.div>
          <AnimatePresence mode="wait">
            {grounded ? (
              <motion.div
                key={`src-${caseIdx}`}
                className="rounded-lg border border-accent-green/40 bg-accent-green/[0.07] px-3 py-2"
                initial={{ opacity: 0, x: -60, rotate: -4 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={spring}
              >
                <span className="text-[10px] font-bold uppercase text-accent-green/80 block">
                  📄 retrieved source [1]
                </span>
                <span className="text-xs text-white/50 block mb-1">{c.sourceName}</span>
                <span className="text-sm text-white/80 leading-snug">“{c.sourceText}”</span>
              </motion.div>
            ) : (
              <motion.div
                key="nosrc"
                className="rounded-lg border border-dashed border-white/15 px-3 py-3 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="text-xs text-white/40">No documents. The model must answer from memory.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Arrow */}
        <motion.div
          className="self-center text-2xl"
          animate={{ x: [0, 6, 0], color: grounded ? '#4ade80' : '#f87171' }}
          transition={{ x: { duration: 1.2, repeat: Infinity }, color: { duration: 0.3 } }}
        >
          →
        </motion.div>

        {/* Right: the answer */}
        <div className="flex-1 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wider text-white/40">The answer</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${caseIdx}-${grounded}`}
              className="relative rounded-xl border-2 p-4 flex-1"
              style={{
                borderColor: grounded ? 'rgba(74,222,128,0.55)' : 'rgba(239,68,68,0.55)',
                backgroundColor: grounded ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)',
              }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green">AI</span>
              <motion.p
                className="text-sm text-white/85 leading-relaxed mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: grounded ? 0.45 : 0.15 }}
              >
                {grounded ? c.grounded : c.ungrounded}
              </motion.p>
              <motion.div
                className="flex items-start gap-2 mt-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: 0.7 }}
              >
                <span
                  className="text-xs px-2 py-0.5 rounded border font-bold flex-shrink-0"
                  style={
                    grounded
                      ? { color: '#4ade80', borderColor: 'rgba(74,222,128,0.5)', backgroundColor: 'rgba(74,222,128,0.15)' }
                      : { color: '#f87171', borderColor: 'rgba(239,68,68,0.5)', backgroundColor: 'rgba(239,68,68,0.15)' }
                  }
                >
                  {grounded ? '✓ GROUNDED' : '✗ HALLUCINATED'}
                </span>
                <span className="text-xs text-white/60 leading-snug">
                  {grounded ? 'Quotes the source, and you can check [1] yourself.' : c.ungroundedProblem}
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="text-xs text-white/35 text-center max-w-2xl">
        Illustration with prepared answers. Grounding greatly reduces made-up answers but does not remove them fully,
        so important answers still need checking.
      </p>
    </div>
  );
}

export default function HallucinationPlayground({ mode }: { mode: 'quiz' | 'fix' }) {
  return mode === 'quiz' ? <Quiz /> : <FixIt />;
}
