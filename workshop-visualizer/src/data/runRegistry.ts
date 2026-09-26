// Every code lesson's "Run it yourself" info. The downloadable course kit
// (/code/ai-course-code.zip and /code/<file>) is generated from this list, so the
// file a student downloads is always the program the lesson showed.
//
// To add a lesson: create src/data/run/<lesson-id>.ts (export `runInfo`), then add
// ONE import line and ONE array entry below. Order doesn't matter: the list is
// sorted into course order.
import type { RunInfo } from '@/data/runInfo';
import { lessons } from '@/data/lessons';

import { runInfo as basicApi } from '@/data/run/basic-api';
import { runInfo as systemPromptsTracer } from '@/data/run/system-prompts-tracer';
import { runInfo as conversationLoop } from '@/data/run/conversation-loop';
import { runInfo as jsonOutput } from '@/data/run/json-output';
import { runInfo as fewShot } from '@/data/run/few-shot';
import { runInfo as challenge } from '@/data/run/challenge';
import { runInfo as simpleAgent } from '@/data/run/simple-agent';
import { runInfo as multiFunction } from '@/data/run/multi-function';
import { runInfo as multiTool } from '@/data/run/multi-tool';
import { runInfo as studyBuddyPro } from '@/data/run/study-buddy-pro';
import { runInfo as terminalAssistant } from '@/data/run/terminal-assistant';
import { runInfo as assemblyLine } from '@/data/run/assembly-line';
import { runInfo as writerCritic } from '@/data/run/writer-critic';
import { runInfo as bossAgent } from '@/data/run/boss-agent';

const all: RunInfo[] = [
  basicApi,
  systemPromptsTracer,
  conversationLoop,
  jsonOutput,
  fewShot,
  challenge,
  simpleAgent,
  multiFunction,
  multiTool,
  studyBuddyPro,
  terminalAssistant,
  assemblyLine,
  writerCritic,
  bossAgent,
];

const courseOrder = (id: string) => {
  const i = lessons.findIndex((l) => l.id === id);
  return i < 0 ? lessons.length : i;
};

/** All runnable lessons, in course order. */
export const runInfos: RunInfo[] = [...all].sort((a, b) => courseOrder(a.lessonId) - courseOrder(b.lessonId));

/** The run info for a lesson, or undefined if the lesson has no program to run. */
export function getRunInfo(lessonId: string): RunInfo | undefined {
  return runInfos.find((r) => r.lessonId === lessonId);
}

/** The program that goes in the kit: the full version when the lesson shortened it. */
export const kitCode = (r: RunInfo) => r.runnableCode ?? r.shownCode;
