"use client";
/**
 * ToolSelectionAnim — the "tool menu": one card per tool (name + description + parameters).
 * It is only drawn when the menu is the focal point (writing the menu, the AI picking a tool),
 * so the cards are big: 1 column for small menus, 2 columns for big ones (e.g. 7 tools).
 * Purely props-driven; AgentDataFlow decides the mode from the current scene.
 */
import { motion } from "framer-motion";
import type { ToolCard } from "./AgentLoopDiagram";

export type { ToolCard } from "./AgentLoopDiagram";

export type MenuMode = "draft" | "idle" | "scanning" | "chosen" | "unused";

interface ToolSelectionAnimProps {
  tools: ToolCard[];
  mode: MenuMode;
  chosen?: string[]; // names picked in the current turn
  usedBefore?: string[]; // names picked in earlier turns
  filledArgs?: Record<string, [string, string][]>; // arguments the AI filled in, per chosen tool
  highlightField?: "name" | "desc" | "params" | null;
  accentColor: string;
  animKey: string; // restart the scan animation when the step changes
}

export default function ToolSelectionAnim({
  tools,
  mode,
  chosen = [],
  usedBefore = [],
  filledArgs = {},
  highlightField = null,
  accentColor,
  animKey,
}: ToolSelectionAnimProps) {
  const many = tools.length > 3;
  const scanDelay = many ? 0.16 : 0.25;
  const pickDelay = mode === "scanning" ? tools.length * scanDelay : 0;

  return (
    <div
      className={`w-full grid gap-2.5 ${many ? "grid-cols-2 max-w-[720px]" : "grid-cols-1 max-w-[480px]"}`}
    >
      {tools.map((tool, i) => {
        const isChosen =
          chosen.includes(tool.name) &&
          (mode === "chosen" || mode === "scanning");
        const wasUsed = usedBefore.includes(tool.name);
        const somePicked =
          chosen.length > 0 && (mode === "chosen" || mode === "scanning");
        const dim = mode === "unused" || (somePicked && !isChosen);
        const args = filledArgs[tool.name];
        const showParams = !many || highlightField === "params" || isChosen;
        const hl = (f: "name" | "desc" | "params") =>
          highlightField === f
            ? "ring-2 ring-yellow-300/80 bg-yellow-300/10 text-white"
            : "";
        return (
          <motion.div
            key={`${animKey}-${tool.name}`}
            initial={mode === "scanning" ? { opacity: 1 } : false}
            animate={{
              opacity: mode === "draft" ? 0.9 : dim ? 0.35 : 1,
              borderColor: isChosen ? tool.color : "rgba(255,255,255,0.1)",
              backgroundColor: isChosen
                ? `${tool.color}22`
                : "rgba(255,255,255,0.03)",
              boxShadow: isChosen
                ? `0 0 22px ${tool.color}55`
                : "0 0 0px rgba(0,0,0,0)",
              scale: isChosen ? 1.03 : 1,
            }}
            transition={{
              duration: 0.35,
              delay: isChosen || dim ? pickDelay : 0,
            }}
            className={`relative rounded-xl border ${many ? "px-3 py-2" : "px-4 py-3"} ${mode === "draft" ? "border-dashed" : ""}`}
          >
            {/* scanning "eye" sweep */}
            {mode === "scanning" && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.9, 0] }}
                transition={{ duration: 0.5, delay: i * scanDelay }}
                style={{
                  boxShadow: `inset 0 0 0 2px ${accentColor}`,
                  backgroundColor: `${accentColor}14`,
                }}
              />
            )}
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`flex-shrink-0 ${many ? "w-6 h-6 text-[14px]" : "w-8 h-8 text-[17px]"} rounded-md flex items-center justify-center font-bold`}
                style={{
                  backgroundColor: `${tool.color}26`,
                  color: tool.color,
                }}
              >
                {tool.icon}
              </span>
              <span
                className={`min-w-0 truncate font-mono ${many ? "text-[15px]" : "text-[18px]"} font-semibold rounded px-1 ${hl("name")}`}
                style={{ color: isChosen ? "#fff" : tool.color }}
              >
                {tool.name}
              </span>
              <div className="flex-1" />
              {wasUsed && !isChosen && (
                <span className="flex-shrink-0 text-[13px] text-white/50 whitespace-nowrap">
                  used ✓
                </span>
              )}
              {isChosen && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: pickDelay + 0.1 }}
                  className="flex-shrink-0 text-[13px] font-bold px-2 rounded-full whitespace-nowrap"
                  style={{ color: "#0a0a1a", backgroundColor: tool.color }}
                >
                  PICKED
                </motion.span>
              )}
            </div>
            {tool.description && (
              <div
                className={`mt-1 ${many ? "text-[13px]" : "text-[15px]"} leading-snug text-white/70 rounded px-1 line-clamp-2 ${hl("desc")}`}
              >
                {tool.description}
              </div>
            )}
            {showParams && tool.params && tool.params.length > 0 && (
              <div
                className={`flex flex-wrap gap-1.5 mt-1.5 rounded p-0.5 ${hl("params")}`}
              >
                {tool.params.map((p, k) => {
                  const val = isChosen
                    ? args?.find(([name]) => name === p)?.[1]
                    : undefined;
                  return (
                    <motion.span
                      key={p}
                      className="font-mono text-[13px] px-2 py-[1px] rounded-md border"
                      animate={{
                        borderColor: val
                          ? tool.color
                          : "rgba(255,255,255,0.15)",
                        color: val ? "#fff" : "rgba(255,255,255,0.65)",
                      }}
                      transition={{
                        delay: val ? pickDelay + 0.3 + k * 0.25 : 0,
                      }}
                    >
                      {p}
                      {val !== undefined && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: pickDelay + 0.3 + k * 0.25 }}
                          style={{ color: tool.color }}
                        >
                          {" "}
                          = {val.length > 24 ? val.slice(0, 23) + '…"' : val}
                        </motion.span>
                      )}
                    </motion.span>
                  );
                })}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
