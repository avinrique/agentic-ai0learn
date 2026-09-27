import type { LessonGuide } from '@/data/lessonGuides';

export const guide: LessonGuide = {
  lastTime: 'StudyBuddy Pro juggled seven tools, but its lookup tool only found notes with the exact same words.',
  today: 'Find handbook facts by meaning with embeddings, put the best 2 in the prompt, and answer from them.',
  quiz: [
    {
      q: 'Why can\'t an exact-word lookup answer "How many books can I take out?"',
      options: [
        'The handbook has no fact about books',
        'Questions must be shorter than 5 words',
        'The handbook says "borrow", not "take out", so no words match',
      ],
      answer: 2,
      why: 'Word search needs the same letters. Embeddings compare meaning instead, so "take out books" and "borrow books" land close together even though the words differ.',
    },
    {
      q: 'What does client.embeddings.create() give back for each text?',
      options: [
        'A list of 1,536 numbers: its spot on a map of meaning',
        'A short summary of the text',
        'An answer to the question in the text',
        'The text translated into Python',
      ],
      answer: 0,
      why: 'text-embedding-3-small turns each text into 1,536 numbers, like GPS coordinates for meaning. Texts with similar meanings get similar numbers, so similarity() gives them a high score.',
    },
    {
      q: 'Someone asks "What\'s the Wi-Fi password?" Why does the AI say it doesn\'t know?',
      options: [
        'The embedding call failed',
        'No context fact mentions Wi-Fi, and the rule forbids guessing',
        'gpt-4o-mini has never heard of Wi-Fi',
      ],
      answer: 1,
      why: 'The code still sends the top 2 facts, but neither is about Wi-Fi. The system prompt says: answer ONLY from the context, or say you don\'t know. So it doesn\'t invent a password.',
    },
  ],
};
