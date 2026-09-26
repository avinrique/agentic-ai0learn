// Re-export all traces from split files
export {
  basicApiTrace,
  systemPromptsTrace,
  conversationLoopTrace,
  conversationLoopVariants,
  jsonOutputTrace,
  fewShotTrace,
  challengeTrace,
} from './part1';

export {
  simpleAgentTrace,
  simpleAgentVariants,
  multiFunctionTrace,
  multiFunctionVariants,
} from './part2';

export {
  multiToolTrace,
  studyBuddyProTrace,
  terminalAssistantTrace,
} from './part3';

export { challengeVariants } from './challengeVariants';
export { basicApiVariants } from './basicApiVariants';
export { jsonOutputVariants } from './jsonVariants';
export { systemPromptVariants, SP_NO_SYSTEM_REPLY } from './systemPromptVariants';
export { fewShotVariants, fewShotZeroShotReplies } from './fewShotVariants';
