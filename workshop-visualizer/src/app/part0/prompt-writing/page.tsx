'use client';
import ConceptLayout from '@/components/layout/ConceptLayout';
import PromptWritingAnim from '@/components/animations/prompt-writing/PromptWritingAnim';
import { promptWritingSteps } from '@/data/concept-steps/prompt-writing';

export default function PromptWritingPage() {
  return (
    <ConceptLayout
      title="Writing Good Prompts"
      description="Clear, specific prompts with context, format and examples get much better answers."
      steps={promptWritingSteps}
      animationPanel={<PromptWritingAnim />}
      lessonId="prompt-writing"
    />
  );
}
