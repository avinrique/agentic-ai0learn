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
