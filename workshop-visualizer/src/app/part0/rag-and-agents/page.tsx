'use client';
import ConceptLayout from '@/components/layout/ConceptLayout';
import RagAgentsAnim from '@/components/animations/RagAgentsAnim';
import { ragAndAgentsSteps } from '@/data/concept-steps';

export default function RagAndAgentsPage() {
  return (
    <ConceptLayout
      title="RAG & Agents"
      description="Two patterns that make LLMs truly powerful."
      steps={ragAndAgentsSteps}
      animationPanel={<RagAgentsAnim />}
    />
  );
}
