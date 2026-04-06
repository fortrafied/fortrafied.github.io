import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import AssessmentClient from './AssessmentClient';

export const metadata: Metadata = {
  title: 'DLP Security Assessment',
  description: 'Self-led endpoint security assessment guide for evaluating DLP coverage across all protection vectors.',
};

export default function AssessmentPage() {
  return (
    <>
      <PageHeader
        title="DLP Security Assessment"
        description="A structured, self-led guide for evaluating your DLP deployment across every protection vector."
      />
      <main className="container section">
        <AssessmentClient />
      </main>
    </>
  );
}
