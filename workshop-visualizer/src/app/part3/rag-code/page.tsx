'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import RagCodeAnim from '@/components/animations/rag-code/RagCodeAnim';
import { ragCode } from '@/data/code-snippets/rag-code';
import { ragCodeTrace, ragCodeVariants } from '@/data/traces/rag-code';

export default function RagCodePage() {
  return (
    <LessonLayout
      title="Code: RAG with Embeddings"
      description="Turn documents into embeddings, find the closest ones, and answer from them."
      animationPanel={<RagCodeAnim />}
      steps={ragCodeTrace}
      variants={ragCodeVariants}
      lessonId="rag-code"
    >
      <TracerPanel code={ragCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
