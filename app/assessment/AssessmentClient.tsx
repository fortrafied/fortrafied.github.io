'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { downloadJSON } from '../lib/export-utils';

/* ===== Assessment Data Model ===== */

interface CheckItem {
  id: string;
  label: string;
  description: string;
  tool?: { href: string; label: string };
}

interface AssessmentSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: CheckItem[];
}

const sections: AssessmentSection[] = [
  {
    id: 'dim_http',
    title: 'HTTP / HTTPS Traffic',
    icon: '&#8644;',
    description: 'Validate that your DLP inspects web traffic for sensitive data, including SSL/TLS-encrypted connections.',
    items: [
      { id: 'dim_http_plaintext', label: 'HTTP POST — plaintext payload detected', description: 'Submit sensitive data via HTTP POST and verify your DLP generates an alert for unencrypted transmission.', tool: { href: '/http-post', label: 'HTTP POST Test' } },
      { id: 'dim_http_file', label: 'HTTP POST — file upload detected', description: 'Upload a file containing sensitive data via HTTP POST and confirm DLP scans file content, not just text payloads.' },
      { id: 'dim_https_ssl', label: 'HTTPS POST — SSL inspection active', description: 'Submit sensitive data via HTTPS POST and verify your DLP performs SSL/TLS decryption to inspect encrypted traffic.', tool: { href: '/https-post', label: 'HTTPS POST Test' } },
      { id: 'dim_https_file', label: 'HTTPS POST — encrypted file upload detected', description: 'Upload a sensitive file over HTTPS and confirm DLP inspects the decrypted content.' },
      { id: 'dim_http_content_types', label: 'Multiple content types inspected', description: 'Test with different Content-Types (text/plain, application/json, multipart/form-data) to verify DLP handles all formats.' },
    ],
  },
  {
    id: 'dim_email',
    title: 'Email / SMTP',
    icon: '&#9993;',
    description: 'Verify that outbound email is scanned for sensitive data in message bodies, subjects, and attachments.',
    items: [
      { id: 'dim_email_body', label: 'Sensitive data in email body detected', description: 'Send an email with PII/PCI data in the message body and verify DLP flags or blocks the transmission.', tool: { href: '/email-test', label: 'Email / SMTP Test' } },
      { id: 'dim_email_subject', label: 'Sensitive data in subject line detected', description: 'Include sensitive data in the email subject line — some DLP solutions only scan the body.' },
      { id: 'dim_email_attachment', label: 'Sensitive file attachment detected', description: 'Attach a file containing sensitive data and confirm DLP scans attachment content.' },
      { id: 'dim_email_zip', label: 'Compressed attachment scanned', description: 'Attach a ZIP file containing sensitive documents. Verify DLP can decompress and inspect archive contents.' },
      { id: 'dim_email_spf', label: 'Email authentication configured (SPF/DKIM/DMARC)', description: 'Verify your email domain has SPF, DKIM, and DMARC records properly configured to prevent spoofing.', tool: { href: '/email-analyzer', label: 'Email Header Analyzer' } },
    ],
  },
  {
    id: 'dim_ftp',
    title: 'FTP / File Transfer',
    icon: '&#128229;',
    description: 'Test whether DLP monitors file transfer protocols for sensitive data exfiltration.',
    items: [
      { id: 'dim_ftp_upload', label: 'FTP upload of sensitive file detected', description: 'Upload a file with sensitive data via FTP and verify DLP monitors the transfer.', tool: { href: '/ftp-test', label: 'FTP Upload Test' } },
      { id: 'dim_ftp_plaintext', label: 'Plaintext FTP credentials flagged', description: 'FTP transmits credentials in plaintext. Verify your DLP or network security flags this as a risk.' },
      { id: 'dim_ftp_sftp', label: 'SFTP/SCP transfers monitored', description: 'If your environment uses SFTP or SCP, verify DLP can inspect these encrypted file transfers.' },
    ],
  },
  {
    id: 'diu_clipboard',
    title: 'Clipboard / Copy-Paste',
    icon: '&#128203;',
    description: 'Validate endpoint DLP detection of sensitive data copied to the clipboard or pasted into unauthorized applications.',
    items: [
      { id: 'diu_clip_copy', label: 'Copy of sensitive data to clipboard detected', description: 'Copy text containing PII or PCI data and verify the endpoint DLP agent logs or alerts on the action.', tool: { href: '/clipboard-test', label: 'Clipboard / Paste Test' } },
      { id: 'diu_clip_paste_blocked', label: 'Paste into unauthorized app blocked', description: 'Copy sensitive data and attempt to paste it into an unauthorized application (e.g., personal email, chat). Verify DLP blocks the paste.' },
      { id: 'diu_clip_paste_allowed', label: 'Paste into authorized app allowed', description: 'Verify that pasting sensitive data into authorized/approved applications is not blocked (no false positive).' },
    ],
  },
  {
    id: 'diu_print',
    title: 'Print / Screenshot',
    icon: '&#128424;',
    description: 'Test whether endpoint DLP detects attempts to print or capture screens containing sensitive data.',
    items: [
      { id: 'diu_print_physical', label: 'Print of sensitive document detected', description: 'Print a document containing sensitive data and verify the DLP agent logs or blocks the print job.', tool: { href: '/print-test', label: 'Print / Screenshot Test' } },
      { id: 'diu_print_pdf', label: 'Print-to-PDF detected', description: 'Use "Print to PDF" or a virtual printer with a sensitive document. Verify DLP treats this the same as physical printing.' },
      { id: 'diu_print_screenshot', label: 'Screenshot of sensitive data detected', description: 'Take a screenshot while sensitive data is displayed on screen and verify endpoint DLP logs the action.' },
      { id: 'diu_print_screenrecord', label: 'Screen recording detected', description: 'Start a screen recording while sensitive data is visible. Check if DLP detects the recording software.' },
    ],
  },
  {
    id: 'diu_removable',
    title: 'Removable Media / USB',
    icon: '&#128190;',
    description: 'Verify that endpoint DLP controls data transfer to removable storage devices.',
    items: [
      { id: 'diu_usb_copy', label: 'File copy to USB drive detected', description: 'Copy a file containing sensitive data to a USB drive and verify the DLP agent logs or blocks the transfer.' },
      { id: 'diu_usb_block', label: 'Unauthorized USB device blocked', description: 'Insert an unauthorized USB storage device and verify endpoint DLP blocks it or alerts on it.' },
      { id: 'diu_usb_allowed', label: 'Authorized USB device allowed', description: 'Insert an approved/whitelisted USB device and verify it works normally (no false positive blocking).' },
      { id: 'diu_bluetooth', label: 'Bluetooth file transfer monitored', description: 'Attempt to send a sensitive file via Bluetooth. Verify DLP monitors or blocks this transfer channel.' },
    ],
  },
  {
    id: 'diu_cloud',
    title: 'Cloud Storage / Sync',
    icon: '&#9729;',
    description: 'Test DLP coverage for cloud storage uploads and sync client activity.',
    items: [
      { id: 'diu_cloud_upload', label: 'Cloud storage upload detected', description: 'Upload a sensitive file to a cloud service (Google Drive, OneDrive, Dropbox) and verify DLP detects the upload.' },
      { id: 'diu_cloud_sync', label: 'Sync client file copy detected', description: 'Place a sensitive file in a local sync folder (e.g., Dropbox folder) and verify DLP scans before sync completes.' },
      { id: 'diu_cloud_share', label: 'External sharing link detected', description: 'Create a public or external sharing link for a sensitive document. Verify DLP alerts on the action.' },
    ],
  },
  {
    id: 'dar',
    title: 'Data at Rest / Discovery',
    icon: '&#128451;',
    description: 'Validate that your DLP solution can discover sensitive data stored across endpoints, servers, and cloud storage.',
    items: [
      { id: 'dar_endpoint', label: 'Endpoint discovery scan completed', description: 'Run a DLP discovery scan on an endpoint workstation. Verify it identifies files containing sensitive data.', tool: { href: '/sample-data', label: 'Sample Data Downloads' } },
      { id: 'dar_server', label: 'File server scan completed', description: 'Run a discovery scan on a shared file server or NAS. Confirm it finds sensitive data in nested directories.' },
      { id: 'dar_cloud', label: 'Cloud storage scan completed', description: 'Scan cloud storage (SharePoint, Google Drive, S3 buckets) for sensitive data. Verify findings are reported.' },
      { id: 'dar_classification', label: 'Classification labels applied correctly', description: 'Verify that discovered files are classified with the correct sensitivity labels based on content.', tool: { href: '/data-classifier', label: 'Classification Tester' } },
      { id: 'dar_formats', label: 'Multiple file formats scanned', description: 'Verify discovery scans cover DOCX, XLSX, PDF, CSV, TXT, and other common formats — not just plaintext.' },
      { id: 'dar_encrypted', label: 'Password-protected files flagged', description: 'Place a password-protected file in the scan path. Verify DLP flags it as unreadable or requiring review.' },
    ],
  },
  {
    id: 'policy',
    title: 'Policy & Response',
    icon: '&#9881;',
    description: 'Verify that DLP policies are correctly configured and enforcement actions work as expected.',
    items: [
      { id: 'policy_monitor', label: 'Monitor mode generates alerts', description: 'With policies in monitor/audit mode, verify that violations generate alerts in the DLP console without blocking.' },
      { id: 'policy_block', label: 'Block mode prevents transmission', description: 'Switch critical policies to block mode. Verify that sensitive data transmission is actively prevented.' },
      { id: 'policy_notify', label: 'User notification displayed', description: 'When a policy triggers, verify the end user receives an appropriate notification explaining the block or warning.' },
      { id: 'policy_justify', label: 'Business justification workflow works', description: 'If your policies allow override with justification, test that the workflow prompts the user and logs the reason.' },
      { id: 'policy_incident', label: 'Incidents created with evidence', description: 'Verify that DLP incidents contain: matched policy, data type, severity, channel, and evidence/content snippets.' },
      { id: 'policy_escalation', label: 'Escalation and notification chain works', description: 'Trigger a high-severity policy and verify the escalation path (email to manager, SIEM integration, ticketing) fires correctly.' },
      { id: 'policy_false_pos', label: 'False positive rate acceptable', description: 'Review recent DLP alerts. Verify the false positive rate is within acceptable limits and tune rules if needed.' },
    ],
  },
];

