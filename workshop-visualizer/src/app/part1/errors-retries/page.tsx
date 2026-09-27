'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import ErrorsRetriesAnim from '@/components/animations/errors-retries/ErrorsRetriesAnim';
import { errorsRetriesCode } from '@/data/code-snippets/errors-retries';
import { errorsRetriesTrace, errorsRetriesVariants } from '@/data/traces/errors-retries';

export default function ErrorsRetriesPage() {
  return (
    <LessonLayout
      title="When Things Go Wrong: Errors & Retries"
      description="Catch API errors, wait and retry, and give friendly messages instead of crashes."
      animationPanel={<ErrorsRetriesAnim />}
      steps={errorsRetriesTrace}
      variants={errorsRetriesVariants}
      lessonId="errors-retries"
    >
      <TracerPanel code={errorsRetriesCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
