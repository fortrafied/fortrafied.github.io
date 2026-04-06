import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import RelatedTools from '../components/RelatedTools';
import ClassificationBuilderClient from './ClassificationBuilderClient';

export const metadata: Metadata = { title: 'Classification Builder' };

export default function ClassificationBuilderPage() {
  return (
    <>
      <PageHeader
        title="Classification Builder"
        description="Create custom classification schemas using regex patterns and keyword dictionaries. Schemas are saved locally and used by the Classification Tester."
      />
      <main className="container section">
        <ClassificationBuilderClient />
        <RelatedTools tools={[
          { href: '/data-classifier', label: 'Classification Tester', description: 'Test your custom classifiers against real text and files to validate detection accuracy.' },
          { href: '/regex-tester', label: 'Regex Pattern Tester', description: 'Debug and refine regex patterns in isolation before adding them as classifiers.' },
        ]} />
      </main>
    </>
  );
}
