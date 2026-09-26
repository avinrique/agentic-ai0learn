import type { RunInfo } from '@/data/runInfo';
import { terminalAssistantCode } from '@/data/code-snippets';
import { fillIn, toolEntry } from '@/data/runnable';

// The lesson writes "parameters": {...} to keep the list short. In Python that is a set,
// which the API can't read, so the download gets the full parameter lists.
const shortTool = (name: string, description: string) =>
  `    {"type": "function", "function": {"name": "${name}", "description": "${description}", "parameters": {...}}},`;

const RUN = 'Run a shell command in the terminal (e.g. ls, pwd, mkdir) and return the output.';
const READ = 'Read the contents of a file at the given path.';
const WRITE = 'Write content to a file. Creates or overwrites it.';

export const runInfo: RunInfo = {
  lessonId: 'terminal-assistant',
  fileName: 'part3/terminal_assistant.py',
  shownCode: terminalAssistantCode,
  runnableCode: fillIn(terminalAssistantCode, [
    [
      '# --- Tools list (the menu for the AI; {...} = parameters shortened) ---',
      '# --- Tools list (the menu for the AI) ---',
    ],
    [shortTool('run_command', RUN), toolEntry('run_command', RUN, [['command', 'string', 'The shell command to run']])],
    [shortTool('read_file', READ), toolEntry('read_file', READ, [['path', 'string', 'The path to the file to read']])],
    [
      shortTool('write_file', WRITE),
      toolEntry('write_file', WRITE, [
        ['path', 'string', 'The path to the file to write'],
        ['content', 'string', 'The text to put in the file'],
      ]),
    ],
  ]),
  needsInput: true,
  extraFiles: ['part3/notes.txt'],
  expect:
    'Ask "What files are in this folder?": you\'ll see [Using tool: run_command], then the files in the part3 folder. Type exit to stop. The commands really run, so only ask for safe things!',
  tryThis: [
    'Ask "Show me what\'s in notes.txt" and watch it pick read_file.',
    'Ask "Create hello.txt that says Hello, world!", then look in the part3 folder.',
    'Change the system prompt so it answers like a cheerful robot.',
  ],
};
