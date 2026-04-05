import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import ClassificationBuilderClient from './ClassificationBuilderClient';

export const metadata: Metadata = { title: 'Classification Builder' };

export default function ClassificationBuilderPage() {
  return (
    <>
      <PageHeader
        title="Classification Builder"
        description="Create custom classification schemas using regex patterns and keyword dictionaries. Schemas are saved locally and used by the Data Classifier."
      />
      <main className="container section">
        <ClassificationBuilderClient />
      </main>
    </>
  );
}
