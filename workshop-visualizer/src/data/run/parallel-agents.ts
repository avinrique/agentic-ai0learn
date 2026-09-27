import type { RunInfo } from '@/data/runInfo';
import { parallelAgentsCode } from '@/data/code-snippets/parallel-agents';

export const runInfo: RunInfo = {
  lessonId: 'parallel-agents',
  fileName: 'part4/parallel_agents.py',
  shownCode: parallelAgentsCode,
  expect:
    'Two times ("One at a time", then a much smaller "All at once"), then Wally\'s 4-sentence poster. Your times and facts will be different on every run.',
  tryThis: [
    'Add two more topics to the list: race 1 gets a lot longer, race 2 barely changes.',
    'Swap the planets for your own topics, like "volcanoes", "sharks" and "rainbows".',
    'Change ThreadPoolExecutor() to ThreadPoolExecutor(max_workers=1): with only one helper, race 2 is as slow as race 1.',
  ],
};
