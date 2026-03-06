'use client';
import ConceptLayout from '@/components/layout/ConceptLayout';
import ContextMemoryAnim from '@/components/animations/ContextMemoryAnim';
import { contextMemorySteps } from '@/data/concept-steps';

export default function ContextMemoryPage() {
  return (
    <ConceptLayout
      title="Context & Memory"
      description="LLMs don't remember — and the system prompt is just message[0]."
      steps={contextMemorySteps}
      animationPanel={<ContextMemoryAnim />}
      lessonId="context-memory"
    />
  );
}
