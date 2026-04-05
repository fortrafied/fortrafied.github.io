import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '../components/PageHeader';

export const metadata: Metadata = { title: 'Policy Builder / Interpreter' };

export default function PolicyBuilderPage() {
  return (
    <>
      <PageHeader
        title="Policy Builder / Interpreter"
        description="Build and interpret DLP policies for Digital Guardian, DCS Policy Manager, Titus, and generic formats."
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
