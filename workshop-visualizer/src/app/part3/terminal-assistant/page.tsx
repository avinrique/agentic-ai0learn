'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentLoopPanel from '@/components/animations/AgentLoopPanel';
import type { ToolCard } from '@/components/animations/AgentLoopDiagram';
import VariantSelector from '@/components/interactive/VariantSelector';
import { terminalAssistantCode } from '@/data/code-snippets';
import { terminalAssistantTrace, terminalAssistantVariants } from '@/data/traces';

// The tool menu, as written in the code's tools list.
const TOOLS: ToolCard[] = [
  { name: 'run_command', icon: '⌨️', color: '#4a9eff', description: 'Run a shell command in the terminal (e.g. ls, pwd, mkdir) and return the output.', params: ['command'] },
  { name: 'read_file', icon: '📖', color: '#4ade80', description: 'Read the contents of a file at the given path.', params: ['path'] },
  { name: 'write_file', icon: '✏️', color: '#fbbf24', description: 'Write content to a file. Creates or overwrites it.', params: ['path', 'content'] },
];

export default function TerminalAssistantPage() {
  return (
    <LessonLayout
      title="Terminal Assistant"
      description="A fully autonomous agent that can run commands, read, and write files."
      animationPanel={
        <AgentLoopPanel
          agentName="Terminal Assistant"
          accentColor="#4a9eff"
          tools={TOOLS}
          loop
          showTerminal
        />
      }
      steps={terminalAssistantTrace}
      variants={terminalAssistantVariants}
      lessonId="terminal-assistant"
    >
      <TracerPanel code={terminalAssistantCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
