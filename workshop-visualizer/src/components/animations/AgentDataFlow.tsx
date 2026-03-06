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

export default function AgentDataFlow({ loopCount = 1, agentName, accentColor = '#4a9eff' }: AgentDataFlowProps) {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;
  const variables = useMemo(() => steps[currentStep]?.variables ?? [], [steps, currentStep]);

  // Track which loop iteration we're in
  const { activeStation, currentLoop, thought, toolName, toolArgs, toolResult, finalAnswer } = useMemo(() => {
    let station: Station = 'idle';
    let loop = 0;
    let thought = '';
    let toolNameVal = '';
    let toolArgsVal = '';
    let toolResultVal = '';
    let finalAnswerVal = '';

    if (!trigger) return { activeStation: station, currentLoop: loop, thought, toolName: toolNameVal, toolArgs: toolArgsVal, toolResult: toolResultVal, finalAnswer: finalAnswerVal };

    // Count send triggers to determine loop number
    const currentIdx = steps.findIndex((s, i) => i === currentStep);
    let sendCount = 0;
    for (let i = 0; i <= currentIdx; i++) {
      const t = steps[i]?.animationTrigger;
      if (t?.includes('send')) sendCount++;
    }
    loop = Math.max(1, sendCount);

    if (trigger.includes('send') || trigger === 'defineTools' || trigger === 'addSystemMsg') {
      station = 'user';
    } else if (trigger === 'apiProcessing') {
      station = 'ai';
    } else if (trigger.includes('decide')) {
      station = 'ai';
      // Extract reasoning from variables
      const toolCallVar = variables.find(v => v.name === 'tool_name' || v.name === 'function_name');
      if (toolCallVar) thought = `I need to call ${toolCallVar.value}`;
      const argsV = variables.find(v => v.name === 'arguments' || v.name === 'args');
      if (argsV) {
        toolArgsVal = argsV.value;
        const nameMatch = argsV.value;
        if (!thought && nameMatch) thought = 'Deciding which tool to use...';
      }
    } else if (trigger.startsWith('toolSelect-')) {
      station = 'tool';
      toolNameVal = trigger.replace('toolSelect-', '');
      const argsV = variables.find(v => v.name === 'arguments' || v.name === 'args');
      if (argsV) toolArgsVal = argsV.value;
    } else if (trigger.includes('execute')) {
      station = 'tool';
      const resultV = variables.find(v => v.name === 'result' || v.name === 'function_result');
      if (resultV) toolResultVal = resultV.value;
      const argsV = variables.find(v => v.name === 'arguments' || v.name === 'args');
      if (argsV) toolArgsVal = argsV.value;
      const nameV = variables.find(v => v.name === 'tool_name' || v.name === 'function_name');
      if (nameV) toolNameVal = nameV.value;
    } else if (trigger.includes('return')) {
      station = 'result';
      const resultV = variables.find(v => v.name === 'result' || v.name === 'function_result');
      if (resultV) toolResultVal = resultV.value;
    } else if (trigger.includes('finalAnswer') || trigger.includes('final')) {
      station = 'final';
      const msgV = variables.find(v => v.name === 'assistant_msg' || v.name === 'final_answer' || v.name === 'content');
      if (msgV) finalAnswerVal = msgV.value;
    }

    return { activeStation: station, currentLoop: loop, thought, toolName: toolNameVal, toolArgs: toolArgsVal, toolResult: toolResultVal, finalAnswer: finalAnswerVal };
  }, [trigger, variables, steps, currentStep]);

  const stationConfig = [
    { id: 'user' as const, label: 'User', icon: '👤', x: '10%', y: '50%' },
    { id: 'ai' as const, label: 'AI Brain', icon: '🧠', x: '50%', y: '10%' },
    { id: 'tool' as const, label: 'Tool', icon: '🔧', x: '90%', y: '50%' },
    { id: 'result' as const, label: 'Result', icon: '📦', x: '50%', y: '90%' },
  ];

  // Connection paths (horseshoe: user→ai→tool→result→ai)
  const connections: { from: Station; to: Station; active: boolean }[] = [
    { from: 'user', to: 'ai', active: activeStation === 'user' || activeStation === 'ai' },
    { from: 'ai', to: 'tool', active: activeStation === 'tool' },
    { from: 'tool', to: 'result', active: activeStation === 'result' },
    { from: 'result', to: 'ai', active: activeStation === 'result' },
  ];

  const getPos = (id: Station) => stationConfig.find(s => s.id === id);

  return (
    <div className="h-full relative p-4 overflow-hidden">
      {/* Agent name */}
      {agentName && (
        <div className="absolute top-3 left-4 text-xs text-white/30 uppercase tracking-wider">{agentName}</div>
      )}

      {/* Loop counter */}
      <AnimatePresence mode="wait">
        {currentLoop > 0 && loopCount > 1 && (
          <motion.div
            key={currentLoop}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-3 right-4 px-3 py-1 rounded-full text-xs font-bold border"
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

      {/* Connection lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {connections.map(({ from, to, active }, i) => {
          const fromPos = getPos(from);
          const toPos = getPos(to);
          if (!fromPos || !toPos) return null;
          return (
            <line
              key={i}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke={active ? accentColor : 'rgba(255,255,255,0.08)'}
              strokeWidth={active ? 2 : 1}
              strokeDasharray={active ? '8 4' : '4 4'}
              opacity={active ? 0.6 : 0.3}
            />
          );
        })}
      </svg>

      {/* Station nodes */}
      {stationConfig.map((station) => {
        const isActive = activeStation === station.id || (station.id === 'ai' && activeStation === 'final');
        return (
          <motion.div
            key={station.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{ left: station.x, top: station.y, zIndex: 10 }}
            animate={{
              scale: isActive ? 1.1 : 1,
            }}
            transition={spring}
          >
            <motion.div
              className="w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl"
              animate={{
                boxShadow: isActive ? `0 0 30px ${accentColor}40` : `0 0 0px ${accentColor}00`,
                borderColor: isActive ? `${accentColor}80` : 'rgba(255,255,255,0.1)',
                backgroundColor: isActive ? `${accentColor}15` : 'rgba(255,255,255,0.03)',
              }}
              transition={spring}
            >
              {station.icon}
            </motion.div>
            <span className="text-[10px] font-medium" style={{ color: isActive ? accentColor : 'rgba(255,255,255,0.4)' }}>
              {station.label}
            </span>
          </motion.div>
        );
      })}

      {/* Floating data packets / bubbles */}

      {/* AI Thought bubble */}
      <AnimatePresence>
        {activeStation === 'ai' && thought && (
          <motion.div
            key="thought"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={spring}
            className="absolute left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg border text-xs font-mono max-w-[200px] text-center"
            style={{ top: '26%', zIndex: 20, color: accentColor, backgroundColor: `${accentColor}10`, borderColor: `${accentColor}30` }}
          >
            💭 {thought}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tool execution info */}
      <AnimatePresence>
        {activeStation === 'tool' && (toolName || toolArgs) && (
          <motion.div
            key="tool-exec"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="absolute px-3 py-2 rounded-lg border bg-white/5 border-white/15 text-xs font-mono max-w-[220px]"
            style={{ right: '3%', top: '25%', zIndex: 20 }}
          >
            {toolName && <div className="text-accent-blue font-bold mb-1">{toolName}()</div>}
            {toolArgs && <div className="text-white/50 text-[10px]">args: {toolArgs}</div>}
            {toolResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 mt-1 text-[10px]"
              >
                → {toolResult}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result flowing back */}
      <AnimatePresence>
        {activeStation === 'result' && toolResult && (
          <motion.div
            key="result-packet"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="absolute left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg border text-xs font-mono text-center"
            style={{ top: '75%', zIndex: 20, color: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.3)' }}
          >
            📦 Result: {toolResult}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final answer */}
      <AnimatePresence>
        {activeStation === 'final' && (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-3 rounded-xl border-2 text-sm font-medium max-w-[260px] text-center"
            style={{ zIndex: 30, color: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.4)', boxShadow: '0 0 30px rgba(74,222,128,0.15)' }}
          >
            <div className="text-[10px] text-green-400/60 uppercase tracking-wider mb-1">Final Answer</div>
            {finalAnswer || 'Response generated!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated data packet moving between stations */}
      <AnimatePresence>
        {activeStation === 'user' && (
          <motion.div
            key="packet-user-ai"
            initial={{ left: '10%', top: '50%', opacity: 0 }}
            animate={{ left: '50%', top: '10%', opacity: [0, 1, 1, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}`, zIndex: 15 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
