'use client';
import ConceptLayout from '@/components/layout/ConceptLayout';
import SetupAnim from '@/components/animations/setup/SetupAnim';
import { setupSteps } from '@/data/concept-steps/setup';

export default function SetupPage() {
  return (
    <ConceptLayout
      title="Get Set Up: Run AI Code on Your Computer"
      description="Install Python, get an API key, keep it secret, know what it costs, and run your first file."
      steps={setupSteps}
      animationPanel={<SetupAnim />}
      lessonId="setup"
    />
  );
}
