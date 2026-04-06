'use client';

import { useState, useEffect, useMemo } from 'react';
import { downloadJSON } from '../lib/export-utils';

/* ===== Data Model ===== */

type CoverageStatus = 'covered' | 'partial' | 'gap' | 'na' | null;

const STATUS_CYCLE: (CoverageStatus)[] = [null, 'covered', 'partial', 'gap', 'na'];
const STATUS_LABELS: Record<string, string> = {
  covered: 'Covered',
  partial: 'Partial',
  gap: 'Gap',
  na: 'N/A',
};
const STATUS_COLORS: Record<string, string> = {
  covered: '#66bb6a',
  partial: '#ffa726',
  gap: '#ef5350',
  na: '#616161',
};

interface DataTypeRow {
  id: string;
  label: string;
  category: string;
}

interface ChannelCol {
  id: string;
  label: string;
  shortLabel: string;
  category: 'motion' | 'use' | 'rest';
}

const dataTypes: DataTypeRow[] = [
  // PII
  { id: 'ssn', label: 'Social Security Numbers', category: 'PII' },
  { id: 'names', label: 'Full Names', category: 'PII' },
  { id: 'dob', label: 'Dates of Birth', category: 'PII' },
  { id: 'email_addr', label: 'Email Addresses', category: 'PII' },
  { id: 'phone', label: 'Phone Numbers', category: 'PII' },
  { id: 'address', label: 'Physical Addresses', category: 'PII' },
  { id: 'dl', label: 'Driver License Numbers', category: 'PII' },
  // PCI
  { id: 'ccn', label: 'Credit Card Numbers', category: 'PCI' },
  { id: 'cvv', label: 'CVV / Security Codes', category: 'PCI' },
  { id: 'cc_exp', label: 'Card Expiration Dates', category: 'PCI' },
  // PHI
  { id: 'mrn', label: 'Medical Record Numbers', category: 'PHI' },
  { id: 'icd10', label: 'ICD-10 Diagnosis Codes', category: 'PHI' },
  { id: 'health_plan', label: 'Health Plan IDs', category: 'PHI' },
  { id: 'npi', label: 'NPI Numbers', category: 'PHI' },
  // Financial
  { id: 'routing', label: 'Routing Numbers', category: 'Financial' },
  { id: 'bank_acct', label: 'Bank Account Numbers', category: 'Financial' },
  { id: 'swift', label: 'SWIFT / BIC Codes', category: 'Financial' },
  { id: 'iban', label: 'IBAN Numbers', category: 'Financial' },
  { id: 'ein', label: 'EIN / Tax IDs', category: 'Financial' },
  // Credentials
  { id: 'api_keys', label: 'API Keys / Tokens', category: 'Credentials' },
  { id: 'passwords', label: 'Passwords / Secrets', category: 'Credentials' },
  { id: 'private_keys', label: 'Private Keys / Certificates', category: 'Credentials' },
  { id: 'conn_strings', label: 'Connection Strings', category: 'Credentials' },
];

const channels: ChannelCol[] = [
  // Data in Motion
  { id: 'http', label: 'HTTP POST', shortLabel: 'HTTP', category: 'motion' },
  { id: 'https', label: 'HTTPS POST', shortLabel: 'HTTPS', category: 'motion' },
  { id: 'email', label: 'Email / SMTP', shortLabel: 'Email', category: 'motion' },
  { id: 'ftp', label: 'FTP Upload', shortLabel: 'FTP', category: 'motion' },
  // Data in Use
  { id: 'clipboard', label: 'Clipboard', shortLabel: 'Clip', category: 'use' },
  { id: 'print', label: 'Print / Screenshot', shortLabel: 'Print', category: 'use' },
  { id: 'usb', label: 'USB / Removable', shortLabel: 'USB', category: 'use' },
  { id: 'cloud', label: 'Cloud Upload', shortLabel: 'Cloud', category: 'use' },
  // Data at Rest
  { id: 'endpoint', label: 'Endpoint Discovery', shortLabel: 'Endpt', category: 'rest' },
  { id: 'server', label: 'File Server Scan', shortLabel: 'Server', category: 'rest' },
  { id: 'cloud_store', label: 'Cloud Storage', shortLabel: 'Cloud St.', category: 'rest' },
];

const CHANNEL_CATEGORY_LABELS: Record<string, string> = {
  motion: 'Data in Motion',
  use: 'Data in Use',
  rest: 'Data at Rest',
};

