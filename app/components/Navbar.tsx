'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DropdownItem {
  label: string;
  href?: string;
  disabled?: boolean;
  disabledNote?: string;
}

interface NavDropdown {
  label: string;
  items: DropdownItem[];
}

const dropdowns: NavDropdown[] = [
  {
    label: 'Data in Motion',
    items: [
      { label: 'HTTP POST Test', href: '/http-post' },
      { label: 'HTTPS POST Test', href: '/https-post' },
      { label: 'Email / SMTP Test', href: '/email-test' },
      { label: 'FTP Upload Test', href: '/ftp-test' },
    ],
  },
  {
    label: 'Data in Use',
    items: [
      { label: 'Clipboard / Paste Test', href: '/clipboard-test' },
      { label: 'Print / Screenshot Test', href: '/print-test' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Regex Pattern Tester', href: '/regex-tester' },
      { label: 'Classification Tester', href: '/data-classifier' },
      { label: 'Classification Builder', href: '/classification-builder' },
      { label: 'DP Solution Composer', href: '/dp-solution' },
      { label: 'DLP Prompt Builder', href: '/prompt-builder' },
      { label: 'File Hash Generator', href: '/hash-generator' },
    ],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  function toggleDropdown(idx: number) {
    setOpenDropdown(openDropdown === idx ? null : idx);
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-brand">
          <span className="brand-icon">&#x25c7;</span> Fortrafied{' '}
          <span className="brand-sub">Security Tools</span>
        </Link>
        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          &#9776;
        </button>
        <ul className={`nav-links${mobileOpen ? ' open' : ''}`}>
          {dropdowns.map((dd, i) => (
            <li
              key={dd.label}
              className={`nav-dropdown${openDropdown === i ? ' open' : ''}`}
            >
              <button
                className="dropdown-toggle"
                onClick={() => toggleDropdown(i)}
              >
                {dd.label} &#9662;
              </button>
              <ul className="dropdown-menu">
                {dd.items.map((item) =>
                  item.disabled ? (
                    <li key={item.label}>
                      <span className="nav-disabled">
                        {item.label} <em>({item.disabledNote})</em>
                      </span>
                    </li>
                  ) : (
                    <li key={item.label}>
                      <Link
                        href={item.href!}
                        onClick={() => {
                          setMobileOpen(false);
                          setOpenDropdown(null);
                        }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </li>
          ))}
          <li>
            <Link
              href="/sample-data"
              onClick={() => setMobileOpen(false)}
            >
              Sample Data
            </Link>
          </li>
          <li>
            <Link href="/faq" onClick={() => setMobileOpen(false)}>
              FAQ
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
