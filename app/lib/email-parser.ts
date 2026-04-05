// ── Types ──────────────────────────────────────────────────────────────────

export interface EmailHop {
  index: number;
  from: string;
  by: string;
  with: string;
  date: Date | null;
  dateRaw: string;
  delay: number | null; // seconds from previous hop
  tls: boolean;
  raw: string;
}

export interface AuthResult {
  method: string; // SPF, DKIM, DMARC, ARC, etc.
  result: string; // pass, fail, softfail, neutral, none, temperror, permerror
  detail: string;
  raw: string;
}

export interface ClassificationHeader {
  name: string;
  value: string;
  product: string;
}

export interface HeaderEntry {
  name: string;
  value: string;
}

export interface ParsedEmail {
  headers: HeaderEntry[];
  hops: EmailHop[];
  authResults: AuthResult[];
  classificationHeaders: ClassificationHeader[];
  summary: EmailSummary;
  body: string;
}

export interface EmailSummary {
  from: string;
  to: string;
  cc: string;
  subject: string;
  date: string;
  messageId: string;
  returnPath: string;
  contentType: string;
  totalDeliveryTime: number | null; // seconds
  hopCount: number;
  spf: string;
  dkim: string;
  dmarc: string;
  encrypted: boolean;
  spamScore: string;
  xMailer: string;
}

// ── Classification header patterns ─────────────────────────────────────────

const EMAIL_CLASSIFICATION_PATTERNS: { pattern: RegExp; product: string }[] = [
  // Microsoft Purview / MIP / AIP
  { pattern: /^msip[_-]label/i, product: 'Microsoft Purview / MIP' },
  { pattern: /^x-ms-exchange-organization-authas/i, product: 'Microsoft Exchange' },
  { pattern: /^x-ms-exchange-organization-authsource/i, product: 'Microsoft Exchange' },
  { pattern: /^x-ms-exchange-organization-scl/i, product: 'Microsoft Exchange (SCL)' },
  { pattern: /^x-ms-exchange-organization-messagedirectionalityy/i, product: 'Microsoft Exchange' },
  { pattern: /^x-ms-has-attach/i, product: 'Microsoft Exchange' },
  { pattern: /^x-ms-tnef-correlator/i, product: 'Microsoft Exchange' },
  { pattern: /^sensitivity/i, product: 'RFC Sensitivity' },
  // Titus
  { pattern: /^x-titus/i, product: 'Titus Classification' },
  { pattern: /^x-.*titus/i, product: 'Titus Classification' },
  // Boldon James
  { pattern: /^x-boldonjames/i, product: 'Boldon James Classifier' },
  { pattern: /^x-bj-/i, product: 'Boldon James Classifier' },
  // Fortra / Digital Guardian
  { pattern: /^x-dg-/i, product: 'Fortra Digital Guardian' },
  { pattern: /^x-digitalguardian/i, product: 'Fortra Digital Guardian' },
  // Forcepoint
  { pattern: /^x-forcepoint/i, product: 'Forcepoint' },
  // Proofpoint
  { pattern: /^x-proofpoint/i, product: 'Proofpoint' },
  // Mimecast
  { pattern: /^x-mimecast/i, product: 'Mimecast' },
  // Barracuda
  { pattern: /^x-barracuda/i, product: 'Barracuda' },
  // Generic classification
  { pattern: /^x-classification/i, product: 'Generic Classification' },
  { pattern: /^x-protective-marking/i, product: 'Protective Marking' },
  { pattern: /^x-label/i, product: 'Generic Label' },
  // Janusseal
  { pattern: /^x-janusseal/i, product: 'Janusseal' },
  // Workshare
  { pattern: /^x-workshare/i, product: 'Workshare' },
];

// ── Header parsing ─────────────────────────────────────────────────────────

function parseRawHeaders(raw: string): HeaderEntry[] {
  const headers: HeaderEntry[] = [];
  // Unfold continued headers (lines starting with whitespace are continuations)
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const unfolded: string[] = [];

  for (const line of lines) {
    if (line.match(/^\s+/) && unfolded.length > 0) {
      // Continuation line
      unfolded[unfolded.length - 1] += ' ' + line.trim();
    } else if (line.includes(':')) {
      unfolded.push(line);
    }
  }

  for (const line of unfolded) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const name = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 1).trim();
      if (name) headers.push({ name, value });
    }
  }

  return headers;
}

// ── Hop (Received header) parsing ──────────────────────────────────────────

