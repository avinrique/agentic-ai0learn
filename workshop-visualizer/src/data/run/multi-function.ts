import type { RunInfo } from '@/data/runInfo';
import { multiFunctionCode } from '@/data/code-snippets';
import { AB, fillIn, toolEntry } from '@/data/runnable';

// The lesson shortens each tool to {"name": "add", ...}, which is not valid Python.
// The download gets the four full tool descriptions instead.
const shortTool = (name: string) => `    {"type": "function", "function": {"name": "${name}", ...}},`;

export const runInfo: RunInfo = {
  lessonId: 'multi-function',
  fileName: 'part2/multi_function.py',
  shownCode: multiFunctionCode,
  runnableCode: fillIn(multiFunctionCode, [
    [shortTool('add'), toolEntry('add', 'Add two numbers together.', AB)],
    [shortTool('subtract'), toolEntry('subtract', 'Subtract the second number from the first.', AB)],
    [shortTool('multiply'), toolEntry('multiply', 'Multiply two numbers together.', AB)],
    [shortTool('divide'), toolEntry('divide', 'Divide the first number by the second.', AB)],
  ]),
  expect:
    'The loop goes round a few times: multiply(50, 2) gives 100, then subtract(100, 15) gives 85, and finally the tutor explains that the answer is 85.',
  tryThis: [
    'Change the question to "What is 100 / 5 + 3?".',
    'Try "What is 7 * 8 + 9 * 4?": the AI can ask for two tools at once.',
    'Try "What is 10 / 0?" and see how the tutor handles it.',
  ],
};
