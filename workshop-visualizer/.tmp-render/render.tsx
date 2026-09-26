import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useTracerStore } from '@/stores/tracerStore';
import ConversationLoopAnim from '@/components/animations/ConversationLoopAnim';
import ChallengePipelineAnim from '@/components/animations/ChallengePipelineAnim';
import { conversationLoopVariants, challengeVariants } from '@/data/traces';
for (const [name, C, vs] of [['conv', ConversationLoopAnim, conversationLoopVariants], ['ch', ChallengePipelineAnim, challengeVariants]] as const) {
  for (const v of vs as any[]) {
    v.steps.forEach((_: any, i: number) => {
      useTracerStore.setState({ steps: v.steps, currentStep: i });
      const html = renderToStaticMarkup(React.createElement(C as any));
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      if (process.argv[2] === name && (process.argv[3] ?? 'default') === v.id) console.log(i, text.slice(0, 400));
    });
  }
}
console.log('ok');
