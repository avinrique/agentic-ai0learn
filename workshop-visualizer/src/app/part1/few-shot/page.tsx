'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import FewShotAnim from '@/components/animations/FewShotAnim';
import { fewShotCode } from '@/data/code-snippets';
import { fewShotTrace } from '@/data/traces';

export default function FewShotPage() {
  return (
    <LessonLayout
      title="4. Few-Shot Learning"
      description="Teach the AI new tasks by providing examples in the conversation."
      animationPanel={<FewShotAnim />}
      steps={fewShotTrace}
      lessonId="few-shot"
    >
      <TracerPanel code={fewShotCode} />
    </LessonLayout>
  );
}
