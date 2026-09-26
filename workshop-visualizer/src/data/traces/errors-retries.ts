import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';
import { errorsRetriesCode } from '@/data/code-snippets/errors-retries';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 17 – When Things Go Wrong: Errors & Retries
//
// All three variants run the SAME code; only what the server does differs
// (busy twice, wrong key, no internet), so each variant walks its own real path
// through the for-loop and the except blocks.
// Builder: steps name a unique piece of code (`at`) instead of a raw line
// number, and variables carry forward automatically (`del` removes them, e.g.
// Python deletes the `as error` name when its except block ends).
// ─────────────────────────────────────────────────────────────────────────────
interface StepDef {
  at: string; // a substring that appears on exactly one line of the code
  exp: string;
  set?: Record<string, string>;
  del?: string[];
  out?: string;
  trig: string;
}

const CODE_LINES = errorsRetriesCode.split('\n');

function lineOf(marker: string): number {
  const hits = CODE_LINES.map((l, i) => (l.includes(marker) ? i + 1 : 0)).filter(Boolean);
  if (hits.length !== 1) throw new Error(`errors-retries: marker "${marker}" found on ${hits.length} lines`);
  return hits[0];
}

function buildTrace(defs: StepDef[]): TraceStep[] {
  let vars: Variable[] = [];
  return defs.map((d) => {
    vars = vars.map((v) => ({ name: v.name, value: v.value }));
    if (d.del) vars = vars.filter((v) => !d.del!.includes(v.name));
    if (d.set) {
      for (const [name, value] of Object.entries(d.set)) {
        const i = vars.findIndex((v) => v.name === name);
        if (i < 0) vars.push({ name, value, isNew: true });
        else if (vars[i].value !== value) vars[i] = { name, value, isChanged: true };
      }
    }
    return {
      lineNumber: lineOf(d.at),
      variables: vars,
      output: d.out ?? '',
      explanation: d.exp,
      animationTrigger: d.trig,
    };
  });
}

/** Python-style string value for the Variables panel (the animation JSON.parses it back). */
const str = (s: string) => JSON.stringify(s);

const QUESTION = 'Give me a fun fact about penguins.';
const TRIES = 3;
export const ER_ANSWER = 'Penguins can drink salt water! A special gland above their eyes filters out the extra salt.';
export const ER_OOPS = 'Oops! The API key was not accepted. Check OPENAI_API_KEY in your .env file.';
export const ER_SORRY = 'Sorry, the AI is not answering right now. Please try again later.';
const BUSY_NOTE = 'The server is busy (too many requests).';
const OFFLINE_NOTE = "Can't reach the server. Is the internet on?";
const RATE_LIMIT_ERROR = 'RateLimitError(429, code="rate_limit_exceeded")';

const L = {
  header: '# part1/errors_retries.py',
  importTime: 'import time',
  importOpenai: 'from openai import OpenAI',
  client: 'client = OpenAI(max_retries=0)',
  def: 'def ask(question, tries=3):',
  call: 'print(ask("Give me a fun fact',
  forLine: 'for attempt in range(1, tries + 1):',
  tryLine: 'try:',
  create: 'response = client.chat.completions.create(',
  returnText: 'return response.choices[0].message.content',
  exceptAuth: 'except AuthenticationError:',
  returnOops: 'return "Oops!',
  exceptRate: 'except RateLimitError as error:',
  quotaCheck: 'if error.code == "insufficient_quota":',
  busyNote: 'print("The server is busy',
  exceptConn: 'except APIConnectionError:',
  offlineNote: `print("Can't reach the server`,
  triesLeft: 'if attempt < tries:',
  wait: 'wait = 2 ** (attempt - 1)',
  waitNote: 'print(f"Waiting',
  sleep: 'time.sleep(wait)',
  giveUp: 'return "Sorry',
};

/** What the server does on each attempt. */
type Outcome = 'busy' | 'badkey' | 'offline' | 'ok';

