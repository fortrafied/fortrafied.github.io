'use client';

import PageHeader from '../components/PageHeader';

const printStyles = `
@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: #fff !important;
    color: #000 !important;
  }
  .container {
    max-width: 100% !important;
    padding: 0 !important;
  }
  .test-panel {
    border: 1px solid #ccc !important;
    background: #fff !important;
    break-inside: avoid;
  }
  .data-table {
    border-collapse: collapse !important;
    width: 100% !important;
  }
  .data-table th,
  .data-table td {
    border: 1px solid #333 !important;
    padding: 8px !important;
    color: #000 !important;
    background: #fff !important;
  }
  .data-table th {
    background: #eee !important;
    font-weight: bold !important;
  }
  .page-header {
    background: #f5f5f5 !important;
    color: #000 !important;
  }
  .page-header p {
    color: #333 !important;
  }
}
`;

export default function PrintTestClient() {
  function handlePrint() {
    window.print();
  }

  function handleScreenshot() {
    alert(
      'Screenshot attempt detected!\n\nIn a real DLP environment, your endpoint agent would:\n- Block the screenshot operation\n- Log the attempt in the DLP console\n- Capture forensic evidence of the attempt\n\nCheck your DLP console for alerts.'
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <PageHeader
        title="Print / Screenshot Test"
        description="Test your endpoint DLP agent's ability to detect and block print or screenshot attempts of sensitive content."
      />
      <main className="container section">
        {/* Info Box */}
        <div className="info-box no-print">
          <strong>Endpoint DLP Required:</strong> Print and screenshot monitoring requires an endpoint DLP agent installed on the workstation. The agent intercepts print spooler operations and screen capture API calls to detect sensitive data being printed or screenshotted.
        </div>

        {/* Printable Sensitive Document */}
        <div className="test-panel">
          <h2>Printable Sensitive Document</h2>

          <h3 style={{ color: '#e53935', fontSize: '1.1rem', marginBottom: '16px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px' }}>
            CONFIDENTIAL &mdash; Employee Records
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SSN</th>
                <th>DOB</th>
                <th>Email</th>
                <th>Bank Account</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John A. Smith</td>
                <td>078-05-1120</td>
                <td>01/15/1985</td>
                <td>john.smith@example.com</td>
                <td>021000021 / 4839201756</td>
              </tr>
              <tr>
                <td>Jane B. Doe</td>
                <td>219-09-9999</td>
                <td>03/22/1990</td>
                <td>jane.doe@example.com</td>
                <td>021000021 / 6712849301</td>
              </tr>
              <tr>
                <td>Robert C. Johnson</td>
                <td>323-45-6789</td>
                <td>07/04/1978</td>
                <td>robert.johnson@example.com</td>
                <td>071000013 / 9928374651</td>
              </tr>
              <tr>
                <td>Sarah M. Williams</td>
                <td>167-23-4567</td>
                <td>11/30/1982</td>
                <td>sarah.williams@example.com</td>
                <td>071000013 / 3345678901</td>
              </tr>
              <tr>
                <td>Michael R. Brown</td>
                <td>482-91-3456</td>
                <td>08/19/1975</td>
                <td>michael.brown@example.com</td>
                <td>026009593 / 8876543210</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ color: '#e53935', fontSize: '1.1rem', margin: '32px 0 16px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Payment Card Information
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Cardholder</th>
                <th>Card Number</th>
                <th>Expiration</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John A. Smith</td>
                <td>4111-1111-1111-1111</td>
                <td>12/2026</td>
                <td>Visa</td>
              </tr>
              <tr>
                <td>Jane B. Doe</td>
                <td>5500-0000-0000-0004</td>
                <td>06/2027</td>
                <td>Mastercard</td>
              </tr>
              <tr>
                <td>Robert C. Johnson</td>
                <td>3400-000000-00009</td>
                <td>09/2025</td>
                <td>American Express</td>
              </tr>
            </tbody>
          </table>

          <div className="no-print" style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-danger" onClick={handlePrint}>
              Print This Page
            </button>
            <button type="button" className="btn btn-outline" onClick={handleScreenshot}>
              Simulate Screenshot Attempt
            </button>
          </div>
        </div>

        {/* Print & Screenshot DLP Tests */}
        <div className="test-panel no-print">
          <h2>Print &amp; Screenshot DLP Tests</h2>
          <p>Test each of the following scenarios to validate your endpoint DLP coverage for print and screen capture.</p>
          <div className="data-types-grid">
            <div className="data-type">
              <h4>Physical Printer</h4>
              <p>Send the document above to a physical printer. Endpoint DLP should intercept the print spooler and detect sensitive data in the print job.</p>
            </div>
            <div className="data-type">
              <h4>Print to PDF</h4>
              <p>Use the &quot;Print to PDF&quot; or &quot;Save as PDF&quot; option. DLP should treat virtual PDF printers the same as physical printers and scan the output.</p>
            </div>
            <div className="data-type">
              <h4>Screen Capture</h4>
              <p>Try using Print Screen, Snipping Tool, or screenshot software while this page is visible. DLP should detect screen capture of sensitive content.</p>
            </div>
            <div className="data-type">
              <h4>Virtual Printer</h4>
              <p>Attempt to print to virtual printers like Microsoft XPS Document Writer or OneNote. DLP should monitor all print destinations equally.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
