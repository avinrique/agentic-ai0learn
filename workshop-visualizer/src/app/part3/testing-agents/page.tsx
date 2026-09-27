'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import TestingAgentsAnim from '@/components/animations/testing-agents/TestingAgentsAnim';
import { testingAgentsCode } from '@/data/code-snippets/testing-agents';
import { testingAgentsTrace, testingAgentsVariants } from '@/data/traces/testing-agents';

export default function TestingAgentsPage() {
  return (
    <LessonLayout
      title="Testing Your Agent"
      description="Write test cases, run the agent on each, and get a score, so you know it really works."
      animationPanel={<TestingAgentsAnim />}
      steps={testingAgentsTrace}
      variants={testingAgentsVariants}
      lessonId="testing-agents"
    >
      <TracerPanel code={testingAgentsCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
