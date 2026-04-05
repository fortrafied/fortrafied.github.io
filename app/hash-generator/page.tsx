import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
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
      </main>
    </>
  );
}
