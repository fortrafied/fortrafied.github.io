import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About & Contact',
  description: 'Learn about the creator of Fortrafied and get in touch.',
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About & Contact"
        description="The person behind Fortrafied and how to get in touch."
      />
      <main className="container section">
        <AboutClient />
      </main>
    </>
  );
}
