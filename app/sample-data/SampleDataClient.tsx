'use client';

import { useState, useCallback } from 'react';

/* ===== Fake Data Pools ===== */
const FIRST_NAMES = ['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen','Christopher','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra'];
const LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson'];
const STREETS = ['123 Main St','456 Oak Ave','789 Elm Dr','321 Pine Ln','654 Maple Ct','987 Cedar Blvd','111 Birch Way','222 Walnut Rd','333 Cherry St','444 Spruce Ave'];
const CITIES = ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','Austin','Jacksonville','San Jose','Columbus','Charlotte','Indianapolis'];
const STATES = ['NY','CA','IL','TX','AZ','PA','TX','CA','TX','TX','FL','CA','OH','NC','IN'];
const DOMAINS = ['example.com','test.org','sample.net','demo.io','mail.com','inbox.org','testmail.net'];
const DIAGNOSES = ['J06.9 - Acute Upper Respiratory Infection','E11.9 - Type 2 Diabetes Mellitus','I10 - Essential Hypertension','M54.5 - Low Back Pain','J45.909 - Unspecified Asthma','K21.0 - GERD','F32.9 - Major Depressive Disorder','G43.909 - Migraine'];
const TREATMENTS = ['Amoxicillin 500mg TID','Metformin 1000mg BID','Lisinopril 10mg QD','Ibuprofen 400mg PRN','Albuterol Inhaler PRN','Omeprazole 20mg QD','Sertraline 50mg QD','Sumatriptan 50mg PRN'];
const BANKS = ['Chase','Bank of America','Wells Fargo','Citibank','US Bank','PNC','Capital One','TD Bank'];
const SWIFT_CODES = ['CHASUS33','BOFAUS3N','WFBIUS6S','CITIUS33','USBKUS44','PNCCUS33','HIBKUS3M','NRTHUS33'];

