'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { downloadJSON, downloadCSV, copyJSON } from '../lib/export-utils';
import {
  type ClassifierDef,
  sevOrder,
  sevColor,
  builtinClassifiers,
  loadCustomClassifiers,
  buildRegex,
} from '../lib/classifiers';
import { type DocumentProperty, type ParsedFile, parseFile, ACCEPTED_TYPES } from '../lib/file-parser';

const samples: Record<string, string> = {
  mixed:
    'Employee Record - CONFIDENTIAL\n\nName: Sarah M. Williams\nSSN: 167-23-4567\nDate of Birth: 11/30/1982\nEmail: sarah.williams@example.com\nPhone: (555) 234-5678\nAddress: 123 Main St, Springfield, IL 62704\n\nPayment Information:\nVisa: 4111-1111-1111-1111, Exp: 12/2026, CVV: 123\nBank Routing: 021000021\nBank Account: 9876543210\n\nNetwork Access:\nIP: 192.168.1.100\nVPN: 10.0.0.45\n\nAPI Access:\nKey: AKIAIOSFODNN7EXAMPLE1',
  email_body:
    'From: hr@company.com\nTo: payroll@company.com\nSubject: Updated Employee Benefits\n\nHi Payroll Team,\n\nPlease update the following employee records:\n\nJohn Smith - SSN: 078-05-1120\n  Direct Deposit Routing: 021000021\n  Account: 1234567890\n  Visa card on file: 4111-1111-1111-1111\n\nJane Doe - SSN: 219-09-9999\n  DOB: 03/22/1990\n  Email: jane.doe@example.com\n  Phone: (555) 987-6543\n\nPlease process by EOD Friday.\n\nThanks,\nHR Department',
  medical:
    'PATIENT MEDICAL RECORD - HIPAA PROTECTED\n\nPatient: James T. Anderson\nMRN: MRN-2024-78456\nDate of Birth: 05/12/1965\nSSN: 456-78-9012\nHealth Plan ID: HP-882931-A\n\nDiagnosis: Type 2 Diabetes Mellitus (ICD-10: E11.9)\nSecondary: Essential Hypertension (ICD-10: I10)\n\nMedications:\n- Metformin 500mg BID\n- Lisinopril 10mg daily\n\nLab Results (01/15/2024):\n- HbA1c: 7.2%\n- Fasting Glucose: 145 mg/dL\n- Blood Pressure: 138/88 mmHg\n\nProvider: Dr. Emily Chen, MD\nNPI: 1234567890',
  financial:
    'QUARTERLY FINANCIAL REPORT - CONFIDENTIAL\n\nCompany: Acme Corp\nEIN: 12-3456789\n\nBank Details:\nPrimary Account\n  Bank: First National Bank\n  Routing: 021000021\n  Account: 9876543210\n  SWIFT: FNBOUS33\n  IBAN: US12345678901234567890\n\nCorporate Card:\n  Cardholder: CFO Office\n  Amex: 3400-000000-00009\n  Exp: 12/2026\n\nWire Transfer Details:\n  Beneficiary: Acme Corp\n  Account: 1234567890\n  Reference: INV-2024-0456',
};

type InputMode = 'paste' | 'file';

interface ClassifyResult {
  name: string;
  category: string;
  severity: string;
  count: number;
  matches: string[];
  tag: string;
  builtin: boolean;
}

const sourceLabels: Record<string, string> = {
  file: 'File Info',
  core: 'Core Properties',
  app: 'Application',
  custom: 'Custom Properties',
  classification: 'Classification Label',
  'content-types': 'Content Types',
  'custom-xml': 'Custom XML',
  'pdf-info': 'PDF Info',
  'pdf-custom': 'PDF Custom',
  xmp: 'XMP Metadata',
  vera: 'Vera Encryption',
  html: 'HTML Metadata',
};

function SourceBadge({ source }: { source: string }) {
  const isClassification = source === 'classification';
  const isVera = source === 'vera';
  const tagClass = isClassification ? 'tag-red' : isVera ? 'tag-purple' : 'tag-blue';
  return (
    <span
      className={`tag ${tagClass}`}
      style={{ fontSize: '0.65rem' }}
    >
      {sourceLabels[source] ?? source}
    </span>
  );
}

