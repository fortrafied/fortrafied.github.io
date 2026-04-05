import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
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
      </main>
    </>
  );
}
