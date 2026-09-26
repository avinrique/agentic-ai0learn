'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import WriterCriticAnim from '@/components/animations/part4/WriterCriticAnim';
import { writerCriticCode } from '@/data/code-snippets/part4';
import { writerCriticTrace, writerCriticVariants } from '@/data/traces';

export default function WriterCriticPage() {
  return (
    <LessonLayout
      title="Code: Writer & Critic Loop"
      description="Wally writes, Cora reviews, and they loop until she says APPROVED (or 3 rounds run out)."
      animationPanel={<WriterCriticAnim />}
      steps={writerCriticTrace}
      variants={writerCriticVariants}
      lessonId="writer-critic"
    >
      <TracerPanel code={writerCriticCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
