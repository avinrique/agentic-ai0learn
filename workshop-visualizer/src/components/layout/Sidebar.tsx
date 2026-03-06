'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { lessons, partLabels, partColors } from '@/data/lessons';
import { useUIStore } from '@/stores/uiStore';
import { usePartProgress } from '@/stores/progressStore';
import LessonStatusBadge from '@/components/ui/LessonStatusBadge';

function PartProgressBar({ part }: { part: number }) {
  const { completed, total } = usePartProgress(part);
  const color = partColors[part];
  const pct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="px-3 pb-2 flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] text-white/30 font-mono whitespace-nowrap">
        {completed}/{total}
      </span>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const parts = [0, 1, 2, 3];

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="bg-navy-800 border-r border-white/10 h-screen overflow-hidden flex flex-col flex-shrink-0"
    >
      {/* Header + Toggle */}
      <div className="border-b border-white/10 flex items-center">
        <Link href="/" className="flex-1 min-w-0 p-4">
          {sidebarCollapsed ? (
            <span className="text-lg font-bold text-accent-blue">W</span>
          ) : (
            <>
              <h1 className="text-lg font-bold text-accent-blue whitespace-nowrap">Workshop Visualizer</h1>
              <p className="text-xs text-white/40 mt-1 whitespace-nowrap">OpenAI API Workshop</p>
            </>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-2 mr-1 text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.span
            animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="block text-sm"
          >
            ◀
          </motion.span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto overflow-x-hidden">
        {parts.map((part) => {
          const partLessons = lessons.filter((l) => l.part === part);
          if (partLessons.length === 0) return null;
          return (
            <div key={part} className="mb-4">
              {!sidebarCollapsed && (
                <>
                  <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider px-3 py-2 whitespace-nowrap">
                    {part === 0 ? 'Foundations' : `Part ${part}: ${partLabels[part]}`}
                  </h2>
                  <PartProgressBar part={part} />
                </>
              )}
              {sidebarCollapsed && (
                <div className="h-px bg-white/10 mx-2 my-2" />
              )}
              <ul className="space-y-0.5">
                {partLessons.map((lesson) => {
                  const isActive = pathname === lesson.route;
                  const globalIdx = lessons.indexOf(lesson) + 1;
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={lesson.route}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-accent-blue/20 text-accent-blue shadow-glow-blue'
                            : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                        } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                        title={sidebarCollapsed ? lesson.shortTitle : undefined}
                      >
                        <LessonStatusBadge
                          lessonId={lesson.id}
                          globalIndex={globalIdx}
                          isActive={isActive}
                          color={partColors[lesson.part]}
                        />
                        {!sidebarCollapsed && (
                          <span className="truncate">{lesson.shortTitle}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-white/10 text-xs text-white/20 whitespace-nowrap">
          Built with Next.js + Framer Motion
        </div>
      )}
    </motion.aside>
  );
}
