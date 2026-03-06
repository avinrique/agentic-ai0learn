'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentLoopPanel from '@/components/animations/AgentLoopPanel';
import { terminalAssistantCode } from '@/data/code-snippets';
import { terminalAssistantTrace } from '@/data/traces';

export default function TerminalAssistantPage() {
  return (
    <LessonLayout
      title="10. Terminal Assistant"
      description="A fully autonomous agent that can run commands, read, and write files."
      animationPanel={
        <AgentLoopPanel
          agentName="Terminal Assistant"
          accentColor="#4a9eff"
          showTerminal
          tools={[
            { name: 'run_command', icon: '⌨️', color: '#4a9eff' },
            { name: 'read_file', icon: '📖', color: '#4ade80' },
            { name: 'write_file', icon: '✏️', color: '#fbbf24' },
          ]}
        />
      }
      steps={terminalAssistantTrace}
      lessonId="terminal-assistant"
    >
      <TracerPanel code={terminalAssistantCode} />
    </LessonLayout>
  );
}
