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

export interface SecurityHeader {
  name: string;
  value: string;
  vendor: string;
  category: 'spam' | 'antivirus' | 'phishing' | 'encryption' | 'policy' | 'reputation' | 'routing' | 'other';
}

export interface ParsedEmail {
  headers: HeaderEntry[];
  hops: EmailHop[];
  authResults: AuthResult[];
  classificationHeaders: ClassificationHeader[];
  securityHeaders: SecurityHeader[];
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
  { pattern: /^sensitivity$/i, product: 'RFC Sensitivity' },
  // Titus (Fortra)
  { pattern: /^x-titus/i, product: 'Titus Classification' },
  // Boldon James
  { pattern: /^x-boldonjames/i, product: 'Boldon James Classifier' },
  { pattern: /^x-bj-/i, product: 'Boldon James Classifier' },
  { pattern: /^x-bjsfc/i, product: 'Boldon James Classifier' },
  // Fortra Digital Guardian
  { pattern: /^x-dg-/i, product: 'Fortra Digital Guardian' },
  { pattern: /^x-digitalguardian/i, product: 'Fortra Digital Guardian' },
  // Janusseal
  { pattern: /^x-janusseal/i, product: 'Janusseal' },
  // Workshare
  { pattern: /^x-workshare/i, product: 'Workshare' },
  // Generic classification
  { pattern: /^x-classification$/i, product: 'Generic Classification' },
  { pattern: /^x-protective-marking/i, product: 'Protective Marking' },
  { pattern: /^x-label$/i, product: 'Generic Label' },
];

// ── Security / SEG header patterns ─────────────────────────────────────────

type SecurityCategory = SecurityHeader['category'];

