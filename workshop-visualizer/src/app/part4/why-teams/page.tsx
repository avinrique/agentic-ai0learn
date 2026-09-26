'use client';
import ConceptLayout from '@/components/layout/ConceptLayout';
import WhyTeamsAnim from '@/components/animations/part4/WhyTeamsAnim';
import { whyTeamsSteps } from '@/data/concept-steps/part4';

export default function WhyTeamsPage() {
  return (
    <ConceptLayout
      title="Why a Team of Agents?"
      description="One agent doing everything gets overwhelmed. A team of specialists works better."
      steps={whyTeamsSteps}
      animationPanel={<WhyTeamsAnim />}
      lessonId="why-teams"
    />
  );
}
