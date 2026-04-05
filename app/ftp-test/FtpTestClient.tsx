'use client';

import { useState } from 'react';
import PageHeader from '../components/PageHeader';

const ftpConfig = `# FTP Server Connection Details
Host: ftp.example.com
Port: 21
Username: dlp-test-user
Password: TestPass123!

# Connect using command-line FTP client:
ftp ftp.example.com

# Or use lftp for more options:
lftp -u dlp-test-user,TestPass123! ftp.example.com

# Upload a test file:
put sensitive-data.csv /uploads/sensitive-data.csv

# Upload with curl:
curl -T sensitive-data.csv ftp://ftp.example.com/uploads/ --user dlp-test-user:TestPass123!`;

export default function FtpTestClient() {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(ftpConfig);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = ftpConfig;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      <PageHeader
        title="FTP Upload Test"
        description="Upload a file via FTP to test whether your DLP solution monitors and blocks sensitive file transfers."
      />
      <main className="container section">
        {/* Info Box */}
        <div className="info-box">
          <strong>FTP DLP Monitoring:</strong> FTP is an unencrypted protocol commonly used for file transfers. Network DLP solutions can inspect FTP traffic in real time, scanning uploaded file contents for sensitive data. Some DLP solutions also monitor SFTP and FTPS by integrating with endpoint agents or network proxies.
        </div>

        {/* FTP Test Instructions */}
        <div className="test-panel">
          <h2>FTP Test Instructions</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-num">1</div>
              <h4>Download Sample Files</h4>
              <p>
                Download sample files containing sensitive data from the{' '}
                <a href="/sample-data">Sample Data page</a>. These files contain synthetic PII, PCI, and PHI data in various formats.
              </p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h4>Use an FTP Client</h4>
              <p>
                Open your preferred FTP client (FileZilla, WinSCP, or command-line FTP). Connect to your test FTP server using the configuration below.
              </p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h4>Upload &amp; Monitor</h4>
              <p>
                Upload the sample files to the FTP server and check your DLP console for alerts. The DLP solution should detect the sensitive file contents during transfer.
              </p>
            </div>
          </div>
        </div>

        {/* FTP Server Configuration */}
        <div className="test-panel">
          <h2>FTP Server Configuration</h2>
          <p>Use the following sample configuration to connect to an FTP server for testing. Replace with your actual test server details.</p>
          <div className="code-block">
            <button type="button" className="copy-btn" onClick={copyCode}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre>{ftpConfig}</pre>
          </div>
        </div>

        {/* FTP DLP Monitoring Methods */}
        <div className="test-panel">
          <h2>FTP DLP Monitoring Methods</h2>
          <div className="two-col">
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px' }}>Network-Level Monitoring</h3>
              <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#9e9e9e', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '8px' }}>Passive network tap inspects FTP data channel traffic</li>
                <li style={{ marginBottom: '8px' }}>Deep packet inspection (DPI) scans file contents in transit</li>
                <li style={{ marginBottom: '8px' }}>Protocol-aware parsing reconstructs files from FTP streams</li>
                <li style={{ marginBottom: '8px' }}>Can detect plaintext FTP (port 21) without endpoint agents</li>
                <li style={{ marginBottom: '8px' }}>Limited visibility into encrypted SFTP/FTPS without SSL inspection</li>
              </ul>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px' }}>Endpoint-Level Monitoring</h3>
              <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#9e9e9e', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '8px' }}>Endpoint agent monitors FTP client application activity</li>
                <li style={{ marginBottom: '8px' }}>Scans files before they are transmitted over any protocol</li>
                <li style={{ marginBottom: '8px' }}>Can inspect content even for encrypted transfers (SFTP/FTPS)</li>
                <li style={{ marginBottom: '8px' }}>Application-level control can block specific FTP clients</li>
                <li style={{ marginBottom: '8px' }}>Works with any FTP client including command-line tools</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
