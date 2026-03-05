'use client';
import ConceptLayout from '@/components/layout/ConceptLayout';
import HallucinationAnim from '@/components/animations/HallucinationAnim';
import { hallucinationSteps } from '@/data/concept-steps';

export default function HallucinationPage() {
  return (
    <ConceptLayout
      title="Hallucination"
      description="When AI confidently says things that aren't true — and how to fight it."
      steps={hallucinationSteps}
      animationPanel={<HallucinationAnim />}
    />
  );
}
