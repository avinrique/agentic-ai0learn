import type { RunInfo } from '@/data/runInfo';
import { bossAgentCode } from '@/data/code-snippets/part4';

export const runInfo: RunInfo = {
  lessonId: 'boss-agent',
  fileName: 'part4/boss_agent.py',
  shownCode: bossAgentCode,
  expect:
    'Max hands out the jobs ("Max asks ask_researcher: ...", then ask_math_whiz), and finally writes the answer: about 99 buildings.',
  tryThis: [
    'Change the request to "What is 25% of 480?" and see which helper Max picks.',
    'Change the request to "3 facts about owls and 3 facts about bats" and watch Max ask Rita twice.',
    'Stretch: add a third helper, a poet, to the functions, the tools list and helpers.',
  ],
};
