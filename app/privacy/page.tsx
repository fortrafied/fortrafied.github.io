import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for the Fortrafied DLP testing platform.',
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        description="How Fortrafied handles your data and protects your privacy."
      />
      <main className="container section">
        <div className="legal-content">
          <p className="legal-updated">Last updated: April 6, 2025</p>

          <div className="info-box" style={{ marginBottom: 32 }}>
            <strong>Key Takeaway:</strong> Fortrafied is a fully client-side application.
            We do not collect, store, transmit, or process any data you enter into the
            testing tools. Your data never leaves your browser.
          </div>

          <section className="legal-section">
            <h2>1. Overview</h2>
            <p>
              Fortrafied (&ldquo;the Site&rdquo;) is committed to protecting your privacy.
              This Privacy Policy explains how the Site handles information when you use our
              DLP testing and validation tools.
            </p>
            <p>
              The most important thing to understand is that Fortrafied is a static website
              with no backend server, no database, and no server-side processing. All tools
              run entirely in your web browser.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Data We Do NOT Collect</h2>
            <p>Fortrafied does <strong>not</strong> collect or have access to:</p>
            <ul>
              <li>Any text, files, or data you enter into testing tools</li>
              <li>Classification results or scan outputs</li>
              <li>Regex patterns you test</li>
              <li>Email headers you analyze</li>
              <li>Files you hash or parse</li>
              <li>Personal information, account data, or credentials</li>
              <li>Form submissions or user input of any kind</li>
            </ul>
            <p>
              All processing is performed by JavaScript running locally in your browser.
              There are no API calls to Fortrafied servers, no form submissions to external
              endpoints, and no telemetry or analytics payloads.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Client-Side Storage</h2>
            <p>
              Fortrafied uses browser <code>localStorage</code> for one purpose only:
            </p>
            <ul>
              <li>
                <strong>Custom Classifiers:</strong> If you create custom classifiers in the
                Classification Builder, they are saved to your browser&apos;s localStorage
                under the key <code>fortrafied_custom_classifiers</code>. This data never
                leaves your browser and is not accessible to Fortrafied or any third party.
              </li>
            </ul>
            <p>
              You can clear this data at any time by clearing your browser&apos;s localStorage
              or using your browser&apos;s developer tools.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Hosting &amp; Infrastructure</h2>
            <p>
              Fortrafied is hosted on <strong>GitHub Pages</strong>, a static site hosting
              service provided by GitHub, Inc. GitHub Pages may collect standard web server
              logs including IP addresses, browser type, and pages visited. This data
              collection is governed by{' '}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub&apos;s Privacy Statement
              </a>.
            </p>
            <p>
              Fortrafied itself does not add any additional tracking, analytics, cookies,
              or data collection mechanisms beyond what GitHub Pages provides as
              infrastructure.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Cookies</h2>
            <p>
              Fortrafied does <strong>not</strong> set any cookies. No first-party cookies,
              no third-party cookies, no tracking cookies, and no advertising cookies are
              used by this Site.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Third-Party Services</h2>
            <p>
              Fortrafied does not integrate with any third-party analytics, advertising,
              social media tracking, or data collection services. There are no embedded
              trackers, pixels, or beacons.
            </p>
            <p>
              The only third-party service involved is GitHub Pages for hosting, as
              described in Section 4.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. HTTP/HTTPS POST Tests</h2>
            <p>
              The HTTP POST and HTTPS POST testing tools send requests to a local API
              endpoint path (<code>/api/dlp-test</code>). These requests are intentionally
              designed to be intercepted by your DLP solution. Because Fortrafied is a
              static site with no backend, these requests will not reach any server &mdash;
              they exist solely to generate network traffic that your DLP can inspect.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Children&apos;s Privacy</h2>
            <p>
              Fortrafied is a professional security testing tool and is not directed at
              children under the age of 13. We do not knowingly collect any information
              from children.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted
              on this page with an updated revision date. Your continued use of the Site
              after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please reach out via the
              contact information on the{' '}
              <a href="/about">About &amp; Contact</a> page.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
