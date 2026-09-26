// Helpers for src/data/run/*.ts: build a lesson's full, runnable program from the code the
// lesson shows, by swapping the shortened parts (like `"parameters": {...}`) for the real
// thing. Everything else stays byte-for-byte the same as the lesson code.

/**
 * Replace each `find` with its `replace`. Every `find` must appear exactly once, so if
 * the lesson code changes, this throws instead of silently shipping a different program.
 */
export function fillIn(shownCode: string, swaps: [find: string, replace: string][]): string {
  let code = shownCode;
  for (const [find, replace] of swaps) {
    const count = code.split(find).length - 1;
    if (count !== 1) throw new Error(`runnable code: "${find.slice(0, 70)}" found ${count} times`);
    code = code.replace(find, () => replace);
  }
  return code;
}

/** One parameter of a tool: [name, JSON type, optional description]. */
export type ToolParam = [name: string, type: 'number' | 'string', description?: string];

/**
 * A full tool entry for a Python `tools = [...]` list, written in the same style the
 * lessons use (4-space indent inside the list, trailing comma):
 *
 *     {"type": "function", "function": {
 *         "name": "add",
 *         "description": "Add two numbers.",
 *         "parameters": {"type": "object", "properties": {
 *             "a": {"type": "number"},
 *             "b": {"type": "number"}
 *         }, "required": ["a", "b"]}
 *     }},
 */
export function toolEntry(name: string, description: string, params: ToolParam[]): string {
  const props = params.map(([p, type, desc], i) => {
    const schema = desc ? `{"type": "${type}", "description": ${JSON.stringify(desc)}}` : `{"type": "${type}"}`;
    return `            "${p}": ${schema}${i < params.length - 1 ? ',' : ''}`;
  });
  const required = params.map(([p]) => `"${p}"`).join(', ');
  return [
    `    {"type": "function", "function": {`,
    `        "name": "${name}",`,
    `        "description": ${JSON.stringify(description)},`,
    `        "parameters": {"type": "object", "properties": {`,
    ...props,
    `        }, "required": [${required}]}`,
    `    }},`,
  ].join('\n');
}

/** The two-number parameters (a, b) used by the calculator tools. */
export const AB: ToolParam[] = [
  ['a', 'number'],
  ['b', 'number'],
];
