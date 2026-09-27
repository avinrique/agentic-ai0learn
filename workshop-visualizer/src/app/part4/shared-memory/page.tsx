'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import SharedMemoryAnim from '@/components/animations/shared-memory/SharedMemoryAnim';
import { sharedMemoryCode } from '@/data/code-snippets/shared-memory';
import { sharedMemoryTrace, sharedMemoryVariants } from '@/data/traces/shared-memory';

export default function SharedMemoryPage() {
  return (
    <LessonLayout
      title="Code: A Shared Whiteboard"
      description="Agents write notes on a shared whiteboard, so each one can read everything the others found."
      animationPanel={<SharedMemoryAnim />}
      steps={sharedMemoryTrace}
      variants={sharedMemoryVariants}
      lessonId="shared-memory"
    >
      <TracerPanel code={sharedMemoryCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
