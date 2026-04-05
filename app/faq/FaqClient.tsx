'use client';

import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const aboutItems: FaqItem[] = [
  {
    question: 'What is Fortrafied DLP Test?',
    answer: (
      <>
        Fortrafied DLP Test is a free, browser-based testing suite designed to help
        security professionals validate and evaluate the effectiveness of their Data
        Loss Prevention (DLP) solutions. It provides a safe environment to test
        detection capabilities across all three DLP categories: Data in Motion, Data
        in Use, and Data at Rest.
      </>
    ),
  },
  {
    question: 'Is any submitted data stored or logged?',
    answer: (
      <>
        <strong>No.</strong> All data submitted through these tools is discarded
        immediately after processing. Nothing is stored, logged, or retained on any
        server. The site is designed purely for testing purposes.
      </>
    ),
  },
  {
    question: 'Is the sample data real?',
    answer: (
      <>
        <strong>No.</strong> All sample data provided on this site is entirely
        synthetic. Credit card numbers use valid Luhn check digits but are not
        associated with any real accounts. Social Security Numbers, names, addresses,
        and all other PII are fabricated and do not correspond to real individuals.
      </>
    ),
  },
  {
    question: 'Who is this site for?',
    answer: (
      <>
        This site is intended for <strong>security teams</strong>,{' '}
        <strong>IT administrators</strong>, and <strong>compliance officers</strong>{' '}
        who need to validate that their DLP solutions are correctly configured and
        capable of detecting sensitive data across various channels and formats.
      </>
    ),
  },
];

const dlpItems: FaqItem[] = [
  {
    question: 'What are the three categories of DLP?',
    answer: (
      <>
        DLP is traditionally divided into three categories:
        <br /><br />
        <strong>Data in Motion (DIM)</strong> &mdash; Monitors and protects data as it
        travels across the network, including email, web uploads, FTP transfers, and
        other network protocols.
        <br /><br />
        <strong>Data in Use (DIU)</strong> &mdash; Protects data being actively used on
        endpoints, such as clipboard operations, printing, screen captures, and USB
        transfers.
        <br /><br />
        <strong>Data at Rest (DAR)</strong> &mdash; Discovers and protects sensitive
        data stored on file servers, databases, cloud storage, and endpoints.
      </>
    ),
  },
  {
    question: 'Should I test in monitor mode or block mode first?',
    answer: (
      <>
        <strong>Always start in monitor (audit) mode first.</strong> This lets you
        observe what your DLP solution detects without disrupting business operations.
        Once you have tuned your policies and reduced false positives to an acceptable
        level, gradually move to block mode for critical policies.
      </>
    ),
  },
  {
    question: 'Why does my DLP not detect HTTPS traffic?',
    answer: (
      <>
        Most DLP solutions require <strong>SSL/TLS inspection</strong> (also called
        SSL decryption or HTTPS interception) to inspect encrypted traffic. Without
        it, the DLP engine cannot see the contents of HTTPS requests. Ensure your
        proxy or firewall is configured to decrypt and re-encrypt HTTPS traffic, and
        that the necessary root CA certificates are deployed to endpoints.
      </>
    ),
  },
  {
    question: 'What is ICAP and how does it relate to DLP?',
    answer: (
      <>
        <strong>ICAP (Internet Content Adaptation Protocol)</strong> is a lightweight
        protocol defined in RFC 3507 that allows HTTP proxies to offload content
        scanning to external servers. In the context of DLP, a proxy forwards HTTP/HTTPS
        request and response bodies to a DLP engine via ICAP for inspection. This
        allows the DLP solution to analyze content in real time without being inline
        with the traffic flow.
      </>
    ),
  },
  {
    question: 'How do I test endpoint DLP (Data in Use)?',
    answer: (
      <>
        Endpoint DLP testing typically involves the following steps:
        <br /><br />
        <strong>1. Clipboard Test</strong> &mdash; Copy sensitive data and attempt to
        paste it into unauthorized applications.
        <br />
        <strong>2. USB Transfer Test</strong> &mdash; Attempt to copy sensitive files
        to a removable USB drive.
        <br />
        <strong>3. Print Test</strong> &mdash; Send a document containing sensitive data
        to a printer or PDF printer.
        <br />
        <strong>4. Screen Capture Test</strong> &mdash; Attempt to take screenshots
        while sensitive data is displayed.
        <br />
        <strong>5. Cloud Upload Test</strong> &mdash; Try uploading sensitive files to
        cloud storage services like Google Drive or Dropbox.
      </>
    ),
  },
  {
    question: 'What is the difference between EDM and regex-based detection?',
    answer: (
      <>
        <strong>Regex-based detection</strong> uses regular expression patterns to
        identify sensitive data formats (e.g., credit card numbers, SSNs). It is
        flexible but can produce false positives because it matches any text fitting
        the pattern, even if it is not actual sensitive data.
        <br /><br />
        <strong>Exact Data Matching (EDM)</strong> compares content against a
        fingerprinted database of known sensitive values (e.g., an actual employee
        database). It is far more accurate because it only triggers on real data, but
        it requires maintaining an up-to-date fingerprint database.
      </>
    ),
  },
];

function FaqSection({ title, items, defaultOpen }: { title: string; items: FaqItem[]; defaultOpen?: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen ?? null);

  function toggle(idx: number) {
    setOpenIndex(openIndex === idx ? null : idx);
  }

  return (
    <div className="test-panel" style={{ marginBottom: 32 }}>
      <h2>{title}</h2>
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`faq-item${openIndex === idx ? ' open' : ''}`}
          onClick={() => toggle(idx)}
        >
          <div className="faq-q">
            <span>{item.question}</span>
            <span className="faq-arrow">&#9662;</span>
          </div>
          <div className="faq-a">{item.answer}</div>
        </div>
      ))}
    </div>
  );
}

export default function FaqClient() {
  return (
    <>
      <style>{`
        .faq-item { background: #111827; border: 1px solid #1e2a45; border-radius: 8px; margin-bottom: 12px; }
        .faq-q { padding: 16px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: #fff; font-weight: 600; font-size: 0.95rem; }
        .faq-q:hover { color: #4fc3f7; }
        .faq-a { padding: 0 20px 16px; color: #9e9e9e; font-size: 0.9rem; display: none; line-height: 1.7; }
        .faq-item.open .faq-a { display: block; }
        .faq-item.open .faq-arrow { transform: rotate(180deg); }
        .faq-arrow { transition: transform 0.2s; color: #4fc3f7; }
      `}</style>
      <FaqSection title="About This Site" items={aboutItems} defaultOpen={0} />
      <FaqSection title="DLP Testing" items={dlpItems} />
    </>
  );
}
