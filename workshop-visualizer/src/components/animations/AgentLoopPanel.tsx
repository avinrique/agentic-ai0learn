'use client';
import { motion } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';
import { useMemo } from 'react';
import AgentDataFlow from './AgentDataFlow';
import MessageTimeline from './MessageTimeline';
import TerminalToolExec from './TerminalToolExec';
import { ToolCard } from './ToolSelectionAnim';

interface AgentLoopPanelProps {
  agentName: string;
  accentColor: string;
  loopCount?: number;
  tools: ToolCard[];
  toolLayout?: 'row' | 'grid';
  showTerminal?: boolean;
}

export default function AgentLoopPanel({
  agentName,
  accentColor,
  loopCount = 1,
  tools,
  toolLayout = 'row',
  showTerminal = false,
}: AgentLoopPanelProps) {
  const { currentStep, steps } = useTracerStore();

  // Compute current loop and total completed loops for dots
  const { currentLoop, completedLoops } = useMemo(() => {
    let sendCount = 0;
    let completedCount = 0;
    for (let i = 0; i <= currentStep; i++) {
      const t = steps[i]?.animationTrigger;
      if (t?.includes('send') && !t.includes('send2') && !t.includes('send3')) sendCount++;
      if (t?.includes('finalAnswer') || t === 'final') completedCount++;
    }
    // Also count send2, send3 etc as loop iterations
    for (let i = 0; i <= currentStep; i++) {
      const t = steps[i]?.animationTrigger;
      if (t?.includes('send2') || t?.includes('send3') || t?.includes('send4')) {
        sendCount++;
      }
    }
    return { currentLoop: Math.max(1, sendCount), completedLoops: completedCount };
  }, [currentStep, steps]);

  const trigger = steps[currentStep]?.animationTrigger;
  const isTerminalActive = showTerminal && trigger && (
    trigger.startsWith('toolSelect-run_command') ||
    trigger.startsWith('toolSelect-read_file') ||
    trigger.startsWith('toolSelect-write_file') ||
    trigger.includes('execute') ||
    trigger.includes('return')
  );

  // Determine effective loop count (use loopCount prop or derive from sendCount)
  const effectiveLoopCount = loopCount > 1 ? loopCount : currentLoop;

  return (
    <div className="h-full flex flex-col">
      {/* Header: Agent name + Loop indicator dots */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 flex-shrink-0">
        <div className="text-xs text-white/30 uppercase tracking-wider font-medium">
          {agentName}
        </div>
        {effectiveLoopCount > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/25 mr-1">Loop</span>
            {Array.from({ length: effectiveLoopCount }, (_, i) => {
              const loopNum = i + 1;
              const isCompleted = loopNum <= completedLoops;
              const isCurrent = loopNum === currentLoop && !isCompleted;
              return (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  animate={{
                    backgroundColor: isCompleted
                      ? accentColor
                      : isCurrent
                        ? accentColor
                        : 'rgba(255,255,255,0.15)',
                    scale: isCurrent ? [1, 1.3, 1] : 1,
                    opacity: isCompleted ? 1 : isCurrent ? 1 : 0.4,
                  }}
                  transition={isCurrent ? { scale: { duration: 1.2, repeat: Infinity } } : { duration: 0.3 }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Center: Enhanced AgentDataFlow */}
      <div className="flex-1 min-h-0">
        <AgentDataFlow
          accentColor={accentColor}
          tools={tools}
          toolLayout={toolLayout}
        />
      </div>

      {/* Terminal: shown inline when terminal tool is active */}
      {showTerminal && isTerminalActive && (
        <div className="flex-shrink-0 px-3 pb-2">
          <TerminalToolExec />
        </div>
      )}

      {/* Bottom: Message Timeline */}
      <div className="flex-shrink-0 px-3 pb-3">
        <MessageTimeline />
      </div>
    </div>
  );
}
