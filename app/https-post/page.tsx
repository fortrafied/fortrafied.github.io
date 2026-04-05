import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import PostTestForm from '../components/PostTestForm';

export const metadata: Metadata = { title: 'HTTPS POST Test' };

export default function HttpsPostPage() {
  return (
    <>
      <PageHeader
        title="HTTPS POST Test"
        description="Submit sensitive data via an encrypted HTTPS POST request to test whether your DLP solution can inspect SSL/TLS traffic."
      />
      <PostTestForm variant="https" />
    </>
  );
}
