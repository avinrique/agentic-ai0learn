'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentDataFlow from '@/components/animations/AgentDataFlow';
import ToolSelectionAnim from '@/components/animations/ToolSelectionAnim';
import VariantSelector from '@/components/interactive/VariantSelector';
import { multiFunctionCode } from '@/data/code-snippets';
import { multiFunctionTrace, multiFunctionVariants } from '@/data/traces';

export default function MultiFunctionPage() {
  return (
    <LessonLayout
      title="7. Multi-Function Agent: Math Tutor"
      description="An agent with 4 tools and a loop that cycles multiple times."
      animationPanel={
        <div className="h-full flex flex-col">
          <div className="flex-1"><AgentDataFlow loopCount={2} accentColor="#fbbf24" agentName="Math Tutor Agent" /></div>
          <div className="border-t border-white/10 py-4"><ToolSelectionAnim /></div>
        </div>
      }
      steps={multiFunctionTrace}
      variants={multiFunctionVariants}
      lessonId="multi-function"
    >
      <TracerPanel code={multiFunctionCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
