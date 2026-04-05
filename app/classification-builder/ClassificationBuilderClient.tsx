'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  type ClassifierDef,
  type Severity,
  type DetectionType,
  SEVERITY_OPTIONS,
  CATEGORY_PRESETS,
  TAG_OPTIONS,
  sevColor,
  loadCustomClassifiers,
  saveCustomClassifiers,
  buildRegex,
} from '../lib/classifiers';

function newId() {
  return 'custom_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const emptyDef: Omit<ClassifierDef, 'id'> = {
  name: '',
  category: 'Custom',
  severity: 'Medium',
  type: 'regex',
  pattern: '',
  flags: 'gi',
  dictionary: [],
  tag: 'tag-blue',
  builtin: false,
};

export default function ClassificationBuilderClient() {
  const [customs, setCustoms] = useState<ClassifierDef[]>([]);
  const [editing, setEditing] = useState<ClassifierDef | null>(null);
  const [testText, setTestText] = useState('');
  const [testResults, setTestResults] = useState<{ count: number; matches: string[] } | null>(null);
  const [dictInput, setDictInput] = useState('');
  const [regexError, setRegexError] = useState('');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  useEffect(() => {
    setCustoms(loadCustomClassifiers());
  }, []);

  const persist = useCallback((updated: ClassifierDef[]) => {
    setCustoms(updated);
    saveCustomClassifiers(updated);
  }, []);

  function startNew() {
    setEditing({ id: newId(), ...emptyDef });
    setTestResults(null);
    setRegexError('');
    setDictInput('');
  }

  function startEdit(def: ClassifierDef) {
    setEditing({ ...def });
    setTestResults(null);
    setRegexError('');
    setDictInput(def.dictionary.join('\n'));
  }

  function deleteDef(id: string) {
    persist(customs.filter((c) => c.id !== id));
    if (editing?.id === id) setEditing(null);
  }

  function duplicateDef(def: ClassifierDef) {
    const dup: ClassifierDef = { ...def, id: newId(), name: def.name + ' (copy)', builtin: false };
    persist([...customs, dup]);
  }

  function saveEditing() {
    if (!editing || !editing.name.trim()) return;

    // Validate regex
    if (editing.type === 'regex' && editing.pattern) {
      try {
        new RegExp(editing.pattern, editing.flags);
      } catch (e: unknown) {
        setRegexError((e as Error).message);
        return;
      }
    }

    const exists = customs.findIndex((c) => c.id === editing.id);
    const updated = exists >= 0
      ? customs.map((c) => (c.id === editing.id ? editing : c))
      : [...customs, editing];
    persist(updated);
    setEditing(null);
  }

  function runTest() {
    if (!editing || !testText.trim()) return;
    try {
      const re = buildRegex(editing);
      const matches: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = re.exec(testText)) !== null) {
        matches.push(m[0]);
        if (!re.global) break;
      }
      setTestResults({ count: matches.length, matches });
      setRegexError('');
    } catch (e: unknown) {
      setRegexError((e as Error).message);
      setTestResults(null);
    }
  }

  function exportAll() {
    const json = JSON.stringify(customs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fortrafied-classification-schema.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importSchema() {
    setImportError('');
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) { setImportError('JSON must be an array of classifiers.'); return; }
      const imported: ClassifierDef[] = parsed.map((item: Record<string, unknown>) => ({
        id: newId(),
        name: String(item.name || 'Unnamed'),
        category: String(item.category || 'Custom'),
        severity: (SEVERITY_OPTIONS.includes(item.severity as Severity) ? item.severity : 'Medium') as Severity,
        type: (item.type === 'dictionary' ? 'dictionary' : 'regex') as DetectionType,
        pattern: String(item.pattern || ''),
        flags: String(item.flags || 'gi'),
        dictionary: Array.isArray(item.dictionary) ? item.dictionary.map(String) : [],
        tag: String(item.tag || 'tag-blue'),
        builtin: false,
      }));
      persist([...customs, ...imported]);
      setImportText('');
    } catch {
      setImportError('Invalid JSON. Please check the format.');
    }
  }

  return (
    <>
      <div className="info-box">
        <strong>Custom classifiers are saved in your browser&apos;s localStorage</strong> and automatically loaded by the{' '}
        <Link href="/data-classifier">Data Classifier</Link>. You can also export/import schemas as JSON to share them.
      </div>

      {/* Editor panel */}
      {editing ? (
        <div className="test-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>{customs.find((c) => c.id === editing.id) ? 'Edit' : 'New'} Classifier</h2>
            <button className="btn btn-sm btn-outline" onClick={() => setEditing(null)}>Cancel</button>
          </div>

          <div className="two-col">
            <div className="form-group">
              <label htmlFor="cls-name">Name</label>
              <input
                id="cls-name"
                className="form-control"
                placeholder="e.g. Company Employee ID"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cls-category">Category</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  id="cls-category"
                  className="form-control"
                  value={CATEGORY_PRESETS.includes(editing.category) ? editing.category : '__custom'}
                  onChange={(e) => {
                    if (e.target.value !== '__custom') setEditing({ ...editing, category: e.target.value });
                  }}
                >
                  {CATEGORY_PRESETS.map((c) => <option key={c} value={c}>{c}</option>)}
                  {!CATEGORY_PRESETS.includes(editing.category) && (
                    <option value="__custom">{editing.category}</option>
                  )}
                  <option value="__custom">Custom...</option>
                </select>
                {(!CATEGORY_PRESETS.includes(editing.category) || editing.category === 'Custom') && (
                  <input
                    className="form-control"
                    placeholder="Category name"
                    value={editing.category === 'Custom' ? '' : editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value || 'Custom' })}
                    style={{ maxWidth: 160 }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="three-col">
            <div className="form-group">
              <label htmlFor="cls-severity">Severity</label>
              <select
                id="cls-severity"
                className="form-control"
                value={editing.severity}
                onChange={(e) => setEditing({ ...editing, severity: e.target.value as Severity })}
              >
                {SEVERITY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="cls-tag">Color Tag</label>
              <select
                id="cls-tag"
                className="form-control"
                value={editing.tag}
                onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
              >
                {TAG_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="cls-type">Detection Type</label>
              <select
                id="cls-type"
                className="form-control"
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value as DetectionType })}
              >
                <option value="regex">Regex Pattern</option>
                <option value="dictionary">Keyword Dictionary</option>
              </select>
            </div>
          </div>

          {editing.type === 'regex' ? (
            <div className="two-col">
              <div className="form-group">
                <label htmlFor="cls-pattern">Regex Pattern</label>
                <input
                  id="cls-pattern"
                  className="form-control"
                  style={{ fontFamily: "'Consolas','Monaco',monospace" }}
                  placeholder="e.g. \bEMP-\d{6}\b"
                  value={editing.pattern}
                  onChange={(e) => { setEditing({ ...editing, pattern: e.target.value }); setRegexError(''); }}
                />
                {regexError && <div style={{ color: '#ef5350', fontSize: '0.8rem', marginTop: 4 }}>{regexError}</div>}
              </div>
              <div className="form-group">
                <label>Flags</label>
                <div className="toggle-group" style={{ marginTop: 4 }}>
                  {[
                    { flag: 'g', label: 'Global' },
                    { flag: 'i', label: 'Case-insensitive' },
                    { flag: 'm', label: 'Multiline' },
                  ].map(({ flag, label }) => (
                    <label key={flag} className="toggle-label">
                      <input
                        type="checkbox"
                        checked={editing.flags.includes(flag)}
                        onChange={() => {
                          const flags = editing.flags.includes(flag)
                            ? editing.flags.replace(flag, '')
                            : editing.flags + flag;
                          setEditing({ ...editing, flags });
                        }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="cls-dict">Keywords (one per line)</label>
              <textarea
                id="cls-dict"
                className="form-control"
                rows={6}
                placeholder={'CONFIDENTIAL\nRESTRICTED\nINTERNAL ONLY\nTOP SECRET'}
                value={dictInput}
                onChange={(e) => {
                  setDictInput(e.target.value);
                  const words = e.target.value.split('\n').map((w) => w.trim()).filter(Boolean);
                  setEditing({ ...editing, dictionary: words });
                }}
              />
              <div style={{ color: '#757575', fontSize: '0.8rem', marginTop: 4 }}>
                {editing.dictionary.length} keyword{editing.dictionary.length !== 1 ? 's' : ''} &mdash; matched with word boundaries, case-{editing.flags.includes('i') ? 'insensitive' : 'sensitive'}
              </div>
            </div>
          )}

          {/* Inline test */}
          <div style={{ background: '#0d1117', border: '1px solid #1e2a45', borderRadius: 8, padding: 16, marginTop: 16 }}>
            <h4 style={{ color: '#fff', marginBottom: 8 }}>Test Pattern</h4>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Paste sample text to test your pattern..."
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
              />
            </div>
            <button className="btn btn-sm btn-outline" onClick={runTest}>Run Test</button>
            {testResults && (
              <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                <span style={{ color: testResults.count > 0 ? '#66bb6a' : '#ef5350', fontWeight: 700 }}>
                  {testResults.count} match{testResults.count !== 1 ? 'es' : ''}
                </span>
                {testResults.matches.length > 0 && (
                  <span style={{ color: '#9e9e9e', marginLeft: 12 }}>
                    {testResults.matches.slice(0, 5).join(', ')}
                    {testResults.matches.length > 5 ? `, ... (+${testResults.matches.length - 5} more)` : ''}
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={saveEditing} disabled={!editing.name.trim()}>
              Save Classifier
            </button>
            <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="test-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>Custom Classifiers</h2>
            <button className="btn btn-primary" onClick={startNew}>+ New Classifier</button>
          </div>

          {customs.length === 0 ? (
            <div className="info-box mt-3">
              No custom classifiers yet. Click <strong>+ New Classifier</strong> to create one, or import a schema below.
            </div>
          ) : (
            <table className="data-table mt-3">
              <thead>
                <tr><th>Name</th><th>Category</th><th>Severity</th><th>Type</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customs.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className={`tag ${c.tag}`}>{c.category}</span></td>
                    <td style={{ color: sevColor[c.severity], fontWeight: 600 }}>{c.severity}</td>
                    <td>
                      <span className="tag tag-blue">
                        {c.type === 'regex' ? 'Regex' : `Dict (${c.dictionary.length})`}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-outline" onClick={() => startEdit(c)}>Edit</button>
                        <button className="btn btn-sm btn-outline" onClick={() => duplicateDef(c)}>Duplicate</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteDef(c.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Import / Export */}
      <div className="test-panel">
        <h2>Import / Export</h2>
        <p>Share classification schemas as JSON. Exported schemas include all custom classifiers.</p>

        <div className="two-col mt-3">
          <div>
            <h4 style={{ color: '#fff', marginBottom: 8 }}>Export</h4>
            <button className="btn btn-outline" onClick={exportAll} disabled={customs.length === 0}>
              Download Schema JSON ({customs.length} classifier{customs.length !== 1 ? 's' : ''})
            </button>
            <button
              className="btn btn-outline"
              style={{ marginLeft: 8 }}
              onClick={() => { navigator.clipboard.writeText(JSON.stringify(customs, null, 2)); }}
              disabled={customs.length === 0}
            >
              Copy JSON
            </button>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: 8 }}>Import</h4>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Paste schema JSON here..."
              value={importText}
              onChange={(e) => { setImportText(e.target.value); setImportError(''); }}
            />
            {importError && <div style={{ color: '#ef5350', fontSize: '0.8rem', marginTop: 4 }}>{importError}</div>}
            <button className="btn btn-sm btn-primary mt-2" onClick={importSchema} disabled={!importText.trim()}>
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Quick reference */}
      <div className="test-panel">
        <h2>How It Works</h2>
        <div className="steps-grid mt-3">
          <div className="step">
            <div className="step-num">1</div>
            <h4>Create Classifiers</h4>
            <p>Define detection criteria using regex patterns for structured data or keyword dictionaries for content labels and terms.</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h4>Test Inline</h4>
            <p>Paste sample text directly in the builder to verify your patterns match correctly before saving.</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h4>Classify Data</h4>
            <p>
              Your custom classifiers are automatically available in the{' '}
              <Link href="/data-classifier">Data Classifier</Link>
              , running alongside the built-in detection rules.
            </p>
          </div>
          <div className="step">
            <div className="step-num">4</div>
            <h4>Share Schemas</h4>
            <p>Export your classification schema as JSON and share it with your team, or import schemas from others.</p>
          </div>
        </div>
      </div>
    </>
  );
}
