'use client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTracerStore } from '@/stores/tracerStore';

interface CodePanelProps {
  code: string;
}

export default function CodePanel({ code }: CodePanelProps) {
  const { currentStep, steps } = useTracerStore();
  const currentLine = steps[currentStep]?.lineNumber ?? -1;

  return (
    <div className="h-full overflow-auto">
      <div className="px-3 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider border-b border-white/10 bg-navy-800/50 sticky top-0 z-10">
        Source Code
      </div>
      <SyntaxHighlighter
        language="python"
        style={vscDarkPlus}
        showLineNumbers
        wrapLines
        lineProps={(lineNumber: number) => {
          const isHighlighted = lineNumber === currentLine;
          return {
            style: {
              backgroundColor: isHighlighted ? 'rgba(74, 158, 255, 0.15)' : 'transparent',
              borderLeft: isHighlighted ? '3px solid #4a9eff' : '3px solid transparent',
              display: 'block',
              paddingLeft: '0.5em',
              transition: 'background-color 0.3s ease',
            },
          };
        }}
        customStyle={{
          margin: 0,
          padding: '1rem 0',
          background: 'transparent',
          fontSize: '0.8rem',
          lineHeight: '1.6',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
