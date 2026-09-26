'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentLoopPanel from '@/components/animations/AgentLoopPanel';
import type { ToolCard } from '@/components/animations/AgentLoopDiagram';
import VariantSelector from '@/components/interactive/VariantSelector';
import { multiFunctionCode } from '@/data/code-snippets';
import { multiFunctionTrace, multiFunctionVariants } from '@/data/traces';

// The tool menu, as written in the code's tools list.
const TOOLS: ToolCard[] = [
  { name: 'add', icon: '+', color: '#4a9eff', description: 'Add two numbers', params: ['a', 'b'] },
  { name: 'subtract', icon: '−', color: '#f87171', description: 'Subtract b from a', params: ['a', 'b'] },
  { name: 'multiply', icon: '×', color: '#fbbf24', description: 'Multiply two numbers', params: ['a', 'b'] },
  { name: 'divide', icon: '÷', color: '#a78bfa', description: 'Divide a by b', params: ['a', 'b'] },
];

export default function MultiFunctionPage() {
  return (
    <LessonLayout
      title="Multi-Function Agent: Math Tutor"
      description="An agent with 4 tools and a loop that cycles multiple times."
      animationPanel={
        <AgentLoopPanel
          agentName="Math Tutor Agent"
          accentColor="#fbbf24"
          tools={TOOLS}
          loop
        />
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
