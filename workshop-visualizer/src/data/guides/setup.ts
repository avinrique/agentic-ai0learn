import type { LessonGuide } from '@/data/lessonGuides';

export const guide: LessonGuide = {
  lastTime: 'Agents: the AI picks a tool, our code runs it, and the loop repeats until done.',
  today: 'Set up your computer: Python, the code kit, a secret API key, and your first run.',
  quiz: [
    {
      q: 'Oops: your API key ended up in a public GitHub project. What should you do?',
      options: [
        'Rename the file so nobody finds it',
        'Nothing: keys stop working by themselves',
        'Change your ChatGPT password',
        'Delete the key on the website and make a new one',
      ],
      answer: 3,
      why: 'Bots search GitHub for keys, so assume it was copied. Deleting it makes the copied key useless. Put the new key in .env, which .gitignore keeps off GitHub.',
    },
    {
      q: "run.py says: “The course libraries aren't installed yet”. What's the likely fix?",
      options: [
        'Make a brand-new API key',
        'Buy more API credit',
        'Switch on .venv, then run pip install -r requirements.txt',
        'Restart your web browser',
      ],
      answer: 2,
      why: "Python can't find the openai tools. Either the toolbox (.venv) isn't switched on, or pip install hasn't been run inside it yet.",
    },
    {
      q: 'You pay for ChatGPT Plus. Does that cover API calls from your Python code?',
      options: [
        'Yes, it covers everything OpenAI makes',
        'No, the API is billed separately, per token',
        'Yes, but only for gpt-4o-mini',
      ],
      answer: 1,
      why: 'The ChatGPT app and the API are billed separately. For the API you add a little prepaid credit (auto-recharge off) and pay per token.',
    },
  ],
};