const STORAGE_KEY = 'fortrafied_assessment';

interface AssessmentState {
  checks: Record<string, 'pass' | 'fail' | 'na' | null>;
  notes: Record<string, string>;
  assessorName: string;
  assessmentDate: string;
}

function getInitialState(): AssessmentState {
  if (typeof window === 'undefined') return { checks: {}, notes: {}, assessorName: '', assessmentDate: '' };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { checks: {}, notes: {}, assessorName: '', assessmentDate: new Date().toISOString().split('T')[0] };
}

function computeStats(checks: Record<string, 'pass' | 'fail' | 'na' | null>) {
  const allItems = sections.flatMap(s => s.items);
  let pass = 0, fail = 0, na = 0, untested = 0;
  for (const item of allItems) {
    const v = checks[item.id];
    if (v === 'pass') pass++;
    else if (v === 'fail') fail++;
    else if (v === 'na') na++;
    else untested++;
  }
  return { pass, fail, na, untested, total: allItems.length };
}

export default function AssessmentClient() {
  const [state, setState] = useState<AssessmentState>(getInitialState);
  const [expandedSection, setExpandedSection] = useState<string | null>(sections[0].id);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const setCheck = useCallback((id: string, value: 'pass' | 'fail' | 'na' | null) => {
    setState(prev => ({ ...prev, checks: { ...prev.checks, [id]: value } }));
  }, []);

  const setNote = useCallback((id: string, value: string) => {
    setState(prev => ({ ...prev, notes: { ...prev.notes, [id]: value } }));
  }, []);

  function resetAssessment() {
    const fresh: AssessmentState = { checks: {}, notes: {}, assessorName: '', assessmentDate: new Date().toISOString().split('T')[0] };
    setState(fresh);
  }

  function exportAssessment() {
    const stats = computeStats(state.checks);
    const exportData = {
      title: 'DLP Security Assessment Report',
      assessor: state.assessorName || 'Not specified',
      date: state.assessmentDate || new Date().toISOString().split('T')[0],
      exportedAt: new Date().toISOString(),
      summary: {
        totalChecks: stats.total,
        passed: stats.pass,
        failed: stats.fail,
        notApplicable: stats.na,
        untested: stats.untested,
        completionPercent: Math.round(((stats.pass + stats.fail + stats.na) / stats.total) * 100),
        passRate: stats.pass + stats.fail > 0 ? Math.round((stats.pass / (stats.pass + stats.fail)) * 100) : 0,
      },
      sections: sections.map(s => {
        const sectionItems = s.items.map(item => ({
          id: item.id,
          check: item.label,
          result: state.checks[item.id] || 'untested',
          notes: state.notes[item.id] || '',
        }));
        const sPassed = sectionItems.filter(i => i.result === 'pass').length;
        const sFailed = sectionItems.filter(i => i.result === 'fail').length;
        return {
          category: s.title,
          passed: sPassed,
          failed: sFailed,
          items: sectionItems,
        };
      }),
    };
    downloadJSON(exportData, `dlp-assessment-${Date.now()}.json`);
  }

  const stats = computeStats(state.checks);
  const completionPct = Math.round(((stats.pass + stats.fail + stats.na) / stats.total) * 100);
  const passRate = stats.pass + stats.fail > 0 ? Math.round((stats.pass / (stats.pass + stats.fail)) * 100) : 0;

  return (
    <>
      <div className="info-box">
        <strong>Self-Led Assessment:</strong> Work through each section to evaluate your DLP
        deployment. Progress is saved automatically in your browser. For a comprehensive,
        professional security assessment,{' '}
        <a href="https://www.fortra.com" target="_blank" rel="noopener noreferrer">
          Fortra offers expert-led assessment services
        </a>.
      </div>

      {/* Assessment metadata */}
      <div className="test-panel">
        <div className="two-col">
          <div className="form-group">
            <label htmlFor="assessor-name">Assessor Name</label>
            <input
              id="assessor-name"
              type="text"
              className="form-control"
              placeholder="Your name..."
              value={state.assessorName}
              onChange={e => setState(prev => ({ ...prev, assessorName: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="assessment-date">Assessment Date</label>
            <input
              id="assessment-date"
              type="date"
              className="form-control"
              value={state.assessmentDate}
              onChange={e => setState(prev => ({ ...prev, assessmentDate: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="test-panel">
        <h2>Progress Overview</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
          <div className="assess-stat-card">
            <div className="assess-stat-value">{completionPct}%</div>
            <div className="assess-stat-label">Complete</div>
          </div>
          <div className="assess-stat-card">
            <div className="assess-stat-value" style={{ color: '#66bb6a' }}>{stats.pass}</div>
            <div className="assess-stat-label">Passed</div>
          </div>
          <div className="assess-stat-card">
            <div className="assess-stat-value" style={{ color: '#ef5350' }}>{stats.fail}</div>
            <div className="assess-stat-label">Failed</div>
          </div>
          <div className="assess-stat-card">
            <div className="assess-stat-value" style={{ color: '#ffa726' }}>{stats.untested}</div>
            <div className="assess-stat-label">Untested</div>
          </div>
          <div className="assess-stat-card">
            <div className="assess-stat-value" style={{ color: '#9e9e9e' }}>{stats.na}</div>
            <div className="assess-stat-label">N/A</div>
          </div>
          <div className="assess-stat-card">
            <div className="assess-stat-value" style={{ color: passRate >= 80 ? '#66bb6a' : passRate >= 50 ? '#ffa726' : '#ef5350' }}>{passRate}%</div>
            <div className="assess-stat-label">Pass Rate</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="assess-progress-bar">
          {stats.pass > 0 && <div className="assess-progress-fill assess-fill-pass" style={{ width: `${(stats.pass / stats.total) * 100}%` }} />}
          {stats.fail > 0 && <div className="assess-progress-fill assess-fill-fail" style={{ width: `${(stats.fail / stats.total) * 100}%` }} />}
          {stats.na > 0 && <div className="assess-progress-fill assess-fill-na" style={{ width: `${(stats.na / stats.total) * 100}%` }} />}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem', color: '#757575' }}>
          <span><span style={{ color: '#66bb6a' }}>&bull;</span> Pass</span>
          <span><span style={{ color: '#ef5350' }}>&bull;</span> Fail</span>
          <span><span style={{ color: '#616161' }}>&bull;</span> N/A</span>
          <span><span style={{ color: '#1e2a45' }}>&bull;</span> Untested</span>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={exportAssessment}>Export Report (JSON)</button>
          <button className="btn btn-outline btn-sm" onClick={resetAssessment}>Reset Assessment</button>
        </div>
      </div>

      {/* Assessment Sections */}
      {sections.map(section => {
        const isExpanded = expandedSection === section.id;
        const sItems = section.items;
        const sPassed = sItems.filter(i => state.checks[i.id] === 'pass').length;
        const sFailed = sItems.filter(i => state.checks[i.id] === 'fail').length;
        const sDone = sItems.filter(i => state.checks[i.id] != null).length;

        return (
          <div key={section.id} className="test-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <button
              className="assess-section-header"
              onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              aria-expanded={isExpanded}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="assess-section-icon" dangerouslySetInnerHTML={{ __html: section.icon }} />
                <div style={{ textAlign: 'left' }}>
                  <div className="assess-section-title">{section.title}</div>
                  <div className="assess-section-meta">
                    {sDone}/{sItems.length} checked
                    {sPassed > 0 && <span style={{ color: '#66bb6a', marginLeft: 8 }}>{sPassed} passed</span>}
                    {sFailed > 0 && <span style={{ color: '#ef5350', marginLeft: 8 }}>{sFailed} failed</span>}
                  </div>
                </div>
              </div>
              <span className={`faq-arrow${isExpanded ? ' open' : ''}`} style={{ transform: isExpanded ? 'rotate(180deg)' : undefined }}>&#9662;</span>
            </button>

            {isExpanded && (
              <div style={{ padding: '0 24px 24px' }}>
                <p style={{ color: '#9e9e9e', fontSize: '0.9rem', marginBottom: 20 }}>{section.description}</p>
                {sItems.map(item => {
                  const val = state.checks[item.id] ?? null;
                  const note = state.notes[item.id] ?? '';
                  return (
                    <div key={item.id} className="assess-check-item">
                      <div className="assess-check-top">
                        <div style={{ flex: 1 }}>
                          <div className="assess-check-label">{item.label}</div>
                          <div className="assess-check-desc">{item.description}</div>
                          {item.tool && (
                            <Link href={item.tool.href} className="assess-tool-link">
                              Open {item.tool.label} &rarr;
                            </Link>
                          )}
                        </div>
                        <div className="assess-check-buttons">
                          <button
                            className={`assess-btn assess-btn-pass${val === 'pass' ? ' active' : ''}`}
                            onClick={() => setCheck(item.id, val === 'pass' ? null : 'pass')}
                            title="Pass"
                          >
                            Pass
                          </button>
                          <button
                            className={`assess-btn assess-btn-fail${val === 'fail' ? ' active' : ''}`}
                            onClick={() => setCheck(item.id, val === 'fail' ? null : 'fail')}
                            title="Fail"
                          >
                            Fail
                          </button>
                          <button
                            className={`assess-btn assess-btn-na${val === 'na' ? ' active' : ''}`}
                            onClick={() => setCheck(item.id, val === 'na' ? null : 'na')}
                            title="Not Applicable"
                          >
                            N/A
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        className="assess-note-input"
                        placeholder="Add notes..."
                        value={note}
                        onChange={e => setNote(item.id, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Fortra CTA */}
      <div className="test-panel" style={{ textAlign: 'center' }}>
        <h2>Need a Professional Assessment?</h2>
        <p style={{ color: '#9e9e9e', maxWidth: 600, margin: '12px auto 20px', fontSize: '0.9rem' }}>
          This self-led guide covers the fundamentals, but a comprehensive security assessment
          requires expert analysis of your specific environment, policies, and threat landscape.
          Fortra&apos;s security professionals provide in-depth assessments with actionable remediation plans.
        </p>
        <a
          href="https://www.fortra.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Learn About Fortra Security Assessments
        </a>
      </div>
    </>
  );
}
