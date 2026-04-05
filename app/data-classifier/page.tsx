import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import DataClassifierClient from './DataClassifierClient';

export const metadata: Metadata = { title: 'Data Classifier' };

export default function DataClassifierPage() {
  return (
    <>
      <PageHeader
        title="Data Classifier"
        description="Paste text and automatically identify sensitive data types present — PII, PCI, PHI, credentials, and custom patterns."
      />
      <main className="container section">
        <DataClassifierClient />
      </main>
    </>
  );
}
