import type { Metadata } from 'next';
import FeatureGuard from '../components/FeatureGuard';
import ClipboardTestClient from './ClipboardTestClient';

export const metadata: Metadata = { title: 'Clipboard / Paste Test' };

export default function Page() {
  return (
    <FeatureGuard
      featureId="clipboard-test"
      title="Clipboard / Paste Test"
      description="Use clipboard and paste events to validate whether endpoint DLP policies detect sensitive data during copy/paste operations."
    >
      <ClipboardTestClient />
    </FeatureGuard>
  );
}
