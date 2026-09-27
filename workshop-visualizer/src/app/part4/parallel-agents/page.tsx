'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import ParallelAgentsAnim from '@/components/animations/parallel-agents/ParallelAgentsAnim';
import { parallelAgentsCode } from '@/data/code-snippets/parallel-agents';
import { parallelAgentsTrace, parallelAgentsVariants } from '@/data/traces/parallel-agents';

export default function ParallelAgentsPage() {
  return (
    <LessonLayout
      title="Code: Agents in Parallel"
      description="Rita researches several topics at the same time, so the team finishes in about the time of one job."
      animationPanel={<ParallelAgentsAnim />}
      steps={parallelAgentsTrace}
      variants={parallelAgentsVariants}
      lessonId="parallel-agents"
    >
      <TracerPanel code={parallelAgentsCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
