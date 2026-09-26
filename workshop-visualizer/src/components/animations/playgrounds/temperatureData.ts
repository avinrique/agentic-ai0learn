// ---------------------------------------------------------------------------
// Shared, illustrative next-word data for the Temperature lesson.
// The percentages are hand-written "chances at temperature 1" (not taken from a
// real model). We turn them into raw scores (logits = ln(p)) so that every
// other temperature is computed with the real formula: softmax(logits / T).
// ---------------------------------------------------------------------------

export interface TempToken {
  label: string;
  base: number; // chance (%) at T = 1, illustrative
  color: string;
}

export interface TempExample {
  id: string;
  chip: string;
  prompt: string;
  tokens: TempToken[];
}

const C = ['#4ade80', '#fbbf24', '#f472b6', '#a78bfa', '#4a9eff', '#22d3ee'];

export const TEMP_EXAMPLES: TempExample[] = [
  {
    id: 'france',
    chip: 'Capital of France',
    prompt: 'The capital of France is',
    tokens: [
      { label: 'Paris', base: 92, color: C[0] },
      { label: 'Lyon', base: 3, color: C[1] },
      { label: 'Marseille', base: 2, color: C[2] },
      { label: 'the', base: 1.5, color: C[3] },
      { label: 'known', base: 1.5, color: C[4] },
    ],
  },
  {
    id: 'colour',
    chip: 'Favourite colour',
    prompt: 'My favourite colour is',
    tokens: [
      { label: 'blue', base: 38, color: C[4] },
      { label: 'green', base: 24, color: C[0] },
      { label: 'red', base: 19, color: C[2] },
      { label: 'purple', base: 12, color: C[3] },
      { label: 'black', base: 7, color: C[1] },
    ],
  },
  {
    id: 'story',
    chip: 'Once upon a time',
    prompt: 'Once upon a time there was a',
    tokens: [
      { label: 'little', base: 34, color: C[0] },
      { label: 'young', base: 26, color: C[1] },
      { label: 'king', base: 18, color: C[2] },
      { label: 'girl', base: 13, color: C[3] },
      { label: 'dragon', base: 9, color: C[4] },
    ],
  },
  {
    id: 'pizza',
    chip: 'Best pizza topping',
    prompt: 'The best pizza topping is',
    tokens: [
      { label: 'pepperoni', base: 40, color: C[2] },
      { label: 'cheese', base: 26, color: C[1] },
      { label: 'mushrooms', base: 16, color: C[0] },
      { label: 'pineapple', base: 11, color: C[5] },
      { label: 'olives', base: 7, color: C[3] },
    ],
  },
];

/** Real softmax(logits / T). T = 0 means "always the top word" (greedy). Returns fractions. */
export function applyTemperature(tokens: TempToken[], T: number): number[] {
  const logits = tokens.map((t) => Math.log(t.base));
  if (T < 0.01) {
    const best = logits.indexOf(Math.max(...logits));
    return logits.map((_, i) => (i === best ? 1 : 0));
  }
  const scaled = logits.map((l) => l / T);
  const max = Math.max(...scaled);
  const exps = scaled.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

/**
 * Top-p (nucleus): keep the smallest set of most-likely words whose chances add
 * up to at least p, drop the rest, and re-share the chances among the kept words.
 */
export function applyTopP(probs: number[], p: number): { probs: number[]; kept: boolean[] } {
  const order = probs.map((v, i) => i).sort((a, b) => probs[b] - probs[a]);
  const kept = probs.map(() => false);
  let cum = 0;
  for (const i of order) {
    kept[i] = true;
    cum += probs[i];
    if (cum >= p - 1e-9) break;
  }
  const keptSum = probs.reduce((s, v, i) => (kept[i] ? s + v : s), 0);
  return { probs: probs.map((v, i) => (kept[i] ? v / keptSum : 0)), kept };
}

/** Format a fraction as a short percentage string. */
export function pct(v: number): string {
  const x = v * 100;
  if (x >= 99.95 && x < 100) return '>99.9%';
  if (x === 0) return '0%';
  if (x < 0.1) return '<0.1%';
  if (x < 10) return `${x.toFixed(1)}%`;
  return `${Math.round(x)}%`;
}
