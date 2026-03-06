'use client';
import ConceptLayout from '@/components/layout/ConceptLayout';
import LLMPipelineAnim from '@/components/animations/LLMPipelineAnim';
import { whatIsLLMSteps } from '@/data/concept-steps';

export default function WhatIsLLMPage() {
  return (
    <ConceptLayout
      title="What is an LLM?"
      description="How Large Language Models predict the next token."
      steps={whatIsLLMSteps}
      animationPanel={<LLMPipelineAnim />}
      lessonId="what-is-llm"
    />
  );
}
