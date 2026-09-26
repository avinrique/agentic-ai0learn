'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import FewShotAnim from '@/components/animations/FewShotAnim';
import VariantSelector from '@/components/interactive/VariantSelector';
import { fewShotCode } from '@/data/code-snippets';
import { fewShotTrace, fewShotVariants, fewShotZeroShotReplies } from '@/data/traces';

export default function FewShotPage() {
  return (
    <LessonLayout
      title="Few-Shot Learning"
      description="Teach the AI new tasks by providing examples in the conversation."
      animationPanel={<FewShotAnim zeroShotReplies={fewShotZeroShotReplies} />}
      steps={fewShotTrace}
      variants={fewShotVariants}
      lessonId="few-shot"
    >
      <TracerPanel code={fewShotCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
