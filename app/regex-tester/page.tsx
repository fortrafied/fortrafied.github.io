import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import RelatedTools from '../components/RelatedTools';
import RegexTesterClient from './RegexTesterClient';

export const metadata: Metadata = { title: 'Regex Pattern Tester' };

export default function RegexTesterPage() {
  return (
    <>
      <PageHeader
        title="Regex Pattern Tester"
        description="Test and validate DLP detection patterns against sample data. Includes presets for SSN, credit cards, emails, and more."
      />
      <main className="container section">
        <RegexTesterClient />
        <RelatedTools tools={[
          { href: '/classification-builder', label: 'Classification Builder', description: 'Turn your tested regex pattern into a reusable classifier with category and severity settings.' },
          { href: '/data-classifier', label: 'Classification Tester', description: 'Run all classifiers (including custom ones) against text or files to identify sensitive data.' },
          { href: '/sample-data', label: 'Sample Data Downloads', description: 'Generate synthetic sensitive data files to test your regex patterns against realistic content.' },
        ]} />
      </main>
    </>
  );
}
