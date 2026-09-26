'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import BossAgentAnim from '@/components/animations/part4/BossAgentAnim';
import { bossAgentCode } from '@/data/code-snippets/part4';
import { bossAgentTrace, bossAgentVariants } from '@/data/traces';

export default function BossAgentPage() {
  return (
    <LessonLayout
      title="Code: The Boss Agent"
      description="Max the boss uses other agents as his tools: each helper is a whole LLM call."
      animationPanel={<BossAgentAnim />}
      steps={bossAgentTrace}
      variants={bossAgentVariants}
      lessonId="boss-agent"
    >
      <TracerPanel code={bossAgentCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
