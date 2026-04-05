import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '../components/PageHeader';

export const metadata: Metadata = { title: 'DP Solution Composer' };

export default function DpSolutionPage() {
  return (
    <>
      <PageHeader
        title="DP Solution Composer"
        description="Select data protection products and features to see how coverage changes across channels, actions, and data types."
      />
      <main className="container section">
        <div className="test-panel" style={{ textAlign: 'center' }}>
          <h2>Coming Soon</h2>
          <p style={{ color: '#9e9e9e', marginBottom: 24 }}>
            This tool is currently being rebuilt for the new platform. Check back soon
            for an updated experience.
          </p>
          <Link href="/" className="btn">
            Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}
