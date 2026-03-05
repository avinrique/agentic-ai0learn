'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentLoopDiagram from '@/components/animations/AgentLoopDiagram';
import ToolSelectionAnim from '@/components/animations/ToolSelectionAnim';
import { terminalAssistantCode } from '@/data/code-snippets';
import { terminalAssistantTrace } from '@/data/traces';

export default function TerminalAssistantPage() {
  return (
    <LessonLayout
      title="10. Terminal Assistant"
      description="A fully autonomous agent that can run commands, read, and write files."
      animationPanel={
        <div className="h-full flex flex-col">
          <div className="flex-1"><AgentLoopDiagram /></div>
          <div className="border-t border-white/10 py-4">
            <ToolSelectionAnim tools={[
              { name: 'run_command', icon: '⌨️', color: '#4a9eff' },
              { name: 'read_file', icon: '📖', color: '#4ade80' },
              { name: 'write_file', icon: '✏️', color: '#fbbf24' },
            ]} />
          </div>
        </div>
      }
      steps={terminalAssistantTrace}
    >
      <TracerPanel code={terminalAssistantCode} />
    </LessonLayout>
  );
}
