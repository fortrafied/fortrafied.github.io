import type { Metadata } from 'next';
import FeatureGuard from '../components/FeatureGuard';
import RelatedTools from '../components/RelatedTools';
import HashGeneratorClient from './HashGeneratorClient';

export const metadata: Metadata = { title: 'File Hash Generator' };

export default function HashGeneratorPage() {
  return (
    <FeatureGuard
      featureId="hash-generator"
      title="File Hash Generator"
      description="Generate MD5, SHA-1, and SHA-256 hashes for files. Useful for exact data matching (EDM) and fingerprinting tests."
    >
      <HashGeneratorClient />
      <RelatedTools tools={[
        { href: '/data-classifier', label: 'Classification Tester', description: 'Scan files for sensitive data content in addition to hashing them for fingerprint matching.' },
        { href: '/sample-data', label: 'Sample Data Downloads', description: 'Generate sample files to create hash fingerprints for your DLP allow/block lists.' },
      ]} />
    </FeatureGuard>
  );
}
