'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { lessons, parts, partLabels, partColors } from '@/data/lessons';
import { lessonGuides } from '@/data/lessonGuides';
import { useProgressStore } from '@/stores/progressStore';

// Shown on a lesson's first step: the whole course as a row of dots (grouped by
// part, current lesson highlighted), plus how this lesson connects to the last one.
export default function JourneyStrip({ lessonId }: { lessonId: string }) {
  const lessonProgress = useProgressStore((s) => s.lessonProgress);
  const guide = lessonGuides[lessonId];
  const current = lessons.find((l) => l.id === lessonId);
  if (!current) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2"
    >
      {/* The course map */}
      <div className="flex items-center gap-3">
        {parts.map((part) => (
          <div key={part} className="flex items-center gap-1" title={`Part ${part}: ${partLabels[part]}`}>
            {lessons
              .filter((l) => l.part === part)
              .map((l) => {
                const isCurrent = l.id === lessonId;
                const done = lessonProgress[l.id]?.completed;
                const color = partColors[part];
                return (
                  <Link
                    key={l.id}
                    href={l.route}
                    title={l.title}
                    className="block rounded-full transition-transform hover:scale-125"
                    style={{
                      width: isCurrent ? 14 : 8,
                      height: isCurrent ? 14 : 8,
                      backgroundColor: isCurrent || done ? color : 'transparent',
                      border: `1.5px solid ${color}${isCurrent || done ? '' : '66'}`,
                      boxShadow: isCurrent ? `0 0 10px ${color}` : undefined,
                    }}
                  />
                );
              })}
          </div>
        ))}
      </div>

      {/* How today connects to last time */}
      {guide && (
        <div className="flex-1 min-w-[280px] text-[14px] leading-snug">
          {guide.lastTime && (
            <div className="text-white/50">
              <span className="font-semibold text-white/60">Last time:</span> {guide.lastTime}
            </div>
          )}
          <div className="text-white/80">
            <span className="font-semibold" style={{ color: partColors[current.part] }}>
              Today:
            </span>{' '}
            {guide.today}
          </div>
        </div>
      )}
    </motion.div>
  );
}
