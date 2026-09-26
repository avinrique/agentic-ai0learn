import { TraceVariant } from '@/stores/tracerStore';
import { CH_SYSTEM, CHALLENGE_DEFAULT, ChallengeConfig, challengeSteps, challengeTrace } from './part1';

// ─────────────────────────────────────────────────────────────────────────────
// Challenge: Restaurant Recommender – "Try different inputs"
// The city appears twice in the code (the print on line 7 and the prompt on
// line 12). CodePanel swaps ONE substring, so inputValue spans from the print's
// city to the prompt's task line. Everything in between is copied unchanged,
// so the line count (and every trace line number) stays the same.
// ─────────────────────────────────────────────────────────────────────────────
export function challengeInputValue(c: ChallengeConfig): string {
  return [
    `${c.city})...")`,
    '',
    `system_prompt = "${CH_SYSTEM}"`,
    '',
    'user_prompt = """',
    `Find 3 great ${c.what} in ${c.city}, India.`,
  ].join('\n');
}

const MUMBAI_CAFES: ChallengeConfig = {
  city: 'Mumbai',
  what: 'cafes for working',
  recs: [
    { name: 'Kala Ghoda Café', reason: 'Calm, airy room in Fort with good coffee and space to open a laptop.' },
    { name: 'Subko Coffee Roasters', reason: 'Specialty coffee in Bandra with big tables and a relaxed vibe.' },
    { name: 'Blue Tokai Coffee Roasters', reason: 'Reliable Wi-Fi, power sockets and freshly roasted coffee.' },
  ],
  thinkExp:
    'Same code, new request: the model picks 3 cafes that are good for working, in the exact same JSON shape.',
};

const DELHI_STREET_FOOD: ChallengeConfig = {
  city: 'Delhi',
  what: 'street food spots',
  recs: [
    { name: 'Natraj Dahi Bhalle Wala', reason: 'A tiny Chandni Chowk stall famous for soft dahi bhalle and aloo tikki.' },
    { name: 'Paranthe Wali Gali', reason: 'A whole lane of stuffed, deep-fried parathas served with chutneys.' },
    { name: 'Kuremal Mohan Lal Kulfi Wale', reason: 'Fruit-stuffed kulfi, a sweet ending after a street food walk.' },
  ],
  thinkExp:
    'The model picks 3 street food spots. Notice the keys are still "name" and "reason", because our prompt asked for that shape.',
};

export const challengeVariants: TraceVariant[] = [
  {
    id: 'default',
    label: 'South Indian in Bangalore',
    inputValue: challengeInputValue(CHALLENGE_DEFAULT),
    steps: challengeTrace,
  },
  {
    id: 'mumbai-cafes',
    label: 'Cafes for working in Mumbai',
    inputValue: challengeInputValue(MUMBAI_CAFES),
    steps: challengeSteps(MUMBAI_CAFES),
  },
  {
    id: 'delhi-street-food',
    label: 'Street food in Delhi',
    inputValue: challengeInputValue(DELHI_STREET_FOOD),
    steps: challengeSteps(DELHI_STREET_FOOD),
  },
];
