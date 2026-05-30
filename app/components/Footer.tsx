import Link from 'next/link';
import type { FeatureDefinition } from '@/app/lib/feature-registry';
import { getFeatureById } from '@/app/lib/feature-registry';
import { getFeatureStatus, isFeatureHidden } from '@/app/lib/feature-config';

const testingFeatureIds = [
  'http-post',
  'https-post',
  'email-test',
  'ftp-test',
  'clipboard-test',
  'print-test',
];

const resourceFeatureIds = ['sample-data', 'data-classifier', 'regex-tester', 'hash-generator'];

const renderFooterLink = (feature: FeatureDefinition) => {
  const status = getFeatureStatus(feature.id);
  if (status === 'disabled') {
    return (
      <li key={feature.id}>
        <span style={{ color: '#9e9e9e' }}>
          {feature.label} (disabled by configuration)
        </span>
      </li>
    );
  }

  return (
    <li key={feature.id}>
      <Link href={feature.href}>{feature.label}</Link>
    </li>
  );
};

const visibleFeatures = (ids: string[]) =>
  ids
    .map((id) => getFeatureById(id))
    .filter((feature): feature is FeatureDefinition => Boolean(feature) && !isFeatureHidden(feature.id));

export default function Footer() {
  const visibleTesting = visibleFeatures(testingFeatureIds);
  const visibleResources = visibleFeatures(resourceFeatureIds);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>Fortrafied DLP Security Tools</h4>
            <p>
              A free, privacy-first testing resource for validating Data Loss
              Prevention solutions. All processing happens in your browser &mdash;
              no data is ever stored or logged.
            </p>
          </div>
          <div>
            <h4>Testing</h4>
            <ul>
              {visibleTesting.map(renderFooterLink)}
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
              {visibleResources.map(renderFooterLink)}
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/about">About &amp; Contact</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Fortrafied. Authorized security testing only. All sample data is synthetic.
          </p>
          <p className="footer-legal-links">
            <Link href="/terms">Terms of Service</Link>
            <span className="footer-sep">&bull;</span>
            <Link href="/privacy">Privacy Policy</Link>
          </p>
          <p style={{ color: '#616161', fontSize: '0.75rem', marginTop: '6px' }}>
            Fortrafied is an independent project and is not affiliated with,
            endorsed by, or sponsored by Fortra, LLC or any other company. All
            product names, logos, and brands mentioned are property of their
            respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
