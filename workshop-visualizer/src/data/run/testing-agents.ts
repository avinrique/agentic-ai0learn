import type { RunInfo } from '@/data/runInfo';
import { testingAgentsCode } from '@/data/code-snippets/testing-agents';

export const runInfo: RunInfo = {
  lessonId: 'testing-agents',
  fileName: 'part3/testing_agents.py',
  shownCode: testingAgentsCode,
  expect:
    'Each of the 3 questions is printed with the agent\'s answer and ✅ PASS (or ❌ FAIL with a reason), then "Score: 3/3 passed". The AI\'s wording may differ from ours, but the key facts should be there.',
  tryThis: [
    'Add a 4th test: {"question": "What is 17 + 25?", "expect_tool": "add", "must_contain": "42"}.',
    'Break it on purpose: change return a + b to return a - b, run again, and read the FAIL reasons.',
    'Change "Paris" to "paris" in the tests: "contains" checks are case-sensitive, so watch that test fail.',
  ],
};
