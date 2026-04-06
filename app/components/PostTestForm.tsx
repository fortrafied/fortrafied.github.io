'use client';

import { useState, useRef, DragEvent, FormEvent, ChangeEvent } from 'react';

const presets: Record<string, string> = {
  ssn: "Name: John A. Smith\nSSN: 078-05-1120\nDate of Birth: 01/15/1985\n\nName: Jane B. Doe\nSSN: 219-09-9999\nDate of Birth: 03/22/1990\n\nName: Robert C. Johnson\nSSN: 323-45-6789\nDate of Birth: 07/04/1978",
  ccn: "Cardholder: John Smith\nCard Number: 4111-1111-1111-1111\nExpiration: 12/2026\nCVV: 123\n\nCardholder: Jane Doe\nCard Number: 5500-0000-0000-0004\nExpiration: 06/2027\nCVV: 456\n\nCardholder: Bob Wilson\nCard Number: 3400-000000-00009\nExpiration: 09/2025\nCVV: 7890",
  pii: "Employee Record\nName: Sarah M. Williams\nSSN: 167-23-4567\nDOB: 11/30/1982\nEmail: sarah.williams@example.com\nPhone: (555) 234-5678\nAddress: 123 Main St, Springfield, IL 62704\nDriver License: W530-4291-8456",
  phi: "Patient: James T. Anderson\nMRN: MRN-2024-78456\nDOB: 05/12/1965\nDiagnosis: Type 2 Diabetes Mellitus (E11.9)\nHealth Plan ID: HP-882931-A\nProvider: Dr. Emily Chen, MD\nPrescription: Metformin 500mg twice daily\nLab Result: HbA1c 7.2%",
  financial: "Account Holder: Michael R. Brown\nBank: First National Bank\nRouting Number: 021000021\nAccount Number: 123456789012\nSWIFT: FNBOUS33\nIBAN: US12345678901234567890\nTax ID (EIN): 12-3456789",
};

interface ResultState {
  visible: boolean;
  type: 'success' | 'error' | 'info';
  header: string;
  body: string;
}

type ContentTypeOption = {
  value: string;
  label: string;
};

export interface PostTestFormProps {
  /** 'http' or 'https' */
  variant: 'http' | 'https';
}

const httpContentTypes: ContentTypeOption[] = [
  { value: 'text/plain', label: 'text/plain' },
  { value: 'application/json', label: 'application/json' },
  { value: 'application/x-www-form-urlencoded', label: 'application/x-www-form-urlencoded' },
  { value: 'text/csv', label: 'text/csv' },
];

const httpsContentTypes: ContentTypeOption[] = [
  { value: 'text/plain', label: 'text/plain' },
  { value: 'application/json', label: 'application/json' },
  { value: 'application/x-www-form-urlencoded', label: 'application/x-www-form-urlencoded' },
  { value: 'text/csv', label: 'text/csv' },
];