/* ===== Generators ===== */
function rand(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad(n: number, len: number) { return String(n).padStart(len, '0'); }

function genSSN() { return `${pad(randInt(100,999),3)}-${pad(randInt(10,99),2)}-${pad(randInt(1000,9999),4)}`; }
function genDOB() { return `${pad(randInt(1,12),2)}/${pad(randInt(1,28),2)}/${randInt(1950,2005)}`; }
function genPhone() { return `(${randInt(200,999)}) ${randInt(200,999)}-${pad(randInt(1000,9999),4)}`; }
function genEmail(first: string, last: string) { return `${first.toLowerCase()}.${last.toLowerCase()}@${rand(DOMAINS)}`; }
function genMRN() { return `MRN-${pad(randInt(100000,999999),6)}`; }
function genRouting() { return pad(randInt(10000000,99999999),8) + String(randInt(0,9)); }
function genAccount() { return pad(randInt(1000000000,9999999999),10); }

function genVisa() {
  const base = '4' + Array.from({length:15}, () => randInt(0,9)).join('');
  return base.replace(/(.{4})/g, '$1-').slice(0,-1);
}
function genMC() {
  const prefix = `5${randInt(1,5)}`;
  const base = prefix + Array.from({length:14}, () => randInt(0,9)).join('');
  return base.replace(/(.{4})/g, '$1-').slice(0,-1);
}
function genAmex() {
  const prefix = `3${randInt(0,1) === 0 ? '4' : '7'}`;
  const base = prefix + Array.from({length:13}, () => randInt(0,9)).join('');
  return base.slice(0,4) + '-' + base.slice(4,10) + '-' + base.slice(10);
}

function genAPIKey() { return 'AKIA' + Array.from({length:16}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[randInt(0,35)]).join(''); }
function genToken() {
  const prefixes = ['tok_','sk_test_','pk_test_','api_'];
  return rand(prefixes) + Array.from({length:24}, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[randInt(0,35)]).join('');
}

type DataType = 'pii_ssn' | 'pci' | 'pii_email' | 'phi' | 'financial' | 'mixed' | 'credentials';

interface Record {
  [key: string]: string;
}

function generateRecords(dataType: DataType, count: number): { headers: string[]; rows: Record[] } {
  const rows: Record[] = [];
  let headers: string[] = [];

  for (let i = 0; i < count; i++) {
    const first = rand(FIRST_NAMES);
    const last = rand(LAST_NAMES);
    let row: Record = {};

    switch (dataType) {
      case 'pii_ssn':
        headers = ['Full Name','SSN','Date of Birth','Address','Phone'];
        row = { 'Full Name': `${first} ${last}`, SSN: genSSN(), 'Date of Birth': genDOB(), Address: `${rand(STREETS)}, ${rand(CITIES)}, ${rand(STATES)} ${pad(randInt(10000,99999),5)}`, Phone: genPhone() };
        break;
      case 'pci':
        headers = ['Cardholder Name','Card Number','Expiry','CVV','Billing Zip'];
        row = { 'Cardholder Name': `${first} ${last}`, 'Card Number': [genVisa,genMC,genAmex][randInt(0,2)](), Expiry: `${pad(randInt(1,12),2)}/${randInt(25,30)}`, CVV: `${randInt(100,9999)}`, 'Billing Zip': pad(randInt(10000,99999),5) };
        break;
      case 'pii_email':
        headers = ['Full Name','Date of Birth','Email','Phone','Address'];
        row = { 'Full Name': `${first} ${last}`, 'Date of Birth': genDOB(), Email: genEmail(first, last), Phone: genPhone(), Address: `${rand(STREETS)}, ${rand(CITIES)}, ${rand(STATES)}` };
        break;
      case 'phi':
        headers = ['Patient Name','MRN','Date of Birth','Diagnosis','Treatment','Provider'];
        row = { 'Patient Name': `${first} ${last}`, MRN: genMRN(), 'Date of Birth': genDOB(), Diagnosis: rand(DIAGNOSES), Treatment: rand(TREATMENTS), Provider: `Dr. ${rand(LAST_NAMES)}` };
        break;
      case 'financial':
        headers = ['Account Holder','Bank','Account Number','Routing Number','SWIFT Code'];
        row = { 'Account Holder': `${first} ${last}`, Bank: rand(BANKS), 'Account Number': genAccount(), 'Routing Number': genRouting(), 'SWIFT Code': rand(SWIFT_CODES) };
        break;
      case 'mixed':
        headers = ['Full Name','SSN','Card Number','MRN','Email','Phone'];
        row = { 'Full Name': `${first} ${last}`, SSN: genSSN(), 'Card Number': genVisa(), MRN: genMRN(), Email: genEmail(first, last), Phone: genPhone() };
        break;
      case 'credentials':
        headers = ['Service','API Key','Token','Environment','Created'];
        row = { Service: ['AWS','Stripe','GitHub','Slack','Twilio'][randInt(0,4)], 'API Key': genAPIKey(), Token: genToken(), Environment: ['production','staging','development'][randInt(0,2)], Created: `2024-${pad(randInt(1,12),2)}-${pad(randInt(1,28),2)}` };
        break;
    }
    rows.push(row);
  }
  return { headers, rows };
}

/* ===== Formatters ===== */
function toCSV(headers: string[], rows: Record[]) {
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(headers.map(h => `"${(r[h] || '').replace(/"/g,'""')}"`).join(','));
  return lines.join('\n');
}
function toTSV(headers: string[], rows: Record[]) {
  const lines = [headers.join('\t')];
  for (const r of rows) lines.push(headers.map(h => r[h] || '').join('\t'));
  return lines.join('\n');
}
function toJSON(headers: string[], rows: Record[]) {
  void headers;
  return JSON.stringify(rows, null, 2);
}
function toXML(headers: string[], rows: Record[]) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<records>\n';
  for (const r of rows) {
    xml += '  <record>\n';
    for (const h of headers) {
      const tag = h.replace(/[^a-zA-Z0-9]/g, '_');
      xml += `    <${tag}>${(r[h] || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</${tag}>\n`;
    }
    xml += '  </record>\n';
  }
  xml += '</records>';
  return xml;
}
function toTXT(headers: string[], rows: Record[]) {
  const lines: string[] = [];
  rows.forEach((r, i) => {
    lines.push(`--- Record ${i + 1} ---`);
    for (const h of headers) lines.push(`${h}: ${r[h] || ''}`);
    lines.push('');
  });
  return lines.join('\n');
}
function toHTML(headers: string[], rows: Record[]) {
  let html = '<table border="1" cellpadding="6" cellspacing="0">\n<thead><tr>';
  for (const h of headers) html += `<th>${h}</th>`;
  html += '</tr></thead>\n<tbody>\n';
  for (const r of rows) {
    html += '<tr>';
    for (const h of headers) html += `<td>${(r[h] || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</td>`;
    html += '</tr>\n';
  }
  html += '</tbody>\n</table>';
  return html;
}

