import type { Metadata } from 'next';
import FeatureGuard from '../components/FeatureGuard';
import PostTestForm from '../components/PostTestForm';

export const metadata: Metadata = { title: 'HTTP POST Test' };

export default function HttpPostPage() {
  return (
    <FeatureGuard
      featureId="http-post"
      title="HTTP POST Test"
      description="Submit sensitive data via an unencrypted HTTP POST request to test whether your DLP solution detects and blocks plaintext network exfiltration."
    >
      <PostTestForm variant="http" />
    </FeatureGuard>
  );
}
