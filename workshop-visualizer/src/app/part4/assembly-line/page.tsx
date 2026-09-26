'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import VariantSelector from '@/components/interactive/VariantSelector';
import AssemblyLineAnim from '@/components/animations/part4/AssemblyLineAnim';
import { assemblyLineCode } from '@/data/code-snippets/part4';
import { assemblyLineTrace, assemblyLineVariants } from '@/data/traces';

export default function AssemblyLinePage() {
  return (
    <LessonLayout
      title="Code: Assembly Line (Researcher → Writer)"
      description="Two agents in a row: Rita finds the facts, then our code hands them to Wally to write up."
      animationPanel={<AssemblyLineAnim />}
      steps={assemblyLineTrace}
      variants={assemblyLineVariants}
      lessonId="assembly-line"
    >
      <TracerPanel code={assemblyLineCode} />
      <VariantSelector />
    </LessonLayout>
  );
}
