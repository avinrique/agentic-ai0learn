'use client';
import ConceptLayout from '@/components/layout/ConceptLayout';
import TemperatureAnim from '@/components/animations/TemperatureAnim';
import { temperatureSteps } from '@/data/concept-steps';

export default function TemperaturePage() {
  return (
    <ConceptLayout
      title="Temperature & Creativity"
      description="How one number controls whether the AI is a robot or a poet."
      steps={temperatureSteps}
      animationPanel={<TemperatureAnim />}
      lessonId="temperature"
    />
  );
}
