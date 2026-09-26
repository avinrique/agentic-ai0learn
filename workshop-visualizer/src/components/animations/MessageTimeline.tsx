'use client';
/**
 * MessageTimeline — the `messages` list (the chat history) drawn as cards with role badges.
 * It shows exactly as many messages as the `messages` variable holds at the current step,
 * and ids are colour-matched so a tool result visibly belongs to its tool_call.
 */
import { motion } from 'framer-motion';
import { AgentScene, ConvMsg, IdChip, argsCall, idColor, truncate, unescape, unquote } from './AgentLoopDiagram';

const ROLE: Record<string, { color: string; icon: string }> = {
  system: { color: '#a78bfa', icon: '⚙️' },
  user: { color: '#60a5fa', icon: '👤' },
  assistant: { color: '#fbbf24', icon: '🤖' },
  tool: { color: '#4ade80', icon: '📦' },
};

function Body({ m, scene }: { m: ConvMsg; scene: AgentScene }) {
  if (m.role === 'assistant' && m.calls) {
    return (
      <span className="flex flex-wrap items-center gap-1">
        <span className="text-white/50">tool_calls:</span>
        {m.calls.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1">
            <span className="font-mono text-white/85">{truncate(argsCall(c.name, c.args), 34)}</span>
            <IdChip id={c.id} color={idColor(scene.model, c.id)} />
          </span>
        ))}
      </span>
    );
  }
  if (m.role === 'tool') {
    return (
      <span className="flex flex-wrap items-center gap-1">
        <IdChip id={m.id} color={idColor(scene.model, m.id)} />
        <span className="font-mono text-white/85">&quot;{truncate(unescape(unquote(m.text)), 34)}&quot;</span>
      </span>
    );
  }
  const text = 'text' in m ? m.text ?? '' : '';
  return <span className="text-white/85">&quot;{truncate(text, m.role === 'system' ? 40 : 60)}&quot;</span>;
}

export default function MessageTimeline({ scene }: { scene: AgentScene }) {
  const visible = scene.conversation.slice(0, scene.msgCount);

  return (
    <div className="flex-shrink-0 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-[12px] text-white/70">messages</span>
        <span className="text-[12px] text-white/40">(the chat history, sent on every call)</span>
        <div className="flex-1" />
        <motion.span
          key={scene.msgCount}
          initial={{ scale: 1.5, color: '#fff' }}
          animate={{ scale: 1, color: 'rgba(255,255,255,0.5)' }}
          className="font-mono text-[12px]"
        >
          {scene.msgCount} message{scene.msgCount === 1 ? '' : 's'}
        </motion.span>
      </div>
      {visible.length === 0 ? (
        <div className="text-[12px] text-white/30 font-mono py-1">[ ] (nothing yet)</div>
      ) : (
        <div className="flex flex-wrap gap-1 max-h-[118px] overflow-hidden">
          {visible.map((m, i) => {
            const r = ROLE[m.role];
            const isNew = i >= scene.prevMsgCount && scene.msgCount > scene.prevMsgCount;
            return (
              <motion.div
                key={`${i}-${m.role}`}
                initial={isNew ? { opacity: 0, y: 10, scale: 0.9 } : false}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  boxShadow: isNew ? `0 0 14px ${r.color}88` : '0 0 0px rgba(0,0,0,0)',
                }}
                transition={{ type: 'spring', damping: 18, stiffness: 160 }}
                className="flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[12px] max-w-full"
                style={{ borderColor: isNew ? r.color : `${r.color}40`, backgroundColor: `${r.color}12` }}
              >
                <span className="text-white/35 font-mono">{i}</span>
                <span className="font-semibold whitespace-nowrap" style={{ color: r.color }}>
                  {r.icon} {m.role}
                </span>
                <span className="min-w-0">
                  <Body m={m} scene={scene} />
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
