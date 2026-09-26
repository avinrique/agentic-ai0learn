import type { RunInfo } from '@/data/runInfo';
import { conversationLoopCode } from '@/data/code-snippets';

export const runInfo: RunInfo = {
  lessonId: 'conversation-loop',
  fileName: 'part1/conversation_loop.py',
  shownCode: conversationLoopCode,
  needsInput: true,
  expect:
    'It prints "Chat started!" and waits for you. Type a question and press Enter to get an answer; type quit to stop.',
  tryThis: [
    'Say "Hi, I\'m Priya" (use your name), then ask "What\'s my name?". It remembers, because the whole chat is sent every time.',
    'Change the system prompt to "You are a helpful assistant who talks like a robot."',
    'Add print(len(messages)) at the end of the loop to watch the message list grow.',
  ],
};
