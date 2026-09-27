// Every code lesson's "Run it yourself" info, in course order. The course code kit
// (src/lib/courseKit.ts) is built from this list, so a lesson listed here is also a
// program in the download. New code lesson: one import + one entry below.
import type { RunInfo } from '@/data/runInfo';
import { runInfo as basicApi } from '@/data/run/basic-api';
import { runInfo as streaming } from '@/data/run/streaming';
import { runInfo as tokensCost } from '@/data/run/tokens-cost';
import { runInfo as systemPromptsTracer } from '@/data/run/system-prompts-tracer';
import { runInfo as conversationLoop } from '@/data/run/conversation-loop';
import { runInfo as jsonOutput } from '@/data/run/json-output';
import { runInfo as fewShot } from '@/data/run/few-shot';
import { runInfo as errorsRetries } from '@/data/run/errors-retries';
import { runInfo as challenge } from '@/data/run/challenge';
import { runInfo as simpleAgent } from '@/data/run/simple-agent';
import { runInfo as multiFunction } from '@/data/run/multi-function';
import { runInfo as multiTool } from '@/data/run/multi-tool';
import { runInfo as studyBuddyPro } from '@/data/run/study-buddy-pro';
import { runInfo as ragCode } from '@/data/run/rag-code';
import { runInfo as terminalAssistant } from '@/data/run/terminal-assistant';
import { runInfo as testingAgents } from '@/data/run/testing-agents';
import { runInfo as assemblyLine } from '@/data/run/assembly-line';
import { runInfo as writerCritic } from '@/data/run/writer-critic';
import { runInfo as bossAgent } from '@/data/run/boss-agent';
import { runInfo as parallelAgents } from '@/data/run/parallel-agents';
import { runInfo as sharedMemory } from '@/data/run/shared-memory';
import { runInfo as guardrails } from '@/data/run/guardrails';

export const runInfos: RunInfo[] = [
  basicApi,
  streaming,
  tokensCost,
  systemPromptsTracer,
  conversationLoop,
  jsonOutput,
  fewShot,
  errorsRetries,
  challenge,
  simpleAgent,
  multiFunction,
  multiTool,
  studyBuddyPro,
  ragCode,
  terminalAssistant,
  testingAgents,
  assemblyLine,
  writerCritic,
  bossAgent,
  parallelAgents,
  sharedMemory,
  guardrails,
];

const byLesson = new Map(runInfos.map((r) => [r.lessonId, r]));

/** The run info for a lesson, or undefined if the lesson has no program to run. */
export function getRunInfo(lessonId: string): RunInfo | undefined {
  return byLesson.get(lessonId);
}

/** The program that goes in the download: the full version if the lesson shortened it. */
export function kitCode(r: RunInfo): string {
  return r.runnableCode ?? r.shownCode;
}
