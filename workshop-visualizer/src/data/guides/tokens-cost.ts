import type { LessonGuide } from '@/data/lessonGuides';

export const guide: LessonGuide = {
  lastTime: 'We added stream=True and printed the answer piece by piece while the AI was still writing it.',
  today: 'Count the tokens one API call used, read the exact counts, and turn them into money.',
  quiz: [
    {
      q: 'Where do you find the EXACT number of tokens a call used?',
      options: [
        'In response.usage, sent back with the answer',
        'By counting the words in your question',
        'On the tiktoken website',
      ],
      answer: 0,
      why: 'response.usage holds prompt_tokens, completion_tokens and total_tokens: the real counts the API used, and what you pay for. tiktoken only gives an estimate before sending.',
    },
    {
      q: 'Why did tiktoken count 11 tokens when the API said prompt_tokens = 18?',
      options: [
        'tiktoken uses different cutting rules than gpt-4o-mini',
        'The AI read the question twice',
        'The answer tokens were added to the count',
        'The API adds formatting tokens around our message',
      ],
      answer: 3,
      why: 'The API puts a small "envelope" around each message: its role label and start and end markers. Those extra tokens count as input too, so the estimate is a little low.',
    },
    {
      q: 'A call uses 100 input and 100 output tokens. Which half costs more?',
      options: [
        'The input half',
        'The output half',
        'Both cost exactly the same',
      ],
      answer: 1,
      why: 'Output tokens cost more per token (our example: $0.60 per million out vs $0.15 in, 4× more). Same number of tokens, so the output half is the bigger part of the bill.',
    },
  ],
};
