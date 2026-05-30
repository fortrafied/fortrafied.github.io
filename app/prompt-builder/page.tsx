import type { Metadata } from 'next';
import FeatureGuard from '../components/FeatureGuard';
import PromptBuilderClient from './PromptBuilderClient';

export const metadata: Metadata = { title: 'DLP Prompt Builder' };

export default function PromptBuilderPage() {
  return (
    <FeatureGuard
      featureId="prompt-builder"
      title="DLP Prompt Builder"
      description="Build HTML agent prompts for Fortra Endpoint DLP and Fortra Cloud DLP. Select components, configure options, and export ready-to-use prompts."
    >
      <PromptBuilderClient />
    </FeatureGuard>
  );
}
