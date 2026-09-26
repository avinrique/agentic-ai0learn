'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentLoopPanel from '@/components/animations/AgentLoopPanel';
import type { ToolCard } from '@/components/animations/AgentLoopDiagram';
import VariantSelector from '@/components/interactive/VariantSelector';
import { simpleAgentCode } from '@/data/code-snippets';
import { simpleAgentTrace, simpleAgentVariants } from '@/data/traces';

// The tool menu, as written in the code's tools list.
const TOOLS: ToolCard[] = [
  { name: 'add', icon: '+', color: '#4a9eff', description: 'Add two numbers together', params: ['a', 'b'] },
];

export default function SimpleAgentPage() {
  return (
    <LessonLayout
      title="Simple Agent: Calculator"
      description="Build your first agent with a single tool — the add function."
      animationPanel={
        <AgentLoopPanel
          agentName="Simple Calculator Agent"
          accentColor="#4a9eff"
          tools={TOOLS}
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
