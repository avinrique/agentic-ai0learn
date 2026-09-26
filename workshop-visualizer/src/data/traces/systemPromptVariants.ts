import { TraceVariant } from '@/stores/tracerStore';
import { systemPromptsSteps, systemPromptsTrace, SP_DEFAULT_SYSTEM } from './part1';

// Same user question every time; only the system prompt (the director's card) changes.
// inputValue is the system prompt text, so the code panel shows the real line 10.

const PIRATE_SYSTEM = 'You are a pirate. Answer everything like a pirate.';
const PIRATE_REPLY =
  "Arr, matey! A list comprehension be a quick way to fill yer treasure chest (a list) in one line!\n\nExample: doubloons = [x*2 for x in range(5)]\nThat gives ye [0, 2, 4, 6, 8]. Yo ho ho!";

const STRICT_SYSTEM = 'You are a strict bot. Answer in exactly one sentence.';
const STRICT_REPLY =
  'A list comprehension builds a list in one line, for example [x**2 for x in range(5)] gives [0, 1, 4, 9, 16].';

const HEADING_NOTE =
  'This print writes a heading. It still says "Python Tutor" because that is fixed text we typed in print(). The AI did not choose it.';

// What the same question gets with NO system message (shown in the compare strip).
export const SP_NO_SYSTEM_REPLY =
  'A list comprehension is a concise way to create a new list by applying an expression to each item in an iterable.\n\nExample: squares = [x**2 for x in range(10)]';

export const systemPromptVariants: TraceVariant[] = [
  {
    id: 'default',
    label: 'Friendly Python tutor',
    inputValue: SP_DEFAULT_SYSTEM,
    steps: systemPromptsTrace,
  },
  {
    id: 'pirate',
    label: 'Pirate',
    inputValue: PIRATE_SYSTEM,
    steps: systemPromptsSteps({
      system: PIRATE_SYSTEM,
      reply: PIRATE_REPLY,
      roleExp:
        'Here the card says "You are a pirate." The AI puts on its pirate costume. The user never sees this card, but the AI follows it for the whole chat.',
      thinkExp:
        'The model reads the pirate card first, then the question. It still explains list comprehensions, but in pirate talk.',
      headingExp: HEADING_NOTE,
      printedExp:
        'The answer is printed. Same facts, same example idea, but full of "Arr" and "matey". The role changed the style, not the topic.',
      compareExp:
        'Compare the two answers in the panel: same question, with and without the system message. Only the pirate card made it talk like a pirate.',
    }),
  },
  {
    id: 'strict',
    label: 'Strict one-sentence bot',
    inputValue: STRICT_SYSTEM,
    steps: systemPromptsSteps({
      system: STRICT_SYSTEM,
      reply: STRICT_REPLY,
      roleExp:
        'Here the card is a rule: "Answer in exactly one sentence." A system message can set limits, not only a character.',
      thinkExp:
        'The user asked for an example, but the card allows only one sentence. The model squeezes the example into that one sentence.',
      headingExp: HEADING_NOTE,
      printedExp:
        'The answer is printed: exactly one sentence. The rule on the card won over the chance to write a longer answer.',
      compareExp:
        'Compare the two answers in the panel: without the card the AI writes more. With it, the answer is cut to one sentence.',
    }),
  },
];
