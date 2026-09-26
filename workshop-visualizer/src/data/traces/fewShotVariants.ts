import { TraceVariant } from '@/stores/tracerStore';
import { fewShotSteps, fewShotTrace, FS_DEFAULT_QUESTION } from './part1';

// The task and the two examples stay the same; each variant changes the real
// question (inputValue), which appears on lines 19 and 27 of the code.

const SARCASM_Q = 'Oh great, it broke after one day.';
const PRAISE_Q = "Not bad at all, I'd buy it again.";

// A typical reply to the same question with NO examples (zero-shot), for the
// compare strip. Without examples the format can drift.
export const fewShotZeroShotReplies: Record<string, string> = {
  default: 'The sentiment is mixed, leaning Neutral.',
  sarcasm: "Negative. The word 'great' is used sarcastically here.",
  praise: "Positive (the phrase 'not bad' is used as praise).",
};

export const fewShotVariants: TraceVariant[] = [
  {
    id: 'default',
    label: "It's okay, not great.",
    inputValue: FS_DEFAULT_QUESTION,
    steps: fewShotTrace,
  },
  {
    id: 'sarcasm',
    label: 'Oh great, it broke after one day.',
    inputValue: SARCASM_Q,
    steps: fewShotSteps({
      question: SARCASM_Q,
      label: 'Negative',
      realExp:
        'The real question is "Oh great, it broke after one day." It contains the happy word "great", but it is really a complaint.',
      thinkExp:
        'The model reads the whole sentence, not just single words. "Broke after one day" is bad news, so it follows the "Negative" example.',
      replyExp:
        'The reply arrives: "Negative". The word "great" did not fool it, and it still answered in one word like our examples.',
      compareExp:
        'Compare in the panel: with no examples the AI may explain the sarcasm in a sentence. With examples it gives just the label.',
    }),
  },
  {
    id: 'praise',
    label: "Not bad at all, I'd buy it again.",
    inputValue: PRAISE_Q,
    steps: fewShotSteps({
      question: PRAISE_Q,
      label: 'Positive',
      realExp:
        'The real question is "Not bad at all, I\'d buy it again." It uses the word "bad", but the meaning is praise.',
      thinkExp:
        'The model sees that "I\'d buy it again" means the person is happy, like the "Positive" example.',
      replyExp:
        'The reply arrives: "Positive". One word, exactly the format our examples showed.',
      compareExp:
        'Compare in the panel: with no examples the AI may add a note in brackets. With examples it copies the clean one-word format.',
    }),
  },
];
