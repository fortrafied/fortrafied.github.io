import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import RelatedTools from '../components/RelatedTools';
import HashGeneratorClient from './HashGeneratorClient';

export const metadata: Metadata = { title: 'File Hash Generator' };

export default function HashGeneratorPage() {
  return (
    <>
      <PageHeader
        title="File Hash Generator"
        description="Generate MD5, SHA-1, and SHA-256 hashes for files. Useful for exact data matching (EDM) and fingerprinting tests."
      />
      <main className="container section">
        <HashGeneratorClient />
        <RelatedTools tools={[
          { href: '/data-classifier', label: 'Classification Tester', description: 'Scan files for sensitive data content in addition to hashing them for fingerprint matching.' },
          { href: '/sample-data', label: 'Sample Data Downloads', description: 'Generate sample files to create hash fingerprints for your DLP allow/block lists.' },
        ]} />
      </main>
    </>
  );
}
