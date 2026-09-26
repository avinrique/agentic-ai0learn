'use client';
import ConceptLayout from '@/components/layout/ConceptLayout';
import TeamShapesAnim from '@/components/animations/part4/TeamShapesAnim';
import { teamShapesSteps } from '@/data/concept-steps/part4';

export default function TeamShapesPage() {
  return (
    <ConceptLayout
      title="Team Shapes: How Agents Work Together"
      description="Assembly line, boss & helpers, receptionist, writer & critic: four ways to organise a team."
      steps={teamShapesSteps}
      animationPanel={<TeamShapesAnim />}
      lessonId="team-shapes"
    />
  );
}