export default function PostTestForm({ variant }: PostTestFormProps) {
  const isHttp = variant === 'http';
  const contentTypes = isHttp ? httpContentTypes : httpsContentTypes;

  const [textData, setTextData] = useState('');
  const [contentType, setContentType] = useState('text/plain');
  const [result, setResult] = useState<ResultState>({ visible: false, type: 'info', header: '', body: '' });
  const [sending, setSending] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState<ResultState>({ visible: false, type: 'info', header: '', body: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadPreset(key: string) {
    setTextData(presets[key] ?? '');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!textData.trim()) return;
    setSending(true);
    setResult({ visible: false, type: 'info', header: '', body: '' });

    try {
      const res = await fetch('/api/dlp-test', {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: textData,
      });
      const data = await res.json();
      if (res.ok) {
        setResult({
          visible: true,
          type: 'success',
          header: 'Data Sent Successfully',
          body: `Status: ${res.status}\nThe data was transmitted via ${isHttp ? 'HTTP' : 'HTTPS'} POST. Check your DLP console for alerts.\n\nResponse:\n${JSON.stringify(data, null, 2)}`,
        });
      } else {
        setResult({
          visible: true,
          type: 'error',
          header: 'Request Blocked or Failed',
          body: `Status: ${res.status}\n${JSON.stringify(data, null, 2)}`,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setResult({
        visible: true,
        type: 'error',
        header: 'Connection Error',
        body: `Could not reach the server. Your DLP or network may have blocked the request.\n\nError: ${message}`,
      });
    } finally {
      setSending(false);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setUploading(true);
    setUploadResult({ visible: false, type: 'info', header: '', body: '' });

    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    try {
      const res = await fetch('/api/dlp-test-upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadResult({
          visible: true,
          type: 'success',
          header: 'Files Uploaded Successfully',
          body: `Status: ${res.status}\nFiles were transmitted via ${isHttp ? 'HTTP' : 'HTTPS'} POST. Check your DLP console for alerts.\n\nResponse:\n${JSON.stringify(data, null, 2)}`,
        });
        setFiles([]);
      } else {
        setUploadResult({
          visible: true,
          type: 'error',
          header: 'Upload Blocked or Failed',
          body: `Status: ${res.status}\n${JSON.stringify(data, null, 2)}`,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setUploadResult({
        visible: true,
        type: 'error',
        header: 'Connection Error',
        body: `Could not reach the server.\n\nError: ${message}`,
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="container section">
      {/* How It Works */}
      <div className="info-box">
        <strong>How this test works:</strong> When you submit data below, your browser sends
        a real {isHttp ? 'HTTP' : 'HTTPS'} POST request. Because Fortrafied is a static site with
        no backend, the request will return a &ldquo;Connection Error&rdquo; &mdash; this is expected.
        The purpose is to generate actual network traffic containing sensitive data so your DLP
        solution can intercept and flag it. Check your DLP console for alerts after submitting.
      </div>

      {/* Alert Box */}
      {isHttp ? (
        <div className="warning-box">
          <strong>&#9888; Unencrypted HTTP:</strong> Data submitted on this page is sent via plaintext HTTP POST. Any network-based DLP solution monitoring HTTP traffic should detect sensitive content in the request body.
        </div>
      ) : (
        <div className="info-box">
          <strong>&#128274; SSL/TLS Inspection Required:</strong> Data submitted on this page is sent via encrypted HTTPS POST. Your DLP solution must perform SSL/TLS inspection (man-in-the-middle decryption) to detect sensitive content within the encrypted tunnel.
        </div>
      )}

      {/* Text Data Test Panel */}
      <div className="test-panel">
        <h2>{isHttp ? 'Send Test Data' : 'Send Test Data (Encrypted)'}</h2>
        <p>
          {isHttp
            ? 'Paste or type sensitive data below and submit it over HTTP POST. Your DLP should flag this transmission.'
            : 'Paste or type sensitive data below and submit it over HTTPS POST. Your DLP must perform SSL inspection to catch this.'}
        </p>

        <div className="mb-3">
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#b0bec5', marginBottom: '8px', fontWeight: 600 }}>
            Quick Fill Presets:
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => loadPreset('ssn')}>SSN Records</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => loadPreset('ccn')}>Credit Cards</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => loadPreset('pii')}>PII Data</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => loadPreset('phi')}>PHI / Medical</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => loadPreset('financial')}>Financial Data</button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="textData">Sensitive Data Payload:</label>
            <textarea
              id="textData"
              className="form-control"
              rows={8}
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
              placeholder="Enter or paste sensitive data here..."
            />
          </div>

          <div className="two-col">
            <div className="form-group">
              <label htmlFor="contentType">Content Type:</label>
              <select
                id="contentType"
                className="form-control"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                {contentTypes.map((ct) => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="targetEndpoint">
                {isHttp ? 'Target Endpoint:' : 'Protocol:'}
              </label>
              <input
                id="targetEndpoint"
                className="form-control"
                type="text"
                value={isHttp ? '/api/dlp-test' : 'HTTPS (TLS encrypted)'}
                readOnly
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-danger" disabled={sending || !textData.trim()}>
              {sending ? <><span className="spinner" /> Sending...</> : `Send ${isHttp ? 'HTTP' : 'HTTPS'} POST`}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setTextData('');
                setResult({ visible: false, type: 'info', header: '', body: '' });
              }}
            >
              Clear
            </button>
          </div>
        </form>

        {result.visible && (
          <div className={`result-box visible ${result.type}`}>
            <div className="result-header">{result.header}</div>
            <div className="result-body">
              <pre>{result.body}</pre>
            </div>
          </div>
        )}
      </div>

      {/* File Upload Test Panel */}
      <div className="test-panel">
        <h2>File Upload Test</h2>
        <p>Upload files containing sensitive data via {isHttp ? 'HTTP' : 'HTTPS'} POST to test file-based DLP detection.</p>

        <div
          className="form-control"
          style={{
            border: dragOver ? '2px dashed #4fc3f7' : '2px dashed #1e2a45',
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'rgba(79,195,247,0.05)' : '#0d1117',
            transition: 'all 0.2s',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>&#128193;</div>
          <p style={{ color: '#b0bec5', marginBottom: '4px' }}>Drag &amp; drop files here or click to browse</p>
          <p style={{ color: '#757575', fontSize: '0.8rem' }}>Supports any file type</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-2">
            <table className="data-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {files.map((f, i) => (
                  <tr key={`${f.name}-${i}`}>
                    <td><span className="file-icon">&#128196;</span>{f.name}</td>
                    <td>{(f.size / 1024).toFixed(1)} KB</td>
                    <td>{f.type || 'unknown'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => removeFile(i)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2">
              <button
                type="button"
                className="btn btn-danger"
                disabled={uploading}
                onClick={handleUpload}
              >
                {uploading ? <><span className="spinner" /> Uploading...</> : `Upload via ${isHttp ? 'HTTP' : 'HTTPS'} POST`}
              </button>
            </div>
          </div>
        )}

        {uploadResult.visible && (
          <div className={`result-box visible ${uploadResult.type}`}>
            <div className="result-header">{uploadResult.header}</div>
            <div className="result-body">
              <pre>{uploadResult.body}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Section */}
      <div className="test-panel">
        {isHttp ? (
          <>
            <h2>What This Tests</h2>
            <div className="two-col mt-3">
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px' }}>Network DLP (Data in Motion)</h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#9e9e9e', fontSize: '0.9rem' }}>
                  <li style={{ marginBottom: '8px' }}>HTTP POST body content inspection</li>
                  <li style={{ marginBottom: '8px' }}>Pattern matching for SSN, CCN, and other PII</li>
                  <li style={{ marginBottom: '8px' }}>File upload content scanning</li>
                  <li style={{ marginBottom: '8px' }}>Plaintext protocol monitoring</li>
                </ul>
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px' }}>Expected DLP Behavior</h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#9e9e9e', fontSize: '0.9rem' }}>
                  <li style={{ marginBottom: '8px' }}>Alert generated in DLP console</li>
                  <li style={{ marginBottom: '8px' }}>Incident created with matched policy</li>
                  <li style={{ marginBottom: '8px' }}>In block mode: request should be blocked</li>
                  <li style={{ marginBottom: '8px' }}>Evidence capture of transmitted data</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2>HTTPS vs HTTP</h2>
            <div className="two-col mt-3">
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px' }}>Without SSL Inspection</h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#9e9e9e', fontSize: '0.9rem' }}>
                  <li style={{ marginBottom: '8px' }}>DLP cannot see encrypted payload contents</li>
                  <li style={{ marginBottom: '8px' }}>Only metadata (destination, size) is visible</li>
                  <li style={{ marginBottom: '8px' }}>Sensitive data passes through undetected</li>
                  <li style={{ marginBottom: '8px' }}>This is a major gap in many DLP deployments</li>
                </ul>
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px' }}>With SSL Inspection</h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#9e9e9e', fontSize: '0.9rem' }}>
                  <li style={{ marginBottom: '8px' }}>DLP proxy decrypts TLS traffic for inspection</li>
                  <li style={{ marginBottom: '8px' }}>Full content analysis identical to HTTP</li>
                  <li style={{ marginBottom: '8px' }}>Pattern matching and policy enforcement apply</li>
                  <li style={{ marginBottom: '8px' }}>Traffic is re-encrypted before forwarding</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
