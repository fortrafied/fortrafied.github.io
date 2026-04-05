import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import PromptBuilderClient from './PromptBuilderClient';

export const metadata: Metadata = { title: 'DLP Prompt Builder' };

export default function PromptBuilderPage() {
  return (
    <>
      <PageHeader
        title="DLP Prompt Builder"
        description="Build HTML agent prompts for Fortra Endpoint DLP and Fortra Cloud DLP. Select components, configure options, and export ready-to-use prompts."
      />
      <main className="container section">
        <PromptBuilderClient />
      </main>
    </>
  );
}
