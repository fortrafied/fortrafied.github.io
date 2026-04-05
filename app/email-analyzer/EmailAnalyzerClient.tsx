'use client';

import { useState, useCallback } from 'react';
import {
  type ParsedEmail,
  type EmailHop,
  parseEmailHeaders,
  parseEmlFile,
  formatDuration,
  authResultColor,
  delayColor,
} from '../lib/email-parser';

type InputMode = 'paste' | 'file';
type ActiveTab = 'summary' | 'hops' | 'auth' | 'security' | 'classification' | 'headers' | 'raw';

const categoryLabels: Record<string, string> = {
  spam: 'Spam / Anti-Spam',
  antivirus: 'Antivirus / Malware',
  phishing: 'Phishing / Impersonation',
  encryption: 'Encryption',
  policy: 'Policy / Routing Rules',
  reputation: 'Reputation / Scoring',
  routing: 'Routing / Transport',
  other: 'Other',
};

const categoryColors: Record<string, string> = {
  spam: 'tag-orange',
  antivirus: 'tag-red',
  phishing: 'tag-red',
  encryption: 'tag-green',
  policy: 'tag-blue',
  reputation: 'tag-purple',
  routing: 'tag-blue',
  other: 'tag-blue',
};

const sampleHeaders = `Delivered-To: recipient@example.com
Received: by 2002:a05:6512:3ca6:0:0:0:0 with SMTP id bi38csp2651234lfb;
        Tue, 15 Apr 2025 09:30:15 -0700 (PDT)
X-Received: by 2002:a17:902:e848:0:0:0:0 with SMTP id t8mr12345678plg.122.1713194015;
        Tue, 15 Apr 2025 09:30:15 -0700 (PDT)
ARC-Seal: i=1; a=rsa-sha256; t=1713194015; cv=none; d=google.com; s=arc-20160816
ARC-Authentication-Results: i=1; mx.google.com;
       dkim=pass header.i=@example.com header.s=selector1;
       spf=pass (google.com: domain of sender@example.com designates 198.51.100.50 as permitted sender) smtp.mailfrom=sender@example.com;
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=example.com
Return-Path: <sender@example.com>
Received: from mail-out.example.com (mail-out.example.com. [198.51.100.50])
        by mx.google.com with ESMTPS id d2si12345678pgk.123.2025.04.15.09.30.14
        for <recipient@example.com>;
        Tue, 15 Apr 2025 09:30:14 -0700 (PDT)
Received-SPF: pass (google.com: domain of sender@example.com designates 198.51.100.50 as permitted sender) client-ip=198.51.100.50;
Authentication-Results: mx.google.com;
       dkim=pass header.i=@example.com header.s=selector1 header.b=abc123;
       spf=pass (google.com: domain of sender@example.com designates 198.51.100.50 as permitted sender) smtp.mailfrom=sender@example.com;
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=example.com
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=example.com; s=selector1; h=from:to:subject:date:message-id; bh=abc123=; b=def456=
Received: from internal-mta.example.com (10.0.0.5) by mail-out.example.com (10.0.0.10) with Microsoft SMTP Server (TLS) id 15.2.1118.40;
        Tue, 15 Apr 2025 12:30:13 -0400
Received: from EXCH01.corp.example.com (10.0.1.20) by internal-mta.example.com (10.0.0.5) with Microsoft SMTP Server (TLS) id 15.2.1118.40;
        Tue, 15 Apr 2025 12:30:12 -0400
X-MS-Exchange-Organization-SCL: -1
X-MS-Exchange-Organization-AuthSource: EXCH01.corp.example.com
X-MS-Exchange-Organization-AuthAs: Internal
X-Titus-Classification: CONFIDENTIAL
X-Titus-GUIDValue: {12345678-ABCD-1234-EFGH-123456789ABC}
MSIP_Label_12345678-1234-1234-1234-123456789abc_Enabled: true
MSIP_Label_12345678-1234-1234-1234-123456789abc_Name: Confidential
MSIP_Label_12345678-1234-1234-1234-123456789abc_SiteId: abcd1234-ab12-cd34-ef56-abcdef123456
Sensitivity: Company-Confidential
X-Agari-Authentication-Results: agari.example.com; dkim=pass header.d=example.com; spf=pass; dmarc=pass
X-SEG-Spam: clean
X-MSW-JEMD-Malware: clean
X-MSW-JEMD-Mailshell-Spam: score=0, verdict=ham
X-MSW-JEMD-Rspamd-Spam: score=1.2, action=no action
X-Forefront-Antispam-Report: CIP:198.51.100.50;CTRY:US;LANG:en;SCL:-1;SRV:;IPV:NLI;SFV:NSPM;H:mail-out.example.com;PTR:mail-out.example.com;CAT:NONE
X-Microsoft-Antispam-Mailbox-Delivery: ucf:0;jmr:0;auth:0;dest:I;ENG:(910001)(944506458002)(944626604003)
X-Microsoft-Antispam: BCL:0
X-Spam-Status: No, score=-2.1 required=5.0
X-Spam-Score: -2.1
X-Virus-Scanned: ClamAV at gateway.example.com
X-Mailer: Microsoft Outlook 16.0
From: "John Smith" <sender@example.com>
To: "Jane Doe" <recipient@example.com>
CC: "Bob Wilson" <bob@example.com>
Subject: Q1 Financial Report - CONFIDENTIAL
Date: Tue, 15 Apr 2025 12:30:10 -0400
Message-ID: <abc123@EXCH01.corp.example.com>
Content-Type: multipart/mixed; boundary="----=_NextPart_001"
MIME-Version: 1.0`;

