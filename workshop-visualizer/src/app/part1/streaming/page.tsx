'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import StreamingAnim from '@/components/animations/streaming/StreamingAnim';
import { streamingCode } from '@/data/code-snippets/streaming';
import { streamingTrace, streamingVariants } from '@/data/traces/streaming';

export default function StreamingPage() {
  return (
    <LessonLayout
      title="Streaming: The Typing Effect"
      description="Show the answer word by word as it is written, like ChatGPT does."
      animationPanel={<StreamingAnim />}
      steps={streamingTrace}
      variants={streamingVariants}
      lessonId="streaming"
    >
      <TracerPanel code={streamingCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
