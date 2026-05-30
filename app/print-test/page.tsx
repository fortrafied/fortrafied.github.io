import type { Metadata } from 'next';
import FeatureGuard from '../components/FeatureGuard';
import PrintTestClient from './PrintTestClient';

export const metadata: Metadata = { title: 'Print / Screenshot Test' };

export default function Page() {
  return (
    <FeatureGuard
      featureId="print-test"
      title="Print / Screenshot Test"
      description="Trigger print and screenshot behavior to test whether your endpoint DLP or content watermarking controls detect and protect sensitive output."
    >
      <PrintTestClient />
    </FeatureGuard>
  );
}
