'use client';
import ConceptLayout from '@/components/layout/ConceptLayout';
import AgentsAnim from '@/components/animations/AgentsAnim';
import { agentsSteps } from '@/data/concept-steps';

export default function AgentsPage() {
  return (
    <ConceptLayout
      title="Agents & Tools"
      description="When LLMs can DO things — not just talk about them."
      steps={agentsSteps}
      animationPanel={<AgentsAnim />}
      lessonId="agents"
    />
  );
}
