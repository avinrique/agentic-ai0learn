'use client';
import { useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTracerStore } from '@/stores/tracerStore';

interface CodePanelProps {
  code: string;
}

export default function CodePanel({ code }: CodePanelProps) {
  const { currentStep, steps, variants, activeVariantId } = useTracerStore();
  // When a "Try different inputs" variant is active, show its question in the code too.
  const defaultInput = variants.find((v) => v.id === 'default')?.inputValue;
  const activeInput = variants.find((v) => v.id === activeVariantId)?.inputValue;
  const shownCode = defaultInput && activeInput ? code.split(defaultInput).join(activeInput) : code;
  const currentLine = steps[currentStep]?.lineNumber ?? -1;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the highlighted line in view (centered) as the student steps through.
  useEffect(() => {
    const container = scrollRef.current;
    const line = container?.querySelector<HTMLElement>(`[data-line="${currentLine}"]`);
    if (!container || !line) return;
    const offset = line.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTo({
      top: container.scrollTop + offset - container.clientHeight / 2 + line.clientHeight / 2,
      behavior: 'smooth',
    });
  }, [currentLine, shownCode]);

  return (
    <div ref={scrollRef} className="h-full overflow-auto">
      <div className="px-3 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider border-b border-white/10 bg-navy-800 sticky top-0 z-10">
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
            'data-line': lineNumber,
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
        {shownCode}
      </SyntaxHighlighter>
    </div>
  );
}
