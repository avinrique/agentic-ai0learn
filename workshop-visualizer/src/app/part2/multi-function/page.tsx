'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentLoopPanel from '@/components/animations/AgentLoopPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import { multiFunctionCode } from '@/data/code-snippets';
import { multiFunctionTrace, multiFunctionVariants } from '@/data/traces';

export default function MultiFunctionPage() {
  return (
    <LessonLayout
      title="7. Multi-Function Agent: Math Tutor"
      description="An agent with 4 tools and a loop that cycles multiple times."
      animationPanel={
        <AgentLoopPanel
          agentName="Math Tutor Agent"
          accentColor="#fbbf24"
          loopCount={2}
          tools={[
            { name: 'add', icon: '+', color: '#4a9eff' },
            { name: 'subtract', icon: '-', color: '#f87171' },
            { name: 'multiply', icon: '×', color: '#fbbf24' },
            { name: 'divide', icon: '÷', color: '#a78bfa' },
          ]}
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