export default function EmailAnalyzerClient() {
  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [rawInput, setRawInput] = useState('');
  const [parsed, setParsed] = useState<ParsedEmail | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
  const [parseError, setParseError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [headerFilter, setHeaderFilter] = useState('');
  const [secVendorFilter, setSecVendorFilter] = useState<string | null>(null);
  const [secCategoryFilter, setSecCategoryFilter] = useState<string | null>(null);

  function analyze() {
    if (!rawInput.trim()) return;
    setParseError('');
    try {
      const result = parseEmailHeaders(rawInput);
      setParsed(result);
      setActiveTab('summary');
    } catch (e: unknown) {
      setParseError((e as Error).message);
    }
  }

  const handleFile = useCallback(async (file: File) => {
    setParseError('');
    try {
      const content = await parseEmlFile(file);
      setRawInput(content);
      const result = parseEmailHeaders(content);
      setParsed(result);
      setActiveTab('summary');
    } catch (e: unknown) {
      setParseError((e as Error).message);
    }
  }, []);

  function clearAll() {
    setRawInput('');
    setParsed(null);
    setParseError('');
    setHeaderFilter('');
    setSecVendorFilter(null);
    setSecCategoryFilter(null);
  }

  const filteredHeaders = parsed?.headers.filter(
    (h) =>
      !headerFilter ||
      h.name.toLowerCase().includes(headerFilter.toLowerCase()) ||
      h.value.toLowerCase().includes(headerFilter.toLowerCase())
  ) ?? [];

  return (
    <>
      <div className="info-box">
        <strong>Client-Side Only:</strong> All analysis runs locally in your browser. No email data is transmitted to any server.
      </div>

      {/* Input section */}
      <div className="test-panel">
        <h2>Analyze Email Headers</h2>
        <p style={{ marginBottom: 16 }}>Paste raw email headers or upload an .eml file to analyze routing, authentication, and classification metadata.</p>

        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <button className={`tab-btn${inputMode === 'paste' ? ' active' : ''}`} onClick={() => setInputMode('paste')}>
            Paste Headers
          </button>
          <button className={`tab-btn${inputMode === 'file' ? ' active' : ''}`} onClick={() => setInputMode('file')}>
            Upload .eml
          </button>
        </div>

        {inputMode === 'paste' ? (
          <>
            <div className="form-group mt-2">
              <div className="flex flex-wrap gap-2 mb-2">
                <button className="btn btn-sm btn-outline" onClick={() => setRawInput(sampleHeaders)}>Load Sample Headers</button>
              </div>
              <label htmlFor="headerInput">Raw Email Headers</label>
              <textarea
                id="headerInput"
                className="form-control"
                rows={14}
                placeholder={'Paste full email headers here...\n\nIn most email clients:\n- Gmail: Open message → ⋮ → Show original\n- Outlook: Open message → File → Properties → Internet Headers\n- Apple Mail: View → Message → All Headers'}
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                style={{ fontFamily: "'Consolas','Monaco',monospace", fontSize: '0.8rem' }}
              />
            </div>
            <button className="btn btn-primary" onClick={analyze}>Analyze Headers</button>{' '}
            <button className="btn btn-outline" onClick={clearAll}>Clear</button>
          </>
        ) : (
          <>
            <div
              style={{
                border: `2px dashed ${dragOver ? '#4fc3f7' : '#1e2a45'}`,
                borderRadius: 12, padding: 48, textAlign: 'center', margin: '16px 0', cursor: 'pointer',
                transition: 'all 0.2s',
                background: dragOver ? 'rgba(79,195,247,0.05)' : 'transparent',
              }}
              onClick={() => document.getElementById('emlFileInput')?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
              }}
            >
              <div style={{ fontSize: '2rem', color: '#4fc3f7', marginBottom: 12 }}>&#128231;</div>
              <p style={{ color: '#9e9e9e', marginBottom: 8 }}>Drag &amp; drop an .eml file here, or click to browse</p>
              <p style={{ color: '#616161', fontSize: '0.8rem' }}>Supports .eml and .txt files containing email headers</p>
              <input
                type="file"
                id="emlFileInput"
                accept=".eml,.txt"
                style={{ display: 'none' }}
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>
            <button className="btn btn-outline" onClick={clearAll}>Clear</button>
          </>
        )}

        {parseError && (
          <div className="result-box visible error" style={{ display: 'block' }}>
            <div className="result-header">Parse Error</div>
            <div className="result-body">{parseError}</div>
          </div>
        )}
      </div>

      {/* Results */}
      {parsed && (
        <>
          {/* Result tabs */}
          <div className="tabs">
            {([
              ['summary', 'Summary'],
              ['hops', `Routing (${parsed.hops.length} hops)`],
              ['auth', `Authentication (${parsed.authResults.length})`],
              ['security', `Security (${parsed.securityHeaders.length})`],
              ['classification', `Classification (${parsed.classificationHeaders.length})`],
              ['headers', `All Headers (${parsed.headers.length})`],
              ['raw', 'Raw'],
            ] as [ActiveTab, string][]).map(([key, label]) => (
              <button
                key={key}
                className={`tab-btn${activeTab === key ? ' active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Summary tab */}
          {activeTab === 'summary' && (
            <div className="test-panel">
              <h2>Message Summary</h2>

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
                <StatCard label="Hops" value={String(parsed.summary.hopCount)} />
                <StatCard
                  label="Delivery Time"
                  value={parsed.summary.totalDeliveryTime !== null ? formatDuration(parsed.summary.totalDeliveryTime) : 'N/A'}
                />
                <StatCard label="SPF" value={parsed.summary.spf} color={authResultColor(parsed.summary.spf)} />
                <StatCard label="DKIM" value={parsed.summary.dkim} color={authResultColor(parsed.summary.dkim)} />
                <StatCard label="DMARC" value={parsed.summary.dmarc} color={authResultColor(parsed.summary.dmarc)} />
                <StatCard
                  label="Encryption"
                  value={parsed.summary.encrypted ? 'TLS' : 'None'}
                  color={parsed.summary.encrypted ? '#66bb6a' : '#ef5350'}
                />
              </div>

              <table className="data-table">
                <tbody>
                  <SummaryRow label="From" value={parsed.summary.from} />
                  <SummaryRow label="To" value={parsed.summary.to} />
                  {parsed.summary.cc && <SummaryRow label="CC" value={parsed.summary.cc} />}
                  <SummaryRow label="Subject" value={parsed.summary.subject} />
                  <SummaryRow label="Date" value={parsed.summary.date} />
                  <SummaryRow label="Message-ID" value={parsed.summary.messageId} mono />
                  <SummaryRow label="Return-Path" value={parsed.summary.returnPath} mono />
                  <SummaryRow label="Content-Type" value={parsed.summary.contentType} />
                  {parsed.summary.xMailer && <SummaryRow label="X-Mailer" value={parsed.summary.xMailer} />}
                  {parsed.summary.spamScore && <SummaryRow label="Spam Score" value={parsed.summary.spamScore} />}
                </tbody>
              </table>
            </div>
          )}

          {/* Hops tab */}
          {activeTab === 'hops' && (
            <div className="test-panel">
              <h2>Message Routing</h2>
              <p style={{ color: '#9e9e9e', fontSize: '0.9rem', marginBottom: 16 }}>
                {parsed.hops.length} hop{parsed.hops.length !== 1 ? 's' : ''} traced from origin to destination.
                {parsed.summary.totalDeliveryTime !== null && (
                  <span> Total delivery time: <strong style={{ color: '#fff' }}>{formatDuration(parsed.summary.totalDeliveryTime)}</strong></span>
                )}
              </p>

              {parsed.hops.length === 0 ? (
                <div className="info-box">No Received headers found.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {parsed.hops.map((hop) => (
                    <HopCard key={hop.index} hop={hop} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Authentication tab */}
          {activeTab === 'auth' && (
            <div className="test-panel">
              <h2>Authentication Results</h2>
              <p style={{ color: '#9e9e9e', fontSize: '0.9rem', marginBottom: 16 }}>
                SPF, DKIM, DMARC, and ARC verification results extracted from authentication headers.
              </p>

              {parsed.authResults.length === 0 ? (
                <div className="info-box">No authentication results found in the headers.</div>
              ) : (
                <>
                  {/* Auth summary cards */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                    {parsed.authResults.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#0d1117', border: '1px solid #1e2a45', borderRadius: 10, padding: '14px 20px',
                          minWidth: 160, flex: '1 1 auto',
                        }}
                      >
                        <div style={{ color: '#9e9e9e', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.method}</div>
                        <div style={{ color: authResultColor(r.result), fontSize: '1.3rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          {r.result}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Detailed table */}
                  <table className="data-table">
                    <thead>
                      <tr><th>Method</th><th>Result</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                      {parsed.authResults.map((r, i) => (
                        <tr key={i}>
                          <td><span className="tag tag-blue">{r.method}</span></td>
                          <td>
                            <span style={{ color: authResultColor(r.result), fontWeight: 700, textTransform: 'uppercase' }}>
                              {r.result}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', fontFamily: "'Consolas','Monaco',monospace", wordBreak: 'break-all', color: '#9e9e9e' }}>
                            {r.detail}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <div className="data-types-grid mt-4">
                <div className="data-type">
                  <h4>SPF (Sender Policy Framework)</h4>
                  <p>Verifies that the sending server&apos;s IP is authorized by the sender&apos;s domain DNS records to send email on its behalf.</p>
                </div>
                <div className="data-type">
                  <h4>DKIM (DomainKeys Identified Mail)</h4>
                  <p>Cryptographic signature that verifies the email content hasn&apos;t been tampered with and was authorized by the signing domain.</p>
                </div>
                <div className="data-type">
                  <h4>DMARC (Domain-based Message Auth)</h4>
                  <p>Policy framework that uses SPF and DKIM to determine what happens when authentication fails (none, quarantine, reject).</p>
                </div>
                <div className="data-type">
                  <h4>ARC (Authenticated Received Chain)</h4>
                  <p>Preserves authentication results across mail forwarding. Helps prevent legitimate forwarded mail from failing DMARC checks.</p>
                </div>
              </div>
            </div>
          )}

          {/* Security / SEG tab */}
          {activeTab === 'security' && (
            <div className="test-panel">
              <h2>Security &amp; SEG Headers</h2>
              <p style={{ color: '#9e9e9e', fontSize: '0.9rem', marginBottom: 16 }}>
                Headers injected by Secure Email Gateways (SEGs), anti-spam engines, antivirus scanners, and email security products.
              </p>

              {parsed.securityHeaders.length === 0 ? (
                <div className="info-box">
                  <strong>No security headers detected.</strong> This email does not contain headers from known email security products.
                </div>
              ) : (
                <>
                  {/* Vendor filter chips */}
                  {(() => {
                    const vendors: Record<string, number> = {};
                    const cats: Record<string, number> = {};
                    for (const sh of parsed.securityHeaders) {
                      vendors[sh.vendor] = (vendors[sh.vendor] || 0) + 1;
                      cats[sh.category] = (cats[sh.category] || 0) + 1;
                    }
                    return (
                      <>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#757575', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Filter by Vendor
                        </label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                          <button
                            className={`btn btn-sm ${secVendorFilter === null ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setSecVendorFilter(null)}
                          >
                            All ({parsed.securityHeaders.length})
                          </button>
                          {Object.entries(vendors).map(([vendor, count]) => (
                            <button
                              key={vendor}
                              className={`btn btn-sm ${secVendorFilter === vendor ? 'btn-primary' : 'btn-outline'}`}
                              onClick={() => setSecVendorFilter(secVendorFilter === vendor ? null : vendor)}
                            >
                              {vendor} ({count})
                            </button>
                          ))}
                        </div>

                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#757575', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Filter by Category
                        </label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                          <button
                            className={`btn btn-sm ${secCategoryFilter === null ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setSecCategoryFilter(null)}
                          >
                            All
                          </button>
                          {Object.entries(cats).map(([cat, count]) => {
                            const isActive = secCategoryFilter === cat;
                            return (
                              <button
                                key={cat}
                                style={{
                                  cursor: 'pointer',
                                  padding: '4px 12px',
                                  borderRadius: 6,
                                  border: `1px solid ${isActive ? '#4fc3f7' : '#1e2a45'}`,
                                  background: isActive ? 'rgba(79,195,247,0.15)' : '#0d1117',
                                  color: isActive ? '#4fc3f7' : '#b0bec5',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  fontFamily: 'inherit',
                                  transition: 'all 0.2s',
                                }}
                                onClick={() => setSecCategoryFilter(isActive ? null : cat)}
                              >
                                {categoryLabels[cat] ?? cat} ({count})
                              </button>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}

                  {/* Filtered & grouped results */}
                  {(() => {
                    const filtered = parsed.securityHeaders.filter((sh) => {
                      if (secVendorFilter && sh.vendor !== secVendorFilter) return false;
                      if (secCategoryFilter && sh.category !== secCategoryFilter) return false;
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="info-box">
                          No headers match the current filters.{' '}
                          <button
                            style={{ background: 'none', border: 'none', color: '#4fc3f7', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}
                            onClick={() => { setSecVendorFilter(null); setSecCategoryFilter(null); }}
                          >
                            Clear filters
                          </button>
                        </div>
                      );
                    }

                    const grouped: Record<string, typeof filtered> = {};
                    for (const sh of filtered) {
                      (grouped[sh.vendor] ??= []).push(sh);
                    }

                    return (
                      <>
                        <p style={{ color: '#757575', fontSize: '0.8rem', marginBottom: 12 }}>
                          Showing {filtered.length} of {parsed.securityHeaders.length} headers
                        </p>
                        {Object.entries(grouped).map(([vendor, items]) => (
                          <div key={vendor} style={{ marginBottom: 20 }}>
                            <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 10 }}>{vendor}</h3>
                            <div style={{ display: 'grid', gap: 8 }}>
                              {items.map((sh, i) => (
                                <div
                                  key={i}
                                  style={{ background: '#0d1117', border: '1px solid #1e2a45', borderRadius: 8, padding: '12px 16px' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ color: '#4fc3f7', fontWeight: 600, fontFamily: "'Consolas','Monaco',monospace", fontSize: '0.8rem' }}>
                                      {sh.name}
                                    </span>
                                    <button
                                      className={`tag ${categoryColors[sh.category] ?? 'tag-blue'}`}
                                      style={{ fontSize: '0.6rem', cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
                                      onClick={() => setSecCategoryFilter(secCategoryFilter === sh.category ? null : sh.category)}
                                    >
                                      {categoryLabels[sh.category] ?? sh.category}
                                    </button>
                                  </div>
                                  <div style={{ color: '#b0bec5', fontFamily: "'Consolas','Monaco',monospace", fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                    {sh.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </>
              )}

              <h3 style={{ color: '#fff', marginTop: 24, marginBottom: 12 }}>Supported Products</h3>
              <div className="data-types-grid">
                <div className="data-type">
                  <h4>Fortra (Agari / Clearswift)</h4>
                  <p>X-Agari-* (DMARC/BEC), X-SEG-* (Clearswift SEG), X-MSW-JEMD-* (malware, spam scoring via Mailshell and Rspamd engines).</p>
                </div>
                <div className="data-type">
                  <h4>Microsoft Exchange / Defender</h4>
                  <p>X-Forefront-Antispam-Report, X-Microsoft-Antispam, SCL/PCL scoring, X-MS-Exchange-Organization-* transport headers.</p>
                </div>
                <div className="data-type">
                  <h4>Proofpoint / Mimecast / Barracuda</h4>
                  <p>Vendor-specific spam details, virus versions, bulk signatures, impersonation protection, and envelope tracking headers.</p>
                </div>
                <div className="data-type">
                  <h4>Cisco IronPort / SenderBase</h4>
                  <p>X-IronPort-Anti-Spam, X-IronPort-AV (antivirus), X-SBRS (SenderBase Reputation Score from -10 to +10).</p>
                </div>
                <div className="data-type">
                  <h4>SpamAssassin / Rspamd / ClamAV</h4>
                  <p>X-Spam-Status/Score/Flag/Level/Report, X-Spamd-Result, X-Virus-Scanned, X-Amavis-Alert.</p>
                </div>
                <div className="data-type">
                  <h4>Trend Micro / Symantec / Kaspersky</h4>
                  <p>X-TMASE-Result, X-TM-AS-*, X-Brightmail-Tracker, X-KLMS-AntiVirus/AntiSpam/AntiPhishing headers.</p>
                </div>
                <div className="data-type">
                  <h4>Fortinet FortiMail</h4>
                  <p>X-FEAS-* (system whitelist, spam outbreak, banned words, dictionary matches), X-FortiMail-* headers.</p>
                </div>
                <div className="data-type">
                  <h4>Trellix (FireEye) / Sophos</h4>
                  <p>X-FireEye-*, X-FE-* threat detection headers. X-Sophos-*, X-Lased anti-spam scanning results.</p>
                </div>
              </div>
            </div>
          )}

          {/* Classification tab */}
          {activeTab === 'classification' && (
            <div className="test-panel">
              <h2>Classification &amp; Security Headers</h2>
              <p style={{ color: '#9e9e9e', fontSize: '0.9rem', marginBottom: 16 }}>
                Email headers used by DLP, classification, and security products to tag messages with sensitivity labels and metadata.
              </p>

              {parsed.classificationHeaders.length === 0 ? (
                <div className="info-box">
                  <strong>No classification headers detected.</strong> This email does not contain headers from known classification products
                  (Microsoft Purview/MIP, Titus, Boldon James, Fortra Digital Guardian, Proofpoint, Mimecast, etc.).
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
                  {parsed.classificationHeaders.map((ch, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(198,40,40,0.08)', border: '1px solid rgba(198,40,40,0.3)',
                        borderRadius: 8, padding: '14px 18px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ color: '#ef5350', fontWeight: 700, fontSize: '0.9rem', fontFamily: "'Consolas','Monaco',monospace" }}>
                          {ch.name}
                        </span>
                        <span className="tag tag-orange" style={{ fontSize: '0.6rem' }}>{ch.product}</span>
                      </div>
                      <div style={{ color: '#e0e0e0', fontFamily: "'Consolas','Monaco',monospace", fontSize: '0.8rem', wordBreak: 'break-all' }}>
                        {ch.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h3 style={{ color: '#fff', marginTop: 24, marginBottom: 12 }}>Known Classification Header Patterns</h3>
              <div className="data-types-grid">
                <div className="data-type">
                  <h4>Microsoft Purview / MIP</h4>
                  <p>MSIP_Label_*, Sensitivity, X-MS-Exchange-Organization-* headers containing sensitivity labels and content markings.</p>
                </div>
                <div className="data-type">
                  <h4>Titus Classification</h4>
                  <p>X-Titus-Classification, X-Titus-GUIDValue headers applied by Titus (now Fortra) classification products.</p>
                </div>
                <div className="data-type">
                  <h4>Boldon James</h4>
                  <p>X-BoldonJames-*, X-BJ-* headers from Boldon James Classifier marking email sensitivity levels.</p>
                </div>
                <div className="data-type">
                  <h4>Fortra Digital Guardian</h4>
                  <p>X-DG-*, X-DigitalGuardian-* headers applied by endpoint or network DLP classification.</p>
                </div>
                <div className="data-type">
                  <h4>Security Gateways</h4>
                  <p>X-Proofpoint-*, X-Mimecast-*, X-Barracuda-*, X-Forcepoint-* headers from email security appliances.</p>
                </div>
                <div className="data-type">
                  <h4>RFC Sensitivity</h4>
                  <p>The standard &quot;Sensitivity&quot; header (RFC 2156) with values like Personal, Private, Company-Confidential.</p>
                </div>
              </div>
            </div>
          )}

          {/* All Headers tab */}
          {activeTab === 'headers' && (
            <div className="test-panel">
              <h2>All Headers ({parsed.headers.length})</h2>
              <div className="form-group mt-2" style={{ marginBottom: 12 }}>
                <input
                  className="form-control"
                  placeholder="Filter headers by name or value..."
                  value={headerFilter}
                  onChange={(e) => setHeaderFilter(e.target.value)}
                />
              </div>
              <table className="data-table">
                <thead>
                  <tr><th style={{ width: 200 }}>Header</th><th>Value</th></tr>
                </thead>
                <tbody>
                  {filteredHeaders.map((h, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontFamily: "'Consolas','Monaco',monospace", fontSize: '0.8rem', color: '#4fc3f7', verticalAlign: 'top' }}>
                        {h.name}
                      </td>
                      <td style={{ fontFamily: "'Consolas','Monaco',monospace", fontSize: '0.8rem', wordBreak: 'break-all' }}>
                        {h.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredHeaders.length === 0 && (
                <div className="info-box mt-2">No headers match the filter.</div>
              )}
            </div>
          )}

          {/* Raw tab */}
          {activeTab === 'raw' && (
            <div className="test-panel">
              <h2>Raw Input</h2>
              <div
                className="code-block"
                style={{ maxHeight: 500, overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}
              >
                {rawInput}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: '#0d1117', border: '1px solid #1e2a45', borderRadius: 10, padding: '14px 20px', flex: '1 1 auto', minWidth: 130 }}>
      <div style={{ color: '#9e9e9e', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ color: color ?? '#fff', fontSize: '1.3rem', fontWeight: 700, textTransform: 'uppercase' }}>{value}</div>
    </div>
  );
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <tr>
      <td style={{ width: 140, fontWeight: 600, color: '#b0bec5', verticalAlign: 'top' }}>{label}</td>
      <td style={mono ? { fontFamily: "'Consolas','Monaco',monospace", fontSize: '0.8rem', wordBreak: 'break-all' } : undefined}>
        {value}
      </td>
    </tr>
  );
}

function HopCard({ hop }: { hop: EmailHop }) {
  return (
    <div style={{ background: '#0d1117', border: '1px solid #1e2a45', borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 28, height: 28, borderRadius: '50%', background: 'rgba(79,195,247,0.15)',
            color: '#4fc3f7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem',
          }}>
            {hop.index}
          </span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{hop.by || 'Unknown server'}</span>
          {hop.tls && <span className="tag tag-green" style={{ fontSize: '0.6rem' }}>TLS</span>}
          {hop.with && <span className="tag tag-blue" style={{ fontSize: '0.6rem' }}>{hop.with}</span>}
        </div>
        {hop.delay !== null && (
          <span style={{ color: delayColor(hop.delay), fontWeight: 700, fontSize: '0.85rem' }}>
            {hop.delay === 0 ? '< 1s' : '+' + formatDuration(hop.delay)}
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '4px 12px', fontSize: '0.8rem' }}>
        {hop.from && (
          <>
            <span style={{ color: '#757575' }}>From</span>
            <span style={{ color: '#b0bec5', fontFamily: "'Consolas','Monaco',monospace", wordBreak: 'break-all' }}>{hop.from}</span>
          </>
        )}
        <span style={{ color: '#757575' }}>By</span>
        <span style={{ color: '#b0bec5', fontFamily: "'Consolas','Monaco',monospace", wordBreak: 'break-all' }}>{hop.by || 'N/A'}</span>
        {hop.dateRaw && (
          <>
            <span style={{ color: '#757575' }}>Date</span>
            <span style={{ color: '#b0bec5' }}>{hop.dateRaw}</span>
          </>
        )}
      </div>
    </div>
  );
}