type Format = 'csv' | 'tsv' | 'json' | 'xml' | 'txt' | 'html';

const formatters: { [k in Format]: (h: string[], r: Record[]) => string } = { csv: toCSV, tsv: toTSV, json: toJSON, xml: toXML, txt: toTXT, html: toHTML };
const mimeTypes: { [k in Format]: string } = { csv: 'text/csv', tsv: 'text/tab-separated-values', json: 'application/json', xml: 'application/xml', txt: 'text/plain', html: 'text/html' };
const extensions: { [k in Format]: string } = { csv: '.csv', tsv: '.tsv', json: '.json', xml: '.xml', txt: '.txt', html: '.html' };

const DATA_TYPE_OPTIONS: { value: DataType; label: string }[] = [
  { value: 'pii_ssn', label: 'PII: Name / SSN / DOB' },
  { value: 'pci', label: 'PCI: Name / Credit Card / Zip' },
  { value: 'pii_email', label: 'PII: Name / DOB / Email' },
  { value: 'phi', label: 'PHI: Patient Records' },
  { value: 'financial', label: 'Financial: Bank / Routing / SWIFT' },
  { value: 'mixed', label: 'Mixed: PII + PCI + PHI' },
  { value: 'credentials', label: 'Credentials: API Keys / Tokens' },
];

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'tsv', label: 'TSV' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'txt', label: 'Plain Text' },
  { value: 'html', label: 'HTML Table' },
];

const COUNT_OPTIONS = [
  { value: 10, label: '10 (~1KB)' },
  { value: 50, label: '50 (~5KB)' },
  { value: 100, label: '100 (~10KB)' },
  { value: 500, label: '500 (~50KB)' },
  { value: 1000, label: '1,000 (~100KB)' },
  { value: 5000, label: '5,000 (~500KB)' },
  { value: 10000, label: '10,000 (~1MB)' },
];

interface PreBuiltFile {
  name: string;
  dataType: DataType;
  tags: { label: string; color: string }[];
  records: number;
  format: Format;
}

const PRE_BUILT_FILES: PreBuiltFile[] = [
  { name: 'pii_names_ssn_50.csv', dataType: 'pii_ssn', tags: [{ label: 'PII', color: 'tag-blue' }, { label: 'SSN', color: 'tag-red' }], records: 50, format: 'csv' },
  { name: 'pci_credit_cards_50.csv', dataType: 'pci', tags: [{ label: 'PCI', color: 'tag-orange' }, { label: 'Credit Card', color: 'tag-red' }], records: 50, format: 'csv' },
  { name: 'phi_patient_records_50.json', dataType: 'phi', tags: [{ label: 'PHI', color: 'tag-green' }, { label: 'MRN', color: 'tag-blue' }], records: 50, format: 'json' },
  { name: 'financial_bank_data_100.csv', dataType: 'financial', tags: [{ label: 'Financial', color: 'tag-purple' }, { label: 'Routing', color: 'tag-blue' }], records: 100, format: 'csv' },
  { name: 'mixed_pii_pci_phi_100.xml', dataType: 'mixed', tags: [{ label: 'PII', color: 'tag-blue' }, { label: 'PCI', color: 'tag-orange' }, { label: 'PHI', color: 'tag-green' }], records: 100, format: 'xml' },
  { name: 'credentials_api_keys_50.txt', dataType: 'credentials', tags: [{ label: 'Credentials', color: 'tag-red' }, { label: 'API Keys', color: 'tag-purple' }], records: 50, format: 'txt' },
  { name: 'pii_email_phone_200.tsv', dataType: 'pii_email', tags: [{ label: 'PII', color: 'tag-blue' }, { label: 'Email', color: 'tag-green' }], records: 200, format: 'tsv' },
  { name: 'mixed_all_types_500.csv', dataType: 'mixed', tags: [{ label: 'PII', color: 'tag-blue' }, { label: 'PCI', color: 'tag-orange' }, { label: 'PHI', color: 'tag-green' }], records: 500, format: 'csv' },
];

