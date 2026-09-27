import type { LessonGuide } from '@/data/lessonGuides';

// Lesson 33 (the last lesson): guardrails, human approval, and a little course wrap-up.
export const guide: LessonGuide = {
  lastTime: 'Agents shared a whiteboard: each one read all the notes, then added its own.',
  today: 'Brakes for an agent that acts: check what goes in, ask a human, check what comes out.',
  quiz: [
    {
      q: 'Max asks for send_email, which is in RISKY_TOOLS. What happens next?',
      options: [
        'The email is sent straight away',
        'Our code asks a human, and only runs it on "y"',
        'Cora sends it for him',
        'The program crashes',
      ],
      answer: 1,
      why: 'The AI can only ask for a tool. Our code decides: a risky tool waits for a person to type y. Anything else means "The human said no."',
    },
    {
      q: 'Why does Cora\'s job card say "Reply SAFE or UNSAFE only"?',
      options: [
        'To make her answers shorter and cheaper',
        'Because long answers are always unsafe',
        'So our code can easily read her one-word answer',
      ],
      answer: 2,
      why: 'Code is great at checking one exact word, and bad at reading a long paragraph. A tidy answer lets verdict.strip().startswith("SAFE") do the check.',
    },
    {
      q: 'Looking back at the whole course, which is true about an AI agent?',
      options: [
        'It guesses tokens, asks for tools, and our code keeps it safe',
        'It runs any tool it wants, whenever it wants',
        'It never makes mistakes, so checks are optional',
      ],
      answer: 0,
      why: 'Under the hood, the model predicts text. It can only ask for tools; your code runs them. Layers like checkers and human approval lower the risk, though nothing is perfect.',
    },
  ],
};
