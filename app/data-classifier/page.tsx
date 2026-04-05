import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import DataClassifierClient from './DataClassifierClient';

export const metadata: Metadata = { title: 'Classification Tester' };

export default function DataClassifierPage() {
  return (
    <>
      <PageHeader
        title="Classification Tester"
        description="Paste text and automatically identify sensitive data types present — PII, PCI, PHI, credentials, and custom patterns."
      />
      <main className="container section">
        <DataClassifierClient />
      </main>
    </>
  );
}
