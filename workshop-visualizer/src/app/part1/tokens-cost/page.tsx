'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import TokensCostAnim from '@/components/animations/tokens-cost/TokensCostAnim';
import { tokensCostCode } from '@/data/code-snippets/tokens-cost';
import { tokensCostTrace, tokensCostVariants } from '@/data/traces/tokens-cost';

export default function TokensCostPage() {
  return (
    <LessonLayout
      title="Tokens & Cost in Code"
      description="Count the tokens a call used and work out what it cost."
      animationPanel={<TokensCostAnim />}
      steps={tokensCostTrace}
      variants={tokensCostVariants}
      lessonId="tokens-cost"
    >
      <TracerPanel code={tokensCostCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
