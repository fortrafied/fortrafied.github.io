import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import RelatedTools from '../components/RelatedTools';
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
        <RelatedTools tools={[
          { href: '/email-test', label: 'Email / SMTP Test', description: 'Test your DLP solution\'s ability to detect sensitive data in email transmissions.' },
          { href: '/data-classifier', label: 'Classification Tester', description: 'Classify email body content for sensitive data types like PII, PCI, and PHI.' },
        ]} />
      </main>
    </>
  );
}
