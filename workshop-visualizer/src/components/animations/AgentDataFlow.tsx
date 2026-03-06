'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';
import { useMemo } from 'react';
import ToolSelectionAnim, { ToolCard } from './ToolSelectionAnim';

const spring = { type: 'spring' as const, damping: 20, stiffness: 100 };

interface AgentDataFlowProps {
  accentColor?: string;
  tools?: ToolCard[];
  toolLayout?: 'row' | 'grid';
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
  setupTrigger: string | null;
  isDecide: boolean;
  isFinalAnswer: boolean;
  userMessage: string;
}

const stationColors = {
  user: '#60a5fa',
  ai: '#a78bfa',
  tool: '#f59e0b',
  result: '#4ade80',
};

export default function AgentDataFlow({
  accentColor = '#4a9eff',
  tools,
  toolLayout = 'row',
}: AgentDataFlowProps) {
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
    let setupTrigger: string | null = null;
    let isDecide = false;
    let isFinalAnswer = false;
    let userMessage = '';

    if (!trigger) {
      return { activeStation: 'idle', currentLoop: 0, thought: '', toolName: '', toolArgs: '', toolResult: '', finalAnswer: '', statusText: '', phase: 'setup', setupTrigger: null, isDecide: false, isFinalAnswer: false, userMessage: '' };
    }

    // Count send triggers to determine loop number
    let sendCount = 0;
    for (let i = 0; i <= currentStep; i++) {
      const t = steps[i]?.animationTrigger;
      if (t?.includes('send')) sendCount++;
    }
    loop = Math.max(1, sendCount);

    // Extract user message from messages variable
    const messagesVar = variables.find(v => v.name === 'messages');
    if (messagesVar?.value) {
      const match = messagesVar.value.match(/content:"([^"]+)"/);
      if (match) userMessage = match[1];
    }

    if (trigger === 'import' || trigger === 'defineTools' || trigger === 'addSystemMsg') {
      station = 'idle';
      phase = 'setup';
      setupTrigger = trigger;
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
      isDecide = true;
      const toolCallVar = variables.find(v => v.name === 'tool_name' || v.name === 'function_name');
      if (toolCallVar) {
        thought = `Calling ${toolCallVar.value}()`;
        toolNameVal = toolCallVar.value;
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
      // Also get tool name from looking back
      const nameV = variables.find(v => v.name === 'tool_name' || v.name === 'function_name');
      if (nameV) toolNameVal = nameV.value;
      statusText = 'Tool returned a result';
    } else if (trigger.includes('finalAnswer') || trigger.includes('final')) {
      station = 'final';
      phase = 'done';
      isFinalAnswer = true;
      const msgV = variables.find(v => v.name === 'assistant_msg' || v.name === 'final_answer' || v.name === 'content');
      if (msgV) finalAnswerVal = msgV.value;
      statusText = 'AI generated final answer';
    } else {
      phase = 'flow';
      station = 'idle';
      statusText = '';
    }

    return { activeStation: station, currentLoop: loop, thought, toolName: toolNameVal, toolArgs: toolArgsVal, toolResult: toolResultVal, finalAnswer: finalAnswerVal, statusText, phase, setupTrigger, isDecide, isFinalAnswer, userMessage };
  }, [trigger, variables, steps, currentStep]);

  const { activeStation, thought, toolName, toolArgs, toolResult, finalAnswer, phase, setupTrigger, isDecide, isFinalAnswer, userMessage } = flowState;

  const showFlow = phase === 'flow' || phase === 'done';

  // Which nodes are visible
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

  // Active arrows
  const arrows = useMemo(() => {
    if (!showFlow) return { userToAi: false, aiToTool: false, toolToResult: false, resultToAi: false };
    return {
      userToAi: activeStation === 'user' || activeStation === 'ai',
      aiToTool: activeStation === 'tool',
      toolToResult: activeStation === 'result',
      resultToAi: activeStation === 'result',
    };
  }, [showFlow, activeStation]);

  // Content for each node
  const nodeContent = useMemo(() => {
    return {
      user: activeStation === 'user' || showFlow ? (userMessage || 'User query') : '',
      ai: isFinalAnswer ? (finalAnswer || 'Response') : isDecide ? (thought || 'Thinking...') : (activeStation === 'ai' ? 'Thinking...' : ''),
      tool: toolName ? `${toolName}(${toolArgs || '...'})` : '',
      result: toolResult ? `→ ${toolResult}` : '',
    };
  }, [activeStation, showFlow, userMessage, isFinalAnswer, finalAnswer, isDecide, thought, toolName, toolArgs, toolResult]);

  // Data pill content for arrows
  const dataPills = useMemo(() => {
    return {
      userToAi: arrows.userToAi && userMessage ? userMessage : null,
      aiToTool: arrows.aiToTool && toolName ? `${toolName}(${toolArgs || ''})` : null,
      toolToResult: arrows.toolToResult && toolResult ? `→ ${toolResult}` : null,
    };
  }, [arrows, userMessage, toolName, toolArgs, toolResult]);

  // Derive activeTool for inline ToolSelectionAnim
  const derivedActiveTool = useMemo(() => {
    if (toolName) return toolName;
    // Look back for last toolSelect
    for (let i = currentStep; i >= 0; i--) {
      const t = steps[i]?.animationTrigger;
      if (t?.startsWith('toolSelect-')) return t.replace('toolSelect-', '');
    }
    return null;
  }, [toolName, currentStep, steps]);

  const truncate = (s: string, len: number) => s.length > len ? s.slice(0, len) + '...' : s;

  // Render a content-bearing node
  const renderNode = (id: 'user' | 'ai' | 'tool' | 'result', label: string, color: string) => {
    const isActive = activeStation === id || (id === 'ai' && activeStation === 'final');
    const content = nodeContent[id];

    // AI distinction: decide (amber/wrench) vs respond (green/chat)
    let nodeColor = color;
    let icon = '';
    if (id === 'ai' && isActive) {
      if (isFinalAnswer) {
        nodeColor = '#4ade80';
        icon = '💬';
      } else if (isDecide) {
        nodeColor = '#f59e0b';
        icon = '🔧';
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={spring}
        className="flex flex-col items-center gap-1"
      >
        <motion.div
          className="w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center px-1 overflow-hidden"
          animate={{
            scale: isActive ? 1.08 : 1,
            boxShadow: isActive ? `0 0 24px ${nodeColor}50` : `0 0 0px ${nodeColor}00`,
            borderColor: isActive ? nodeColor : 'rgba(255,255,255,0.1)',
            backgroundColor: isActive ? `${nodeColor}20` : 'rgba(255,255,255,0.03)',
          }}
          transition={spring}
        >
          {/* Role label + icon */}
          <div className="flex items-center gap-0.5">
            {icon && <span className="text-[10px]">{icon}</span>}
            <span
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: isActive ? nodeColor : 'rgba(255,255,255,0.35)' }}
            >
              {label}
            </span>
          </div>
          {/* Content preview */}
          {content && isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[8px] font-mono text-center leading-tight mt-0.5 max-w-full"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {truncate(content, 20)}
            </motion.div>
          )}
        </motion.div>
        <span
          className="text-[10px] font-medium"
          style={{ color: isActive ? nodeColor : 'rgba(255,255,255,0.3)' }}
        >
          {label}
        </span>
      </motion.div>
    );
  };

  // Render arrow with optional data pill
  const renderArrow = (active: boolean, direction: 'right' | 'left' | 'down', pillContent: string | null) => {
    const isHorizontal = direction === 'right' || direction === 'left';

    if (isHorizontal) {
      return (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mx-1 flex flex-col items-center relative"
          style={{ originX: direction === 'right' ? 0 : 1 }}
        >
          <div className="flex items-center">
            {direction === 'left' && (
              <div
                className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] transition-colors duration-300"
                style={{ borderRightColor: active ? accentColor : 'rgba(255,255,255,0.1)' }}
              />
            )}
            <div
              className="h-0.5 w-6 transition-colors duration-300"
              style={{ backgroundColor: active ? accentColor : 'rgba(255,255,255,0.1)' }}
            />
            {direction === 'right' && (
              <div
                className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] transition-colors duration-300"
                style={{ borderLeftColor: active ? accentColor : 'rgba(255,255,255,0.1)' }}
              />
            )}
          </div>
          {/* Data pill */}
          <AnimatePresence>
            {active && pillContent && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="absolute -bottom-4 px-1.5 py-0.5 rounded text-[7px] font-mono whitespace-nowrap"
                style={{
                  backgroundColor: `${accentColor}25`,
                  color: accentColor,
                  border: `1px solid ${accentColor}40`,
                }}
              >
                {truncate(pillContent, 18)}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="h-full flex flex-col p-3 overflow-hidden">
      {/* Setup phase visualization */}
      <AnimatePresence mode="wait">
        {phase === 'setup' && setupTrigger && (
          <motion.div
            key={setupTrigger}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center gap-4"
          >
            {setupTrigger === 'import' && (
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl"
                >
                  📦
                </motion.div>
                <div className="text-sm text-white/50 font-mono">Importing SDK...</div>
              </div>
            )}
            {setupTrigger === 'defineTools' && tools && (
              <div className="flex flex-col items-center gap-3">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Registering Tools</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {tools.map((tool, i) => (
                    <motion.div
                      key={tool.name}
                      initial={{ opacity: 0, scale: 0.5, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.15, ...spring }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
                      style={{
                        backgroundColor: `${tool.color}15`,
                        borderColor: `${tool.color}40`,
                      }}
                    >
                      <span className="text-sm">{tool.icon}</span>
                      <span className="text-xs font-mono" style={{ color: tool.color }}>{tool.name}</span>
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.15 + 0.3 }}
                        className="text-green-400 text-xs"
                      >
                        ✓
                      </motion.span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {setupTrigger === 'defineTools' && !tools && (
              <div className="text-sm text-white/40 font-mono">Defining tool functions...</div>
            )}
            {setupTrigger === 'addSystemMsg' && (
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, ...spring }}
                  className="px-3 py-2 rounded-lg border text-xs font-mono max-w-[260px] text-center"
                  style={{
                    backgroundColor: 'rgba(167,139,250,0.1)',
                    borderColor: 'rgba(167,139,250,0.3)',
                    color: '#a78bfa',
                  }}
                >
                  <div className="text-[9px] uppercase tracking-wider mb-1 opacity-60">system</div>
                  Setting up system message...
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle state (no trigger yet) */}
      {!showFlow && !setupTrigger && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex items-center justify-center text-center text-white/30 text-sm"
        >
          Step through code to see the agent loop
        </motion.div>
      )}

      {/* Flow diagram */}
      {showFlow && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0">
          {/* Horizontal flow row: User → AI → Tool */}
          <div className="flex items-center justify-center w-full">
            {/* User node */}
            <AnimatePresence>
              {visibleNodes.has('user') && renderNode('user', 'User', stationColors.user)}
            </AnimatePresence>

            {/* Arrow: User → AI */}
            {visibleNodes.has('user') && visibleNodes.has('ai') && (
              renderArrow(arrows.userToAi, 'right', dataPills.userToAi)
            )}

            {/* AI node */}
            <AnimatePresence>
              {visibleNodes.has('ai') && renderNode('ai', 'AI', stationColors.ai)}
            </AnimatePresence>

            {/* Arrow: AI → Tool */}
            {visibleNodes.has('ai') && visibleNodes.has('tool') && (
              renderArrow(arrows.aiToTool, 'right', dataPills.aiToTool)
            )}

            {/* Tool node (letter only - tools shown inline below) */}
            <AnimatePresence>
              {visibleNodes.has('tool') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={spring}
                  className="flex flex-col items-center gap-1"
                >
                  <motion.div
                    className="w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center px-1"
                    animate={{
                      scale: activeStation === 'tool' ? 1.08 : 1,
                      boxShadow: activeStation === 'tool' ? `0 0 24px ${stationColors.tool}50` : `0 0 0px ${stationColors.tool}00`,
                      borderColor: activeStation === 'tool' ? stationColors.tool : 'rgba(255,255,255,0.1)',
                      backgroundColor: activeStation === 'tool' ? `${stationColors.tool}20` : 'rgba(255,255,255,0.03)',
                    }}
                    transition={spring}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: activeStation === 'tool' ? stationColors.tool : 'rgba(255,255,255,0.35)' }}>
                      Tool
                    </span>
                    {activeStation === 'tool' && toolName && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[8px] font-mono text-center mt-0.5"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                      >
                        {truncate(toolName, 12)}
                      </motion.div>
                    )}
                  </motion.div>
                  <span className="text-[10px] font-medium" style={{ color: activeStation === 'tool' ? stationColors.tool : 'rgba(255,255,255,0.3)' }}>
                    Tool
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Return loop: Result → AI (below main row) */}
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
                    className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] transition-colors duration-300"
                    style={{ borderBottomColor: arrows.resultToAi ? accentColor : 'rgba(255,255,255,0.1)' }}
                  />
                  <div
                    className="h-0.5 w-5 transition-colors duration-300"
                    style={{ backgroundColor: arrows.resultToAi ? accentColor : 'rgba(255,255,255,0.1)' }}
                  />
                </motion.div>

                {/* Result node */}
                {renderNode('result', 'Result', stationColors.result)}

                {/* Left arrow from Tool to Result */}
                <motion.div
                  className="flex items-center relative"
                  animate={{ opacity: arrows.toolToResult ? 1 : 0.3 }}
                >
                  <div
                    className="h-0.5 w-5 transition-colors duration-300"
                    style={{ backgroundColor: arrows.toolToResult ? accentColor : 'rgba(255,255,255,0.1)' }}
                  />
                  <div
                    className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] transition-colors duration-300"
                    style={{ borderRightColor: arrows.toolToResult ? accentColor : 'rgba(255,255,255,0.1)' }}
                  />
                  {/* Data pill on result arrow */}
                  <AnimatePresence>
                    {arrows.toolToResult && dataPills.toolToResult && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[7px] font-mono whitespace-nowrap"
                        style={{
                          backgroundColor: `${stationColors.result}25`,
                          color: stationColors.result,
                          border: `1px solid ${stationColors.result}40`,
                        }}
                      >
                        {truncate(dataPills.toolToResult, 18)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline tool cards - when tool station is active */}
          <AnimatePresence>
            {tools && (activeStation === 'tool' || activeStation === 'result') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full overflow-hidden"
              >
                <ToolSelectionAnim
                  tools={tools}
                  activeTool={derivedActiveTool}
                  isExecuting={activeStation === 'tool' && trigger?.includes('execute')}
                  isResult={activeStation === 'result'}
                  args={toolArgs}
                  result={toolResult}
                  layout={toolLayout}
                  compact
                />
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
                <div className="text-[10px] text-green-400/60 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                  <span>💬</span> Final Answer
                </div>
                {finalAnswer || 'Response generated!'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Data Panel - shown when we have tool data and no inline tools */}
      <AnimatePresence>
        {(toolName || toolArgs || toolResult) && showFlow && !tools && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="mt-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-mono space-y-1 flex-shrink-0 overflow-hidden"
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
