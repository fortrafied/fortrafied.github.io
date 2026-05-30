'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getFeatureStatus, isFeatureHidden } from '@/app/lib/feature-config';
import { getFeatureById, navSections } from '@/app/lib/feature-registry';

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

const dropdowns: NavDropdown[] = navSections
  .map((section) => ({
    label: section.label,
    items: section.featureIds
      .map((featureId) => getFeatureById(featureId))
      .filter((feature): feature is NonNullable<typeof feature> => !!feature)
      .filter((feature) => !isFeatureHidden(feature.id))
      .map((feature) => {
        const status = getFeatureStatus(feature.id);
        return {
          label: feature.label,
          href: feature.href,
          disabled: status === 'disabled',
          disabledNote: status === 'disabled' ? 'disabled by configuration' : undefined,
        };
      }),
  }))
  .filter((section) => section.items.length > 0);

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
            <Link href="/assessment" onClick={() => setMobileOpen(false)}>
              Assessment
            </Link>
          </li>
          <li>
            <Link href="/coverage-map" onClick={() => setMobileOpen(false)}>
              Coverage Map
            </Link>
          </li>
          <li>
            <Link href="/faq" onClick={() => setMobileOpen(false)}>
              FAQ
            </Link>
          </li>
          <li>
            <Link href="/about" onClick={() => setMobileOpen(false)}>
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
