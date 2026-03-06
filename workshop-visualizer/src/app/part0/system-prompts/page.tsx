'use client';
import ConceptLayout from '@/components/layout/ConceptLayout';
import SystemPromptsAnim from '@/components/animations/SystemPromptsAnim';
import { systemPromptSteps } from '@/data/concept-steps';

export default function SystemPromptsPage() {
  return (
    <ConceptLayout
      title="System Prompts"
      description="How messages[0] shapes the entire personality of your AI."
      steps={systemPromptSteps}
      animationPanel={<SystemPromptsAnim />}
      lessonId="system-prompts"
    />
  );
}
