import type { Metadata } from 'next';
import FeatureGuard from '../components/FeatureGuard';
import RelatedTools from '../components/RelatedTools';
import ClassificationBuilderClient from './ClassificationBuilderClient';

export const metadata: Metadata = { title: 'Classification Builder' };

export default function ClassificationBuilderPage() {
  return (
    <FeatureGuard
      featureId="classification-builder"
      title="Classification Builder"
      description="Create custom classification schemas using regex patterns and keyword dictionaries. Schemas are saved locally and used by the Classification Tester."
    >
      <ClassificationBuilderClient />
      <RelatedTools tools={[
        { href: '/data-classifier', label: 'Classification Tester', description: 'Test your custom classifiers against real text and files to validate detection accuracy.' },
        { href: '/regex-tester', label: 'Regex Pattern Tester', description: 'Debug and refine regex patterns in isolation before adding them as classifiers.' },
      ]} />
    </FeatureGuard>
  );
}
