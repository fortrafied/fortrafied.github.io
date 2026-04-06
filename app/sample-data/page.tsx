import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import RelatedTools from '../components/RelatedTools';
import SampleDataClient from './SampleDataClient';

export const metadata: Metadata = { title: 'Sample Data Downloads' };

export default function SampleDataPage() {
  return (
    <>
      <PageHeader
        title="Sample Data Downloads"
        description="Download files containing synthetic sensitive data to test data-at-rest discovery scanning across your environment."
      />
      <main className="container section">
        <SampleDataClient />
        <RelatedTools tools={[
          { href: '/data-classifier', label: 'Classification Tester', description: 'Upload your downloaded sample files to verify classifiers detect the sensitive data within them.' },
          { href: '/hash-generator', label: 'File Hash Generator', description: 'Generate hashes of sample files to build exact data matching (EDM) fingerprint lists.' },
          { href: '/http-post', label: 'HTTP POST Test', description: 'Upload sample data files via HTTP POST to test network DLP file transfer detection.' },
        ]} />
      </main>
    </>
  );
}
