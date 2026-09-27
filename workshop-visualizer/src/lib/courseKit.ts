// The downloadable course code kit, generated from the run registry so the files a
// student downloads are always the programs the lessons show. Served by
// src/app/code/ai-course-code.zip/route.ts (everything, zipped) and
// src/app/code/[...path]/route.ts (one file at a time).
import { runInfos, kitCode } from '@/data/runRegistry';
import { lessons, partLabels } from '@/data/lessons';
import { extraFiles } from '@/data/kit/extraFiles';
import { checkSetupPy, envExample, gitignore, requirementsTxt, runPy } from '@/data/kit/scripts';

export interface KitFile {
  /** Path inside the kit folder, e.g. 'part1/basic_api.py'. */
  path: string;
  content: string;
}

function readme(): string {
  const byPart = new Map<number, string[]>();
  for (const r of runInfos) {
    const lesson = lessons.find((l) => l.id === r.lessonId);
    const part = lesson?.part ?? 0;
    const note = r.needsInput ? ' (asks you to type)' : '';
    const line = `- \`${r.fileName}\`: ${lesson?.title ?? r.lessonId}${note}`;
    byPart.set(part, [...(byPart.get(part) ?? []), line]);
  }
  const programList = Array.from(byPart.entries())
    .sort(([a], [b]) => a - b)
    .map(([part, lines]) => `### Part ${part}: ${partLabels[part] ?? ''}\n\n${lines.join('\n')}`)
    .join('\n\n');

  return `# AI Course Code

Every program from the course, ready to run on your own computer.
Each file is the exact program you watched in a lesson.

**First time?** Do the "Get Set Up" lesson first (Part 1). It walks through every step below.

> **On a Mac**, type \`python3\` instead of \`python\` until your toolbox is switched on (step 3).
> **On Windows**, if \`python\` isn't found, try \`py\`.

## 1. Check your Python

You need Python 3.10 or newer:

    python --version

No Python yet? Get it from https://www.python.org/downloads/

## 2. Open a terminal in this folder

This folder is called \`ai-course\` (the one with this README in it). Unzip it first if you haven't.

## 3. Make a toolbox (a virtual environment)

The toolbox is a private folder called \`.venv\` that holds this course's libraries, so they don't mix with anything else on your computer.

    python -m venv .venv

Now switch it on:

- **Mac / Linux:** \`source .venv/bin/activate\`
- **Windows:** \`.venv\\Scripts\\activate\`

You'll see \`(.venv)\` at the start of the line. Switch it on again every time you open a new terminal.
(Windows PowerShell says "running scripts is disabled"? Use Command Prompt instead.)

## 4. Install the libraries

    pip install -r requirements.txt

This installs three libraries: \`openai\`, \`python-dotenv\` and \`tiktoken\`.

## 5. Add your API key

Copy \`.env.example\` to a new file called \`.env\`:

- **Mac / Linux:** \`cp .env.example .env\`
- **Windows:** \`copy .env.example .env\`

Open \`.env\` in a text editor and paste your key after the \`=\` sign, like \`OPENAI_API_KEY=sk-...\`

Keep \`.env\` secret: never share it, screenshot it or upload it. (The \`.gitignore\` file keeps it out of git.)

## 6. Check that everything works

    python check_setup.py

It checks Python, the libraries and your key, then asks before making one tiny test call.
✓ lines mean ready. A ✗ line tells you what's wrong, and the \`Fix:\` line under it tells you what to do.

## 7. Run your first program

    python run.py part1/basic_api.py

\`run.py\` loads your key from \`.env\` and runs the program from inside its own folder.
Run any other program the same way: \`python run.py <folder>/<file>.py\`

## All the programs

${programList}

## Tips

- Every run makes a real call to OpenAI, so it costs a tiny bit of money. Check the prices at https://openai.com/api/pricing
- The AI's answers change every time. That's normal!
- Change the code and run it again. Each lesson's "Run it yourself" box has ideas to try.
- To stop a program that's waiting for you to type, press Ctrl+C.
- Something wrong? Run \`python check_setup.py\`. It explains the most common problems.
`;
}

/** Every file in the kit (paths relative to the kit folder), in a stable order. */
export function courseKitFiles(): KitFile[] {
  const files: KitFile[] = [
    { path: 'README.md', content: readme() },
    { path: 'requirements.txt', content: requirementsTxt },
    { path: '.env.example', content: envExample },
    { path: '.gitignore', content: gitignore },
    { path: 'run.py', content: runPy },
    { path: 'check_setup.py', content: checkSetupPy },
  ];
  const seen = new Set(files.map((f) => f.path));
  const add = (path: string, content: string) => {
    if (seen.has(path)) return;
    seen.add(path);
    files.push({ path, content });
  };
  for (const r of runInfos) {
    add(r.fileName, kitCode(r).endsWith('\n') ? kitCode(r) : kitCode(r) + '\n');
    for (const extra of r.extraFiles ?? []) {
      const content = extraFiles[extra];
      if (content === undefined) {
        throw new Error(`course kit: ${r.lessonId} needs ${extra}; add its text to src/data/kit/extraFiles.ts`);
      }
      add(extra, content);
    }
  }
  return files;
}

/** Files that can also be downloaded one by one (not the hidden dotfiles). */
export function singleKitFiles(): KitFile[] {
  return courseKitFiles().filter((f) => !f.path.split('/').some((part) => part.startsWith('.')));
}
