'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentDataFlow from '@/components/animations/AgentDataFlow';
import ToolSelectionAnim from '@/components/animations/ToolSelectionAnim';
import VariantSelector from '@/components/interactive/VariantSelector';
import { simpleAgentCode } from '@/data/code-snippets';
import { simpleAgentTrace, simpleAgentVariants } from '@/data/traces';

export default function SimpleAgentPage() {
  return (
    <LessonLayout
      title="6. Simple Agent: Calculator"
      description="Build your first agent with a single tool — the add function."
      animationPanel={
        <div className="h-full flex flex-col">
          <div className="flex-1"><AgentDataFlow accentColor="#4a9eff" agentName="Simple Calculator Agent" /></div>
          <div className="border-t border-white/10 py-4">
            <ToolSelectionAnim tools={[{ name: 'add', icon: '+', color: '#4a9eff' }]} />
          </div>
        </div>
      }
      steps={simpleAgentTrace}
      variants={simpleAgentVariants}
      lessonId="simple-agent"
    >
      <TracerPanel code={simpleAgentCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
