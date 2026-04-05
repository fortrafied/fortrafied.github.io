import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
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
      </main>
    </>
  );
}