const SECURITY_HEADER_PATTERNS: { pattern: RegExp; vendor: string; category: SecurityCategory }[] = [
  // ── Fortra Products ──
  // Agari (DMARC/BEC protection)
  { pattern: /^x-agari/i, vendor: 'Fortra Agari', category: 'phishing' },
  // Clearswift SEG
  { pattern: /^x-seg-/i, vendor: 'Fortra Clearswift SEG', category: 'spam' },
  { pattern: /^x-msw-jemd-malware/i, vendor: 'Fortra Clearswift SEG', category: 'antivirus' },
  { pattern: /^x-msw-jemd-mailshell-spam/i, vendor: 'Fortra Clearswift SEG', category: 'spam' },
  { pattern: /^x-msw-jemd-rspamd-spam/i, vendor: 'Fortra Clearswift SEG', category: 'spam' },
  { pattern: /^x-msw-jemd/i, vendor: 'Fortra Clearswift SEG', category: 'other' },

  // ── Microsoft Exchange / Defender for Office 365 ──
  { pattern: /^x-forefront-antispam-report/i, vendor: 'Microsoft Forefront', category: 'spam' },
  { pattern: /^x-microsoft-antispam-mailbox-delivery/i, vendor: 'Microsoft Defender', category: 'spam' },
  { pattern: /^x-microsoft-antispam-message-info/i, vendor: 'Microsoft Defender', category: 'spam' },
  { pattern: /^x-microsoft-antispam$/i, vendor: 'Microsoft Defender', category: 'spam' },
  { pattern: /^x-ms-exchange-organization-scl/i, vendor: 'Microsoft Exchange', category: 'spam' },
  { pattern: /^x-ms-exchange-organization-pcl/i, vendor: 'Microsoft Exchange', category: 'phishing' },
  { pattern: /^x-ms-exchange-organization-auth/i, vendor: 'Microsoft Exchange', category: 'policy' },
  { pattern: /^x-ms-exchange-crosstenant/i, vendor: 'Microsoft Exchange', category: 'routing' },
  { pattern: /^x-ms-exchange-organization/i, vendor: 'Microsoft Exchange', category: 'policy' },
  { pattern: /^x-ms-exchange-transport/i, vendor: 'Microsoft Exchange', category: 'routing' },
  { pattern: /^x-ms-exchange-messagesentrepresentingtype/i, vendor: 'Microsoft Exchange', category: 'policy' },
  { pattern: /^x-ms-has-attach/i, vendor: 'Microsoft Exchange', category: 'policy' },
  { pattern: /^x-ms-tnef-correlator/i, vendor: 'Microsoft Exchange', category: 'other' },
  { pattern: /^x-originatororg/i, vendor: 'Microsoft Exchange', category: 'routing' },

  // ── Google Workspace / Gmail ──
  { pattern: /^x-google-dkim-signature/i, vendor: 'Google', category: 'other' },
  { pattern: /^x-google-smtp-source/i, vendor: 'Google', category: 'routing' },
  { pattern: /^x-gm-message-state/i, vendor: 'Google', category: 'other' },
  { pattern: /^x-google-original-from/i, vendor: 'Google', category: 'routing' },

  // ── Proofpoint ──
  { pattern: /^x-proofpoint-spam-details/i, vendor: 'Proofpoint', category: 'spam' },
  { pattern: /^x-proofpoint-virus-version/i, vendor: 'Proofpoint', category: 'antivirus' },
  { pattern: /^x-proofpoint-orig-id/i, vendor: 'Proofpoint', category: 'routing' },
  { pattern: /^x-proofpointencryptdesktop/i, vendor: 'Proofpoint', category: 'encryption' },
  { pattern: /^x-proofpoint/i, vendor: 'Proofpoint', category: 'other' },
  { pattern: /^x-threatsim/i, vendor: 'Proofpoint ThreatSim', category: 'phishing' },

  // ── Mimecast ──
  { pattern: /^x-mimecast-bulk-signature/i, vendor: 'Mimecast', category: 'spam' },
  { pattern: /^x-mimecast-spam-score/i, vendor: 'Mimecast', category: 'spam' },
  { pattern: /^x-mimecast-impersonation-protect/i, vendor: 'Mimecast', category: 'phishing' },
  { pattern: /^x-mimecast/i, vendor: 'Mimecast', category: 'other' },

  // ── Barracuda ──
  { pattern: /^x-barracuda-spam-flag/i, vendor: 'Barracuda', category: 'spam' },
  { pattern: /^x-barracuda-spam-score/i, vendor: 'Barracuda', category: 'spam' },
  { pattern: /^x-barracuda-spam-status/i, vendor: 'Barracuda', category: 'spam' },
  { pattern: /^x-barracuda-spam-report/i, vendor: 'Barracuda', category: 'spam' },
  { pattern: /^x-barracuda-envelope-from/i, vendor: 'Barracuda', category: 'routing' },
  { pattern: /^x-barracuda-bayes/i, vendor: 'Barracuda', category: 'spam' },
  { pattern: /^x-barracuda-virus-scanned/i, vendor: 'Barracuda', category: 'antivirus' },
  { pattern: /^x-barracuda/i, vendor: 'Barracuda', category: 'other' },

  // ── Cisco IronPort / ESA ──
  { pattern: /^x-ironport-anti-spam-filtered/i, vendor: 'Cisco IronPort', category: 'spam' },
  { pattern: /^x-ironport-anti-spam-result/i, vendor: 'Cisco IronPort', category: 'spam' },
  { pattern: /^x-ironport-av/i, vendor: 'Cisco IronPort', category: 'antivirus' },
  { pattern: /^x-ironport-sdr/i, vendor: 'Cisco IronPort', category: 'reputation' },
  { pattern: /^x-ironport/i, vendor: 'Cisco IronPort', category: 'other' },
  { pattern: /^x-ipas-result/i, vendor: 'Cisco IronPort', category: 'spam' },
  { pattern: /^x-sbrs/i, vendor: 'Cisco SenderBase', category: 'reputation' },

  // ── Sophos ──
  { pattern: /^x-sophos/i, vendor: 'Sophos', category: 'other' },
  { pattern: /^x-lased/i, vendor: 'Sophos', category: 'spam' },

  // ── SpamAssassin ──
  { pattern: /^x-spam-status/i, vendor: 'SpamAssassin', category: 'spam' },
  { pattern: /^x-spam-score/i, vendor: 'SpamAssassin', category: 'spam' },
  { pattern: /^x-spam-flag/i, vendor: 'SpamAssassin', category: 'spam' },
  { pattern: /^x-spam-level/i, vendor: 'SpamAssassin', category: 'spam' },
  { pattern: /^x-spam-report/i, vendor: 'SpamAssassin', category: 'spam' },
  { pattern: /^x-spam-checker-version/i, vendor: 'SpamAssassin', category: 'other' },

  // ── Symantec / Broadcom Brightmail ──
  { pattern: /^x-brightmail-tracker/i, vendor: 'Symantec Brightmail', category: 'routing' },
  { pattern: /^x-brightmail/i, vendor: 'Symantec Brightmail', category: 'spam' },
  { pattern: /^x-porninfo/i, vendor: 'Symantec Brightmail', category: 'spam' },
  { pattern: /^x-msg-ref/i, vendor: 'Symantec Brightmail', category: 'routing' },

  // ── Trend Micro ──
  { pattern: /^x-tmase-result/i, vendor: 'Trend Micro', category: 'spam' },
  { pattern: /^x-tm-as-result/i, vendor: 'Trend Micro', category: 'spam' },
  { pattern: /^x-tm-as-url/i, vendor: 'Trend Micro', category: 'reputation' },
  { pattern: /^x-tm-received-spf/i, vendor: 'Trend Micro', category: 'other' },
  { pattern: /^x-tm-/i, vendor: 'Trend Micro', category: 'other' },
  { pattern: /^x-tmase/i, vendor: 'Trend Micro', category: 'other' },

  // ── FireEye / Trellix ──
  { pattern: /^x-fireeye/i, vendor: 'Trellix (FireEye)', category: 'other' },
  { pattern: /^x-fe-/i, vendor: 'Trellix (FireEye)', category: 'other' },

  // ── Fortinet FortiMail ──
  { pattern: /^x-feas-system-wl/i, vendor: 'Fortinet FortiMail', category: 'policy' },
  { pattern: /^x-feas-spam-outbreak/i, vendor: 'Fortinet FortiMail', category: 'spam' },
  { pattern: /^x-feas-bannedword/i, vendor: 'Fortinet FortiMail', category: 'policy' },
  { pattern: /^x-feas-dictionary/i, vendor: 'Fortinet FortiMail', category: 'policy' },
  { pattern: /^x-feas/i, vendor: 'Fortinet FortiMail', category: 'other' },
  { pattern: /^x-fortimail/i, vendor: 'Fortinet FortiMail', category: 'other' },

  // ── Rspamd ──
  { pattern: /^x-spamd-result/i, vendor: 'Rspamd', category: 'spam' },
  { pattern: /^x-spamd-bar/i, vendor: 'Rspamd', category: 'spam' },
  { pattern: /^x-rspamd-server/i, vendor: 'Rspamd', category: 'routing' },
  { pattern: /^x-rspamd-queue-id/i, vendor: 'Rspamd', category: 'routing' },
  { pattern: /^x-rspamd/i, vendor: 'Rspamd', category: 'other' },

  // ── ClamAV / Amavis ──
  { pattern: /^x-virus-scanned/i, vendor: 'ClamAV / Amavis', category: 'antivirus' },
  { pattern: /^x-virus-status/i, vendor: 'ClamAV / Amavis', category: 'antivirus' },
  { pattern: /^x-amavis-alert/i, vendor: 'Amavis', category: 'antivirus' },
  { pattern: /^x-amavis/i, vendor: 'Amavis', category: 'other' },

  // ── Kaspersky ──
  { pattern: /^x-klms-antivirus/i, vendor: 'Kaspersky KLMS', category: 'antivirus' },
  { pattern: /^x-klms-antispam-method/i, vendor: 'Kaspersky KLMS', category: 'spam' },
  { pattern: /^x-klms-antispam-rate/i, vendor: 'Kaspersky KLMS', category: 'spam' },
  { pattern: /^x-klms-antispam-status/i, vendor: 'Kaspersky KLMS', category: 'spam' },
  { pattern: /^x-klms-antiphishing/i, vendor: 'Kaspersky KLMS', category: 'phishing' },
  { pattern: /^x-klms/i, vendor: 'Kaspersky KLMS', category: 'other' },

  // ── Forcepoint ──
  { pattern: /^x-forcepoint/i, vendor: 'Forcepoint', category: 'other' },

  // ── Generic / RFC ──
  { pattern: /^x-originating-ip/i, vendor: 'Generic', category: 'routing' },
  { pattern: /^x-mailer$/i, vendor: 'Generic', category: 'other' },
  { pattern: /^user-agent$/i, vendor: 'Generic', category: 'other' },
  { pattern: /^x-priority$/i, vendor: 'Generic', category: 'policy' },
  { pattern: /^precedence$/i, vendor: 'Generic (RFC)', category: 'policy' },
  { pattern: /^list-unsubscribe/i, vendor: 'Generic (RFC)', category: 'policy' },
  { pattern: /^x-auto-response-suppress/i, vendor: 'Generic', category: 'policy' },
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

// ── Security / SEG header detection ────────────────────────────────────────

function findSecurityHeaders(headers: HeaderEntry[]): SecurityHeader[] {
  const found: SecurityHeader[] = [];

  for (const hdr of headers) {
    for (const entry of SECURITY_HEADER_PATTERNS) {
      if (entry.pattern.test(hdr.name)) {
        found.push({ name: hdr.name, value: hdr.value, vendor: entry.vendor, category: entry.category });
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
  const securityHeaders = findSecurityHeaders(headers);
  const summary = buildSummary(headers, hops, authResults);

  return { headers, hops, authResults, classificationHeaders, securityHeaders, summary, body };
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
