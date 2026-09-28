import type { LessonGuide } from '@/data/lessonGuides';

export const guide: LessonGuide = {
  lastTime: 'Our terminal assistant ran real commands and read and wrote files, using two loops working together.',
  today: 'Write test cases, run the agent on each one, check its tool and answer, and keep score.',
  quiz: [
    {
      q: 'You just changed your agent\'s prompt. What should you do next?',
      options: [
        'Re-test only the question you fixed',
        'Re-run every test and compare scores',
        'Nothing, since it looked fine once',
      ],
      answer: 1,
      why: 'A fix in one place can break something somewhere else (a "regression"). Re-running every test after each change catches it, and the score shows if you went up or down.',
    },
    {
      q: 'A test printed "A: 45 + 13 = 58." but still FAILED. Which check failed?',
      options: [
        'The answer check',
        'The temperature check',
        'The tool check',
      ],
      answer: 2,
      why: 'The answer contains "58", so the answer check passed. The tool check failed: the agent skipped add and did the sum in its head. Right this time, but not guaranteed.',
    },
    {
      q: 'Why check that the answer CONTAINS "58" instead of matching the exact sentence?',
      options: [
        "The AI's wording can vary",
        "Python can't compare sentences",
        'It makes the tests run faster',
      ],
      answer: 0,
      why: '"45 + 13 = 58." and "The answer is 58!" are both right. Checking for the key fact passes both, while an exact match would fail a good answer.',
    },
  ],
};
