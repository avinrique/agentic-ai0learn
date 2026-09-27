import type { LessonGuide } from '@/data/lessonGuides';

export const guide: LessonGuide = {
  lastTime: 'Our terminal assistant ran real commands and read and wrote files, using two loops working together.',
  today: 'Write test cases, run the agent on each one, check its tool and answer, and keep score.',
  quiz: [
    {
      q: 'You just changed your agent\'s prompt. What should you do next?',
      options: [
        'Test only the question you were fixing',
        'Re-run all the tests and compare the score',
        'Nothing, if it looked fine once',
      ],
      answer: 1,
      why: 'A fix in one place can break something somewhere else (a "regression"). Re-running every test after each change catches it, and the score shows if you went up or down.',
    },
    {
      q: 'The agent answered "45 + 13 = 58." without using add. Why does the test say FAIL?',
      options: [
        'The answer is wrong',
        'The answer is too short',
        'The test expected the add tool, but it used none',
      ],
      answer: 2,
      why: 'We check behaviour AND output. Skipping the calculator means it did the math in its head: lucky this time, but it can slip on harder sums.',
    },
    {
      q: 'Why check that the answer CONTAINS "58" instead of matching the exact sentence?',
      options: [
        "The AI's wording changes, but the key fact should be there",
        'Python cannot compare two whole sentences',
        'It makes the test run faster',
      ],
      answer: 0,
      why: '"45 + 13 = 58." and "The answer is 58!" are both right. Checking for the key fact passes both, while an exact match would fail a good answer.',
    },
  ],
};
