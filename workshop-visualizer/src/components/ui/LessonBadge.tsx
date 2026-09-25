import { lessons, partLabels, partColors } from '@/data/lessons';

// "Lesson 12 of 18 · API Basics" — the same number the sidebar shows.
export default function LessonBadge({ lessonId }: { lessonId: string }) {
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index < 0) return null;
  const part = lessons[index].part;

  return (
    <div className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: partColors[part] }}>
      Lesson {index + 1} of {lessons.length} · Part {part}: {partLabels[part]}
    </div>
  );
}
