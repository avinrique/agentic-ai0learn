import type { LessonGuide } from '@/data/lessonGuides';

export const guide: LessonGuide = {
  lastTime: 'Agents: the AI picks a tool, our code runs it, and the loop repeats until done.',
  today: 'Set up your computer: Python, the code kit, a secret API key, and your first run.',
  quiz: [
    {
      q: 'Where should your OpenAI API key live?',
      options: [
        'In a .env file on your computer',
        'Pasted at the top of your Python code',
        "On GitHub, so you don't lose it",
        'In the class group chat for safekeeping',
      ],
      answer: 0,
      why: 'The .env file stays on your computer, and .gitignore stops it from being uploaded. Anyone who sees your key can spend your credit.',
    },
    {
      q: "You run a lesson and see ModuleNotFoundError: No module named 'openai'. What's the likely fix?",
      options: [
        'Make a brand-new API key',
        'Buy more API credit',
        'Activate .venv, then run pip install -r requirements.txt',
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
      why: 'The ChatGPT app and the API are billed separately. For the API you add a little credit, pay per token, and set a budget limit.',
    },
  ],
};
