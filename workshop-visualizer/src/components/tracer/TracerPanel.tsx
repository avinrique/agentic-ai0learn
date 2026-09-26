'use client';
import { useCallback, useRef, useState } from 'react';
import CodePanel from './CodePanel';
import VariableInspector from './VariableInspector';
import OutputConsole from './OutputConsole';
import ResizableHandle from '../layout/ResizableHandle';
import { useTracerStore } from '@/stores/tracerStore';

interface TracerPanelProps {
  code: string;
}

type BottomTab = 'output' | 'variables';

// Code on top; Output and Variables share one tabbed box underneath, so the
// right side shows two things at a time instead of three.
export default function TracerPanel({ code }: TracerPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [codePct, setCodePct] = useState(66);
  const [tab, setTab] = useState<BottomTab>('output');
  const { currentStep, steps } = useTracerStore();
  const changedCount = (steps[currentStep]?.variables ?? []).filter((v) => v.isNew || v.isChanged).length;

  const handleCodeResize = useCallback((delta: number) => {
    if (!containerRef.current) return;
    const deltaPct = (delta / containerRef.current.clientHeight) * 100;
    setCodePct((prev) => Math.max(30, Math.min(85, prev + deltaPct)));
  }, []);

  const tabClass = (t: BottomTab) =>
    `px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
      tab === t ? 'text-white/80 border-b-2 border-accent-blue' : 'text-white/30 hover:text-white/60 border-b-2 border-transparent'
    }`;

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <div style={{ height: `${codePct}%` }} className="overflow-hidden min-h-0">
        <CodePanel code={code} />
      </div>
      <ResizableHandle direction="vertical" onResize={handleCodeResize} />
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center gap-1 px-1 border-b border-white/10 bg-navy-800 flex-shrink-0">
          <button className={tabClass('output')} onClick={() => setTab('output')}>
            Output
          </button>
          <button className={tabClass('variables')} onClick={() => setTab('variables')}>
            Variables
            {changedCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold text-[10px] normal-case">
                {changedCount} changed
              </span>
            )}
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          {tab === 'output' ? <OutputConsole hideHeader /> : <VariableInspector hideHeader />}
        </div>
      </div>
    </div>
  );
}