const CATEGORIES = [
  { title: 'PII \u2014 Personally Identifiable Information', desc: 'Social Security Numbers, Names, Dates of Birth, Addresses, Phone Numbers, Driver\u2019s License Numbers' },
  { title: 'PCI \u2014 Payment Card Industry', desc: 'Credit Card Numbers (Visa, MC, Amex, Discover), CVV Codes, Expiration Dates, Cardholder Names' },
  { title: 'PHI \u2014 Protected Health Information', desc: 'Medical Record Numbers, Health Plan IDs, Diagnosis Codes, Patient Names, Treatment Records' },
  { title: 'Financial Data', desc: 'Bank Account Numbers, Routing Numbers, SWIFT/BIC Codes, IBAN Numbers, Tax IDs' },
  { title: 'Credentials & Secrets', desc: 'API Keys, Access Tokens, Connection Strings, Private Keys (for detection testing only)' },
  { title: 'Custom / Intellectual Property', desc: 'Source Code Keywords, Proprietary Document Markers, Classification Labels, Custom Regex Patterns' },
];

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SampleDataClient() {
  const [dataType, setDataType] = useState<DataType>('pii_ssn');
  const [format, setFormat] = useState<Format>('csv');
  const [count, setCount] = useState(50);
  const [preview, setPreview] = useState('');

  const handleGenerate = useCallback(() => {
    const { headers, rows } = generateRecords(dataType, count);
    const content = formatters[format](headers, rows);
    const filename = `sample_${dataType}_${count}${extensions[format]}`;
    // Show preview (first ~40 lines)
    const previewLines = content.split('\n').slice(0, 40);
    setPreview(previewLines.join('\n') + (content.split('\n').length > 40 ? '\n...' : ''));
    downloadBlob(content, filename, mimeTypes[format]);
  }, [dataType, format, count]);

  const handlePreBuiltDownload = useCallback((file: PreBuiltFile) => {
    const { headers, rows } = generateRecords(file.dataType, file.records);
    const content = formatters[file.format](headers, rows);
    downloadBlob(content, file.name, mimeTypes[file.format]);
  }, []);

  return (
    <>
      {/* Warning Box */}
      <div className="warning-box">
        <strong>Synthetic Data Only:</strong> All data generated on this page is entirely synthetic and randomly generated. No real personal, financial, or health information is included. This data is intended solely for DLP testing purposes.
      </div>

      {/* Generator Panel */}
      <div className="test-panel">
        <h2>Generate &amp; Download Sample Files</h2>
        <p>Configure the data type, format, and record count, then generate and download a file containing synthetic sensitive data.</p>

        <div className="two-col">
          <div className="form-group">
            <label htmlFor="data-type">Data Type</label>
            <select id="data-type" className="form-control" value={dataType} onChange={e => setDataType(e.target.value as DataType)}>
              {DATA_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="file-format">File Format</label>
            <select id="file-format" className="form-control" value={format} onChange={e => setFormat(e.target.value as Format)}>
              {FORMAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="two-col">
          <div className="form-group">
            <label htmlFor="record-count">Record Count</label>
            <select id="record-count" className="form-control" value={count} onChange={e => setCount(Number(e.target.value))}>
              {COUNT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleGenerate} style={{ width: '100%' }}>
              Generate &amp; Download
            </button>
          </div>
        </div>

        {preview && (
          <div className="form-group mt-3">
            <label>Data Preview</label>
            <div className="code-block" style={{ maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
              {preview}
            </div>
          </div>
        )}
      </div>

      {/* Pre-Built Files */}
      <div className="test-panel">
        <h2>Pre-Built Sample Files</h2>
        <p>Quickly download common sample data files with pre-configured data types and formats.</p>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Data Types</th>
                <th>Records</th>
                <th>Format</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {PRE_BUILT_FILES.map((file, i) => (
                <tr key={i}>
                  <td><span className="file-icon">&#128196;</span>{file.name}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {file.tags.map((t, j) => <span key={j} className={`tag ${t.color}`}>{t.label}</span>)}
                    </div>
                  </td>
                  <td>{file.records.toLocaleString()}</td>
                  <td>{file.format.toUpperCase()}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => handlePreBuiltDownload(file)}>
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supported Data Categories */}
      <div className="test-panel">
        <h2>Supported Data Categories</h2>
        <p>The sample data generator supports the following categories of synthetic sensitive data.</p>
        <div className="data-types-grid">
          {CATEGORIES.map((c, i) => (
            <div className="data-type" key={i}>
              <h4>{c.title}</h4>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