function DocumentPropertiesPanel({ properties, classificationLabels }: {
  properties: DocumentProperty[];
  classificationLabels: DocumentProperty[];
}) {
  return (
    <div className="test-panel">
      {/* Classification labels - prominent display */}
      {classificationLabels.length > 0 && (
        <>
          <h2 style={{ marginBottom: 4 }}>Classification Labels Detected</h2>
          <p style={{ color: '#9e9e9e', fontSize: '0.9rem', marginBottom: 16 }}>
            The following classification/sensitivity labels were found in the document metadata.
          </p>
          <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
            {classificationLabels.map((label, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(198,40,40,0.08)',
                  border: '1px solid rgba(198,40,40,0.3)',
                  borderRadius: 8,
                  padding: '14px 18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#ef5350', fontWeight: 700, fontSize: '0.95rem' }}>{label.name}</span>
                  <span className="tag tag-orange" style={{ fontSize: '0.6rem' }}>{label.source}</span>
                </div>
                <div style={{ color: '#e0e0e0', fontFamily: "'Consolas','Monaco',monospace", fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  {label.value}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {classificationLabels.length === 0 && (
        <div className="info-box" style={{ marginBottom: 16 }}>
          <strong>No classification labels detected.</strong> This document does not contain metadata tags from known classification products (Microsoft Purview/MIP, Titus, Boldon James, Fortra Digital Guardian, etc.).
        </div>
      )}

      {/* All document properties */}
      <h2 style={{ marginBottom: 4 }}>Document Properties</h2>
      <p style={{ color: '#9e9e9e', fontSize: '0.9rem', marginBottom: 16 }}>
        All metadata properties extracted from the file.
      </p>
      <table className="data-table">
        <thead>
          <tr><th>Property</th><th>Value</th><th>Source</th></tr>
        </thead>
        <tbody>
          {properties.map((prop, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{prop.name}</td>
              <td style={{ fontFamily: "'Consolas','Monaco',monospace", fontSize: '0.8rem', wordBreak: 'break-all' }}>
                {prop.value}
              </td>
              <td><SourceBadge source={prop.source} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DataClassifierClient() {
  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [input, setInput] = useState('');
  const [results, setResults] = useState<ClassifyResult[] | null>(null);
  const [customCount, setCustomCount] = useState(0);
  const [allClassifiers, setAllClassifiers] = useState<ClassifierDef[]>(builtinClassifiers);

  // File upload state
  const [dragOver, setDragOver] = useState(false);
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');

  useEffect(() => {
    const custom = loadCustomClassifiers();
    setCustomCount(custom.length);
    setAllClassifiers([...builtinClassifiers, ...custom]);
  }, []);

  function runClassification(text: string) {
    if (!text.trim()) return;
    const found: ClassifyResult[] = [];
    for (const c of allClassifiers) {
      try {
        const re = buildRegex(c);
        const matches: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
          matches.push(m[0]);
          if (!re.global) break;
        }
        if (matches.length > 0) {
          found.push({ name: c.name, category: c.category, severity: c.severity, count: matches.length, matches, tag: c.tag, builtin: c.builtin });
        }
      } catch {
        // skip invalid patterns
      }
    }
    found.sort((a, b) => sevOrder[b.severity] - sevOrder[a.severity]);
    setResults(found);
  }

  function classifyPaste() {
    runClassification(input);
  }

  function classifyFile() {
    if (parsedFile) runClassification(parsedFile.text);
  }

  const handleFile = useCallback(async (file: File) => {
    setParsing(true);
    setParseError('');
    setParsedFile(null);
    setResults(null);
    try {
      const result = await parseFile(file);
      setParsedFile(result);
      // Auto-classify after parsing
      runClassification(result.text);
    } catch (e: unknown) {
      setParseError((e as Error).message || 'Failed to parse file.');
    } finally {
      setParsing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClassifiers]);

  function reloadCustom() {
    const custom = loadCustomClassifiers();
    setCustomCount(custom.length);
    setAllClassifiers([...builtinClassifiers, ...custom]);
  }

  function clearAll() {
    setInput('');
    setParsedFile(null);
    setParseError('');
    setResults(null);
  }

  const totalMatches = results ? results.reduce((s, r) => s + r.count, 0) : 0;
  const maxSeverity = results && results.length > 0 ? results[0].severity : 'Low';
  const categories: Record<string, number> = {};
  if (results) {
    for (const r of results) {
      categories[r.category] = (categories[r.category] || 0) + r.count;
    }
  }

  return (
    <>
      <div className="info-box">
        <strong>Client-Side Only:</strong> All classification and file parsing runs locally in your browser. No data is transmitted to any server.
        {' '}Using {builtinClassifiers.length} built-in + {customCount} custom classifier{customCount !== 1 ? 's' : ''}.
      </div>

      {customCount > 0 && (
        <div style={{ background: 'rgba(79,195,247,0.08)', border: '1px solid rgba(79,195,247,0.2)', borderRadius: 8, padding: '12px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#4fc3f7', fontSize: '0.9rem' }}>
            <strong>{customCount}</strong> custom classifier{customCount !== 1 ? 's' : ''} loaded from{' '}
            <Link href="/classification-builder">Classification Builder</Link>
          </span>
          <button className="btn btn-sm btn-outline" onClick={reloadCustom}>Reload</button>
        </div>
      )}

      {/* Input mode toggle */}
      <div className="test-panel">
        <h2>Classify Content</h2>
        <p style={{ marginBottom: 16 }}>Paste text directly or upload a file to scan for sensitive data and inspect document metadata.</p>

        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <button
            className={`tab-btn${inputMode === 'paste' ? ' active' : ''}`}
            onClick={() => setInputMode('paste')}
          >
            Paste Text
          </button>
          <button
            className={`tab-btn${inputMode === 'file' ? ' active' : ''}`}
            onClick={() => setInputMode('file')}
          >
            Upload File
          </button>
        </div>

        {inputMode === 'paste' ? (
          <>
            <div className="form-group mt-2">
              <label>Quick Fill Sample Data</label>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-sm btn-outline" onClick={() => setInput(samples.mixed)}>Mixed Sensitive Data</button>
                <button className="btn btn-sm btn-outline" onClick={() => setInput(samples.email_body)}>Sample Email Body</button>
                <button className="btn btn-sm btn-outline" onClick={() => setInput(samples.medical)}>Medical Records</button>
                <button className="btn btn-sm btn-outline" onClick={() => setInput(samples.financial)}>Financial Report</button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="classifyInput">Paste Content to Classify</label>
              <textarea
                id="classifyInput"
                className="form-control"
                rows={12}
                placeholder={'Paste any text here to automatically identify sensitive data types...\n\nThe classifier will detect SSNs, credit cards, emails, phone numbers, dates of birth, medical records, financial data, and more.'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" onClick={classifyPaste}>Classify Data</button>{' '}
            <button className="btn btn-outline" onClick={clearAll}>Clear</button>
          </>
        ) : (
          <>
            <div
              style={{
                border: `2px dashed ${dragOver ? '#4fc3f7' : '#1e2a45'}`,
                borderRadius: 12,
                padding: 48,
                textAlign: 'center',
                margin: '16px 0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: dragOver ? 'rgba(79,195,247,0.05)' : 'transparent',
              }}
              onClick={() => document.getElementById('classifyFileInput')?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
              }}
            >
              <div style={{ fontSize: '2rem', color: '#4fc3f7', marginBottom: 12 }}>&#128196;</div>
              <p style={{ color: '#9e9e9e', marginBottom: 8 }}>Drag &amp; drop a file here, or click to browse</p>
              <p style={{ color: '#616161', fontSize: '0.8rem' }}>
                Supports: .docx, .xlsx, .pptx, .pdf, .txt, .html
              </p>
              <input
                type="file"
                id="classifyFileInput"
                accept={ACCEPTED_TYPES}
                style={{ display: 'none' }}
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>

            {parsing && (
              <div className="text-center mt-2">
                <span className="spinner" />{' '}
                <span style={{ color: '#9e9e9e' }}>Parsing file and extracting content...</span>
              </div>
            )}

            {parseError && (
              <div className="result-box visible error" style={{ display: 'block' }}>
                <div className="result-header">Parse Error</div>
                <div className="result-body">{parseError}</div>
              </div>
            )}

            {parsedFile && !parsing && (
              <div style={{ background: '#0d1117', border: '1px solid #1e2a45', borderRadius: 8, padding: '14px 18px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#4fc3f7', fontWeight: 600 }}>{parsedFile.fileType}</span>
                    <span style={{ color: '#9e9e9e', marginLeft: 12 }}>
                      {parsedFile.text.length.toLocaleString()} characters extracted
                    </span>
                    {parsedFile.classificationLabels.length > 0 && (
                      <span className="tag tag-red" style={{ marginLeft: 12, fontSize: '0.65rem' }}>
                        {parsedFile.classificationLabels.length} classification label{parsedFile.classificationLabels.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span style={{ color: '#757575', marginLeft: 12 }}>
                      {parsedFile.properties.length} properties
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-primary" onClick={classifyFile}>Re-classify</button>
                    <button className="btn btn-sm btn-outline" onClick={clearAll}>Clear</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Document properties — shown when a file is loaded */}
      {parsedFile && !parsing && (
        <DocumentPropertiesPanel
          properties={parsedFile.properties}
          classificationLabels={parsedFile.classificationLabels}
        />
      )}

      {/* Extracted text preview for file mode */}
      {parsedFile && !parsing && parsedFile.text && (
        <div className="test-panel">
          <h2>Extracted Text Content</h2>
          <p style={{ color: '#9e9e9e', fontSize: '0.9rem', marginBottom: 12 }}>
            Text extracted from the uploaded file. This content was scanned by the classifiers above.
          </p>
          <div
            className="code-block"
            style={{ maxHeight: 300, overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}
          >
            {parsedFile.text.slice(0, 10000)}
            {parsedFile.text.length > 10000 && `\n\n... (${(parsedFile.text.length - 10000).toLocaleString()} more characters)`}
          </div>
        </div>
      )}

      {/* Classification results */}
      {results !== null && (
        <div className="test-panel">
          <h2>Classification Results</h2>

          {results.length === 0 ? (
            <div className="info-box mt-3">
              <strong>No sensitive data detected.</strong> The text does not contain patterns matching known sensitive data types.
              {customCount === 0 && (
                <span> Try adding custom classifiers in the <Link href="/classification-builder">Classification Builder</Link>.</span>
              )}
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
                <div style={{ background: '#0d1117', border: '1px solid #1e2a45', borderRadius: 8, padding: '16px 24px', flex: 1, minWidth: 150 }}>
                  <div style={{ color: '#9e9e9e', fontSize: '0.8rem' }}>Total Matches</div>
                  <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700 }}>{totalMatches}</div>
                </div>
                <div style={{ background: '#0d1117', border: '1px solid #1e2a45', borderRadius: 8, padding: '16px 24px', flex: 1, minWidth: 150 }}>
                  <div style={{ color: '#9e9e9e', fontSize: '0.8rem' }}>Data Types Found</div>
                  <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700 }}>{results.length}</div>
                </div>
                <div style={{ background: '#0d1117', border: '1px solid #1e2a45', borderRadius: 8, padding: '16px 24px', flex: 1, minWidth: 150 }}>
                  <div style={{ color: '#9e9e9e', fontSize: '0.8rem' }}>Highest Severity</div>
                  <div style={{ color: sevColor[maxSeverity], fontSize: '1.8rem', fontWeight: 700 }}>{maxSeverity}</div>
                </div>
                <div style={{ background: '#0d1117', border: '1px solid #1e2a45', borderRadius: 8, padding: '16px 24px', flex: 1, minWidth: 150 }}>
                  <div style={{ color: '#9e9e9e', fontSize: '0.8rem' }}>Categories</div>
                  <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700 }}>{Object.keys(categories).length}</div>
                </div>
              </div>

              {/* Results table */}
              <table className="data-table mt-3">
                <thead>
                  <tr><th>Data Type</th><th>Category</th><th>Severity</th><th>Count</th><th>Sample Matches</th></tr>
                </thead>
                <tbody>
                  {results.map((r) => {
                    const sample = r.matches.slice(0, 3).join(', ') + (r.matches.length > 3 ? ', ...' : '');
                    return (
                      <tr key={r.name}>
                        <td>
                          {r.name}
                          {!r.builtin && <span className="tag tag-purple" style={{ marginLeft: 8, fontSize: '0.6rem' }}>Custom</span>}
                        </td>
                        <td><span className={`tag ${r.tag}`}>{r.category}</span></td>
                        <td style={{ color: sevColor[r.severity], fontWeight: 600 }}>{r.severity}</td>
                        <td>{r.count}</td>
                        <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{sample}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Categories breakdown */}
              <h3 style={{ color: '#fff', marginTop: 24, marginBottom: 12 }}>Categories Breakdown</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(categories).map(([cat, count]) => (
                  <div key={cat} style={{ background: 'rgba(79,195,247,0.08)', border: '1px solid rgba(79,195,247,0.2)', borderRadius: 8, padding: '12px 20px' }}>
                    <span style={{ color: '#4fc3f7', fontWeight: 600 }}>{cat}</span>
                    <span style={{ color: '#9e9e9e', marginLeft: 8 }}>{count} match{count !== 1 ? 'es' : ''}</span>
                  </div>
                ))}
              </div>

              {/* Export */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #1e2a45', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: '#757575', fontSize: '0.85rem', marginRight: 8 }}>Export Results:</span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const exportData = {
                      timestamp: new Date().toISOString(),
                      summary: { totalMatches, dataTypesFound: results.length, highestSeverity: maxSeverity, categories },
                      findings: results.map(r => ({ name: r.name, category: r.category, severity: r.severity, matchCount: r.count, sampleMatches: r.matches.slice(0, 5) })),
                    };
                    copyJSON(exportData);
                  }}
                >
                  Copy JSON
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const exportData = {
                      timestamp: new Date().toISOString(),
                      summary: { totalMatches, dataTypesFound: results.length, highestSeverity: maxSeverity, categories },
                      findings: results.map(r => ({ name: r.name, category: r.category, severity: r.severity, matchCount: r.count, matches: r.matches })),
                    };
                    downloadJSON(exportData, `classification-results-${Date.now()}.json`);
                  }}
                >
                  Download JSON
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const headers = ['Data Type', 'Category', 'Severity', 'Match Count', 'Sample Matches'];
                    const rows = results.map(r => [r.name, r.category, r.severity, String(r.count), r.matches.slice(0, 5).join('; ')]);
                    downloadCSV(headers, rows, `classification-results-${Date.now()}.csv`);
                  }}
                >
                  Download CSV
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="test-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0 }}>Detected Data Types Reference</h2>
            <p style={{ color: '#9e9e9e', fontSize: '0.9rem', marginTop: 4 }}>
              {builtinClassifiers.length} built-in classifiers + {customCount} custom.{' '}
              <Link href="/classification-builder">Manage custom classifiers</Link>
            </p>
          </div>
          <Link href="/classification-builder" className="btn btn-outline">
            + Build Custom
          </Link>
        </div>
        <div className="data-types-grid mt-3">
          <div className="data-type"><h4>PII</h4><p>SSN, Date of Birth, Phone Numbers, Email Addresses, Physical Addresses, Driver&apos;s License Numbers</p></div>
          <div className="data-type"><h4>PCI</h4><p>Visa, Mastercard, American Express, Discover credit card numbers, CVV codes, expiration dates</p></div>
          <div className="data-type"><h4>PHI</h4><p>Medical Record Numbers, ICD-10 codes, Health Plan IDs, HIPAA-related keywords</p></div>
          <div className="data-type"><h4>Financial</h4><p>Bank Routing Numbers, SWIFT/BIC codes, IBAN numbers, EIN/Tax IDs</p></div>
          <div className="data-type"><h4>Network</h4><p>IPv4 Addresses, IPv6 Addresses, MAC Addresses, URLs</p></div>
          <div className="data-type"><h4>Credentials</h4><p>AWS Access Keys, API Tokens, Database Connection Strings, Private Key Headers</p></div>
        </div>
      </div>
    </>
  );
}
