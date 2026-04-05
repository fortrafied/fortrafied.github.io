import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import PostTestForm from '../components/PostTestForm';

export const metadata: Metadata = { title: 'HTTP POST Test' };

export default function HttpPostPage() {
  return (
    <>
      <PageHeader
        title="HTTP POST Test"
        description="Submit sensitive data via an unencrypted HTTP POST request to test whether your DLP solution detects and blocks plaintext network exfiltration."
      />
      <PostTestForm variant="http" />
    </>
  );
}
