'use client';
/**
 * TerminalToolExec — a real-looking terminal for the Terminal Assistant lesson.
 * Shows the program's console output so far, with each tool run drawn inline
 * ($ command + its output, or the file that was read / written), plus a safety badge.
 */
import { motion } from 'framer-motion';
import { AgentCall, AgentScene, unescape, unquote } from './AgentLoopDiagram';

type Line = {
  key: string;
  text: string;
  kind: 'out' | 'user' | 'assistant' | 'cmd' | 'result' | 'file' | 'info';
  active?: boolean;
};

function argVal(c: AgentCall, k: string): string {
  return unescape(unquote(c.args.find(([n]) => n === k)?.[1] ?? ''));
}

export function safetyFor(name: string): { text: string; color: string } {
  if (name === 'run_command')
    return {
      text: '⚠️ shell=True runs ANY command: confirm risky ones',
      color: '#f87171',
    };
  if (name === 'read_file') return { text: '🔒 Only reads: nothing changes', color: '#4ade80' };
  if (name === 'write_file')
    return {
      text: '✏️ Changes your disk: overwrites the file',
      color: '#fbbf24',
    };
  return { text: '', color: '#fff' };
}

export default function TerminalToolExec({
  scene,
  showBadge = true,
  maxLines = 12,
}: {
  scene: AgentScene;
  showBadge?: boolean;
  maxLines?: number;
}) {
  const s = scene.step;
  const calls = scene.model.turns.flatMap((t) => t.calls).filter((c) => c.execStep <= s);

  const events: { step: number; order: number; lines: Line[] }[] = [];
  for (const o of scene.outputsSoFar) {
    const kind: Line['kind'] = o.text.startsWith('You:')
      ? 'user'
      : o.text.startsWith('Assistant:')
        ? 'assistant'
        : 'out';
    events.push({
      step: o.step,
      order: 0,
      lines: [{ key: `o${o.step}`, text: o.text, kind }],
    });
  }
  for (const c of calls) {
    const isActive = c === scene.call && ['select', 'execute', 'return'].includes(scene.phase);
    const done = c.resultStep <= s;
    const liveOut = isActive && !done ? scene.vars.output : undefined;
    const body = done ? unescape(unquote(c.result)) : liveOut ? unescape(unquote(liveOut)) : '';
    const lines: Line[] = [];
    if (c.name === 'run_command') {
      lines.push({
        key: `${c.id}c`,
        text: `$ ${argVal(c, 'command')}`,
        kind: 'cmd',
        active: isActive,
      });
    } else if (c.name === 'read_file') {
      lines.push({
        key: `${c.id}c`,
        text: `📖 open("${argVal(c, 'path')}").read()`,
        kind: 'cmd',
        active: isActive,
      });
    } else if (c.name === 'write_file') {
      lines.push({
        key: `${c.id}c`,
        text: `✏️ open("${argVal(c, 'path')}", "w").write(...)`,
        kind: 'cmd',
        active: isActive,
      });
      argVal(c, 'content')
        .split('\n')
        .filter(Boolean)
        .forEach((l, k) => lines.push({ key: `${c.id}w${k}`, text: `   │ ${l}`, kind: 'file' }));
    } else {
      lines.push({
        key: `${c.id}c`,
        text: `${c.name}(...)`,
        kind: 'cmd',
        active: isActive,
      });
    }
    if (body) {
      body
        .replace(/\n$/, '')
        .split('\n')
        .forEach((l, k) =>
          lines.push({
            key: `${c.id}r${k}`,
            text: c.name === 'read_file' ? `   │ ${l}` : l,
            kind: c.name === 'read_file' ? 'file' : 'result',
          }),
        );
    } else {
      lines.push({ key: `${c.id}run`, text: '▌', kind: 'info' });
    }
    events.push({ step: c.execStep, order: 1, lines });
  }
  events.sort((a, b) => a.step - b.step || a.order - b.order);
  const all = events.flatMap((e) => e.lines);
  const shown = all.slice(-maxLines);

  const focusCall = scene.call && ['select', 'execute'].includes(scene.phase) ? scene.call : undefined;
  const badge = focusCall && showBadge ? safetyFor(focusCall.name) : undefined;

  const color: Record<Line['kind'], string> = {
    out: 'rgba(255,255,255,0.55)',
    user: '#93c5fd',
    assistant: '#86efac',
    cmd: '#fbbf24',
    result: 'rgba(255,255,255,0.9)',
    file: '#c4b5fd',
    info: '#4ade80',
  };

  return (
    <div className="w-full max-h-full flex flex-col rounded-xl overflow-hidden border border-white/15 bg-[#05050f] min-h-0">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border-b border-white/10 flex-shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
        <span className="ml-2 text-[13px] font-mono text-white/45 truncate">terminal</span>
      </div>
      {badge && (
        <motion.div
          key={`${focusCall?.id}-${scene.phase}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-1.5 text-[14px] font-semibold flex-shrink-0"
          style={{
            color: badge.color,
            backgroundColor: `${badge.color}14`,
            borderBottom: `1px solid ${badge.color}40`,
          }}
        >
          {badge.text}
        </motion.div>
      )}
      <div className="min-h-0 overflow-hidden flex flex-col justify-end px-4 py-2.5 font-mono text-[15px] leading-[1.55]">
        {shown.length === 0 && <div className="text-white/30">$ python run.py part3/terminal_assistant.py</div>}
        {shown.map((l) => (
          <motion.div
            key={l.key}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex-shrink-0 whitespace-pre truncate ${l.active ? 'bg-yellow-300/10 rounded' : ''}`}
            style={{ color: color[l.kind] }}
          >
            {l.kind === 'info' ? (
              <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                ▌ running…
              </motion.span>
            ) : (
              l.text
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
