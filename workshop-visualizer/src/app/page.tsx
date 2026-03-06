'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { lessons, partLabels, partColors } from '@/data/lessons';
import { useOverallProgress, usePartProgress } from '@/stores/progressStore';
import ProgressRing from '@/components/ui/ProgressRing';
import LessonStatusBadge from '@/components/ui/LessonStatusBadge';

const springConfig = { type: 'spring' as const, damping: 20, stiffness: 100 };

function OverallProgressHero() {
  const { completed, total, pct } = useOverallProgress();
  if (completed === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
      className="w-full max-w-6xl mb-8 px-6 py-4 rounded-2xl border border-white/10 bg-navy-800/50"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/60">Overall Progress</span>
        <span className="text-sm font-mono text-white/40">
          {completed}/{total} lessons ({pct}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-gold"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

function PartCompletionRing({ part }: { part: number }) {
  const { completed, total } = usePartProgress(part);
  if (completed === 0) return null;
  const color = partColors[part];
  const pct = total > 0 ? completed / total : 0;

  return (
    <ProgressRing size={48} strokeWidth={3} progress={pct} color={color}>
      <span className="text-xs font-bold text-white/60">{completed}/{total}</span>
    </ProgressRing>
  );
}

export default function HomePage() {
  const parts = [0, 1, 2, 3];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-white mb-4">
          Workshop{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-purple to-accent-gold">
            Visualizer
          </span>
        </h1>
        <p className="text-lg text-white/40 max-w-xl mx-auto">
          Learn OpenAI API concepts with interactive animations and program tracing.
          From fundamentals to building autonomous agents.
        </p>
      </motion.div>

      <OverallProgressHero />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {parts.map((part, partIdx) => {
          const partLessons = lessons.filter((l) => l.part === part);
          const color = partColors[part];
          return (
            <motion.div
              key={part}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springConfig, delay: partIdx * 0.15 }}
              className="rounded-2xl border-2 p-6 bg-navy-800/50 relative"
              style={{ borderColor: `${color}30` }}
            >
              {/* Part completion ring */}
              <div className="absolute top-4 right-4">
                <PartCompletionRing part={part} />
              </div>

              <div
                className="text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color }}
              >
                {part === 0 ? 'Foundations' : `Part ${part}`}
              </div>
              <h2 className="text-xl font-bold text-white mb-4">
                {partLabels[part]}
              </h2>
              <ul className="space-y-2">
                {partLessons.map((lesson) => {
                  const globalIdx = lessons.indexOf(lesson) + 1;
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={lesson.route}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-all group"
                      >
                        <LessonStatusBadge
                          lessonId={lesson.id}
                          globalIndex={globalIdx}
                          isActive={false}
                          color={color}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-white/80 group-hover:text-white transition-colors">
                            {lesson.title}
                          </div>
                          <div className="text-white/30 text-xs mt-0.5 truncate">
                            {lesson.description}
                          </div>
                        </div>
                        <span className="text-white/20 group-hover:text-white/50 transition-colors">
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center text-xs text-white/20"
      >
        Built with Next.js + Framer Motion + React Flow
      </motion.div>
    </div>
  );
}
