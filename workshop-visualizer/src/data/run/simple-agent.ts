import type { RunInfo } from '@/data/runInfo';
import { simpleAgentCode } from '@/data/code-snippets';

export const runInfo: RunInfo = {
  lessonId: 'simple-agent',
  fileName: 'part2/simple_agent.py',
  shownCode: simpleAgentCode,
  expect:
    'Numbered steps: the AI decides to call add, your Python runs add(a=45, b=13) and prints a debug line, then the AI gives the final answer, 58.',
  tryThis: [
    'Change the question to "What is 100 + 200?".',
    'Ask "What\'s the capital of France?" and watch the AI answer without the tool.',
    'Add print(arguments) after json.loads to see exactly what the AI sent.',
  ],
};
