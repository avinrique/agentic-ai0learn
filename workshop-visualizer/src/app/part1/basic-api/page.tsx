'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import ApiCallFlow from '@/components/animations/ApiCallFlow';
import { basicApiCode } from '@/data/code-snippets';
import { basicApiTrace } from '@/data/traces';

export default function BasicApiPage() {
  return (
    <LessonLayout
      title="1. Basic API Call"
      description="Send your first prompt to OpenAI and get a response back."
      animationPanel={<ApiCallFlow />}
      steps={basicApiTrace}
      lessonId="basic-api"
    >
      <TracerPanel code={basicApiCode} />
    </LessonLayout>
  );
}
