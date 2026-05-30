import type { Metadata } from 'next';
import FeatureGuard from '../components/FeatureGuard';
import PostTestForm from '../components/PostTestForm';

export const metadata: Metadata = { title: 'HTTPS POST Test' };

export default function HttpsPostPage() {
  return (
    <FeatureGuard
      featureId="https-post"
      title="HTTPS POST Test"
      description="Submit sensitive data via an encrypted HTTPS POST request to test whether your DLP solution can inspect SSL/TLS traffic."
    >
      <PostTestForm variant="https" />
    </FeatureGuard>
  );
}
