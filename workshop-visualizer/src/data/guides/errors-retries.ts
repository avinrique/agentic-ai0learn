import type { LessonGuide } from '@/data/lessonGuides';

export const guide: LessonGuide = {
  lastTime: 'A few example user/assistant pairs (few-shot) taught the AI a new task and answer style.',
  today: 'Our program learns to catch errors, wait, retry the right ones, and give friendly messages.',
  quiz: [
    {
      q: 'What does try/except do when the API call fails?',
      options: [
        'It stops the error from ever happening',
        'It catches the error so your program can react',
        'It hides the error and returns nothing',
      ],
      answer: 1,
      why: "The error still happens, but instead of crashing with a traceback, Python jumps to the matching except block. There you choose what to do: retry, or show a friendly message.",
    },
    {
      q: 'Which error is worth retrying after a short wait?',
      options: [
        '401: the API key is wrong',
        '429 with code "insufficient_quota"',
        '429: too many requests right now',
      ],
      answer: 2,
      why: 'A busy server frees up in a moment. A wrong key or an empty account stays that way, so retrying those only wastes time.',
    },
    {
      q: 'Why wait 1s, then 2s, instead of retrying instantly?',
      options: [
        'It gives the busy server more room each time',
        'Python needs a rest between loops',
        'The API only answers on even seconds',
      ],
      answer: 0,
      why: 'Instant retries pile even more requests onto a busy server. Doubling the wait (exponential back-off) spaces them out, and a try limit makes sure it ends.',
    },
  ],
};
