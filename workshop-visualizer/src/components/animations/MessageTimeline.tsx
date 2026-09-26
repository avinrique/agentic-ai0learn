"use client";
/**
 * MessageTimeline — the `messages` list (the chat history).
 *
 *  - compact (most steps): one quiet row of role chips, so you can see the list grow.
 *  - expanded (the steps that append to `messages`): the list becomes the focal point,
 *    one row per message, the new one(s) glowing. Ids are colour-matched so a tool result
 *    visibly belongs to its tool_call.
 * It shows exactly as many messages as the `messages` variable holds at the current step.
 */
import { motion } from "framer-motion";
import {
  AgentScene,
  ConvMsg,
  IdChip,
  argsCall,
  idColor,
  truncate,
  unescape,
  unquote,
} from "./AgentLoopDiagram";

const ROLE: Record<string, { color: string; icon: string }> = {
  system: { color: "#a78bfa", icon: "⚙️" },
  user: { color: "#60a5fa", icon: "👤" },
  assistant: { color: "#fbbf24", icon: "🤖" },
  tool: { color: "#4ade80", icon: "📦" },
};

function Body({
  m,
  scene,
  big,
}: {
  m: ConvMsg;
  scene: AgentScene;
  big: boolean;
}) {
  if (m.role === "assistant" && m.calls) {
    return (
      <span className="inline-flex items-center gap-2 flex-wrap">
        <span className="text-white/50">tool_calls:</span>
        {m.calls.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5">
            <span className="font-mono text-white/90">
              {truncate(argsCall(c.name, c.args), big ? 40 : 30)}
            </span>
            <IdChip id={c.id} color={idColor(scene.model, c.id)} />
          </span>
        ))}
      </span>
    );
  }
  if (m.role === "tool") {
    return (
      <span className="inline-flex items-center gap-2 flex-wrap">
        <IdChip id={m.id} color={idColor(scene.model, m.id)} />
        <span className="font-mono text-white/90">
          &quot;{truncate(unescape(unquote(m.text)), big ? 60 : 40)}&quot;
        </span>
      </span>
    );
  }
  const text = "text" in m ? (m.text ?? "") : "";
  return (
    <span className="text-white/90">
      &quot;{truncate(text, big ? 90 : 60)}&quot;
    </span>
  );
}

export default function MessageTimeline({
  scene,
  expanded = false,
}: {
  scene: AgentScene;
  expanded?: boolean;
}) {
  const all = scene.conversation.slice(0, scene.msgCount);
  const grew = scene.msgCount > scene.prevMsgCount;

  if (!expanded) {
    // ---- compact: a row of role chips ----
    const MAX = 8;
    const hidden = all.length > MAX ? all.length - (MAX - 1) : 0;
    const visible = all.slice(hidden);
    return (
      <div className="flex-shrink-0 flex items-center gap-1.5 min-w-0 overflow-hidden px-1">
        <span className="font-mono text-[13px] text-white/45 flex-shrink-0 mr-1">
          messages
        </span>
        {visible.length === 0 && (
          <span className="font-mono text-[13px] text-white/30">[ ]</span>
        )}
        {hidden > 0 && (
          <span className="text-[13px] text-white/40 whitespace-nowrap">
            +{hidden}
          </span>
        )}
        {visible.map((m, k) => {
          const r = ROLE[m.role];
          return (
            <span
              key={`${k + hidden}-${m.role}`}
              className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-[1px] text-[13px] whitespace-nowrap"
              style={{ color: `${r.color}cc`, backgroundColor: `${r.color}14` }}
            >
              {r.icon} {m.role}
            </span>
          );
        })}
      </div>
    );
  }

  // ---- expanded: the list is the focal point ----
  const MAX = 7;
  const hidden = all.length > MAX ? all.length - (MAX - 1) : 0;
  const visible = all.slice(hidden);
  return (
    <div className="w-full max-w-[760px] mx-auto flex flex-col gap-2">
      <div className="flex items-baseline gap-2 px-1">
        <span className="font-mono text-[16px] font-semibold text-white/90">
          messages
        </span>
        <motion.span
          key={scene.msgCount}
          initial={{ scale: 1.4, color: "#fff" }}
          animate={{ scale: 1, color: "rgba(255,255,255,0.55)" }}
          className="font-mono text-[14px]"
        >
          {scene.msgCount} message{scene.msgCount === 1 ? "" : "s"}
        </motion.span>
      </div>
      {hidden > 0 && (
        <div className="px-3 text-[13px] text-white/45">
          +{hidden} earlier messages
        </div>
      )}
      {visible.map((m, k) => {
        const i = k + hidden;
        const r = ROLE[m.role];
        const isNew = grew && i >= scene.prevMsgCount;
        return (
          <motion.div
            key={`${i}-${m.role}`}
            initial={isNew ? { opacity: 0, y: 14, scale: 0.96 } : false}
            animate={{
              opacity: isNew ? 1 : 0.55,
              y: 0,
              scale: 1,
              boxShadow: isNew
                ? `0 0 18px ${r.color}55`
                : "0 0 0px rgba(0,0,0,0)",
            }}
            transition={{ type: "spring", damping: 18, stiffness: 160 }}
            className={`flex items-center gap-3 rounded-xl border px-3 ${isNew ? "py-2.5 text-[16px]" : "py-1.5 text-[14px]"} min-w-0`}
            style={{
              borderColor: isNew ? r.color : "rgba(255,255,255,0.08)",
              backgroundColor: `${r.color}${isNew ? "18" : "0a"}`,
            }}
          >
            <span
              className="font-semibold whitespace-nowrap w-[118px] flex-shrink-0"
              style={{ color: r.color }}
            >
              {r.icon} {m.role}
            </span>
            <span className="min-w-0 overflow-hidden text-ellipsis">
              <Body m={m} scene={scene} big={isNew} />
            </span>
            {isNew && (
              <span
                className="ml-auto flex-shrink-0 text-[13px] font-semibold whitespace-nowrap"
                style={{ color: r.color }}
              >
                NEW
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
