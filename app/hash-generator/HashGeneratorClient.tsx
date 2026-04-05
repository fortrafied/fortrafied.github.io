'use client';

import { useState, useCallback } from 'react';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function md5(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  function add32(a: number, b: number) { return (a + b) & 0xffffffff; }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | ~d), a, b, x, s, t); }

  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a=ff(a,b,c,d,k[0],7,-680876936);d=ff(d,a,b,c,k[1],12,-389564586);c=ff(c,d,a,b,k[2],17,606105819);b=ff(b,c,d,a,k[3],22,-1044525330);
    a=ff(a,b,c,d,k[4],7,-176418897);d=ff(d,a,b,c,k[5],12,1200080426);c=ff(c,d,a,b,k[6],17,-1473231341);b=ff(b,c,d,a,k[7],22,-45705983);
    a=ff(a,b,c,d,k[8],7,1770035416);d=ff(d,a,b,c,k[9],12,-1958414417);c=ff(c,d,a,b,k[10],17,-42063);b=ff(b,c,d,a,k[11],22,-1990404162);
    a=ff(a,b,c,d,k[12],7,1804603682);d=ff(d,a,b,c,k[13],12,-40341101);c=ff(c,d,a,b,k[14],17,-1502002290);b=ff(b,c,d,a,k[15],22,1236535329);
    a=gg(a,b,c,d,k[1],5,-165796510);d=gg(d,a,b,c,k[6],9,-1069501632);c=gg(c,d,a,b,k[11],14,643717713);b=gg(b,c,d,a,k[0],20,-373897302);
    a=gg(a,b,c,d,k[5],5,-701558691);d=gg(d,a,b,c,k[10],9,38016083);c=gg(c,d,a,b,k[15],14,-660478335);b=gg(b,c,d,a,k[4],20,-405537848);
    a=gg(a,b,c,d,k[9],5,568446438);d=gg(d,a,b,c,k[14],9,-1019803690);c=gg(c,d,a,b,k[3],14,-187363961);b=gg(b,c,d,a,k[8],20,1163531501);
    a=gg(a,b,c,d,k[13],5,-1444681467);d=gg(d,a,b,c,k[2],9,-51403784);c=gg(c,d,a,b,k[7],14,1735328473);b=gg(b,c,d,a,k[12],20,-1926607734);
    a=hh(a,b,c,d,k[5],4,-378558);d=hh(d,a,b,c,k[8],11,-2022574463);c=hh(c,d,a,b,k[11],16,1839030562);b=hh(b,c,d,a,k[14],23,-35309556);
    a=hh(a,b,c,d,k[1],4,-1530992060);d=hh(d,a,b,c,k[4],11,1272893353);c=hh(c,d,a,b,k[7],16,-155497632);b=hh(b,c,d,a,k[10],23,-1094730640);
    a=hh(a,b,c,d,k[13],4,681279174);d=hh(d,a,b,c,k[0],11,-358537222);c=hh(c,d,a,b,k[3],16,-722521979);b=hh(b,c,d,a,k[6],23,76029189);
    a=hh(a,b,c,d,k[9],4,-640364487);d=hh(d,a,b,c,k[12],11,-421815835);c=hh(c,d,a,b,k[15],16,530742520);b=hh(b,c,d,a,k[2],23,-995338651);
    a=ii(a,b,c,d,k[0],6,-198630844);d=ii(d,a,b,c,k[7],10,1126891415);c=ii(c,d,a,b,k[14],15,-1416354905);b=ii(b,c,d,a,k[5],21,-57434055);
    a=ii(a,b,c,d,k[12],6,1700485571);d=ii(d,a,b,c,k[3],10,-1894986606);c=ii(c,d,a,b,k[10],15,-1051523);b=ii(b,c,d,a,k[1],21,-2054922799);
    a=ii(a,b,c,d,k[8],6,1873313359);d=ii(d,a,b,c,k[15],10,-30611744);c=ii(c,d,a,b,k[6],15,-1560198380);b=ii(b,c,d,a,k[13],21,1309151649);
    a=ii(a,b,c,d,k[4],6,-145523070);d=ii(d,a,b,c,k[11],10,-1120210379);c=ii(c,d,a,b,k[2],15,718787259);b=ii(b,c,d,a,k[9],21,-343485551);
    x[0]=add32(a,x[0]);x[1]=add32(b,x[1]);x[2]=add32(c,x[2]);x[3]=add32(d,x[3]);
  }

  const n = bytes.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (let i = 64; i <= n; i += 64) {
    const block: number[] = [];
    for (let j = 0; j < 16; j++)
      block[j] = bytes[i - 64 + j * 4] | (bytes[i - 64 + j * 4 + 1] << 8) | (bytes[i - 64 + j * 4 + 2] << 16) | (bytes[i - 64 + j * 4 + 3] << 24);
    md5cycle(state, block);
  }

  const rem = n % 64;
  const offset = n - rem;
  for (let i = 0; i < 16; i++) tail[i] = 0;
  let i: number;
  for (i = 0; i < rem; i++) tail[i >> 2] |= bytes[offset + i] << ((i % 4) * 8);
  tail[i >> 2] |= 0x80 << ((i % 4) * 8);
  if (i > 55) { md5cycle(state, tail); for (let j = 0; j < 16; j++) tail[j] = 0; }
  tail[14] = n * 8;
  tail[15] = (n * 8) / 4294967296;
  md5cycle(state, tail);

  let hex = '';
  for (let si = 0; si < 4; si++) {
    for (let j = 0; j < 4; j++) hex += ('0' + ((state[si] >> (j * 8)) & 255).toString(16)).slice(-2);
  }
  return hex;
}

