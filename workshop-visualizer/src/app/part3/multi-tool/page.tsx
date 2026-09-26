'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentLoopPanel from '@/components/animations/AgentLoopPanel';
import type { ToolCard } from '@/components/animations/AgentLoopDiagram';
import VariantSelector from '@/components/interactive/VariantSelector';
import { multiToolCode } from '@/data/code-snippets';
import { multiToolTrace, multiToolVariants } from '@/data/traces';

// The tool menu, as written in the code's tools list.
const TOOLS: ToolCard[] = [
  { name: 'add', icon: '+', color: '#4a9eff', description: 'Add two numbers together.', params: ['a', 'b'] },
  { name: 'lookup', icon: '🔍', color: '#a78bfa', description: 'Search for a concept or term in the notes file.', params: ['query'] },
];

export default function MultiToolPage() {
  return (
    <LessonLayout
      title="Multi-Tool Agent: Study Buddy"
      description="An agent with calculator + knowledge lookup tools."
      animationPanel={
        <AgentLoopPanel
          agentName="Study Buddy Agent"
          accentColor="#a78bfa"
          tools={TOOLS}
        />
      }
      steps={multiToolTrace}
      variants={multiToolVariants}
      lessonId="multi-tool"
    >
      <TracerPanel code={multiToolCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
