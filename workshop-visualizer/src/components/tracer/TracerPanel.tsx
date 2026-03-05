'use client';
import { useCallback, useRef, useState } from 'react';
import CodePanel from './CodePanel';
import VariableInspector from './VariableInspector';
import OutputConsole from './OutputConsole';
import ResizableHandle from '../layout/ResizableHandle';

interface TracerPanelProps {
  code: string;
}

export default function TracerPanel({ code }: TracerPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Heights as percentages of total
  const [codePct, setCodePct] = useState(50);
  const [varPct, setVarPct] = useState(25);
  // output gets the remainder

  const handleCodeResize = useCallback((delta: number) => {
    if (!containerRef.current) return;
    const totalH = containerRef.current.clientHeight;
    const deltaPct = (delta / totalH) * 100;
    setCodePct(prev => {
      const next = prev + deltaPct;
      return Math.max(15, Math.min(70, next));
    });
  }, []);

  const handleVarResize = useCallback((delta: number) => {
    if (!containerRef.current) return;
    const totalH = containerRef.current.clientHeight;
    const deltaPct = (delta / totalH) * 100;
    setVarPct(prev => {
      const next = prev + deltaPct;
      return Math.max(10, Math.min(50, next));
    });
  }, []);

  const outputPct = 100 - codePct - varPct;

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <div style={{ height: `${codePct}%` }} className="overflow-auto min-h-0">
        <CodePanel code={code} />
      </div>
      <ResizableHandle direction="vertical" onResize={handleCodeResize} />
      <div style={{ height: `${varPct}%` }} className="overflow-auto min-h-0">
        <VariableInspector />
      </div>
      <ResizableHandle direction="vertical" onResize={handleVarResize} />
      <div style={{ height: `${Math.max(10, outputPct)}%` }} className="overflow-auto min-h-0">
        <OutputConsole />
      </div>
    </div>
  );
}
