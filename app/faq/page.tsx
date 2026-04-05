import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import FaqClient from './FaqClient';

export const metadata: Metadata = { title: 'FAQ' };

export default function FaqPage() {
  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        description="Common questions about DLP testing, this site, and how to get the most out of these tools."
      />
      <main className="container section">
        <FaqClient />
      </main>
    </>
  );
}
