export interface Lesson {
  id: string;
  title: string;
  shortTitle: string;
  route: string;
  part: number;
  description: string;
  animations: string[];
  type: 'concept' | 'tracer';
}

export const lessons: Lesson[] = [
  // PART 0: Foundations (concept lessons)
  {
    id: 'what-is-llm',
    title: 'What is an LLM?',
    shortTitle: 'What is an LLM?',
    route: '/part0/what-is-llm',
    part: 0,
    description: 'How Large Language Models predict the next token.',
    animations: ['LLMPipelineAnim'],
    type: 'concept',
  },
  {
    id: 'context-memory',
    title: 'Context & Memory',
    shortTitle: 'Context & Memory',
    route: '/part0/context-memory',
    part: 0,
    description: "LLMs don't remember — and the system prompt is just message[0].",
    animations: ['ContextMemoryAnim'],
    type: 'concept',
  },
  {
    id: 'temperature',
    title: 'Temperature & Creativity',
    shortTitle: 'Temperature',
    route: '/part0/temperature',
    part: 0,
    description: 'How one number controls whether the AI is a robot or a poet.',
    animations: ['TemperatureAnim'],
    type: 'concept',
  },
  {
    id: 'hallucination',
    title: 'Hallucination',
    shortTitle: 'Hallucination',
    route: '/part0/hallucination',
    part: 0,
    description: "When AI confidently says things that aren't true — and how to fight it.",
    animations: ['HallucinationAnim'],
    type: 'concept',
  },
  {
    id: 'rag-and-agents',
    title: 'RAG & Agents',
    shortTitle: 'RAG & Agents',
    route: '/part0/rag-and-agents',
    part: 0,
    description: 'Two patterns that make LLMs truly powerful.',
    animations: ['RagAgentsAnim'],
    type: 'concept',
  },
  // PART 1: API Basics (tracer lessons)
  {
    id: 'basic-api',
    title: 'Basic API Call',
    shortTitle: 'Basic API',
    route: '/part1/basic-api',
    part: 1,
    description: 'Send your first prompt to OpenAI and get a response back.',
    animations: ['ApiCallFlow'],
    type: 'tracer',
  },
  {
    id: 'system-prompts',
    title: 'System Prompts & Role Playing',
    shortTitle: 'System Prompts',
    route: '/part1/system-prompts',
    part: 1,
    description: 'Use system messages to control the AI\'s personality and behavior.',
    animations: ['MessageArrayBuilder'],
    type: 'tracer',
  },
  {
    id: 'json-output',
    title: 'JSON Output',
    shortTitle: 'JSON Output',
    route: '/part1/json-output',
    part: 1,
    description: 'Force the AI to respond in structured JSON format.',
    animations: ['ApiCallFlow', 'JsonParseAnim'],
    type: 'tracer',
  },
  {
    id: 'few-shot',
    title: 'Few-Shot Learning',
    shortTitle: 'Few-Shot',
    route: '/part1/few-shot',
    part: 1,
    description: 'Teach the AI new tasks by providing examples in the conversation.',
    animations: ['FewShotAnim'],
    type: 'tracer',
  },
  {
    id: 'challenge',
    title: 'Challenge: Restaurant Recommender',
    shortTitle: 'Challenge',
    route: '/part1/challenge',
    part: 1,
    description: 'Combine all Part 1 skills to build a restaurant recommender.',
    animations: ['ApiCallFlow', 'JsonParseAnim', 'MessageArrayBuilder'],
    type: 'tracer',
  },
  // PART 2: Agents
  {
    id: 'simple-agent',
    title: 'Simple Agent: Calculator',
    shortTitle: 'Simple Agent',
    route: '/part2/simple-agent',
    part: 2,
    description: 'Build your first agent with a single tool — the add function.',
    animations: ['AgentLoopDiagram', 'ToolSelectionAnim'],
    type: 'tracer',
  },
  {
    id: 'multi-function',
    title: 'Multi-Function Agent: Math Tutor',
    shortTitle: 'Math Tutor',
    route: '/part2/multi-function',
    part: 2,
    description: 'An agent with 4 tools and a loop that cycles multiple times.',
    animations: ['AgentLoopDiagram', 'ToolSelectionAnim'],
    type: 'tracer',
  },
  // PART 3: Advanced Agents
  {
    id: 'multi-tool',
    title: 'Multi-Tool Agent: Study Buddy',
    shortTitle: 'Study Buddy',
    route: '/part3/multi-tool',
    part: 3,
    description: 'An agent with calculator + knowledge lookup tools.',
    animations: ['AgentLoopDiagram', 'ToolSelectionAnim'],
    type: 'tracer',
  },
  {
    id: 'study-buddy-pro',
    title: 'Study Buddy Pro',
    shortTitle: 'Buddy Pro',
    route: '/part3/study-buddy-pro',
    part: 3,
    description: 'An advanced agent with 7 tools including percentage and simple interest.',
    animations: ['AgentLoopDiagram', 'ToolSelectionAnim'],
    type: 'tracer',
  },
  {
    id: 'terminal-assistant',
    title: 'Terminal Assistant',
    shortTitle: 'Terminal',
    route: '/part3/terminal-assistant',
    part: 3,
    description: 'A fully autonomous agent that can run commands, read, and write files.',
    animations: ['AgentLoopDiagram', 'ToolSelectionAnim'],
    type: 'tracer',
  },
];

export const partLabels: Record<number, string> = {
  0: 'Foundations',
  1: 'API Basics',
  2: 'Agents',
  3: 'Advanced Agents',
};
