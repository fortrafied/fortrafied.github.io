import Link from 'next/link';

export default function Footer() {
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
              <li><Link href="/http-post">HTTP POST</Link></li>
              <li><Link href="/https-post">HTTPS POST</Link></li>
              <li><Link href="/email-test">Email Test</Link></li>
              <li><Link href="/ftp-test">FTP Test</Link></li>
              <li><Link href="/clipboard-test">Clipboard Test</Link></li>
              <li><Link href="/print-test">Print Test</Link></li>
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
              <li><Link href="/sample-data">Sample Data</Link></li>
              <li><Link href="/data-classifier">Classification Tester</Link></li>
              <li><Link href="/regex-tester">Regex Tester</Link></li>
              <li><Link href="/hash-generator">Hash Generator</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/about">About &amp; Contact</Link></li>
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
