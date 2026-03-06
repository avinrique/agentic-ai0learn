'use client';
import ConceptLayout from '@/components/layout/ConceptLayout';
import RagAnim from '@/components/animations/RagAnim';
import { ragSteps } from '@/data/concept-steps';

export default function RagPage() {
  return (
    <ConceptLayout
      title="RAG (Retrieval-Augmented Generation)"
      description="Give your LLM access to private data by injecting documents into the prompt."
      steps={ragSteps}
      animationPanel={<RagAnim />}
      lessonId="rag"
    />
  );
}
