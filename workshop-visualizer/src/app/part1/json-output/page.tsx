'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import ApiCallFlow from '@/components/animations/ApiCallFlow';
import JsonParseAnim from '@/components/animations/JsonParseAnim';
import { jsonOutputCode } from '@/data/code-snippets';
import { jsonOutputTrace } from '@/data/traces';

export default function JsonOutputPage() {
  return (
    <LessonLayout
      title="3. JSON Output"
      description="Force the AI to respond in structured JSON format."
      animationPanel={
        <div className="h-full flex flex-col">
          <div className="h-1/2"><ApiCallFlow /></div>
          <div className="h-1/2 border-t border-white/10"><JsonParseAnim /></div>
        </div>
      }
      steps={jsonOutputTrace}
    >
      <TracerPanel code={jsonOutputCode} />
    </LessonLayout>
  );
}
