'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import ChallengePipelineAnim from '@/components/animations/ChallengePipelineAnim';
import VariantSelector from '@/components/interactive/VariantSelector';
import { challengeCode } from '@/data/code-snippets';
import { challengeTrace, challengeVariants } from '@/data/traces';

export default function ChallengePage() {
  return (
    <LessonLayout
      title="Challenge: Restaurant Recommender"
      description="Combine all Part 1 skills to build a restaurant recommender."
      animationPanel={<ChallengePipelineAnim />}
      steps={challengeTrace}
      variants={challengeVariants}
      lessonId="challenge"
    >
      <TracerPanel code={challengeCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
