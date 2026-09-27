import type { LessonGuide } from '@/data/lessonGuides';

// Lesson 31: Code: Agents in Parallel (Rita × N at the same time, then Wally).
export const guide: LessonGuide = {
  lastTime: 'Max the boss handed out jobs with tool calls, and each helper was a whole agent.',
  today: "Run Rita's research jobs at the same time with ThreadPoolExecutor, and time both races.",
  quiz: [
    {
      q: 'Three research jobs take about 2 seconds each. Run all at once, about how long does it take?',
      options: [
        'About 6 seconds: the times add up',
        'About 2 seconds: as long as the slowest job',
        'Under 1 second: the jobs share the work',
      ],
      answer: 1,
      why: 'All at once, the three Ritas wait for OpenAI side by side, so the stopwatch stops when the slowest one is done. One at a time, the times add up.',
    },
    {
      q: 'The Saturn job finishes first. Where is its fact in the list pool.map gives back?',
      options: [
        'First, because it finished first',
        'Somewhere random, it changes every run',
        'In the same spot as "Saturn" in topics',
      ],
      answer: 2,
      why: 'pool.map keeps the order of the list you hand it. Whoever finishes first, facts[0] always belongs to topics[0], facts[1] to topics[1], and so on.',
    },
    {
      q: 'When should you NOT run agent jobs in parallel?',
      options: [
        "When one job needs another job's answer",
        'When the jobs are independent',
        'When each job mostly waits for OpenAI',
      ],
      answer: 0,
      why: "Wally needs all of Rita's facts, so he has to wait. Also watch out for rate limits: too many calls at once can get a 429 error.",
    },
  ],
};
