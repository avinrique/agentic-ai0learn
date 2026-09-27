import type { LessonGuide } from '@/data/lessonGuides';

export const guide: LessonGuide = {
  lastTime: 'Our first API call: send one question with create(), wait, then print response.choices[0].message.content.',
  today: 'Add stream=True and print the answer piece by piece while the AI writes it, like ChatGPT.',
  quiz: [
    {
      q: 'What changes when you add stream=True to create()?',
      options: [
        'The AI thinks harder and writes a smarter answer',
        'The answer arrives in pieces while it is written',
        'The answer gets saved into a file on your laptop',
        'The API call becomes free, so it costs nothing',
      ],
      answer: 1,
      why: "stream=True doesn't make the answer better, worse or cheaper. OpenAI just sends each small piece as soon as the model writes it, so you start reading much sooner.",
    },
    {
      q: 'Why does the loop check if piece: before printing?',
      options: [
        'To make the loop run a lot faster',
        'To count how many chunks have arrived',
        'To skip chunks with no text ("" or None)',
        'To wait until the whole answer is done',
      ],
      answer: 2,
      why: 'Some chunks carry no text: the first one only has role "assistant" (content ""), and the last one\'s content is None. Adding None to a string would crash.',
    },
    {
      q: 'What does end="" do in print(piece, end="", flush=True)?',
      options: [
        'Keeps the pieces side by side on one line',
        'Deletes each piece right after it is printed',
        'Stops the program at the end of the answer',
      ],
      answer: 0,
      why: 'print normally adds a new line (like pressing Enter) at the end. end="" swaps that for nothing, so the pieces sit side by side. flush=True shows them right away.',
    },
  ],
};
