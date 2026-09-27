'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import GuardrailsAnim from '@/components/animations/guardrails/GuardrailsAnim';
import { guardrailsCode } from '@/data/code-snippets/guardrails';
import { guardrailsTrace, guardrailsVariants } from '@/data/traces/guardrails';

export default function GuardrailsPage() {
  return (
    <LessonLayout
      title="Code: Guardrails & Human Approval"
      description="Check what goes in and out, and ask a human before the agent does anything risky."
      animationPanel={<GuardrailsAnim />}
      steps={guardrailsTrace}
      variants={guardrailsVariants}
      lessonId="guardrails"
    >
      <TracerPanel code={guardrailsCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
