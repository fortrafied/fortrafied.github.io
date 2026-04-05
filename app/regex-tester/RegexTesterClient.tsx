'use client';

import { useState, useMemo, useCallback } from 'react';

interface Preset {
  pattern: string;
  sample: string;
  desc: string;
}

const presets: { [key: string]: Preset } = {
  ssn: { pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b', sample: 'John Smith, SSN: 078-05-1120\nJane Doe, SSN: 219-09-9999\nNo match here: 12-3456\nRobert Johnson: 323-45-6789', desc: 'US Social Security Number' },
  ccn_visa: { pattern: '\\b4\\d{3}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b', sample: 'Visa: 4111-1111-1111-1111\nAlso: 4111111111111111\nNot a visa: 5500000000000004', desc: 'Visa Credit Card' },
  ccn_mc: { pattern: '\\b5[1-5]\\d{2}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b', sample: 'MC: 5500-0000-0000-0004\nAlso: 5500000000000004\nNot MC: 4111111111111111', desc: 'Mastercard' },
  ccn_amex: { pattern: '\\b3[47]\\d{2}[- ]?\\d{6}[- ]?\\d{5}\\b', sample: 'Amex: 3400-000000-00009\nAlso: 370000000000002\nNot Amex: 4111111111111111', desc: 'American Express' },
  ccn_any: { pattern: '\\b(?:4\\d{3}|5[1-5]\\d{2}|3[47]\\d{2}|6011)[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{1,4}\\b', sample: 'Visa: 4111-1111-1111-1111\nMC: 5500-0000-0000-0004\nAmex: 3400-000000-00009\nDiscover: 6011-0000-0000-0004', desc: 'Any Major Credit Card' },
  email: { pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b', sample: 'Contact: john.smith@example.com\nAlso: jane_doe@test.org\nNot email: @invalid or user@', desc: 'Email Address' },
  phone: { pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', sample: 'Phone: (555) 234-5678\nAlso: 555-234-5678\nAnd: 555.234.5678\nShort: 234-5678', desc: 'US Phone Number' },
  ipv4: { pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b', sample: 'Server: 192.168.1.100\nGateway: 10.0.0.1\nDNS: 8.8.8.8\nInvalid: 999.999.999.999', desc: 'IPv4 Address' },
  dob: { pattern: '\\b(?:0[1-9]|1[0-2])[/\\-](?:0[1-9]|[12]\\d|3[01])[/\\-](?:19|20)\\d{2}\\b', sample: 'DOB: 01/15/1985\nBorn: 03-22-1990\nNot a date: 13/45/2000', desc: 'Date of Birth (MM/DD/YYYY)' },
  routing: { pattern: '\\b\\d{9}\\b', sample: 'Routing: 021000021\nAccount: 123456789\nNot routing: 12345', desc: 'ABA Routing Number (9 digits)' },
  iban: { pattern: '\\b[A-Z]{2}\\d{2}[A-Z0-9]{4,30}\\b', sample: 'IBAN: US12345678901234567890\nAlso: GB29NWBK60161331926819\nNot IBAN: 12345', desc: 'IBAN Number' },
  ein: { pattern: '\\b\\d{2}-\\d{7}\\b', sample: 'EIN: 12-3456789\nTax ID: 98-7654321\nNot EIN: 123-456789', desc: 'EIN / Tax ID' },
  dl: { pattern: '\\b[A-Z]\\d{3}[- ]?\\d{4}[- ]?\\d{4}\\b', sample: 'DL: W530-4291-8456\nLicense: A123-4567-8901\nNot DL: 1234567890', desc: 'Driver License (common format)' },
  passport: { pattern: '\\b[A-Z]\\d{8}\\b', sample: 'Passport: C12345678\nAlso: A98765432\nNot passport: 123456789', desc: 'US Passport Number' },
  aws_key: { pattern: '\\bAKIA[0-9A-Z]{16}\\b', sample: 'AWS Key: AKIAIOSFODNN7EXAMPLE\nNot AWS: BKIAIOSFODNN7EXAMPLE', desc: 'AWS Access Key ID' },
  api_token: { pattern: '\\b(?:tok_|sk_|pk_|api_)[A-Za-z0-9]{20,}\\b', sample: 'Token: tok_abc123def456ghi789jkl012mno\nStripe: sk_test_abcdefghijklmnopqrst\nNot token: tok_short', desc: 'API Token (common prefixes)' },
};

const PRESET_LABELS: { key: string; label: string }[] = [
  { key: 'ssn', label: 'SSN' },
  { key: 'ccn_visa', label: 'Visa CC' },
  { key: 'ccn_mc', label: 'Mastercard' },
  { key: 'ccn_amex', label: 'Amex' },
  { key: 'ccn_any', label: 'Any CC' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'ipv4', label: 'IPv4' },
  { key: 'dob', label: 'DOB' },
  { key: 'routing', label: 'Routing #' },
  { key: 'iban', label: 'IBAN' },
  { key: 'ein', label: 'EIN' },
  { key: 'dl', label: 'Driver License' },
  { key: 'passport', label: 'Passport' },
  { key: 'aws_key', label: 'AWS Key' },
  { key: 'api_token', label: 'API Token' },
];

interface MatchResult {
  match: string;
  index: number;
}

export default function RegexTesterClient() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flagGlobal, setFlagGlobal] = useState(true);
  const [flagCase, setFlagCase] = useState(false);
  const [flagMultiline, setFlagMultiline] = useState(true);
  const [regexError, setRegexError] = useState('');

  const loadPreset = useCallback((key: string) => {
    const p = presets[key];
    if (p) {
      setPattern(p.pattern);
      setTestString(p.sample);
    }
  }, []);

  const { matches, highlightedHTML } = useMemo(() => {
    if (!pattern || !testString) {
      return { matches: [] as MatchResult[], highlightedHTML: '' };
    }

    let flags = '';
    if (flagGlobal) flags += 'g';
    if (flagCase) flags += 'i';
    if (flagMultiline) flags += 'm';

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flags);
      setRegexError('');
    } catch (e) {
      setRegexError((e as Error).message);
      return { matches: [] as MatchResult[], highlightedHTML: '' };
    }

    const found: MatchResult[] = [];
    let m: RegExpExecArray | null;

    if (flagGlobal) {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        m = regex.exec(testString);
        if (m === null) break;
        found.push({ match: m[0], index: m.index });
        if (m[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } else {
      m = regex.exec(testString);
      if (m) {
        found.push({ match: m[0], index: m.index });
      }
    }

    // Build highlighted output
    let html = '';
    let lastIndex = 0;
    for (const f of found) {
      if (f.index >= lastIndex) {
        html += escapeHTML(testString.slice(lastIndex, f.index));
        html += `<span class="highlight">${escapeHTML(f.match)}</span>`;
        lastIndex = f.index + f.match.length;
      }
    }
    html += escapeHTML(testString.slice(lastIndex));

    return { matches: found, highlightedHTML: html };
  }, [pattern, testString, flagGlobal, flagCase, flagMultiline]);

  return (
    <>
      {/* Pattern Tester */}
      <div className="test-panel">
        <h2>Pattern Tester</h2>
        <p>Select a preset or enter a custom regex pattern to test against sample data. Matches highlight in real-time.</p>

        {/* Preset buttons */}
        <div className="form-group">
          <label>Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_LABELS.map(p => (
              <button key={p.key} className="btn btn-outline btn-sm" onClick={() => loadPreset(p.key)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern + Flags */}
        <div className="two-col">
          <div className="form-group">
            <label htmlFor="regex-pattern">Regex Pattern</label>
            <input
              id="regex-pattern"
              type="text"
              className="form-control"
              placeholder="Enter regex pattern..."
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              style={{ fontFamily: "'Consolas', 'Monaco', monospace" }}
            />
            {regexError && <div style={{ color: '#ef5350', fontSize: '0.8rem', marginTop: '4px' }}>Invalid regex: {regexError}</div>}
          </div>
          <div className="form-group">
            <label>Flags</label>
            <div className="toggle-group">
              <label className="toggle-label">
                <input type="checkbox" checked={flagGlobal} onChange={e => setFlagGlobal(e.target.checked)} />
                <span>g (global)</span>
              </label>
              <label className="toggle-label">
                <input type="checkbox" checked={flagCase} onChange={e => setFlagCase(e.target.checked)} />
                <span>i (case-insensitive)</span>
              </label>
              <label className="toggle-label">
                <input type="checkbox" checked={flagMultiline} onChange={e => setFlagMultiline(e.target.checked)} />
                <span>m (multiline)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Test String */}
        <div className="form-group">
          <label htmlFor="test-string">Test String</label>
          <textarea
            id="test-string"
            className="form-control"
            placeholder="Enter or paste text to test against..."
            rows={6}
            value={testString}
            onChange={e => setTestString(e.target.value)}
          />
        </div>

        {/* Results */}
        <div className="two-col mt-3">
          <div className="form-group">
            <label>Results ({matches.length} match{matches.length !== 1 ? 'es' : ''} found)</label>
            <div className="code-block" style={{ maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
              {matches.length > 0
                ? matches.map((m, i) => `[${i + 1}] Index ${m.index}: "${m.match}"`).join('\n')
                : pattern && testString ? 'No matches found.' : 'Enter a pattern and test string to see results.'}
            </div>
          </div>
          <div className="form-group">
            <label>Highlighted Output</label>
            <div
              className="code-block"
              style={{ maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: highlightedHTML || (pattern && testString ? 'No matches found.' : 'Enter a pattern and test string to see results.') }}
            />
          </div>
        </div>
      </div>

      {/* Reference Table */}
      <div className="test-panel">
        <h2>Common DLP Regex Patterns Reference</h2>
        <p>Click any row to load the pattern into the tester above.</p>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Pattern Name</th>
                <th>Regex</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {PRESET_LABELS.map(p => {
                const preset = presets[p.key];
                return (
                  <tr key={p.key} style={{ cursor: 'pointer' }} onClick={() => loadPreset(p.key)}>
                    <td style={{ color: '#4fc3f7', fontWeight: 600 }}>{p.label}</td>
                    <td><code style={{ fontSize: '0.8rem', color: '#90a4ae' }}>{preset.pattern}</code></td>
                    <td>{preset.desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
