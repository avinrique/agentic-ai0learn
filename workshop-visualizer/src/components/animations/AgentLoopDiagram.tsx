'use client';
import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Node,
  Edge,
  Position,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { useTracerStore } from '@/stores/tracerStore';

// Custom node component
function GlowNode({ data }: { data: { label: string; color: string; isActive: boolean; icon: string } }) {
  return (
    <motion.div
      animate={{
        scale: data.isActive ? 1.05 : 1,
        boxShadow: data.isActive
          ? `0 0 30px ${data.color}40`
          : `0 0 0px ${data.color}00`,
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="px-4 py-3 rounded-xl border-2 text-center min-w-[140px]"
      style={{
        backgroundColor: `${data.color}15`,
        borderColor: `${data.color}60`,
      }}
    >
      <div className="text-lg mb-1">{data.icon}</div>
      <div className="text-xs font-bold" style={{ color: data.color }}>
        {data.label}
      </div>
    </motion.div>
  );
}

const nodeTypes = { glowNode: GlowNode };

function getActiveNode(trigger?: string): string {
  if (!trigger) return '';
  if (trigger.includes('send')) return 'sendToAI';
  if (trigger.includes('decide')) return 'aiDecides';
  if (trigger.includes('toolSelect') || trigger.includes('execute')) return 'executeFunction';
  if (trigger.includes('return')) return 'sendResult';
  if (trigger.includes('finalAnswer')) return 'finalAnswer';
  if (trigger.includes('defineTools')) return 'sendToAI';
  return '';
}

function AgentLoopInner() {
  const { currentStep, steps } = useTracerStore();
  const trigger = steps[currentStep]?.animationTrigger;
  const activeNodeId = getActiveNode(trigger);

  const nodes: Node[] = useMemo(() => [
    {
      id: 'userPrompt',
      type: 'glowNode',
      position: { x: 0, y: 120 },
      data: { label: 'User Prompt', color: '#4a9eff', isActive: activeNodeId === 'userPrompt', icon: '💬' },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: 'sendToAI',
      type: 'glowNode',
      position: { x: 220, y: 120 },
      data: { label: 'Send to AI\n(with tools)', color: '#4a9eff', isActive: activeNodeId === 'sendToAI', icon: '📡' },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: 'aiDecides',
      type: 'glowNode',
      position: { x: 440, y: 120 },
      data: { label: 'AI Decides', color: '#a78bfa', isActive: activeNodeId === 'aiDecides', icon: '🧠' },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: 'executeFunction',
      type: 'glowNode',
      position: { x: 440, y: 280 },
      data: { label: 'Execute\nFunction', color: '#fbbf24', isActive: activeNodeId === 'executeFunction', icon: '⚡' },
      sourcePosition: Position.Left,
      targetPosition: Position.Top,
    },
    {
      id: 'sendResult',
      type: 'glowNode',
      position: { x: 220, y: 280 },
      data: { label: 'Send Result\nBack', color: '#4ade80', isActive: activeNodeId === 'sendResult', icon: '📤' },
      sourcePosition: Position.Top,
      targetPosition: Position.Right,
    },
    {
      id: 'finalAnswer',
      type: 'glowNode',
      position: { x: 660, y: 120 },
      data: { label: 'Final\nAnswer', color: '#4ade80', isActive: activeNodeId === 'finalAnswer', icon: '✅' },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
  ], [activeNodeId]);

  const edges: Edge[] = useMemo(() => [
    { id: 'e1', source: 'userPrompt', target: 'sendToAI', animated: true, style: { stroke: '#4a9eff60' } },
    { id: 'e2', source: 'sendToAI', target: 'aiDecides', animated: true, style: { stroke: '#4a9eff60' } },
    { id: 'e3', source: 'aiDecides', target: 'executeFunction', animated: true, label: 'tool_calls', labelStyle: { fill: '#fbbf2490', fontSize: 10 }, style: { stroke: '#fbbf2460' } },
    { id: 'e4', source: 'executeFunction', target: 'sendResult', animated: true, style: { stroke: '#4ade8060' } },
    { id: 'e5', source: 'sendResult', target: 'sendToAI', animated: true, label: 'loop', labelStyle: { fill: '#4ade8090', fontSize: 10 }, style: { stroke: '#4ade8060' } },
    { id: 'e6', source: 'aiDecides', target: 'finalAnswer', animated: true, label: 'no tools', labelStyle: { fill: '#4ade8090', fontSize: 10 }, style: { stroke: '#4ade8060' } },
  ], []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#4a9eff10" gap={30} />
      </ReactFlow>
    </div>
  );
}

export default function AgentLoopDiagram() {
  return (
    <ReactFlowProvider>
      <AgentLoopInner />
    </ReactFlowProvider>
  );
}
