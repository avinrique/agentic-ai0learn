'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import ApiRoundTripAnim from '@/components/animations/ApiRoundTripAnim';
import VariantSelector from '@/components/interactive/VariantSelector';
import { basicApiCode } from '@/data/code-snippets';
import { basicApiTrace, basicApiVariants } from '@/data/traces';

export default function BasicApiPage() {
  return (
    <LessonLayout
      title="Basic API Call"
      description="Send your first prompt to OpenAI and get a response back."
      animationPanel={<ApiRoundTripAnim />}
      steps={basicApiTrace}
      variants={basicApiVariants}
      lessonId="basic-api"
    >
      <TracerPanel code={basicApiCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
