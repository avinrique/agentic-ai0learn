import { ConceptStep } from '@/stores/conceptStore';

// ===== Lesson 9: Get Set Up: Run AI Code on Your Computer =====
export const setupSteps: ConceptStep[] = [
  // Step 0
  {
    explanation: "Until now you've watched. Today you set up your own AI workshop, so you can run every lesson's program yourself. Look at the six stations Solo Bot will help you fill.",
    animationTrigger: 'intro',
    subtitle: 'From watching to doing.',
  },
  // Step 1
  {
    explanation: 'What happens when you run a lesson: your Python program runs on your computer, sends the message over the internet to OpenAI, and the answer comes back.',
    animationTrigger: 'bigPicture',
    subtitle: "The model runs at OpenAI, so your computer doesn't need to be powerful.",
  },
  // Step 2
  {
    explanation: 'Meet the terminal: a text chat with your computer. You type a command, press Enter, and it types back. The blinking cursor means “your turn”.',
    animationTrigger: 'terminal',
    subtitle: 'Every setup step is one typed command.',
  },
  // Step 3
  {
    explanation: 'Station 1: Python, the language our programs are written in. Get Python 3.10 or newer from python.org. Windows: use the standalone installer and tick “Add python.exe to PATH” first.',
    animationTrigger: 'python',
    subtitle: 'PATH = the list of places your computer looks for commands.',
  },
  // Step 4
  {
    explanation: 'Check that it worked: type the version command and press Enter. A version number coming back means station 1 is done. On a Mac the command is usually python3.',
    animationTrigger: 'pythonCheck',
    subtitle: 'Use the Mac / Windows switch to see your computer.',
  },
  // Step 5
  {
    explanation: 'Station 2: the code kit. Download the zip and unzip it to get the ai-course folder. Every program from the lessons is inside, plus a few helper files.',
    animationTrigger: 'kit',
    subtitle: 'run.py and check_setup.py are your two helpers.',
  },
  // Step 6
  {
    explanation: 'Now point the terminal at that folder. Watch the end of the line: when it says ai-course, every command you type runs inside the kit.',
    animationTrigger: 'openFolder',
    subtitle: 'cd = change directory = walk into a folder.',
  },
  // Step 7
  {
    explanation: "Station 3: a toolbox. This command makes a virtual environment: a private toolbox folder called .venv, so this project's tools don't mix with anything else on your computer.",
    animationTrigger: 'venv',
    subtitle: 'No message back means it worked.',
  },
  // Step 8
  {
    explanation: 'Open the toolbox. Look at the start of the line: (.venv) means the toolbox is switched on. Do this every time you open a new terminal.',
    animationTrigger: 'activate',
    subtitle: 'Inside the toolbox, plain “python” works on a Mac too.',
  },
  // Step 9
  {
    explanation: "Fill the toolbox. pip is Python's app store, and requirements.txt is the shopping list. Watch pip download openai, python-dotenv and tiktoken, plus the helpers they need.",
    animationTrigger: 'pip',
    subtitle: 'You only do this once.',
  },
  // Step 10
  {
    explanation: 'Station 4: your API key, a secret password that tells OpenAI the request is yours. On platform.openai.com, open API keys and click “Create new secret key”.',
    animationTrigger: 'apiKey',
    subtitle: 'Under 18? A parent or teacher creates the account and the key.',
  },
  // Step 11
  {
    explanation: 'Using the API is billed separately from a ChatGPT subscription. Add a little prepaid credit and keep auto-recharge off: when the credit runs out, calls simply stop.',
    animationTrigger: 'credit',
    subtitle: 'A budget alert can also email you when you get close.',
  },
  // Step 12
  {
    explanation: "Look at the cost meter. You pay per token, and tokens in and out have separate prices. With gpt-4o-mini, running every lesson's program a few times typically costs a few cents in total.",
    animationTrigger: 'cost',
    subtitle: 'A token is a small piece of text, about ¾ of a word.',
  },
  // Step 13
  {
    explanation: 'Station 5: the secret safe. Copy .env.example to a new file called .env, open it, replace sk-your-key-here with your key, and save. run.py reads it from there.',
    animationTrigger: 'envFile',
    subtitle: 'No spaces, no quotes.',
  },
  // Step 14
  {
    explanation: 'Why a safe? Your key works like a house key and a credit card in one: anyone who sees it can spend your credit. So it never goes on a “postcard”.',
    animationTrigger: 'postcard',
    subtitle: 'GitHub = a public website where people share code.',
  },
  // Step 15
  {
    explanation: 'Station 6: the first run. check_setup.py checks every station, then asks before making one tiny test call. Type y and look for green ticks.',
    animationTrigger: 'check',
    subtitle: 'Green ticks everywhere = ready.',
  },
  // Step 16
  {
    explanation: "The big moment: run the first lesson's program with run.py. The AI's poem prints right in your terminal. Yours will be different: the AI writes a new one each time.",
    animationTrigger: 'firstRun',
    subtitle: 'run.py loads your key from .env, then runs the program.',
  },
  // Step 17
  {
    explanation: 'Something went wrong? Read the message: run.py and check_setup.py explain problems in plain words. Click each common error to see what it means and how to fix it.',
    animationTrigger: 'errors',
    subtitle: 'An error message is a clue, not a disaster.',
  },
  // Step 18
  {
    explanation: 'Coming back another day? Setup is done, but every new terminal needs three moves: go to the folder, switch on the toolbox, run the lesson.',
    animationTrigger: 'routine',
    subtitle: "Skip step 2 and the lesson won't start: the toolbox is off.",
  },
  // Step 19
  {
    explanation: "Try it: you're at the keyboard. Pick the next command. The right order builds the workshop; the wrong order shows the real error and how to fix it.",
    animationTrigger: 'playground',
    subtitle: 'Setup simulator. Nothing is really installed.',
  },
  // Step 20
  {
    explanation: 'Spot the leak: look at each scene and decide if the key is safe or leaked. Read why after each answer.',
    animationTrigger: 'playground2',
    subtitle: 'Six scenes, one secret key.',
  },
  // Step 21
  {
    explanation: 'What you learned: (1) Python, the kit and a toolbox run the lessons. (2) Your key lives in .env, never in code or chats. (3) You pay per token from prepaid credit.',
    animationTrigger: 'takeaways',
    subtitle: 'Next: we read the poem program line by line.',
  },
];
