import type { LessonGuide } from '@/data/lessonGuides';

export const guide: LessonGuide = {
  lastTime: 'The system prompt, messages[0], briefs the AI on its role and rules before every chat.',
  today: 'We turn vague requests into clear prompts with six ingredients, fences and step-by-step thinking.',
  quiz: [
    {
      q: "You type 'Write about dogs' and get a bland answer. What is the best fix?",
      options: [
        'Raise the temperature',
        "Say what to make, who it's for and how long",
        'Send the same prompt again',
        'Type it in capital letters',
      ],
      answer: 1,
      why: "The AI only knows what you tell it. A clear task, some context and a format turn a guess into the answer you actually wanted.",
    },
    {
      q: 'You paste a story into your prompt. Why wrap it in triple quotes or ###?',
      options: [
        'It makes the AI read faster',
        'The API refuses text without quotes',
        'It shows exactly where the pasted text starts and ends',
      ],
      answer: 2,
      why: 'Like a fence, the marks keep your instructions apart from the pasted text, so a line inside the story is not mistaken for an instruction.',
    },
    {
      q: 'Which instruction gives the AI the clearest target?',
      options: [
        'Use words a 10-year-old knows.',
        "Don't use hard words.",
        "Don't be complicated or boring.",
      ],
      answer: 0,
      why: "Say what TO do. \"Don't use hard words\" leaves the AI guessing which words are hard; \"a 10-year-old\" gives it a clear target.",
    },
  ],
};
