'use client';

import { useState } from 'react';
import PageHeader from '../components/PageHeader';

const tabData: Record<string, { label: string; content: string }> = {
  ssn: {
    label: 'SSN Data',
    content: `Confidential Employee Records - Q4 2024

Name: John A. Smith
SSN: 078-05-1120
Date of Birth: 01/15/1985
Department: Engineering

Name: Jane B. Doe
SSN: 219-09-9999
Date of Birth: 03/22/1990
Department: Marketing

Name: Robert C. Johnson
SSN: 323-45-6789
Date of Birth: 07/04/1978
Department: Finance`,
  },
  ccn: {
    label: 'Credit Card Data',
    content: `Customer Payment Information

Cardholder: John Smith
Card Number: 4111-1111-1111-1111
Expiration: 12/2026
CVV: 123
Type: Visa

Cardholder: Jane Doe
Card Number: 5500-0000-0000-0004
Expiration: 06/2027
CVV: 456
Type: Mastercard

Cardholder: Bob Wilson
Card Number: 3400-000000-00009
Expiration: 09/2025
CVV: 7890
Type: American Express`,
  },
  phi: {
    label: 'PHI Data',
    content: `Patient Medical Record

Patient: James T. Anderson
MRN: MRN-2024-78456
DOB: 05/12/1965
Diagnosis: Type 2 Diabetes Mellitus (E11.9)
Secondary: Essential Hypertension (I10)
Health Plan ID: HP-882931-A
Provider: Dr. Emily Chen, MD
Prescription: Metformin 500mg twice daily
Lab Result: HbA1c 7.2%
Next Appointment: 03/15/2025`,
  },
  mixed: {
    label: 'Mixed PII',
    content: `INTERNAL MEMO - STRICTLY CONFIDENTIAL

To: HR Department
From: Payroll Division
Subject: Employee Verification Data

Employee: Sarah M. Williams
SSN: 167-23-4567
Email: sarah.williams@example.com
Phone: (555) 234-5678
Bank Account: 021000021 / 123456789012
Annual Salary: $87,500

Please verify the above information before processing
the direct deposit change request.

Ref: HR-2024-0892`,
  },
};

const tabKeys = Object.keys(tabData);

export default function EmailTestClient() {
  const [activeTab, setActiveTab] = useState('ssn');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  async function copyCode(key: string) {
    try {
      await navigator.clipboard.writeText(tabData[key].content);
      setCopiedTab(key);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = tabData[key].content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedTab(key);
      setTimeout(() => setCopiedTab(null), 2000);
    }
  }

  return (
    <>
      <PageHeader
        title="Email / SMTP Test"
        description="Test your DLP solution's ability to detect sensitive data in outbound email messages and attachments."
      />
      <main className="container section">
        {/* Info Box */}
        <div className="info-box">
          <strong>How Email DLP Works:</strong> Email DLP solutions typically deploy a Mail Transfer Agent (MTA) between your mail server and the email gateway. This MTA inspects outbound messages and attachments for sensitive content matching your DLP policies. Some solutions also integrate directly with email providers like Microsoft 365 or Google Workspace via API.
        </div>

        {/* Email Test Instructions */}
        <div className="test-panel">
          <h2>Email Test Instructions</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-num">1</div>
              <h4>Download Sample Data</h4>
              <p>
                Copy the sample sensitive data from the tabs below or download sample files from the{' '}
                <a href="/sample-data">Sample Data page</a>. These contain synthetic PII, PCI, and PHI data.
              </p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h4>Compose an Email</h4>
              <p>
                Open your email client and compose a new message. Paste the sample data into the email body or attach the downloaded files. Address it to a test recipient.
              </p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h4>Send &amp; Monitor</h4>
              <p>
                Send the email and check your DLP console for alerts. The DLP solution should detect the sensitive content and create an incident based on your configured policies.
              </p>
            </div>
          </div>
        </div>

        {/* Sample Email Body Content */}
        <div className="test-panel">
          <h2>Sample Email Body Content</h2>
          <p>Copy the content below and paste it into an email body to test your email DLP policies.</p>

          <div className="tabs">
            {tabKeys.map((key) => (
              <button
                key={key}
                type="button"
                className={`tab${activeTab === key ? ' active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {tabData[key].label}
              </button>
            ))}
          </div>

          {tabKeys.map((key) => (
            <div
              key={key}
              style={{ display: activeTab === key ? 'block' : 'none' }}
            >
              <div className="code-block">
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => copyCode(key)}
                >
                  {copiedTab === key ? 'Copied!' : 'Copy'}
                </button>
                <pre>{tabData[key].content}</pre>
              </div>
            </div>
          ))}
        </div>

        {/* Email DLP Test Scenarios */}
        <div className="test-panel">
          <h2>Email DLP Test Scenarios</h2>
          <p>Test each of the following scenarios to thoroughly validate your email DLP deployment.</p>
          <div className="data-types-grid">
            <div className="data-type">
              <h4>Body Content</h4>
              <p>Paste sensitive data directly into the email body. DLP should scan the message text for patterns like SSN, credit card numbers, and PHI.</p>
            </div>
            <div className="data-type">
              <h4>Attachment Scanning</h4>
              <p>Attach files containing sensitive data (PDF, DOCX, XLSX, CSV). DLP should extract and inspect file contents before delivery.</p>
            </div>
            <div className="data-type">
              <h4>Subject Line</h4>
              <p>Include sensitive data or classification keywords in the subject line. Some DLP policies also inspect email headers and subject fields.</p>
            </div>
            <div className="data-type">
              <h4>Compressed Attachments</h4>
              <p>Place sensitive files inside ZIP or RAR archives and attach them. Advanced DLP solutions should decompress and scan archive contents.</p>
            </div>
            <div className="data-type">
              <h4>External vs Internal</h4>
              <p>Send the same content to both internal and external recipients. Many DLP policies differentiate based on recipient domain.</p>
            </div>
            <div className="data-type">
              <h4>BCC/CC Testing</h4>
              <p>Add recipients in the BCC and CC fields. Verify that DLP inspects all recipient fields, not just the primary &quot;To&quot; address.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
