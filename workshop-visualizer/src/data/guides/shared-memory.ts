import type { LessonGuide } from '@/data/lessonGuides';

export const guide: LessonGuide = {
  lastTime: 'Independent jobs ran at the same time with ThreadPoolExecutor, so the team finished much faster.',
  today: 'A shared whiteboard: a plain list every agent reads in full, then adds its own labelled note.',
  quiz: [
    {
      q: 'What is the shared whiteboard in our code?',
      options: ['A special memory inside the AI', 'A plain Python list that our code keeps', "A file stored on OpenAI's computers"],
      answer: 1,
      why: 'whiteboard = [] is just a list. The AI remembers nothing between calls: our code pastes read_board() into each agent\'s task, and that\'s how it "reads" the board.',
    },
    {
      q: 'The Teacher accidentally writes "240 students" instead of 24. What happens next?',
      options: [
        'The AI notices and fixes it',
        "Only the Teacher's note is wrong",
        'Everyone after the Teacher builds on the wrong number',
      ],
      answer: 2,
      why: 'Everyone trusts the board, so one wrong note spreads to every agent who reads it: Milo splits $60 between 240 people and Wally invites all 240. Check important notes first.',
    },
    {
      q: "Why does each agent's call send more tokens than the one before?",
      options: [
        'read_board() adds the whole board, which keeps growing',
        'Later agents have longer names',
        'OpenAI charges more for later calls',
      ],
      answer: 0,
      why: 'Every note stays on the board, and every agent reads all of it. More text sent means more cost and waiting, so short notes are a good habit.',
    },
  ],
};
