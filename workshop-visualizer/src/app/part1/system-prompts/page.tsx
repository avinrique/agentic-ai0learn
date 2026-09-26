'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import SystemPromptStageAnim from '@/components/animations/SystemPromptStageAnim';
import VariantSelector from '@/components/interactive/VariantSelector';
import { systemPromptsCode } from '@/data/code-snippets';
import { systemPromptsTrace, systemPromptVariants, SP_NO_SYSTEM_REPLY } from '@/data/traces';

export default function SystemPromptsPage() {
  return (
    <LessonLayout
      title="System Prompts & Role Playing"
      description="Use system messages to control the AI's personality and behavior."
      animationPanel={<SystemPromptStageAnim noSystemReply={SP_NO_SYSTEM_REPLY} />}
      steps={systemPromptsTrace}
      variants={systemPromptVariants}
      lessonId="system-prompts-tracer"
    >
      <TracerPanel code={systemPromptsCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