interface FileHashes {
  sha256: string;
  sha1: string;
  md5: string;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export default function HashGeneratorClient() {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [fileHashes, setFileHashes] = useState<FileHashes | null>(null);
  const [hashing, setHashing] = useState(false);
  const [compareInput, setCompareInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [textHashes, setTextHashes] = useState<FileHashes | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const hashFile = useCallback(async (file: File) => {
    setFileInfo({ name: file.name, size: file.size, type: file.type || 'unknown', lastModified: file.lastModified });
    setFileHashes(null);
    setHashing(true);
    setCompareInput('');

    const buffer = await file.arrayBuffer();
    const sha256 = bufToHex(await crypto.subtle.digest('SHA-256', buffer));
    const sha1 = bufToHex(await crypto.subtle.digest('SHA-1', buffer));
    const md5hash = md5(buffer);

    setFileHashes({ sha256, sha1, md5: md5hash });
    setHashing(false);
  }, []);

  async function hashText() {
    if (!textInput.trim()) return;
    const buffer = new TextEncoder().encode(textInput).buffer;
    const sha256 = bufToHex(await crypto.subtle.digest('SHA-256', buffer));
    const sha1 = bufToHex(await crypto.subtle.digest('SHA-1', buffer));
    const md5hash = md5(buffer);
    setTextHashes({ sha256, sha1, md5: md5hash });
  }

  function copyHash(value: string) {
    navigator.clipboard.writeText(value);
  }

  function getCompareResult(): string | null {
    if (!compareInput.trim() || !fileHashes) return null;
    const input = compareInput.trim().toLowerCase();
    if (input === fileHashes.sha256) return 'Match! (SHA-256)';
    if (input === fileHashes.sha1) return 'Match! (SHA-1)';
    if (input === fileHashes.md5) return 'Match! (MD5)';
    return 'No match found.';
  }

  const compareResult = getCompareResult();

  return (
    <>
      <div className="info-box">
        <strong>Client-Side Processing:</strong> Files are hashed entirely in your browser using the Web Crypto API. No file data is uploaded to any server.
      </div>

      <div className="test-panel">
        <h2>Hash a File</h2>
        <p>Select a file to compute its cryptographic hashes. Drag and drop is also supported.</p>

        <div
          style={{
            border: `2px dashed ${dragOver ? '#4fc3f7' : '#1e2a45'}`,
            borderRadius: 12, padding: 48, textAlign: 'center', margin: '24px 0', cursor: 'pointer',
            transition: 'all 0.2s',
            background: dragOver ? 'rgba(79,195,247,0.05)' : 'transparent',
          }}
          onClick={() => document.getElementById('fileInput')?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) hashFile(e.dataTransfer.files[0]);
          }}
        >
          <div style={{ fontSize: '2rem', color: '#4fc3f7', marginBottom: 12 }}>&#128196;</div>
          <p style={{ color: '#9e9e9e', marginBottom: 8 }}>Drag &amp; drop a file here, or click to browse</p>
          <p style={{ color: '#616161', fontSize: '0.8rem' }}>All processing happens locally in your browser</p>
          <input type="file" id="fileInput" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) hashFile(e.target.files[0]); }} />
        </div>

        {fileInfo && (
          <div className="mb-3">
            <table className="data-table">
              <tbody>
                <tr><td style={{ width: 120, fontWeight: 600 }}>File Name</td><td>{fileInfo.name}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>File Size</td><td>{formatSize(fileInfo.size)}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>File Type</td><td>{fileInfo.type}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Last Modified</td><td>{new Date(fileInfo.lastModified).toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {hashing && (
          <div className="text-center mt-3">
            <span className="spinner" /> <span style={{ color: '#9e9e9e', marginLeft: 8 }}>Computing hashes...</span>
          </div>
        )}

        {fileHashes && (
          <div>
            <h3 style={{ color: '#fff', marginBottom: 16 }}>Hash Results</h3>
            <table className="data-table">
              <thead><tr><th>Algorithm</th><th>Hash Value</th><th>Action</th></tr></thead>
              <tbody>
                <tr>
                  <td><span className="tag tag-blue">SHA-256</span></td>
                  <td><code style={{ fontSize: '0.8rem', color: '#4fc3f7', wordBreak: 'break-all' }}>{fileHashes.sha256}</code></td>
                  <td><button className="btn btn-sm btn-outline" onClick={() => copyHash(fileHashes.sha256)}>Copy</button></td>
                </tr>
                <tr>
                  <td><span className="tag tag-green">SHA-1</span></td>
                  <td><code style={{ fontSize: '0.8rem', color: '#66bb6a', wordBreak: 'break-all' }}>{fileHashes.sha1}</code></td>
                  <td><button className="btn btn-sm btn-outline" onClick={() => copyHash(fileHashes.sha1)}>Copy</button></td>
                </tr>
                <tr>
                  <td><span className="tag tag-orange">MD5</span></td>
                  <td><code style={{ fontSize: '0.8rem', color: '#ffa726', wordBreak: 'break-all' }}>{fileHashes.md5}</code></td>
                  <td><button className="btn btn-sm btn-outline" onClick={() => copyHash(fileHashes.md5)}>Copy</button></td>
                </tr>
              </tbody>
            </table>

            <div className="form-group mt-3">
              <label htmlFor="compareHash">Compare Hash (paste expected hash to verify)</label>
              <input
                type="text"
                id="compareHash"
                className="form-control"
                placeholder="Paste a hash to compare..."
                value={compareInput}
                onChange={(e) => setCompareInput(e.target.value)}
              />
              {compareResult && (
                <div className="mt-2" style={{ fontSize: '0.9rem' }}>
                  <span style={{ color: compareResult.startsWith('Match') ? '#66bb6a' : '#ef5350', fontWeight: 600 }}>
                    {compareResult}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="test-panel">
        <h2>Hash Text Content</h2>
        <p>Enter text to generate hashes directly (useful for hashing data strings or content).</p>
        <div className="form-group mt-3">
          <label htmlFor="textInput">Text to Hash</label>
          <textarea
            id="textInput"
            className="form-control"
            rows={4}
            placeholder="Enter text to hash..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={hashText}>Generate Hashes</button>

        {textHashes && (
          <div className="mt-3">
            <table className="data-table">
              <thead><tr><th>Algorithm</th><th>Hash Value</th><th>Action</th></tr></thead>
              <tbody>
                <tr>
                  <td><span className="tag tag-blue">SHA-256</span></td>
                  <td><code style={{ fontSize: '0.8rem', color: '#4fc3f7', wordBreak: 'break-all' }}>{textHashes.sha256}</code></td>
                  <td><button className="btn btn-sm btn-outline" onClick={() => copyHash(textHashes.sha256)}>Copy</button></td>
                </tr>
                <tr>
                  <td><span className="tag tag-green">SHA-1</span></td>
                  <td><code style={{ fontSize: '0.8rem', color: '#66bb6a', wordBreak: 'break-all' }}>{textHashes.sha1}</code></td>
                  <td><button className="btn btn-sm btn-outline" onClick={() => copyHash(textHashes.sha1)}>Copy</button></td>
                </tr>
                <tr>
                  <td><span className="tag tag-orange">MD5</span></td>
                  <td><code style={{ fontSize: '0.8rem', color: '#ffa726', wordBreak: 'break-all' }}>{textHashes.md5}</code></td>
                  <td><button className="btn btn-sm btn-outline" onClick={() => copyHash(textHashes.md5)}>Copy</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="test-panel">
        <h2>DLP Use Cases for File Hashing</h2>
        <div className="data-types-grid mt-3">
          <div className="data-type">
            <h4>Exact Data Matching (EDM)</h4>
            <p>DLP solutions use file hashes to detect exact copies of sensitive documents. If a file&apos;s hash matches a known sensitive document, the policy triggers.</p>
          </div>
          <div className="data-type">
            <h4>Document Fingerprinting</h4>
            <p>Beyond exact matching, DLP can fingerprint document structures. Hashing helps identify templates, forms, and structured documents containing sensitive data.</p>
          </div>
          <div className="data-type">
            <h4>File Integrity Monitoring</h4>
            <p>Hash values can track whether sensitive files have been modified. Changes to hash values indicate the file content has been altered.</p>
          </div>
          <div className="data-type">
            <h4>Allow/Block Lists</h4>
            <p>Create allowlists or blocklists of file hashes for DLP policies. Known-good or known-bad files can be identified by their hash values.</p>
          </div>
        </div>
      </div>
    </>
  );
}