const STORAGE_KEY = 'fortrafied_coverage_map';

type CoverageGrid = Record<string, CoverageStatus>;

function cellKey(dataTypeId: string, channelId: string) {
  return `${dataTypeId}:${channelId}`;
}

function getInitialGrid(): CoverageGrid {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {};
}

export default function CoverageMapClient() {
  const [grid, setGrid] = useState<CoverageGrid>(getInitialGrid);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(grid));
    }
  }, [grid]);

  function cycleCell(dtId: string, chId: string) {
    const key = cellKey(dtId, chId);
    const current = grid[key] ?? null;
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setGrid(prev => {
      const updated = { ...prev };
      if (next === null) {
        delete updated[key];
      } else {
        updated[key] = next;
      }
      return updated;
    });
  }

  function fillColumn(chId: string, status: CoverageStatus) {
    setGrid(prev => {
      const updated = { ...prev };
      for (const dt of dataTypes) {
        const key = cellKey(dt.id, chId);
        if (status === null) {
          delete updated[key];
        } else {
          updated[key] = status;
        }
      }
      return updated;
    });
  }

  function fillRow(dtId: string, status: CoverageStatus) {
    setGrid(prev => {
      const updated = { ...prev };
      for (const ch of channels) {
        const key = cellKey(dtId, ch.id);
        if (status === null) {
          delete updated[key];
        } else {
          updated[key] = status;
        }
      }
      return updated;
    });
  }

  function resetGrid() {
    setGrid({});
  }

  // Stats
  const stats = useMemo(() => {
    const totalCells = dataTypes.length * channels.length;
    let covered = 0, partial = 0, gap = 0, na = 0, empty = 0;
    for (const dt of dataTypes) {
      for (const ch of channels) {
        const v = grid[cellKey(dt.id, ch.id)] ?? null;
        if (v === 'covered') covered++;
        else if (v === 'partial') partial++;
        else if (v === 'gap') gap++;
        else if (v === 'na') na++;
        else empty++;
      }
    }
    return { totalCells, covered, partial, gap, na, empty };
  }, [grid]);

  const assessed = stats.totalCells - stats.empty;
  const assessedPct = assessed > 0 ? Math.round((assessed / stats.totalCells) * 100) : 0;
  const coveragePct = assessed - stats.na > 0 ? Math.round((stats.covered / (assessed - stats.na)) * 100) : 0;

  // Category stats
  const categoryStats = useMemo(() => {
    const cats: Record<string, { covered: number; partial: number; gap: number; total: number }> = {};
    for (const ch of channels) {
      const cat = CHANNEL_CATEGORY_LABELS[ch.category];
      if (!cats[cat]) cats[cat] = { covered: 0, partial: 0, gap: 0, total: 0 };
      for (const dt of dataTypes) {
        const v = grid[cellKey(dt.id, ch.id)] ?? null;
        if (v !== 'na' && v !== null) {
          cats[cat].total++;
          if (v === 'covered') cats[cat].covered++;
          else if (v === 'partial') cats[cat].partial++;
          else if (v === 'gap') cats[cat].gap++;
        }
      }
    }
    return cats;
  }, [grid]);

  function exportMap() {
    const exportData = {
      title: 'DLP Coverage Map',
      exportedAt: new Date().toISOString(),
      summary: {
        totalCells: stats.totalCells,
        assessed,
        assessedPercent: assessedPct,
        covered: stats.covered,
        partial: stats.partial,
        gaps: stats.gap,
        notApplicable: stats.na,
        unassessed: stats.empty,
        coveragePercent: coveragePct,
      },
      categoryBreakdown: categoryStats,
      gaps: dataTypes.flatMap(dt =>
        channels
          .filter(ch => grid[cellKey(dt.id, ch.id)] === 'gap')
          .map(ch => ({ dataType: dt.label, dataCategory: dt.category, channel: ch.label, channelCategory: CHANNEL_CATEGORY_LABELS[ch.category] }))
      ),
      partialCoverage: dataTypes.flatMap(dt =>
        channels
          .filter(ch => grid[cellKey(dt.id, ch.id)] === 'partial')
          .map(ch => ({ dataType: dt.label, dataCategory: dt.category, channel: ch.label, channelCategory: CHANNEL_CATEGORY_LABELS[ch.category] }))
      ),
      fullGrid: dataTypes.map(dt => ({
        dataType: dt.label,
        category: dt.category,
        channels: Object.fromEntries(channels.map(ch => [ch.label, grid[cellKey(dt.id, ch.id)] ?? 'unassessed'])),
      })),
    };
    downloadJSON(exportData, `dlp-coverage-map-${Date.now()}.json`);
  }

  // Group data types by category for row headers
  const dtCategories = [...new Set(dataTypes.map(d => d.category))];

  // Group channels by category for column headers
  const chCategoryCounts: { label: string; count: number }[] = [];
  let lastCat = '';
  for (const ch of channels) {
    const cat = CHANNEL_CATEGORY_LABELS[ch.category];
    if (cat !== lastCat) {
      chCategoryCounts.push({ label: cat, count: 1 });
      lastCat = cat;
    } else {
      chCategoryCounts[chCategoryCounts.length - 1].count++;
    }
  }

  return (
    <>
      <div className="info-box">
        <strong>How to use:</strong> Click any cell to cycle through coverage statuses:
        <span style={{ marginLeft: 8 }}>
          <span className="cov-legend-dot" style={{ background: '#66bb6a' }} /> Covered
        </span>
        <span style={{ marginLeft: 8 }}>
          <span className="cov-legend-dot" style={{ background: '#ffa726' }} /> Partial
        </span>
        <span style={{ marginLeft: 8 }}>
          <span className="cov-legend-dot" style={{ background: '#ef5350' }} /> Gap
        </span>
        <span style={{ marginLeft: 8 }}>
          <span className="cov-legend-dot" style={{ background: '#616161' }} /> N/A
        </span>
        &nbsp;&mdash; Progress saves automatically in your browser.
      </div>

      {/* Summary Stats */}
      <div className="test-panel">
        <h2>Coverage Summary</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
          <div className="assess-stat-card">
            <div className="assess-stat-value">{assessedPct}%</div>
            <div className="assess-stat-label">Assessed</div>
          </div>
          <div className="assess-stat-card">
            <div className="assess-stat-value" style={{ color: '#66bb6a' }}>{stats.covered}</div>
            <div className="assess-stat-label">Covered</div>
          </div>
          <div className="assess-stat-card">
            <div className="assess-stat-value" style={{ color: '#ffa726' }}>{stats.partial}</div>
            <div className="assess-stat-label">Partial</div>
          </div>
          <div className="assess-stat-card">
            <div className="assess-stat-value" style={{ color: '#ef5350' }}>{stats.gap}</div>
            <div className="assess-stat-label">Gaps</div>
          </div>
          <div className="assess-stat-card">
            <div className="assess-stat-value" style={{ color: coveragePct >= 80 ? '#66bb6a' : coveragePct >= 50 ? '#ffa726' : '#ef5350' }}>{coveragePct}%</div>
            <div className="assess-stat-label">Coverage Rate</div>
          </div>
        </div>

        {/* Category breakdown */}
        {Object.keys(categoryStats).length > 0 && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            {Object.entries(categoryStats).map(([cat, s]) => {
              const catPct = s.total > 0 ? Math.round((s.covered / s.total) * 100) : 0;
              return (
                <div key={cat} style={{ background: '#0d1117', border: '1px solid #1e2a45', borderRadius: 8, padding: '12px 18px', flex: 1, minWidth: 180 }}>
                  <div style={{ color: '#b0bec5', fontSize: '0.8rem', marginBottom: 4 }}>{cat}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                    <span style={{ color: catPct >= 80 ? '#66bb6a' : catPct >= 50 ? '#ffa726' : '#ef5350', fontWeight: 700, fontSize: '1.2rem' }}>{catPct}%</span>
                    <span style={{ color: '#757575', fontSize: '0.75rem' }}>
                      {s.covered} covered &middot; {s.partial} partial &middot; {s.gap} gaps
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={exportMap}>Export Map (JSON)</button>
          <button className="btn btn-outline btn-sm" onClick={resetGrid}>Reset Map</button>
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="test-panel" style={{ overflow: 'visible', padding: '24px 0' }}>
        <div style={{ padding: '0 24px', marginBottom: 16 }}>
          <h2>Coverage Heat Map</h2>
          <p style={{ color: '#9e9e9e', fontSize: '0.85rem' }}>
            Click cells to set status. Right-click a column header to fill the entire column, or a row label to fill the row.
          </p>
        </div>

        <div className="cov-grid-scroll">
          <table className="cov-grid">
            <thead>
              {/* Channel category row */}
              <tr>
                <th className="cov-corner" />
                {chCategoryCounts.map(c => (
                  <th key={c.label} colSpan={c.count} className="cov-cat-header">
                    {c.label}
                  </th>
                ))}
              </tr>
              {/* Channel names */}
              <tr>
                <th className="cov-corner cov-corner-bottom">Data Type</th>
                {channels.map(ch => (
                  <th
                    key={ch.id}
                    className={`cov-col-header${hoveredCol === ch.id ? ' cov-highlight' : ''}`}
                    onMouseEnter={() => setHoveredCol(ch.id)}
                    onMouseLeave={() => setHoveredCol(null)}
                    onContextMenu={e => {
                      e.preventDefault();
                      fillColumn(ch.id, 'covered');
                    }}
                    title={`${ch.label} — right-click to fill column`}
                  >
                    {ch.shortLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dtCategories.map(cat => {
                const catItems = dataTypes.filter(d => d.category === cat);
                return catItems.map((dt, idx) => (
                  <tr key={dt.id}>
                    {idx === 0 && (
                      <td className="cov-row-cat" rowSpan={catItems.length}>
                        {cat}
                      </td>
                    )}
                    <td
                      className={`cov-row-label${hoveredRow === dt.id ? ' cov-highlight' : ''}`}
                      onMouseEnter={() => setHoveredRow(dt.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onContextMenu={e => {
                        e.preventDefault();
                        fillRow(dt.id, 'covered');
                      }}
                      title={`${dt.label} — right-click to fill row`}
                    >
                      {dt.label}
                    </td>
                    {channels.map(ch => {
                      const val = grid[cellKey(dt.id, ch.id)] ?? null;
                      const isHighlighted = hoveredCol === ch.id || hoveredRow === dt.id;
                      return (
                        <td
                          key={ch.id}
                          className={`cov-cell${isHighlighted ? ' cov-cell-highlight' : ''}`}
                          onClick={() => cycleCell(dt.id, ch.id)}
                          title={`${dt.label} × ${ch.label}: ${val ? STATUS_LABELS[val] : 'Click to set'}`}
                        >
                          {val && (
                            <span
                              className="cov-dot"
                              style={{ background: STATUS_COLORS[val] }}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend & Tips */}
      <div className="test-panel">
        <h2>Quick Actions & Legend</h2>
        <div className="two-col mt-3">
          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 12 }}>Status Legend</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="cov-legend-row">
                <span className="cov-legend-dot" style={{ background: '#66bb6a' }} />
                <div>
                  <strong style={{ color: '#66bb6a' }}>Covered</strong>
                  <span style={{ color: '#9e9e9e' }}> &mdash; DLP actively monitors and/or blocks this data type on this channel</span>
                </div>
              </div>
              <div className="cov-legend-row">
                <span className="cov-legend-dot" style={{ background: '#ffa726' }} />
                <div>
                  <strong style={{ color: '#ffa726' }}>Partial</strong>
                  <span style={{ color: '#9e9e9e' }}> &mdash; Some coverage exists but may have gaps (e.g., monitor-only, limited patterns)</span>
                </div>
              </div>
              <div className="cov-legend-row">
                <span className="cov-legend-dot" style={{ background: '#ef5350' }} />
                <div>
                  <strong style={{ color: '#ef5350' }}>Gap</strong>
                  <span style={{ color: '#9e9e9e' }}> &mdash; No DLP coverage for this data type on this channel — a risk that should be addressed</span>
                </div>
              </div>
              <div className="cov-legend-row">
                <span className="cov-legend-dot" style={{ background: '#616161' }} />
                <div>
                  <strong style={{ color: '#9e9e9e' }}>N/A</strong>
                  <span style={{ color: '#9e9e9e' }}> &mdash; Not applicable to your environment (e.g., no FTP in use)</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 12 }}>Keyboard & Mouse</h3>
            <ul style={{ listStyle: 'disc', paddingLeft: 20, color: '#9e9e9e', fontSize: '0.875rem' }}>
              <li style={{ marginBottom: 6 }}><strong style={{ color: '#b0bec5' }}>Click cell</strong> &mdash; cycle through statuses</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: '#b0bec5' }}>Right-click column header</strong> &mdash; fill entire column as Covered</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: '#b0bec5' }}>Right-click row label</strong> &mdash; fill entire row as Covered</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: '#b0bec5' }}>Export Map</strong> &mdash; download full coverage data as JSON, including a summary of all gaps</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
