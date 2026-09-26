'use client';
/**
 * ToolSelectionAnim — the "tool menu": one card per tool (name + description + parameters).
 * Purely props-driven; AgentDataFlow decides the mode from the current scene.
 */
import { motion } from 'framer-motion';
import type { ToolCard } from './AgentLoopDiagram';

export type { ToolCard } from './AgentLoopDiagram';

export type MenuMode = 'draft' | 'idle' | 'scanning' | 'chosen' | 'unused';

interface ToolSelectionAnimProps {
  tools: ToolCard[];
  mode: MenuMode;
  chosen?: string[]; // names picked in the current turn
  usedBefore?: string[]; // names picked in earlier turns
  filledArgs?: Record<string, [string, string][]>; // arguments the AI filled in, per chosen tool
  highlightField?: 'name' | 'desc' | 'params' | null;
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
  const compact = tools.length > 2;
  const scanDelay = 0.22;

  return (
    <div className={`flex flex-col ${compact ? 'gap-1' : 'gap-1.5'}`}>
      {tools.map((tool, i) => {
        const isChosen = chosen.includes(tool.name) && (mode === 'chosen' || mode === 'scanning');
        const wasUsed = usedBefore.includes(tool.name);
        const dim = mode === 'draft' || (mode === 'chosen' && !isChosen) || mode === 'unused';
        const args = filledArgs[tool.name];
        // big menus: one line per card; the picked card opens up to show its description + arguments
        const inline = compact && !isChosen;
        const hl = (f: 'name' | 'desc' | 'params') =>
          highlightField === f ? 'ring-1 ring-yellow-300/70 bg-yellow-300/10 text-white/90' : '';
        return (
          <motion.div
            key={`${animKey}-${tool.name}`}
            initial={mode === 'scanning' ? { borderColor: 'rgba(255,255,255,0.08)' } : false}
            animate={{
              opacity: mode === 'draft' ? 0.35 : dim ? 0.45 : 1,
              borderColor: isChosen ? tool.color : 'rgba(255,255,255,0.1)',
              backgroundColor: isChosen ? `${tool.color}22` : 'rgba(255,255,255,0.03)',
              boxShadow: isChosen ? `0 0 16px ${tool.color}55` : '0 0 0px rgba(0,0,0,0)',
              scale: isChosen ? 1.02 : 1,
            }}
            transition={{ duration: 0.35, delay: mode === 'scanning' && isChosen ? tools.length * scanDelay : 0 }}
            className={`relative rounded-lg border ${compact ? (isChosen ? 'px-2 py-1' : 'px-2 py-0.5') : 'px-2.5 py-1.5'} ${mode === 'draft' ? 'border-dashed' : ''}`}
          >
            {/* scanning "eye" sweep */}
            {mode === 'scanning' && (
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.9, 0] }}
                transition={{ duration: 0.5, delay: i * scanDelay }}
                style={{ boxShadow: `inset 0 0 0 2px ${accentColor}`, backgroundColor: `${accentColor}14` }}
              />
            )}
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`flex-shrink-0 ${compact ? 'w-4 h-4 text-[11px]' : 'w-5 h-5 text-[12px]'} rounded flex items-center justify-center font-bold`}
                style={{ backgroundColor: `${tool.color}26`, color: tool.color }}
              >
                {tool.icon}
              </span>
              <span
                className={`${isChosen ? 'min-w-0 truncate' : 'flex-shrink-0'} font-mono text-[13px] font-semibold rounded px-0.5 ${hl('name')}`}
                style={{ color: isChosen ? '#fff' : tool.color }}
              >
                {tool.name}
              </span>
              {inline && tool.description && highlightField !== 'params' && (
                <span className={`flex-1 min-w-0 truncate text-[12px] text-white/45 rounded px-0.5 ${hl('desc')}`}>
                  {tool.description}
                </span>
              )}
              {inline && highlightField === 'params' && (
                <span
                  className={`flex-1 min-w-0 truncate font-mono text-[12px] text-white/70 rounded px-0.5 ${hl('params')}`}
                >
                  ({(tool.params ?? []).join(', ')})
                </span>
              )}
              {!inline && <div className="flex-1" />}
              {wasUsed && !isChosen && (
                <span className="flex-shrink-0 text-[11px] text-white/40 whitespace-nowrap">used ✓</span>
              )}
              {isChosen && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: mode === 'scanning' ? tools.length * scanDelay : 0.1 }}
                  className="flex-shrink-0 text-[11px] font-bold px-1.5 rounded-full whitespace-nowrap"
                  style={{ color: '#0a0a1a', backgroundColor: tool.color }}
                >
                  PICKED
                </motion.span>
              )}
            </div>
            {compact && isChosen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-mono text-[12px] truncate"
                style={{ color: tool.color }}
              >
                {args && args.length
                  ? args.map(([k, v]) => `${k}=${v}`).join(', ')
                  : `(${(tool.params ?? []).join(', ')})`}
              </motion.div>
            )}
            {!compact && tool.description && (
              <div
                className={`text-[12px] leading-snug text-white/60 rounded px-0.5 ${compact ? 'truncate' : ''} ${hl('desc')}`}
              >
                {tool.description}
              </div>
            )}
            {!compact && tool.params && tool.params.length > 0 && (
              <div className={`flex flex-wrap gap-1 mt-1 rounded ${hl('params')}`}>
                {tool.params.map((p, k) => {
                  const val = isChosen ? args?.find(([name]) => name === p)?.[1] : undefined;
                  return (
                    <motion.span
                      key={p}
                      className="font-mono text-[12px] px-1.5 rounded border"
                      animate={{
                        borderColor: val ? tool.color : 'rgba(255,255,255,0.12)',
                        color: val ? '#fff' : 'rgba(255,255,255,0.5)',
                      }}
                      transition={{ delay: val ? 0.3 + k * 0.25 : 0 }}
                    >
                      {p}
                      {val !== undefined && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + k * 0.25 }}
                          style={{ color: tool.color }}
                        >
                          {' '}
                          = {val.length > 22 ? val.slice(0, 21) + '…"' : val}
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
