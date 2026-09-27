// Every code lesson's "Run this yourself" info, in course order. The run box
// (src/components/ui/RunItModal.tsx) and the downloadable course kit
// (src/lib/courseKit.ts) are both built from this list.
// Adding a code lesson: create src/data/run/<id>.ts, then add one import and one entry.
import type { RunInfo } from '@/data/runInfo';
import { runInfo as basicApi } from '@/data/run/basic-api';
import { runInfo as streaming } from '@/data/run/streaming';
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
import { runInfo as terminalAssistant } from '@/data/run/terminal-assistant';
import { runInfo as assemblyLine } from '@/data/run/assembly-line';
import { runInfo as writerCritic } from '@/data/run/writer-critic';
import { runInfo as bossAgent } from '@/data/run/boss-agent';
import { runInfo as guardrails } from '@/data/run/guardrails';

export const runInfos: RunInfo[] = [
  basicApi,
  streaming,
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
  terminalAssistant,
  assemblyLine,
  writerCritic,
  bossAgent,
  guardrails,
];

export function getRunInfo(lessonId: string): RunInfo | undefined {
  return runInfos.find((r) => r.lessonId === lessonId);
}

/** The program that goes into the kit: the full version if the lesson shortened it. */
export function kitCode(info: RunInfo): string {
  return info.runnableCode ?? info.shownCode;
}
