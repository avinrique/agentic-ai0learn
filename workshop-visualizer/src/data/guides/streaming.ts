import type { LessonGuide } from '@/data/lessonGuides';

export const guide: LessonGuide = {
  lastTime: 'Our first API call: send one question with create(), wait, then print response.choices[0].message.content.',
  today: 'Add stream=True and print the answer piece by piece while the AI writes it, like ChatGPT.',
  quiz: [
    {
      q: 'What changes when you add stream=True to create()?',
      options: [
        'The AI writes a smarter answer',
        'The answer arrives in small chunks while it is written',
        'The answer is saved to a file',
        'The API call becomes free',
      ],
      answer: 1,
      why: 'With stream=True, OpenAI sends each small piece as soon as the model writes it. The answer is the same; you just start seeing it much sooner.',
    },
    {
      q: 'Why does the loop check if piece: before printing?',
      options: [
        'To make the loop run faster',
        'To count how many chunks arrived',
        'Some chunks have no text (None), and adding None would crash',
      ],
      answer: 2,
      why: 'The last chunk only says "finished", so its delta.content is None. full_story += None would raise an error, so we skip pieces without text.',
    },
    {
      q: 'What does end="" do in print(piece, end="", flush=True)?',
      options: [
        'Keeps each piece on the same line, with no new line',
        'Deletes the piece after it is printed',
        'Stops the program at the end of the answer',
      ],
      answer: 0,
      why: 'print normally adds a new line (like pressing Enter) at the end. end="" swaps that for nothing, so the pieces sit side by side. flush=True shows them right away.',
    },
  ],
};