function parseReceivedHeader(raw: string): Omit<EmailHop, 'index' | 'delay'> {
  // Extract "from" server
  const fromMatch = raw.match(/from\s+([^\s(;]+)/i);
  const from = fromMatch ? fromMatch[1] : '';

  // Extract "by" server
  const byMatch = raw.match(/by\s+([^\s(;]+)/i);
  const by = byMatch ? byMatch[1] : '';

  // Extract "with" protocol
  const withMatch = raw.match(/with\s+([^\s;]+)/i);
  const withProto = withMatch ? withMatch[1] : '';

  // Extract date — typically after the last semicolon
  let date: Date | null = null;
  let dateRaw = '';
  const semiIdx = raw.lastIndexOf(';');
  if (semiIdx >= 0) {
    dateRaw = raw.substring(semiIdx + 1).trim();
    const parsed = new Date(dateRaw);
    if (!isNaN(parsed.getTime())) date = parsed;
  }

  // Check for TLS indicators
  const tls = /\bTLS\b|ESMTPS|TLSv|STARTTLS/i.test(raw);

  return { from, by, with: withProto, date, dateRaw, tls, raw };
}

function buildHops(headers: HeaderEntry[]): EmailHop[] {
  // Received headers are in reverse chronological order (newest first)
  const receivedHeaders = headers
    .filter((h) => h.name.toLowerCase() === 'received')
    .reverse(); // oldest first

  const hops: EmailHop[] = receivedHeaders.map((h, i) => ({
    index: i + 1,
    delay: null,
    ...parseReceivedHeader(h.value),
  }));

  // Calculate delays between hops
  for (let i = 1; i < hops.length; i++) {
    const prev = hops[i - 1].date;
    const curr = hops[i].date;
    if (prev && curr) {
      const diffSec = Math.round((curr.getTime() - prev.getTime()) / 1000);
      hops[i].delay = Math.max(0, diffSec);
    }
  }

  return hops;
}

// ── Authentication results parsing ─────────────────────────────────────────

function parseAuthResults(headers: HeaderEntry[]): AuthResult[] {
  const results: AuthResult[] = [];

  // Authentication-Results header
  const authHeaders = headers.filter(
    (h) => h.name.toLowerCase() === 'authentication-results'
  );

  for (const hdr of authHeaders) {
    // Parse individual results like "spf=pass", "dkim=pass", "dmarc=pass"
    const parts = hdr.value.split(';').map((s) => s.trim()).filter(Boolean);

    for (const part of parts) {
      const methods = ['spf', 'dkim', 'dmarc', 'arc', 'iprev', 'auth', 'sender-id', 'domainkeys'];
      for (const method of methods) {
        const re = new RegExp(`\\b${method}\\s*=\\s*(\\S+)`, 'i');
        const match = part.match(re);
        if (match) {
          results.push({
            method: method.toUpperCase(),
            result: match[1].toLowerCase(),
            detail: part,
            raw: hdr.value,
          });
        }
      }
    }
  }

  // Received-SPF header
  const spfHeaders = headers.filter((h) => h.name.toLowerCase() === 'received-spf');
  for (const hdr of spfHeaders) {
    const resultMatch = hdr.value.match(/^(pass|fail|softfail|neutral|none|temperror|permerror)/i);
    if (resultMatch) {
      results.push({
        method: 'SPF',
        result: resultMatch[1].toLowerCase(),
        detail: hdr.value,
        raw: hdr.value,
      });
    }
  }

  // DKIM-Signature (presence indicates signing, not verification)
  const dkimSig = headers.filter((h) => h.name.toLowerCase() === 'dkim-signature');
  if (dkimSig.length > 0 && !results.some((r) => r.method === 'DKIM')) {
    const dMatch = dkimSig[0].value.match(/d=([^;\s]+)/);
    results.push({
      method: 'DKIM',
      result: 'signed',
      detail: dMatch ? `Signed by ${dMatch[1]}` : 'DKIM signature present',
      raw: dkimSig[0].value,
    });
  }

  // ARC headers
  const arcSeal = headers.filter((h) => h.name.toLowerCase() === 'arc-seal');
  for (const hdr of arcSeal) {
    const cvMatch = hdr.value.match(/cv\s*=\s*(\S+)/i);
    if (cvMatch) {
      results.push({
        method: 'ARC',
        result: cvMatch[1].toLowerCase(),
        detail: hdr.value,
        raw: hdr.value,
      });
    }
  }

  return results;
}

// ── Classification header detection ────────────────────────────────────────

function findClassificationHeaders(headers: HeaderEntry[]): ClassificationHeader[] {
  const found: ClassificationHeader[] = [];

  for (const hdr of headers) {
    for (const entry of EMAIL_CLASSIFICATION_PATTERNS) {
      if (entry.pattern.test(hdr.name)) {
        found.push({ name: hdr.name, value: hdr.value, product: entry.product });
        break;
      }
    }
  }

  return found;
}

// ── Summary extraction ─────────────────────────────────────────────────────

function getHeaderValue(headers: HeaderEntry[], name: string): string {
  const h = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return h?.value ?? '';
}

function buildSummary(headers: HeaderEntry[], hops: EmailHop[], authResults: AuthResult[]): EmailSummary {
  // Total delivery time
  let totalDeliveryTime: number | null = null;
  if (hops.length >= 2) {
    const first = hops[0].date;
    const last = hops[hops.length - 1].date;
    if (first && last) {
      totalDeliveryTime = Math.max(0, Math.round((last.getTime() - first.getTime()) / 1000));
    }
  }

  // Check if any hop used TLS
  const encrypted = hops.some((h) => h.tls);

  // SPF/DKIM/DMARC summary
  const spfResult = authResults.find((r) => r.method === 'SPF');
  const dkimResult = authResults.find((r) => r.method === 'DKIM');
  const dmarcResult = authResults.find((r) => r.method === 'DMARC');

  // Spam score
  const spamScore =
    getHeaderValue(headers, 'x-spam-score') ||
    getHeaderValue(headers, 'x-spam-status') ||
    getHeaderValue(headers, 'x-ms-exchange-organization-scl') ||
    getHeaderValue(headers, 'x-barracuda-spam-score') ||
    '';

  return {
    from: getHeaderValue(headers, 'from'),
    to: getHeaderValue(headers, 'to'),
    cc: getHeaderValue(headers, 'cc'),
    subject: getHeaderValue(headers, 'subject'),
    date: getHeaderValue(headers, 'date'),
    messageId: getHeaderValue(headers, 'message-id'),
    returnPath: getHeaderValue(headers, 'return-path'),
    contentType: getHeaderValue(headers, 'content-type'),
    totalDeliveryTime,
    hopCount: hops.length,
    spf: spfResult?.result ?? 'not found',
    dkim: dkimResult?.result ?? 'not found',
    dmarc: dmarcResult?.result ?? 'not found',
    encrypted,
    spamScore,
    xMailer: getHeaderValue(headers, 'x-mailer') || getHeaderValue(headers, 'user-agent'),
  };
}

// ── .eml file parsing ──────────────────────────────────────────────────────

function splitHeadersAndBody(raw: string): { headerSection: string; body: string } {
  const normalized = raw.replace(/\r\n/g, '\n');
  // Headers and body are separated by a blank line
  const splitIdx = normalized.indexOf('\n\n');
  if (splitIdx === -1) {
    return { headerSection: normalized, body: '' };
  }
  return {
    headerSection: normalized.substring(0, splitIdx),
    body: normalized.substring(splitIdx + 2),
  };
}

// ── Main entry point ───────────────────────────────────────────────────────

export function parseEmailHeaders(rawInput: string): ParsedEmail {
  const { headerSection, body } = splitHeadersAndBody(rawInput);
  const headers = parseRawHeaders(headerSection);
  const hops = buildHops(headers);
  const authResults = parseAuthResults(headers);
  const classificationHeaders = findClassificationHeaders(headers);
  const summary = buildSummary(headers, hops, authResults);

  return { headers, hops, authResults, classificationHeaders, summary, body };
}

export async function parseEmlFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read .eml file'));
    reader.readAsText(file);
  });
}

// ── Formatting helpers ─────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  if (seconds < 1) return '< 1s';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function authResultColor(result: string): string {
  switch (result.toLowerCase()) {
    case 'pass': return '#66bb6a';
    case 'fail': case 'hardfail': return '#ef5350';
    case 'softfail': return '#ffa726';
    case 'neutral': case 'none': return '#9e9e9e';
    case 'signed': return '#4fc3f7';
    case 'temperror': case 'permerror': return '#ef5350';
    default: return '#9e9e9e';
  }
}

export function delayColor(seconds: number | null): string {
  if (seconds === null) return '#757575';
  if (seconds <= 1) return '#66bb6a';
  if (seconds <= 30) return '#4fc3f7';
  if (seconds <= 120) return '#ffa726';
  return '#ef5350';
}
