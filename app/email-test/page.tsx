import type { Metadata } from 'next';
import FeatureGuard from '../components/FeatureGuard';
import EmailTestClient from './EmailTestClient';

export const metadata: Metadata = { title: 'Email / SMTP Test' };

export default function Page() {
  return (
    <FeatureGuard
      featureId="email-test"
      title="Email / SMTP Test"
      description="Simulate SMTP email delivery and exfiltration to test whether email-based DLP detections catch sensitive payloads."
    >
      <EmailTestClient />
    </FeatureGuard>
  );
}
