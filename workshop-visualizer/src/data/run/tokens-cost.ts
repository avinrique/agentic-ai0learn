import type { RunInfo } from '@/data/runInfo';
import { tokensCostCode } from '@/data/code-snippets/tokens-cost';

export const runInfo: RunInfo = {
  lessonId: 'tokens-cost',
  fileName: 'part1/tokens_cost.py',
  shownCode: tokensCostCode,
  expect:
    'It prints the estimated input tokens, then a 2-sentence answer about black holes, then the exact token counts from response.usage and what the call cost (a tiny fraction of a cent). Your counts may differ a little: every answer is different.',
  tryThis: [
    'Ask for "a 300-word story about a dragon" and watch the output tokens and the cost jump.',
    'Put a long paragraph between triple quotes (question = """...""") and ask for a one-sentence summary: now input is the bigger part.',
    'Change "in 2 sentences" to "in 10 sentences" and compare completion_tokens.',
  ],
};
