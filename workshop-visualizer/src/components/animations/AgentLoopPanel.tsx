'use client';
/**
 * AgentLoopPanel — the animation panel for all agent lessons (Parts 2 & 3).
 *
 *   header: agent name + loop counter (AgentLoopDiagram)
 *   stage:  The AI ⇄ your code strip + ONE big focal item for the step (AgentDataFlow)
 *   bottom: the messages list as a quiet chip row (MessageTimeline); on the steps that
 *           append to it, it becomes the focal item instead of the stage
 */
import { useMemo } from 'react';
import { useTracerStore } from '@/stores/tracerStore';
import AgentDataFlow from './AgentDataFlow';
import MessageTimeline from './MessageTimeline';
import AgentLoopDiagram, { ToolCard, buildAgentModel, sceneAt } from './AgentLoopDiagram';

interface AgentLoopPanelProps {
  agentName: string;
  accentColor: string;
  tools: ToolCard[];
  /** true when the code has a `while True` agent loop (label turns as "loop turns") */
  loop?: boolean;
  /** show a terminal window for run_command / read_file / write_file */
  showTerminal?: boolean;
}

export default function AgentLoopPanel({
  agentName,
  accentColor,
  tools,
  loop = false,
  showTerminal = false,
}: AgentLoopPanelProps) {
  const currentStep = useTracerStore((s) => s.currentStep);
  const steps = useTracerStore((s) => s.steps);

  const toolNames = useMemo(() => tools.map((t) => t.name), [tools]);
  const model = useMemo(() => buildAgentModel(steps, toolNames), [steps, toolNames]);
  const scene = useMemo(
    () => sceneAt(model, steps, Math.min(currentStep, Math.max(0, steps.length - 1))),
    [model, steps, currentStep],
  );

  if (steps.length === 0) return null;

  // Steps that append to `messages` make the list the focal point; the stage shrinks to its actor strip.
  const appended = scene.msgCount > scene.prevMsgCount;

  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-hidden">
      <AgentLoopDiagram scene={scene} agentName={agentName} accentColor={accentColor} loop={loop} />
      {appended ? (
        <>
          <AgentDataFlow
            scene={scene}
            tools={tools}
            accentColor={accentColor}
            loop={loop}
            showTerminal={showTerminal}
            collapsed
          />
          <div className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden">
            <MessageTimeline scene={scene} expanded />
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 min-h-0">
            <AgentDataFlow
              scene={scene}
              tools={tools}
              accentColor={accentColor}
              loop={loop}
              showTerminal={showTerminal}
            />
          </div>
          <MessageTimeline scene={scene} />
        </>
      )}
    </div>
  );
}
