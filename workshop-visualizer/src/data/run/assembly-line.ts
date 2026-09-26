import type { RunInfo } from '@/data/runInfo';
import { assemblyLineCode } from '@/data/code-snippets/part4';

export const runInfo: RunInfo = {
  lessonId: 'assembly-line',
  fileName: 'part4/assembly_line.py',
  shownCode: assemblyLineCode,
  expect:
    "Rita's 3 facts about volcanoes come first, then Wally's fun 4-sentence paragraph built from those facts.",
  tryThis: [
    'Change topic = "volcanoes" to octopuses, the moon, or your favourite thing.',
    "Change Wally's job card so he writes a short poem instead of a paragraph.",
    'Stretch: add a third station, a translator agent that turns the paragraph into Spanish.',
  ],
};
