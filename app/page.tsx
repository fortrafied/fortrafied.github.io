import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <header className="hero">
        <div className="container">
          <h1>Data Loss Prevention Testing Suite</h1>
          <p className="hero-subtitle">
            Validate your DLP solution&apos;s effectiveness across all protection
            vectors. Test data in motion, data in use, and data at rest.
          </p>
          <div className="hero-badges">
            <span className="badge">Data in Motion</span>
            <span className="badge">Data in Use</span>
            <span className="badge">Data at Rest</span>
          </div>
        </div>
      </header>

      <main className="container">
        {/* DLP Testing Categories */}
        <section className="section">
          <h2 className="section-title">DLP Testing Categories</h2>
          <p className="section-desc">
            Data Loss Prevention is traditionally divided into three categories.
            Use the tools below to test each vector of your DLP deployment.
          </p>
          <div className="card-grid">
            <div className="card">
              <div className="card-icon">&#8644;</div>
              <h3>Data in Motion</h3>
              <p>
                Test your DLP solution&apos;s ability to monitor and block sensitive
                data transmitted over the network via HTTP, HTTPS, FTP, and SMTP.
              </p>
              <ul className="card-links">
                <li><Link href="/http-post">HTTP POST Test</Link></li>
                <li><Link href="/https-post">HTTPS POST Test</Link></li>
                <li><Link href="/email-test">Email / SMTP Test</Link></li>
                <li><Link href="/ftp-test">FTP Upload Test</Link></li>
              </ul>
            </div>
            <div className="card">
              <div className="card-icon">&#9998;</div>
              <h3>Data in Use</h3>
              <p>
                Validate endpoint DLP agents can detect sensitive data being
                copied, pasted, printed, or screen-captured on user workstations.
              </p>
              <ul className="card-links">
                <li><Link href="/clipboard-test">Clipboard / Paste Test</Link></li>
                <li><Link href="/print-test">Print / Screenshot Test</Link></li>
              </ul>
            </div>
            <div className="card">
              <div className="card-icon">&#128451;</div>
              <h3>Data at Rest</h3>
              <p>
                Download sample files containing synthetic sensitive data to test
                discovery scanning on endpoints, file servers, and cloud storage.
              </p>
              <ul className="card-links">
                <li><Link href="/sample-data">Download Sample Data</Link></li>
              </ul>
            </div>
          </div>
        </section>

        {/* DLP Tools */}
        <section className="section">
          <h2 className="section-title">DLP Tools</h2>
          <p className="section-desc">
            Utilities for testing, validating, and configuring DLP solutions.
          </p>
          <div className="card-grid">
            <div className="card">
              <div className="card-icon">.*</div>
              <h3>Regex Pattern Tester</h3>
              <p>
                Test and validate DLP detection patterns against sample data.
                Includes common presets for SSN, credit cards, emails, and more.
              </p>
              <Link href="/regex-tester" className="btn btn-outline">Open Tool</Link>
            </div>
            <div className="card">
              <div className="card-icon">&#128270;</div>
              <h3>Classification Tester</h3>
              <p>
                Paste text and automatically identify sensitive data types
                present &mdash; PII, PCI, PHI, credentials, and custom patterns.
              </p>
              <Link href="/data-classifier" className="btn btn-outline">Open Tool</Link>
            </div>
            <div className="card">
              <div className="card-icon">#</div>
              <h3>File Hash Generator</h3>
              <p>
                Generate MD5, SHA-1, and SHA-256 hashes for files. Useful for
                exact data matching (EDM) and fingerprinting tests.
              </p>
              <Link href="/hash-generator" className="btn btn-outline">Open Tool</Link>
            </div>
          </div>
        </section>

        {/* How to Use */}
        <section className="section">
          <h2 className="section-title">How to Use This Site</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-num">1</div>
              <h4>Configure Your DLP</h4>
              <p>
                Set up your DLP solution in <strong>monitor mode</strong> first.
                Create policies to detect PII, PCI, PHI, and other sensitive data
                types.
              </p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h4>Run Tests</h4>
              <p>
                Use the testing tools to attempt transmitting sensitive data via
                HTTP POST, email, FTP, clipboard, and other channels.
              </p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h4>Verify Detection</h4>
              <p>
                Check your DLP console to confirm incidents were created. Validate
                that the correct policies triggered and data was classified
                properly.
              </p>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <h4>Switch to Block Mode</h4>
              <p>
                Once detection is verified, enable blocking mode and re-run the
                tests to confirm your DLP solution actively prevents data
                exfiltration.
              </p>
            </div>
          </div>
        </section>

        {/* Supported Data Types */}
        <section className="section">
          <h2 className="section-title">Supported Data Types</h2>
          <div className="data-types-grid">
            <div className="data-type">
              <h4>PII &mdash; Personally Identifiable Information</h4>
              <p>
                Social Security Numbers, Names, Dates of Birth, Addresses, Phone
                Numbers, Driver&apos;s License Numbers
              </p>
            </div>
            <div className="data-type">
              <h4>PCI &mdash; Payment Card Industry</h4>
              <p>
                Credit Card Numbers (Visa, MC, Amex, Discover), CVV Codes,
                Expiration Dates, Cardholder Names
              </p>
            </div>
            <div className="data-type">
              <h4>PHI &mdash; Protected Health Information</h4>
              <p>
                Medical Record Numbers, Health Plan IDs, Diagnosis Codes, Patient
                Names, Treatment Records
              </p>
            </div>
            <div className="data-type">
              <h4>Financial Data</h4>
              <p>
                Bank Account Numbers, Routing Numbers, SWIFT/BIC Codes, IBAN
                Numbers, Tax IDs
              </p>
            </div>
            <div className="data-type">
              <h4>Credentials &amp; Secrets</h4>
              <p>
                API Keys, Access Tokens, Connection Strings, Private Keys (for
                detection testing only)
              </p>
            </div>
            <div className="data-type">
              <h4>Custom / Intellectual Property</h4>
              <p>
                Source Code Keywords, Proprietary Document Markers, Classification
                Labels, Custom Regex Patterns
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