function errorsRetriesSteps(outcomes: Outcome[]): TraceStep[] {
  const defs: StepDef[] = [
    {
      at: L.header,
      trig: 'intro',
      exp: "What's new: things go wrong on the internet. Today our program catches errors, waits and tries again, instead of crashing. Here are four troubles a request can meet.",
    },
    {
      at: L.importTime,
      trig: 'import-time',
      set: { time: "<module 'time'>" },
      exp: "import time gives us time.sleep(), a pause button for our program. We'll use it to wait between tries.",
    },
    {
      at: L.importOpenai,
      trig: 'error-types',
      set: {
        OpenAI: '<class OpenAI>',
        RateLimitError: '<class RateLimitError>',
        APIConnectionError: '<class APIConnectionError>',
        AuthenticationError: '<class AuthenticationError>',
      },
      exp: 'Besides OpenAI, we import three error types. Each one is a name for a kind of trouble: too busy, no connection, or a bad key.',
    },
    {
      at: L.client,
      trig: 'client',
      set: { client: '<OpenAI client, max_retries=0>' },
      exp: 'Secret: the SDK already retries some errors twice by itself (max_retries=2). We set it to 0 so we can watch every retry by hand.',
    },
    {
      at: L.def,
      trig: 'def',
      set: { ask: '<function ask>' },
      exp: 'ask() sends one question and returns the answer text. tries=3 means it gets at most 3 attempts.',
    },
    {
      at: L.call,
      trig: 'call',
      exp: 'The program really starts here: we call ask() with our penguin question, and Python jumps up into the function.',
    },
  ];

  const first = outcomes[0];
  for (let attempt = 1; attempt <= outcomes.length; attempt++) {
    const outcome = outcomes[attempt - 1];
    const last = attempt === TRIES;

    defs.push({
      at: L.forLine,
      trig: 'attempt',
      set: attempt === 1 ? { question: str(QUESTION), tries: String(TRIES), attempt: '1' } : { attempt: String(attempt) },
      exp:
        attempt === 1
          ? 'Attempt 1 of 3. range(1, tries + 1) counts 1, 2, 3, so the loop runs at most three times.'
          : last
            ? 'Back to the top of the loop: attempt 3 of 3, our last chance.'
            : `Back to the top of the loop: attempt ${attempt} of 3. Same question, same safety net.`,
    });

    if (attempt === 1) {
      defs.push(
        {
          at: L.tryLine,
          trig: 'crash',
          exp: 'First, a warning: without try, one error crashes the whole program with a scary red traceback like this. Nothing after it runs.',
        },
        {
          at: L.tryLine,
          trig: 'nets',
          exp: 'try is our safety net. If something inside fails, Python drops to the except net that matches that error, instead of crashing.',
        },
      );
    }

    defs.push({
      at: L.create,
      trig: 'send',
      exp:
        attempt === 1
          ? 'The delivery robot carries our question to the OpenAI server.'
          : attempt === 2
            ? 'The robot carries the same question to the server again.'
            : 'The robot sets off a third time.',
    });

    if (outcome === 'ok') {
      defs.push(
        {
          at: L.create,
          trig: 'reply',
          set: { response: '<ChatCompletion>' },
          exp: 'This time the server has room: 200 OK! A reply comes back. No error, so all the except nets are skipped.',
        },
        {
          at: L.returnText,
          trig: 'return-answer',
          exp: 'return hands back the reply text and leaves the function right away, loop and all.',
        },
        {
          at: L.call,
          trig: 'print-answer',
          del: ['question', 'tries', 'attempt', 'wait', 'response'],
          out: ER_ANSWER,
          exp:
            attempt === 1
              ? 'print shows the answer. No trouble this time, so the nets were never needed.'
              : 'print shows the answer. The user saw two calm notes and then a fun fact: no scary traceback.',
        },
      );
      break;
    }

    if (outcome === 'badkey') {
      defs.push(
        {
          at: L.create,
          trig: 'rejected',
          exp: "The server checks the key on our request. It's wrong! It answers 401, and Python raises an AuthenticationError.",
        },
        {
          at: L.exceptAuth,
          trig: 'caught',
          exp: 'The first net catches it: no crash! But a wrong key stays wrong, so retrying would only fail again.',
        },
        {
          at: L.returnOops,
          trig: 'return-oops',
          exp: 'So we return a friendly tip right away. return leaves the function: tries 2 and 3 never happen.',
        },
        {
          at: L.call,
          trig: 'print-answer',
          del: ['question', 'tries', 'attempt'],
          out: ER_OOPS,
          exp: 'print shows a message the user can act on, not a scary 401 traceback. The real fix: put the right key in .env.',
        },
      );
      break;
    }

    if (outcome === 'busy') {
      defs.push(
        {
          at: L.create,
          trig: 'busy',
          exp:
            attempt === 1
              ? 'The server holds up a busy sign: 429, too many requests. Python raises a RateLimitError and skips the rest of the try block.'
              : 'Still busy! Another 429 RateLimitError.',
        },
        {
          at: L.exceptRate,
          trig: 'caught',
          set: { error: RATE_LIMIT_ERROR },
          exp:
            attempt === 1
              ? "Python checks the nets from top to bottom. Not a key problem... the RateLimitError net catches it! No crash. The error is saved in error."
              : 'Caught by the same RateLimitError net. Still no crash.',
        },
        {
          at: L.quotaCheck,
          trig: 'quota-check',
          exp:
            attempt === 1
              ? 'A 429 can mean two things. error.code tells them apart: "insufficient_quota" means no credit left, so retrying is pointless. Ours is "rate_limit_exceeded": just busy.'
              : 'error.code is "rate_limit_exceeded" again, not "insufficient_quota". Just busy, so a retry can still work.',
        },
        {
          at: L.busyNote,
          trig: 'note',
          out: BUSY_NOTE,
          exp:
            attempt === 1
              ? "Just busy, so it's worth waiting and trying again. We print a calm note for the user."
              : 'Print the calm note again.',
        },
      );
    }

    if (outcome === 'offline') {
      defs.push(
        {
          at: L.create,
          trig: 'offline',
          exp:
            attempt === 1
              ? "The robot can't even reach the server: the road is cut. No internet! Python raises an APIConnectionError."
              : 'The road is still cut. Another APIConnectionError.',
        },
        {
          at: L.exceptConn,
          trig: 'caught',
          exp:
            attempt === 1
              ? "Python checks the nets from top to bottom. The APIConnectionError net catches it (timeouts too). The internet may come back, so it's worth retrying."
              : 'Caught by the same APIConnectionError net. Still no crash.',
        },
        {
          at: L.offlineNote,
          trig: 'note',
          out: OFFLINE_NOTE,
          exp: attempt === 1 ? 'We print a calm note so the user knows what is going on.' : 'Print the calm note again.',
        },
      );
    }

    // Only the `as error` except deletes its name when it ends.
    const leaveExcept = outcome === 'busy' ? ['error'] : undefined;

    if (last) {
      defs.push(
        {
          at: L.triesLeft,
          trig: 'no-tries-left',
          del: leaveExcept,
          exp: "Tries left? 3 < 3 is False. So we skip the wait: there's no point waiting when no try comes next.",
        },
        {
          at: L.forLine,
          trig: 'loop-done',
          exp: 'Back at the for line: range(1, 4) has no numbers left, so the loop ends.',
        },
        {
          at: L.giveUp,
          trig: 'give-up',
          exp: 'Give up politely: return a kind "try again later" message instead of crashing or trying forever.',
        },
        {
          at: L.call,
          trig: 'print-answer',
          del: ['question', 'tries', 'attempt', 'wait'],
          out: ER_SORRY,
          exp:
            first === 'offline'
              ? 'The user sees calm notes and a polite goodbye, not a crash. Once the Wi-Fi is back, running it again will work.'
              : 'The user sees calm notes and a polite goodbye, not a crash.',
        },
      );
      break;
    }

    const wait = 2 ** (attempt - 1);
    defs.push(
      {
        at: L.triesLeft,
        trig: 'tries-left',
        del: leaveExcept,
        exp:
          attempt === 1
            ? 'Tries left? 1 < 3: yes. We only reach this line after a caught error, because a good reply would already have returned.'
            : `Tries left? ${attempt} < 3: yes, one more.`,
      },
      {
        at: L.wait,
        trig: 'backoff',
        set: { wait: String(wait) },
        exp:
          attempt === 1
            ? 'Exponential back-off: wait 1s, then 2s, then 4s, doubling each time. Like giving a crowded shop more room before knocking again.'
            : `The wait doubles: 2 ** (${attempt} - 1) = ${wait} seconds. Even more room for the server.`,
      },
      {
        at: L.waitNote,
        trig: 'wait-msg',
        out: `Waiting ${wait}s before try ${attempt + 1}...`,
        exp:
          attempt === 1
            ? "Tell the user what's happening, so a pause doesn't look like a frozen program."
            : 'Tell the user about the longer wait.',
      },
      {
        at: L.sleep,
        trig: 'sleep',
        exp: `time.sleep(${wait}) pauses the whole program for ${wait} second${wait === 1 ? '' : 's'}. Watch the timer run down.`,
      },
    );
  }

  defs.push({
    at: L.call,
    trig: 'recap',
    exp: 'What you learned: 1) try/except catches errors instead of crashing; 2) retry only what can fix itself, never a bad key or no credit; 3) back off 1s, 2s, 4s, then give up politely.',
  });

  return buildTrace(defs);
}

export const errorsRetriesTrace = errorsRetriesSteps(['busy', 'busy', 'ok']);

// The variants differ in what the server does, not in the code, so inputValue is
// a token that never appears in the code (the code panel stays unchanged).
export const errorsRetriesVariants: TraceVariant[] = [
  { id: 'default', label: 'Busy twice, then success', inputValue: '<<errors-retries:busy-twice>>', steps: errorsRetriesTrace },
  { id: 'variant2', label: 'Wrong API key', inputValue: '<<errors-retries:bad-key>>', steps: errorsRetriesSteps(['badkey']) },
  { id: 'variant3', label: 'No internet', inputValue: '<<errors-retries:offline>>', steps: errorsRetriesSteps(['offline', 'offline', 'offline']) },
];
