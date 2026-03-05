'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentLoopDiagram from '@/components/animations/AgentLoopDiagram';
import ToolSelectionAnim from '@/components/animations/ToolSelectionAnim';
import { multiToolCode } from '@/data/code-snippets';
import { multiToolTrace } from '@/data/traces';

export default function MultiToolPage() {
  return (
    <LessonLayout
      title="8. Multi-Tool Agent: Study Buddy"
      description="An agent with calculator + knowledge lookup tools."
      animationPanel={
        <div className="h-full flex flex-col">
          <div className="flex-1"><AgentLoopDiagram /></div>
          <div className="border-t border-white/10 py-4">
            <ToolSelectionAnim tools={[
              { name: 'add', icon: '+', color: '#4a9eff' },
              { name: 'lookup', icon: '🔍', color: '#a78bfa' },
            ]} />
          </div>
        </div>
      }
      steps={multiToolTrace}
    >
      <TracerPanel code={multiToolCode} />
    </LessonLayout>
  );
}
