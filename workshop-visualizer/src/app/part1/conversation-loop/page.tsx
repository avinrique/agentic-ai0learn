'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import ConversationLoopAnim from '@/components/animations/ConversationLoopAnim';
import VariantSelector from '@/components/interactive/VariantSelector';
import { conversationLoopCode } from '@/data/code-snippets';
import { conversationLoopTrace, conversationLoopVariants } from '@/data/traces';

export default function ConversationLoopPage() {
  return (
    <LessonLayout
      title="3. Conversation Loop"
      description="Build a multi-turn chatbot that remembers context across messages."
      animationPanel={<ConversationLoopAnim />}
      steps={conversationLoopTrace}
      variants={conversationLoopVariants}
      lessonId="conversation-loop"
    >
      <TracerPanel code={conversationLoopCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
