import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import EmailAnalyzerClient from './EmailAnalyzerClient';

export const metadata: Metadata = { title: 'Email Header Analyzer' };

export default function EmailAnalyzerPage() {
  return (
    <>
      <PageHeader
        title="Email Header Analyzer"
        description="Analyze email headers for routing hops, delivery delays, authentication results (SPF/DKIM/DMARC), classification labels, and security metadata."
      />
      <main className="container section">
        <EmailAnalyzerClient />
      </main>
    </>
  );
}
