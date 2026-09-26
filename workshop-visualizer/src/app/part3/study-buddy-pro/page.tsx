'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import AgentLoopPanel from '@/components/animations/AgentLoopPanel';
import type { ToolCard } from '@/components/animations/AgentLoopDiagram';
import VariantSelector from '@/components/interactive/VariantSelector';
import { studyBuddyProCode } from '@/data/code-snippets';
import { studyBuddyProTrace, studyBuddyProVariants } from '@/data/traces';

// The tool menu, as written in the code's tools list.
const TOOLS: ToolCard[] = [
  { name: 'add', icon: '+', color: '#4a9eff', description: 'Add two numbers.', params: ['a', 'b'] },
  { name: 'subtract', icon: '−', color: '#f87171', description: 'Subtract b from a.', params: ['a', 'b'] },
  { name: 'multiply', icon: '×', color: '#fbbf24', description: 'Multiply two numbers.', params: ['a', 'b'] },
  { name: 'divide', icon: '÷', color: '#a78bfa', description: 'Divide a by b.', params: ['a', 'b'] },
  { name: 'percentage', icon: '%', color: '#4ade80', description: 'Calculate percentage as (part/total)*100.', params: ['part', 'total'] },
  { name: 'simple_interest', icon: '$', color: '#22d3ee', description: 'Calculate simple interest using (principal * rate * time) / 100.', params: ['principal', 'rate', 'time'] },
  { name: 'lookup', icon: '🔍', color: '#f472b6', description: 'Search for a concept or term in the notes file.', params: ['query'] },
];

export default function StudyBuddyProPage() {
  return (
    <LessonLayout
      title="Study Buddy Pro"
      description="An advanced agent with 7 tools including percentage and simple interest."
      animationPanel={
        <AgentLoopPanel
          agentName="Study Buddy Pro"
          accentColor="#22d3ee"
          tools={TOOLS}
        />
      }
      steps={studyBuddyProTrace}
      variants={studyBuddyProVariants}
      lessonId="study-buddy-pro"
    >
      <TracerPanel code={studyBuddyProCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
