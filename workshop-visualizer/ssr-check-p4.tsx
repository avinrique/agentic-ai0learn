import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useTracerStore } from '@/stores/tracerStore';
import AssemblyLineAnim from '@/components/animations/part4/AssemblyLineAnim';
import WriterCriticAnim from '@/components/animations/part4/WriterCriticAnim';
import { assemblyLineVariants, writerCriticVariants } from '@/data/traces';
(useTracerStore as any).getInitialState = () => useTracerStore.getState();
let n = 0;
for (const [name, Comp, vars] of [['AL', AssemblyLineAnim, assemblyLineVariants], ['WC', WriterCriticAnim, writerCriticVariants]] as const) {
  for (const v of vars) {
    v.steps.forEach((_, i) => {
      useTracerStore.setState({ steps: v.steps, variants: vars as any, activeVariantId: v.id, currentStep: i });
      const html = renderToStaticMarkup(React.createElement(Comp as any));
      if (!html || html.length < 200) throw new Error(`${name} ${v.id} step ${i} empty`);
      if (process.argv[2] === `${name}-${v.id}-${i}`) console.log(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
      n++;
    });
  }
}
console.log('rendered', n, 'steps OK');
