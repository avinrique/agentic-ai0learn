'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentLoopPanel from '@/components/animations/AgentLoopPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import { simpleAgentCode } from '@/data/code-snippets';
import { simpleAgentTrace, simpleAgentVariants } from '@/data/traces';

export default function SimpleAgentPage() {
  return (
    <LessonLayout
      title="6. Simple Agent: Calculator"
      description="Build your first agent with a single tool — the add function."
      animationPanel={
        <AgentLoopPanel
          agentName="Simple Calculator Agent"
          accentColor="#4a9eff"
          tools={[{ name: 'add', icon: '+', color: '#4a9eff' }]}
        />
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
