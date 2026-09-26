'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import ApiCallFlow from '@/components/animations/ApiCallFlow';
import JsonParseAnim from '@/components/animations/JsonParseAnim';
import VariantSelector from '@/components/interactive/VariantSelector';
import { jsonOutputCode } from '@/data/code-snippets';
import { jsonOutputTrace, jsonOutputVariants } from '@/data/traces';

export default function JsonOutputPage() {
  return (
    <LessonLayout
      title="JSON Output"
      description="Force the AI to respond in structured JSON format."
      animationPanel={
        <div className="h-full flex flex-col">
          <div className="h-[38%] min-h-0"><ApiCallFlow /></div>
          <div className="flex-1 min-h-0 border-t border-white/10"><JsonParseAnim /></div>
        </div>
      }
      steps={jsonOutputTrace}
      variants={jsonOutputVariants}
      lessonId="json-output"
    >
      <TracerPanel code={jsonOutputCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
