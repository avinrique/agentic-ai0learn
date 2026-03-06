'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentLoopPanel from '@/components/animations/AgentLoopPanel';
import { multiToolCode } from '@/data/code-snippets';
import { multiToolTrace } from '@/data/traces';

export default function MultiToolPage() {
  return (
    <LessonLayout
      title="8. Multi-Tool Agent: Study Buddy"
      description="An agent with calculator + knowledge lookup tools."
      animationPanel={
        <AgentLoopPanel
          agentName="Study Buddy Agent"
          accentColor="#a78bfa"
          tools={[
            { name: 'add', icon: '+', color: '#4a9eff' },
            { name: 'lookup', icon: '🔍', color: '#a78bfa' },
          ]}
        />
      }
      steps={multiToolTrace}
      lessonId="multi-tool"
    >
      <TracerPanel code={multiToolCode} />
    </LessonLayout>
  );
}
