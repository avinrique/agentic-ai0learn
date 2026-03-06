'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import MessageArrayBuilder from '@/components/animations/MessageArrayBuilder';
import { systemPromptsCode } from '@/data/code-snippets';
import { systemPromptsTrace } from '@/data/traces';

export default function SystemPromptsPage() {
  return (
    <LessonLayout
      title="2. System Prompts & Role Playing"
      description="Use system messages to control the AI's personality and behavior."
      animationPanel={<MessageArrayBuilder />}
      steps={systemPromptsTrace}
      lessonId="system-prompts-tracer"
    >
      <TracerPanel code={systemPromptsCode} />
    </LessonLayout>
  );
}
