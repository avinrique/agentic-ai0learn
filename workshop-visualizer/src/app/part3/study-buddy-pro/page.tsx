'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentLoopDiagram from '@/components/animations/AgentLoopDiagram';
import ToolSelectionAnim from '@/components/animations/ToolSelectionAnim';
import { studyBuddyProCode } from '@/data/code-snippets';
import { studyBuddyProTrace } from '@/data/traces';

export default function StudyBuddyProPage() {
  return (
    <LessonLayout
      title="9. Study Buddy Pro"
      description="An advanced agent with 7 tools including percentage and simple interest."
      animationPanel={
        <div className="h-full flex flex-col">
          <div className="flex-1"><AgentLoopDiagram /></div>
          <div className="border-t border-white/10 py-4">
            <ToolSelectionAnim tools={[
              { name: 'add', icon: '+', color: '#4a9eff' },
              { name: 'subtract', icon: '-', color: '#f87171' },
              { name: 'multiply', icon: '×', color: '#fbbf24' },
              { name: 'divide', icon: '÷', color: '#a78bfa' },
              { name: 'percentage', icon: '%', color: '#4ade80' },
              { name: 'simple_interest', icon: '$', color: '#22d3ee' },
              { name: 'lookup', icon: '🔍', color: '#f472b6' },
            ]} />
          </div>
        </div>
      }
      steps={studyBuddyProTrace}
    >
      <TracerPanel code={studyBuddyProCode} />
    </LessonLayout>
  );
}
