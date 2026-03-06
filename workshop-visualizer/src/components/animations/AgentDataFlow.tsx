'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';
import { useMemo } from 'react';

const spring = { type: 'spring' as const, damping: 20, stiffness: 100 };

interface AgentDataFlowProps {
  loopCount?: number;
  agentName?: string;
  accentColor?: string;
}

type Station = 'idle' | 'user' | 'ai' | 'tool' | 'result' | 'final';

interface FlowState {
  activeStation: Station;
  currentLoop: number;
  thought: string;
  toolName: string;
  toolArgs: string;
  toolResult: string;
  finalAnswer: string;
  statusText: string;
  phase: 'setup' | 'flow' | 'done';
}

const nodeConfig = [
  { id: 'user' as const, letter: 'U', label: 'User', color: '#60a5fa' },
  { id: 'ai' as const, letter: 'AI', label: 'AI', color: '#a78bfa' },
  { id: 'tool' as const, letter: 'T', label: 'Tool', color: '#f59e0b' },
  { id: 'result' as const, letter: 'R', label: 'Result', color: '#4ade80' },
];

export default function AgentDataFlow({ loopCount = 1, agentName, accentColor = '#4a9eff' }: AgentDataFlowProps) {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;
  const variables = useMemo(() => steps[currentStep]?.variables ?? [], [steps, currentStep]);

  const flowState: FlowState = useMemo(() => {
    let station: Station = 'idle';
    let loop = 0;
    let thought = '';
    let toolNameVal = '';
    let toolArgsVal = '';
    let toolResultVal = '';
    let finalAnswerVal = '';
    let statusText = '';
    let phase: 'setup' | 'flow' | 'done' = 'setup';

    if (!trigger) {
      return { activeStation: 'idle', currentLoop: 0, thought: '', toolName: '', toolArgs: '', toolResult: '', finalAnswer: '', statusText: '', phase: 'setup' };
    }

    // Count send triggers to determine loop number
    let sendCount = 0;
    for (let i = 0; i <= currentStep; i++) {
      const t = steps[i]?.animationTrigger;
      if (t?.includes('send')) sendCount++;
    }
    loop = Math.max(1, sendCount);

    if (trigger === 'import' || trigger === 'defineTools' || trigger === 'addSystemMsg') {
      station = 'idle';
      phase = 'setup';
      if (trigger === 'import') statusText = 'Importing SDK modules...';
      else if (trigger === 'defineTools') statusText = 'Defining tool functions...';
      else statusText = 'Setting up system message...';
    } else if (trigger.includes('send')) {
      station = 'user';
      phase = 'flow';
      statusText = 'Sending messages to AI...';
    } else if (trigger === 'apiProcessing') {
      station = 'ai';
      phase = 'flow';
      statusText = 'AI is thinking...';
    } else if (trigger.includes('decide')) {
      station = 'ai';
      phase = 'flow';
      const toolCallVar = variables.find(v => v.name === 'tool_name' || v.name === 'function_name');
      if (toolCallVar) {
        thought = `I need to call ${toolCallVar.value}`;
        statusText = `AI decided to call ${toolCallVar.value}`;
      } else {
        thought = 'Deciding which tool to use...';
        statusText = 'AI is deciding what to do...';
      }
      const argsV = variables.find(v => v.name === 'arguments' || v.name === 'args');
      if (argsV) toolArgsVal = argsV.value;
    } else if (trigger.startsWith('toolSelect-')) {
      station = 'tool';
      phase = 'flow';
      toolNameVal = trigger.replace('toolSelect-', '');
      statusText = `Selected tool: ${toolNameVal}`;
      const argsV = variables.find(v => v.name === 'arguments' || v.name === 'args');
      if (argsV) toolArgsVal = argsV.value;
    } else if (trigger.includes('execute')) {
      station = 'tool';
      phase = 'flow';
      const nameV = variables.find(v => v.name === 'tool_name' || v.name === 'function_name');
      if (nameV) toolNameVal = nameV.value;
      const argsV = variables.find(v => v.name === 'arguments' || v.name === 'args');
      if (argsV) toolArgsVal = argsV.value;
      const resultV = variables.find(v => v.name === 'result' || v.name === 'function_result');
      if (resultV) toolResultVal = resultV.value;
      statusText = toolNameVal ? `Running ${toolNameVal}(${toolArgsVal || '...'})` : 'Executing tool...';
    } else if (trigger.includes('return')) {
      station = 'result';
      phase = 'flow';
      const resultV = variables.find(v => v.name === 'result' || v.name === 'function_result');
      if (resultV) toolResultVal = resultV.value;
      statusText = 'Tool returned a result';
    } else if (trigger.includes('finalAnswer') || trigger.includes('final')) {
      station = 'final';
      phase = 'done';
      const msgV = variables.find(v => v.name === 'assistant_msg' || v.name === 'final_answer' || v.name === 'content');
      if (msgV) finalAnswerVal = msgV.value;
      statusText = 'AI generated final answer';
    } else {
      // Unknown trigger — show flow phase with idle station
      phase = 'flow';
      station = 'idle';
      statusText = '';
    }

    return { activeStation: station, currentLoop: loop, thought, toolName: toolNameVal, toolArgs: toolArgsVal, toolResult: toolResultVal, finalAnswer: finalAnswerVal, statusText, phase };
  }, [trigger, variables, steps, currentStep]);

  const { activeStation, currentLoop, toolName, toolArgs, toolResult, finalAnswer, statusText, phase } = flowState;

  const showFlow = phase === 'flow' || phase === 'done';

  // Determine which nodes are visible (progressive reveal)
  const visibleNodes = useMemo(() => {
    if (!showFlow) return new Set<string>();
    const visible = new Set<string>();
    visible.add('user');
    visible.add('ai');
    if (activeStation === 'tool' || activeStation === 'result' || activeStation === 'final') {
      visible.add('tool');
    }
    if (activeStation === 'result' || activeStation === 'final') {
      visible.add('result');
    }
    return visible;
  }, [showFlow, activeStation]);

  // Determine active arrows
  const arrows = useMemo(() => {
    if (!showFlow) return { userToAi: false, aiToTool: false, toolToResult: false, resultToAi: false };
    return {
      userToAi: activeStation === 'user' || activeStation === 'ai',
      aiToTool: activeStation === 'tool',
      toolToResult: activeStation === 'result',
      resultToAi: activeStation === 'result',
    };
  }, [showFlow, activeStation]);

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      {/* Header: Agent name + Loop counter */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        {agentName && (
          <div className="text-xs text-white/30 uppercase tracking-wider font-medium">{agentName}</div>
        )}
        <div className="flex-1" />
        <AnimatePresence mode="wait">
          {currentLoop > 0 && loopCount > 1 && (
            <motion.div
              key={currentLoop}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                color: accentColor,
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}30`,
              }}
            >
              Loop {currentLoop}{loopCount > 1 ? ` / ${loopCount}` : ''}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Banner */}
      <AnimatePresence mode="wait">
        {statusText && (
          <motion.div
            key={statusText}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="mb-4 px-4 py-2.5 rounded-lg border text-sm font-medium text-center flex-shrink-0"
            style={{
              color: accentColor,
              backgroundColor: `${accentColor}12`,
              borderColor: `${accentColor}25`,
            }}
          >
            {statusText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {/* Idle/setup state */}
        {!showFlow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white/30 text-sm"
          >
            {phase === 'setup' ? 'Setting up tools...' : 'Step through code to see the agent loop'}
          </motion.div>
        )}

        {/* Flow diagram */}
        {showFlow && (
          <div className="w-full flex flex-col items-center gap-4">
            {/* Horizontal flow row: User -> AI -> Tool */}
            <div className="flex items-center justify-center gap-2 w-full">
              {nodeConfig.slice(0, 3).map((node, idx) => {
                const isVisible = visibleNodes.has(node.id);
                const isActive = activeStation === node.id || (node.id === 'ai' && activeStation === 'final');
                const showArrow = idx === 0 ? arrows.userToAi : idx === 1 ? arrows.aiToTool : false;

                return (
                  <div key={node.id} className="flex items-center">
                    {/* Node */}
                    <AnimatePresence>
                      {isVisible && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={spring}
                          className="flex flex-col items-center gap-1"
                        >
                          <motion.div
                            className="w-14 h-14 rounded-xl border-2 flex items-center justify-center text-base font-bold"
                            animate={{
                              scale: isActive ? 1.1 : 1,
                              boxShadow: isActive ? `0 0 24px ${node.color}50` : `0 0 0px ${node.color}00`,
                              borderColor: isActive ? node.color : 'rgba(255,255,255,0.1)',
                              backgroundColor: isActive ? `${node.color}20` : 'rgba(255,255,255,0.03)',
                            }}
                            transition={spring}
                          >
                            <span style={{ color: isActive ? node.color : 'rgba(255,255,255,0.35)' }}>
                              {node.letter}
                            </span>
                          </motion.div>
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: isActive ? node.color : 'rgba(255,255,255,0.3)' }}
                          >
                            {node.label}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Arrow to next node */}
                    {idx < 2 && isVisible && visibleNodes.has(nodeConfig[idx + 1]?.id) && (
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        className="mx-2 flex items-center"
                        style={{ originX: 0 }}
                      >
                        <div
                          className="h-0.5 w-8 transition-colors duration-300"
                          style={{ backgroundColor: showArrow ? accentColor : 'rgba(255,255,255,0.1)' }}
                        />
                        <div
                          className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[7px] transition-colors duration-300"
                          style={{ borderLeftColor: showArrow ? accentColor : 'rgba(255,255,255,0.1)' }}
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Return loop: Result -> AI (below the main row) */}
            <AnimatePresence>
              {visibleNodes.has('result') && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  className="flex items-center gap-2"
                >
                  {/* Up arrow from Result to AI */}
                  <motion.div
                    className="flex items-center"
                    animate={{ opacity: arrows.resultToAi ? 1 : 0.3 }}
                  >
                    <div
                      className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[7px] transition-colors duration-300"
                      style={{ borderBottomColor: arrows.resultToAi ? accentColor : 'rgba(255,255,255,0.1)' }}
                    />
                    <div
                      className="h-0.5 w-6 transition-colors duration-300"
                      style={{ backgroundColor: arrows.resultToAi ? accentColor : 'rgba(255,255,255,0.1)' }}
                    />
                  </motion.div>

                  {/* Result node */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={spring}
                    className="flex flex-col items-center gap-1"
                  >
                    <motion.div
                      className="w-14 h-14 rounded-xl border-2 flex items-center justify-center text-base font-bold"
                      animate={{
                        scale: activeStation === 'result' ? 1.1 : 1,
                        boxShadow: activeStation === 'result' ? `0 0 24px ${nodeConfig[3].color}50` : `0 0 0px ${nodeConfig[3].color}00`,
                        borderColor: activeStation === 'result' ? nodeConfig[3].color : 'rgba(255,255,255,0.1)',
                        backgroundColor: activeStation === 'result' ? `${nodeConfig[3].color}20` : 'rgba(255,255,255,0.03)',
                      }}
                      transition={spring}
                    >
                      <span style={{ color: activeStation === 'result' ? nodeConfig[3].color : 'rgba(255,255,255,0.35)' }}>
                        R
                      </span>
                    </motion.div>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: activeStation === 'result' ? nodeConfig[3].color : 'rgba(255,255,255,0.3)' }}
                    >
                      Result
                    </span>
                  </motion.div>

                  {/* Left arrow from Tool to Result */}
                  <motion.div
                    className="flex items-center"
                    animate={{ opacity: arrows.toolToResult ? 1 : 0.3 }}
                  >
                    <div
                      className="h-0.5 w-6 transition-colors duration-300"
                      style={{ backgroundColor: arrows.toolToResult ? accentColor : 'rgba(255,255,255,0.1)' }}
                    />
                    <div
                      className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[7px] transition-colors duration-300"
                      style={{ borderRightColor: arrows.toolToResult ? accentColor : 'rgba(255,255,255,0.1)' }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Final answer banner */}
            <AnimatePresence>
              {activeStation === 'final' && (
                <motion.div
                  key="final"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  className="px-4 py-3 rounded-xl border-2 text-sm font-medium max-w-[280px] text-center"
                  style={{ color: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.4)', boxShadow: '0 0 24px rgba(74,222,128,0.12)' }}
                >
                  <div className="text-[10px] text-green-400/60 uppercase tracking-wider mb-1">Final Answer</div>
                  {finalAnswer || 'Response generated!'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Data Panel */}
      <AnimatePresence>
        {(toolName || toolArgs || toolResult) && showFlow && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="mt-3 px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-mono space-y-1 flex-shrink-0 overflow-hidden"
          >
            {toolName && (
              <div className="flex gap-2">
                <span className="text-white/40">Function:</span>
                <span style={{ color: accentColor }} className="font-bold">{toolName}()</span>
              </div>
            )}
            {toolArgs && (
              <div className="flex gap-2">
                <span className="text-white/40">Args:</span>
                <span className="text-white/70 truncate">{toolArgs}</span>
              </div>
            )}
            {toolResult && (
              <div className="flex gap-2">
                <span className="text-white/40">Result:</span>
                <span className="text-green-400 truncate">{toolResult}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
