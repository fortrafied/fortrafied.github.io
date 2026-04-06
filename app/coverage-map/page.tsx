import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import CoverageMapClient from './CoverageMapClient';

export const metadata: Metadata = {
  title: 'DLP Coverage Map',
  description: 'Interactive heat map showing DLP coverage across data types and protection channels. Identify gaps at a glance.',
};

export default function CoverageMapPage() {
  return (
    <>
      <PageHeader
        title="DLP Coverage Map"
        description="Visualize your DLP coverage across data types and channels. Click cells to mark coverage status and instantly identify gaps."
      />
      <main className="container section">
        <CoverageMapClient />
      </main>
    </>
  );
}
