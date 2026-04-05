'use client';

import { useState, ClipboardEvent } from 'react';
import PageHeader from '../components/PageHeader';

const clipData: Record<string, { label: string; content: string }> = {
  ssn: {
    label: 'SSN Data',
    content:
      'Confidential Employee Records\n\nJohn A. Smith, SSN: 078-05-1120, DOB: 01/15/1985\nJane B. Doe, SSN: 219-09-9999, DOB: 03/22/1990\nRobert C. Johnson, SSN: 323-45-6789, DOB: 07/04/1978',
  },
  ccn: {
    label: 'Credit Card',
    content:
      'Payment Card Data\n\nVisa: 4111-1111-1111-1111, Exp: 12/2026, CVV: 123\nMastercard: 5500-0000-0000-0004, Exp: 06/2027, CVV: 456\nAmex: 3400-000000-00009, Exp: 09/2025, CVV: 7890',
  },
  pii: {
    label: 'Mixed PII',
    content:
      "Employee PII\n\nSarah M. Williams\nSSN: 167-23-4567\nDOB: 11/30/1982\nEmail: sarah.williams@example.com\nPhone: (555) 234-5678\nAddress: 123 Main St, Springfield, IL 62704\nDriver License: W530-4291-8456",
  },
};

const clipKeys = Object.keys(clipData);

export default function ClipboardTestClient() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pasteResult, setPasteResult] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');

  async function copyToClipboard(key: string) {
    try {
      await navigator.clipboard.writeText(clipData[key].content);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = clipData[key].content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData('text');
    setPasteText(pasted);
    setPasteResult(
      `Paste event detected!\n\nCharacters pasted: ${pasted.length}\nContent preview: ${pasted.substring(0, 200)}${pasted.length > 200 ? '...' : ''}\n\nCheck your DLP console to see if this paste operation was logged.`
    );
  }

  return (
    <>
      <PageHeader
        title="Clipboard / Paste Test"
        description="Test your endpoint DLP agent's ability to detect sensitive data copied to the clipboard or pasted into applications."
      />
      <main className="container section">
        {/* Info Box */}
        <div className="info-box">
          <strong>Endpoint DLP Required:</strong> Clipboard monitoring requires an endpoint DLP agent installed on the workstation. Network-based DLP solutions cannot detect clipboard operations. Ensure your endpoint agent is running and configured with clipboard monitoring policies.
        </div>

        {/* Step 1: Copy Sensitive Data */}
        <div className="test-panel">
          <h2>Step 1: Copy Sensitive Data</h2>
          <p>Click a button below to copy sensitive data to your clipboard. Your endpoint DLP agent should detect this operation.</p>
          <div className="card-grid">
            {clipKeys.map((key) => (
              <div className="card" key={key}>
                <h3>{clipData[key].label}</h3>
                <div className="code-block">
                  <pre>{clipData[key].content}</pre>
                </div>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ marginTop: '12px', width: '100%' }}
                  onClick={() => copyToClipboard(key)}
                >
                  {copiedKey === key ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Paste Here */}
        <div className="test-panel">
          <h2>Step 2: Paste Here</h2>
          <p>After copying sensitive data, paste it into the text area below. The paste event will be detected and logged.</p>
          <textarea
            className="form-control"
            rows={6}
            placeholder="Paste sensitive data here (Ctrl+V / Cmd+V)..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            onPaste={handlePaste}
          />
          {pasteResult && (
            <div className="result-box visible success" style={{ marginTop: '16px' }}>
              <div className="result-header">Paste Detected</div>
              <div className="result-body">
                <pre>{pasteResult}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Cross-Application Test */}
        <div className="test-panel">
          <h2>Step 3: Cross-Application Test</h2>
          <p>For a thorough test, try pasting the copied data into other applications to verify your DLP monitors clipboard operations system-wide.</p>
          <div className="data-types-grid">
            <div className="data-type">
              <h4>Text Editor</h4>
              <p>Paste into Notepad, TextEdit, VS Code, or another text editor. Endpoint DLP should detect sensitive data in the paste buffer.</p>
            </div>
            <div className="data-type">
              <h4>Spreadsheet</h4>
              <p>Paste into Excel or Google Sheets. DLP should detect sensitive data being moved into spreadsheet applications.</p>
            </div>
            <div className="data-type">
              <h4>Web Browser</h4>
              <p>Paste into web forms, chat applications, or social media. DLP should monitor browser-based paste operations.</p>
            </div>
            <div className="data-type">
              <h4>Cloud Storage</h4>
              <p>Try pasting into cloud document editors like Google Docs or Office Online. Verify DLP covers cloud application paste events.</p>
            </div>
          </div>
        </div>

        {/* Clipboard DLP Capabilities */}
        <div className="test-panel">
          <h2>Clipboard DLP Capabilities</h2>
          <div className="two-col">
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px' }}>What Endpoint DLP Can Detect</h3>
              <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#9e9e9e', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '8px' }}>Copy operations from protected applications</li>
                <li style={{ marginBottom: '8px' }}>Paste operations into unauthorized destinations</li>
                <li style={{ marginBottom: '8px' }}>Clipboard content matching sensitive data patterns</li>
                <li style={{ marginBottom: '8px' }}>Screen clipping and screenshot tools accessing clipboard</li>
                <li style={{ marginBottom: '8px' }}>Cross-application data movement via clipboard</li>
              </ul>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px' }}>Policy Actions Available</h3>
              <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#9e9e9e', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '8px' }}>Monitor and log clipboard operations</li>
                <li style={{ marginBottom: '8px' }}>Block paste of sensitive data into unauthorized apps</li>
                <li style={{ marginBottom: '8px' }}>Warn users before allowing paste to complete</li>
                <li style={{ marginBottom: '8px' }}>Encrypt clipboard contents automatically</li>
                <li style={{ marginBottom: '8px' }}>Clear clipboard after a timeout period</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
