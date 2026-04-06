import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import RelatedTools from '../components/RelatedTools';
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
        <RelatedTools tools={[
          { href: '/classification-builder', label: 'Classification Builder', description: 'Create custom classifiers with regex or dictionary patterns to extend detection coverage.' },
          { href: '/regex-tester', label: 'Regex Pattern Tester', description: 'Test and refine individual regex patterns before adding them as classifiers.' },
          { href: '/sample-data', label: 'Sample Data Downloads', description: 'Download synthetic sensitive data files to test classification across different formats.' },
        ]} />
      </main>
    </>
  );
}
