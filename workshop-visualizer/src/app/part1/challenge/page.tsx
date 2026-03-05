'use client';
import LessonLayout from '@/components/layout/LessonLayout';
import TracerPanel from '@/components/tracer/TracerPanel';
import MessageArrayBuilder from '@/components/animations/MessageArrayBuilder';
import JsonParseAnim from '@/components/animations/JsonParseAnim';
import { challengeCode } from '@/data/code-snippets';
import { challengeTrace } from '@/data/traces';

export default function ChallengePage() {
  return (
    <LessonLayout
      title="5. Challenge: Restaurant Recommender"
      description="Combine all Part 1 skills to build a restaurant recommender."
      animationPanel={
        <div className="h-full flex flex-col">
          <div className="h-1/2"><MessageArrayBuilder /></div>
          <div className="h-1/2 border-t border-white/10"><JsonParseAnim /></div>
        </div>
      }
      steps={challengeTrace}
    >
      <TracerPanel code={challengeCode} />
    </LessonLayout>
  );
}
